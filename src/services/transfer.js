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
  onSnapshot,
} from "firebase/firestore";
import { db, storage } from "./firebase-config";
import { updateAssetRoom } from "./asset";
import { getName } from "./user";
import ROLES from "../data/roles";
import { TRANSFER_TYPES, STATUS } from "../data/transfer";
import { getAdmin } from "./user";

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

// ─── one-time merged fetch (kept for any other callers)

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

function subscribeMergedByFields({
  statusFilter,
  fields,
  uid,
  callback,
  onError,
}) {
  const col = collection(db, COLLECTION);

  const latestByField = fields.map(() => []);

  const mergeAndEmit = () => {
    try {
      const merged = new Map();
      latestByField.forEach((docs) => {
        docs.forEach((doc) =>
          merged.set(doc.id, { id: doc.id, ...doc.data() }),
        );
      });
      callback(Array.from(merged.values()));
    } catch (err) {
      onError?.(err);
    }
  };

  const unsubscribers = fields.map((field, i) =>
    onSnapshot(
      query(
        col,
        where("status", statusFilter.op, statusFilter.value),
        where(field, "==", uid),
      ),
      (snap) => {
        latestByField[i] = snap.docs;
        mergeAndEmit();
      },
      (err) => onError?.(err),
    ),
  );

  return () => unsubscribers.forEach((unsub) => unsub());
}

export async function fetchAction(user) {
  if (!user) return [];

  if (user.role === "admin") {
    const col = collection(db, COLLECTION);
    const snap = await getDocs(
      query(col, where("status", "==", "for_approval")),
    );
    return snapshotToItems(snap);
  }

  const uid = user.uid;

  const items = await fetchMergedByFields({
    statusFilter: { op: "==", value: "pending" },
    fields: ["acknowledgments.from.uid", "acknowledgments.to.uid"],
    uid,
  });

  return items.filter((doc) => isAcknowledged(doc, uid));
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

export async function fetchRoomLogs() {
  const col = collection(db, "transfer_room");
  const snap = await getDocs(query(col, orderBy("created_at", "desc")));
  return snapshotToItems(snap);
}

//get transfer request by id
export function subscribeToAction(user, callback, onError) {
  if (!user) {
    callback([]);
    return () => {};
  }

  if (user.role === "admin") {
    const col = collection(db, COLLECTION);
    return onSnapshot(
      query(col, where("status", "==", "for_approval")),
      (snap) => callback(snapshotToItems(snap)),
      (err) => onError?.(err),
    );
  }

  const uid = user.uid;

  return subscribeMergedByFields({
    statusFilter: { op: "==", value: "pending" },
    fields: ["acknowledgments.from.uid", "acknowledgments.to.uid"],
    uid,
    callback: (items) => {
      const filtered = items.filter((doc) => isAcknowledged(doc, uid));
      callback(filtered);
    },
    onError,
  });
}

export function subscribeToRequested(user, callback, onError) {
  if (!user) {
    callback([]);
    return () => {};
  }

  const col = collection(db, COLLECTION);
  return onSnapshot(
    query(col, where("requested_by", "==", user.uid)),
    (snap) => {
      const items = snapshotToItems(snap);
      callback(
        items.filter((item) => !["completed", "denied"].includes(item.status)),
      );
    },
    (err) => onError?.(err),
  );
}

export function subscribeToLogs(user, callback, onError) {
  if (!user) {
    callback([]);
    return () => {};
  }

  const statusFilter = ["completed", "denied"];

  if (user.role === "admin") {
    const col = collection(db, COLLECTION);
    return onSnapshot(
      query(col, where("status", "in", statusFilter)),
      (snap) => callback(snapshotToItems(snap)),
      (err) => onError?.(err),
    );
  }

  const uid = user.uid;
  return subscribeMergedByFields({
    statusFilter: { op: "in", value: statusFilter },
    fields: [
      "requested_by",
      "acknowledgments.from.uid",
      "acknowledgments.to.uid",
    ],
    uid,
    callback,
    onError,
  });
}

export function subscribeToRoomLogs(callback, onError) {
  const col = collection(db, "transfer_room");
  return onSnapshot(
    query(col, orderBy("created_at", "desc")),
    (snap) => callback(snapshotToItems(snap)),
    (err) => onError?.(err),
  );
}

function resolveTransferType(from, to) {
  if (!from && !to) {
    throw new Error(
      "Invalid transfer request: 'from' and 'to' cannot both be empty.",
    );
  }

  if (!from) return TRANSFER_TYPES.ASSIGN;
  if (!to) return TRANSFER_TYPES.REMOVE;

  if (from.role === ROLES.FULLTIME && to.role === ROLES.PARTTIME) {
    return TRANSFER_TYPES.ASSIGNMR;
  }
  if (from.role === ROLES.PARTTIME && to.role === ROLES.FULLTIME) {
    return TRANSFER_TYPES.REMOVEMR;
  }

  return TRANSFER_TYPES.TRANSFER;
}

function buildAck(acknowledged, uid, name) {
  return {
    acknowledged,
    acknowledged_at: acknowledged ? serverTimestamp() : null,
    uid: uid || null,
    ...(name !== undefined ? { name: name || null } : {}),
  };
}

export async function addTransferRequest(
  { asset_id, asset_description, from, to, notes },
  requestedByUid,
  requestedByName,
  requestedByRole,
) {
  const col = collection(db, COLLECTION);
  if (!requestedByUid || !requestedByRole) {
    throw new Error(
      "addTransferRequest: requestedByUid and requestedByRole are required.",
    );
  }

  const isAdmin = requestedByRole === ROLES.ADMIN;
  const type = resolveTransferType(from, to);
  const status =
    type === TRANSFER_TYPES.ASSIGN && !isAdmin
      ? STATUS.FOR_APPROVAL
      : STATUS.PENDING;

  const [admin, fromInfo, toInfo] = await Promise.all([
    isAdmin ? Promise.resolve(null) : getAdmin(),
    from?.uid ? getName(from.uid) : Promise.resolve(null),
    to?.uid ? getName(to.uid) : Promise.resolve(null),
  ]);

  const uidAdmin = isAdmin ? requestedByUid : (admin?.uid ?? null);
  const fromName = fromInfo?.fullname || null;
  const toName = toInfo?.fullname || null;

  const docData = {
    asset_id,
    asset_description,
    requested_by: requestedByUid,
    requested_by_name: requestedByName,
    requested_by_role: requestedByRole,
    notes: notes || "",
    status,
    type,
    completed_at: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    acknowledgments: {
      admin: buildAck(isAdmin, uidAdmin),
      from: buildAck(!isAdmin, from, fromName),
      to: buildAck(!to, to?.uid, toName),
    },
    status_log: [
      {
        action: "created",
        by: requestedByRole,
        by_name: requestedByName,
        date: new Date(),
        note: notes || "",
      },
    ],
  };

  const docRef = await addDoc(col, docData);
  return { id: docRef.id, ...docData };
}

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

export async function fetchTransferByID(id) {
  const snap = await getDoc(doc(db, "transfer_request", id));
  if (!snap.exists()) throw new Error("Transfer request not found.");
  return { id: snap.id, ...snap.data() };
}
