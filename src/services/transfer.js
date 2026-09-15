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
import { getName, getAdmin } from "./user";
import ROLES from "../data/roles";
import { TRANSFER_TYPES, STATUS } from "../data/transfer";
import { roomCount, resolveRoomName } from "./room.js";

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

function getMillis(value) {
  if (!value) return 0; // still-pending serverTimestamp() — treat as "oldest" until it resolves
  if (typeof value.toMillis === "function") return value.toMillis(); // Firestore Timestamp
  if (typeof value === "string") return new Date(value).getTime(); // ISO string fallback
  if (value instanceof Date) return value.getTime();
  return 0;
}

function sortByCreatedAtDesc(items) {
  return [...items].sort(
    (a, b) => getMillis(b.created_at) - getMillis(a.created_at),
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
      (snap) => callback(sortByCreatedAtDesc(snapshotToItems(snap))),
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
    callback: (items) => callback(sortByCreatedAtDesc(items)),
    onError,
  });
}

export function subscribeToRoomLogs(callback, onError) {
  const col = collection(db, "transfer_room");
  return onSnapshot(
    query(col, orderBy("created_at", "desc")),
    async (snap) => {
      const items = sortByCreatedAtDesc(snapshotToItems(snap));

      const uniqueIDs = [
        ...new Set(
          items.flatMap((item) =>
            [item.move_to, item.room_from].filter(Boolean),
          ),
        ),
      ];
      await Promise.all(uniqueIDs.map(resolveRoomName));

      const enriched = await Promise.all(
        items.map(async (item) => ({
          ...item,
          move_to: await resolveRoomName(item.move_to),
          room_from: item.room_from
            ? await resolveRoomName(item.room_from)
            : null,
        })),
      );

      callback(enriched);
    },
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

async function assetNoOpenTransferForAsset(assetId) {
  const col = collection(db, COLLECTION);
  const snap = await getDocs(
    query(
      col,
      where("asset_id", "==", assetId),
      where("completed_at", "==", null),
    ),
  );

  if (!snap.empty) {
    throw new Error(
      "This asset already has an ongoing transfer request. Please resolve it before filing a new one.",
    );
  }
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

  if (from?.uid && to?.uid && from.uid === to.uid) {
    throw new Error(
      "Invalid transfer request: 'from' and 'to' cannot be the same person.",
    );
  }

  // == Step 0: block duplicate open transfer request =======
  await assetNoOpenTransferForAsset(asset_id);

  const isAdmin = requestedByRole === ROLES.ADMIN;
  const type = resolveTransferType(from, to);
  const status =
    (type === TRANSFER_TYPES.ASSIGN || type === TRANSFER_TYPES.REMOVE) &&
    !isAdmin
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
      from: buildAck(!from || from.uid === requestedByUid, from?.uid, fromName),
      to: buildAck(!to || to.uid === requestedByUid, to?.uid, toName),
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

  if (!isApprove) {
    updates.status = "denied";
    updates.completed_at = now;
  } else if (ackState.admin && ackState.from && ackState.to) {
    updates.status = "completed";
    updates.completed_at = now;
  } else if (!ackState.admin && ackState.from && ackState.to) {
    updates.status = "for_approval";
  }

  await updateDoc(docRef, updates);
}

export async function addTransferRoom(
  { asset_id, asset_name, room_from, move_to },
  moveByUid,
) {
  // --- Input validation ---
  if (!asset_id) {
    throw new Error("TransferRoom: asset_id is required");
  }
  if (!asset_name) {
    throw new Error("TransferRoom: asset_name is required");
  }
  if (!move_to) {
    throw new Error("TransferRoom: move_to is required");
  }
  if (!moveByUid) {
    throw new Error("TransferRoom: moveByUid is required");
  }
  if (room_from && room_from === move_to) {
    throw new Error(
      "addTransferRoom: room_from and move_to cannot be the same room",
    );
  }

  const col = collection(db, "transfer_room");

  const docData = {
    asset_id,
    asset_name,
    room_from: room_from || null,
    move_to,
    move_by: moveByUid,
    created_at: serverTimestamp(),
  };

  // --- Step 1: create the transfer log record ---
  let docRef;
  try {
    docRef = await addDoc(col, docData);
  } catch (err) {
    console.error("addTransferRoom: failed to create transfer_room doc", err);
    throw new Error(`Failed to log room transfer: ${err.message}`);
  }

  // --- Step 2: update the asset's current room ---
  try {
    await updateAssetRoom(asset_id, move_to);
  } catch (err) {
    console.error(
      `addTransferRoom: transfer_room/${docRef.id} was created but updateAssetRoom failed for asset ${asset_id}`,
      err,
    );
    throw new Error(
      `Transfer was logged but updating the asset's room failed: ${err.message}. ` +
        `Asset ${asset_id} may be out of sync — manual review needed (log id: ${docRef.id}).`,
    );
  }

  // --- Step 3: update room counts ---
  try {
    const countUpdates = [];
    if (room_from) {
      countUpdates.push(roomCount(room_from, "decrement"));
    }
    countUpdates.push(roomCount(move_to, "increment"));
    await Promise.all(countUpdates);
  } catch (err) {
    console.error(
      `addTransferRoom: transfer_room/${docRef.id} and asset room were updated but roomCount failed`,
      err,
    );
    throw new Error(
      `Transfer succeeded but room counts may be out of sync: ${err.message}. ` +
        `(log id: ${docRef.id}, room_from: ${room_from ?? "none"}, move_to: ${move_to})`,
    );
  }

  return { id: docRef.id, ...docData };
}

export async function fetchTransferByID(id) {
  const snap = await getDoc(doc(db, "transfer_request", id));
  if (!snap.exists()) throw new Error("Transfer request not found.");
  return { id: snap.id, ...snap.data() };
}

export function subscribeToTransfersByAsset(assetId, callback, onError) {
  if (!assetId) {
    callback([]);
    return () => {};
  }

  const col = collection(db, COLLECTION);
  const q = query(
    col,
    where("asset_id", "==", assetId),
    orderBy("updated_at", "desc"),
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => callback(snapshotToItems(snap)),
    (err) => onError?.(err),
  );

  return unsubscribe;
}

export function subscribeToRoomTransfersByAsset(assetId, callback, onError) {
  if (!assetId) {
    callback([]);
    return () => {};
  }

  const col = collection(db, "transfer_room");
  const q = query(
    col,
    where("asset_id", "==", assetId),
    orderBy("created_at", "desc"),
  );

  const unsubscribe = onSnapshot(
    q,
    (snap) => callback(snapshotToItems(snap)),
    (err) => onError?.(err),
  );

  return unsubscribe;
}

export async function condemnAsset(assetID) {
  const docRef = doc(db, "asset", assetID);

  try {
    const snap = await getDoc(docRef);
    const currentRoomId = snap.exists() ? snap.data().room_id : null;

    await updateDoc(docRef, {
      local_mr: null,
      property_custodian: null,
      room_id: null,
    });

    if (currentRoomId) {
      await roomCount(currentRoomId, "decrement");
    }
  } catch (err) {
    console.error("❌ Failed to condemn asset:", err);
    throw new Error(`Failed to condemn asset: ${err.message}`);
  }
}

//------------------UPON ASSET CREATION-----------------
export async function logInitialCustodianAssignment(
  { asset_id, asset_description, custodian_uid },
  requestedBy, // { uid, name, role }
) {
  if (!custodian_uid) return null;

  const [toInfo, custodianSnap] = await Promise.all([
    getName(custodian_uid),
    getDoc(doc(db, "user", custodian_uid)),
  ]);

  const toName = toInfo?.fullname || null;
  const custodianRole = custodianSnap.exists()
    ? custodianSnap.data().role
    : null;

  const now = serverTimestamp();
  const col = collection(db, COLLECTION);

  const docData = {
    asset_id,
    asset_description,
    requested_by: requestedBy.uid,
    requested_by_name: requestedBy.name,
    requested_by_role: requestedBy.role,
    notes: "Initial assignment upon asset registration.",
    status: "completed",
    type: TRANSFER_TYPES.ASSIGN,
    completed_at: now,
    created_at: now,
    updated_at: now,
    acknowledgments: {
      admin: buildAck(true, requestedBy.uid),
      from: buildAck(true, null),
      to: { ...buildAck(true, custodian_uid, toName), role: custodianRole },
    },
    status_log: [
      {
        action: "created",
        by: requestedBy.role,
        by_name: requestedBy.name,
        date: new Date(),
        note: "Initial assignment upon asset registration.",
      },
    ],
  };

  const docRef = await addDoc(col, docData);
  return { id: docRef.id, ...docData };
}

export async function logInitialRoomAssignment(
  { asset_id, asset_name, room_id },
  moveByUid,
) {
  if (!room_id) return null;

  const col = collection(db, "transfer_room");
  const docData = {
    asset_id,
    asset_name,
    room_from: null,
    move_to: room_id,
    move_by: moveByUid,
    created_at: serverTimestamp(),
  };

  const docRef = await addDoc(col, docData);
  return { id: docRef.id, ...docData };
}

// ──────────────────────────────────────────────────────────────────
// Dashboard summary support (TransferDashboardPanel)
// ──────────────────────────────────────────────────────────────────

// ── pure helpers (no Firestore calls — safe to import into hooks/stories) ──

function getRangeBounds(range) {
  const now = new Date();
  if (range === "year") {
    return {
      currentStart: new Date(now.getFullYear(), 0, 1),
      previousStart: new Date(now.getFullYear() - 1, 0, 1),
    };
  }
  return {
    currentStart: new Date(now.getFullYear(), now.getMonth(), 1),
    previousStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
}

function bucketKey(date, range) {
  return range === "year"
    ? `${date.getFullYear()}-${date.getMonth()}`
    : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function bucketLabel(date, range) {
  return range === "year"
    ? date.toLocaleString("en-US", { month: "short" })
    : String(date.getDate());
}

function buildEmptyBuckets(range) {
  const now = new Date();
  const buckets = [];

  if (range === "year") {
    for (let month = 0; month <= now.getMonth(); month++) {
      const d = new Date(now.getFullYear(), month, 1);
      buckets.push({
        key: bucketKey(d, range),
        label: bucketLabel(d, range),
        pending: 0,
        forApproval: 0,
      });
    }
  } else {
    const daysElapsed = now.getDate();
    for (let day = 1; day <= daysElapsed; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      buckets.push({
        key: bucketKey(d, range),
        label: bucketLabel(d, range),
        pending: 0,
        forApproval: 0,
      });
    }
  }

  return buckets;
}

function toDate(value) {
  const ms = getMillis(value);
  return ms ? new Date(ms) : null;
}

/**
 * Pure transform: raw transfer_request-shaped items -> the
 * { series, totals, trend } shape TransferDashboardPanel expects.
 * No Firestore calls — used both by the live subscription below AND
 * directly by useTransferSummary in mock/Storybook mode.
 *
 * Buckets by created_at; for each bucket, counts how many of the items
 * created in that bucket are CURRENTLY "pending" vs "for_approval".
 * Items already completed/denied are excluded from the chart (they're
 * no longer part of the backlog) — note this means past bucket counts
 * will shrink over time as requests resolve; it's a live backlog
 * composition view, not an immutable historical log.
 */
export function summarizeTransferItems(items, range) {
  const { currentStart, previousStart } = getRangeBounds(range);
  const bucketMap = new Map(
    buildEmptyBuckets(range).map((bucket) => [bucket.key, bucket]),
  );

  let currentTotal = 0;
  let previousTotal = 0;

  items.forEach((item) => {
    if (!["pending", "for_approval"].includes(item.status)) return;

    const created = toDate(item.created_at);
    if (!created) return;

    if (created >= currentStart) {
      const bucket = bucketMap.get(bucketKey(created, range));
      if (bucket) {
        if (item.status === "pending") bucket.pending += 1;
        else bucket.forApproval += 1;
      }
      currentTotal += 1;
    } else if (created >= previousStart) {
      previousTotal += 1;
    }
  });

  const direction =
    currentTotal === previousTotal
      ? "flat"
      : currentTotal > previousTotal
        ? "up"
        : "down";

  const deltaPercent =
    previousTotal === 0
      ? currentTotal === 0
        ? 0
        : 100
      : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

  return {
    series: Array.from(bucketMap.values()),
    totals: { all: currentTotal },
    trend: { direction, deltaPercent },
  };
}

// ── Firestore-backed subscriptions (only these touch the network) ──

/**
 * Scopes a live collection of transfer_request docs created since
 * `sinceDate`: admins get everything, everyone else gets only requests
 * they're party to (requester, from, or to), merged the same way
 * subscribeMergedByFields() does elsewhere in this file.
 */
function subscribeScopedSince(user, sinceDate, callback, onError) {
  const col = collection(db, COLLECTION);

  if (user.role === "admin") {
    return onSnapshot(
      query(col, where("created_at", ">=", sinceDate)),
      (snap) => callback(snapshotToItems(snap)),
      (err) => onError?.(err),
    );
  }

  const fields = [
    "requested_by",
    "acknowledgments.from.uid",
    "acknowledgments.to.uid",
  ];
  const uid = user.uid;
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
      query(col, where("created_at", ">=", sinceDate), where(field, "==", uid)),
      (snap) => {
        latestByField[i] = snap.docs;
        mergeAndEmit();
      },
      (err) => onError?.(err),
    ),
  );

  return () => unsubscribers.forEach((unsub) => unsub());
}

/** Month/Year trend feed for TransferDashboardPanel's chart. */
export function subscribeToTransferTrend(user, range, callback, onError) {
  if (!user?.uid) {
    callback({
      series: [],
      totals: { all: 0 },
      trend: { direction: "flat", deltaPercent: 0 },
    });
    return () => {};
  }

  const { previousStart } = getRangeBounds(range);
  return subscribeScopedSince(
    user,
    previousStart,
    (items) => callback(summarizeTransferItems(items, range)),
    onError,
  );
}

/**
 * Live "currently open" backlog count (Pending + For Approval),
 * independent of the Month/Year range. This is the same query the old
 * useTransferSummary hook ran inline — moved here so the hook never
 * imports firebase/firestore directly.
 */
export function subscribeToPendingSummary(user, callback, onError) {
  if (!user?.uid) {
    callback(0);
    return () => {};
  }

  if (user.role === "admin") {
    const col = collection(db, COLLECTION);
    return onSnapshot(
      query(col, where("status", "in", ["pending", "for_approval"])),
      (snap) => callback(snap.size),
      (err) => onError?.(err),
    );
  }

  return subscribeToAction(user, (items) => callback(items.length), onError);
}

/**
 * Pure transform: raw transfer_request-shaped items -> { series, totals,
 * trend } for a non-admin custodian's view of AssetDashboardPanel: tracks
 * when assets were assigned TO them vs removed FROM them, for completed
 * transfers only. Bucketed by completed_at (when it actually took effect),
 * not created_at. Works uniformly across ASSIGN/REMOVE/TRANSFER/ASSIGNMR/
 * REMOVEMR — every type encodes a from/to pair, so no type-specific
 * branching is needed here.
 */
export function summarizeCustodianAssignmentEvents(items, range, uid) {
  const { currentStart, previousStart } = getRangeBounds(range);
  const bucketMap = new Map(
    buildEmptyBuckets(range).map((bucket) => [
      bucket.key,
      { key: bucket.key, label: bucket.label, assigned: 0, removed: 0 },
    ]),
  );

  let currentAssigned = 0;
  let currentRemoved = 0;
  let previousAssigned = 0;
  let previousRemoved = 0;

  items.forEach((item) => {
    if (item.status !== "completed") return;

    const completedAt = toDate(item.completed_at);
    if (!completedAt) return;

    const wasAssignedToUid = item.acknowledgments?.to?.uid === uid;
    const wasRemovedFromUid = item.acknowledgments?.from?.uid === uid;
    if (!wasAssignedToUid && !wasRemovedFromUid) return;

    if (completedAt >= currentStart) {
      const bucket = bucketMap.get(bucketKey(completedAt, range));
      if (bucket) {
        if (wasAssignedToUid) bucket.assigned += 1;
        if (wasRemovedFromUid) bucket.removed += 1;
      }
      if (wasAssignedToUid) currentAssigned += 1;
      if (wasRemovedFromUid) currentRemoved += 1;
    } else if (completedAt >= previousStart) {
      if (wasAssignedToUid) previousAssigned += 1;
      if (wasRemovedFromUid) previousRemoved += 1;
    }
  });

  const currentTotal = currentAssigned + currentRemoved;
  const previousTotal = previousAssigned + previousRemoved;

  const direction =
    currentTotal === previousTotal
      ? "flat"
      : currentTotal > previousTotal
        ? "up"
        : "down";

  const deltaPercent =
    previousTotal === 0
      ? currentTotal === 0
        ? 0
        : 100
      : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

  return {
    series: Array.from(bucketMap.values()),
    totals: {
      all: currentTotal,
      assigned: currentAssigned,
      removed: currentRemoved,
    },
    trend: { direction, deltaPercent },
  };
}

/** Month/Year assigned-vs-removed trend feed for AssetDashboardPanel (custodian view). */
export function subscribeToCustodianAssignmentTrend(
  user,
  range,
  callback,
  onError,
) {
  if (!user?.uid) {
    callback({
      series: [],
      totals: { all: 0, assigned: 0, removed: 0 },
      trend: { direction: "flat", deltaPercent: 0 },
    });
    return () => {};
  }

  const { previousStart } = getRangeBounds(range);
  return subscribeScopedSince(
    user,
    previousStart,
    (items) =>
      callback(summarizeCustodianAssignmentEvents(items, range, user.uid)),
    onError,
  );
}
