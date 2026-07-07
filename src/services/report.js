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
import {
  OPEN_REPORT_STATUSES,
  ASSET_CLEARING_STATUSES,
  DAMAGE_STATUSES,
  MISSING_STATUSES,
} from "../data/reports";

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
    latest_note: latestLog?.note ?? null,
    latest_date: latestLog?.date ?? null,
  };
  console.log("filteredReport:", filteredReport);

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

async function assertNoDuplicateOpenReport(assetId, type) {
  const relevantStatuses =
    type === "damaged" ? DAMAGE_STATUSES : MISSING_STATUSES;

  const col = collection(db, "report");
  const snap = await getDocs(
    query(
      col,
      where("asset_id", "==", assetId),
      where("date_resolved", "==", null),
    ),
  );

  const hasOpenSameCategory = snap.docs.some((d) =>
    relevantStatuses.includes(d.data().status),
  );

  if (hasOpenSameCategory) {
    throw new Error(
      `This asset already has an open ${type} report. Please resolve it before filing a new one.`,
    );
  }
}

export async function addReport(
  { type, asset_id, asset, description, narrative, photo },
  reportedBy,
  reportedByName,
) {
  // == Step 0: block duplicate open report of the same type ===============
  await assertNoDuplicateOpenReport(asset_id, type);

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
  if (newStatus === "condemned") return "condemned";

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
    return newStatus === "found" ? "working" : newStatus;
  }

  const statuses = otherOpenReports.map((d) => d.data().status);
  if (statuses.includes("for_repair")) return "for_repair";
  if (statuses.includes("damaged")) return "damaged";
  return "missing";
}

export async function updateReportStatus({
  reportId,
  reportNo,
  newStatus,
  note,
  photo,
  assetId,
}) {
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
