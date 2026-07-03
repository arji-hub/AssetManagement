import "./ImagePanel.css";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCamera } from "../../hooks/useCamera";

function ImagePanel({ title, image, onImageChange, required }) {
  const fileRef = useRef(null);

  const handleCapture = (file) => {
    onImageChange({ file, preview: URL.createObjectURL(file) });
  };

  const { openCamera, inputProps: cameraInputProps } = useCamera(handleCapture);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageChange({ file, preview: URL.createObjectURL(file) });
  };

  const handleRemove = () => onImageChange(null);

  return (
    <div
      className={`reg-image-panel ${required && !image ? "reg-image-panel--empty" : ""}`}
    >
      <p className="reg-image-panel-title">
        {title}
        {required && <span className="reg-required">*</span>}
      </p>

      <div className="reg-image-drop">
        {image?.preview ? (
          <>
            <img src={image.preview} alt="preview" />
            <button
              type="button"
              className="reg-image-remove"
              onClick={handleRemove}
              title="Remove image"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" />
            </button>
          </>
        ) : (
          <div className="reg-image-placeholder">
            <FontAwesomeIcon icon="fa-solid fa-image" />
            <span>No image selected</span>
          </div>
        )}
      </div>

      <div className="reg-image-actions">
        <button type="button" className="reg-image-btn" onClick={openCamera}>
          <FontAwesomeIcon icon="fa-solid fa-camera" />
          Scan via camera
        </button>

        <button
          type="button"
          className="reg-image-btn"
          onClick={() => fileRef.current?.click()}
        >
          <FontAwesomeIcon icon="fa-solid fa-upload" />
          Upload from files
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <input {...cameraInputProps} />
    </div>
  );
}

export default ImagePanel;
