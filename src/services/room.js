import { db } from "./firebase-config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  where,
  query,
} from "firebase/firestore";
import { toLowerCase, toSlug } from "../utils/TextCasing";
import { getName } from "./user";

async function computeTopCustodian(assets) {
  if (!assets || assets.length === 0) return "No Assets";

  const counts = new Map();
  assets.forEach((asset) => {
    const uid = asset.property_custodian || asset.local_mr || "Unassigned";
    counts.set(uid, (counts.get(uid) ?? 0) + 1);
  });

  let best = null;
  for (const [uid, count] of counts) {
    if (!best || count > best.count) best = { uid, count };
  }

  if (!best || best.uid === "Unassigned") return "Unassigned";

  try {
    const name = await getName(best.uid);
    return name?.fullname || "Unassigned";
  } catch (err) {
    console.error("getName failed for uid", best.uid, err);
    return "Unassigned";
  }
}

export async function fetchRooms() {
  const snapshot = await getDocs(collection(db, "room"));

  const rooms = await Promise.all(
    snapshot.docs.map(async (roomDoc) => {
      const data = roomDoc.data();
      const assetsSnapshot = await getDocs(
        query(collection(db, "asset"), where("room_id", "==", roomDoc.id)),
      );
      const assets = assetsSnapshot.docs.map((a) => a.data());

      const topCustodian = await computeTopCustodian(assets);

      return {
        id: roomDoc.id,
        name: data.name,
        assetCount: data.assetCount ?? 0,
        roomCustodian: topCustodian || "",
        last_audited_at: data.last_audited_at,
        status: data.status ?? "active",
      };
    }),
  );
  return rooms;
}

export function subscribeToRooms(callback, onError) {
  const unsubscribe = onSnapshot(
    collection(db, "room"),
    (snapshot) => {
      try {
        const rooms = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            assetCount: data.assetCount ?? 0,
          };
        });
        callback(rooms);
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => {
      onError?.(err);
    },
  );

  return unsubscribe;
}

const roomNameCache = new Map();

export async function fetchRoom(id) {
  const roomID = toLowerCase(id);
  const snap = await getDoc(doc(db, "room", roomID));
  if (!snap.exists()) throw new Error("Room not found.");

  const data = snap.data();

  return {
    id: snap.id,
    name: data.name,
    assetCount: data.assetCount ?? 0,
    last_audited_at: data.last_audited_at ?? null,
    status: data.status ?? "active",
  };
}

export async function resolveRoomName(roomID) {
  if (!roomID) return null;
  if (roomNameCache.has(roomID)) return roomNameCache.get(roomID);

  try {
    const room = await fetchRoom(roomID);
    roomNameCache.set(roomID, room.name);
    return room.name;
  } catch (err) {
    roomNameCache.set(roomID, roomID);
    return roomID;
  }
}

export async function addRoom(data, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can register rooms.");
  }

  if (!data.name?.trim()) {
    throw new Error("Room name is required.");
  }

  const normalizedName = toSlug(data.name);
  const roomRef = doc(db, "room", normalizedName);

  const existing = await getDoc(roomRef);
  if (existing.exists()) {
    throw new Error(`Room "${data.name}" already exists.`);
  }

  const payload = {
    name: data.name,
    assetCount: 0,
    last_audited_at: null,

    // metadata
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  await setDoc(roomRef, payload);

  return data.name;
}

export async function roomCount(room_id, direction = "increment") {
  const roomRef = doc(db, "room", room_id);
  const delta = direction === "decrement" ? -1 : 1;

  await updateDoc(roomRef, {
    assetCount: increment(delta),
  });
}

export function subscribeToAssetsInRoom(room_id, callback, onError) {
  if (!room_id) {
    callback([]);
    return () => {};
  }

  const assetRef = collection(db, "asset");
  const assetQuery = query(assetRef, where("room_id", "==", room_id));

  const unsubscribe = onSnapshot(
    assetQuery,
    async (snapshot) => {
      try {
        const assetData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userIds = [
          ...new Set(
            assetData.map((a) => a.property_custodian).filter(Boolean),
          ),
        ];

        const fullnameMap = {};
        await Promise.all(
          userIds.map(async (uid) => {
            const name = await getName(uid);
            fullnameMap[uid] = name?.fullname ?? "---";
          }),
        );

        const assets = assetData.map((asset) => ({
          id: asset.id,
          description: asset.description,
          serial_number: asset.serial_number,
          category: asset.category_id,
          name: fullnameMap[asset.property_custodian] ?? "---",
          status: asset.status,
          date: asset.date_acquired,
        }));

        callback(assets);
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => {
      onError?.(err);
    },
  );

  return unsubscribe;
}

export async function fetchRoomsByLastAudited(newestFirst, count) {
  const rooms = await fetchRooms();

  rooms.sort((a, b) => {
    const aTime = a.last_audited_at ?? null;
    const bTime = b.last_audited_at ?? null;

    // rooms never audited (null) always sink to the bottom, regardless of direction
    if (aTime === null && bTime === null) return 0;
    if (aTime === null) return 1;
    if (bTime === null) return -1;

    const aMillis = aTime.toMillis
      ? aTime.toMillis()
      : new Date(aTime).getTime();
    const bMillis = bTime.toMillis
      ? bTime.toMillis()
      : new Date(bTime).getTime();

    return newestFirst ? bMillis - aMillis : aMillis - bMillis;
  });

  return rooms.slice(0, count);
}

export async function editRoom(roomID, newName, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can edit rooms.");
  }

  const trimmedName = newName?.trim();
  if (!trimmedName) {
    throw new Error("Room name cannot be empty.");
  }

  const roomRef = doc(db, "room", roomID);

  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error("Room not found.");
  }

  await updateDoc(roomRef, {
    name: trimmedName,
    updated_at: serverTimestamp(),
  });
}

export async function archiveRoom(roomID, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can archive rooms.");
  }

  const roomRef = doc(db, "room", roomID);

  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error("Room not found.");
  }

  const roomData = roomSnap.data();
  if (roomData.assetCount > 0) {
    throw new Error(
      `Cannot archive "${roomData.name}": ${roomData.assetCount} asset(s) still assigned to this room.`,
    );
  }

  await updateDoc(roomRef, {
    status: "inactive",
    updated_at: serverTimestamp(),
  });
}

export async function restoreRoom(roomID, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can restore rooms.");
  }

  const roomRef = doc(db, "room", roomID);

  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) {
    throw new Error("Room not found.");
  }

  const roomData = roomSnap.data();
  if (roomData.status === "active") {
    throw new Error(`"${roomData.name}" is already active.`);
  }

  await updateDoc(roomRef, {
    status: "active",
    updated_at: serverTimestamp(),
  });
}
