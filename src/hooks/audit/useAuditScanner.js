import { useEffect, useRef, useState, useCallback } from "react";
import {
  decodeImageData,
  decodeImageFileWithTimeout,
} from "../../utils/qrDecode";

const ASSET_QR_PATTERN = /^\/asset\/([^/]+)\/?$/;

function useAuditScanner({ isActive, validAssetIds, onDetect }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastDetectedRef = useRef(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);

  const triggerFeedback = useCallback((type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 1200);
  }, []);

  const handleDecodedText = useCallback(
    (text) => {
      let pathname = null;

      try {
        const url = new URL(text);
        pathname = url.pathname;
      } catch {
        // decoded value wasn't a full URL — treat it as a raw path if it looks like one
        if (text.startsWith("/")) {
          pathname = text;
        }
      }

      const match = pathname?.match(ASSET_QR_PATTERN);
      if (!match) {
        triggerFeedback("error", "No asset QR code found.");
        return;
      }

      const assetId = match[1];

      if (lastDetectedRef.current === assetId) return;
      lastDetectedRef.current = assetId;
      setTimeout(() => {
        if (lastDetectedRef.current === assetId) lastDetectedRef.current = null;
      }, 1500);

      triggerFeedback("success", "Asset verified");
      if (navigator.vibrate) navigator.vibrate(80);
      onDetect(assetId);
    },
    [validAssetIds, onDetect, triggerFeedback],
  );

  const decodeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(decodeFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const code = decodeImageData(imageData);
    if (code) {
      handleDecodedText(code.data);
    }

    rafRef.current = requestAnimationFrame(decodeFrame);
  }, [handleDecodedText]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;

    async function start() {
      setError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        rafRef.current = requestAnimationFrame(decodeFrame);
      } catch (err) {
        setError(
          err.name === "NotAllowedError"
            ? "Camera permission denied. Enable it in your browser settings."
            : "Couldn't access the camera.",
        );
      }
    }

    start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isActive, decodeFrame, stopCamera]);

  // Decode a QR from a user-picked image file (upload fallback), reusing
  // the exact same decode pipeline as useQRScanner's handleImageUpload.
  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;

      try {
        const decodedValue = await decodeImageFileWithTimeout(file);
        handleDecodedText(decodedValue);
      } catch (err) {
        if (err.message === "timeout") {
          triggerFeedback(
            "error",
            "Could not detect a QR code in time. Try better lighting/focus.",
          );
        } else {
          triggerFeedback("error", err.message || "Couldn't read that image.");
        }
      }
    },
    [handleDecodedText, triggerFeedback],
  );

  return { videoRef, canvasRef, error, feedback, handleImageUpload };
}

export default useAuditScanner;
