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
import { categoryCount } from "./category";
import { roomCount } from "./room";
import { toLowerCase, toTitleCase } from "../utils/TextCasing";
import {
  logInitialCustodianAssignment,
  logInitialRoomAssignment,
} from "./transfer";
import { fetchRoomName } from "./room";
import { fetchCategoryName } from "./category";

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
          local_mr_fullname: fullname[asset.local_mr] || "---",
          category_name: categoryNameMap[asset.category_id],
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

  const room_name = assetData.room_id
    ? await fetchRoomName(assetData.room_id)
    : "---";

  const category_name = await fetchCategoryName(assetData.category_id);

  return {
    ...assetData,
    name: userMap[assetData.property_custodian],
    property_custodian_name: userMap[assetData.property_custodian] || "---",
    property_custodian_username:
      usernameMap[assetData.property_custodian] || "---",
    local_mr_name: userMap[assetData.local_mr] || "---",
    local_mr_username: usernameMap[assetData.local_mr] || "---",
    room_name,
    category_name,
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
 *
 * @param {object} acquisitionInfo  { acquisition_type, date_acquired, donated_by, supplier}
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
// every record it produces. QR codes are generated asynchronously by the
// onAssetCreatedGenerateQR Firestore trigger after each doc is created.
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

  const records = assetIds.map((assetId, i) => {
    const serial = isIndividual
      ? item.serial_numbers?.[i] || null
      : item.serial_number || null;
    return { assetId, serial };
  });

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
  // qr_code_url is intentionally omitted here: onAssetCreatedGenerateQR
  // picks up the doc-create event and fills it in server-side.
  await Promise.all(
    records.map(({ assetId, serial }) =>
      setDoc(doc(db, "asset", assetId), {
        ...itemPayload,
        serial_number: serial,
        asset_id: assetId,
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

/**
 * Given a list of serial numbers, returns the subset that already exist
 * on some asset doc in Firestore. Used to block duplicate serials during
 * registration. Firestore 'in' queries are capped at 30 values, so the
 * list is chunked defensively even though a single item form won't
 * realistically hit that.
 *
 * @param {string[]} serials
 * @returns {Promise<Set<string>>} normalized serials that already exist
 */
export async function findExistingSerialNumbers(serials) {
  const normalized = [
    ...new Set(serials.map((s) => s?.trim()).filter(Boolean)),
  ];
  if (!normalized.length) return new Set();

  const assetsRef = collection(db, "asset");
  const chunks = [];
  for (let i = 0; i < normalized.length; i += 30) {
    chunks.push(normalized.slice(i, i + 30));
  }

  const snaps = await Promise.all(
    chunks.map((chunk) =>
      getDocs(query(assetsRef, where("serial_number", "in", chunk))),
    ),
  );

  const found = new Set();
  snaps.forEach((snap) =>
    snap.forEach((d) => {
      const sn = d.data().serial_number;
      if (sn) found.add(sn.trim());
    }),
  );
  return found;
}

// ──────────────────────────────────────────────────────────────────
// Dashboard summary support (AssetDashboardPanel — admin view)
// ──────────────────────────────────────────────────────────────────

function getAssetRangeBounds(range) {
  const now = new Date();
  if (range === "year") {
    return {
      currentStart: new Date(now.getFullYear(), 0, 1),
      previousStart: new Date(now.getFullYear() - 1, 0, 1),
    };
  }
  return {
    currentStart: new Date(now.getFullYear(), now.getMonth(), 1),
    previousStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
}

function assetBucketKey(date, range) {
  return range === "year"
    ? `${date.getFullYear()}-${date.getMonth()}`
    : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function assetBucketLabel(date, range) {
  return range === "year"
    ? date.toLocaleString("en-US", { month: "short" })
    : String(date.getDate());
}

function buildEmptyAssetBuckets(range) {
  const now = new Date();
  const buckets = [];

  if (range === "year") {
    for (let month = 0; month <= now.getMonth(); month++) {
      const d = new Date(now.getFullYear(), month, 1);
      buckets.push({
        key: assetBucketKey(d, range),
        label: assetBucketLabel(d, range),
        acquired: 0,
        condemned: 0,
      });
    }
  } else {
    const daysElapsed = now.getDate();
    for (let day = 1; day <= daysElapsed; day++) {
      const d = new Date(now.getFullYear(), now.getMonth(), day);
      buckets.push({
        key: assetBucketKey(d, range),
        label: assetBucketLabel(d, range),
        acquired: 0,
        condemned: 0,
      });
    }
  }

  return buckets;
}

function toDateLoose(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate(); // Firestore Timestamp
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Pure transform: raw asset docs -> { series, totals, trend } for the
 * admin view of AssetDashboardPanel. No Firestore calls — reuses whatever
 * asset list is already loaded (no separate subscription needed).
 *
 * "Acquired" buckets by date_acquired. "Condemned" buckets by updated_at
 * for assets currently in Condemned status — this is a best-effort proxy,
 * since asset docs don't store a dedicated condemned_at timestamp; any
 * other field update made after condemning would also bump updated_at.
 * If exact condemn dates matter later, have condemnAsset() write a
 * condemned_at field alongside the status change.
 */
export function summarizeAssetEvents(assets, range) {
  const { currentStart, previousStart } = getAssetRangeBounds(range);
  const bucketMap = new Map(
    buildEmptyAssetBuckets(range).map((bucket) => [bucket.key, bucket]),
  );

  let currentAcquired = 0;
  let currentCondemned = 0;
  let previousAcquired = 0;
  let previousCondemned = 0;

  assets.forEach((asset) => {
    const acquiredAt = toDateLoose(asset.created_at);
    if (acquiredAt) {
      if (acquiredAt >= currentStart) {
        const bucket = bucketMap.get(assetBucketKey(acquiredAt, range));
        if (bucket) bucket.acquired += 1;
        currentAcquired += 1;
      } else if (acquiredAt >= previousStart) {
        previousAcquired += 1;
      }
    }

    if (asset.status === "Condemned") {
      const condemnedAt = toDateLoose(asset.updated_at);
      if (condemnedAt) {
        if (condemnedAt >= currentStart) {
          const bucket = bucketMap.get(assetBucketKey(condemnedAt, range));
          if (bucket) bucket.condemned += 1;
          currentCondemned += 1;
        } else if (condemnedAt >= previousStart) {
          previousCondemned += 1;
        }
      }
    }
  });

  const currentTotal = currentAcquired + currentCondemned;
  const previousTotal = previousAcquired + previousCondemned;

  const direction =
    currentTotal === previousTotal
      ? "flat"
      : currentTotal > previousTotal
        ? "up"
        : "down";

  const deltaPercent =
    previousTotal === 0
      ? currentTotal === 0
        ? 0
        : 100
      : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

  return {
    series: Array.from(bucketMap.values()),
    totals: {
      all: currentTotal,
      acquired: currentAcquired,
      condemned: currentCondemned,
    },
    trend: { direction, deltaPercent },
  };
}
