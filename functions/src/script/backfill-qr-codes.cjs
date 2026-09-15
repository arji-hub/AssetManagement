/**
 * backfill-qr-codes.cjs
 *
 * ONE-TIME SCRIPT — regenerates the QR code for every asset doc and
 * overwrites `qr_code_url` with a real Firebase Storage URL.
 *
 * Why: the old client-side `generateQR()` had a race under batch loads
 * and ended up writing a blank `data:image/png;base64,...` image into
 * `qr_code_url` on a lot of docs. `onAssetCreatedGenerateQR` fixes this
 * going forward for NEW assets, but it's a Firestore *create* trigger —
 * it won't fire for docs that already exist. This script does the same
 * render/upload work as that trigger, once, for every existing asset.
 *
 * NOTE the .cjs extension — this forces Node to parse the file as
 * CommonJS regardless of any "type": "module" set in a package.json
 * above it. If you rename this file back to .js and hit
 * "require is not defined in ES module scope" again, that's why.
 *
 * Usage (run from functions/src/script/):
 *   node backfill-qr-codes.cjs                # only fixes docs whose
 *                                              # qr_code_url is a data:
 *                                              # URL (the broken ones)
 *   node backfill-qr-codes.cjs --all           # regenerate for every
 *                                              # asset doc, regardless
 *                                              # of current qr_code_url
 *   node backfill-qr-codes.cjs --dry-run       # log what would change,
 *                                              # write nothing
 *
 * Requires (already in functions/package.json):
 *   firebase-admin, qr-code-styling, jsdom, canvas
 *
 * Auth: place serviceAccountKey.json at functions/serviceAccountKey.json
 * (same location your migration script in src/migrations/ expects it).
 * Get it from Firebase Console → Project Settings → Service Accounts →
 * Generate new private key. Do NOT commit this file — add it to
 * .gitignore if it isn't already.
 */
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");
const { JSDOM } = require("jsdom");
const nodeCanvas = require("canvas");
const {
  QRCodeStyling,
} = require("qr-code-styling/lib/qr-code-styling.common.js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ── config ──
// Verify this against Firebase Console → Storage → your bucket name.
// It is NOT your hosting URL (*.web.app) — it's usually
// "<project-id>.appspot.com" or, for newer projects,
// "<project-id>.firebasestorage.app".
const STORAGE_BUCKET = "ams-cict.firebasestorage.app"; // <-- confirm/replace this
const LOGO_PATH = path.join(__dirname, "../../../src/assets/logo/CICTLOGO.png"); // functions/assets/logo/CICTLOGO.png — same file the trigger bundles
const CONCURRENCY = 10; // how many assets to process at once
const APP_BASE_URL = "https://ams-cict.web.app/asset/";

const args = process.argv.slice(2);
const ONLY_BROKEN = !args.includes("--all");
const DRY_RUN = args.includes("--dry-run");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const CICT_LOGO_BUFFER = fs.existsSync(LOGO_PATH)
  ? fs.readFileSync(LOGO_PATH)
  : (() => {
      console.warn(
        `⚠ Logo not found at ${LOGO_PATH} — QR codes will render without the center logo.`,
      );
      return undefined;
    })();

async function generateQrBuffer(assetId) {
  const url = `${APP_BASE_URL}${assetId}`;

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,
    jsdom: JSDOM,
    nodeCanvas,
    dotsOptions: { type: "rounded", color: "#860100" },
    cornersSquareOptions: { type: "extra-rounded", color: "#860100" },
    cornersDotOptions: { type: "dot", color: "#f5aa2c" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { margin: 1, imageSize: 0.6 },
    ...(CICT_LOGO_BUFFER ? { image: CICT_LOGO_BUFFER } : {}),
  });

  return qrCode.getRawData("png");
}

async function processAsset(doc) {
  const assetId = doc.id;
  const data = doc.data();

  if (ONLY_BROKEN) {
    const current = data.qr_code_url || "";
    if (!current.startsWith("data:image")) {
      return { assetId, skipped: true };
    }
  }

  if (DRY_RUN) {
    console.log(`[dry-run] would regenerate QR for ${assetId}`);
    return { assetId, dryRun: true };
  }

  const pngBuffer = await generateQrBuffer(assetId);

  const filePath = `assets/qr/${assetId}.png`;
  const file = bucket.file(filePath);
  const downloadToken = crypto.randomUUID();

  await file.save(pngBuffer, {
    metadata: {
      contentType: "image/png",
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    },
  });

  const qrCodeUrl =
    `https://firebasestorage.googleapis.com/v0/b/${bucket.name}` +
    `/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

  await db.collection("asset").doc(assetId).update({
    qr_code_url: qrCodeUrl,
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { assetId, updated: true };
}

// simple concurrency-limited batch runner so we don't fire hundreds of
// Storage uploads + canvas renders at once
async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let cursor = 0;

  async function next() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = await worker(items[i]);
      } catch (err) {
        results[i] = { assetId: items[i].id, error: err.message };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, next),
  );
  return results;
}

async function main() {
  console.log(
    `Starting QR backfill (${ONLY_BROKEN ? "broken docs only" : "ALL docs"}${DRY_RUN ? ", DRY RUN" : ""})...`,
  );

  const snapshot = await db.collection("asset").get();
  console.log(`Found ${snapshot.size} asset docs.`);

  const results = await runWithConcurrency(
    snapshot.docs,
    CONCURRENCY,
    processAsset,
  );

  const updated = results.filter((r) => r.updated).length;
  const skipped = results.filter((r) => r.skipped).length;
  const dryRun = results.filter((r) => r.dryRun).length;
  const errors = results.filter((r) => r.error);

  console.log("\n── Summary ──");
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already had a real URL): ${skipped}`);
  if (DRY_RUN) console.log(`Would update (dry run): ${dryRun}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length) {
    console.log("\nFailed asset IDs:");
    errors.forEach((e) => console.log(`  - ${e.assetId}: ${e.error}`));
  }

  process.exit(errors.length ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
