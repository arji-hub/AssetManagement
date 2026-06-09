import { db } from "./firebase-config";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ROLES } from "../data/roles";


export const fetchAssets = async (role, currentUserUid) => {
  const assetsRef = collection(db, "assets");

  let q;
  if (role === ROLES.ADMIN) {
    q = query(assetsRef, orderBy("date_acquired", "desc"));
  } else if (role === ROLES.PARTTIME) {
    q = query(assetsRef, where("local_mr", "==", currentUserUid));
  } else if (role === ROLES.FULLTIME) {
    q = query(assetsRef, where("property_custodian", "==", currentUserUid));
  } else {
    throw new Error("Invalid user role: " + role);
  }
  const snapshot = await getDocs(q);

  const assetData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log("Fetched assetData:", JSON.stringify(assetData, null, 2));

  const userIds = [
    ...new Set(
      assetData.flatMap((a) =>
        [a.property_custodian, a.local_mr].filter(Boolean),
      ),
    ),
  ];

  const userDocs = await Promise.all(
    userIds.map((uid) => getDoc(doc(db, "users", uid))),
  );

  const userMap = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      userMap[d.id] = d.data().user_name;
    }
  });

  const assets = assetData.map((asset) => ({
    ...asset,
    property_custodian_name: userMap[asset.property_custodian] || "Unknown",
    local_mr_name: userMap[asset.local_mr] || "Unknown",
  }));

  return assets;
};



// ── fetch single asset ────────────────────────────────────────────────────────
export const fetchAssetById = async (assetId) => {
  const snap = await getDoc(doc(db, "assets", assetId));
  if (!snap.exists()) throw new Error("Asset not found.");
  return { id: snap.id, ...snap.data() };
};

// ── add new asset ─────────────────────────────────────────────────────────────
export const addAsset = async (data) => {
  const ref = await addDoc(collection(db, "assets"), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return ref.id;
};

// ── update existing asset ─────────────────────────────────────────────────────
export const updateAsset = async (assetId, data) => {
  const ref = doc(db, "assets", assetId);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
};

// ── delete asset ──────────────────────────────────────────────────────────────
export const deleteAsset = async (assetId) => {
  await deleteDoc(doc(db, "assets", assetId));
};
