import { db } from "./firebase-config";
import { collection, doc, getDocs, updateDoc, increment } from "firebase/firestore";

export async function fetchCategories() {
  const snapshot = await getDocs(collection(db, "categories"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.id,
    assetCount: doc.data().assetCount ?? 0,
  }));
}

export async function categoryCount(category_id) {
  const categoryRef = doc(db, "categories", category_id);
  await updateDoc(categoryRef, {
    assetCount: increment(1),
  });
}