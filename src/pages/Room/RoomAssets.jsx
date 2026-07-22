import React from "react";
import "./RoomAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/modal/FilterModal";
import { Status } from "../../components/ui/status/assetStatus";
import { useAssetFilters } from "../../hooks/asset/useAssetFilters";
import { useRoomAssets } from "../../hooks/room/useRoomAssets";
import { formatDate } from "../../utils/date";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { RoomInventoryPDF } from "../../pdf/templates/RoomInventoryPDF";
import BackButton from "../../components/ui/button/BackButton";

function RoomAssets() {
  const { roomName: roomID } = useParams();
  const navigate = useNavigate();

  const { assets, loading, error, roomName, topCustodian, handleAuditLogs } =
    useRoomAssets(roomID);

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
      <div className="room-assets-page">
        {/* ── Top bar ── */}
        <div className="room-assets-top">
          <div className="room-assets-header">
            <BackButton />
            <div className="room-assets-heading-main">
              <FontAwesomeIcon
                icon="fa-solid fa-door-open"
                className="room-assets-eyebrow-icon"
              />
              <h1 className="room-assets-title">{roomName}</h1>
            </div>
            <div className="room-assets-heading">
              {topCustodian && (
                <div className="top-custodian-card">
                  <span className="top-custodian-info">
                    <span className="top-custodian-eyebrow">
                      Room Custodian
                    </span>
                    <span className="top-custodian-name">
                      {topCustodian.name}
                    </span>
                  </span>
                  <span className="top-custodian-count">
                    <span className="top-custodian-count-value">
                      {topCustodian.count}
                    </span>
                    <span className="top-custodian-count-label">assets</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="room-assets-settings">
            <button className="audit-logs-btn" onClick={handleAuditLogs}>
              <FontAwesomeIcon icon="fa-file-lines" />
              Audit Logs
            </button>
            <PDFPreviewModal
              title="Room Inventory Form"
              fileName={`room-inventory-${roomID}.pdf`}
              document={
                <RoomInventoryPDF roomName={roomName} assets={filteredAssets} />
              }
              triggerLabel="Room Inventory Form"
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
                <th>Action</th>
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
                    <td>{asset.category}</td>
                    <td>{asset.name}</td>
                    <td>
                      <Status status={asset.status} />
                    </td>
                    <td>{formatDate(asset.date)}</td>
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
