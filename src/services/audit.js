import { db } from "./firebase-config";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  orderBy,
  query,
  where,
  runTransaction,
} from "firebase/firestore";

const AUDIT_NO_CONFIG = {
  room: { counterId: "audit_room", prefix: "ARM" },
  report: { counterId: "audit_report", prefix: "ARPT" },
};

export async function generateAuditNo(type) {
  const config = AUDIT_NO_CONFIG[type];
  if (!config) {
    throw new Error(
      `Invalid audit type "${type}". Expected "room" or "report".`,
    );
  }

  const counterRef = doc(db, "counters", config.counterId);

  return await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const next = (counter.data()?.count ?? 0) + 1;
    transaction.set(counterRef, { count: next }, { merge: true });
    return `${config.prefix}-${String(next).padStart(4, "0")}`;
  });
}

export async function addAuditRoom({ roomId, assets, auditedBy, auditedByName }) {
  if (!roomId) throw new Error("roomId is required.");
  if (!assets || assets.length === 0) {
    throw new Error("No assets provided for this audit.");
  }

  const auditNo = await generateAuditNo("room");

  const auditRoomData = {
    audit_no: auditNo,
    room_id: roomId,
    status: "Ongoing",
    audited_by: auditedBy ?? null,
    audited_by_name: auditedByName ?? null,
    total_assets: assets.length,
    audited_count: 0,
    discrepancy_count: 0,
    has_discrepancies: false,
    created_at: serverTimestamp(),
    completed_at: null,
  };

  const auditRoomRef = await addDoc(collection(db, "audit_room"), auditRoomData);

  const batch = writeBatch(db);

  assets.forEach((asset) => {
    const itemRef = doc(
      collection(db, "audit_room", auditRoomRef.id, "audit_item"),
      asset.id,
    );
    batch.set(itemRef, {
      asset_id: asset.id,
      description: asset.description ?? null,
      serial_number: asset.serial_number ?? null,
      category: asset.category ?? null,
      custodian: asset.name ?? null,
      asset_status: asset.status ?? null,
      audit_status: "not_audited",
      audited_at: null,
    });
  });

  await batch.commit();

  return { id: auditRoomRef.id, auditNo };
}

export async function fetchAuditRooms() {
  const q = query(collection(db, "audit_room"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      audit_no: data.audit_no,
      room_id: data.room_id,
      audited_by: data.audited_by,
      audited_by_name: data.audited_by_name,
      total_assets: data.total_assets,
      audited_count: data.audited_count,
      has_discrepancies: data.has_discrepancies,
      created_at: data.created_at,
      completed_at: data.completed_at,
    };
  });
}

export async function fetchAuditRoomsByRoomID(roomId) {
  const q = query(
    collection(db, "audit_room"),
    where("room_id", "==", roomId),
    orderBy("created_at", "desc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      audit_no: data.audit_no,
      room_id: data.room_id,
      audited_by: data.audited_by,
      audited_by_name: data.audited_by_name,
      total_assets: data.total_assets,
      audited_count: data.audited_count,
      discrepancy_count: data.discrepancy_count,
      has_discrepancies: data.has_discrepancies,
      created_at: data.created_at,
      completed_at: data.completed_at,
    };
  });
}

export async function fetchAuditByID(auditID) {
  if (!auditID) throw new Error("auditID is required.");

  const auditRef = doc(db, "audit_room", auditID);
  const auditSnap = await getDoc(auditRef);

  if (!auditSnap.exists()) {
    return null;
  }

  const itemsRef = collection(db, "audit_room", auditID, "audit_item");
  const itemsSnap = await getDocs(itemsRef);

  const items = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    id: auditSnap.id,
    ...auditSnap.data(),
    items,
  };
}