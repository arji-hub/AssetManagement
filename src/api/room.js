import { db } from "../services/firebase-config";
import { collection, getDocs } from "firebase/firestore";

export async function fetchRooms() {
  const snapshot = await getDocs(collection(db, "rooms"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name ?? doc.id,
    assetCount: doc.data().assetCount ?? 0,
  }));
}
