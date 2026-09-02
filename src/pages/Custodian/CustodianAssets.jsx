import React from "react";
import "./CustodianAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/modal/FilterModal";
import { useAssetFilters } from "../../hooks/asset/useAssetFilters";
import { useCustodianAssets } from "../../hooks/custodian/useCustodianAssets";
import { PDFPreviewModal } from "../../components/modal/PDFPreviewModal";
import { CustodianInventoryPDF } from "../../pdf/templates/CustodianInventoryPDF";
import BackButton from "../../components/ui/button/BackButton";
import Table from "../../components/panel/Table";
import AssetCard from "../../components/ui/card/asset/AssetCard";
import { custodianAssetsColumns } from "../../data/columns";

function CustodianAssets() {
  const { username } = useParams();
  const navigate = useNavigate();

  const { assets, loading, error, fullname, email } =
    useCustodianAssets(username);

  const {
    showFilter,
    setShowFilter,
    filters,
    setFilters,
    activeFilterCount,
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
            <div>
              <h1 className="assets-title">Assets in Custody</h1>
              <p className="assets-subtitle">
                {/*italic email */}
                <strong>{fullname}</strong> • <em>{email}</em>
              </p>
            </div>
          </div>

          <div className="assets-settings">
            <PDFPreviewModal
              title="Custodian Inventory Form"
              fileName={`custodian-inventory-${fullname}.pdf`}
              document={
                <CustodianInventoryPDF
                  custodianName={fullname}
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
          </div>
        </div>

        {/* ── Active filter pills ── */}
        {activeFilterCount > 0 && (
          <div className="asset-active-filters">
            {Object.entries(filters).map(([key, val]) =>
              val ? (
                <span key={key} className="asset-active-pill">
                  {val}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, [key]: "" }))
                    }
                    aria-label={`Remove ${key} filter`}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                  </button>
                </span>
              ) : null,
            )}
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
    </MainLayout>
  );
}

export default CustodianAssets;
