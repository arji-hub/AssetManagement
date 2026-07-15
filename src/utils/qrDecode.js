import jsQR from "jsqr";

export const MAX_DIMENSION = 1000;
export const DECODE_TIMEOUT_MS = 5000;

// qrDecode.js — replace boostContrastFromBlueChannel

export function boostContrastFromLuminance(imageData) {
  const { data, width, height } = imageData;
  const out = new Uint8ClampedArray(data.length);

  const luminances = new Float32Array(data.length / 4);
  let sum = 0;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    luminances[p] = lum;
    sum += lum;
  }

  const avgLum = sum / luminances.length;
  const threshold = avgLum * 0.85;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const value = luminances[p] < threshold ? 0 : 255;
    out[i] = value;
    out[i + 1] = value;
    out[i + 2] = value;
    out[i + 3] = 255;
  }

  return new ImageData(out, width, height);
}

export function decodeImageData(imageData) {
  let code = jsQR(imageData.data, imageData.width, imageData.height);

  if (!code) {
    const boosted = boostContrastFromLuminance(imageData);
    code = jsQR(boosted.data, boosted.width, boosted.height);
  }

  return code;
}

// Decode a QR code from a File (e.g. an uploaded photo). Downscales large
// images first, then runs the shared decodeImageData pipeline.
export function decodeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file."));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error("Failed to load image."));

      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const code = decodeImageData(imageData);

        if (code) {
          resolve(code.data);
        } else {
          reject(new Error("No QR code found in image."));
        }
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

// Race a decode against a timeout so a bad/blurry image doesn't hang forever.
export function decodeImageFileWithTimeout(
  file,
  timeoutMs = DECODE_TIMEOUT_MS,
) {
  return Promise.race([
    decodeImageFile(file),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeoutMs),
    ),
  ]);
}
