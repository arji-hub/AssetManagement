import { db } from "./firebase-config";
import { collection, doc, getDocs } from "firebase/firestore";

export async function fetchCategories() {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.id,
    assetCount: doc.data().assetCount ?? 0,
  }));
}