import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import "./AssetRegistration.css";
import StepIndicator from "../../components/form/StepIndicator";
import BasicInfo from "../../components/form/BasicInfo";
import Media from "../../components/form/Media";
import Assignment from "../../components/form/Assignment";
import { useAssetRegistrationForm } from "../../hooks/useAssetRegistration";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";

function AssetRegistration() {
  const navigate = useNavigate();
  const {
    step,
    form,
    error,
    assetImage,
    setAssetImage,
    docImage,
    setDocImage,
    saving,
    saveError,
    saveStatus,
    setSaveStatus,
    showSkipWarning,
    isAssigned,
    categories,
    rooms,
    fulltimeCustodians,
    loadingOptions,
    handleChange,
    canProceed,
    handleNext,
    handleBack,
    handleSkip,
    handleSave,
  } = useAssetRegistrationForm();

  return (
    <MainLayout>
      <div className="reg-page">
        {/* ── header ── */}
        <div className="reg-header">
          <div className="reg-header-text">
            <div className="reg-header-eyebrow">
              <FontAwesomeIcon icon="fa-solid fa-layer-group" />
              Asset Registration
            </div>
            <h1 className="reg-header-title">Register New Asset</h1>
          </div>
        </div>

        {/* ── step indicator ── */}
        <StepIndicator currentStep={step} />

        {/* ── step content ── */}
        <div className="reg-content">
          {step === 1 && (
            <BasicInfo
              form={form}
              onChange={handleChange}
              categories={categories}
              loadingOptions={loadingOptions}
              error={error}
            />
          )}
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

          <div className="reg-footer-right">
            <button
              type="button"
              className="reg-btn reg-btn--cancel"
              onClick={() => navigate("/asset")}
              disabled={saving}
            >
              Cancel
            </button>

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

        {saveStatus && (
          <AddingStatusModal
            title="Asset"
            status={saveStatus}
            errorMessage={saveError}
            onClose={() => {
              if (saveStatus === "success") {
                navigate("/asset");
              } else {
                setSaveStatus(null);
              }
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default AssetRegistration;
