// src/services/assetService.js
import { db } from "./firebase-config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
export const fetchAssets = async (role, currentUserUid) => {
  const assetsRef = collection(db, "assets");

  let q;
  if (role === "admin") {
    q = query(assetsRef, orderBy("date_acquired", "desc"));
  } else {
    // faculty: only their own assets
    q = query(
      assetsRef,
      where("property_custodian", "==", currentUserUid),
      orderBy("date_acquired", "desc"),
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
