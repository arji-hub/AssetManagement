/**
 * services/transferShared.js
 *
 * Constants and Firestore helpers shared by the transfer service modules.
 * Internal: not re-exported from services/transfer.js.
 */
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-config";
import ROLES from "../data/roles";
import { sortByDateDesc } from "../utils/transfer";

// ─── constants ─────────────────────────────────────────────────────

export const COLLECTION = "transfer_request";
export const ROOM_COLLECTION = "transfer_room";
export const ASSET_COLLECTION = "asset";
export const USER_COLLECTION = "user";

// Fields that identify who must act on a request.
export const ACTION_FIELDS = [
  "acknowledgments.from.uid",
  "acknowledgments.to.uid",
];
// Every field that ties a user to a request.
export const PARTICIPANT_FIELDS = ["requested_by", ...ACTION_FIELDS];

// Firestore's `array-contains-any` accepts a limited number of values.
export const ARRAY_CONTAINS_ANY_LIMIT = 10;

export const transferCol = () => collection(db, COLLECTION);
export const isAdminUser = (user) => user.role === ROLES.ADMIN;

// ─── shared Firestore helpers ──────────────────────────────────────

export function docToItem(d) {
  return { id: d.id, ...d.data() };
}

export function snapshotToItems(snap) {
  return snap.docs.map(docToItem);
}

export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Merge several lists of Firestore docs into one list, de-duped by doc id. */
export function mergeDocLists(docLists) {
  const merged = new Map();
  docLists.forEach((docs) =>
    docs.forEach((d) => merged.set(d.id, docToItem(d))),
  );
  return Array.from(merged.values());
}

/** One-time fetch of several queries, merged and de-duped by doc id. */
export async function fetchMerged(queries) {
  const snapshots = await Promise.all(queries.map((q) => getDocs(q)));
  return mergeDocLists(snapshots.map((snap) => snap.docs));
}

/**
 * Live subscription to several queries (Firestore has no cross-field OR for
 * these cases). Emits the merged, de-duped items whenever any query changes.
 * Returns a single unsubscribe function.
 */
export function subscribeMerged(queries, callback, onError) {
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
export function subscribeByAsset(
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