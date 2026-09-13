const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

const migrationApp = admin.initializeApp(
  { credential: admin.credential.cert(serviceAccount) },
  "migrationApp",
);

const db = migrationApp.firestore();

// Keep in sync with functions/utils/notificationPrefs.js (DEFAULT_PREFS)
// and the Notification settings page's CATEGORIES.
const DEFAULT_PREFS = {
  report: true,
  transfer_request: true,
  transfer_room: true,
};

// ── Backfill ─────────────────────────────────────────────────────────
// Adds notification_prefs to any user doc that doesn't already have all
// three keys. Existing keys are left untouched (so if someone's already
// got e.g. { report: false } set some other way, that's preserved) —
// only missing keys get the default true filled in.
async function runBackfillNotificationPrefs({ dryRun }) {
  const usersSnap = await db.collection("user").get();

  if (usersSnap.empty) {
    return { message: "No users found.", updated: 0, totalUsers: 0 };
  }

  const toUpdate = [];
  usersSnap.docs.forEach((doc) => {
    const current = doc.data().notification_prefs || null;
    const alreadyComplete =
      current &&
      Object.keys(DEFAULT_PREFS).every((key) =>
        Object.prototype.hasOwnProperty.call(current, key),
      );

    if (!alreadyComplete) {
      toUpdate.push({
        ref: doc.ref,
        merged: { ...DEFAULT_PREFS, ...(current || {}) },
      });
    }
  });

  if (dryRun) {
    return {
      message: `Dry run — would update ${toUpdate.length} of ${usersSnap.size} user docs.`,
      wouldUpdate: toUpdate.length,
      totalUsers: usersSnap.size,
    };
  }

  let updated = 0;
  for (let i = 0; i < toUpdate.length; i += 500) {
    const chunk = toUpdate.slice(i, i + 500);
    const batch = db.batch();
    chunk.forEach(({ ref, merged }) => {
      batch.set(ref, { notification_prefs: merged }, { merge: true });
    });
    await batch.commit();
    updated += chunk.length;
  }

  return {
    message: `Updated ${updated} of ${usersSnap.size} user docs.`,
    updated,
    skipped: usersSnap.size - updated,
    totalUsers: usersSnap.size,
  };
}

exports.backfillNotificationPrefs = onCall(
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
    return runBackfillNotificationPrefs({
      dryRun: request.data?.dryRun === true,
    });
  },
);

// ── Plain-script runner: only executes when run directly via `node` ────
if (require.main === module) {
  const dryRun =
    process.argv.includes("--dry-run") || process.argv.includes("--dryRun");

  runBackfillNotificationPrefs({ dryRun })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
