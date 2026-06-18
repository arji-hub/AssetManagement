import { db } from "../services/firebase-config";
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();

export async function fetchCustodians() {
  const q = query(collection(db, "user"), where("role", "!=", "admin"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const d = doc.data();

    const fullname = [d.first_name, d.middle_name, d.last_name]
      .filter(Boolean)
      .join(" ");

    return {
      id: doc.id,
      username: d.user_name,
      fullname,
      role: d.role,
    };
  });
}

export async function addCustodian(custodianData) {
  const addCustodianFn = httpsCallable(functions, "addCustodian");
  const result = await addCustodianFn(custodianData);
  return result.data; // { uid }
}

export async function checkUsernameAvailable(username) {
  if (!username) return true;

  const normalized = username.toLowerCase().replace(/\s+/g, "");

  const q = query(collection(db, "user"), where("user_name", "==", normalized));

  const snapshot = await getDocs(q);
  return snapshot.empty; // true = available, false = taken
}

export async function checkEmailAvailable(email) {
  if (!email) return true;

  const normalized = email.toLowerCase().trim();

  const q = query(collection(db, "user"), where("email", "==", normalized));

  const snapshot = await getDocs(q);
  return snapshot.empty; // true = available, false = taken
}

export async function updateProfile(uid, profileData) {
  const normalized_user_name = profileData.username
    ? profileData.username.toLowerCase().replace(/\s+/g, "")
    : profileData.username;

  const userRef = doc(db, "user", uid);

  await updateDoc(userRef, {
    first_name: profileData.firstname,
    middle_name: profileData.middlename || "_",
    last_name: profileData.lastname,
    user_name: normalized_user_name,
  });
  return { uid, user_name: normalized_user_name };
}

export const attachCustodianNames = async (assetData) => {
  const list = Array.isArray(assetData) ? assetData : [assetData];

  const userIds = [
    ...new Set(
      list.flatMap((a) => [a.property_custodian, a.local_mr].filter(Boolean)),
    ),
  ];

  const userDocs = await Promise.all(
    userIds.map((uid) => getDoc(doc(db, "user", uid))),
  );

  const userMap = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      userMap[d.id] = d.data().first_name;
    }
  });

  const withNames = list.map((asset) => ({
    ...asset,
    property_custodian_name: userMap[asset.property_custodian] || "Unknown",
    local_mr_name: userMap[asset.local_mr] || "Unknown",
  }));

  return Array.isArray(assetData) ? withNames : withNames[0];
};
