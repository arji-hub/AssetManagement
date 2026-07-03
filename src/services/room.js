import { db } from "../services/firebase-config";
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
import { toLowerCase } from "../utils/TextCasing";
import { getName } from "./user";

export async function fetchRooms() {
  const snapshot = await getDocs(collection(db, "room"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
      assetCount: data.assetCount ?? 0,
    };
  });
}

export async function addRoom(data, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can register rooms.");
  }

  const normalizedName = toLowerCase(data.name);

  const payload = {
    name: data.name,
    assetCount: 0,

    // metadata
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  await setDoc(doc(db, "room", normalizedName), payload);

  return data.name;
}

export async function roomCount(room_id) {
  const roomRef = doc(db, "room", room_id);
  await updateDoc(roomRef, {
    assetCount: increment(1),
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
