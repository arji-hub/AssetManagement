/**
 * services/transferRoom.js
 *
 * Transfer room: reads, writes, initial room assignment.
 */
import {
  collection,
  query,
  getDoc,
  doc,
  addDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase-config";
import { updateAssetRoom } from "./asset";
import { getName } from "./user";
import { roomCount, resolveRoomName } from "./room.js";
import {
  sortByDateDesc,
  getRoomTransferItems,
  normalizeRoomTransferItems,
  computeRoomCountDeltas,
} from "../utils/transfer";
import {
  ROOM_COLLECTION,
  snapshotToItems,
  subscribeByAsset,
} from "./transferShared";

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
