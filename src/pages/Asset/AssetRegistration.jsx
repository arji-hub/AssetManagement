// src/pages/Asset/AssetRegistration.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import { fetchCustodians } from "../../services/user";
import { fetchRooms } from "../../services/room";
import { addAsset } from "../../services/asset";
import { useAuth } from "../../context/AuthContext";
import "./AssetRegistration.css";
import StepIndicator from "../../components/form/StepIndicator";
import BasicInfo from "../../components/form/BasicInfo";
import Media from "../../components/form/Media";
import Assignment from "../../components/form/Assignment";


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
          {step === 1 && <BasicInfo form={form} onChange={handleChange} />}
          {step === 2 && (
            <Media
              assetImage={assetImage}
              setAssetImage={setAssetImage}
              docImage={docImage}
              setDocImage={setDocImage}
            />
          )}
          {step === 3 && (
            <Assignment
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
