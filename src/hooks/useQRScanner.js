import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";

const MAX_DIMENSION = 1000; // cap width/height before decoding
const DECODE_TIMEOUT_MS = 6000; // give up after 6s

function boostContrastFromBlueChannel(imageData) {
  const { data, width, height } = imageData;
  const out = new Uint8ClampedArray(data.length);

  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += data[i + 2];
  }
  const avgBlue = sum / (data.length / 4);
  const threshold = avgBlue * 0.85;

  for (let i = 0; i < data.length; i += 4) {
    const blue = data[i + 2];
    const value = blue < threshold ? 0 : 255;
    out[i] = value;
    out[i + 1] = value;
    out[i + 2] = value;
    out[i + 3] = 255;
  }

  return new ImageData(out, width, height);
}

export function useQRScanner() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const reset = useCallback(() => {
    setStatus(null);
    setErrorMessage("");
  }, []);

  const decodeImageFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(new Error("Failed to read file."));

      reader.onload = (event) => {
        const img = new Image();

        img.onerror = () => reject(new Error("Failed to load image."));

        img.onload = () => {
          // ── Downscale large images (e.g. camera photos) before decoding ──
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

          let code = jsQR(imageData.data, imageData.width, imageData.height);

          if (!code) {
            const boosted = boostContrastFromBlueChannel(imageData);
            code = jsQR(boosted.data, boosted.width, boosted.height);
          }

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
  }, []);

  const ASSET_PREVIEW_PATTERN = /^\/asset\/[^/]+\/?$/;

  const navigateFromDecodedValue = useCallback(
    (decodedValue) => {
      let pathname = null;

      try {
        const url = new URL(decodedValue);
        pathname = url.pathname;
      } catch {
        if (decodedValue.startsWith("/")) {
          pathname = decodedValue;
        }
      }

      if (pathname && ASSET_PREVIEW_PATTERN.test(pathname)) {
        const previewPath = pathname.replace(/\/$/, "");
        navigate(previewPath);
        return true;
      }

      return false;
    },
    [navigate],
  );

  const handleImageUpload = useCallback(
    async (file) => {
      reset();
      setStatus("loading");
      setErrorMessage("");

      try {
        // ── Race the decode against a timeout ──
        const decodedValue = await Promise.race([
          decodeImageFile(file),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), DECODE_TIMEOUT_MS),
          ),
        ]);

        const navigated = navigateFromDecodedValue(decodedValue);

        if (navigated) {
          setStatus("success");
          setTimeout(() => reset(), 1500);
        } else {
          setStatus("notfound");
          setErrorMessage("This QR code does not point to a valid asset.");
        }
      } catch (err) {
        if (err.message === "timeout") {
          setStatus("notfound");
          setErrorMessage(
            "Could not detect a QR code in time. Try again with better lighting/focus.",
          );
        } else {
          setStatus("error");
          setErrorMessage(err.message || "Could not read QR code from image.");
        }
      }
    },
    [decodeImageFile, navigateFromDecodedValue, reset],
  );

  return {
    status,
    errorMessage,
    decodeImageFile,
    navigateFromDecodedValue,
    handleImageUpload,
    reset,
  };
}
