import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";


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

  const ASSET_PREVIEW_PATTERN = /^\/asset\/[^/]+\/?$/;

  const navigateFromDecodedValue = useCallback(
    (decodedValue) => {
      let pathname = null;
      console.log("decoded:", decodedValue);

      try {
        const url = new URL(decodedValue);
        pathname = url.pathname;
        console.log("pathname:", pathname);
      } catch {
        if (decodedValue.startsWith("/")) {
          pathname = decodedValue;
        }
      }
      console.log("pattern test:", ASSET_PREVIEW_PATTERN.test(pathname)); // 👈
      console.log("pathname:", pathname); // 👈
      console.log(
        "will navigate:",
        pathname && ASSET_PREVIEW_PATTERN.test(pathname),
      ); // 👈

      if (pathname && ASSET_PREVIEW_PATTERN.test(pathname)) {
        // strip trailing slash, navigate as-is — /asset/:assetId IS the preview route
        const previewPath = pathname.replace(/\/$/, "");
        navigate(previewPath);
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
      reset();
      setStatus("loading");
      setErrorMessage("");

      try {
        const decodedValue = await decodeImageFile(file);
        const navigated = navigateFromDecodedValue(decodedValue);

        if (navigated) {
          setStatus("success");
          setTimeout(() => reset(), 1500); // 👈 longer delay
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
