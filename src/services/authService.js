import { auth, db } from "./firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists()) {
    throw new Error("User record not found in database.");
  }

  const data = userDoc.data();
  return {
    user,
    role: data.role,
    userInfo: {
      email: data.email,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
    },
  };
};

export const logout = async () => {
  await signOut(auth);
};
