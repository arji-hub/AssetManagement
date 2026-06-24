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
import { categoryCount } from "./category";
import { roomCount } from "./room";
import QRCodeStyling from "qr-code-styling";
import CICTLogo from "../assets/CICTLOGO.png";
import { toLowerCase } from "../utils/TextCasing";

export async function fetchAssets(role, currentUserUid) {
  const assetsRef = collection(db, "asset");

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
    userIds.map((uid) => getDoc(doc(db, "user", uid))),
  );

  const userMap = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      userMap[d.id] = d.data().first_name;
    }
  });

  const fullname = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      const data = d.data();
      fullname[d.id] = [data.first_name, data.middle_name, data.last_name]
        .filter(Boolean)
        .join(" ");
    }
  });

  const assets = assetData.map((asset) => ({
    ...asset,
    property_custodian_name: userMap[asset.property_custodian] || "---",
    //fetch fullname first_name,middle_name,last_name
    property_custodian_fullname:
      fullname[asset.property_custodian] || "---",
    local_mr_name: userMap[asset.local_mr] || "---",
    local_mr_fullname: fullname[asset.property_custodian] || "---",
  }));

  return assets;
}

export async function fetchAssetByID(assetId) {
  const assetRef = doc(db, "asset", assetId);

  const assetSnap = await getDoc(assetRef);

  if (!assetSnap.exists()) {
    throw new Error(`Asset with ID "${assetId}" not found.`);
  }

  const assetData = { id: assetSnap.id, ...assetSnap.data() };

  const userIds = [assetData.property_custodian, assetData.local_mr].filter(
    Boolean,
  );

  const userDocs = await Promise.all(
    userIds.map((uid) => getDoc(doc(db, "user", uid))),
  );

  const userMap = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      userMap[d.id] = d.data().first_name;
    }
  });

  return {
    ...assetData,
    property_custodian_name: userMap[assetData.property_custodian] || "Unknown",
    local_mr_name: userMap[assetData.local_mr] || "Unknown",
  };
}

const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};

const generateAssetId = async () => {
  const snapshot = await getDocs(collection(db, "asset")); // ← changed

  if (snapshot.empty) return "cict-1001";

  const highest = snapshot.docs.reduce((max, doc) => {
    const num = parseInt(doc.id.replace("cict-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 1000);

  return `cict-${highest + 1}`;
};

const generateQR = async (assetId) => {
  const url = `https://ams-cict.web.app/asset/${assetId}`;

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,

    dotsOptions: {
      type: "extra-rounded",
      gradient: {
        type: "radial",
        colorStops: [
          { offset: 0, color: "#f5aa2c" },
          { offset: 1, color: "#860100" },
        ],
      },
    },

    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#860100",
    },

    cornersDotOptions: {
      type: "dot",
      color: "#f5aa2c",
    },

    backgroundOptions: {
      color: "#ffffff",
    },

    imageOptions: {
      crossOrigin: "anonymous",
      margin: 6,
      imageSize: 0.3,
    },

    image: CICTLogo,
  });

  const tempDiv = document.createElement("div");
  qrCode.append(tempDiv);

  await new Promise((r) => setTimeout(r, 100));

  const canvas = tempDiv.querySelector("canvas");
  return canvas.toDataURL("image/png");
};

export async function addAsset(data, role) {
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
    asset_id: assetId,
    serial_number: data.serial_number || null,
    category_id: data.category_id,
    description: data.description,
    date_acquired: data.date_acquired,
    unit_value: parseFloat(data.unit_value),
    qty: parseInt(data.qty, 10),
    status: "Working",
    remarks: data.remarks || null,
    asset_image_url: assetImageUrl || null,
    doc_image_url: docImageUrl || null,
    qr_code_url: qrCodeUrl || null,
    property_custodian: data.primary_custodian || null,
    local_mr: data.local_custodian || null,
    room_id: data.room_id || null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  const countUpdates = [categoryCount(data.category_id)];
  if (data.room_id) {
    countUpdates.push(roomCount(data.room_id));
  }
  await Promise.all(countUpdates);

  return assetId;
}

export async function isSerialNumberExist(serialNumber) {
  if (!serialNumber || !toLowerCase(serialNumber)) return false;

  const normalizedInput = toLowerCase(serialNumber);
  const snapshot = await getDocs(collection(db, "asset"));

  return snapshot.docs.some((doc) => {
    const existing = doc.data().serial_number;
    return existing && toLowerCase(existing) === normalizedInput;
  });
}