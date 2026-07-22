import { db } from "./firebase-config";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  query,
  where,
  runTransaction,
  onSnapshot,
} from "firebase/firestore";
import { AUDIT_NO_CONFIG } from "../data/audit";

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

export async function addAuditRoom({
  roomId,
  roomCustodian,
  assets,
  auditedBy,
  auditedByName,
}) {
  if (!roomId) throw new Error("roomId is required.");
  if (!assets || assets.length === 0) {
    throw new Error("No assets provided for this audit.");
  }

  const auditNo = await generateAuditNo("room");

  const auditRoomData = {
    audit_no: auditNo,
    room_id: roomId,
    room_custodian: roomCustodian,
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

  const auditRoomRef = await addDoc(
    collection(db, "audit_room"),
    auditRoomData,
  );

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
      discrepancy_count: data.discrepancy_count,
      created_at: data.created_at,
      completed_at: data.completed_at,
      status: data.status,
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

export function subscribeToAuditByID(auditID, onData, onError) {
  if (!auditID) throw new Error("auditID is required.");

  const auditRef = doc(db, "audit_room", auditID);
  const itemsRef = collection(db, "audit_room", auditID, "audit_item");
  const discrepancyItemsRef = collection(
    db,
    "audit_room",
    auditID,
    "discrepancy_item",
  );

  let auditData = null;
  let itemsData = null;
  let discrepancyItemsData = null;
  let auditUnsubscribe = null;
  let itemsUnsubscribe = null;
  let discrepancyUnsubscribe = null;

  const emitIfReady = () => {
    if (
      auditData !== null &&
      itemsData !== null &&
      discrepancyItemsData !== null
    ) {
      onData({
        ...auditData,
        items: itemsData,
        discrepancyItems: discrepancyItemsData,
      });
    }
  };

  // Listen to audit document
  auditUnsubscribe = onSnapshot(
    auditRef,
    (auditSnap) => {
      if (!auditSnap.exists()) {
        onError(new Error("Audit not found"));
        return;
      }

      auditData = {
        id: auditSnap.id,
        ...auditSnap.data(),
      };

      emitIfReady();
    },
    onError,
  );

  // Listen to audit_item subcollection
  itemsUnsubscribe = onSnapshot(
    itemsRef,
    (itemsSnap) => {
      itemsData = itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      emitIfReady();
    },
    onError,
  );

  // Listen to discrepancy_item subcollection
  discrepancyUnsubscribe = onSnapshot(
    discrepancyItemsRef,
    (discrepancySnap) => {
      discrepancyItemsData = discrepancySnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      emitIfReady();
    },
    onError,
  );

  return () => {
    if (auditUnsubscribe) auditUnsubscribe();
    if (itemsUnsubscribe) itemsUnsubscribe();
    if (discrepancyUnsubscribe) discrepancyUnsubscribe();
  };
}

export async function updateAuditItem(auditID, itemID, updates) {
  if (!auditID) throw new Error("auditID is required.");
  if (!itemID) throw new Error("itemID is required.");
  if (!updates || typeof updates !== "object") {
    throw new Error("updates must be a non-empty object.");
  }

  const auditRef = doc(db, "audit_room", auditID);
  const itemRef = doc(db, "audit_room", auditID, "audit_item", itemID);

  return await runTransaction(db, async (transaction) => {
    const auditSnap = await transaction.get(auditRef);
    const itemSnap = await transaction.get(itemRef);

    if (!auditSnap.exists()) {
      throw new Error(`Audit with ID "${auditID}" not found.`);
    }

    if (!itemSnap.exists()) {
      throw new Error(`Audit item with ID "${itemID}" not found.`);
    }

    const itemData = itemSnap.data();
    const auditData = auditSnap.data();

    // Track if we're marking as audited (was not audited, now is)
    const isMarkingAsAudited =
      itemData.audit_status !== "audited" && updates.audit_status === "audited";

    // Update the audit item
    transaction.update(itemRef, {
      ...updates,
      audit_status: "audited",
      audited_at: serverTimestamp(),
    });

    // If marking as audited, increment the audited_count in the parent audit
    if (isMarkingAsAudited) {
      const newAuditedCount = (auditData.audited_count ?? 0) + 1;
      transaction.update(auditRef, {
        audited_count: newAuditedCount,
        updated_at: serverTimestamp(),
      });
    }

    return {
      success: true,
      auditID,
      itemID,
      updates,
    };
  });
}

export async function completeAuditSession(auditID) {
  if (!auditID) {
    throw new Error("completeAuditSession: auditID is required");
  }

  const auditRef = doc(db, "audit_room", auditID);

  await updateDoc(auditRef, {
    status: "completed",
    completed_at: serverTimestamp(),
  });
}

export async function addUnexpectedDiscrepancy(auditID, assetData, roomId) {
  if (!auditID) throw new Error("auditID is required.");
  if (!assetData) throw new Error("assetData is required.");

  const assetId = assetData.id ?? assetData.asset_id;
  if (!assetId) throw new Error("assetData must include an id or asset_id.");

  const auditRef = doc(db, "audit_room", auditID);
  const discrepancyRef = doc(
    db,
    "audit_room",
    auditID,
    "discrepancy_item",
    assetId,
  );

  return await runTransaction(db, async (transaction) => {
    const auditSnap = await transaction.get(auditRef);
    const discrepancySnap = await transaction.get(discrepancyRef);

    if (!auditSnap.exists()) {
      throw new Error(`Audit with ID "${auditID}" not found.`);
    }

    if (discrepancySnap.exists()) {
      throw new Error(
        "This asset has already been flagged as a discrepancy in this audit.",
      );
    }

    const auditRoomData = auditSnap.data();

    transaction.set(discrepancyRef, {
      asset_id: assetId,
      description: assetData.description ?? null,
      serial_number: assetData.serial_number ?? null,
      category: assetData.category ?? null,
      custodian: assetData.property_custodian_name ?? null,
      asset_status: assetData.status ?? null,
      audit_status: "misplaced",
      audited_at: serverTimestamp(),
      room_id: roomId ?? auditRoomData.room_id ?? null,
    });

    const newDiscrepancyCount = (auditRoomData.discrepancy_count ?? 0) + 1;
    transaction.update(auditRef, {
      discrepancy_count: newDiscrepancyCount,
      has_discrepancies: true,
      updated_at: serverTimestamp(),
    });

    return {
      success: true,
      auditID,
      assetId,
      discrepancyId: discrepancyRef.id,
    };
  });
}
