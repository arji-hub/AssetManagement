import QRCodeStyling from "qr-code-styling";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase-config";

import CICTLogo from "../assets/logo/CICTLOGO.png";

const APP_BASE_URL = "https://ams-cict.web.app/asset/";
const QR_SIZE = 300;

export async function generateAssetQR(assetId) {
  if (!assetId) {
    throw new Error("Asset ID is required to generate a QR code.");
  }

  const url = `${APP_BASE_URL}${assetId}`;

  console.log("[QR] Starting browser generation:", {
    assetId,
    url,
  });

  const qrCode = new QRCodeStyling({
    width: QR_SIZE,
    height: QR_SIZE,
    type: "canvas",

    data: url,

    // Use the logo bundled with the React application
    image: CICTLogo,

    imageOptions: {
      margin: 1,
      imageSize: 0.6,
    },

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
  });

  console.log("[QR] QRCodeStyling created:", assetId);

  const qrBlob = await qrCode.getRawData("png");

  if (!qrBlob || qrBlob.size === 0) {
    throw new Error(
      `QR generation returned an empty PNG for asset "${assetId}".`,
    );
  }

  console.log("[QR] PNG generated:", {
    assetId,
    bytes: qrBlob.size,
    type: qrBlob.type,
  });

  // Still upload the GENERATED QR code to Firebase Storage
  const filePath = `assets/qr/${assetId}.png`;
  const qrRef = ref(storage, filePath);

  const snapshot = await uploadBytes(qrRef, qrBlob, {
    contentType: "image/png",
  });

  const qrCodeUrl = await getDownloadURL(snapshot.ref);

  console.log("[QR] QR uploaded:", {
    assetId,
    path: filePath,
  });

  return qrCodeUrl;
}
