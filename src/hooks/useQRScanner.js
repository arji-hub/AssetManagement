import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";

/**
 * useQRScanner
 *
 * Decodes QR codes from uploaded image files, navigates to the decoded
 * asset preview route, and exposes status state for QRStatusModal.
 *
 * Usage:
 *   const { status, errorMessage, handleImageUpload, reset } = useQRScanner();
 *
 *   <QRModal onImageUpload={handleImageUpload} />
 *   {status && (
 *     <QRStatusModal
 *       status={status}
 *       errorMessage={errorMessage}
 *       onClose={reset}
 *     />
 *   )}
 */
export function useQRScanner() {
  const navigate = useNavigate();

  // null = idle (no modal shown)
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
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

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

  // Only navigate if the decoded value points to a valid asset preview path.
  // This prevents non-asset QR codes (wifi, contact cards, plain URLs, etc.)
  // from accidentally matching the catch-all route and redirecting to "/".
  const ASSET_PREVIEW_PATTERN = /^\/asset\/[^/]+\/preview\/?$/;

  const navigateFromDecodedValue = useCallback(
    (decodedValue) => {
      let pathname = null;

      try {
        const url = new URL(decodedValue);
        pathname = url.pathname;
      } catch {
        // Not a full URL — check if it's a raw path
        if (decodedValue.startsWith("/")) {
          pathname = decodedValue;
        }
      }

      if (pathname && ASSET_PREVIEW_PATTERN.test(pathname)) {
        navigate(pathname);
        return true;
      }

      return false;
    },
    [navigate],
  );

  /**
   * Handler for QRModal's onImageUpload prop.
   * Decodes the uploaded image, updates status, and navigates if valid.
   */
  const handleImageUpload = useCallback(
    async (file) => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const decodedValue = await decodeImageFile(file);
        const navigated = navigateFromDecodedValue(decodedValue);

        if (navigated) {
          setStatus("success");
          // brief confirmation before the route change takes over
          setTimeout(() => reset(), 800);
        } else {
          setStatus("notfound");
          setErrorMessage("This QR code does not point to a valid asset.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "Could not read QR code from image.");
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
