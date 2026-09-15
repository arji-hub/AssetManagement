const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // also fixes the missing require noted earlier

// NOTE: jsdom, canvas, and qr-code-styling are now required lazily inside
// the handler below, not here at module scope — loading them eagerly was
// likely blowing Firebase's 10s "determine backend specification" budget
// during deploy/analysis, since canvas in particular is slow to load as
// a native module.

exports.onAssetCreatedGenerateQR = onDocumentCreated(
  { document: "asset/{assetId}", region: "asia-southeast1" },
  async (event) => {
    const { JSDOM } = require("jsdom");
    const nodeCanvas = require("canvas");
    const QRCodeStyling = require("qr-code-styling");

    const CICT_LOGO_BUFFER = fs.readFileSync(
      path.join(__dirname, "../../../src/assets/logo/CICTLOGO.png"),
    );

    const snap = event.data;
    if (!snap) return;

    const assetId = event.params.assetId;
    const data = snap.data();

    if (data.qr_code_url) return;

    const url = `https://ams-cict.web.app/asset/${assetId}`;

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
      image: CICT_LOGO_BUFFER,
    });

    const pngBuffer = await qrCode.getRawData("png");

    const bucket = getStorage().bucket();
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

    const db = getFirestore();
    await db.collection("asset").doc(assetId).update({
      qr_code_url: qrCodeUrl,
      updated_at: FieldValue.serverTimestamp(),
    });
  },
);
