import { db, storage } from "./firebase-config";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function fetchReports() {
  const q = query(collection(db, "report"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function fetchReportByID(id) {
  const snap = await getDoc(doc(db, "report", id));
  if (!snap.exists()) throw new Error("Report not found.");
  return { id: snap.id, ...snap.data() };
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
    narrative,
    report_no,
    date_reported: now,
    date_resolved: null,
    status: type, // "damaged" | "missing" as initial status
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

  return { id: docRef.id, report_no };
}
