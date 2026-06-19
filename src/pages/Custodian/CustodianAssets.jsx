import React from "react";
import "./CustodianAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/modal/FilterModal";
import { Status } from "../../components/ui/status/assetStatus";
import { useAssetFilters } from "../../hooks/useAssetFilters";
import { useCustodianAssets } from "../../hooks/useCustodianAssets";
import { formatDate } from "../../utils/formatDate";

function CustodianAssets() {
  const { username } = useParams();
  const navigate = useNavigate();

  const { assets, loading, error } = useCustodianAssets(username);

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
            <button
              className="return-button"
              onClick={() => navigate("/custodian")}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              Back
            </button>
            <div>
              <h1 className="assets-title">Assets in Custody</h1>
              <p className="assets-subtitle">
                Showing assets registered For <strong>{username}</strong>
              </p>
            </div>
          </div>

          <div className="assets-settings">
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

        {/* ── Asset list ── */}
        <div className="assets-list">
          <table className="assets-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Room</th>
                <th>Status</th>
                <th>Date Assigned</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="100%" className="user-assets-empty-row">
                    <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                    <p>Loading assets…</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="100%" className="user-assets-empty-row">
                    <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
                    <p>Failed to load assets. Please try again.</p>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="100%" className="user-assets-empty-row">
                    <FontAwesomeIcon icon="fa-solid fa-box-open" />
                    <p>No assets found for this custodian.</p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => (
                  <tr key={asset.id}>
                    <td className="asset-index">{index + 1}</td>
                    <td className="asset-name">{asset.description}</td>
                    <td>{asset.category_id}</td>
                    <td>{asset.room_id}</td>
                    <td>
                      <Status status={asset.status} />
                    </td>
                    <td>{formatDate(asset.created_at)}</td>
                    <td>
                      <button
                        className="asset-action-btn"
                        onClick={() => navigate(`/asset/${asset.id}`)}
                        aria-label="Actions"
                      >
                        <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
