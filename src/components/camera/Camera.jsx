import { useCamera } from "../../hooks/camera/useCamera";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Camera.css";

const Camera = ({ onScan, onImageUpload, onClose, isOpen = true }) => {
  const {
    videoRef,
    canvasRef,
    fileInputRef,
    viewfinderRef,
    isReady,
    error,
    torchOn,
    torchSupported,
    focusPoint,
    focusStatus,
    focusSupported,
    justScanned,
    orientation,
    retryCount,
    toggleTorch,
    switchCamera,
    openFilePicker,
    handleFileChange,
    handleFocusTap,
    startStream,
  } = useCamera({ isOpen, onScan, onImageUpload });

  if (!isOpen) return null;

  const videoStyle = {
    transform: orientation === "landscape" ? "rotate(90deg)" : "none",
  };

  return (
    <div className="qr-camera">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="qr-camera-video"
        playsInline
        muted
        autoPlay
        onClick={handleFocusTap}
        onTouchStart={handleFocusTap}
        style={videoStyle}
      />

      {/* Hidden Canvas for QR Processing */}
      <canvas ref={canvasRef} className="qr-camera-canvas" />

      {/* Focus Ring with Status Indicator */}
      {focusPoint && (
        <span
          className={`qr-focus-ring qr-focus-ring--${focusStatus}`}
          style={{ left: focusPoint.x, top: focusPoint.y }}
          aria-label={`Focus ring ${focusStatus}`}
        />
      )}

      {/* Main Overlay */}
      <div className="qr-camera-overlay">
        {/* Top Bar */}
        <div className="qr-camera-topbar">
          <button
            type="button"
            className="qr-icon-btn"
            onClick={onClose}
            aria-label="Close scanner"
            title="Close scanner (ESC)"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>

          <span className="qr-camera-title">Scan Asset QR Code</span>

          <button
            type="button"
            className={`qr-icon-btn ${torchOn ? "qr-icon-btn--active" : ""}`}
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

        {/* Viewfinder with Scan Guide */}
        <div
          className={`qr-viewfinder ${
            justScanned ? "qr-viewfinder--scanned" : ""
          }`}
          ref={viewfinderRef}
        >
          {/* Corner Guides */}
          <span className="qr-corner qr-corner--tl" aria-hidden="true" />
          <span className="qr-corner qr-corner--tr" aria-hidden="true" />
          <span className="qr-corner qr-corner--bl" aria-hidden="true" />
          <span className="qr-corner qr-corner--br" aria-hidden="true" />
        </div>

        {/* Status Message / Error Display */}
        <div className="qr-camera-status">
          {error ? (
            <div className="qr-camera-error">
              <FontAwesomeIcon
                icon="fa-solid fa-triangle-exclamation"
                className="qr-camera-error-icon"
                aria-hidden="true"
              />
              <p className="qr-camera-error-text">{error}</p>

              {/* Error Recovery - Show Retry Button if Max Retries Not Reached */}
              {retryCount < 3 && (
                <button
                  type="button"
                  className="qr-btn qr-btn--retry"
                  onClick={startStream}
                  aria-label="Retry camera access"
                >
                  Try Again
                </button>
              )}

              {/* Max Retries Reached */}
              {retryCount >= 3 && (
                <p className="qr-camera-error-hint">
                  Please check your device settings or refresh the page.
                </p>
              )}
            </div>
          ) : (
            <p className="qr-camera-hint">
              {!isReady ? (
                <>
                  <FontAwesomeIcon
                    icon="fa-solid fa-spinner"
                    spin
                    className="qr-camera-hint-icon"
                    aria-hidden="true"
                  />
                  Starting camera...
                </>
              ) : focusSupported ? (
                <>
                  <FontAwesomeIcon
                    icon="fa-solid fa-hand-pointer"
                    className="qr-camera-hint-icon"
                    aria-hidden="true"
                  />
                  Tap to focus, align the QR code within the frame
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon="fa-solid fa-maximize"
                    className="qr-camera-hint-icon"
                    aria-hidden="true"
                  />
                  Align the QR code within the frame
                </>
              )}
            </p>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="qr-camera-bottombar">
          <button
            type="button"
            className="qr-icon-btn"
            onClick={openFilePicker}
            aria-label="Upload image from gallery"
            title="Upload image from gallery"
          >
            <FontAwesomeIcon icon="fa-solid fa-image" />
          </button>

          <button
            type="button"
            className="qr-icon-btn qr-icon-btn--switch"
            onClick={switchCamera}
            aria-label="Switch camera"
            title="Switch between front and back camera"
          >
            <FontAwesomeIcon icon="fa-solid fa-camera-rotate" />
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="qr-camera-file-input"
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </div>
  );
};

export default Camera;
