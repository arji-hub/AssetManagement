import { useEffect, useRef, useState, useCallback } from "react";
import jsQR from "jsqr";
import { decodeImageData } from "../../utils/qrDecode";

/**
 * useCamera
 * Owns camera stream lifecycle, QR scan loop, torch/facing-mode controls,
 * and image-upload fallback. Camera.jsx just renders what this returns.
 */
export const useCamera = ({ isOpen = true, onScan, onImageUpload }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  // ---------------- Camera lifecycle ----------------
  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setIsReady(false);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities?.();
      setTorchSupported(Boolean(capabilities?.torch));

      setIsReady(true);
    } catch (err) {
      console.error("Camera init failed:", err);
      setError(
        err?.name === "NotAllowedError"
          ? "Camera access was denied. Enable it in your browser settings."
          : "Unable to access the camera on this device.",
      );
    }
  }, [facingMode, stopStream]);

  useEffect(() => {
    if (!isOpen) return;
    startStream();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  // ---------------- QR scan loop ----------------
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = decodeImageData(imageData);

      if (code?.data) {
        if (navigator.vibrate) navigator.vibrate(80);
        onScan?.(code.data);
        return;
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [onScan]);

  useEffect(() => {
    if (isReady) {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isReady, scanFrame]);

  // ---------------- Controls ----------------
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((prev) => !prev);
    } catch (err) {
      console.log("Torch not supported:", err);
    }
  }, [torchOn]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      console.log("File selected:", file);
      if (file && onImageUpload) {
        onImageUpload(file);
      } else if (file) {
        console.log("No onImageUpload handler provided");
      }
      e.target.value = "";
    },
    [onImageUpload],
  );

  return {
    // refs
    videoRef,
    canvasRef,
    fileInputRef,
    // state
    isReady,
    error,
    torchOn,
    torchSupported,
    // handlers
    toggleTorch,
    switchCamera,
    openFilePicker,
    handleFileChange,
  };
};
