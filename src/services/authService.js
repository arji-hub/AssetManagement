import { auth, db } from "./firebase-config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const login = async (email, password) => {
  console.log("1. starting login");
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  console.log("2. auth success");
  const user = userCredential.user;
  console.log("3. user uid:", user.uid);
  const userDoc = await getDoc(doc(db, "users", user.uid));
  console.log("4. doc fetched");
  console.log("5. doc exists:", userDoc.exists());
  if (!userDoc.exists()) {
    throw new Error("User record not found in database.");
  }

  const data = userDoc.data();
  console.log("6. user data:", data);
  return {
    user,
    role: data.role,
    userInfo: {
      email: data.email,
      username: data.username,
      firstname: data.firstname,
      middlename: data.middlename,
      lastname: data.lastname,
    },
  };
};

export const logout = async () => {
  await signOut(auth);
};
