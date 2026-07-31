import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAssetTable from "../../hooks/asset/useAssetTable";
import "./AssetTable.css";

function resolveCardRoles(columns) {
  let titleAssigned = false;
  const roled = columns.map((col) => {
    if (col.card?.role) return { ...col, _cardRole: col.card.role };

    if (col.key === "status") return { ...col, _cardRole: "badge" };
    if (/date/i.test(col.key)) return { ...col, _cardRole: "date" };
    if (!titleAssigned && col.priority !== "low") {
      titleAssigned = true;
      return { ...col, _cardRole: "title" };
    }
    return { ...col, _cardRole: "meta" };
  });

  return {
    titleCol: roled.find((c) => c._cardRole === "title"),
    badgeCol: roled.find((c) => c._cardRole === "badge"),
    dateCol: roled.find((c) => c._cardRole === "date"),
    metaCols: roled.filter(
      (c) => c._cardRole === "meta" && c.card?.role !== "hidden",
    ),
  };
}

function AssetTable({
  columns,
  data,
  loading,
  error,
  emptyMessage = "No assets found.",
  onRowAction,
  desktopPageSize = 20,
  mobilePageSize = 10,
}) {
  const {
    pagedData,
    page,
    totalPages,
    colSpan,
    rangeStart,
    rangeEnd,
    total,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
    handleRowAction,
    getAbsoluteIndex,
  } = useAssetTable({
    data,
    columns,
    onRowAction,
    desktopPageSize,
    mobilePageSize,
  });

  const showPagination = !loading && !error && data.length > 0;
  const { titleCol, badgeCol, dateCol, metaCols } = resolveCardRoles(columns);

  const renderEmptyState = (icon, message) => (
    <div className="asset-table-empty">
      <FontAwesomeIcon icon={icon} spin={icon === "fa-solid fa-spinner"} />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="asset-table-container">
      {/* ── Desktop / tablet table ── */}
      <div className="asset-table-wrap">
        <table className="asset-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} data-priority={col.priority || "high"}>
                  {col.label}
                </th>
              ))}
              <th className="asset-action-col">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="asset-empty-cell">
                  {renderEmptyState("fa-solid fa-spinner", "Loading assets…")}
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={colSpan} className="asset-empty-cell">
                  {renderEmptyState(
                    "fa-solid fa-triangle-exclamation",
                    typeof error === "string"
                      ? error
                      : "Failed to load assets. Please try again.",
                  )}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="asset-empty-cell">
                  {renderEmptyState("fa-solid fa-box-open", emptyMessage)}
                </td>
              </tr>
            ) : (
              pagedData.map((asset, index) => (
                <tr key={asset.id} className="asset-table-row">
                  {columns.map((col) => (
                    <td key={col.key} data-priority={col.priority || "high"}>
                      {col.render(asset, getAbsoluteIndex(index))}
                    </td>
                  ))}
                  <td className="asset-action-col">
                    <button
                      className="asset-action-btn"
                      onClick={() => handleRowAction(asset)}
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

      {/* ── Mobile card list ── */}
      <div className="asset-table-card-list">
        {loading
          ? renderEmptyState("fa-solid fa-spinner", "Loading assets…")
          : error
            ? renderEmptyState(
                "fa-solid fa-triangle-exclamation",
                typeof error === "string"
                  ? error
                  : "Failed to load assets. Please try again.",
              )
            : data.length === 0
              ? renderEmptyState("fa-solid fa-box-open", emptyMessage)
              : pagedData.map((asset, index) => {
                  const absIndex = getAbsoluteIndex(index);
                  return (
                    <div
                      className="asset-table-card"
                      key={asset.id}
                      onClick={() => handleRowAction(asset)}
                    >
                      {/* ── Header: date + status ── */}
                      <div className="asset-table-card-header">
                        {dateCol && (
                          <span className="asset-table-card-date">
                            {dateCol.render(asset, absIndex)}
                          </span>
                        )}
                        {badgeCol && (
                          <div className="asset-table-card-badge-slot">
                            {badgeCol.render(asset, absIndex)}
                          </div>
                        )}
                      </div>

                      {/* ── Description: solo, full width ── */}
                      {titleCol && (
                        <p className="asset-table-card-title">
                          {titleCol.render(asset, absIndex)}
                        </p>
                      )}

                      {/* ── Meta: stacked on mobile, wrapped row on tablet ── */}
                      {metaCols.length > 0 && (
                        <div className="asset-table-card-meta">
                          {metaCols.map((col) => (
                            <span
                              className="asset-table-card-stat"
                              key={col.key}
                            >
                              {col.card?.icon && (
                                <span className="asset-table-card-meta-icon">
                                  <FontAwesomeIcon icon={col.card.icon} />
                                </span>
                              )}
                              {col.render(asset, absIndex)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
      </div>

      {showPagination && (
        <div className="asset-pagination">
          <span className="asset-pagination-info">
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          <div className="asset-pagination-controls">
            <button
              className="asset-page-btn"
              onClick={prevPage}
              disabled={isFirstPage}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
            </button>
            <span className="asset-page-indicator">
              {page} / {totalPages}
            </span>
            <button
              className="asset-page-btn"
              onClick={nextPage}
              disabled={isLastPage}
              aria-label="Next page"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetTable;
