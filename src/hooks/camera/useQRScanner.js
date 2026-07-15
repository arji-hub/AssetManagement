import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { decodeImageFile, decodeImageFileWithTimeout } from "../../utils/qrDecode";

export function useQRScanner() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const reset = useCallback(() => {
    setStatus(null);
    setErrorMessage("");
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
        const decodedValue = await decodeImageFileWithTimeout(file);
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
    [navigateFromDecodedValue, reset],
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