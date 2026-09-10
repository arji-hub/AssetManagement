import { db, storage } from "./firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { ROLES } from "../data/roles";
import { useAuth } from "../context/AuthContext";
import QRCode from "qrcode";
import { categoryCount } from "./category";
import { roomCount } from "./room";
import QRCodeStyling from "qr-code-styling";
import CICTLogo from "../assets/logo/CICTLOGO.png";
import { toLowerCase, toTitleCase } from "../utils/TextCasing";
import {
  logInitialCustodianAssignment,
  logInitialRoomAssignment,
} from "./transfer";

export function subscribeToAssets(role, currentUserUid, callback, onError) {
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

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      try {
        const assetData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
        const fullname = {};
        userDocs.forEach((d) => {
          if (d.exists()) {
            const data = d.data();
            userMap[d.id] = data.first_name;
            fullname[d.id] = [data.first_name, data.middle_name, data.last_name]
              .filter(Boolean)
              .join(" ");
          }
        });

        const assets = assetData.map((asset) => ({
          ...asset,
          property_custodian_name: userMap[asset.property_custodian] || "---",
          property_custodian_fullname:
            fullname[asset.property_custodian] || "---",
          local_mr_name: userMap[asset.local_mr] || "---",
          local_mr_fullname: fullname[asset.property_custodian] || "---",
        }));

        assets.sort((a, b) => {
          const aMillis = a.created_at?.toMillis?.() ?? 0;
          const bMillis = b.created_at?.toMillis?.() ?? 0;
          return bMillis - aMillis;
        });

        callback(assets);
      } catch (err) {
        onError?.(err);
      }
    },
    (err) => {
      onError?.(err);
    },
  );

  return unsubscribe;
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
  const usernameMap = {};
  userDocs.forEach((d) => {
    if (d.exists()) {
      const data = d.data();
      const fullname = [data.first_name, data.middle_name, data.last_name]
        .filter(Boolean)
        .join(" ");
      userMap[d.id] = fullname;
      usernameMap[d.id] = data.user_name;
    }
  });

  return {
    ...assetData,
    category: assetData.category_id,
    name: userMap[assetData.property_custodian],
    property_custodian_name: userMap[assetData.property_custodian] || "---",
    property_custodian_username:
      usernameMap[assetData.property_custodian] || "---",
    local_mr_name: userMap[assetData.local_mr] || "---",
    local_mr_username: usernameMap[assetData.local_mr] || "---",
  };
}

const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};

const generateAssetId = async () => {
  const counterRef = doc(db, "counters", "asset");
  return await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const next = (counter.data()?.count ?? 0) + 1;

    transaction.set(counterRef, { count: next }, { merge: true });

    return `cict-${1000 + next}`;
  });
};

const generateQR = async (assetId) => {
  const url = `https://ams-cict.web.app/asset/${assetId}`;

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,

    dotsOptions: {
      type: "rounded",
      color: "#860100",
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
      margin: 1,
      imageSize: 0.6,
    },

    image: CICTLogo,
  });

  const tempDiv = document.createElement("div");
  qrCode.append(tempDiv);

  await new Promise((r) => setTimeout(r, 100));

  const canvas = tempDiv.querySelector("canvas");
  return canvas.toDataURL("image/png");
};

// fields that differ by acquisition type — shared across every record in a batch
function acquisitionFields(data) {
  const isDonated = data.acquisition_type === "donated";
  return {
    acquisition_type: data.acquisition_type,
    cost: isDonated ? null : parseFloat(data.unit_value),
    donated_by: isDonated ? data.donated_by || null : null,
  };
}

export async function addAsset(data, role, requestedBy) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can register assets.");
  }

  const qty = parseInt(data.qty, 10) || 1;
  const isIndividual = data.tracking_mode === "individual" && qty > 1;
  const recordCount = isIndividual ? qty : 1;
  const isDonated = data.acquisition_type === "donated";

  // one shared upload for the whole submission — a batch reuses these URLs
  // across every generated record instead of re-uploading per unit
  const batchId = recordCount > 1 ? `batch_${Date.now()}` : null;
  const uploadKey = batchId || "pending"; // placeholder path for the single-record case

  const [assetImageUrl, docImageUrl] = await Promise.all([
    uploadImage(data.assetImageFile, `assets/${uploadKey}/asset-image`),
    uploadImage(
      data.docImageFile,
      `assets/${uploadKey}/${isDonated ? "deed-of-donation" : "asset-document"}`,
    ),
  ]);

  const docUrlFields = isDonated
    ? { par_ics_doc_url: null, donation_form_url: docImageUrl }
    : { par_ics_doc_url: docImageUrl, donation_form_url: null };

  const records = await Promise.all(
    Array.from({ length: recordCount }, async () => {
      const assetId = await generateAssetId();
      const qrCodeUrl = await generateQR(assetId);
      return { assetId, qrCodeUrl };
    }),
  );

  const basePayload = {
    serial_number: data.serial_number || null,
    category_id: data.category_id,
    description: data.description,
    date_acquired: data.date_acquired,
    ...acquisitionFields(data),
    qty: isIndividual ? 1 : qty, // individual records are 1 unit each; single_bulk keeps the full qty
    tracking_mode: isIndividual ? "individual" : "single_bulk",
    batch_id: batchId,
    status: "Working",
    remarks: data.remarks || null,
    asset_image_url: assetImageUrl || null,
    ...docUrlFields,
    property_custodian: data.primary_custodian || null,
    local_mr: null,
    room_id: data.room_id || null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  // ── create the asset docs first ──
  await Promise.all(
    records.map(({ assetId, qrCodeUrl }) =>
      setDoc(doc(db, "asset", assetId), {
        ...basePayload,
        asset_id: assetId,
        qr_code_url: qrCodeUrl || null,
      }),
    ),
  );

  // ── then log the initial assignment history, now that the assets exist ──
  await Promise.all(
    records.map(({ assetId }) =>
      Promise.all([
        data.primary_custodian
          ? logInitialCustodianAssignment(
              {
                asset_id: assetId,
                asset_description: data.description,
                custodian_uid: data.primary_custodian,
              },
              requestedBy,
            )
          : null,
        data.room_id
          ? logInitialRoomAssignment(
              {
                asset_id: assetId,
                asset_name: data.description,
                room_id: data.room_id,
              },
              requestedBy.uid,
            )
          : null,
      ]),
    ),
  );

  const countUpdates = records.flatMap(() => [
    categoryCount(data.category_id),
    ...(data.room_id ? [roomCount(data.room_id)] : []),
  ]);
  await Promise.all(countUpdates);

  return records.map((r) => r.assetId);
}

export async function updateAssetStatus(assetId, status) {
  const assetRef = doc(db, "asset", assetId);
  await updateDoc(assetRef, {
    status: toTitleCase(status),
    updated_at: serverTimestamp(),
  });
}

export async function updateAssetRoom(assetId, room) {
  const docRef = doc(db, "asset", assetId);
  await updateDoc(docRef, {
    room_id: room,
  });
}
