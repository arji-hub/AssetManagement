/**
 * regenerateAssetQRCodes.js
 *
 * One-off Node script to rewrite `qr_code_url` on every doc in the `asset`
 * collection using the same qr-code-styling design as `generateQR()` in
 * services/qr.js (or wherever your addAsset lives).
 *
 * Usage:
 *   1. npm install firebase-admin qr-code-styling canvas jsdom
 *   2. Download a Service Account key from:
 *      Firebase Console > Project Settings > Service Accounts > Generate new private key
 *      Save it as ./serviceAccountKey.json (already gitignored — do NOT commit it)
 *   3. node regenerateAssetQRCodes.js            (dry run, no writes)
 *   4. node regenerateAssetQRCodes.js --apply     (actually updates Firestore)
 *
 * Notes:
 * - Matches your current schema: qr_code_url stores a base64 PNG data URI,
 *   generated from the asset URL https://ams-cict.web.app/asset/{assetId}.
 * - Uses doc.id as assetId (same as your `asset` collection doc IDs / asset_id field).
 * - Processes in small concurrent batches to avoid hammering Firestore/CPU.
 * - Safe to re-run — it just overwrites qr_code_url + updated_at.
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");
const fs = require("fs");
const nodeCanvas = require("canvas");
const { JSDOM } = require("jsdom");
const serviceAccount = require("../../serviceAccountKey.json");

// ---------------------------------------------------------------------------
// Patch a browser-like global environment BEFORE requiring qr-code-styling.
// The package expects window/document/Image to exist globally even though
// we also pass `jsdom`/`nodeCanvas` into its constructor — some of its
// internals (gradients, corner styling) reach for the globals directly.
// ---------------------------------------------------------------------------
const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
global.window = dom.window;
global.document = dom.window.document;
global.self = dom.window;
global.Image = nodeCanvas.Image;
global.HTMLCanvasElement = nodeCanvas.Canvas;
global.HTMLImageElement = nodeCanvas.Image;

const QRCodeStyling = require("qr-code-styling");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const LOGO_PATH = path.join(__dirname, "..", "src", "assets", "CICTLOGO.png"); // adjust if your logo lives elsewhere
const BASE_URL = "https://ams-cict.web.app/asset";
const CONCURRENCY = 5; // how many QR codes to generate at once
const APPLY = process.argv.includes("--apply");

// ---------------------------------------------------------------------------
// Firebase Admin init
// ---------------------------------------------------------------------------
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

// ---------------------------------------------------------------------------
// Logo as base64 data URI (qr-code-styling's `image` option needs a URL or
// data URI it can hand to node-canvas's Image loader)
// ---------------------------------------------------------------------------
function getLogoDataUri() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.warn(
      `Logo not found at ${LOGO_PATH} — QR codes will be generated without the center logo.`,
    );
    return null;
  }
  const buffer = fs.readFileSync(LOGO_PATH);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

const logoDataUri = getLogoDataUri();

// ---------------------------------------------------------------------------
// Same visual design as your existing generateQR(), adapted for Node
// ---------------------------------------------------------------------------
async function generateQR(assetId) {
  const url = `${BASE_URL}/${assetId}`;

  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    type: "canvas",
    data: url,

    jsdom: JSDOM,
    nodeCanvas,

    margin: 10,

    qrOptions: {
      typeNumber: 5,
      errorCorrectionLevel: "H",
    },

    dotsOptions: {
      type: "rounded",
      gradient: {
        type: "radial",
        colorStops: [
          { offset: 0.05, color: "#D8794F" },
          { offset: 1, color: "#860100" },
        ],
      },
    },

    cornersSquareOptions: {
      type: "extra-rounded",
      color: "#860100",
    },

    cornersDotOptions: {
      type: "dot",
      gradient: {
        type: "radial",
        colorStops: [
          { offset: 0.05, color: "#D8794F" },
          { offset: 1, color: "#860100" },
        ],
      },
    },

    backgroundOptions: {
      color: "#ffffff",
    },

    imageOptions: {
      crossOrigin: "anonymous",
      margin: 0,
      imageSize: 0.6,
      hideBackgroundDots: true,
    },

    ...(logoDataUri ? { image: logoDataUri } : {}),
  });

  const buffer = await qrCode.getRawData("png");
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Simple concurrency limiter so we don't spin up 500 canvases at once
// ---------------------------------------------------------------------------
async function runWithConcurrency(items, limit, worker) {
  const results = [];
  let index = 0;

  async function next() {
    while (index < items.length) {
      const current = index++;
      try {
        results[current] = await worker(items[current], current);
      } catch (err) {
        failCount++;
        console.error(`[fail] ${assetId}:`, err);
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, next));
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(
    APPLY
      ? "Running in APPLY mode (will write to Firestore)."
      : "Running in DRY RUN mode (no writes). Pass --apply to commit changes.",
  );

  const snapshot = await db.collection("asset").get();
  console.log(`Found ${snapshot.size} assets.`);

  const docs = snapshot.docs;
  let successCount = 0;
  let failCount = 0;

  await runWithConcurrency(docs, CONCURRENCY, async (docSnap) => {
    const assetId = docSnap.id;
    try {
      const qrCodeUrl = await generateQR(assetId);

      if (APPLY) {
        await db.collection("asset").doc(assetId).update({
          qr_code_url: qrCodeUrl,
          updated_at: FieldValue.serverTimestamp(),
        });
      }

      successCount++;
      console.log(`[ok] ${assetId}`);
    } catch (err) {
      failCount++;
      console.error(`[fail] ${assetId}:`, err.message);
    }
  });

  console.log("\nDone.");
  console.log(`  Succeeded: ${successCount}`);
  console.log(`  Failed:    ${failCount}`);
  if (!APPLY) {
    console.log("\nThis was a dry run — no Firestore documents were modified.");
    console.log(
      "Re-run with `node regenerateAssetQRCodes.js --apply` to commit.",
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
