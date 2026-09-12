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

/**
 * Reserves a contiguous block of `count` asset IDs in a single transaction.
 *
 * This replaces the old per-record `generateAssetId()` transaction. When a
 * batch registers many records at once (e.g. a qty:5 individually-tracked
 * item, or several line items in one acquisition), calling a transaction
 * once per record fires many concurrent reads/writes against the same
 * `counters/asset` doc. Firestore transactions use optimistic concurrency
 * control, so under that much contention some of them exhaust their retries
 * and fail with:
 *   "the stored version (...) does not match the required base version (...)"
 *
 * Reserving the whole block up front means only ONE transaction touches the
 * counter document per batch, eliminating the race entirely.
 *
 * @param {number} count  how many IDs to reserve
 * @returns {Promise<string[]>} array of `count` unique asset IDs, in order
 */
async function reserveAssetIds(count) {
  if (count <= 0) return [];

  const counterRef = doc(db, "counters", "asset");

  const startCount = await runTransaction(db, async (transaction) => {
    const counter = await transaction.get(counterRef);
    const current = counter.data()?.count ?? 0;

    transaction.set(counterRef, { count: current + count }, { merge: true });

    return current;
  });

  return Array.from(
    { length: count },
    (_, i) => `cict-${1000 + startCount + i + 1}`,
  );
}

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

/**
 * Registers every line item belonging to one acquisition event (a single
 * donation or a single purchase/PO) as separate asset docs, all sharing
 * acquisition_id, acquisition_type, date_acquired, donor/supplier, and the
 * one doc-image upload (deed of donation / PAR-ICS) — matching the shared
 * batch_id pattern that already existed for a single bulk registration,
 * just widened to cover a batch of *different* items instead of identical
 * copies of one item.
 *
 * All asset IDs needed for the entire batch (across every item and every
 * individually-tracked unit within an item) are reserved together in a
 * single transaction via `reserveAssetIds`, then handed out to each item.
 * This is what keeps the whole batch save down to one write against the
 * `counters/asset` doc instead of one per asset.
 *
 * @param {object} acquisitionInfo  { acquisition_type, date_acquired, donated_by, supplier, po_reference }
 * @param {File} docImageFile       Deed of Donation / PAR-ICS file, uploaded once
 * @param {Array} items             line items, each shaped like the old per-registration `data`
 *                                  plus `assetImage: {file, preview}`
 * @param {string} role
 * @param {object} requestedBy      { uid, name, role }
 * @returns {Promise<string[]>}     flat array of every asset_id created
 */
export async function addAcquisitionBatch(
  acquisitionInfo,
  docImageFile,
  items,
  role,
  requestedBy,
) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can register assets.");
  }
  if (!items?.length) {
    throw new Error("Add at least one asset before saving.");
  }

  const isDonated = acquisitionInfo.acquisition_type === "donated";
  const acquisitionId = `acq_${Date.now()}`;

  // ── one shared upload for the whole acquisition ──
  const docImageUrl = await uploadImage(
    docImageFile,
    `acquisitions/${acquisitionId}/${isDonated ? "deed-of-donation" : "par-ics-document"}`,
  );
  const docUrlFields = isDonated
    ? { par_ics_doc_url: null, donation_form_url: docImageUrl }
    : { par_ics_doc_url: docImageUrl, donation_form_url: null };

  const acquisitionFields = {
    acquisition_id: acquisitionId,
    acquisition_type: acquisitionInfo.acquisition_type,
    date_acquired: acquisitionInfo.date_acquired,
    donated_by: isDonated ? acquisitionInfo.donated_by || null : null,
    supplier: !isDonated ? acquisitionInfo.supplier || null : null,
    po_reference: !isDonated ? acquisitionInfo.po_reference || null : null,
    ...docUrlFields,
  };

  // ── figure out how many asset records the whole batch will need, and
  //    reserve every ID up front in ONE transaction ──
  const recordCounts = items.map((item) => {
    const qty = parseInt(item.qty, 10) || 1;
    const isIndividual = item.tracking_mode === "individual" && qty > 1;
    return isIndividual ? qty : 1;
  });
  const totalRecords = recordCounts.reduce((sum, n) => sum + n, 0);
  const allAssetIds = await reserveAssetIds(totalRecords);

  // slice out each item's chunk of reserved IDs
  let cursor = 0;
  const idsPerItem = recordCounts.map((count) => {
    const slice = allAssetIds.slice(cursor, cursor + count);
    cursor += count;
    return slice;
  });

  const results = await Promise.all(
    items.map((item, i) =>
      addAssetItem(
        item,
        acquisitionFields,
        isDonated,
        requestedBy,
        idsPerItem[i],
      ),
    ),
  );

  return results.flat();
}

// One line item → its own asset image upload, using the asset IDs already
// reserved for it by addAcquisitionBatch, sharing acquisitionFields across
// every record it produces.
async function addAssetItem(
  item,
  acquisitionFields,
  isDonated,
  requestedBy,
  assetIds,
) {
  const qty = parseInt(item.qty, 10) || 1;
  const isIndividual = item.tracking_mode === "individual" && qty > 1;

  const assetImageUrl = await uploadImage(
    item.assetImage.file,
    `assets/${acquisitionFields.acquisition_id}/${item.category_id}-${Date.now()}`,
  );

  const records = await Promise.all(
    assetIds.map(async (assetId, i) => {
      const qrCodeUrl = await generateQR(assetId);
      const serial = isIndividual
        ? item.serial_numbers?.[i] || null
        : item.serial_number || null;
      return { assetId, qrCodeUrl, serial };
    }),
  );

  const itemPayload = {
    ...acquisitionFields,
    category_id: item.category_id,
    description: item.description,
    cost: isDonated ? null : parseFloat(item.unit_value) || null,
    qty: isIndividual ? 1 : qty,
    tracking_mode: isIndividual ? "individual" : "single_bulk",
    status: "Working",
    remarks: item.remarks || null,
    asset_image_url: assetImageUrl || null,
    property_custodian: item.primary_custodian || null,
    local_mr: null,
    room_id: item.room_id || null,
  };

  // ── create the asset docs first ──
  await Promise.all(
    records.map(({ assetId, qrCodeUrl, serial }) =>
      setDoc(doc(db, "asset", assetId), {
        ...itemPayload,
        serial_number: serial,
        asset_id: assetId,
        qr_code_url: qrCodeUrl || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    ),
  );

  // ── then log the initial assignment history, now that the assets exist ──
  await Promise.all(
    records.map(({ assetId }) =>
      Promise.all([
        item.primary_custodian
          ? logInitialCustodianAssignment(
              {
                asset_id: assetId,
                asset_description: item.description,
                custodian_uid: item.primary_custodian,
              },
              requestedBy,
            )
          : null,
        item.room_id
          ? logInitialRoomAssignment(
              {
                asset_id: assetId,
                asset_name: item.description,
                room_id: item.room_id,
              },
              requestedBy.uid,
            )
          : null,
      ]),
    ),
  );

  // NOTE: if categoryCount/roomCount are also read-increment-write
  // transactions keyed by category_id/room_id, calling them once per
  // record here has the same contention risk as the old generateAssetId
  // did — worth checking their implementation and, if so, batching them
  // (one call per unique category/room with `records.length` as a delta)
  // the same way asset ID reservation was batched above.
  const countUpdates = records.flatMap(() => [
    categoryCount(item.category_id),
    ...(item.room_id ? [roomCount(item.room_id)] : []),
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
