import { HEADER_FOOTER_SLOTS } from "../services/headerFooter";

const { HEADER, FOOTER } = HEADER_FOOTER_SLOTS;

// Output is 2x the default PNGs (915x217 / 915x175) for sharper print.
export const CROP_CONFIG = {
  [HEADER]: { aspect: 915 / 217, width: 1830, height: 434 },
  [FOOTER]: { aspect: 915 / 175, width: 1830, height: 350 },
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = src;
  });
}

// pixelCrop = croppedAreaPixels from react-easy-crop
export async function getCroppedBlob(src, pixelCrop, { width, height }, mime) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (mime === "image/jpeg") {
    ctx.fillStyle = "#fff"; // JPEG has no transparency
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height,
  );

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed."))),
      mime,
      0.92,
    ),
  );
}
