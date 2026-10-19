/**
 * services/transferRequest.js
 *
 * Transfer requests: reads, guards, writes, initial assignment, condemn.
 */
import {
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-config";
import { fetchAssetByID } from "./asset";
import { getName, getAdmin } from "./user";
import ROLES from "../data/roles";
import { TRANSFER_TYPES, STATUS } from "../data/transfer";
import { roomCount } from "./room.js";
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
} from "../utils/transfer";
import {
  COLLECTION,
  ASSET_COLLECTION,
  USER_COLLECTION,
  ACTION_FIELDS,
  PARTICIPANT_FIELDS,
  ARRAY_CONTAINS_ANY_LIMIT,
  transferCol,
  isAdminUser,
  docToItem,
  chunk,
  fetchMerged,
  subscribeMerged,
  subscribeByAsset,
} from "./transferShared";

// ─── name resolution (read time) ───────────────────────────────────
// Names are stored on the doc at write time, but users can rename
// themselves. On every read we look names up by uid so the UI always
// shows the current full name, falling back to the stored name if the
// user doc is missing or the lookup fails.

const ACK_SLOTS = ["admin", "from", "to"];

/**
 * Replace stored names with each user's current full name, looked up by uid:
 *   - requested_by_name        <- requested_by
 *   - acknowledgments.X.name   <- acknowledgments.X.uid  (admin, from, to)
 * Accepts a single item or an array and returns the same shape.
 */
async function withResolvedNames(input) {
  const items = Array.isArray(input) ? input : [input];

  const uids = new Set();
  items.forEach((item) => {
    if (item.requested_by) uids.add(item.requested_by);
    ACK_SLOTS.forEach((slot) => {
      const uid = item.acknowledgments?.[slot]?.uid;
      if (uid) uids.add(uid);
    });
  });

  const entries = await Promise.all(
    [...uids].map(async (uid) => [
      uid,
      (await getName(uid).catch(() => null))?.fullname || null,
    ]),
  );
  const names = new Map(entries);

  const resolved = items.map((item) => {
    const acks = item.acknowledgments;

    return {
      ...item,
      requested_by_name: names.get(item.requested_by) || item.requested_by_name,
      ...(acks && {
        acknowledgments: Object.fromEntries(
          Object.entries(acks).map(([slot, ack]) => [
            slot,
            ack?.uid ? { ...ack, name: names.get(ack.uid) || ack.name } : ack,
          ]),
        ),
      }),
    };
  });

  return Array.isArray(input) ? resolved : resolved[0];
}

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
  return withResolvedNames(select(await fetchMerged(queries)));
}

function subscribeScope(user, buildScope, callback, onError) {
  if (!user) {
    callback([]);
    return () => {};
  }
  const { queries, select } = buildScope(user);

  let latestRun = 0;
  let active = true;

  const unsubscribe = subscribeMerged(
    queries,
    async (items) => {
      const run = ++latestRun; // invalidates any lookup still in flight
      try {
        const enriched = await withResolvedNames(select(items));
        if (active && run === latestRun) callback(enriched);
      } catch (err) {
        onError?.(err);
      }
    },
    onError,
  );

  return () => {
    active = false; // ignore lookups that finish after unsubscribing
    unsubscribe();
  };
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

const isDeclineEntry = (log) =>
  [log?.action, log?.type, log?.status, log?.event].some((v) =>
    /decline|denied|reject/i.test(String(v ?? "")),
  );

const toMillis = (ts) =>
  ts?.toMillis ? ts.toMillis() : ts?.seconds ? ts.seconds * 1000 : 0;

function withAckResponses(item) {
  const acks = item.acknowledgments;
  if (!acks) return item;

  const acknowledgedSlots = ACK_SLOTS.filter(
    (slot) => acks[slot]?.acknowledged,
  );

  let declinerSlot = null;
  const declineLog = [...(item.status_log || [])]
    .reverse()
    .find(isDeclineEntry);

  if (declineLog && item.status === "denied") {
    const logName = String(
      declineLog.name ?? declineLog.user_name ?? declineLog.by ?? "",
    )
      .trim()
      .toLowerCase();

    declinerSlot =
      acknowledgedSlots.find(
        (slot) =>
          logName &&
          String(acks[slot].name ?? "")
            .trim()
            .toLowerCase() === logName,
      ) ?? null;

    if (!declinerSlot && acknowledgedSlots.length) {
      declinerSlot = acknowledgedSlots.reduce((latest, slot) =>
        toMillis(acks[slot].acknowledged_at) >=
        toMillis(acks[latest].acknowledged_at)
          ? slot
          : latest,
      );
    }
  }

  return {
    ...item,
    acknowledgments: Object.fromEntries(
      Object.entries(acks).map(([slot, ack]) => [
        slot,
        ack?.acknowledged
          ? {
              ...ack,
              response: slot === declinerSlot ? "declined" : "approved",
            }
          : ack,
      ]),
    ),
  };
}

export function subscribeToTransferByID(id, callback, onError) {
  let latestRun = 0;
  let active = true;

  const unsubscribe = onSnapshot(
    doc(db, COLLECTION, id),
    async (snap) => {
      const run = ++latestRun;

      if (!snap.exists()) {
        onError?.(new Error("Transfer request not found."));
        return;
      }

      try {
        const item = await withResolvedNames(withAckResponses(docToItem(snap)));
        if (active && run === latestRun) callback(item);
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => onError?.(err),
  );

  return () => {
    active = false;
    unsubscribe();
  };
}

export const subscribeToTransfersByAsset = (assetId, callback, onError) =>
  subscribeByAsset(COLLECTION, "updated_at", assetId, callback, onError);

// ─── open-transfer guards ──────────────────────────────────────────

/** Returns the subset of `assetIds` that already have an unfinished request. */
export async function findAssetsWithOpenTransfer(assetIds) {
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

export async function assertNoOpenTransferForAssets(assetIds) {
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
  const adminInfo = adminUid ? await getName(adminUid) : null;

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
      admin: buildAck(isAdmin, adminUid, adminInfo?.fullname || null),
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
  ACK_SLOTS.forEach((slot) => {
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

  const [toInfo, custodianSnap, adminInfo] = await Promise.all([
    getName(custodian_uid),
    getDoc(doc(db, USER_COLLECTION, custodian_uid)),
    getName(requestedBy.uid),
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
      admin: buildAck(true, requestedBy.uid, adminInfo?.fullname || null),
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
