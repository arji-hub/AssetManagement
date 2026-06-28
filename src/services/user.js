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
import { toLowerCase } from "../utils/TextCasing";

const functions = getFunctions();

async function assetCount(uid) {
  const [custodianSnap, localMRSnap] = await Promise.all([
    getDocs(query(collection(db, "asset"), where("property_custodian", "==", uid))),
    getDocs(query(collection(db, "asset"), where("local_mr", "==", uid))),
  ]);

  const allIds = new Set([
    ...custodianSnap.docs.map((d) => d.id),
    ...localMRSnap.docs.map((d) => d.id),
  ]);

  return allIds.size; //total count
}

export async function fetchCustodians() {
  const q = query(collection(db, "user"), where("role", "!=", "admin"));
  const snapshot = await getDocs(q);

  const custodians = snapshot.docs.map((doc) => {
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

  const counts = await Promise.all(
    custodians.map(async (c) => ({
      id: c.id,
      asset_count: await assetCount(c.id),
    }))
  );

  const countMap = Object.fromEntries(counts.map((c) => [c.id, c.asset_count]));

  return custodians.map((c) => ({
    ...c,
    asset_count: countMap[c.id] ?? 0,
  }));
}

export async function findCustodian(identifier) {
  const trimmed = toLowerCase(identifier.trim());
  const col = collection(db, "user");

  let snap = await getDocs(query(col, where("user_name", "==", trimmed)));

  if (snap.empty) {
    snap = await getDocs(query(col, where("email", "==", trimmed)));
  }

  if (snap.empty) {
    throw new Error("Custodian not found.");
  }

  const docSnap = snap.docs[0];
  const d = docSnap.data();

  if (d.role === "admin") {
    throw new Error("This user is an admin, not a custodian.");
  }

  if (d.role === "parttime") {
    throw new Error("This user is only a part time faculty. Select another custodian");
  }

  const fullname = [d.first_name, d.middle_name, d.last_name]
    .filter(Boolean)
    .join(" ");

  const asset_count = await assetCount(docSnap.id);

  return {
    id: docSnap.id,
    username: d.user_name,
    email: d.email,
    fullname,
    role: d.role,
    asset_count,
  };
}

export async function addCustodian(custodianData) {
  const addCustodianFn = httpsCallable(functions, "addCustodian");
  const result = await addCustodianFn(custodianData);
  return result.data;
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

export async function fetchAssetsByCustodian(uid) {
  try {
    if (!uid) return [];

    const assetRef = collection(db, "asset");

    const [propertyCustodianSnap, localMrSnap] = await Promise.all([
      getDocs(query(assetRef, where("property_custodian", "==", uid))),
      getDocs(query(assetRef, where("local_mr", "==", uid))),
    ]);

    const seen = new Map();
    [...propertyCustodianSnap.docs, ...localMrSnap.docs].forEach((doc) => {
      if (!seen.has(doc.id)) {
        seen.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });

    const assetData = Array.from(seen.values());

    const userIds = [
      ...new Set(
        assetData.flatMap((a) =>
          [a.property_custodian, a.local_mr].filter(Boolean),
        ),
      ),
    ];

    const userDocs = await Promise.all(
      userIds.map((id) => getDoc(doc(db, "user", id))),
    );

    const userMap = {};
    userDocs.forEach((d) => {
      if (d.exists()) {
        userMap[d.id] = d.data().user_name;
      }
    });

    return assetData.map((asset) => ({
      ...asset,
      property_custodian_name: userMap[asset.property_custodian] || "Unknown",
      local_mr_name: userMap[asset.local_mr] || "Unknown",
    }));
  } catch (err) {
    console.error("fetchAssetsByCustodian error:", err);
    throw err;
  }
}


export async function getName(uid) {
  if (!uid) return null;
  const docSnap = await getDoc(doc(db, "user", uid));
  if (!docSnap.exists()) return null;
  const d = docSnap.data();

  return {
    username: d.user_name,
    firstname: d.first_name,
    fullname: [d.first_name, d.middle_name, d.last_name].filter(Boolean).join(" "),
  };
}


