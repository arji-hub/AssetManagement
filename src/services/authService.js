import { auth, db } from "./firebase-config";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  linkWithPopup,
  unlink,
  OAuthProvider,
  GoogleAuthProvider,
  deleteUser,
  signOut,
  getAuth,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function login(email, password) {
  if (email.trim() === "" || password.trim() === "") {
    throw new Error("Email and password cannot be empty.");
  }

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

const microsoftProvider = new OAuthProvider("microsoft.com");
microsoftProvider.setCustomParameters({
  tenant: import.meta.env.VITE_MS_TENANT_ID,
  prompt: "select_account",
});

const googleProvider = new GoogleAuthProvider();

export async function loginWithMicrosoft() {
  const userCredential = await signInWithPopup(auth, microsoftProvider);

  const userDoc = await getDoc(doc(db, "user", userCredential.user.uid));
  if (!userDoc.exists()) {
    await deleteUser(userCredential.user);
    throw new Error(
      "Microsoft account is not linked to a user record. Please contact the administrator.",
    );
  }

  const data = userDoc.data();
  return { role: data.role };
}

export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);

  const userDoc = await getDoc(doc(db, "user", userCredential.user.uid));
  if (!userDoc.exists()) {
    await deleteUser(userCredential.user);
    throw new Error(
      "Google account is not linked to a user record. Please contact the administrator.",
    );
  }

  const data = userDoc.data();
  return { role: data.role };
}

export async function logout() {
  await signOut(auth);
}

//acc linking--

export function getLinkedProviders() {
  if (!auth.currentUser) return [];
  return auth.currentUser.providerData.map((p) => ({
    providerId: p.providerId,
    email: p.email,
  }));
}

export async function linkMicrosoftAccount() {
  if (!auth.currentUser) {
    throw new Error("You must be signed in to link an account.");
  }
  const result = await linkWithPopup(auth.currentUser, microsoftProvider);
  return result.user;
}

export async function linkGoogleAccount() {
  if (!auth.currentUser) {
    throw new Error("You must be signed in to link an account.");
  }
  const result = await linkWithPopup(auth.currentUser, googleProvider);
  return result.user;
}

export async function unlinkProvider(providerId) {
  if (!auth.currentUser) {
    throw new Error("You must be signed in to unlink an account.");
  }
  await unlink(auth.currentUser, providerId);
}

//reset password
export async function resetPassword(email) {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}
