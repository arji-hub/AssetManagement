import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFileZipper,
  faChevronLeft,
  faChevronRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import MainLayout from "../../components/layout/MainLayout";
import QRModal from "../../components/modal/QRModal";
import QRStatusModal from "../../components/ui/status/QRStatusModal";
import SearchableSelect from "../../components/form/SearchableSelect";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { PDFPreviewModal } from "../../components/modal/PDFPreviewModal";
import { QRSheetPDF } from "../../pdf/templates/QRSheetPDF";
import { useQRScanner } from "../../hooks/camera/useQRScanner";
import { useQR } from "../../hooks/qr/useQR";
import { SHEET_LAYOUTS } from "../../utils/qrExport";

import "./QR.css";

// 1 … 4 5 6 … 12 — returns numbers and "gap-*" strings for the ellipses
function getPageItems(page, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const nums = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const items = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) items.push(`gap-${n}`);
    items.push(n);
  });
  return items;
}

function QR() {
  const [mode, setMode] = useState("scan"); // "scan" | "generate"

  // scanner mode
  const { status, errorMessage, handleImageUpload, handleScan, reset } =
    useQRScanner();

  // generate mode
  const {
    assetsLoading,
    error,
    assets,
    filteredAssets,
    pagedAssets,
    search,
    setSearch,
    roomFilter,
    setRoomFilter,
    categoryFilter,
    setCategoryFilter,
    isAdmin,
    custodians,
    custodianFilter,
    setCustodianFilter,
    rooms,
    categories,
    hasActiveFilters,
    resetFilters,
    currentPage,
    totalPages,
    setPage,
    pageStart,
    pageEnd,
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    selectableCount,
    toggleSelectAll,
    clearSelection,
    sheetSize,
    setSheetSize,
    exporting,
    exportProgress,
    exportError,
    dismissExportError,
    notice,
    dismissNotice,
    canExport,
    handleDownloadZIP,
  } = useQR();

  const modalStatus = exporting ? "loading" : exportError ? "error" : null;

  // memoised so PDFPreviewModal doesn't re-render the PDF on unrelated updates
  const stickerDocument = useMemo(
    () => <QRSheetPDF assets={selectedAssets} size={sheetSize} />,
    [selectedAssets, sheetSize],
  );

  const labelCount = `${selectedAssets.length} Label${
    selectedAssets.length !== 1 ? "s" : ""
  }`;

  const progressLabel =
    exportProgress.total > 0
      ? ` ${exportProgress.done}/${exportProgress.total}`
      : "";

  return (
    <MainLayout>
      <div className="qr-overview-page">
        {/* ─────────────────────────────────────────
            Page Header
        ───────────────────────────────────────── */}

        <div className="qr-overview-header">
          <div>
            <div className="qr-overview-breadcrumb">
              <span>QR Codes</span>
            </div>

            <p className="qr-overview-description">
              {mode === "scan"
                ? "Scan an asset QR code to open its record."
                : "Select assets, then print or download their QR codes."}
            </p>
          </div>

          <div className="qr-overview-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "scan"}
              className={`qr-overview-tab ${
                mode === "scan" ? "qr-overview-tab--active" : ""
              }`}
              onClick={() => setMode("scan")}
            >
              Scan QR
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === "generate"}
              className={`qr-overview-tab ${
                mode === "generate" ? "qr-overview-tab--active" : ""
              }`}
              onClick={() => setMode("generate")}
            >
              Generate &amp; Print
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            MODE — SCAN
        ═══════════════════════════════════════ */}

        {mode === "scan" && (
          <div className="qr-overview-scan">
            <QRModal onScan={handleScan} onImageUpload={handleImageUpload} />
          </div>
        )}

        {/* ═══════════════════════════════════════
            MODE — GENERATE & PRINT
        ═══════════════════════════════════════ */}

        {mode === "generate" && (
          <>
            {error && <div className="qr-overview-error">{error}</div>}

            {notice && (
              <div
                className={`qr-overview-notice qr-overview-notice--${notice.type}`}
              >
                <span>{notice.message}</span>

                <button
                  type="button"
                  onClick={dismissNotice}
                  aria-label="Dismiss"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            )}

            <div className="qr-overview-layout">
              {/* ═══════════════════════════════════════
                  LEFT — ASSET PICKER
              ═══════════════════════════════════════ */}

              <section className="qr-overview-panel qr-overview-assets">
                <div className="qr-overview-panel-header">
                  <div>
                    <h2 className="qr-overview-panel-title">
                      Available Assets
                    </h2>

                    <p className="qr-overview-panel-subtitle">
                      Choose the assets you need QR codes for.
                    </p>
                  </div>

                  <span className="qr-overview-total-badge">
                    {assets.length}
                  </span>
                </div>

                {/* Search + Filters */}

                <div className="qr-overview-filters">
                  <div className="qr-overview-search-wrapper">
                    <label className="qr-overview-filter-label">
                      Search Assets
                    </label>

                    <div className="qr-overview-search">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />

                      <input
                        type="text"
                        placeholder="Search by asset ID, description or serial..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="qr-overview-filter-section">
                    <div className="qr-overview-filter-heading">
                      <span>Filter Assets</span>

                      <span className="qr-overview-filter-meta">
                        <span className="qr-overview-filter-count">
                          {filteredAssets.length} result
                          {filteredAssets.length !== 1 ? "s" : ""}
                        </span>

                        {hasActiveFilters && (
                          <button
                            type="button"
                            className="qr-overview-reset-btn"
                            onClick={resetFilters}
                          >
                            Reset filters
                          </button>
                        )}
                      </span>
                    </div>

                    <div
                      className={`qr-overview-filter-grid ${
                        isAdmin ? "" : "qr-overview-filter-grid--two"
                      }`}
                    >
                      <div className="qr-overview-filter-field">
                        <label className="qr-overview-filter-label">Room</label>

                        <SearchableSelect
                          options={[
                            { id: "all", label: "All Rooms" },
                            { id: "unallocated", label: "Unallocated" },
                            ...rooms.map((r) => ({ id: r.id, label: r.name })),
                          ]}
                          value={roomFilter}
                          onSelect={setRoomFilter}
                          placeholder="All Rooms"
                          searchPlaceholder="Search rooms…"
                        />
                      </div>

                      <div className="qr-overview-filter-field">
                        <label className="qr-overview-filter-label">
                          Category
                        </label>

                        <SearchableSelect
                          options={[
                            { id: "all", label: "All Categories" },
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

                      {isAdmin && custodians.length > 0 && (
                        <div className="qr-overview-filter-field">
                          <label className="qr-overview-filter-label">
                            Custodian
                          </label>

                          <SearchableSelect
                            options={[
                              { id: "all", label: "All Custodians" },
                              { id: "unassigned", label: "Unassigned" },
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

                <div className="qr-overview-list-header">
                  <div className="qr-overview-list-title">
                    <span>Asset List</span>

                    <span className="qr-overview-list-count">
                      {filteredAssets.length}
                    </span>
                  </div>

                  <label className="qr-overview-select-all">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      disabled={assetsLoading || selectableCount === 0}
                    />

                    <span>Select All ({selectableCount})</span>
                  </label>
                </div>

                {/* Asset List */}

                <div className="qr-overview-asset-list">
                  {assetsLoading && (
                    <div className="qr-overview-empty">
                      <span>Loading assets…</span>
                    </div>
                  )}

                  {!assetsLoading && filteredAssets.length === 0 && (
                    <div className="qr-overview-empty">
                      <span>No assets found.</span>
                    </div>
                  )}

                  {!assetsLoading &&
                    pagedAssets.map((asset) => {
                      const selected = selectedIds.has(asset.id);

                      return (
                        <label
                          key={asset.id}
                          className={`qr-overview-asset-row ${
                            selected ? "qr-overview-asset-row--selected" : ""
                          } ${
                            !asset.has_qr
                              ? "qr-overview-asset-row--disabled"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={!asset.has_qr}
                            onChange={() => toggleAsset(asset.id)}
                          />

                          <div className="qr-overview-thumb">
                            {asset.has_qr ? (
                              <img
                                src={asset.qr_code_url}
                                alt={`QR code for ${asset.id}`}
                                crossOrigin="anonymous"
                                loading="lazy"
                              />
                            ) : (
                              <small>Pending</small>
                            )}
                          </div>

                          <div className="qr-overview-asset-info">
                            <span className="qr-overview-asset-desc">
                              {asset.description}
                            </span>

                            <span className="qr-overview-asset-meta">
                              {asset.id}
                              <span className="qr-overview-meta-separator">
                                •
                              </span>
                              {asset.serial_number || "No serial"}
                              <span className="qr-overview-meta-separator">
                                •
                              </span>
                              {asset.room_name || "Unallocated"}
                            </span>
                          </div>

                          <div className="qr-overview-asset-tags">
                            <span className="qr-overview-tag">
                              {asset.category_name}
                            </span>

                            {asset.status && (
                              <span className="qr-overview-tag qr-overview-tag--status">
                                {asset.status}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                </div>

                {/* Pagination */}

                {!assetsLoading && filteredAssets.length > 0 && (
                  <div className="qr-overview-pagination">
                    <span className="qr-overview-pagination-label">
                      Showing {pageStart} to {pageEnd} of{" "}
                      {filteredAssets.length} assets
                    </span>

                    <div className="qr-overview-pagination-controls">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setPage(currentPage - 1)}
                        aria-label="Previous page"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>

                      {getPageItems(currentPage, totalPages).map((item) =>
                        typeof item === "number" ? (
                          <button
                            key={item}
                            type="button"
                            className={
                              item === currentPage
                                ? "qr-overview-page-btn--active"
                                : ""
                            }
                            onClick={() => setPage(item)}
                          >
                            {item}
                          </button>
                        ) : (
                          <span key={item} className="qr-overview-page-gap">
                            …
                          </span>
                        ),
                      )}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setPage(currentPage + 1)}
                        aria-label="Next page"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* ═══════════════════════════════════════
                  RIGHT — EXPORT SUMMARY
              ═══════════════════════════════════════ */}

              <section className="qr-overview-panel qr-overview-summary">
                <div className="qr-overview-panel-header">
                  <div>
                    <h2 className="qr-overview-panel-title">
                      Selected for Export
                    </h2>

                    <p className="qr-overview-panel-subtitle">
                      Review the QR codes before exporting.
                    </p>
                  </div>

                  <span
                    className={`qr-overview-selected-badge ${
                      selectedAssets.length > 0
                        ? "qr-overview-selected-badge--active"
                        : ""
                    }`}
                  >
                    {selectedAssets.length}
                  </span>
                </div>

                {/* Selected Assets */}

                <div className="qr-overview-selected-section">
                  <div className="qr-overview-section-row">
                    <div className="qr-overview-section-label">
                      Selected Assets
                    </div>

                    {selectedAssets.length > 0 && (
                      <button
                        type="button"
                        className="qr-overview-reset-btn"
                        onClick={clearSelection}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {selectedAssets.length === 0 ? (
                    <div className="qr-overview-selection-empty">
                      <span>No assets selected</span>
                      <small>Select assets from the list to continue.</small>
                    </div>
                  ) : (
                    <ul className="qr-overview-selected-list">
                      {selectedAssets.map((asset) => (
                        <li key={asset.id}>
                          <img
                            className="qr-overview-selected-thumb"
                            src={asset.qr_code_url}
                            alt=""
                            crossOrigin="anonymous"
                          />

                          <div className="qr-overview-selected-info">
                            <span>{asset.description}</span>

                            <small>{asset.id}</small>
                          </div>

                          <button
                            type="button"
                            className="qr-overview-remove-btn"
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

                {/* Sheet Format */}

                <div className="qr-overview-format">
                  <div className="qr-overview-section-label">Sticker Size</div>

                  <div className="qr-overview-size-grid">
                    {Object.entries(SHEET_LAYOUTS).map(([key, layout]) => (
                      <button
                        key={key}
                        type="button"
                        className={`qr-overview-size-option ${
                          sheetSize === key
                            ? "qr-overview-size-option--active"
                            : ""
                        }`}
                        onClick={() => setSheetSize(key)}
                      >
                        <strong>{layout.label}</strong>
                        <small>{layout.hint}</small>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}

                <div className="qr-overview-action">
                  {/* Preview, Print and Download PDF all live in the modal */}
                  <div className="qr-overview-pdf-action">
                    {selectedAssets.length > 0 ? (
                      <PDFPreviewModal
                        title="QR Code Stickers"
                        fileName={`cict-qr-stickers-${selectedAssets.length}.pdf`}
                        document={stickerDocument}
                        triggerLabel={`Print / Export PDF (${labelCount})`}
                      />
                    ) : (
                      <button
                        type="button"
                        className="pdf-trigger-btn"
                        disabled
                      >
                        Print / Export PDF (0 Labels)
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="qr-overview-secondary-btn"
                    disabled={!canExport}
                    onClick={handleDownloadZIP}
                  >
                    <FontAwesomeIcon icon={faFileZipper} />
                    {exporting
                      ? `Zipping…${progressLabel}`
                      : "Download as ZIP (PNG Images)"}
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {/* Scanner result modal */}
      {mode === "scan" && status && (
        <QRStatusModal
          status={status}
          errorMessage={errorMessage}
          onClose={reset}
        />
      )}

      {/* Export progress / failure modal */}
      {modalStatus && (
        <AddingStatusModal
          title="QR Export"
          status={modalStatus}
          errorMessage={exportError}
          onClose={dismissExportError}
        />
      )}
    </MainLayout>
  );
}

export default QR;
