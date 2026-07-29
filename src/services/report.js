import { db, storage } from "./firebase-config";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  arrayUnion,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getName } from "./user";
import { updateAssetStatus } from "./asset";
import { ASSET_CLEARING_STATUSES, REPORT_STATUS } from "../data/reports";

export function subscribeToReports(uid, callback, onError) {
  const q = query(collection(db, "report"), orderBy("updated_at", "desc"));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      try {
        const reports = snapshot.docs.map((doc) => {
          const report = { id: doc.id, ...doc.data() };
          const latestLog = report.status_log?.[report.status_log.length - 1];
          return {
            id: report.id,
            asset_id: report.asset_id,
            report_no: report.report_no,
            description: report.asset_description,
            location: report.location,
            custodian: report.current_custodian,
            local_mr: report.current_localmr,
            reported_by: report.reported_by,
            reported_by_name: report.reported_by_name,
            status: report.status,
            date_resolved: report.date_resolved,
            status_log: report.status_log,
            created_at: report.created_at,
            updated_at: report.updated_at,
            date_reported: report.status_log?.[0]?.date ?? null,
            narrative: report.status_log?.[0]?.note ?? null,
            type: report.status_log?.[0]?.status ?? null,
            latest_note: latestLog?.note ?? null,
            latest_date: latestLog?.date ?? null,
          };
        });

        const filtered =
          uid === undefined
            ? reports
            : reports.filter(
                (report) =>
                  report.custodian === uid ||
                  report.local_mr === uid ||
                  report.reported_by === uid,
              );

        callback(filtered);
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => {
      onError?.(err);
    },
  );

  return unsubscribe;
}

export async function fetchReportByID(id) {
  const snap = await getDoc(doc(db, "report", id));
  if (!snap.exists()) throw new Error("Report not found.");

  const report = { id: snap.id, ...snap.data() };
  console.log("report:", report);

  const latestLog = report.status_log?.[report.status_log.length - 1];

  const custodianName = report.current_custodian
    ? await getName(report.current_custodian)
    : null;

  const filteredReport = {
    id: report.id,
    asset_id: report.asset_id,
    report_no: report.report_no,
    description: report.asset_description,
    location: report.location,
    custodian: report.current_custodian,
    custodian_name: custodianName?.fullname ?? "---",
    reported_by: report.reported_by,
    reported_by_name: report.reported_by_name,
    status: report.status,
    date_resolved: report.date_resolved,
    status_log: report.status_log,
    created_at: report.created_at,
    updated_at: report.updated_at,
    // derived from status_log
    date_reported: report.status_log?.[0]?.date ?? null,
    narrative: report.status_log?.[0]?.note ?? null,
    type: report.status_log?.[0]?.status ?? null,
    latest_note: latestLog?.note ?? null,
    latest_date: latestLog?.date ?? null,
  };

  return filteredReport;
}

const generateReportNo = async () => {
  const counterRef = doc(db, "counters", "report");
  return await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const next = (counter.data()?.count ?? 0) + 1;
    transaction.update(counterRef, { count: next });
    return `RPT-${String(next).padStart(4, "0")}`;
  });
};

async function assetNoDuplicateOpenReport(assetId, type) {
  const DAMAGE_STATUSES = [REPORT_STATUS.DAMAGED, REPORT_STATUS.FOR_REPAIR];
  const MISSING_STATUSES = [REPORT_STATUS.MISSING, REPORT_STATUS.FOUND];

  const col = collection(db, "report");
  const snap = await getDocs(
    query(
      col,
      where("asset_id", "==", assetId),
      where("date_resolved", "==", null),
    ),
  );

  const openReport = snap.docs.find((d) =>
    [...DAMAGE_STATUSES, ...MISSING_STATUSES].includes(d.data().status),
  );

  if (!openReport) return;

  const openType = DAMAGE_STATUSES.includes(openReport.data().status)
    ? REPORT_STATUS.DAMAGED
    : REPORT_STATUS.MISSING;

  // Block: same type reported twice while open
  if (openType === type) {
    throw new Error(
      `This asset already has an open ${type} report. Please resolve it before filing a new one.`,
    );
  }

  if (openType === REPORT_STATUS.MISSING && type === REPORT_STATUS.DAMAGED) {
    throw new Error(
      `This asset is currently reported missing. It cannot be reported as damaged until the missing report is resolved.`,
    );
  }
}

export async function addReport(
  { type, asset_id, asset, description, narrative, photo },
  reportedBy,
  reportedByName,
) {
  // == Step 0: block duplicate open report of the same type ===============
  await assetNoDuplicateOpenReport(asset_id, type);

  // == Step 1: generate report_no via counter transaction =================
  const report_no = await generateReportNo();

  // == Step 2: upload photo if damaged ====================================
  let photoURL = null;
  if (type === "damaged" && photo) {
    const storageRef = ref(storage, `reports/${report_no}/${photo.name}`);
    const snapshot = await uploadBytes(storageRef, photo);
    photoURL = await getDownloadURL(snapshot.ref);
  }

  // == Step 3: build the document =========================================
  const now = new Date().toISOString();

  const reportData = {
    asset_description: description,
    asset_id,
    location: asset.room_id ?? null,
    current_custodian: asset.property_custodian ?? null,
    current_localmr: asset.local_mr ?? null,
    report_no,
    date_resolved: null,
    status: type,
    reported_by: reportedBy,
    reported_by_name: reportedByName,
    status_log: [
      {
        status: type,
        date: now,
        img: photoURL,
        note: narrative,
      },
    ],
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  // ── Step 4: write to Firestore ───────────────────────────────────────────
  const docRef = await addDoc(collection(db, "report"), reportData);

  // == Step 5: sync asset condition =======================================
  if (asset_id) await updateAssetStatus(asset_id, type);

  return { id: docRef.id, report_no };
}

async function resolveAssetStatus(assetId, currentReportId, newStatus) {
  if (newStatus === REPORT_STATUS.CONDEMNED) return REPORT_STATUS.CONDEMNED;

  if (!ASSET_CLEARING_STATUSES.includes(newStatus)) {
    return newStatus;
  }

  const col = collection(db, "report");
  const snap = await getDocs(
    query(
      col,
      where("asset_id", "==", assetId),
      where("date_resolved", "==", null),
    ),
  );

  const otherOpenReports = snap.docs.filter((d) => d.id !== currentReportId);

  if (otherOpenReports.length === 0) {
    return newStatus === REPORT_STATUS.FOUND
      ? REPORT_STATUS.WORKING
      : newStatus;
  }

  const statuses = otherOpenReports.map((d) => d.data().status);

  if (statuses.includes(REPORT_STATUS.FOR_REPAIR))
    return REPORT_STATUS.FOR_REPAIR;
  if (statuses.includes(REPORT_STATUS.DAMAGED)) return REPORT_STATUS.DAMAGED;
  return REPORT_STATUS.MISSING;
}

async function closeLinkedOpenReports({ assetId, excludeReportId, note }) {
  const col = collection(db, "report");
  const snap = await getDocs(
    query(
      col,
      where("asset_id", "==", assetId),
      where("date_resolved", "==", null),
    ),
  );

  const linkedLog = {
    status: REPORT_STATUS.CONDEMNED,
    date: new Date().toISOString(),
    note: note
      ? `Auto-closed: asset condemned via a linked report. ${note}`
      : `Auto-closed: asset condemned via a linked report.`,
    img: null,
  };

  const updates = snap.docs
    .filter((d) => d.id !== excludeReportId)
    .map((d) =>
      updateDoc(doc(db, "report", d.id), {
        status: REPORT_STATUS.CONDEMNED,
        status_log: arrayUnion(linkedLog),
        date_resolved: new Date().toISOString(),
        updated_at: serverTimestamp(),
      }),
    );

  await Promise.all(updates);
}

async function assertNoConflictingMissingReport(
  assetId,
  currentReportId,
  newStatus,
) {
  const REPAIR_TRACK_STATUSES = [
    REPORT_STATUS.FOR_REPAIR,
    REPORT_STATUS.WORKING,
  ];
  if (!REPAIR_TRACK_STATUSES.includes(newStatus)) return;

  const col = collection(db, "report");
  const snap = await getDocs(
    query(
      col,
      where("asset_id", "==", assetId),
      where("date_resolved", "==", null),
    ),
  );

  const hasOpenMissing = snap.docs.some(
    (d) =>
      d.id !== currentReportId && d.data().status === REPORT_STATUS.MISSING,
  );

  if (hasOpenMissing) {
    throw new Error(
      `This asset currently has an open missing report. Resolve or find the asset before endorsing repair or marking it working.`,
    );
  }
}

export async function updateReportStatus({
  reportId,
  reportNo,
  newStatus,
  note,
  photo,
  assetId,
}) {
  if (assetId) {
    await assertNoConflictingMissingReport(assetId, reportId, newStatus);
  }

  let photoURL = null;

  if (photo) {
    const storageRef = ref(
      storage,
      `reports/${reportNo}/${Date.now()}_${photo.name}`,
    );
    const snapshot = await uploadBytes(storageRef, photo);
    photoURL = await getDownloadURL(snapshot.ref);
  }

  const newLog = {
    status: newStatus,
    date: new Date().toISOString(),
    note,
    img: photoURL,
  };

  const docRef = doc(db, "report", reportId);
  await updateDoc(docRef, {
    status: newStatus,
    status_log: arrayUnion(newLog),
    date_resolved: ASSET_CLEARING_STATUSES.includes(newStatus)
      ? new Date().toISOString()
      : null,
    updated_at: serverTimestamp(),
  });

  if (assetId) {
    const resolvedAssetStatus = await resolveAssetStatus(
      assetId,
      reportId,
      newStatus,
    );
    await updateAssetStatus(assetId, resolvedAssetStatus);

    if (newStatus === REPORT_STATUS.CONDEMNED) {
      await closeLinkedOpenReports({
        assetId,
        excludeReportId: reportId,
        note,
      });
    }
  }
}

export function subscribeToReportsByAsset(assetId, callback, onError) {
  if (!assetId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "report"),
    where("asset_id", "==", assetId),
    orderBy("created_at", "desc"),
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      try {
        const reports = snapshot.docs.map((doc) => {
          const report = { id: doc.id, ...doc.data() };
          const latestLog = report.status_log?.[report.status_log.length - 1];
          return {
            id: report.id,
            asset_id: report.asset_id,
            report_no: report.report_no,
            description: report.asset_description,
            location: report.location,
            custodian: report.current_custodian,
            local_mr: report.current_localmr,
            reported_by: report.reported_by,
            reported_by_name: report.reported_by_name,
            status: report.status,
            date_resolved: report.date_resolved,
            status_log: report.status_log,
            created_at: report.created_at,
            updated_at: report.updated_at,
            date_reported: report.status_log?.[0]?.date ?? null,
            narrative: report.status_log?.[0]?.note ?? null,
            latest_note: latestLog?.note ?? null,
            latest_date: latestLog?.date ?? null,
          };
        });

        callback(reports);
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => {
      onError?.(err);
    },
  );

  return unsubscribe;
}

export async function getReportType(id) {
  const snap = await getDoc(doc(db, "report", id));
  if (!snap.exists()) throw new Error("Report not found.");

  const report = snap.data();
  const reportType = report.status_log?.[0]?.status ?? null;

  return reportType;
}

export async function fetchReportSummary(id) {
  const snap = await getDoc(doc(db, "report", id));
  if (!snap.exists()) throw new Error("Report not found.");

  const report = snap.data();

  const custodianName = report.current_custodian
    ? await getName(report.current_custodian)
    : null;

  const type = await getReportType(id);

  return {
    id,
    report_no: report.report_no,
    description: report.asset_description,
    created_at: report.created_at,
    type,
    reported_by: report.reported_by,
    location: report.location,
    custodian: report.current_custodian,
    custodian_name: custodianName?.fullname ?? "---",
  };
}
