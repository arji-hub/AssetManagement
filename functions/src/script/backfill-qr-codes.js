/**AssetManagement>functions>src>scripts>backfill-qr-codes.js
 * backfill-qr-codes.js
 *
 * QR CODE DESIGN TESTING & REDESIGN SCRIPT
 *
 * Generates and replaces QR codes with different design presets so you can
 * test and choose which design works best for your asset management system.
 *
 * Features:
 *   - Multiple design presets (CICT Classic, Modern, Minimal, Bold, etc.)
 *   - Test mode: generate sample QR codes without replacing existing ones
 *   - Preview mode: generate QR for a specific asset to preview the design
 *   - Batch replace: apply chosen design to all/filtered assets
 *   - Dry-run support: preview changes before committing
 *
 * Usage (run from functions/src/script/):
 *   node backfill-qr-codes.js --test --design=classic    # Generate test sample
 *   node backfill-qr-codes.js --preview=assetId1 --design=modern  # Preview for asset
 *   node backfill-qr-codes.js --replace --design=bold     # Replace all with chosen design
 *   node backfill-qr-codes.js --replace --design=bold --dry-run # Preview replacement
 *   node backfill-qr-codes.js --list                      # List all available designs
 *
 * Requires (already in functions/package.json):
 *   firebase-admin, qr-code-styling, jsdom, canvas
 *
 * Auth: place serviceAccountKey.json at functions/serviceAccountKey.json
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
const LOGO_PATH = path.join(__dirname, "../../../src/assets/logo/CICTLOGO.png");

const CONCURRENCY = 10; // how many assets to process at once
const APP_BASE_URL = "https://ams-cict.web.app/asset/";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

// Determine mode and design
const LIST_MODE = args.includes("--list");
const TEST_MODE = args.includes("--test");
const PREVIEW_MODE = args.some((a) => a.startsWith("--preview="));
const REPLACE_MODE = args.includes("--replace");

const PREVIEW_ASSET = PREVIEW_MODE
  ? args.find((a) => a.startsWith("--preview=")).replace("--preview=", "")
  : null;

const DESIGN_ARG = args.find((a) => a.startsWith("--design="));
const SELECTED_DESIGN = DESIGN_ARG
  ? DESIGN_ARG.replace("--design=", "")
  : "classic";

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

// ── QR DESIGN PRESETS ──
// Choose and customize your designs here
const QR_DESIGNS = {
  classic: {
    name: "CICT Classic (Current)",
    description: "Red & gold CICT branding - traditional look",
    config: {
      dotsOptions: { type: "rounded", color: "#860100" },
      cornersSquareOptions: { type: "extra-rounded", color: "#860100" },
      cornersDotOptions: { type: "dot", color: "#f5aa2c" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { margin: 1, imageSize: 0.6 },
    },
  },
  draft: {
    name: "CICT Draft Design",
    description:
      "Dots style with refined reds - designed on qr-code-styling.com",
    config: {
      dotsOptions: { type: "dots", color: "#8a0100" },
      cornersSquareOptions: { type: "extra-rounded", color: "#8a0100" },
      cornersDotOptions: { type: "dot", color: "#8a0100" },
      backgroundOptions: { color: "#ffffff" },
      imageOptions: { margin: 1, imageSize: 0.5 },
    },
  },
};

async function generateQrBuffer(assetId, designKey = "classic") {
  const url = `${APP_BASE_URL}${assetId}`;
  const design = QR_DESIGNS[designKey];

  if (!design) {
    throw new Error(
      `Unknown design: ${designKey}. Available: ${Object.keys(QR_DESIGNS).join(", ")}`,
    );
  }

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,
    jsdom: JSDOM,
    nodeCanvas,
    ...design.config,
    ...(CICT_LOGO_BUFFER ? { image: CICT_LOGO_BUFFER } : {}),
  });

  return qrCode.getRawData("png");
}

async function processAsset(doc, designKey = "classic", mode = "replace") {
  const assetId = doc.id;
  const data = doc.data();

  try {
    // Check if asset has existing QR
    const hasQr = data.qr_code_url && data.qr_code_url.trim() !== "";

    if (mode === "replace" && !hasQr) {
      return { assetId, skipped: true, reason: "no existing qr_code_url" };
    }

    if (DRY_RUN) {
      console.log(
        `[dry-run] would update QR for ${assetId} with design: ${designKey}`,
      );
      return { assetId, dryRun: true };
    }

    const pngBuffer = await generateQrBuffer(assetId, designKey);
    const filePath = `assets/qr/${assetId}.png`;

    // Try to delete old file first (in replace mode)
    if (mode === "replace") {
      try {
        const oldFile = bucket.file(filePath);
        await oldFile.delete();
      } catch {
        // File may not exist, continue anyway
      }
    }

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

    return { assetId, updated: true, design: designKey };
  } catch (err) {
    return { assetId, error: err.message };
  }
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
  // ── LIST MODE ──
  if (LIST_MODE) {
    console.log("\n🎨 Available QR Designs:\n");
    Object.entries(QR_DESIGNS).forEach(([key, design]) => {
      console.log(`  ${key}`);
      console.log(`    Name: ${design.name}`);
      console.log(`    Description: ${design.description}`);
    });
    console.log(
      "\nUsage: node backfill-qr-codes.js --test --design=<design-key>",
    );
    process.exit(0);
  }

  // ── TEST MODE ──
  if (TEST_MODE) {
    const design = QR_DESIGNS[SELECTED_DESIGN];
    if (!design) {
      console.error(`❌ Unknown design: ${SELECTED_DESIGN}`);
      console.log(`Available: ${Object.keys(QR_DESIGNS).join(", ")}`);
      process.exit(1);
    }

    console.log(`\n📋 Generating test QR with design: ${SELECTED_DESIGN}`);
    console.log(`   ${design.name} - ${design.description}\n`);

    const testId = "TEST_ASSET_001";
    const pngBuffer = await generateQrBuffer(testId, SELECTED_DESIGN);
    const testFile = `test-qr-${SELECTED_DESIGN}-${Date.now()}.png`;

    fs.writeFileSync(testFile, pngBuffer);
    console.log(`✅ Test QR saved to: ${testFile}`);
    console.log(`   Inspect this file to see how the design looks.`);
    console.log(`\nOnce you're happy with this design, run:`);
    console.log(
      `   node backfill-qr-codes.js --replace --design=${SELECTED_DESIGN}`,
    );
    process.exit(0);
  }

  // ── PREVIEW MODE ──
  if (PREVIEW_MODE) {
    const design = QR_DESIGNS[SELECTED_DESIGN];
    if (!design) {
      console.error(`❌ Unknown design: ${SELECTED_DESIGN}`);
      console.log(`Available: ${Object.keys(QR_DESIGNS).join(", ")}`);
      process.exit(1);
    }

    console.log(
      `\n📷 Previewing asset "${PREVIEW_ASSET}" with design: ${SELECTED_DESIGN}`,
    );
    console.log(`   ${design.name}\n`);

    const doc = await db.collection("asset").doc(PREVIEW_ASSET).get();
    if (!doc.exists) {
      console.error(`❌ Asset not found: ${PREVIEW_ASSET}`);
      process.exit(1);
    }

    const pngBuffer = await generateQrBuffer(PREVIEW_ASSET, SELECTED_DESIGN);
    const previewFile = `preview-${PREVIEW_ASSET}-${SELECTED_DESIGN}.png`;

    fs.writeFileSync(previewFile, pngBuffer);
    console.log(`✅ Preview QR saved to: ${previewFile}`);
    console.log(`   View this to see how it looks for your actual asset.`);
    process.exit(0);
  }

  // ── REPLACE MODE ──
  if (REPLACE_MODE) {
    const design = QR_DESIGNS[SELECTED_DESIGN];
    if (!design) {
      console.error(`❌ Unknown design: ${SELECTED_DESIGN}`);
      console.log(`Available: ${Object.keys(QR_DESIGNS).join(", ")}`);
      process.exit(1);
    }

    console.log(
      `\n🔄 Replacing QR codes with design: ${SELECTED_DESIGN}${DRY_RUN ? " [DRY RUN]" : ""}`,
    );
    console.log(`   ${design.name}\n`);

    const snapshot = await db.collection("asset").get();
    console.log(`Found ${snapshot.size} asset docs.\n`);

    const results = await runWithConcurrency(
      snapshot.docs,
      CONCURRENCY,
      (doc) => processAsset(doc, SELECTED_DESIGN, "replace"),
    );

    const updated = results.filter((r) => r.updated).length;
    const skipped = results.filter((r) => r.skipped).length;
    const dryRun = results.filter((r) => r.dryRun).length;
    const errors = results.filter((r) => r.error);

    console.log("── Summary ──");
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    if (DRY_RUN) console.log(`Would update (dry run): ${dryRun}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length) {
      console.log("\nFailed asset IDs:");
      errors.forEach((e) => console.log(`  - ${e.assetId}: ${e.error}`));
    }

    process.exit(errors.length ? 1 : 0);
  }

  // ── NO MODE SPECIFIED ──
  console.log("❌ No mode specified.\n");
  console.log("Available modes:");
  console.log(
    "  --list                              List all available designs",
  );
  console.log(
    "  --test --design=<key>               Generate a test sample QR",
  );
  console.log(
    "  --preview=assetId --design=<key>    Preview QR for a specific asset",
  );
  console.log(
    "  --replace --design=<key>            Replace all QR codes with chosen design",
  );
  console.log(
    "  --replace --design=<key> --dry-run  Preview replacement without writing\n",
  );
  console.log("Examples:");
  console.log("  node backfill-qr-codes.js --list");
  console.log("  node backfill-qr-codes.js --test --design=modern");
  console.log("  node backfill-qr-codes.js --preview=asset123 --design=bold");
  console.log("  node backfill-qr-codes.js --replace --design=bold --dry-run");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
