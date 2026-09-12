import { db, auth } from "./firebase-config";
import { ROLES } from "../data/roles"; // adjust path to wherever ROLES actually lives
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  runTransaction,
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

/* ---------------------------------------------------------
   Admin guard
   Client-side check only — this makes the write CRUD unusable
   from the UI for non-admins, but it is NOT a substitute for
   Firestore security rules, which must enforce the same rule
   server-side (a user can still call the SDK directly).
--------------------------------------------------------- */
async function assertAdmin() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("You must be signed in to manage categories.");
  }

  const userSnap = await getDoc(doc(db, "user", currentUser.uid));
  const role = userSnap.data()?.role;

  if (role !== ROLES.ADMIN) {
    throw new Error("Only admins can manage categories.");
  }
}

/* ---------------------------------------------------------
   CRUD — category name is the document id, so "renaming"
   means creating a new doc and removing the old one.
--------------------------------------------------------- */

export async function addCategory(name) {
  await assertAdmin();

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Category name is required.");
  }

  const categoryRef = doc(db, "category", trimmed);
  const existing = await getDoc(categoryRef);
  if (existing.exists()) {
    throw new Error("A category with this name already exists.");
  }

  await setDoc(categoryRef, { assetCount: 0 });
  return { id: trimmed, name: trimmed, assetCount: 0 };
}

export async function renameCategory(oldName, newName) {
  await assertAdmin();

  const trimmed = newName.trim();
  if (!trimmed) {
    throw new Error("Category name is required.");
  }
  if (trimmed === oldName) {
    return { id: oldName, name: oldName };
  }

  const oldRef = doc(db, "category", oldName);
  const newRef = doc(db, "category", trimmed);

  await runTransaction(db, async (transaction) => {
    const [oldSnap, newSnap] = await Promise.all([
      transaction.get(oldRef),
      transaction.get(newRef),
    ]);

    if (!oldSnap.exists()) {
      throw new Error("This category no longer exists.");
    }
    if (newSnap.exists()) {
      throw new Error("A category with this name already exists.");
    }

    transaction.set(newRef, { assetCount: oldSnap.data().assetCount ?? 0 });
    transaction.delete(oldRef);
  });

  return { id: trimmed, name: trimmed };
}

export async function deleteCategory(name) {
  await assertAdmin();

  const categoryRef = doc(db, "category", name);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(categoryRef);
    if (!snap.exists()) {
      return;
    }

    if ((snap.data().assetCount ?? 0) !== 0) {
      throw new Error("Only categories with no assets can be deleted.");
    }

    transaction.delete(categoryRef);
  });
}
