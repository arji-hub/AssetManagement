import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import "./AssetRegistration.css";
import StepIndicator from "../../components/form/StepIndicator";
import AcquisitionInfo from "../../components/form/AcquisitionInfo";
import ItemList from "../../components/form/ItemList";
import ItemFormModal from "../../components/modal/ItemFormModal";
import ReviewSubmit from "../../components/form/ReviewSubmit";
import { useAcquisitionRegistration } from "../../hooks/asset/useAcquisitionRegistration";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";

function AssetRegistration() {
  const navigate = useNavigate();
  const {
    step,
    acquisitionInfo,
    docImage,
    setDocImage,
    isDonated,
    handleAcquisitionChange,
    setAcquisitionField,
    canProceedStep1,
    goToItems,
    goBackToAcquisition,
    goToReview,
    goBackToItems,
    items,
    itemModalOpen,
    editingItem,
    openAddItem,
    openEditItem,
    closeItemModal,
    saveItem,
    removeItem,
    duplicateItem,
    saving,
    saveStatus,
    setSaveStatus,
    saveError,
    rooms,
    fulltimeCustodians,
    loadingOptions,
    handleSubmit,
  } = useAcquisitionRegistration();

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
            <h1 className="reg-header-title">Register New Assets</h1>
          </div>
        </div>

        {/* ── step indicator ── */}
        <StepIndicator currentStep={step} />

        {/* ── step content ── */}
        <div className="reg-content">
          {step === 1 && (
            <AcquisitionInfo
              acquisitionInfo={acquisitionInfo}
              onChange={handleAcquisitionChange}
              setField={setAcquisitionField}
              docImage={docImage}
              setDocImage={setDocImage}
            />
          )}

          {step === 2 && (
            <ItemList
              items={items}
              onAdd={openAddItem}
              onEdit={openEditItem}
              onRemove={removeItem}
              onDuplicate={duplicateItem}
            />
          )}

          {step === 3 && (
            <ReviewSubmit
              acquisitionInfo={acquisitionInfo}
              docImage={docImage}
              items={items}
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
                onClick={step === 2 ? goBackToAcquisition : goBackToItems}
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

            {step === 1 && (
              <button
                type="button"
                className="reg-btn reg-btn--primary"
                onClick={goToItems}
                disabled={!canProceedStep1()}
              >
                Next
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                className="reg-btn reg-btn--primary"
                onClick={goToReview}
                disabled={items.length === 0}
              >
                Review
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                className="reg-btn reg-btn--primary"
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : `Save ${items.length} Asset${items.length === 1 ? "" : "s"}`}
              </button>
            )}
          </div>
        </div>

        {itemModalOpen && (
          <ItemFormModal
            initialItem={editingItem}
            isDonated={isDonated}
            fulltimeCustodians={fulltimeCustodians}
            rooms={rooms}
            loadingOptions={loadingOptions}
            onSave={saveItem}
            onClose={closeItemModal}
          />
        )}

        {saveStatus && (
          <AddingStatusModal
            title="Assets"
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
