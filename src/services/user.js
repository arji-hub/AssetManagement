import { db } from "./firebase-config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  onSnapshot,
  where,
  limit,
  serverTimestamp,
  or,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toLowerCase } from "../utils/TextCasing";
import ROLES from "../data/roles";
import { getMillis } from "../utils/date";
import { fetchRoomName } from "./room";
import { fetchCategoryName } from "./category";

const functions = getFunctions();

async function assetCount(uid) {
  const [custodianSnap, localMRSnap] = await Promise.all([
    getDocs(
      query(collection(db, "asset"), where("property_custodian", "==", uid)),
    ),
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
      email: d.email,
      status: d.status,
      uid: doc.id,
    };
  });

  const counts = await Promise.all(
    custodians.map(async (c) => ({
      id: c.id,
      asset_count: await assetCount(c.id),
    })),
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
    status: d.status ?? "active",
    asset_count,
    uid: docSnap.id,
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

async function fetchAssignedDateMap(custodianID) {
  if (!custodianID) return {};

  const q = query(
    collection(db, "transfer_request"),
    where("status", "==", "completed"),
    where("acknowledgments.to.uid", "==", custodianID),
  );

  const snap = await getDocs(q);
  const dateMap = {};

  snap.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const completedAt = data.completed_at;
    if (!completedAt) return;

    const assetIds =
      Array.isArray(data.asset_ids) && data.asset_ids.length > 0
        ? data.asset_ids
        : data.asset_id
          ? [data.asset_id]
          : [];

    assetIds.forEach((assetId) => {
      if (getMillis(completedAt) > getMillis(dateMap[assetId])) {
        dateMap[assetId] = completedAt;
      }
    });
  });

  return dateMap;
}

export function subscribeToAssetsByCustodian(custodianID, callback, onError) {
  const assetRef = collection(db, "asset");
  let assetQuery;
  if (custodianID === null) {
    assetQuery = query(
      assetRef,
      where("property_custodian", "==", null),
      where("local_mr", "==", null),
    );
  } else {
    assetQuery = query(
      assetRef,
      or(
        where("property_custodian", "==", custodianID),
        where("local_mr", "==", custodianID),
      ),
    );
  }

  const unsubscribe = onSnapshot(
    assetQuery,
    async (snapshot) => {
      try {
        const assetData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const roomIds = [
          ...new Set(assetData.map((a) => a.room_id).filter(Boolean)),
        ];

        const roomNameMap = {};
        await Promise.all(
          roomIds.map(async (roomId) => {
            try {
              roomNameMap[roomId] = await fetchRoomName(roomId);
            } catch {
              roomNameMap[roomId] = "---";
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

        //one query for all completed transfers TO this custodian
        const assignedDateMap = await fetchAssignedDateMap(custodianID);

        const assets = assetData.map((asset) => ({
          id: asset.id,
          serial_no: asset.serial_number,
          category_id: asset.category_id,
          category_name: categoryNameMap[asset.category_id],
          description: asset.description,
          qty: asset.qty,
          status: asset.status,
          date: asset.date_acquired,
          room_id: asset.room_id ?? null,
          room_name: roomNameMap[asset.room_id] ?? null,
          property_custodian: asset.property_custodian ?? null,
          local_mr: asset.local_mr ?? null,
          date_assigned: assignedDateMap[asset.id] ?? null,
        }));

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

export async function fetchUsersByRole(role) {
  const q = query(collection(db, "user"), where("role", "==", role));

  const snap = await getDocs(q);
  if (snap.empty) return [];

  return snap.docs.map((docSnap) => {
    const d = docSnap.data();
    return {
      uid: docSnap.id,
      email: d.email,
      fullname: [d.first_name, d.middle_name, d.last_name]
        .filter(Boolean)
        .join(" "),
    };
  });
}

export async function getAdmin() {
  const q = query(
    collection(db, "user"),
    where("role", "==", ROLES.ADMIN),
    limit(1),
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  const d = docSnap.data();

  return {
    uid: docSnap.id,
    username: d.user_name,
    firstname: d.first_name,
    fullname: [d.first_name, d.middle_name, d.last_name]
      .filter(Boolean)
      .join(" "),
  };
}

export async function getName(uid) {
  if (!uid) return null;
  const docSnap = await getDoc(doc(db, "user", uid));
  if (!docSnap.exists()) return null;
  const d = docSnap.data();

  return {
    username: d.user_name,
    firstname: d.first_name,
    fullname: [d.first_name, d.middle_name, d.last_name]
      .filter(Boolean)
      .join(" "),
  };
}

export async function archiveCustodian(uid, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can archive custodians.");
  }

  const userRef = doc(db, "user", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("Custodian not found.");
  }

  const userData = userSnap.data();
  const count = await assetCount(uid);
  if (count > 0) {
    const fullname = [
      userData.first_name,
      userData.middle_name,
      userData.last_name,
    ]
      .filter(Boolean)
      .join(" ");
    throw new Error(
      `Cannot archive "${fullname}": ${count} asset(s) still assigned to this custodian.`,
    );
  }

  await updateDoc(userRef, {
    status: "inactive",
    updated_at: serverTimestamp(),
  });
}

export async function restoreCustodian(uid, role) {
  if (role !== "admin") {
    throw new Error("Permission denied: only admins can restore custodians.");
  }

  const userRef = doc(db, "user", uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error("Custodian not found.");
  }

  const userData = userSnap.data();
  if (userData.status !== "inactive") {
    const fullname = [
      userData.first_name,
      userData.middle_name,
      userData.last_name,
    ]
      .filter(Boolean)
      .join(" ");
    throw new Error(`"${fullname}" is already active.`);
  }

  await updateDoc(userRef, {
    status: "active",
    updated_at: serverTimestamp(),
  });
}
