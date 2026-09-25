//AssetManagement>src/services/qr.js
import QRCodeStyling from "qr-code-styling";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db, storage } from "./firebase-config";
import { ROLES } from "../data/roles";
import { fetchRoomName } from "./room";
import { fetchCategoryName } from "./category";

import CICTLogo from "../assets/logo/CICTLOGO.png";

const APP_BASE_URL = "https://ams-cict.web.app/asset/";
const QR_SIZE = 300;

export async function generateAssetQR(assetId) {
  if (!assetId) {
    throw new Error("Asset ID is required to generate a QR code.");
  }

  const url = `${APP_BASE_URL}${assetId}`;

  console.log("[QR] Starting browser generation:", {
    assetId,
    url,
  });

  const qrCode = new QRCodeStyling({
    width: QR_SIZE,
    height: QR_SIZE,
    type: "canvas",

    data: url,

    // logo of cict used
    image: CICTLogo,

    imageOptions: {
      margin: 1,
      imageSize: 0.5,
    },

    dotsOptions: {
      type: "dots",
      color: "#8a0100",
    },

    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#8a0100",
    },

    cornersDotOptions: {
      type: "dot",
      color: "#8a0100",
    },

    backgroundOptions: {
      color: "#ffffff",
    },
  });

  console.log("[QR] QRCodeStyling created:", assetId);

  const qrBlob = await qrCode.getRawData("png");

  if (!qrBlob || qrBlob.size === 0) {
    throw new Error(
      `QR generation returned an empty PNG for asset "${assetId}".`,
    );
  }

  console.log("[QR] PNG generated:", {
    assetId,
    bytes: qrBlob.size,
    type: qrBlob.type,
  });

  // Still upload the GENERATED QR code to Firebase Storage
  const filePath = `assets/qr/${assetId}.png`;
  const qrRef = ref(storage, filePath);

  const snapshot = await uploadBytes(qrRef, qrBlob, {
    contentType: "image/png",
  });

  const qrCodeUrl = await getDownloadURL(snapshot.ref);

  console.log("[QR] QR uploaded:", {
    assetId,
    path: filePath,
  });

  return qrCodeUrl;
}

/**
 * One-time fetch of every asset the current user is allowed to see, shaped
 * for the QR "Generate & Print" page. Scoping mirrors subscribeToAssets():
 *   admin      -> all assets
 *   fulltime   -> assets where property_custodian == uid
 *   parttime   -> assets where local_mr == uid
 *
 * `has_qr` is false while onAssetCreatedGenerateQR hasn't filled in
 * qr_code_url yet, so the UI can block selecting those assets.
 *
 * @param {string} role
 * @param {string} currentUserUid
 * @returns {Promise<Array<{
 *   id: string,
 *   description: string,
 *   serial_number: string|null,
 *   status: string|null,
 *   tracking_mode: string|null,
 *   category_id: string|null,
 *   category_name: string,
 *   room_id: string|null,
 *   room_name: string|null,
 *   property_custodian: string|null,
 *   local_mr: string|null,
 *   qr_code_url: string|null,
 *   has_qr: boolean,
 *   created_at: any,
 * }>>}
 */
export async function fetchAssetsQR(role, currentUserUid) {
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
  const assetData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  // ── resolve room + category names once per unique id ──
  const roomIds = [...new Set(assetData.map((a) => a.room_id).filter(Boolean))];
  const roomNameMap = {};
  await Promise.all(
    roomIds.map(async (roomId) => {
      try {
        roomNameMap[roomId] = await fetchRoomName(roomId);
      } catch {
        roomNameMap[roomId] = null;
      }
    }),
  );

  const categoryIds = [
    ...new Set(assetData.map((a) => a.category_id).filter(Boolean)),
  ];
  const categoryNameMap = {};
  await Promise.all(
    categoryIds.map(async (categoryId) => {
      try {
        categoryNameMap[categoryId] = await fetchCategoryName(categoryId);
      } catch {
        categoryNameMap[categoryId] = "---";
      }
    }),
  );

  const assets = assetData.map((asset) => ({
    id: asset.id,
    description: asset.description ?? "",
    serial_number: asset.serial_number ?? null,
    status: asset.status ?? null,
    tracking_mode: asset.tracking_mode ?? null,
    category_id: asset.category_id ?? null,
    category_name: categoryNameMap[asset.category_id] ?? "---",
    room_id: asset.room_id ?? null,
    room_name: roomNameMap[asset.room_id] ?? null,
    property_custodian: asset.property_custodian ?? null,
    local_mr: asset.local_mr ?? null,
    qr_code_url: asset.qr_code_url ?? null,
    has_qr: Boolean(asset.qr_code_url),
    created_at: asset.created_at ?? null,
  }));

  assets.sort((a, b) => {
    const aMillis = a.created_at?.toMillis?.() ?? 0;
    const bMillis = b.created_at?.toMillis?.() ?? 0;
    return bMillis - aMillis;
  });

  return assets;
}
