import { useEffect, useRef, useState, useCallback } from "react";

// Configuration constants
const CAMERA_CONFIG = {
  FOCUS_RESET_MS: 2500,
  FOCUS_RING_MS: 700,
  FOCUS_TAP_THROTTLE_MS: 300,
  FOCUS_LOCK_DELAY_MS: 300,
  VIDEO_WIDTH: 1280,
  VIDEO_HEIGHT: 720,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000,
  CAPTURE_FLASH_MS: 200,
  JPEG_QUALITY: 0.92,
};

export const useImageCapture = ({ isOpen = true, onCapture } = {}) => {
  // Refs for DOM elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Refs for timing and debouncing
  const focusResetTimeoutRef = useRef(null);
  const focusRingTimeoutRef = useRef(null);
  const lastFocusAtRef = useRef(0);

  // State management
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [focusSupported, setFocusSupported] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [focusStatus, setFocusStatus] = useState("idle");
  const [orientation, setOrientation] = useState("portrait");
  const [retryCount, setRetryCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [justCaptured, setJustCaptured] = useState(false);

  // ============ Device Orientation Handling ============
  useEffect(() => {
    const handleOrientationChange = () => {
      const angle = window.innerHeight > window.innerWidth ? 0 : 90;
      setOrientation(angle === 0 ? "portrait" : "landscape");
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  const requestIdRef = useRef(0);

  // ============ Camera Lifecycle ============
  const stopStream = useCallback(() => {
    //invalidate any in-flight startStream() call.
    requestIdRef.current += 1;

    if (focusResetTimeoutRef.current)
      clearTimeout(focusResetTimeoutRef.current);
    if (focusRingTimeoutRef.current) clearTimeout(focusRingTimeoutRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    setError(null);
    setIsReady(false);
    stopStream();

    const requestId = requestIdRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: CAMERA_CONFIG.VIDEO_WIDTH },
          height: { ideal: CAMERA_CONFIG.VIDEO_HEIGHT },
        },
        audio: false,
      });

      // Camera was closed (or another start was triggered) while this
      // getUserMedia() call was in flight — discard the stream instead of
      // wiring it up, or it'll keep the camera light on indefinitely.
      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Re-check after the await for play() too, for the same reason.
      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        streamRef.current = null;
        return;
      }

      const [track] = stream.getVideoTracks();
      const capabilities = track.getCapabilities?.() || {};

      setTorchSupported(Boolean(capabilities.torch));
      const focusModes = capabilities.focusMode || [];
      const canManualFocus = focusModes.includes("manual");
      const canTargetPoint = Boolean(capabilities.pointsOfInterest);

      setFocusSupported(canManualFocus || canTargetPoint);

      setIsReady(true);
      setRetryCount(0);
    } catch (err) {
      console.error("[ImageCapture] Camera init failed:", {
        error: err?.name,
        message: err?.message,
        facingMode,
        retryCount,
        timestamp: new Date().toISOString(),
      });

      const errorMsg =
        err?.name === "NotAllowedError"
          ? "Camera access was denied. Enable it in your browser settings."
          : err?.name === "NotFoundError"
            ? "No camera device found on this device."
            : "Unable to access the camera on this device.";

      setError(errorMsg);

      if (
        err?.name !== "NotAllowedError" &&
        retryCount < CAMERA_CONFIG.MAX_RETRY_ATTEMPTS
      ) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, CAMERA_CONFIG.RETRY_DELAY_MS);
      }
    }
  }, [facingMode, stopStream, retryCount]);

  //ulitin when retryCount changes
  useEffect(() => {
    if (retryCount > 0 && retryCount <= CAMERA_CONFIG.MAX_RETRY_ATTEMPTS) {
      startStream();
    }
  }, [retryCount, startStream]);

  // Start/stop stream based on isOpen
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    startStream();
    return () => stopStream();
  }, [isOpen, facingMode]);

  // ============ Torch Control ============
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return;

    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((prev) => !prev);
    } catch (err) {
      console.error("[ImageCapture] Torch control failed:", err?.message);
    }
  }, [torchOn]);

  // ============ Camera Switching ============
  const switchCamera = useCallback(() => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
  }, [facingMode]);

  // ============ Tap-to-Focus ============
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

      if (focusResetTimeoutRef.current) {
        clearTimeout(focusResetTimeoutRef.current);
      }

      if (caps.focusMode?.includes("continuous")) {
        focusResetTimeoutRef.current = setTimeout(() => {
          track
            .applyConstraints({ advanced: [{ focusMode: "continuous" }] })
            .catch(() => {});
        }, CAMERA_CONFIG.FOCUS_RESET_MS);
      }

      return true;
    } catch (err) {
      console.error("[ImageCapture] Tap-to-focus failed:", err?.message);
      return false;
    }
  }, []);

  const handleFocusTap = useCallback(
    (e) => {
      const video = videoRef.current;
      if (!isReady || !video || !focusSupported) return;

      const now = Date.now();
      if (now - lastFocusAtRef.current < CAMERA_CONFIG.FOCUS_TAP_THROTTLE_MS) {
        return;
      }
      lastFocusAtRef.current = now;

      const rect = video.getBoundingClientRect();
      const point = e.touches?.[0] ?? e;
      const px = point.clientX - rect.left;
      const py = point.clientY - rect.top;

      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;

      setFocusStatus("focusing");
      setFocusPoint({ x: px, y: py });

      if (focusRingTimeoutRef.current) {
        clearTimeout(focusRingTimeoutRef.current);
      }

      focusRingTimeoutRef.current = setTimeout(() => {
        setFocusStatus("locked");
        setTimeout(() => {
          setFocusPoint(null);
          setFocusStatus("idle");
        }, 1000);
      }, CAMERA_CONFIG.FOCUS_LOCK_DELAY_MS);

      const nx = px / rect.width;
      const ny = py / rect.height;
      applyFocusConstraint(nx, ny);
    },
    [isReady, focusSupported, applyFocusConstraint],
  );

  // ============ Still Capture ============
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isReady) return;
    if (video.readyState < video.HAVE_CURRENT_DATA) return;

    setIsCapturing(true);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);

        if (!blob) {
          console.error("[ImageCapture] Failed to encode captured frame");
          return;
        }

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(60);
        }

        // Flash feedback
        setJustCaptured(true);
        setTimeout(
          () => setJustCaptured(false),
          CAMERA_CONFIG.CAPTURE_FLASH_MS,
        );

        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        onCapture?.(file);
      },
      "image/jpeg",
      CAMERA_CONFIG.JPEG_QUALITY,
    );
  }, [isReady, onCapture]);

  return {
    // DOM refs
    videoRef,
    canvasRef,

    // State
    isReady,
    error,
    torchOn,
    torchSupported,
    focusSupported,
    focusPoint,
    focusStatus,
    orientation,
    retryCount,
    isCapturing,
    justCaptured,

    // Handlers
    toggleTorch,
    switchCamera,
    handleFocusTap,
    capturePhoto,
    startStream,
    stopStream,
  };
};
