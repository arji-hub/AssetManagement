import React from "react";
import "./RoomAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/modal/FilterModal";
import { useAssetFilters } from "../../hooks/asset/useAssetFilters";
import { useRoomAssets } from "../../hooks/room/useRoomAssets";
import BackButton from "../../components/ui/button/BackButton";
import Table from "../../components/panel/Table";
import AssetCard from "../../components/ui/card/asset/AssetCard";
import { roomAssetsColumns } from "../../data/columns";
import InputModal from "../../components/modal/InputModal";

function RoomAssets() {
  const { roomName: roomID } = useParams();
  const {
    assets,
    loading,
    error,
    roomName,
    roomStatus,
    isActive,
    topCustodian,
    handleAuditLogs,
    handleEdit,
    showEditModal,
    editValue,
    setEditValue,
    editSubmitting,
    editError,
    handleEditSubmit,
    handleEditClose,
    handleArchiveRoom,
    showArchiveModal,
    archiveSubmitting,
    archiveError,
    handleArchiveConfirm,
    handleArchiveClose,
  } = useRoomAssets(roomID);

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

  const isEmpty = filteredAssets.length === 0;

  return (
    <MainLayout>
      <div className="room-assets-page">
        {/* ── Top bar ── */}
        <div className="room-assets-top">
          <div className="room-assets-header">
            <BackButton />

            <div className="room-context-card">
              <div className="room-context-primary">
                <h1 className="room-assets-title">
                  <span className="room-assets-title-text">{roomName}</span>
                </h1>
                <button
                  className="room-title-edit-btn"
                  onClick={handleEdit}
                  aria-label="Edit room name"
                >
                  <FontAwesomeIcon icon="fa-regular fa-pen-to-square" />
                </button>
              </div>

              {topCustodian && (
                <div className="room-context-custodian">
                  <span className="custodian-icon-badge">
                    <FontAwesomeIcon icon="fa-solid fa-user-shield" />
                  </span>
                  <span className="top-custodian-info">
                    <span className="top-custodian-name">
                      {topCustodian.name}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="room-assets-settings">
            {!isEmpty && (
              <button className="audit-logs-btn" onClick={handleAuditLogs}>
                <FontAwesomeIcon icon="fa-file-lines" />
                Audit Logs
              </button>
            )}
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
              className={`archive-room-btn ${!isActive ? "archive-room-btn--restore" : ""}`}
              onClick={handleArchiveRoom}
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

        {/* ── Asset list - Room ── */}
        <Table
          columns={roomAssetsColumns}
          items={filteredAssets}
          loading={loading}
          error={error}
          itemLabel="assets"
          emptyMessage="No assets found"
          emptyIcon="fa-solid fa-box-open"
          desktopPageSize={20}
          mobilePageSize={10}
          renderItem={(asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              columns={roomAssetsColumns}
            />
          )}
        />
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

      {/* ── Edit Room Name Modal ── */}
      {showEditModal && (
        <InputModal
          title="Rename Room"
          description="Update the display name for this room."
          inputHeader="Room Name"
          infotext="This name will appear throughout the app wherever this room is referenced."
          value={editValue}
          onChange={setEditValue}
          onSubmit={handleEditSubmit}
          onClose={handleEditClose}
          isSubmitting={editSubmitting}
          error={editError}
          submitLabel="Save"
        />
      )}

      {/* ── Archive Room Modal ── */}
      {showArchiveModal && (
        <InputModal
          title={isActive ? "Archive Room" : "Restore Room"}
          description={
            isActive
              ? "This room will be marked inactive and removed from selection when moving assets."
              : "This room will be marked active again and available for asset assignments."
          }
          inputHeader="Room Name"
          infotext={
            isActive
              ? "Archiving does not delete this room's history — past transfer logs and audits referencing it will remain intact."
              : "Restoring makes this room selectable again for asset transfers and audits."
          }
          value={roomName}
          onChange={() => {}}
          onSubmit={handleArchiveConfirm}
          onClose={handleArchiveClose}
          isSubmitting={archiveSubmitting}
          error={archiveError}
          submitLabel={isActive ? "Archive" : "Restore"}
          readOnly
        />
      )}
    </MainLayout>
  );
}

export default RoomAssets;
