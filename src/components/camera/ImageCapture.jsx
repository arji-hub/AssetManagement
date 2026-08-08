import { useImageCapture } from "../../hooks/camera/useImageCapture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ImageCapture.css";

const ImageCapture = ({ onCapture, onClose, isOpen = true }) => {
  const {
    videoRef,
    canvasRef,
    isReady,
    error,
    torchOn,
    torchSupported,
    focusPoint,
    focusStatus,
    focusSupported,
    orientation,
    retryCount,
    isCapturing,
    justCaptured,
    toggleTorch,
    switchCamera,
    handleFocusTap,
    capturePhoto,
    startStream,
    stopStream,
  } = useImageCapture({ isOpen, onCapture });

  const handleClose = () => {
    stopStream();
    onClose();
  };

  const handleShutter = () => {
    capturePhoto();
  };

  if (!isOpen) return null;

  const videoStyle = {
    transform: orientation === "landscape" ? "rotate(90deg)" : "none",
  };

  return (
    <div className="ic-camera">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="ic-camera-video"
        playsInline
        muted
        autoPlay
        onClick={handleFocusTap}
        onTouchStart={handleFocusTap}
        style={videoStyle}
      />

      <canvas ref={canvasRef} className="ic-camera-canvas" />

      {/* Capture flash */}
      {justCaptured && <div className="ic-capture-flash" aria-hidden="true" />}

      {/* Focus Ring with Status Indicator */}
      {focusPoint && (
        <>
          <span
            className={`ic-focus-ring ic-focus-ring--${focusStatus}`}
            style={{ left: focusPoint.x, top: focusPoint.y }}
            aria-label={`Focus ring ${focusStatus}`}
          />
          <span
            className={`ic-focus-orb ic-focus-orb--${focusStatus}`}
            style={{ left: focusPoint.x, top: focusPoint.y }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Main Overlay */}
      <div className="ic-camera-overlay">
        {/* Top Bar */}
        <div className="ic-camera-topbar">
          <button
            type="button"
            className="ic-icon-btn"
            onClick={handleClose}
            aria-label="Close camera"
            title="Close camera (ESC)"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>

          <span className="ic-camera-title">Take Photo</span>

          <button
            type="button"
            className={`ic-icon-btn ${torchOn ? "ic-icon-btn--active" : ""}`}
            onClick={toggleTorch}
            disabled={!torchSupported}
            aria-label="Toggle flashlight"
            title={
              torchSupported ? "Toggle flashlight" : "Flashlight not supported"
            }
          >
            <FontAwesomeIcon
              icon={torchOn ? "fa-solid fa-bolt-lightning" : "fa-solid fa-bolt"}
            />
          </button>
        </div>

        {/* Frame Guide */}
        <div className="ic-frame-guide" aria-hidden="true">
          <span className="ic-corner ic-corner--tl" />
          <span className="ic-corner ic-corner--tr" />
          <span className="ic-corner ic-corner--bl" />
          <span className="ic-corner ic-corner--br" />
        </div>

        {/* Status Message / Error Display */}
        <div className="ic-camera-status">
          {error ? (
            <div className="ic-camera-error">
              <FontAwesomeIcon
                icon="fa-solid fa-triangle-exclamation"
                className="ic-camera-error-icon"
                aria-hidden="true"
              />
              <p className="ic-camera-error-text">{error}</p>

              {retryCount < 3 && (
                <button
                  type="button"
                  className="ic-btn ic-btn--retry"
                  onClick={startStream}
                  aria-label="Retry camera access"
                >
                  Try Again
                </button>
              )}

              {retryCount >= 3 && (
                <p className="ic-camera-error-hint">
                  Please check your device settings or refresh the page.
                </p>
              )}
            </div>
          ) : (
            <p className="ic-camera-hint">
              {!isReady ? (
                <>
                  <FontAwesomeIcon
                    icon="fa-solid fa-spinner"
                    spin
                    className="ic-camera-hint-icon"
                    aria-hidden="true"
                  />
                  Starting camera...
                </>
              ) : focusSupported ? (
                <>
                  <FontAwesomeIcon
                    icon="fa-solid fa-hand-pointer"
                    className="ic-camera-hint-icon"
                    aria-hidden="true"
                  />
                  Tap to focus, then capture the photo
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon="fa-solid fa-maximize"
                    className="ic-camera-hint-icon"
                    aria-hidden="true"
                  />
                  Frame the subject and capture
                </>
              )}
            </p>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="ic-camera-bottombar">
          <span className="ic-bottombar-spacer" aria-hidden="true" />

          <button
            type="button"
            className="ic-shutter-btn"
            onClick={handleShutter}
            disabled={!isReady || isCapturing || Boolean(error)}
            aria-label="Capture photo"
            title="Capture photo"
          >
            <span className="ic-shutter-btn-inner" />
          </button>

          <button
            type="button"
            className="ic-icon-btn ic-icon-btn--switch"
            onClick={switchCamera}
            aria-label="Switch camera"
            title="Switch between front and back camera"
          >
            <FontAwesomeIcon icon="fa-solid fa-camera-rotate" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCapture;
