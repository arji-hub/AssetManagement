import React from "react";
import "./RoomAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/modal/FilterModal";
import { Status } from "../../components/ui/status/assetStatus";
import { useAssetFilters } from "../../hooks/useAssetFilters";
import { useRoomAssets } from "../../hooks/useRoomAssets";
import { formatDate } from "../../utils/formatDate";

function RoomAssets() {
  const { roomName } = useParams();
  const navigate = useNavigate();

  const { assets, loading, error } = useRoomAssets(roomName);

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
  console.log("assetINFO", filteredAssets);

  return (
    <MainLayout>
      <div className="room-assets-page">
        {/* ── Top bar ── */}
        <div className="room-assets-top">
          <div className="room-assets-header">
            <button className="return-button" onClick={() => navigate("/room")}>
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              Back
            </button>
            <div>
              <h1 className="room-assets-title">Assets in Room</h1>
              <p className="room-assets-subtitle">
                Showing assets located in <strong>{roomName}</strong>
              </p>
            </div>
          </div>

          <div className="room-assets-settings">
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
        <div className="room-assets-list">
          <table className="room-assets-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Asset Name</th>
                <th>Category</th>
                <th>Custodian</th>
                <th>Status</th>
                <th>Date Assigned</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="100%" className="room-assets-empty-row">
                    <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                    <p>Loading assets…</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="100%" className="room-assets-empty-row">
                    <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
                    <p>Failed to load assets. Please try again.</p>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="100%" className="room-assets-empty-row">
                    <FontAwesomeIcon icon="fa-solid fa-box-open" />
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => (
                  <tr key={asset.id}>
                    <td className="asset-index">{index + 1}</td>
                    <td className="asset-name">{asset.description}</td>
                    <td>{asset.category_id}</td>
                    <td>{asset.property_custodian_name}</td>
                    <td>
                      <Status status={asset.status} />
                    </td>
                    <td>{formatDate(asset.created_at)}</td>
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
          context="room"
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

export default RoomAssets;
