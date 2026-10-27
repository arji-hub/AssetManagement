import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useHeaderFooter from "../../../hooks/settings/config/useHeaderFooter";
import { HEADER_FOOTER_SLOTS } from "../../../services/headerFooter";
import Cropper from "react-easy-crop";
import { CROP_CONFIG } from "../../../utils/cropImage";
import { createPortal } from "react-dom";
import "./HeaderFooter.css";

function ImageSlot({ label, description, slot, onPick, onSave, onDiscard }) {
  const inputRef = useRef(null);
  const { src, hasDraft, isSaving, error } = slot;

  return (
    <div className="hf-slot">
      <div className="hf-slot-info">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>

      <div className="hf-preview">
        <img src={src} alt={`${label} preview`} />
      </div>

      {error && <span className="field-error hf-slot-error">{error}</span>}

      <div className="hf-slot-actions">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hf-file-input"
          onChange={(e) => {
            onPick(e.target.files?.[0] ?? null);
            // Allow re-picking the same file after a discard or error.
            e.target.value = "";
          }}
        />

        {hasDraft && (
          <button
            type="button"
            className="hf-btn-secondary hf-action-discard"
            onClick={onDiscard}
            disabled={isSaving}
          >
            Discard
          </button>
        )}

        <button
          type="button"
          className="settings-edit-btn hf-action-replace"
          onClick={() => inputRef.current?.click()}
          disabled={isSaving}
        >
          <FontAwesomeIcon icon="fa-solid fa-image" />
          Replace image
        </button>

        {hasDraft && (
          <button
            type="button"
            className="hf-btn-primary hf-action-save"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : `Save ${label.toLowerCase()}`}
          </button>
        )}
      </div>
    </div>
  );
}

function CropModal({ target, onApply, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [busy, setBusy] = useState(false);

  const { aspect } = CROP_CONFIG[target.slot];
  const label =
    target.slot === HEADER_FOOTER_SLOTS.HEADER ? "header" : "footer";

  const apply = async () => {
    if (!area) return;
    setBusy(true);
    await onApply(area);
  };

  return (
    <div className="hf-crop-overlay">
      <div className="hf-crop-modal">
        <h4>Crop {label}</h4>
        <div className="hf-crop-area">
          <Cropper
            image={target.src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setArea(pixels)}
            objectFit="horizontal-cover"
          />
        </div>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
        />
        <div className="hf-crop-actions">
          <button
            type="button"
            className="hf-btn-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="hf-btn-primary"
            onClick={apply}
            disabled={busy || !area}
          >
            {busy ? "Applying..." : "Apply crop"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HeaderFooter() {
  const {
    loading,
    loadError,
    header,
    footer,
    pickFile,
    discard,
    save,
    cropTarget,
    confirmCrop,
    cancelCrop,
  } = useHeaderFooter();

  const { HEADER, FOOTER } = HEADER_FOOTER_SLOTS;

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3>PDF header and footer</h3>
          <p>
            These images appear at the top and bottom of every page in generated
            PDF reports. Use a PNG or JPG up to 2 MB.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="hf-state">Loading header and footer...</div>
      ) : (
        <div className="hf-body">
          {loadError && <div className="hf-state">{loadError}</div>}

          <ImageSlot
            label="Header"
            description="Shown at the top of every page."
            slot={header}
            onPick={(file) => pickFile(HEADER, file)}
            onSave={() => save(HEADER)}
            onDiscard={() => discard(HEADER)}
          />
          <ImageSlot
            label="Footer"
            description="Shown at the bottom of every page."
            slot={footer}
            onPick={(file) => pickFile(FOOTER, file)}
            onSave={() => save(FOOTER)}
            onDiscard={() => discard(FOOTER)}
          />
        </div>
      )}
      {cropTarget &&
        createPortal(
          <CropModal
            key={cropTarget.src}
            target={cropTarget}
            onApply={confirmCrop}
            onCancel={cancelCrop}
          />,
          document.querySelector(".layout-wrapper") ?? document.body,
        )}
    </section>
  );
}

export default HeaderFooter;
