// src/pages/Asset/AssetRegistration.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import { ASSET_CATEGORIES } from "../../data/assets";
import { fetchCustodians } from "../../services/user";
import { fetchRooms } from "../../services/room";
import { addAsset } from "../../services/asset";
import { useAuth } from "../../context/AuthContext";
import "./AssetRegistration.css";

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Media" },
  { number: 3, label: "Assignment" },
];

// ─── StepIndicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  return (
    <div className="reg-steps">
      {STEPS.map((step, i) => {
        const isDone = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <React.Fragment key={step.number}>
            {/* connector line before every step except the first */}
            {i > 0 && (
              <div
                className={`reg-step-line ${isDone ? "reg-step-line--done" : ""}`}
              />
            )}

            <div className="reg-step-item">
              <div
                className={`reg-step-circle
                  ${isActive ? "reg-step-circle--active" : ""}
                  ${isDone ? "reg-step-circle--done" : ""}
                `}
              >
                {isDone ? (
                  <FontAwesomeIcon icon="fa-solid fa-check" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`reg-step-label
                  ${isActive ? "reg-step-label--active" : ""}
                  ${isDone ? "reg-step-label--done" : ""}
                `}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── ImagePanel ───────────────────────────────────────────────────────────────
function ImagePanel({ title, image, onImageChange, required }) {
  const fileRef = useRef(null);

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
        <button
          type="button"
          className="reg-image-btn"
          onClick={() => alert("Camera access not yet implemented.")}
        >
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
    </div>
  );
}

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function StepInfo({ form, onChange }) {
  return (
    <div className="reg-card">
      <p className="reg-card-title">Basic Asset Information</p>

      <div className="reg-grid">
        {/* Row 1: Serial Number | Category */}
        <div className="reg-field">
          <label className="reg-label">Serial Number</label>
          <input
            className="reg-input"
            name="serial_number"
            placeholder="e.g. SN-99823-X"
            value={form.serial_number}
            onChange={onChange}
          />
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Category <span className="reg-required">*</span>
          </label>
          <select
            className="reg-select"
            name="category_id"
            value={form.category_id}
            onChange={onChange}
          >
            <option value="">Select Category</option>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Description — spans full width, required */}
        <div className="reg-field reg-field--full">
          <label className="reg-label">
            Description <span className="reg-required">*</span>
          </label>
          <textarea
            className="reg-textarea"
            name="description"
            placeholder="Full asset description and technical specifications..."
            rows={4}
            value={form.description}
            onChange={onChange}
            required
          />
        </div>

        {/* Row 3: Date Acquired | Unit Value | Quantity */}
        <div className="reg-field">
          <label className="reg-label">
            Date Acquired <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="date"
            name="date_acquired"
            value={form.date_acquired}
            onChange={onChange}
          />
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Unit Value <span className="reg-required">*</span>
          </label>
          <div className="reg-input-prefix-wrap">
            <span className="reg-input-prefix">₱</span>
            <input
              className="reg-input reg-input--prefixed"
              type="number"
              name="unit_value"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.unit_value}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="reg-field">
          <label className="reg-label">
            Quantity <span className="reg-required">*</span>
          </label>
          <input
            className="reg-input"
            type="number"
            name="qty"
            min="1"
            placeholder="1"
            value={form.qty}
            onChange={onChange}
          />
        </div>

        {/* Row 4: Remarks — spans full width */}
        <div className="reg-field reg-field--full">
          <label className="reg-label">Remarks</label>
          <textarea
            className="reg-textarea"
            name="remarks"
            placeholder="Additional notes, maintenance history..."
            rows={3}
            value={form.remarks}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Media ────────────────────────────────────────────────────────────
function StepMedia({ assetImage, setAssetImage, docImage, setDocImage }) {
  return (
    <div className="reg-card">
      <p className="reg-card-title">Asset Media</p>
      <p className="reg-card-subtitle">
        Both images are required before proceeding.
      </p>

      <div className="reg-media-grid">
        <ImagePanel
          title="Asset Image"
          image={assetImage}
          onImageChange={setAssetImage}
          required
        />
        <ImagePanel
          title="PAR / ICS Document"
          image={docImage}
          onImageChange={setDocImage}
          required
        />
      </div>
    </div>
  );
}

// ─── Step 3: Assignment ───────────────────────────────────────────────────────
function StepAssignment({
  form,
  onChange,
  skippedWarning,
  fulltimeCustodians,
  parttimeCustodians,
  rooms,
  loadingOptions,
}) {
  return (
    <div className="reg-card">
      <p className="reg-card-title">Custody &amp; Location</p>
      <p className="reg-card-subtitle">
        Assign a custodian and room to this asset. You may skip and update this
        later.
      </p>

      {skippedWarning && (
        <div className="reg-skip-warning">
          <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
          This asset will be saved as <strong>unassigned</strong>. You can
          assign it later from the asset detail page.
        </div>
      )}

      <div className="reg-grid">
        <div className="reg-field">
          <label className="reg-label">Primary Custodian</label>
          <select
            className="reg-select"
            name="primary_custodian"
            value={form.primary_custodian}
            onChange={onChange}
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading…" : "Select Custodian"}
            </option>
            {fulltimeCustodians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullname}
              </option>
            ))}
          </select>
        </div>

        <div className="reg-field">
          <label className="reg-label">Local Custodian</label>
          <select
            className="reg-select"
            name="local_custodian"
            value={form.local_custodian}
            onChange={onChange}
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading…" : "Select Custodian"}
            </option>
            {parttimeCustodians.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullname}
              </option>
            ))}
          </select>
        </div>

        <div className="reg-field reg-field--full">
          <label className="reg-label">Location</label>
          <select
            className="reg-select"
            name="room_id"
            value={form.room_id}
            onChange={onChange}
            disabled={loadingOptions}
          >
            <option value="">
              {loadingOptions ? "Loading…" : "Select Location"}
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AssetRegistration() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [step, setStep] = useState(1);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const [assetImage, setAssetImage] = useState(null);
  const [docImage, setDocImage] = useState(null);

  // ── Firestore data for Step 3 dropdowns ─────────────────────────────────────
  const [custodians, setCustodians] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    // Fetch once on mount — early fetch avoids a visible delay when user reaches Step 3
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [fetchedCustodians, fetchedRooms] = await Promise.all([
          fetchCustodians(),
          fetchRooms(),
        ]);
        setCustodians(fetchedCustodians);
        setRooms(fetchedRooms);
      } catch (err) {
        console.error("Failed to load custodians/rooms:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const [form, setForm] = useState({
    serial_number: "",
    category_id: "",
    date_acquired: "",
    description: "",
    unit_value: "",
    remarks: "",
    qty: "1",
    primary_custodian: "",
    local_custodian: "",
    room_id: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── per-step validation ─────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1)
      return (
        form.description.trim() !== "" &&
        form.category_id !== "" &&
        form.date_acquired !== "" &&
        form.unit_value !== "" &&
        form.qty !== ""
      );
    if (step === 2) return assetImage !== null && docImage !== null;
    return true; // step 3 is optional
  };

  // ── navigation ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!canProceed()) return;
    setShowSkipWarning(false);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setShowSkipWarning(false);
    setStep((s) => s - 1);
  };

  // Step 3: "Skip for now" — show inline warning then allow save
  const handleSkip = () => {
    if (!showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      handleSave(true);
    }
  };

  useEffect(() => {
    if (showSkipWarning && isAssigned) {
      setShowSkipWarning(false);
    }
  }, [form.primary_custodian, form.local_custodian, form.room_id]);

  // ── save ────────────────────────────────────────────────────────────────────
  const handleSave = async (skipped = false) => {
    setSaving(true);
    setSaveError(null);
    try {
      await addAsset(
        {
          ...form,
          assetImageFile: assetImage.file,
          docImageFile: docImage.file,
        },
        role,
      );

      navigate("/asset");
    } catch (err) {
      console.error(err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fulltimeCustodians = custodians.filter((c) => c.role === "fulltime");
  const parttimeCustodians = custodians.filter((c) => c.role === "parttime");

  const isAssigned =
    form.primary_custodian || form.local_custodian || form.room_id;

  return (
    <MainLayout>
      <div className="reg-page">
        {/* ── header ── */}
        <div className="reg-header">
          <div className="reg-header-text">
            <div className="reg-header-eyebrow">
              <FontAwesomeIcon icon="fa-solid fa-layer-group" />
              Assets
              <FontAwesomeIcon
                icon="fa-solid fa-chevron-right"
                className="reg-header-sep"
              />
              Registration
            </div>
            <h1 className="reg-header-title">Register New Asset</h1>
          </div>
        </div>

        {/* ── step indicator ── */}
        <StepIndicator currentStep={step} />

        {/* ── step content ── */}
        <div className="reg-content">
          {step === 1 && <StepInfo form={form} onChange={handleChange} />}
          {step === 2 && (
            <StepMedia
              assetImage={assetImage}
              setAssetImage={setAssetImage}
              docImage={docImage}
              setDocImage={setDocImage}
            />
          )}
          {step === 3 && (
            <StepAssignment
              form={form}
              onChange={handleChange}
              skippedWarning={showSkipWarning}
              fulltimeCustodians={fulltimeCustodians}
              parttimeCustodians={parttimeCustodians}
              rooms={rooms}
              loadingOptions={loadingOptions}
            />
          )}
        </div>

        {/* ── footer ── */}
        <div className="reg-footer">
          <div className="reg-footer-left">
            {step > 1 && (
              <button
                type="button"
                className="reg-btn reg-btn--ghost"
                onClick={handleBack}
                disabled={saving}
              >
                <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
                Back
              </button>
            )}
          </div>

          {saveError && (
            <p className="reg-save-error">
              <FontAwesomeIcon icon="fa-solid fa-circle-exclamation" />
              {saveError}
            </p>
          )}

          <div className="reg-footer-right">
            {/* Cancel — always present */}
            <button
              type="button"
              className="reg-btn reg-btn--cancel"
              onClick={() => navigate("/asset")}
              disabled={saving}
            >
              Cancel
            </button>

            {/* Step 3: mutually exclusive — Save when assigned, Skip when not */}
            {step === 3 && (
              <>
                {isAssigned ? (
                  <button
                    type="button"
                    className="reg-btn reg-btn--primary"
                    onClick={() => handleSave(false)}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`reg-btn ${showSkipWarning ? "reg-btn--warn" : "reg-btn--ghost"}`}
                    onClick={handleSkip}
                    disabled={saving}
                  >
                    {showSkipWarning ? "Confirm Skip" : "Skip for now"}
                  </button>
                )}
              </>
            )}

            {/* Steps 1 & 2: Next */}
            {step < 3 && (
              <button
                type="button"
                className="reg-btn reg-btn--primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
              </button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AssetRegistration;
