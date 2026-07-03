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
  arrayUnion,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getName } from "./user";
import { updateAssetStatus } from "./asset";

export function subscribeToReports(uid, callback, onError) {
  const q = query(collection(db, "report"), orderBy("created_at", "desc"));

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

export async function addReport(
  { type, asset_id, asset, description, narrative, photo },
  reportedBy,
  reportedByName,
) {
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
    date_resolved: ["working", "condemned"].includes(newStatus)
      ? new Date().toISOString()
      : null,
    updated_at: serverTimestamp(),
  });

  if (assetId) await updateAssetStatus(assetId, newStatus);
}
