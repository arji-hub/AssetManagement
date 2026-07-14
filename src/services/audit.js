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
} from "firebase/firestore";

export async function addAuditRoom({
  roomId,
  assets,
  auditedAssetIds,
  auditedBy,
  auditedByName,
  hasDiscrepancies = false,
}) {
  if (!roomId) throw new Error("roomId is required.");
  if (!assets || assets.length === 0) {
    throw new Error("No assets provided for this audit.");
  }

  const auditedIdSet =
    auditedAssetIds instanceof Set
      ? auditedAssetIds
      : new Set(auditedAssetIds ?? []);

  // == Step 1: create the audit_room parent doc ===========================
  const auditRoomData = {
    room_id: roomId,
    audited_by: auditedBy ?? null,
    audited_by_name: auditedByName ?? null,
    total_assets: assets.length,
    audited_count: auditedIdSet.size,
    has_discrepancies: hasDiscrepancies,
    created_at: serverTimestamp(),
    completed_at: serverTimestamp(),
  };

  const auditRoomRef = await addDoc(
    collection(db, "audit_room"),
    auditRoomData,
  );

  // == Step 2: batch-write each asset into the audit_item subcollection ===
  const batch = writeBatch(db);
  const now = new Date().toISOString();

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
      status: auditedIdSet.has(asset.id) ? "audited" : "not_audited",
      audited_at: auditedIdSet.has(asset.id) ? now : null,
    });
  });

  await batch.commit();

  return { id: auditRoomRef.id };
}


export async function fetchAuditRooms() {
  const q = query(collection(db, "audit_room"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
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

export async function fetchAuditRoomByID(id) {
  const roomSnap = await getDoc(doc(db, "audit_room", id));
  if (!roomSnap.exists()) throw new Error("Audit room not found.");

  const roomData = roomSnap.data();

  const itemsSnap = await getDocs(
    collection(db, "audit_room", id, "audit_item"),
  );

  const items = itemsSnap.docs.map((itemSnap) => ({
    id: itemSnap.id,
    ...itemSnap.data(),
  }));

  return {
    id: roomSnap.id,
    room_id: roomData.room_id,
    audited_by: roomData.audited_by,
    audited_by_name: roomData.audited_by_name,
    total_assets: roomData.total_assets,
    audited_count: roomData.audited_count,
    has_discrepancies: roomData.has_discrepancies,
    created_at: roomData.created_at,
    completed_at: roomData.completed_at,
    items,
  };
}
