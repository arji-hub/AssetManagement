import { useEffect, useRef, useState, useCallback } from "react";
import { decodeImageData } from "../../utils/qrDecode";

// Configuration constants
const CAMERA_CONFIG = {
  SCAN_DEBOUNCE_MS: 500,
  SCAN_INTERVAL_MS: 100,
  FOCUS_RESET_MS: 2500,
  FOCUS_RING_MS: 700,
  FOCUS_TAP_THROTTLE_MS: 300,
  FOCUS_LOCK_DELAY_MS: 300,
  VIDEO_WIDTH: 1280,
  VIDEO_HEIGHT: 720,
  VIEWFINDER_PADDING_FACTOR: 1.15,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000,
};

/**
 * useCamera - Advanced QR scanning hook with error recovery, performance optimization,
 * and enhanced user feedback for asset auditing workflows.
 *
 * @param {Object} config
 * @param {boolean} config.isOpen - Whether camera modal is open
 * @param {Function} config.onScan - Callback when QR code is scanned (receives data string)
 * @param {Function} config.onImageUpload - Callback for file upload
 * @returns {Object} Camera controls, refs, and state
 */
export const useCamera = ({ isOpen = true, onScan, onImageUpload }) => {
  // Refs for DOM elements
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);
  const viewfinderRef = useRef(null);

  // Refs for timing and debouncing
  const focusResetTimeoutRef = useRef(null);
  const focusRingTimeoutRef = useRef(null);
  const lastFocusAtRef = useRef(0);
  const lastScannedRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // State management
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [focusSupported, setFocusSupported] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [focusStatus, setFocusStatus] = useState("idle"); // idle | focusing | locked
  const [justScanned, setJustScanned] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [retryCount, setRetryCount] = useState(0);

  // Maps the on-screen viewfinder box to the video's native pixel coordinates,
  // accounting for object-fit: cover scaling/cropping between the video's
  // natural resolution and its rendered display size.
  function getCropRect(
    video,
    viewfinder,
    paddingFactor = CAMERA_CONFIG.VIEWFINDER_PADDING_FACTOR,
  ) {
    if (!video?.videoWidth || !viewfinder) return null;

    const videoRect = video.getBoundingClientRect();
    const vfRect = viewfinder.getBoundingClientRect();

    const scale = Math.max(
      videoRect.width / video.videoWidth,
      videoRect.height / video.videoHeight,
    );

    const scaledW = video.videoWidth * scale;
    const scaledH = video.videoHeight * scale;
    const offsetX = (scaledW - videoRect.width) / 2;
    const offsetY = (scaledH - videoRect.height) / 2;

    const dx = vfRect.left - videoRect.left;
    const dy = vfRect.top - videoRect.top;

    const rawW = vfRect.width / scale;
    const rawH = vfRect.height / scale;

    // Pad slightly beyond the visible box — gives jsQR the quiet-zone
    // margin it needs, and forgives a code that's just outside the guide.
    const cropW = rawW * paddingFactor;
    const cropH = rawH * paddingFactor;
    const cropX = (dx + offsetX) / scale - (cropW - rawW) / 2;
    const cropY = (dy + offsetY) / scale - (cropH - rawH) / 2;

    return {
      x: Math.max(0, Math.round(cropX)),
      y: Math.max(0, Math.round(cropY)),
      width: Math.round(Math.min(cropW, video.videoWidth)),
      height: Math.round(Math.min(cropH, video.videoHeight)),
    };
  }

  // ============ Device Orientation Handling ============
  useEffect(() => {
    const handleOrientationChange = () => {
      const angle = window.innerHeight > window.innerWidth ? 0 : 90;
      const newOrientation = angle === 0 ? "portrait" : "landscape";
      setOrientation(newOrientation);
      console.log("[Camera] Orientation changed to:", newOrientation);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  // ============ Camera Lifecycle ============
  const stopStream = useCallback(() => {
    console.log("[Camera] Stopping stream");

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (focusResetTimeoutRef.current)
      clearTimeout(focusResetTimeoutRef.current);
    if (focusRingTimeoutRef.current) clearTimeout(focusRingTimeoutRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(async () => {
    console.log("[Camera] Starting stream with facingMode:", facingMode);

    setError(null);
    setIsReady(false);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: CAMERA_CONFIG.VIDEO_WIDTH },
          height: { ideal: CAMERA_CONFIG.VIDEO_HEIGHT },
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
      const focusModes = capabilities.focusMode || [];
      const canManualFocus = focusModes.includes("manual");
      const canTargetPoint = Boolean(capabilities.pointsOfInterest);

      setFocusSupported(canManualFocus || canTargetPoint);

      setIsReady(true);
      setRetryCount(0);

      console.log("[Camera] Stream started successfully", {
        torchSupported: Boolean(capabilities.torch),
        focusSupported: Boolean(capabilities.focusMode),
      });
    } catch (err) {
      console.error("[Camera] Camera init failed:", {
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

      // Auto-retry for temporary failures (not permission denials)
      if (
        err?.name !== "NotAllowedError" &&
        retryCount < CAMERA_CONFIG.MAX_RETRY_ATTEMPTS
      ) {
        console.log("[Camera] Scheduling retry attempt", {
          attempt: retryCount + 1,
          maxAttempts: CAMERA_CONFIG.MAX_RETRY_ATTEMPTS,
          delayMs: CAMERA_CONFIG.RETRY_DELAY_MS,
        });

        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
        }, CAMERA_CONFIG.RETRY_DELAY_MS);
      }
    }
  }, [facingMode, stopStream, retryCount]);

  // Retry when retryCount changes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, facingMode]);

  // ============ QR Scan Loop (Throttled & Deduplicated) ============
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const viewfinder = viewfinderRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const now = performance.now();

      // Throttle scanning to reduce CPU usage
      if (now - lastScanTimeRef.current >= CAMERA_CONFIG.SCAN_INTERVAL_MS) {
        lastScanTimeRef.current = now;

        const crop = getCropRect(video, viewfinder) || {
          x: 0,
          y: 0,
          width: video.videoWidth,
          height: video.videoHeight,
        };

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = crop.width;
        canvas.height = crop.height;
        ctx.drawImage(
          video,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height,
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = decodeImageData(imageData, { tryAdaptive: true });

        if (code?.data) {
          const currentTime = Date.now();

          // Debounce: prevent scanning same QR code within time window
          if (
            lastScannedRef.current?.data === code.data &&
            currentTime - lastScannedRef.current.timestamp <
              CAMERA_CONFIG.SCAN_DEBOUNCE_MS
          ) {
            // Skip this scan, but continue looping
            rafRef.current = requestAnimationFrame(scanFrame);
            return;
          }

          // New scan detected
          lastScannedRef.current = { data: code.data, timestamp: currentTime };

          console.log("[Camera] QR code detected:", {
            data: code.data,
            timestamp: new Date().toISOString(),
          });

          // Visual feedback
          setJustScanned(true);
          setTimeout(() => setJustScanned(false), 300);

          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(80);
          }

          // Call parent handler
          onScan?.(code.data);
          return;
        }
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [onScan]);

  // Start/stop scan loop
  useEffect(() => {
    if (isReady) {
      console.log("[Camera] Starting scan loop");
      rafRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isReady, scanFrame]);

  // ============ Torch Control ============
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks?.()[0];
    if (!track) return;

    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn((prev) => !prev);
      console.log("[Camera] Torch toggled to:", !torchOn);
    } catch (err) {
      console.error("[Camera] Torch control failed:", err?.message);
    }
  }, [torchOn]);

  // ============ Camera Switching ============
  const switchCamera = useCallback(() => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    console.log("[Camera] Switching to", newMode, "camera");
    setFacingMode(newMode);
  }, [facingMode]);

  // ============ File Upload Handling ============
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];

      if (!file) {
        console.log("[Camera] File selection cancelled");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Please select a valid image file.";
        setError(errorMsg);
        console.error("[Camera] Invalid file type:", file.type);
        return;
      }

      // Validate file size (max 5MB)
      const maxSizeBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = "Image file too large. Maximum size is 5MB.";
        setError(errorMsg);
        console.error("[Camera] File too large:", {
          size: file.size,
          maxSize: maxSizeBytes,
        });
        return;
      }

      console.log("[Camera] File selected for upload:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (onImageUpload) {
        onImageUpload(file);
      } else {
        console.warn("[Camera] No onImageUpload handler provided");
      }

      // Clear the input
      e.target.value = "";
    },
    [onImageUpload],
  );

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

      // Auto-reset focus mode after timeout
      if (caps.focusMode?.includes("continuous")) {
        focusResetTimeoutRef.current = setTimeout(() => {
          track
            .applyConstraints({ advanced: [{ focusMode: "continuous" }] })
            .catch(() => {});
        }, CAMERA_CONFIG.FOCUS_RESET_MS);
      }

      console.log("[Camera] Focus constraint applied at:", { x, y });
      return true;
    } catch (err) {
      console.error("[Camera] Tap-to-focus failed:", err?.message);
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

      // Ignore taps outside the video bounds
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;

      // Show focusing state
      setFocusStatus("focusing");
      setFocusPoint({ x: px, y: py });

      if (focusRingTimeoutRef.current) {
        clearTimeout(focusRingTimeoutRef.current);
      }

      // Transition to locked state, then hide
      focusRingTimeoutRef.current = setTimeout(() => {
        setFocusStatus("locked");
        setTimeout(() => {
          setFocusPoint(null);
          setFocusStatus("idle");
        }, 1000);
      }, CAMERA_CONFIG.FOCUS_LOCK_DELAY_MS);

      // Normalize coordinates (0-1 range)
      const nx = px / rect.width;
      const ny = py / rect.height;
      applyFocusConstraint(nx, ny);
    },
    [isReady, focusSupported, applyFocusConstraint],
  );

  // ============ Public API ============
  return {
    // DOM refs
    videoRef,
    canvasRef,
    fileInputRef,
    viewfinderRef,

    // State
    isReady,
    error,
    torchOn,
    torchSupported,
    focusSupported,
    focusPoint,
    focusStatus,
    justScanned,
    orientation,
    retryCount,

    // Handlers
    toggleTorch,
    switchCamera,
    openFilePicker,
    handleFileChange,
    handleFocusTap,
    startStream, // Exposed for manual retry
  };
};
