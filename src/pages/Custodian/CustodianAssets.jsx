import React from "react";
import "./CustodianAssets.css";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/filter/FilterModal";
import { useAssetFilters } from "../../hooks/asset/useAssetFilters";
import { useCustodianAssets } from "../../hooks/custodian/useCustodianAssets";
import { PDFPreviewModal } from "../../components/modal/PDFPreviewModal";
import { CustodianInventoryPDF } from "../../pdf/templates/CustodianInventoryPDF";
import BackButton from "../../components/ui/button/BackButton";
import Table from "../../components/panel/Table";
import AssetCard from "../../components/ui/card/asset/AssetCard";
import { custodianAssetsColumns } from "../../data/columns";
import InputModal from "../../components/modal/InputModal";
import ConfirmModal from "../../components/modal/ConfirmModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { useCustodianPromote } from "../../hooks/custodian/useCustodianPromote";

function CustodianAssets() {
  const { username } = useParams();

  const {
    assets,
    loading,
    error,
    custodian,
    isActive,
    handleArchiveCustodian,
    showArchiveModal,
    archiveSubmitting,
    archiveError,
    handleArchiveConfirm,
    handleArchiveClose,
  } = useCustodianAssets(username);

  const {
    isPartTime,
    hasAssets,
    assetCount,
    promoting,
    promoteStatus,
    promoteError,
    closePromoteStatus,
    showPromoteModal,
    openPromoteModal,
    closePromoteModal,
    handlePromoteConfirm,
  } = useCustodianPromote(custodian, assets?.length ?? 0);

  const {
    showFilter,
    setShowFilter,
    filters,
    activeFilterCount,
    activeFilters,
    handleRemoveFilter,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
    rooms,
    categories,
    custodians,
    loadingOptions,
  } = useAssetFilters(assets);

  return (
    <MainLayout>
      <div className="assets-page">
        {/* ── Top bar ── */}
        <div className="assets-top">
          <div className="assets-header">
            <BackButton />

            <div className="custodian-context-card">
              <div className="custodian-context-info">
                <div className="custodian-context-primary">
                  <h1 className="assets-title">
                    <span className="assets-title-text">
                      {custodian?.fullname}
                    </span>
                  </h1>
                </div>

                <div className="custodian-context-email">
                  <span className="email-icon-badge">
                    <FontAwesomeIcon icon="fa-solid fa-envelope" />
                  </span>
                  <span className="custodian-email-text">
                    {custodian?.email}
                  </span>
                </div>
              </div>

              {isPartTime && (
                <button
                  type="button"
                  className="promote-custodian-btn"
                  onClick={openPromoteModal}
                  disabled={loading || promoting}
                  aria-label="Promote to full-time custodian"
                  title={loading ? "Loading assets…" : "Promote to full-time"}
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-up" />
                </button>
              )}
            </div>
          </div>

          <div className="assets-settings">
            <PDFPreviewModal
              title="Custodian Inventory Form"
              fileName={`custodian-inventory-${custodian?.fullname}.pdf`}
              document={
                <CustodianInventoryPDF
                  custodianName={custodian?.fullname}
                  assets={filteredAssets}
                />
              }
              triggerLabel="Custodian Inventory Form"
            />

            <button
              className={`filter-button ${activeFilterCount > 0 ? "filter-button--active" : ""}`}
              onClick={() => setShowFilter(true)}
            >
              <FontAwesomeIcon icon="fa-solid fa-sliders" />
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>

            <button
              className={`archive-custodian-btn ${!isActive ? "archive-custodian-btn--restore" : ""}`}
              onClick={handleArchiveCustodian}
            >
              <FontAwesomeIcon
                icon={
                  isActive ? "fa-solid fa-box-archive" : "fa-solid fa-box-open"
                }
              />
              {isActive ? "Archive" : "Restore"}
            </button>
          </div>
        </div>

        {/* ── Active filter pills ── */}
        {activeFilterCount > 0 && (
          <div className="asset-active-filters">
            {activeFilters.map(({ key, label }) => (
              <span key={key} className="asset-active-pill">
                {label}
                <button
                  onClick={() => handleRemoveFilter(key)}
                  aria-label={`Remove ${key} filter`}
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" />
                </button>
              </span>
            ))}
            <button className="asset-clear-all" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}

        {/* ── Asset list - Custodian ── */}
        <Table
          columns={custodianAssetsColumns}
          items={filteredAssets}
          loading={loading}
          error={error}
          itemLabel="assets"
          emptyMessage="No assets found for this custodian."
          emptyIcon="fa-solid fa-box-open"
          desktopPageSize={20}
          mobilePageSize={10}
          renderItem={(asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              columns={custodianAssetsColumns}
            />
          )}
        />
      </div>

      {/* ── Filter Modal ── */}
      {showFilter && (
        <FilterModal
          context="custodian"
          filters={filters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onClose={() => setShowFilter(false)}
          rooms={rooms}
          categories={categories}
          custodians={custodians}
          loadingOptions={loadingOptions}
        />
      )}

      {/* ── Archive / Restore Modal ── */}
      {showArchiveModal && (
        <InputModal
          title={isActive ? "Archive Custodian" : "Restore Custodian"}
          description={
            isActive
              ? "This custodian will be marked inactive and excluded from asset assignment options."
              : "This custodian will be marked active again and available for asset assignments."
          }
          inputHeader="Custodian Name"
          infotext={
            isActive
              ? "Archiving does not delete this custodian's history — past transfer logs and audits referencing them will remain intact."
              : "Restoring makes this custodian selectable again for asset transfers and audits."
          }
          value={custodian?.fullname}
          onChange={() => {}}
          onSubmit={handleArchiveConfirm}
          onClose={handleArchiveClose}
          isSubmitting={archiveSubmitting}
          error={archiveError}
          submitLabel={isActive ? "Archive" : "Restore"}
          readOnly
        />
      )}

      {/* ── Promote to Full-time Modal ── */}
      <ConfirmModal
        isOpen={showPromoteModal}
        onClose={closePromoteModal}
        onConfirm={handlePromoteConfirm}
        title="Promote to full-time?"
        icon="fa-solid fa-circle-up"
        iconTone="info"
        confirmTone="primary"
        confirmLabel={hasAssets ? "Promote & transfer" : "Promote"}
        confirmIcon={
          hasAssets ? "fa-solid fa-right-left" : "fa-solid fa-circle-up"
        }
      >
        <p>
          {custodian?.fullname ? (
            <strong>{custodian?.fullname}</strong>
          ) : (
            "This custodian"
          )}{" "}
          will be promoted from part-time to full-time.{" "}
          {hasAssets
            ? `A transfer request will also be generated for the ${assetCount} asset${assetCount === 1 ? "" : "s"} currently assigned to them.`
            : "Their history will stay as it is."}
        </p>
      </ConfirmModal>

      {/* ── Promote result (success / error) ── */}
      {promoteStatus && (
        <AddingStatusModal
          title="Promotion"
          status={promoteStatus}
          errorTitle="Promotion failed"
          errorMessage={promoteError}
          onClose={closePromoteStatus}
        />
      )}
    </MainLayout>
  );
}

export default CustodianAssets;
