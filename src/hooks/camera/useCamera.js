import { useEffect, useRef, useState, useCallback } from "react";
import { decodeImageData } from "../../utils/qrDecode";

export const useCamera = ({ isOpen = true, onScan, onImageUpload }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);
  const frameCountRef = useRef(0);
  const focusResetTimeoutRef = useRef(null);
  const focusRingTimeoutRef = useRef(null);
  const lastFocusAtRef = useRef(0);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [focusSupported, setFocusSupported] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);

  //Camera lifecycle -------------
  const stopStream = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (focusResetTimeoutRef.current)
      clearTimeout(focusResetTimeoutRef.current);
    if (focusRingTimeoutRef.current) clearTimeout(focusRingTimeoutRef.current);
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
      const capabilities = track.getCapabilities?.() || {};
      setTorchSupported(Boolean(capabilities.torch));
      setFocusSupported(
        Boolean(capabilities.focusMode) &&
          Boolean(capabilities.pointsOfInterest),
      );

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

  //QR scan loop -------------
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      frameCountRef.current++;
      const tryAdaptive = frameCountRef.current % 3 === 0; // expensive pass every 3rd frame only

      const code = decodeImageData(imageData, { tryAdaptive });

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
      frameCountRef.current = 0;
      rafRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isReady, scanFrame]);

  // Controls ------------
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

  // Tap-to-focus -------
  const applyFocusConstraint = useCallback(async (x, y) => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return false;

    const caps = track.getCapabilities?.() || {};
    if (!caps.pointsOfInterest) return false;

    try {
      const advanced = [{ pointsOfInterest: [{ x, y }] }];
      if (caps.focusMode?.includes("single-shot")) {
        advanced[0].focusMode = "single-shot";
      } else if (caps.focusMode?.includes("continuous")) {
        advanced[0].focusMode = "continuous";
      }
      await track.applyConstraints({ advanced });

      if (focusResetTimeoutRef.current)
        clearTimeout(focusResetTimeoutRef.current);
      if (caps.focusMode?.includes("continuous")) {
        focusResetTimeoutRef.current = setTimeout(() => {
          track
            .applyConstraints({ advanced: [{ focusMode: "continuous" }] })
            .catch(() => {});
        }, 2500);
      }

      return true;
    } catch (err) {
      console.log("Tap-to-focus not applied:", err);
      return false;
    }
  }, []);

  const handleFocusTap = useCallback(
    (e) => {
      const video = videoRef.current;
      if (!isReady || !video) return;

      const now = Date.now();
      if (now - lastFocusAtRef.current < 300) return;
      lastFocusAtRef.current = now;

      const rect = video.getBoundingClientRect();
      const point = e.touches?.[0] ?? e;
      const px = point.clientX - rect.left;
      const py = point.clientY - rect.top;

      // Ignore taps outside the video bounds
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;

      // Show the ring immediately regardless of hardware support
      setFocusPoint({ x: px, y: py });
      if (focusRingTimeoutRef.current)
        clearTimeout(focusRingTimeoutRef.current);
      focusRingTimeoutRef.current = setTimeout(() => setFocusPoint(null), 700);

      const nx = px / rect.width;
      const ny = py / rect.height;
      applyFocusConstraint(nx, ny);
    },
    [isReady, applyFocusConstraint],
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
    focusSupported,
    focusPoint,
    // handlers
    toggleTorch,
    switchCamera,
    openFilePicker,
    handleFileChange,
    handleFocusTap,
  };
};
