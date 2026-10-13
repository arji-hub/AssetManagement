/**
 * services/transfer.js
 *
 * Layout:
 *   0. Setup            imports, constants, shared Firestore helpers
 *   1. Transfer request reads, guards, writes, initial assignment, condemn
 *   2. Transfer room    reads, writes, initial room assignment
 *   3. Dashboard        trend + pending-summary subscriptions
 *   4. Promotion        promote custodian to full-time (admin only)
 */
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-config";
import { updateAssetRoom, fetchAssetByID } from "./asset";
import { getName, getAdmin } from "./user";
import ROLES from "../data/roles";
import { TRANSFER_TYPES, STATUS } from "../data/transfer";
import { roomCount, resolveRoomName } from "./room.js";
import {
  CLOSED_STATUSES,
  isOpenRequest,
  sortByDateDesc,
  isAwaitingAcknowledgment,
  buildStatusLogEntry,
  resolveNextStatus,
  resolveTransferType,
  resolveInitialStatus,
  dedupeItemsByAssetId,
  getRoomTransferItems,
  normalizeRoomTransferItems,
  computeRoomCountDeltas,
  groupAssetsByPropertyCustodian,
  getRangeBounds,
  summarizeTransferActivity,
  summarizeCustodianAssignmentEvents,
} from "../utils/transfer";

// ─── constants ─────────────────────────────────────────────────────

const COLLECTION = "transfer_request";
const ROOM_COLLECTION = "transfer_room";
const ASSET_COLLECTION = "asset";
const USER_COLLECTION = "user";

// Fields that identify who must act on a request.
const ACTION_FIELDS = ["acknowledgments.from.uid", "acknowledgments.to.uid"];
// Every field that ties a user to a request.
const PARTICIPANT_FIELDS = ["requested_by", ...ACTION_FIELDS];

// Firestore's `array-contains-any` accepts a limited number of values.
const ARRAY_CONTAINS_ANY_LIMIT = 10;

const transferCol = () => collection(db, COLLECTION);
const isAdminUser = (user) => user.role === ROLES.ADMIN;

// ─── shared Firestore helpers ──────────────────────────────────────

function docToItem(d) {
  return { id: d.id, ...d.data() };
}

function snapshotToItems(snap) {
  return snap.docs.map(docToItem);
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Merge several lists of Firestore docs into one list, de-duped by doc id. */
function mergeDocLists(docLists) {
  const merged = new Map();
  docLists.forEach((docs) =>
    docs.forEach((d) => merged.set(d.id, docToItem(d))),
  );
  return Array.from(merged.values());
}

/** One-time fetch of several queries, merged and de-duped by doc id. */
async function fetchMerged(queries) {
  const snapshots = await Promise.all(queries.map((q) => getDocs(q)));
  return mergeDocLists(snapshots.map((snap) => snap.docs));
}

/**
 * Live subscription to several queries (Firestore has no cross-field OR for
 * these cases). Emits the merged, de-duped items whenever any query changes.
 * Returns a single unsubscribe function.
 */
function subscribeMerged(queries, callback, onError) {
  const latest = queries.map(() => []);

  const emit = () => {
    try {
      callback(mergeDocLists(latest));
    } catch (err) {
      onError?.(err);
    }
  };

  const unsubscribers = queries.map((q, i) =>
    onSnapshot(
      q,
      (snap) => {
        latest[i] = snap.docs;
        emit();
      },
      (err) => onError?.(err),
    ),
  );

  return () => unsubscribers.forEach((unsub) => unsub());
}

/** Live list of docs in `collectionName` that involve `assetId`. */
function subscribeByAsset(
  collectionName,
  sortField,
  assetId,
  callback,
  onError,
) {
  if (!assetId) {
    callback([]);
    return () => {};
  }

  const col = collection(db, collectionName);
  return subscribeMerged(
    [
      query(col, where("asset_ids", "array-contains", assetId)),
      // legacy single-asset documents
      query(col, where("asset_id", "==", assetId)),
    ],
    (items) => callback(sortByDateDesc(items, sortField)),
    onError,
  );
}

// ═══════════════════════════════════════════════════════════════════
// 1. TRANSFER REQUEST
// ═══════════════════════════════════════════════════════════════════

// ─── role-scoped query definitions ─────────────────────────────────
// Each scope is { queries, select }: the queries to run (results are
// merged) and a post-filter/sort. fetchX and subscribeToX share these,
// so the one-time and live versions can never drift apart.

function actionScope(user) {
  if (isAdminUser(user)) {
    return {
      queries: [
        query(transferCol(), where("status", "==", STATUS.FOR_APPROVAL)),
      ],
      select: (items) => items,
    };
  }

  return {
    queries: ACTION_FIELDS.map((field) =>
      query(
        transferCol(),
        where("status", "==", STATUS.PENDING),
        where(field, "==", user.uid),
      ),
    ),
    select: (items) =>
      items.filter((item) => isAwaitingAcknowledgment(item, user.uid)),
  };
}

function requestedScope(user) {
  return {
    queries: [query(transferCol(), where("requested_by", "==", user.uid))],
    select: (items) => items.filter(isOpenRequest),
  };
}

function logsScope(user) {
  const closed = where("status", "in", CLOSED_STATUSES);

  const queries = isAdminUser(user)
    ? [query(transferCol(), closed)]
    : PARTICIPANT_FIELDS.map((field) =>
        query(transferCol(), closed, where(field, "==", user.uid)),
      );

  return { queries, select: (items) => sortByDateDesc(items) };
}

async function fetchScope(user, buildScope) {
  if (!user) return [];
  const { queries, select } = buildScope(user);
  return select(await fetchMerged(queries));
}

function subscribeScope(user, buildScope, callback, onError) {
  if (!user) {
    callback([]);
    return () => {};
  }
  const { queries, select } = buildScope(user);
  return subscribeMerged(queries, (items) => callback(select(items)), onError);
}

// ─── reads ─────────────────────────────────────────────────────────

export const fetchAction = (user) => fetchScope(user, actionScope);
export const fetchRequested = (user) => fetchScope(user, requestedScope);
export const fetchLogs = (user) => fetchScope(user, logsScope);

export const subscribeToAction = (user, callback, onError) =>
  subscribeScope(user, actionScope, callback, onError);
export const subscribeToRequested = (user, callback, onError) =>
  subscribeScope(user, requestedScope, callback, onError);
export const subscribeToLogs = (user, callback, onError) =>
  subscribeScope(user, logsScope, callback, onError);

export function subscribeToTransferByID(id, callback, onError) {
  return onSnapshot(
    doc(db, COLLECTION, id),
    (snap) => {
      if (!snap.exists()) {
        onError?.(new Error("Transfer request not found."));
        return;
      }
      callback(docToItem(snap));
    },
    (err) => onError?.(err),
  );
}

export const subscribeToTransfersByAsset = (assetId, callback, onError) =>
  subscribeByAsset(COLLECTION, "updated_at", assetId, callback, onError);

// ─── open-transfer guards ──────────────────────────────────────────

/** Returns the subset of `assetIds` that already have an unfinished request. */
async function findAssetsWithOpenTransfer(assetIds) {
  const snapshots = await Promise.all(
    chunk(assetIds, ARRAY_CONTAINS_ANY_LIMIT).map((ids) =>
      getDocs(
        query(
          transferCol(),
          where("asset_ids", "array-contains-any", ids),
          where("completed_at", "==", null),
        ),
      ),
    ),
  );

  const wanted = new Set(assetIds);
  const conflicting = new Set();
  snapshots.forEach((snap) =>
    snap.docs.forEach((d) =>
      (d.data().asset_ids || []).forEach((id) => {
        if (wanted.has(id)) conflicting.add(id);
      }),
    ),
  );

  return [...conflicting];
}

async function assertNoOpenTransferForAssets(assetIds) {
  const conflicting = await findAssetsWithOpenTransfer(assetIds);
  if (conflicting.length > 0) {
    throw new Error(
      `The following asset(s) already have an ongoing transfer request: ${conflicting.join(", ")}. Please resolve them before filing a new one.`,
    );
  }
}

async function assertNoLocalMrAssigned(assetIds) {
  const assets = await Promise.all(assetIds.map((id) => fetchAssetByID(id)));
  const index = assets.findIndex((asset) => asset?.local_mr != null);
  if (index !== -1) {
    throw new Error(`Asset ${assetIds[index]} already has a local MR assigned`);
  }
}

// ─── writes ────────────────────────────────────────────────────────

function buildAck(acknowledged, uid, name) {
  return {
    acknowledged,
    acknowledged_at: acknowledged ? serverTimestamp() : null,
    uid: uid || null,
    ...(name !== undefined ? { name: name || null } : {}),
  };
}

export async function addTransferRequest(
  { items, from, to, notes },
  requestedByUid,
  requestedByName,
  requestedByRole,
) {
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

  // de-dupe in case the picker UI allows double-adding
  const cleanItems = dedupeItemsByAssetId(items);
  if (cleanItems.length === 0) {
    throw new Error("Invalid transfer request: no valid assets provided.");
  }

  if (from?.uid && to?.uid && from.uid === to.uid) {
    throw new Error(
      "Invalid transfer request: 'from' and 'to' cannot be the same person.",
    );
  }

  const assetIds = cleanItems.map((item) => item.asset_id);

  // Block filing if ANY asset in the batch already has an open request.
  await assertNoOpenTransferForAssets(assetIds);

  const isAdmin = requestedByRole === ROLES.ADMIN;
  const type = resolveTransferType(from, to);

  if (type === TRANSFER_TYPES.ASSIGNMR) {
    await assertNoLocalMrAssigned(assetIds);
  }

  const [admin, fromInfo, toInfo] = await Promise.all([
    isAdmin ? null : getAdmin(),
    from?.uid ? getName(from.uid) : null,
    to?.uid ? getName(to.uid) : null,
  ]);

  const adminUid = isAdmin ? requestedByUid : (admin?.uid ?? null);

  const docData = {
    items: cleanItems,
    asset_ids: assetIds,
    asset_count: assetIds.length,
    requested_by: requestedByUid,
    requested_by_name: requestedByName,
    requested_by_role: requestedByRole,
    notes: notes || "",
    status: resolveInitialStatus(type, isAdmin),
    type,
    completed_at: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    acknowledgments: {
      admin: buildAck(isAdmin, adminUid),
      from: buildAck(
        !from || from.uid === requestedByUid,
        from?.uid,
        fromInfo?.fullname || null,
      ),
      to: buildAck(
        !to || to.uid === requestedByUid,
        to?.uid,
        toInfo?.fullname || null,
      ),
    },
    status_log: [
      buildStatusLogEntry("created", requestedByRole, requestedByName, notes),
    ],
  };

  const docRef = await addDoc(transferCol(), docData);
  return { id: docRef.id, ...docData };
}

export async function updateTransferRequest(requestId, user, note, isApprove) {
  const docRef = doc(db, COLLECTION, requestId);

  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Transfer request not found");

  const acknowledgments = snap.data().acknowledgments || {};
  const now = serverTimestamp();

  const updates = {
    updated_at: now,
    status_log: arrayUnion({
      ...buildStatusLogEntry(
        isApprove ? "approve" : "decline",
        user.role,
        user.name,
        note,
      ),
      role: user.role,
    }),
  };

  // Mark the current user's slot as acknowledged and track the resulting state.
  const ackState = {};
  ["admin", "from", "to"].forEach((slot) => {
    const isCurrentUser = acknowledgments[slot]?.uid === user.uid;
    ackState[slot] = isCurrentUser || !!acknowledgments[slot]?.acknowledged;

    if (isCurrentUser) {
      updates[`acknowledgments.${slot}.acknowledged`] = true;
      updates[`acknowledgments.${slot}.acknowledged_at`] = now;
    }
  });

  const nextStatus = resolveNextStatus(isApprove, ackState);
  if (nextStatus) {
    updates.status = nextStatus;
    if (CLOSED_STATUSES.includes(nextStatus)) updates.completed_at = now;
  }

  await updateDoc(docRef, updates);
}

// ─── upon asset creation ───────────────────────────────────────────

export async function logInitialCustodianAssignment(
  { asset_id, asset_description, custodian_uid },
  requestedBy, // { uid, name, role }
) {
  if (!custodian_uid) return null;

  const [toInfo, custodianSnap] = await Promise.all([
    getName(custodian_uid),
    getDoc(doc(db, USER_COLLECTION, custodian_uid)),
  ]);

  const custodianRole = custodianSnap.exists()
    ? custodianSnap.data().role
    : null;
  const note = "Initial assignment upon asset registration.";
  const now = serverTimestamp();

  const docData = {
    asset_id,
    asset_description,
    requested_by: requestedBy.uid,
    requested_by_name: requestedBy.name,
    requested_by_role: requestedBy.role,
    notes: note,
    status: "completed",
    type: TRANSFER_TYPES.ASSIGN,
    completed_at: now,
    created_at: now,
    updated_at: now,
    acknowledgments: {
      admin: buildAck(true, requestedBy.uid),
      from: buildAck(true, null),
      to: {
        ...buildAck(true, custodian_uid, toInfo?.fullname || null),
        role: custodianRole,
      },
    },
    status_log: [
      buildStatusLogEntry("created", requestedBy.role, requestedBy.name, note),
    ],
  };

  const docRef = await addDoc(transferCol(), docData);
  return { id: docRef.id, ...docData };
}

// ─── asset condemnation (clears custodian, local MR and room) ──────

export async function condemnAsset(assetID) {
  const docRef = doc(db, ASSET_COLLECTION, assetID);

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

// ═══════════════════════════════════════════════════════════════════
// 2. TRANSFER ROOM
// ═══════════════════════════════════════════════════════════════════

// ─── reads ─────────────────────────────────────────────────────────

/** Resolve a list of room ids (dupes/nulls ignored) to Map<id, name>. */
async function resolveRoomNames(roomIds) {
  const uniqueIds = [...new Set(roomIds.filter(Boolean))];
  const entries = await Promise.all(
    uniqueIds.map(async (id) => [id, await resolveRoomName(id)]),
  );
  return new Map(entries);
}

export const subscribeToRoomTransfersByAsset = (assetId, callback, onError) =>
  subscribeByAsset(ROOM_COLLECTION, "created_at", assetId, callback, onError);

export function subscribeToRoomLogs(callback, onError) {
  return onSnapshot(
    query(collection(db, ROOM_COLLECTION), orderBy("created_at", "desc")),
    async (snap) => {
      try {
        const items = sortByDateDesc(snapshotToItems(snap));

        const names = await resolveRoomNames(
          items.flatMap((item) => [
            item.move_to,
            ...getRoomTransferItems(item).map((i) => i.room_from),
          ]),
        );
        const nameOf = (id) => (id ? names.get(id) : null);

        callback(
          items.map((item) => ({
            ...item,
            move_to: nameOf(item.move_to),
            items: getRoomTransferItems(item).map((i) => ({
              ...i,
              room_from: nameOf(i.room_from),
            })),
          })),
        );
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => onError?.(err),
  );
}

export async function fetchRoomTransferByID(id) {
  const snap = await getDoc(doc(db, ROOM_COLLECTION, id));
  if (!snap.exists()) throw new Error("Room transfer not found.");

  const log = { id: snap.id, ...snap.data() };
  const items = getRoomTransferItems(log);

  const [byInfo, names] = await Promise.all([
    log.move_by ? getName(log.move_by).catch(() => null) : null,
    resolveRoomNames([log.move_to, ...items.map((i) => i.room_from)]),
  ]);
  const nameOf = (roomId) => (roomId ? names.get(roomId) : null);

  return {
    ...log,
    move_by_name: byInfo?.fullname || null,
    move_to_name: nameOf(log.move_to),
    items: items.map((i) => ({ ...i, room_from_name: nameOf(i.room_from) })),
  };
}

// ─── writes ────────────────────────────────────────────────────────

/** Update each asset's room; returns the items that were moved successfully. */
async function moveAssetsToRoom(items, target) {
  const results = await Promise.allSettled(
    items.map((item) => updateAssetRoom(item.asset_id, target)),
  );

  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(
        `addTransferRoom: failed to update room for asset ${items[i].asset_id}`,
        result.reason,
      );
    }
  });

  return items.filter((_, i) => results[i].status === "fulfilled");
}

/** One atomic write per room (roomCount uses increment()). */
async function applyRoomCountDeltas(deltas, logId) {
  const results = await Promise.allSettled(
    [...deltas].map(([roomId, delta]) =>
      roomCount(roomId, delta > 0 ? "increment" : "decrement", Math.abs(delta)),
    ),
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        `addTransferRoom: ${ROOM_COLLECTION}/${logId} room counts failed`,
        result.reason,
      );
    }
  });
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
  const cleanItems = normalizeRoomTransferItems(items, target);
  const assetIds = cleanItems.map((i) => i.asset_id);

  const docData = {
    items: cleanItems,
    asset_ids: assetIds,
    asset_count: assetIds.length,
    move_to: target,
    move_by: moveByUid,
    created_at: serverTimestamp(),
  };

  // 1. log the transfer
  let docRef;
  try {
    docRef = await addDoc(collection(db, ROOM_COLLECTION), docData);
  } catch (err) {
    console.error("addTransferRoom: failed to create transfer_room doc", err);
    throw new Error(`Failed to log room transfer: ${err.message}`);
  }

  // 2. move the assets, 3. keep room counts in sync
  const moved = await moveAssetsToRoom(cleanItems, target);
  await applyRoomCountDeltas(computeRoomCountDeltas(moved, target), docRef.id);

  return { id: docRef.id, ...docData };
}

// ─── upon asset creation ───────────────────────────────────────────

export async function logInitialRoomAssignment(
  { asset_id, asset_name, room_id },
  moveByUid,
) {
  if (!room_id) return null;

  const docData = {
    items: [{ asset_id, asset_name, room_from: null }],
    asset_ids: [asset_id],
    asset_count: 1,
    move_to: room_id,
    move_by: moveByUid,
    created_at: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ROOM_COLLECTION), docData);
  return { id: docRef.id, ...docData };
}

// ═══════════════════════════════════════════════════════════════════
// 3. DASHBOARD PANELS (TransferDashboardPanel / AssetDashboardPanel)
// ═══════════════════════════════════════════════════════════════════

/** Requests created since `sinceDate` that are visible to `user`. */
function subscribeScopedSince(user, sinceDate, callback, onError) {
  const since = where("created_at", ">=", sinceDate);

  const queries = isAdminUser(user)
    ? [query(transferCol(), since)]
    : PARTICIPANT_FIELDS.map((field) =>
        query(transferCol(), since, where(field, "==", user.uid)),
      );

  return subscribeMerged(queries, callback, onError);
}

const emptyTransferActivity = () => ({
  series: [],
  totals: { all: 0, requests: 0, assets: 0 },
  trend: { direction: "flat", deltaPercent: 0 },
});

const emptyCustodianTrend = () => ({
  series: [],
  totals: { all: 0, assigned: 0, removed: 0 },
  trend: { direction: "flat", deltaPercent: 0 },
});

/** Month/Year circulation feed (admin view) for TransferDashboardPanel's chart. */
export function subscribeToTransferActivityTrend(
  user,
  range,
  callback,
  onError,
) {
  if (!user?.uid) {
    callback(emptyTransferActivity());
    return () => {};
  }

  return subscribeScopedSince(
    user,
    getRangeBounds(range).previousStart,
    (items) => callback(summarizeTransferActivity(items, range)),
    onError,
  );
}

/** Month/Year assigned-vs-removed trend feed for AssetDashboardPanel (custodian view). */
export function subscribeToCustodianAssignmentTrend(
  user,
  range,
  callback,
  onError,
) {
  if (!user?.uid) {
    callback(emptyCustodianTrend());
    return () => {};
  }

  return subscribeScopedSince(
    user,
    getRangeBounds(range).previousStart,
    (items) =>
      callback(summarizeCustodianAssignmentEvents(items, range, user.uid)),
    onError,
  );
}

export function subscribeToPendingSummary(user, callback, onError) {
  if (!user?.uid) {
    callback(0);
    return () => {};
  }

  if (isAdminUser(user)) {
    return onSnapshot(
      query(
        transferCol(),
        where("status", "in", [STATUS.PENDING, STATUS.FOR_APPROVAL]),
      ),
      (snap) => callback(snap.size),
      (err) => onError?.(err),
    );
  }

  return subscribeToAction(user, (items) => callback(items.length), onError);
}

// ═══════════════════════════════════════════════════════════════════
// 4. PROMOTE TO FULL-TIME (admin only)
// ═══════════════════════════════════════════════════════════════════

/** Asset docs where `custodianId` is the local MR. */
async function fetchLocalMrAssetDocs(custodianId) {
  const snap = await getDocs(
    query(
      collection(db, ASSET_COLLECTION),
      where("local_mr", "==", custodianId),
    ),
  );
  return snap.docs;
}

export async function getPromotionBlockers(custodianId) {
  const assetDocs = await fetchLocalMrAssetDocs(custodianId);
  return findAssetsWithOpenTransfer(assetDocs.map((d) => d.id));
}

async function resolveRequester(requestedBy) {
  if (requestedBy?.uid) return requestedBy;

  const admin = await getAdmin();
  if (!admin) throw new Error("No admin found to file the transfer request.");
  return { uid: admin.uid, name: admin.fullname, role: ROLES.ADMIN };
}

export async function createPromotionTransferRequest(custodianId, requestedBy) {
  if (!custodianId) throw new Error("Custodian ID is required.");

  // 1. Group the custodian's local-MR assets by current property custodian.
  const assetDocs = await fetchLocalMrAssetDocs(custodianId);
  const groups = groupAssetsByPropertyCustodian(assetDocs, custodianId);
  if (groups.size === 0) return [];

  // 2. Check every asset up front so we don't half-create requests.
  const allAssetIds = [...groups.values()].flatMap((items) =>
    items.map((i) => i.asset_id),
  );
  await assertNoOpenTransferForAssets(allAssetIds);

  // 3. Resolve requester + notes.
  const requester = await resolveRequester(requestedBy);
  const custodian = await getName(custodianId);
  const notes = `Auto-generated upon promotion of ${custodian?.fullname ?? "custodian"} to full-time.`;

  // 4. One request per group:
  //    has property custodian -> TRANSFER (FULLTIME -> FULLTIME)
  //    no property custodian  -> ASSIGN   (from = null)
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
