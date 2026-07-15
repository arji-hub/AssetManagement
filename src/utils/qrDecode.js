import jsQR from "jsqr";

export const MAX_DIMENSION = 1000;
export const DECODE_TIMEOUT_MS = 5000;

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

// Adaptive (local-mean) thresholding via integral image — handles gradients
// and uneven color/lighting far better than a single global threshold.
export function adaptiveThreshold(imageData, blockSize = 16, sensitivity = 0.9) {
  const { data, width, height } = imageData;
  const gray = new Float64Array(width * height);

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Integral image for fast local-average lookups
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += gray[y * width + x];
      integral[(y + 1) * (width + 1) + (x + 1)] =
        integral[y * (width + 1) + (x + 1)] + rowSum;
    }
  }

  const half = Math.floor(blockSize / 2);
  const out = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - half);
      const y1 = Math.max(0, y - half);
      const x2 = Math.min(width - 1, x + half);
      const y2 = Math.min(height - 1, y + half);
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      const sum =
        integral[(y2 + 1) * (width + 1) + (x2 + 1)] -
        integral[y1 * (width + 1) + (x2 + 1)] -
        integral[(y2 + 1) * (width + 1) + x1] +
        integral[y1 * (width + 1) + x1];

      const localAvg = sum / count;
      const p = y * width + x;
      const value = gray[p] < localAvg * sensitivity ? 0 : 255;

      const idx = p * 4;
      out[idx] = value;
      out[idx + 1] = value;
      out[idx + 2] = value;
      out[idx + 3] = 255;
    }
  }

  return new ImageData(out, width, height);
}

// Try a standard decode first, then fall back to a luminance-boosted pass,
// then a slower adaptive-threshold pass for gradient/colorful QR codes.
// tryAdaptive lets callers (e.g. the live camera loop) skip the expensive
// stage on most frames and only run it periodically.
export function decodeImageData(imageData, { tryAdaptive = true } = {}) {
  let code = jsQR(imageData.data, imageData.width, imageData.height);

  if (!code) {
    const luminanceBoosted = boostContrastFromLuminance(imageData);
    code = jsQR(
      luminanceBoosted.data,
      luminanceBoosted.width,
      luminanceBoosted.height,
    );
  }

  if (!code && tryAdaptive) {
    const adaptive = adaptiveThreshold(imageData);
    code = jsQR(adaptive.data, adaptive.width, adaptive.height);
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
        const code = decodeImageData(imageData); // tryAdaptive defaults true — full pipeline on upload

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