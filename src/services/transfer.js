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
import { updateAssetRoom, fetchAssetByID } from "./asset";
import { getName, getAdmin } from "./user";
import ROLES from "../data/roles";
import { TRANSFER_TYPES, STATUS } from "../data/transfer";
import { roomCount, resolveRoomName } from "./room.js";
import { getMillis, toDate } from "../utils/date";

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
            [
              item.move_to,
              ...getRoomTransferItems(item).map((i) => i.room_from),
            ].filter(Boolean),
          ),
        ),
      ];
      await Promise.all(uniqueIDs.map(resolveRoomName));

      const enriched = await Promise.all(
        items.map(async (item) => ({
          ...item,
          move_to: item.move_to ? await resolveRoomName(item.move_to) : null,
          items: await Promise.all(
            getRoomTransferItems(item).map(async (i) => ({
              ...i,
              room_from: i.room_from
                ? await resolveRoomName(i.room_from)
                : null,
            })),
          ),
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

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function assertNoOpenTransferForAssets(assetIds) {
  const col = collection(db, COLLECTION);
  const chunks = chunk(assetIds, 10);

  const snapshots = await Promise.all(
    chunks.map((ids) =>
      getDocs(
        query(
          col,
          where("asset_ids", "array-contains-any", ids),
          where("completed_at", "==", null),
        ),
      ),
    ),
  );

  const conflicting = new Set();
  snapshots.forEach((snap) =>
    snap.docs.forEach((doc) => {
      (doc.data().asset_ids || []).forEach((id) => {
        if (assetIds.includes(id)) conflicting.add(id);
      });
    }),
  );

  if (conflicting.size > 0) {
    throw new Error(
      `The following asset(s) already have an ongoing transfer request: ${[...conflicting].join(", ")}. Please resolve them before filing a new one.`,
    );
  }
}

export function getRequestItems(request) {
  if (Array.isArray(request?.items) && request.items.length > 0) {
    return request.items;
  }
  if (request?.asset_id) {
    return [
      {
        asset_id: request.asset_id,
        asset_description: request.asset_description,
      },
    ];
  }
  return [];
}

export async function addTransferRequest(
  { items, from, to, notes },
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

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "Invalid transfer request: at least one asset is required.",
    );
  }

  // de-dupe by asset_id in case the picker UI allows double-adding
  const seen = new Set();
  const cleanItems = items.filter((item) => {
    if (!item?.asset_id || seen.has(item.asset_id)) return false;
    seen.add(item.asset_id);
    return true;
  });

  if (cleanItems.length === 0) {
    throw new Error("Invalid transfer request: no valid assets provided.");
  }

  if (from?.uid && to?.uid && from.uid === to.uid) {
    throw new Error(
      "Invalid transfer request: 'from' and 'to' cannot be the same person.",
    );
  }

  const assetIds = cleanItems.map((item) => item.asset_id);

  // == Step 0: block filing if ANY asset in the batch has an open request ==
  await assertNoOpenTransferForAssets(assetIds);

  const isAdmin = requestedByRole === ROLES.ADMIN;
  const type = resolveTransferType(from, to);

  if (type === TRANSFER_TYPES.ASSIGNMR) {
    for (const item of cleanItems) {
      const asset = await fetchAssetByID(item.asset_id);
      if (asset?.local_mr != null) {
        throw new Error(
          `Asset ${item.asset_id} already has a local MR assigned`,
        );
      }
    }
  }
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
    items: cleanItems,
    asset_ids: assetIds,
    asset_count: assetIds.length,
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

export async function addTransferRoom({ items, move_to = null }, moveByUid) {
  if (!moveByUid) {
    throw new Error("TransferRoom: moveByUid is required");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("TransferRoom: at least one asset is required");
  }

  // move_to === null means "remove from room" (unassigned)
  const target = move_to || null;

  // --- Validate + de-dupe by asset_id ---
  const seen = new Set();
  const cleanItems = [];
  for (const item of items) {
    if (!item?.asset_id) {
      throw new Error("TransferRoom: every item needs an asset_id");
    }
    if (!item.asset_name) {
      throw new Error(
        `TransferRoom: asset_name is required (${item.asset_id})`,
      );
    }
    if (seen.has(item.asset_id)) continue;
    seen.add(item.asset_id);

    const roomFrom = item.room_from || null;
    if (roomFrom === target) {
      throw new Error(
        target
          ? `TransferRoom: asset ${item.asset_id} is already in that room`
          : `TransferRoom: asset ${item.asset_id} has no room to remove it from`,
      );
    }

    cleanItems.push({
      asset_id: item.asset_id,
      asset_name: item.asset_name,
      room_from: roomFrom,
    });
  }

  const assetIds = cleanItems.map((i) => i.asset_id);
  const col = collection(db, "transfer_room");

  const docData = {
    items: cleanItems,
    asset_ids: assetIds,
    asset_count: assetIds.length,
    move_to: target,
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

  // --- Step 2: update each asset's current room (null clears it) ---
  const results = await Promise.allSettled(
    cleanItems.map((item) => updateAssetRoom(item.asset_id, target)),
  );
  const succeeded = cleanItems.filter(
    (_, i) => results[i].status === "fulfilled",
  );
  const failed = cleanItems.filter((_, i) => results[i].status === "rejected");

  // --- Step 3: room counts, one atomic write per room ---
  // Net the change per room first (e.g. 20 assets out of room A = A: -20).
  // roomCount uses increment(), so the writes are atomic and safe in parallel.
  const deltas = new Map();
  const bump = (roomId, n) => {
    if (roomId) deltas.set(roomId, (deltas.get(roomId) ?? 0) + n);
  };
  for (const item of succeeded) {
    bump(item.room_from, -1);
    bump(target, +1);
  }

  const countResults = await Promise.allSettled(
    [...deltas]
      .filter(([, delta]) => delta !== 0)
      .map(([roomId, delta]) =>
        roomCount(
          roomId,
          delta > 0 ? "increment" : "decrement",
          Math.abs(delta),
        ),
      ),
  );
  const countError =
    countResults.find((r) => r.status === "rejected")?.reason ?? null;
  if (countError) {
    console.error(
      `addTransferRoom: transfer_room/${docRef.id} room counts failed`,
      countError,
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
  const latest = [[], []];

  const emit = () => {
    const merged = new Map();
    latest.flat().forEach((d) => merged.set(d.id, { id: d.id, ...d.data() }));
    callback(
      Array.from(merged.values()).sort(
        (a, b) => getMillis(b.updated_at) - getMillis(a.updated_at),
      ),
    );
  };

  const queries = [
    query(col, where("asset_ids", "array-contains", assetId)),
    query(col, where("asset_id", "==", assetId)),
  ];

  const unsubs = queries.map((q, i) =>
    onSnapshot(
      q,
      (snap) => {
        latest[i] = snap.docs;
        emit();
      },
      (err) => onError?.(err),
    ),
  );

  return () => unsubs.forEach((u) => u());
}

export function subscribeToRoomTransfersByAsset(assetId, callback, onError) {
  if (!assetId) {
    callback([]);
    return () => {};
  }

  const col = collection(db, "transfer_room");
  const latest = [[], []];

  const emit = () => {
    const merged = new Map();
    latest.flat().forEach((d) => merged.set(d.id, { id: d.id, ...d.data() }));
    callback(sortByCreatedAtDesc(Array.from(merged.values())));
  };

  const queries = [
    query(col, where("asset_ids", "array-contains", assetId)),
    query(col, where("asset_id", "==", assetId)),
  ];

  const unsubs = queries.map((q, i) =>
    onSnapshot(
      q,
      (snap) => {
        latest[i] = snap.docs;
        emit();
      },
      (err) => onError?.(err),
    ),
  );

  return () => unsubs.forEach((u) => u());
}

export async function fetchRoomTransferByID(id) {
  const snap = await getDoc(doc(db, "transfer_room", id));
  if (!snap.exists()) throw new Error("Room transfer not found.");

  const log = { id: snap.id, ...snap.data() };
  const items = getRoomTransferItems(log);

  const roomIds = [
    ...new Set([log.move_to, ...items.map((i) => i.room_from)].filter(Boolean)),
  ];

  const [byInfo, roomNames] = await Promise.all([
    log.move_by ? getName(log.move_by).catch(() => null) : null,
    Promise.all(roomIds.map(async (rid) => [rid, await resolveRoomName(rid)])),
  ]);
  const nameOf = Object.fromEntries(roomNames);

  return {
    ...log,
    move_by_name: byInfo?.fullname || null,
    move_to_name: log.move_to ? nameOf[log.move_to] : null,
    items: items.map((i) => ({
      ...i,
      room_from_name: i.room_from ? nameOf[i.room_from] : null,
    })),
  };
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

export function getRoomTransferItems(log) {
  if (Array.isArray(log?.items) && log.items.length > 0) return log.items;
  if (log?.asset_id) {
    return [
      {
        asset_id: log.asset_id,
        asset_name: log.asset_name,
        room_from: log.room_from ?? null,
      },
    ];
  }
  return [];
}

export async function logInitialRoomAssignment(
  { asset_id, asset_name, room_id },
  moveByUid,
) {
  if (!room_id) return null;

  const col = collection(db, "transfer_room");
  const docData = {
    items: [{ asset_id, asset_name, room_from: null }],
    asset_ids: [asset_id],
    asset_count: 1,
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

export function summarizeTransferActivity(items, range) {
  const { currentStart, previousStart } = getRangeBounds(range);
  const bucketMap = new Map(
    buildEmptyBuckets(range).map((bucket) => [
      bucket.key,
      { key: bucket.key, label: bucket.label, requests: 0, assets: 0 },
    ]),
  );

  let currentRequests = 0;
  let currentAssets = 0;
  let previousRequests = 0;
  let previousAssets = 0;

  items.forEach((item) => {
    if (item.status !== "completed") return;

    const completedAt = toDate(item.completed_at);
    if (!completedAt) return;

    const assetCount = getRequestItems(item).length || 1;

    if (completedAt >= currentStart) {
      const bucket = bucketMap.get(bucketKey(completedAt, range));
      if (bucket) {
        bucket.requests += 1;
        bucket.assets += assetCount;
      }
      currentRequests += 1;
      currentAssets += assetCount;
    } else if (completedAt >= previousStart) {
      previousRequests += 1;
      previousAssets += assetCount;
    }
  });

  // Trend reflects circulation (assets moved), which is the headline
  // metric on the admin card; request count is shown as a secondary stat.
  const direction =
    currentAssets === previousAssets
      ? "flat"
      : currentAssets > previousAssets
        ? "up"
        : "down";

  const deltaPercent =
    previousAssets === 0
      ? currentAssets === 0
        ? 0
        : 100
      : Math.round(((currentAssets - previousAssets) / previousAssets) * 100);

  return {
    series: Array.from(bucketMap.values()),
    totals: {
      all: currentAssets,
      requests: currentRequests,
      assets: currentAssets,
    },
    trend: { direction, deltaPercent },
  };
}

// ── Firestore-backed subscriptions (only these touch the network) ──

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

/** Month/Year circulation feed (admin view) for TransferDashboardPanel's chart. */
export function subscribeToTransferActivityTrend(
  user,
  range,
  callback,
  onError,
) {
  if (!user?.uid) {
    callback({
      series: [],
      totals: { all: 0, requests: 0, assets: 0 },
      trend: { direction: "flat", deltaPercent: 0 },
    });
    return () => {};
  }

  const { previousStart } = getRangeBounds(range);
  return subscribeScopedSince(
    user,
    previousStart,
    (items) => callback(summarizeTransferActivity(items, range)),
    onError,
  );
}

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
  // net = assigned - removed. `net` isn't part of the pending-bucket
  // records the AssetDashboardPanel reads today; it's computed on the
  // buckets below, once assigned/removed totals per bucket are settled,
  // for TransferDashboardPanel's net-custody view.

  items.forEach((item) => {
    if (item.status !== "completed") return;

    const completedAt = toDate(item.completed_at);
    if (!completedAt) return;

    const wasAssignedToUid = item.acknowledgments?.to?.uid === uid;
    const wasRemovedFromUid = item.acknowledgments?.from?.uid === uid;
    if (!wasAssignedToUid && !wasRemovedFromUid) return;

    // A single request can now move several assets at once — count assets,
    // not requests, so the KPI reflects actual custody changes.
    const assetCount = getRequestItems(item).length || 1;

    if (completedAt >= currentStart) {
      const bucket = bucketMap.get(bucketKey(completedAt, range));
      if (bucket) {
        if (wasAssignedToUid) bucket.assigned += assetCount;
        if (wasRemovedFromUid) bucket.removed += assetCount;
      }
      if (wasAssignedToUid) currentAssigned += assetCount;
      if (wasRemovedFromUid) currentRemoved += assetCount;
    } else if (completedAt >= previousStart) {
      if (wasAssignedToUid) previousAssigned += assetCount;
      if (wasRemovedFromUid) previousRemoved += assetCount;
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

  // Net-custody figures, additive to the assigned/removed totals above:
  // AssetDashboardPanel keeps reading totals.all/assigned/removed and
  // trend as before; TransferDashboardPanel's net-custody view reads
  // netTotal/netTrend and each bucket's `net` instead.
  const buckets = Array.from(bucketMap.values()).map((bucket) => ({
    ...bucket,
    net: bucket.assigned - bucket.removed,
  }));

  const netTotal = currentAssigned - currentRemoved;
  const previousNetTotal = previousAssigned - previousRemoved;

  const netDirection =
    netTotal === previousNetTotal
      ? "flat"
      : netTotal > previousNetTotal
        ? "up"
        : "down";

  const netDeltaPercent =
    previousNetTotal === 0
      ? netTotal === 0
        ? 0
        : 100
      : Math.round(
          ((netTotal - previousNetTotal) / Math.abs(previousNetTotal)) * 100,
        );

  return {
    series: buckets,
    totals: {
      all: currentTotal,
      assigned: currentAssigned,
      removed: currentRemoved,
    },
    trend: { direction, deltaPercent },
    netTotal,
    netTrend: { direction: netDirection, deltaPercent: netDeltaPercent },
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

//PROMOTE TO FULLTIME requests (admin only)
export async function getPromotionBlockers(custodianId) {
  const snap = await getDocs(
    query(collection(db, "asset"), where("local_mr", "==", custodianId)),
  );
  const assetIds = snap.docs.map((d) => d.id);
  if (assetIds.length === 0) return [];

  const snapshots = await Promise.all(
    chunk(assetIds, 10).map((ids) =>
      getDocs(
        query(
          collection(db, COLLECTION),
          where("asset_ids", "array-contains-any", ids),
          where("completed_at", "==", null),
        ),
      ),
    ),
  );

  const blocked = new Set();
  snapshots.forEach((s) =>
    s.docs.forEach((d) =>
      (d.data().asset_ids || []).forEach((id) => {
        if (assetIds.includes(id)) blocked.add(id);
      }),
    ),
  );
  return [...blocked];
}

export async function createPromotionTransferRequest(custodianId, requestedBy) {
  if (!custodianId) throw new Error("Custodian ID is required.");

  // ── 1. Scan assets held as local MR by this custodian ──
  const snap = await getDocs(
    query(collection(db, "asset"), where("local_mr", "==", custodianId)),
  );

  // ── 2. Group by property custodian ──
  // Key is the property custodian uid, or null for assets with none.
  // Assets where the promoted custodian is already the property custodian
  // are skipped (nothing to transfer).
  const groups = new Map(); // propertyCustodianUid | null -> items[]
  snap.docs.forEach((d) => {
    const { property_custodian, description } = d.data();
    const pc = property_custodian ?? null;
    if (pc === custodianId) return;

    if (!groups.has(pc)) groups.set(pc, []);
    groups.get(pc).push({ asset_id: d.id, asset_description: description });
  });

  if (groups.size === 0) return [];

  // ── 3. Check every asset up front so we don't half-create requests ──
  const allAssetIds = [...groups.values()].flatMap((items) =>
    items.map((i) => i.asset_id),
  );
  await assertNoOpenTransferForAssets(allAssetIds);

  // ── 4. Resolve requester + notes ──
  let requester = requestedBy;
  if (!requester?.uid) {
    const admin = await getAdmin();
    if (!admin) throw new Error("No admin found to file the transfer request.");
    requester = { uid: admin.uid, name: admin.fullname, role: ROLES.ADMIN };
  }

  const custodian = await getName(custodianId);
  const notes = `Auto-generated upon promotion of ${custodian?.fullname ?? "custodian"} to full-time.`;

  // ── 5. One request per group ──
  // - has property custodian -> TRANSFER (FULLTIME -> FULLTIME)
  // - no property custodian  -> ASSIGN   (from = null)
  const created = [];
  for (const [propertyCustodianUid, items] of groups) {
    try {
      const request = await addTransferRequest(
        {
          items,
          from: propertyCustodianUid
            ? { uid: propertyCustodianUid, role: ROLES.FULLTIME }
            : null,
          to: { uid: custodianId, role: ROLES.FULLTIME },
          notes,
        },
        requester.uid,
        requester.name,
        requester.role,
      );
      created.push(request);
    } catch (err) {
      throw new Error(
        `Created ${created.length} of ${groups.size} transfer request(s) before failing: ${err.message}`,
      );
    }
  }

  return created;
}
