const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const nodeCanvas = require("canvas");
const QRCodeStyling = require("qr-code-styling");

// Copy the same file used client-side (src/assets/logo/CICTLOGO.png) into
// functions/src/assets/logo/ so it ships bundled with the function.
const CICT_LOGO_BUFFER = fs.readFileSync(
  path.join(__dirname, "../assets/logo/CICTLOGO.png"),
);

/**
 * Firestore Trigger: onAssetCreatedGenerateQR
 *
 * Watches asset/{assetId} for creation and generates the styled QR code
 * server-side, writing qr_code_url back onto the doc once done.
 *
 * Replaces the old client-side generateQR() that used to run once per
 * unit inside addAssetItem, ALL in parallel, inside the same registration
 * batch — which raced the styling library's async logo overlay under
 * load (the qty:N individual-tracking bug) and made the whole batch save
 * wait on however many QR renders happened to be in flight.
 *
 * Keying off document creation instead means:
 *  - the client save finishes as soon as asset docs are written, with
 *    qr_code_url initially absent
 *  - each asset gets exactly ONE independent render, triggered by its own
 *    doc — no shared concurrency between units in a batch, so no
 *    contention-driven race
 *  - one asset's render failing can't block or corrupt any other
 *
 * Runs with Admin SDK privileges, same rationale as onUpdateAssetCustodian:
 * /asset writes are admin-only from the client, but this trigger needs to
 * write qr_code_url back regardless.
 */
exports.onAssetCreatedGenerateQR = onDocumentCreated(
  { document: "asset/{assetId}", region: "asia-southeast1" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const assetId = event.params.assetId;
    const data = snap.data();

    // idempotency guard, in case of a retried invocation
    if (data.qr_code_url) return;

    const url = `https://ams-cict.web.app/asset/${assetId}`;

    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      type: "canvas",
      data: url,

      // these two options are what make qr-code-styling runnable outside
      // a browser — without them it tries to touch `document`/`window`
      // directly and throws
      jsdom: JSDOM,
      nodeCanvas,

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
        margin: 1,
        imageSize: 0.6,
      },

      image: CICT_LOGO_BUFFER,
    });

    // getRawData resolves only once the render — including the logo
    // overlay — has actually finished. In this Node build it comes back
    // as a Buffer directly, no Blob/FileReader conversion needed the way
    // the browser-side fix required.
    const pngBuffer = await qrCode.getRawData("png");

    const bucket = getStorage().bucket();
    const filePath = `assets/qr/${assetId}.png`;
    const file = bucket.file(filePath);

    // a download token, same mechanism the client SDK's getDownloadURL()
    // relies on — produces a URL in the same shape the rest of the app
    // already expects, with no Storage Rules or bucket ACL changes needed
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

    const db = getFirestore();
    await db.collection("asset").doc(assetId).update({
      qr_code_url: qrCodeUrl,
      updated_at: FieldValue.serverTimestamp(),
    });
  },
);
