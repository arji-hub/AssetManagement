import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  DocumentReference,
  addDoc,
  updateDoc,
  orderBy,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "./firebase-config";
import { updateAssetRoom } from "./asset";
import { getName } from "./user";

const COLLECTION = "transfer_request";

function snapshotToItems(snap) {
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function isAcknowledged(requestDoc, uid) {
  const acks = requestDoc.acknowledgments || {};
  return ["from", "to", "property_custodian"].some(
    (key) => acks[key]?.uid === uid && acks[key]?.acknowledged === false,
  );
}

async function fetchMergedByFields({ statusFilter, fields, uid }) {
  const col = collection(db, COLLECTION);

  const snapshots = await Promise.all(
    fields.map((field) =>
      getDocs(
        query(
          col,
          where("status", statusFilter.op, statusFilter.value),
          where(field, "==", uid),
        ),
      ),
    ),
  );

  const merged = new Map();
  snapshots.forEach((snap) => {
    snap.docs.forEach((doc) =>
      merged.set(doc.id, { id: doc.id, ...doc.data() }),
    );
  });

  return Array.from(merged.values());
}

export async function fetchAction(user) {
  if (!user) return [];

  if (user.role === "admin") {
    const col = collection(db, COLLECTION);
    const snap = await getDocs(
      query(col, where("status", "==", "for_approval")),
    );
    const result = snapshotToItems(snap);
    return result;
  }

  const uid = user.uid;

  const items = await fetchMergedByFields({
    statusFilter: { op: "==", value: "pending" },
    fields: ["acknowledgments.from.uid", "acknowledgments.to.uid"],
    uid,
  });

  const filtered = items.filter((doc) => isAcknowledged(doc, uid));

  return filtered;
}

export async function fetchRequested(user) {
  if (!user) return [];
  const col = collection(db, COLLECTION);

  const snap = await getDocs(query(col, where("requested_by", "==", user.uid)));
  const items = snapshotToItems(snap);

  return items.filter((item) => !["completed", "denied"].includes(item.status));
}

export async function fetchLogs(user) {
  if (!user) return [];
  const statusFilter = ["completed", "denied"];

  if (user.role === "admin") {
    const col = collection(db, COLLECTION);
    const snap = await getDocs(query(col, where("status", "in", statusFilter)));
    return snapshotToItems(snap);
  }

  const uid = user.uid;
  return fetchMergedByFields({
    statusFilter: { op: "in", value: statusFilter },
    fields: [
      "requested_by",
      "acknowledgments.from.uid",
      "acknowledgments.to.uid",
    ],
    uid,
  });
}

export async function addTransferRequest(
  { asset_id, asset_description, from, to, notes },
  requestedByUid,
  requestedByName,
  requestedByRole,
) {
  const col = collection(db, COLLECTION);

  let type;
  if (!from && to) type = "assign_custodian";
  else if (from && to) type = "transfer_custodian";
  else if (from && !to) type = "remove_custodian";
  else type = "assign_custodian";

  const fromName = from ? (await getName(from))?.fullname || null : null;
  const toName = to?.uid ? (await getName(to.uid))?.fullname || null : null;

  const docData = {
    asset_id,
    asset_description,
    requested_by: requestedByUid,
    requested_by_name: requestedByName,
    requested_by_role: requestedByRole,
    notes: notes || "",
    status: "pending",
    type,
    completed_at: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    acknowledgments: {
      admin: {
        acknowledged: true,
        acknowledged_at: serverTimestamp(),
        uid: requestedByUid,
      },
      from: {
        acknowledged: from ? false : true,
        acknowledged_at: from ? null : serverTimestamp(),
        uid: from || null,
        name: fromName || null,
      },
      to: {
        acknowledged: to ? false : true,
        acknowledged_at: to ? null : serverTimestamp(),
        uid: to?.uid || null,
        name: toName || null,
      },
    },
    status_log: [
      {
        action: "created",
        by: requestedByRole,
        by_name: requestedByName,
        date: new Date(),
        note: "",
        role: requestedByRole,
      },
    ],
  };

  const docRef = await addDoc(col, docData);
  return { id: docRef.id, ...docData };
}

// transfer.js

export async function updateTransferRequest(requestId, user, note, isApprove) {
  const docRef = doc(db, COLLECTION, requestId);

  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Transfer request not found");

  const data = snap.data();
  const acknowledgments = data.acknowledgments || {};

  const action = isApprove ? "approve" : "decline";
  const now = serverTimestamp();

  const updates = {
    updated_at: now,
    status_log: arrayUnion({
      action,
      by: user.role,
      by_name: user.name,
      date: new Date(),
      note: note || "",
      role: user.role,
    }),
  };

  // Work out the post-update acknowledged state for each slot
  const ackState = {};
  ["admin", "from", "to"].forEach((slot) => {
    const isMatch = acknowledgments[slot]?.uid === user.uid;
    ackState[slot] = isMatch ? true : !!acknowledgments[slot]?.acknowledged;

    if (isMatch) {
      updates[`acknowledgments.${slot}.acknowledged`] = true;
      updates[`acknowledgments.${slot}.acknowledged_at`] = now;
    }
  });

  if (action === "decline") {
    updates.status = "denied";
  } else if (!ackState.admin && ackState.from && ackState.to) {
    updates.status = "for_approval";
  }
  // Note: the "all three acknowledged" → status: "completed" + asset
  // custodian reassignment is now handled server-side by the
  // onTransferRequestUpdated Cloud Function trigger, since /asset
  // writes require admin privileges this client can't have.

  await updateDoc(docRef, updates);
}

export async function addTransferRoom(
  { asset_id, asset_name, room_from, move_to },
  moveByUid,
) {
  const col = collection(db, "transfer_room");

  const docData = {
    asset_id,
    asset_name,
    room_from: room_from || null,
    move_to,
    move_by: moveByUid,
    created_at: serverTimestamp(),
  };

  const docRef = await addDoc(col, docData);
  await updateAssetRoom(asset_id, move_to);
  return { id: docRef.id, ...docData };
}

export async function fetchRoomLogs() {
  const col = collection(db, "transfer_room");
  const snap = await getDocs(query(col, orderBy("created_at", "desc")));
  return snapshotToItems(snap);
}

export async function fetchTransferByID(id) {
  const snap = await getDoc(doc(db, "transfer_request", id));
  if (!snap.exists()) throw new Error("Transfer request not found.");
  return { id: snap.id, ...snap.data() };
}
