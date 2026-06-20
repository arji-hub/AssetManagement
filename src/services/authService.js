import { auth, db } from "./firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const userDoc = await getDoc(doc(db, "user", userCredential.user.uid));
  if (!userDoc.exists()) throw new Error("User record not found in database.");

  const data = userDoc.data();
  return { role: data.role };
}
