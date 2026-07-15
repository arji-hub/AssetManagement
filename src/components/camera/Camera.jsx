import { useCamera } from "../../hooks/camera/useCamera";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Camera.css";

const Camera = ({ onScan, onImageUpload, onClose, isOpen = true }) => {
  const {
    videoRef,
    canvasRef,
    fileInputRef,
    isReady,
    error,
    torchOn,
    torchSupported,
    focusPoint,
    focusSupported,
    toggleTorch,
    switchCamera,
    openFilePicker,
    handleFileChange,
    handleFocusTap,
  } = useCamera({ isOpen, onScan, onImageUpload });

  if (!isOpen) return null;

  return (
    <div className="qr-camera">
      <video
        ref={videoRef}
        className="qr-camera-video"
        playsInline
        muted
        autoPlay
        onClick={handleFocusTap}
        onTouchStart={handleFocusTap}
      />
      <canvas ref={canvasRef} className="qr-camera-canvas" />

      {focusPoint && (
        <span
          className="qr-focus-ring"
          style={{ left: focusPoint.x, top: focusPoint.y }}
        />
      )}

      <div className="qr-camera-overlay">
        <div className="qr-camera-topbar">
          <button
            type="button"
            className="qr-icon-btn"
            onClick={onClose}
            aria-label="Close scanner"
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
          >
            <FontAwesomeIcon
              icon={torchOn ? "fa-solid fa-bolt-lightning" : "fa-solid fa-bolt"}
            />
          </button>
        </div>

        <div className="qr-viewfinder">
          <span className="qr-corner qr-corner--tl" />
          <span className="qr-corner qr-corner--tr" />
          <span className="qr-corner qr-corner--bl" />
          <span className="qr-corner qr-corner--br" />
          {isReady && !error && <div className="qr-scan-line" />}
        </div>

        <p className="qr-camera-hint">
          {error && (
            <FontAwesomeIcon
              icon="fa-solid fa-triangle-exclamation"
              className="qr-camera-hint-icon"
            />
          )}
          {error
            ? error
            : isReady
              ? focusSupported
                ? "Tap to focus, align the QR code within the frame"
                : "Align the QR code within the frame"
              : "Starting camera..."}
        </p>

        <div className="qr-camera-bottombar">
          <button
            type="button"
            className="qr-icon-btn"
            onClick={openFilePicker}
            aria-label="Upload image"
          >
            <FontAwesomeIcon icon="fa-solid fa-image" />
          </button>
          <button
            type="button"
            className="qr-icon-btn qr-icon-btn--switch"
            onClick={switchCamera}
            aria-label="Switch camera"
          >
            <FontAwesomeIcon icon="fa-solid fa-camera-rotate" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="qr-camera-file-input"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default Camera;
