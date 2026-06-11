import { db } from "../services/firebase-config";
import { collection, doc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";

export async function fetchRooms() {
  const snapshot = await getDocs(collection(db, "rooms"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.id,
    assetCount: doc.data().assetCount ?? 0,
  }));
}

export async function addRoom(data, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can register rooms.");
  }

  const payload = {
    assetCount: 0,

    // metadata
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  await setDoc(doc(db, "rooms", data.name), payload);

  return data.name;
}