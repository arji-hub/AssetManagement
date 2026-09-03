const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

const migrationApp = admin.initializeApp(
  { credential: admin.credential.cert(serviceAccount) },
  "migrationApp",
);

const db = migrationApp.firestore();
const FieldValue = admin.firestore.FieldValue;

// ── STEP 1 ────────────────────────────────────────────────────────────
async function runMigrateStep1({ dryRun }) {
  const roomsSnap = await db
    .collection("room")
    .orderBy("created_at", "asc")
    .get();
  if (roomsSnap.empty) {
    return { message: "No rooms found.", mapping: {} };
  }

  const existingMigratedSnap = await db
    .collection("room")
    .where("migrated_from", "!=", null)
    .get();
  const alreadyMigratedFrom = new Set(
    existingMigratedSnap.docs.map((d) => d.data().migrated_from),
  );

  const roomsToMigrate = roomsSnap.docs.filter(
    (doc) => !alreadyMigratedFrom.has(doc.id) && !doc.id.startsWith("rm-"),
  );

  if (roomsToMigrate.length === 0) {
    return {
      message: "Nothing to migrate — all rooms already have rm- copies.",
      mapping: {},
    };
  }

  const counterRef = db.collection("counters").doc("room");
  const startCount = await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const current = counterSnap.exists ? counterSnap.data().count || 0 : 0;
    if (!dryRun) {
      tx.set(
        counterRef,
        { count: current + roomsToMigrate.length },
        { merge: true },
      );
    }
    return current;
  });

  const mapping = {};
  let counter = startCount;
  roomsToMigrate.forEach((doc) => {
    counter += 1;
    mapping[doc.id] = `rm-${String(counter).padStart(3, "0")}`;
  });

  if (dryRun) {
    return { message: "Dry run — nothing written.", mapping };
  }

  const created = [];
  for (const doc of roomsToMigrate) {
    const oldId = doc.id;
    const newId = mapping[oldId];
    const roomData = doc.data();

    await db
      .collection("room")
      .doc(newId)
      .set({
        ...roomData,
        migrated_from: oldId,
        created_at: roomData.created_at || FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });

    created.push({ oldId, newId });
  }

  return { message: `Created ${created.length} new room docs.`, mapping };
}

exports.migrateRoomIdsStep1_CreateNewRooms = onCall(
  { cors: true, region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const callerDoc = await db.collection("user").doc(request.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data().role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Only admins can run this migration.",
      );
    }
    return runMigrateStep1({ dryRun: request.data?.dryRun === true });
  },
);

// ── STEP 2 ────────────────────────────────────────────────────────────
async function runMigrateStep2({ dryRun, deleteOldRooms = true }) {
  const newRoomsSnap = await db
    .collection("room")
    .where("migrated_from", "!=", null)
    .get();

  if (newRoomsSnap.empty) {
    return {
      message: "No migrated rooms found. Run Step 1 first.",
      results: [],
    };
  }

  const results = [];

  for (const newDoc of newRoomsSnap.docs) {
    const newId = newDoc.id;
    const newRoomData = newDoc.data();
    const oldId = newRoomData.migrated_from;
    const roomName = newRoomData.name || null;
    if (!oldId) continue;

    const assetsSnap = await db
      .collection("asset")
      .where("room_id", "==", oldId)
      .get();

    if (dryRun) {
      results.push({ oldId, newId, roomName, assetsToUpdate: assetsSnap.size });
      continue;
    }

    let updatedAssets = 0;
    for (let i = 0; i < assetsSnap.docs.length; i += 500) {
      const chunk = assetsSnap.docs.slice(i, i + 500);
      const batch = db.batch();
      chunk.forEach((assetDoc) => {
        batch.update(assetDoc.ref, {
          room_id: newId,
          room_name: roomName,
          updated_at: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      updatedAssets += chunk.length;
    }

    if (deleteOldRooms) {
      await db.collection("room").doc(oldId).delete();
    }

    results.push({
      oldId,
      newId,
      roomName,
      assetsUpdated: updatedAssets,
      oldRoomDeleted: deleteOldRooms,
    });
  }

  return { message: `Processed ${results.length} rooms.`, results };
}

exports.migrateRoomIdsStep2_RepointAssetsAndCleanup = onCall(
  { cors: true, region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const callerDoc = await db.collection("user").doc(request.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data().role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Only admins can run this migration.",
      );
    }
    return runMigrateStep2({
      dryRun: request.data?.dryRun === true,
      deleteOldRooms: request.data?.deleteOldRooms !== false,
    });
  },
);

// ── STEP 2b: repoint transfer_room refs ──────────────────────────────
async function runMigrateStep2TransferRoom({ dryRun }) {
  const newRoomsSnap = await db
    .collection("room")
    .where("migrated_from", "!=", null)
    .get();

  if (newRoomsSnap.empty) {
    return {
      message: "No migrated rooms found. Run Step 1 first.",
      results: [],
    };
  }

  const results = [];

  for (const newDoc of newRoomsSnap.docs) {
    const newId = newDoc.id;
    const oldId = newDoc.data().migrated_from;
    if (!oldId) continue;

    const [moveToSnap, roomFromSnap] = await Promise.all([
      db.collection("transfer_room").where("move_to", "==", oldId).get(),
      db.collection("transfer_room").where("room_from", "==", oldId).get(),
    ]);

    const docsToUpdate = new Map();
    moveToSnap.docs.forEach((d) =>
      docsToUpdate.set(d.id, { ref: d.ref, moveTo: true, roomFrom: false }),
    );
    roomFromSnap.docs.forEach((d) => {
      const existing = docsToUpdate.get(d.id);
      if (existing) {
        existing.roomFrom = true;
      } else {
        docsToUpdate.set(d.id, { ref: d.ref, moveTo: false, roomFrom: true });
      }
    });

    if (dryRun) {
      results.push({
        oldId,
        newId,
        transferRoomDocsToUpdate: docsToUpdate.size,
      });
      continue;
    }

    let updated = 0;
    const entries = Array.from(docsToUpdate.values());
    for (let i = 0; i < entries.length; i += 500) {
      const chunk = entries.slice(i, i + 500);
      const batch = db.batch();
      chunk.forEach(({ ref, moveTo, roomFrom }) => {
        const update = {};
        if (moveTo) update.move_to = newId;
        if (roomFrom) update.room_from = newId;
        batch.update(ref, update);
      });
      await batch.commit();
      updated += chunk.length;
    }

    results.push({ oldId, newId, transferRoomDocsUpdated: updated });
  }

  return { message: `Processed ${results.length} rooms.`, results };
}

exports.migrateRoomIdsStep2b_TransferRoomRefs = onCall(
  { cors: true, region: "asia-southeast1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be logged in.");
    }
    const callerDoc = await db.collection("user").doc(request.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data().role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Only admins can run this migration.",
      );
    }
    return runMigrateStep2TransferRoom({
      dryRun: request.data?.dryRun === true,
    });
  },
);

// ── Plain-script runner: only executes when run directly via `node` ────
if (require.main === module) {
  const dryRun =
    process.argv.includes("--dry-run") || process.argv.includes("--dryRun");
  const keepOldRooms = process.argv.includes("--keep-old-rooms");

  let run;
  if (process.argv.includes("--transfer-room")) {
    run = runMigrateStep2TransferRoom({ dryRun });
  } else if (process.argv.includes("--step2")) {
    run = runMigrateStep2({ dryRun, deleteOldRooms: !keepOldRooms });
  } else {
    run = runMigrateStep1({ dryRun });
  }

  run
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
