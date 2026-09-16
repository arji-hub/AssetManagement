/**
 * backfill-missing-qr-codes.cjs
 *
 * ONE-TIME SCRIPT — generates a QR code ONLY for asset docs that currently
 * have no `qr_code_url` at all (field missing, null, or empty string).
 * Docs that already have a real Storage URL — or even a broken
 * `data:image/...` one — are left untouched.
 *
 * If you also want to fix the old broken base64 `data:image` URLs at the
 * same time, pass --include-broken (see flags below). Otherwise this is a
 * narrower, safer version of backfill-qr-codes.cjs that only ever writes
 * to docs that never got a QR at all — e.g. rows inserted before
 * `onAssetCreatedGenerateQR` existed, or ones where that trigger crashed
 * (see the CICTLOGO.png path bug) before it could write `qr_code_url`.
 *
 * NOTE the .cjs extension — forces Node to parse this as CommonJS even if
 * a package.json above it sets "type": "module".
 *
 * Usage (run from functions/src/script/):
 *   node backfill-qr-codes.cjs                # only docs with NO qr_code_url
 *   node backfill-qr-codes.cjs --include-broken # also fixes old data: URLs
 *   node backfill-qr-codes.cjs --dry-run        # log only, write nothing
 *
 * Requires (already in functions/package.json):
 *   firebase-admin, qr-code-styling, jsdom, canvas
 *
 * Auth: place serviceAccountKey.json at functions/serviceAccountKey.json
 * Get it from Firebase Console → Project Settings → Service Accounts →
 * Generate new private key. Do NOT commit this file.
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
// Verify against Firebase Console → Storage → your bucket name.
const STORAGE_BUCKET = "ams-cict.firebasestorage.app"; // <-- confirm/replace this

// Same file the trigger bundles: functions/src/assets/CICTLOGO.png
// This script lives in functions/src/script/, a sibling of functions/src/assets/,
// so it's one level up then into assets/ — same relative depth as the trigger fix.
const LOGO_PATH = path.join(__dirname, "../assets/CICTLOGO.png");

const CONCURRENCY = 10; // how many assets to process at once
const APP_BASE_URL = "https://ams-cict.web.app/asset/";

const args = process.argv.slice(2);
const INCLUDE_BROKEN = args.includes("--include-broken");
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

// A doc "needs" a QR if qr_code_url is missing/null/empty, OR (when
// --include-broken is passed) it's one of the old placeholder base64 URLs.
function needsQr(data) {
  const current = data.qr_code_url;
  if (!current || current.trim() === "") return true;
  if (INCLUDE_BROKEN && current.startsWith("data:image")) return true;
  return false;
}

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

  if (!needsQr(data)) {
    return { assetId, skipped: true };
  }

  if (DRY_RUN) {
    console.log(`[dry-run] would generate QR for ${assetId}`);
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
    `Starting QR backfill for assets missing a QR${INCLUDE_BROKEN ? " (also fixing broken data: URLs)" : ""}${DRY_RUN ? ", DRY RUN" : ""}...`,
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
  console.log(`Skipped (already had a qr_code_url): ${skipped}`);
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
