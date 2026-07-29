import { db } from "./firebase-config";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";

export function subscribeToCategories(callback, onError) {
  const unsubscribe = onSnapshot(
    collection(db, "category"),
    (snapshot) => {
      try {
        const categories = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.id,
          assetCount: doc.data().assetCount ?? 0,
        }));
        callback(categories);
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

export async function fetchCategories() {
  const snapshot = await getDocs(collection(db, "category"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.id,
    assetCount: doc.data().assetCount ?? 0,
  }));
}

export async function categoryCount(category_id) {
  const categoryRef = doc(db, "category", category_id);
  await updateDoc(categoryRef, {
    assetCount: increment(1),
  });
}
