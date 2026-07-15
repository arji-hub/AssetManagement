import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  decodeImageFile,
  decodeImageFileWithTimeout,
} from "../../utils/qrDecode";

const ASSET_PREVIEW_PATTERN = /^\/asset\/[^/]+\/?$/;

// Pure — resolves a decoded QR value to an asset preview path, or null.
// Does NOT navigate. Kept outside the hook since it has no dependency on it.
function resolveAssetPath(decodedValue) {
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
    return pathname.replace(/\/$/, "");
  }

  return null;
}

export function useQRScanner() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const reset = useCallback(() => {
    setStatus(null);
    setErrorMessage("");
  }, []);

  const handleImageUpload = useCallback(
    async (file) => {
      reset();
      setStatus("loading");
      setErrorMessage("");

      try {
        const decodedValue = await decodeImageFileWithTimeout(file);
        const previewPath = resolveAssetPath(decodedValue);

        if (previewPath) {
          setStatus("success");
          setTimeout(() => {
            navigate(previewPath);
          }, 1500);
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
    [navigate, reset],
  );

  return {
    status,
    errorMessage,
    decodeImageFile,
    handleImageUpload,
    reset,
  };
}
