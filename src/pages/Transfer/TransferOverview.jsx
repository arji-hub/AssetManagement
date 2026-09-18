import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import MainLayout from "../../components/layout/MainLayout";
import BackButton from "../../components/ui/button/BackButton";
import SearchableSelect from "../../components/form/SearchableSelect";
// Named "addingStatusModal" lowercase in the request, but a lowercase JSX
// tag is always treated as a raw DOM element rather than a component — it
// must be capitalized to actually render AddingStatusModal.
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { useTransferOverview } from "../../hooks/transfer/useTransferOverview";

import "./TransferOverview.css";

const VARIANT_COPY = {
  custodian: {
    title: "Transfer Asset",
    confirmLabel: "Submit Transfer Request",
    itemLabel: "Transfer Request",
  },
  localMR: {
    title: "Local MR Assignment",
    confirmLabel: "Submit LocalMR Request",
    itemLabel: "Transfer Local MR",
  },
  room: {
    title: "Move Asset",
    confirmLabel: "Move Asset(s)",
    itemLabel: "Asset Move",
  },
};

function TransferOverview({ variant = "custodian" }) {
  const copy = VARIANT_COPY[variant] ?? VARIANT_COPY.custodian;

  const {
    isAdmin,
    isParttime,
    custodianList,
    ownerFilter,
    setOwnerFilter,
    assets,
    assetsLoading,
    rooms,
    categories,
    custodians,
    search,
    setSearch,
    roomFilter,
    setRoomFilter,
    categoryFilter,
    setCategoryFilter,
    custodianFilter,
    setCustodianFilter,
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
    fromCustodian,
    selectSource,
    toCustodian,
    selectDestination,
    targetRoom,
    setTargetRoom,
    notes,
    setNotes,
    submitting,
    error,
    submitError,
    status,
    dismissSubmitError,
    canSubmit,
    handleConfirm,
    handleDone,
  } = useTransferOverview(variant);

  // handleConfirm navigates away immediately on success, so there's no
  // pause to show a "success" screen — this only ever shows loading or a
  // failed-submission error (submitError, not the general page-level
  // `error` used for the inline banner below). "Return" dismisses it via
  // dismissSubmitError so the form is usable again.
  const modalStatus = submitting ? "loading" : submitError ? "error" : null;

  return (
    <MainLayout>
      <div className="transfer-overview-page">
        {/* ─────────────────────────────────────────
            Page Header
        ───────────────────────────────────────── */}

        <div className="transfer-overview-header">
          <div>
            <div className="transfer-overview-breadcrumb">
              <BackButton />
              <span>{copy.title}</span>
            </div>{" "}
            <p className="transfer-overview-description">
              Select the assets you want to transfer and specify the
              destination.
            </p>
          </div>

          {variant !== "room" && isAdmin && (
            <div className="transfer-overview-header-source">
              <label className="transfer-overview-filter-label">
                Custodian
              </label>
              <SearchableSelect
                options={[
                  { id: "unassigned", label: "Unassigned" },
                  ...custodians
                    .filter((c) => c.asset_count > 0)
                    .map((c) => ({
                      id: c.id,
                      label: c.fullname,
                    })),
                ]}
                value={
                  fromCustodian === undefined
                    ? ""
                    : fromCustodian
                      ? fromCustodian.id
                      : "unassigned"
                }
                onSelect={(id) =>
                  selectSource(
                    id === "unassigned"
                      ? null
                      : custodians.find((c) => c.id === id) || null,
                  )
                }
                placeholder="Select a custodian…"
                searchPlaceholder="Search custodians…"
              />
            </div>
          )}

          {variant === "localMR" && (
            // Pure asset-list filter — narrows to one full-time owner's
            // assets. From/To are unaffected: From stays locked to this
            // user, To keeps resolving automatically from whatever's
            // selected (see the hook's partTimeReturnTarget).
            <div className="transfer-overview-header-source">
              <label className="transfer-overview-filter-label">
                Property Custodian
              </label>
              {isParttime ? (
                <SearchableSelect
                  options={[
                    ...custodianList.map((c) => ({
                      id: c.id,
                      label: c.fullname,
                    })),
                  ]}
                  value={ownerFilter}
                  onSelect={setOwnerFilter}
                  placeholder="Select a custodian…"
                  searchPlaceholder="Search custodians…"
                />
              ) : (
                <div className="transfer-overview-static-field">
                  {fromCustodian ? fromCustodian.fullname : "Unassigned"}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────
            Error
        ───────────────────────────────────────── */}

        {error && <div className="transfer-overview-error">{error}</div>}

        {/* ─────────────────────────────────────────
            Main Workspace
        ───────────────────────────────────────── */}

        <div className="transfer-overview-layout">
          {/* ═══════════════════════════════════════
              LEFT — ASSET PICKER
          ═══════════════════════════════════════ */}

          <section className="transfer-overview-panel transfer-overview-assets">
            {fromCustodian === undefined && (
              <div className="transfer-overview-panel-header">
                <h2 className="transfer-overview-panel-title">
                  Available Assets
                </h2>

                <p className="transfer-overview-panel-subtitle">
                  Choose the assets to include in this transfer.
                </p>
              </div>
            )}

            {fromCustodian === undefined ? (
              <div className="transfer-overview-empty">
                <span>Select a custodian to view their assets.</span>
              </div>
            ) : (
              <>
                {/* Search + Filters */}

                <div className="transfer-overview-filters">
                  {/* Search */}

                  <div className="transfer-overview-search-wrapper">
                    <label className="transfer-overview-filter-label">
                      Search Assets
                    </label>

                    <div className="transfer-overview-search">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />

                      <input
                        type="text"
                        placeholder="Search by asset ID or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Filters */}

                  <div className="transfer-overview-filter-section">
                    <div className="transfer-overview-filter-heading">
                      <span>Filter Assets</span>

                      <span className="transfer-overview-filter-count">
                        {assets.length} result
                        {assets.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="transfer-overview-filter-grid">
                      {categories.length > 0 && (
                        <div className="transfer-overview-filter-field">
                          <label className="transfer-overview-filter-label">
                            Category
                          </label>

                          <SearchableSelect
                            options={[
                              {
                                id: "all",
                                label: "All Categories",
                              },
                              ...categories.map((c) => ({
                                id: c.id,
                                label: c.name,
                              })),
                            ]}
                            value={categoryFilter}
                            onSelect={setCategoryFilter}
                            placeholder="All Categories"
                            searchPlaceholder="Search categories…"
                          />
                        </div>
                      )}

                      {rooms.length > 0 && (
                        <div className="transfer-overview-filter-field">
                          <label className="transfer-overview-filter-label">
                            Room
                          </label>

                          <SearchableSelect
                            options={[
                              {
                                id: "all",
                                label: "All Rooms",
                              },
                              ...rooms.map((r) => ({
                                id: r.id,
                                label: r.name,
                              })),
                            ]}
                            value={roomFilter}
                            onSelect={setRoomFilter}
                            placeholder="All Rooms"
                            searchPlaceholder="Search rooms…"
                          />
                        </div>
                      )}

                      {/* hide for variant LocalMR */}
                      {variant !== "localMR" && custodians.length > 0 && (
                        <div className="transfer-overview-filter-field">
                          <label className="transfer-overview-filter-label">
                            Custodian
                          </label>

                          <SearchableSelect
                            options={[
                              {
                                id: "all",
                                label: "All Custodians",
                              },
                              ...custodians.map((c) => ({
                                id: c.id,
                                label: c.fullname,
                              })),
                            ]}
                            value={custodianFilter}
                            onSelect={setCustodianFilter}
                            placeholder="All Custodians"
                            searchPlaceholder="Search custodians…"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Asset List Header */}

                <div className="transfer-overview-list-header">
                  <div className="transfer-overview-list-title">
                    <span>Asset List</span>

                    <span className="transfer-overview-list-count">
                      {assets.length}
                    </span>
                  </div>

                  <label className="transfer-overview-select-all">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      disabled={assetsLoading || assets.length === 0}
                    />

                    <span>Select All</span>
                  </label>
                </div>

                {/* Asset List */}

                <div className="transfer-overview-asset-list">
                  {assetsLoading && (
                    <div className="transfer-overview-empty">
                      <span>Loading assets…</span>
                    </div>
                  )}

                  {!assetsLoading && assets.length === 0 && (
                    <div className="transfer-overview-empty">
                      <span>
                        {fromCustodian === undefined
                          ? `No assets found for ${
                              fromCustodian
                                ? fromCustodian.fullname
                                : "Unassigned"
                            }.`
                          : "No assets found."}
                      </span>
                    </div>
                  )}

                  {!assetsLoading &&
                    assets.map((asset) => (
                      <label
                        key={asset.id}
                        className={`transfer-overview-asset-row ${
                          selectedIds.has(asset.id)
                            ? "transfer-overview-asset-row--selected"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(asset.id)}
                          onChange={() => toggleAsset(asset.id)}
                        />

                        <div className="transfer-overview-asset-info">
                          <span className="transfer-overview-asset-desc">
                            {asset.description}
                          </span>

                          <span className="transfer-overview-asset-meta">
                            {asset.id}
                            <span className="transfer-overview-meta-separator">
                              •
                            </span>
                            {asset.serial_number}
                            <span className="transfer-overview-meta-separator">
                              •
                            </span>
                            {asset.room_name || "Unassigned room"}
                          </span>
                        </div>
                      </label>
                    ))}
                </div>
              </>
            )}
          </section>

          {/* ═══════════════════════════════════════
              RIGHT — TRANSFER SUMMARY
          ═══════════════════════════════════════ */}

          <section className="transfer-overview-panel transfer-overview-summary">
            <div className="transfer-overview-panel-header">
              <div>
                <h2 className="transfer-overview-panel-title">
                  Transfer Details
                </h2>

                <p className="transfer-overview-panel-subtitle">
                  Review the selected assets before continuing.
                </p>
              </div>

              <span
                className={`transfer-overview-selected-badge ${
                  selectedAssets.length > 0
                    ? "transfer-overview-selected-badge--active"
                    : ""
                }`}
              >
                {selectedAssets.length}
              </span>
            </div>

            {/* Destination */}

            <div className="transfer-overview-destination">
              <div className="transfer-overview-section-label">
                Transfer Destination
              </div>

              {variant === "room" ? (
                <>
                  <label className="transfer-overview-label">
                    Move To Room
                  </label>

                  <SearchableSelect
                    options={rooms.map((r) => ({ id: r.id, label: r.name }))}
                    value={targetRoom?.id ?? ""}
                    onSelect={(id) =>
                      setTargetRoom(rooms.find((r) => r.id === id) || null)
                    }
                    placeholder="Select a room"
                    searchPlaceholder="Search rooms…"
                  />
                </>
              ) : (
                <>
                  <label className="transfer-overview-label">From</label>
                  {variant === "localMR" && !isParttime ? (
                    // From Custodians
                    <SearchableSelect
                      options={[
                        { id: null, label: "Unassigned" },
                        ...custodianList.map((c) => ({
                          id: c.id,
                          label: c.fullname,
                        })),
                      ]}
                      value={ownerFilter}
                      onSelect={setOwnerFilter}
                      placeholder="Select a custodian…"
                      searchPlaceholder="Search custodians…"
                    />
                  ) : (
                    <div className="transfer-overview-static-field">
                      {fromCustodian ? fromCustodian.fullname : "Unassigned"}
                    </div>
                  )}

                  <label className="transfer-overview-label">To</label>

                  {(variant === "localMR" && isParttime) || ownerFilter ? (
                    // To Custodians
                    <div className="transfer-overview-static-field">
                      -Remove Local MR-
                    </div>
                  ) : (
                    <SearchableSelect
                      options={[
                        ...(variant === "localMR" && isParttime
                          ? fromCustodian
                            ? [{ id: "unassigned", label: "Unassigned" }]
                            : []
                          : ownerFilter
                            ? [{ id: "unassigned", label: "Unassigned" }]
                            : []),
                        ...custodians
                          .filter((c) => c.id !== fromCustodian?.id)
                          .map((c) => ({
                            id: c.id,
                            label: c.fullname,
                          })),
                      ]}
                      value={
                        toCustodian === undefined
                          ? ""
                          : toCustodian
                            ? toCustodian.id
                            : "unassigned"
                      }
                      onSelect={(id) =>
                        selectDestination(
                          id === "unassigned"
                            ? null
                            : custodians.find((c) => c.id === id) || null,
                        )
                      }
                      placeholder="Select a custodian"
                      searchPlaceholder="Search custodians…"
                    />
                  )}

                  <label className="transfer-overview-label">Notes</label>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Reason for transfer..."
                  />
                </>
              )}
            </div>

            {/* Selected Assets */}

            <div className="transfer-overview-selected-section">
              <div className="transfer-overview-section-label">
                Selected Assets
              </div>

              {selectedAssets.length === 0 ? (
                <div className="transfer-overview-selection-empty">
                  <span>No assets selected</span>
                  <small>Select assets from the list to continue.</small>
                </div>
              ) : (
                <ul className="transfer-overview-selected-list">
                  {selectedAssets.map((asset) => (
                    <li key={asset.id}>
                      <div className="transfer-overview-selected-info">
                        <span>{asset.description}</span>

                        <small>{asset.id}</small>
                      </div>

                      <button
                        type="button"
                        className="transfer-overview-remove-btn"
                        onClick={() => toggleAsset(asset.id)}
                        aria-label={`Remove ${asset.description}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm */}

            <div className="transfer-overview-action">
              <button
                type="button"
                className="transfer-overview-confirm-btn"
                disabled={!canSubmit}
                onClick={handleConfirm}
              >
                {submitting ? "Submitting…" : copy.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      </div>

      {status && (
        <AddingStatusModal
          title={copy.itemLabel}
          status={status}
          errorMessage={submitError}
          onClose={status === "success" ? handleDone : dismissSubmitError}
        />
      )}
    </MainLayout>
  );
}

export default TransferOverview;
