import { db } from "./firebase-config";
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  doc,
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

  //console log in json format
  console.log("Fetched assetData:", JSON.stringify(assetData, null, 2));

  //fetch user names for custodian and local MR
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
