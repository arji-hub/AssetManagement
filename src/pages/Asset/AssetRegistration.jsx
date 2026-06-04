// src/pages/Asset/AssetRegistration.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import { ASSET_CATEGORIES, ASSET_STATUS } from "../../data/assets";
import "./AssetRegistration.css";

const LOCATIONS = []; // replace with real Firestore fetch later

// ── reusable image upload panel ───────────────────────────────────────────────
function ImagePanel({ title, image, onImageChange }) {
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange({ file, preview: url });
  };

  return (
    <div className="reg-image-panel">
      <p className="reg-image-panel-title">{title}</p>

      <div className="reg-image-drop">
        {image?.preview ? (
          <img src={image.preview} alt="preview" />
        ) : (
          <span className="reg-image-drop-label">Upload Image</span>
        )}
      </div>

      <button
        type="button"
        className="reg-image-btn"
        onClick={() => {
          /* camera access — placeholder */
          alert("Camera access not yet implemented.");
        }}
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

// ── main component 
function AssetRegistration() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // image state
  const [assetImage, setAssetImage] = useState(null);
  const [parImage, setParImage] = useState(null);

  // form state
  const [form, setForm] = useState({
    serial_number: "",
    category_id: "",
    date_acquired: "",
    description: "",
    acquisition_cost: "",
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: write to Firestore via assetService / processAsset
      console.log("Saving asset:", form, assetImage, parImage);
      navigate("/asset");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <form className="reg-page" onSubmit={handleSave}>

        {/* ── breadcrumb header ── */}
        <div className="reg-header">
          <h1 className="reg-breadcrumb">
            Assets <span>&gt; Registration</span>
          </h1>
        </div>

        {/* ── body: left images + right form ── */}
        <div className="reg-body">

          {/* LEFT — image upload panels */}
          <div className="reg-left">
            <ImagePanel
              title="Asset Image"
              image={assetImage}
              onImageChange={setAssetImage}
            />
            <ImagePanel
              title="PAR/ICS Document"
              image={parImage}
              onImageChange={setParImage}
            />
          </div>

          {/* RIGHT — form panels */}
          <div className="reg-right">

            {/* ── Basic Asset Information ── */}
            <div className="reg-card">
              <p className="reg-card-title">Basic Asset Information</p>

              <div className="reg-grid reg-grid-basic">

                {/* Row 1: Serial Number | Category | Date Acquired */}
                <div className="reg-field reg-field-single">
                  <label className="reg-label">Serial Number</label>
                  <input
                    className="reg-input"
                    name="serial_number"
                    placeholder="Enter Text"
                    value={form.serial_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="reg-field reg-field-single">
                  <label className="reg-label">Category</label>
                  <select
                    className="reg-select"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="reg-field reg-field-single">
                  <label className="reg-label">Date Acquired</label>
                  <input
                    className="reg-input"
                    type="date"
                    name="date_acquired"
                    value={form.date_acquired}
                    onChange={handleChange}
                  />
                </div>

                {/* Row 2: Description (span 2) | Acquisition Cost */}
                <div className="reg-field reg-field-half">
                  <label className="reg-label">Description</label>
                  <input
                    className="reg-input"
                    name="description"
                    placeholder="Enter Text"
                    value={form.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="reg-field reg-field-single">
                  <label className="reg-label">Acquisition Cost</label>
                  <input
                    className="reg-input"
                    type="number"
                    name="acquisition_cost"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.acquisition_cost}
                    onChange={handleChange}
                  />
                </div>

                {/* Row 3: Remarks (span 2) | Quantity */}
                <div className="reg-field reg-field-half">
                  <label className="reg-label">Remarks</label>
                  <input
                    className="reg-input"
                    name="remarks"
                    placeholder="Enter Text"
                    value={form.remarks}
                    onChange={handleChange}
                  />
                </div>

                <div className="reg-field reg-field-single">
                  <label className="reg-label">Quantity</label>
                  <input
                    className="reg-input"
                    type="number"
                    name="qty"
                    min="1"
                    placeholder="0"
                    value={form.qty}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </div>

            {/* ── Custody & Location ── */}
            <div className="reg-card">
              <p className="reg-card-title">Custody &amp; Location</p>

              <div className="reg-grid reg-grid-custody">

                <div className="reg-field reg-field-single">
                  <label className="reg-label">Primary Custodian</label>
                  <select
                    className="reg-select"
                    name="primary_custodian"
                    value={form.primary_custodian}
                    onChange={handleChange}
                  >
                    <option value="">Select Custodian</option>
                    {/* TODO: populate from Firestore users */}
                  </select>
                </div>

                <div className="reg-field reg-field-single">
                  <label className="reg-label">Local Custodian</label>
                  <select
                    className="reg-select"
                    name="local_custodian"
                    value={form.local_custodian}
                    onChange={handleChange}
                  >
                    <option value="">Select Custodian</option>
                    {/* TODO: populate from Firestore users */}
                  </select>
                </div>

                <div className="reg-field reg-field-single">
                  {/* spacer — keeps Location on its own row */}
                </div>

                <div className="reg-field reg-field-half">
                  <label className="reg-label">Location</label>
                  <select
                    className="reg-select"
                    name="room_id"
                    value={form.room_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Location</option>
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

          </div>{/* end reg-right */}
        </div>{/* end reg-body */}

        {/* ── footer actions ── */}
        <div className="reg-footer">
          <button
            type="button"
            className="reg-btn-cancel"
            onClick={() => navigate("/asset")}
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="reg-btn-save"
            disabled={saving}
          >
            {saving ? "SAVING…" : "SAVE"}
          </button>
        </div>

      </form>
    </MainLayout>
  );
}

export default AssetRegistration;