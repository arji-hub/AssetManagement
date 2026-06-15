import { db, storage } from "./firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { ROLES } from "../data/roles";
import { useAuth } from "../context/AuthContext";
import QRCode from "qrcode";

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

export const fetchAssetByID = async (assetId) => {
  const assetRef = doc(db, "assets", assetId);
  const assetSnap = await getDoc(assetRef);

  if (!assetSnap.exists()) {
    throw new Error(`Asset with ID "${assetId}" not found.`);
  }

  const assetData = { id: assetSnap.id, ...assetSnap.data() };

  const userIds = [assetData.property_custodian, assetData.local_mr].filter(
    Boolean,
  );

  const userDocs = await Promise.all(
    userIds.map((uid) => getDoc(doc(db, "users", uid))),
  );

  const userMap = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      userMap[d.id] = d.data().user_name;
    }
  });

  return {
    ...assetData,
    property_custodian_name: userMap[assetData.property_custodian] || "Unknown",
    local_mr_name: userMap[assetData.local_mr] || "Unknown",
  };
};

async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

async function generateAssetId() {
  const snapshot = await getDocs(collection(db, "assets"));

  if (snapshot.empty) return "cict-1001";

  const highest = snapshot.docs.reduce((max, doc) => {
    const num = parseInt(doc.id.replace("cict-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 1000);

  return `cict-${highest + 1}`;
}

async function generateQR(assetId) {
  const url = `http://localhost:8080/asset/${assetId}`;
  const qrDataUrl = await QRCode.toDataURL(url, { width: 300 });
  return qrDataUrl; // "data:image/png;base64,iVBORw0KGgo..."
}

export const addAsset = async (data, role) => {
  console.log("role: " + role);
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can register assets.");
  }
  const assetId = await generateAssetId();

  const [assetImageUrl, docImageUrl, qrCodeUrl] = await Promise.all([
    uploadImage(data.assetImageFile, `assets/${assetId}/asset-image`),
    uploadImage(data.docImageFile, `assets/${assetId}/asset-document`),
    generateQR(assetId),
  ]);

  const payload = {
    // identifier
    asset_id: assetId,

    // basic info (Step 1)
    serial_number: data.serial_number || null,
    category_id: data.category_id,
    description: data.description,
    date_acquired: data.date_acquired,
    unit_value: parseFloat(data.unit_value),
    qty: parseInt(data.qty, 10),
    status: "Working",
    remarks: data.remarks || null,

    // media (Step 2)
    asset_image_url: assetImageUrl || null,
    doc_image_url: docImageUrl || null,
    qr_code_url: qrCodeUrl || null,

    // assignment (Step 3)
    property_custodian: data.primary_custodian || null,
    local_mr: data.local_custodian || null,
    room_id: data.room_id || null,

    // metadata
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  await setDoc(doc(db, "assets", assetId), payload);

  return assetId;
};
