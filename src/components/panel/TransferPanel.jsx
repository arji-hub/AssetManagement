import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTransferPanel } from "../../hooks/transfer/useTransferPanel";
import TransferCard from "../ui/card/TransferCard";
import TransferRoomCard from "../ui/card/TransferRoomCard";
import "./TransferPanel.css";

function TransferPanel({
  group = "action",
  items: itemsProp,
  loading: loadingProp,
  error: errorProp,
}) {
  const {
    items,
    loading,
    error,
    handleRowClick,
    page,
    totalPages,
    totalCount,
    goPrev,
    goNext,
    emptyState,
    showHeader,
    showRoomHeader,
  } = useTransferPanel(group, {
    items: itemsProp,
    loading: loadingProp,
    error: errorProp,
  });

  return (
    <div className={`transfer-panel ${group}`}>
      {showHeader && (
        <div className="transfer-card-header">
          <div className="header-text">Asset ID</div>
          <div className="header-text">Description</div>
          <div className="header-text">Type</div>
          <div className="header-text">Requested By</div>
          <div className="header-text">Status</div>
          <div className="header-text">Date</div>
        </div>
      )}
      {showRoomHeader && (
        <div className="transfer-card-header room">
          <div className="header-text">Asset ID</div>
          <div className="header-text">Description</div>
          <div className="header-text">From</div>
          <div className="header-text">To</div>
          <div className="header-text">Date</div>
        </div>
      )}
      <div className="transfer-panel-body">
        {loading ? (
          <div className="transfer-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
            <p>Loading transfers…</p>
          </div>
        ) : error ? (
          <div className="transfer-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
            <p>{error?.message || error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="transfer-panel-empty">
            <FontAwesomeIcon icon={emptyState.icon} />
            <p>{emptyState.message}</p>
          </div>
        ) : group === "room_logs" ? (
          items.map((item) => <TransferRoomCard key={item.id} request={item} />)
        ) : (
          items.map((item) => (
            <TransferCard
              key={item.id}
              request={item}
              onClick={handleRowClick}
            />
          ))
        )}
      </div>

      {!loading && !error && totalCount > 0 && (
        <div className="transfer-panel-pagination">
          <span className="transfer-panel-pagination-info">
            Page {page} of {totalPages}
          </span>
          <div className="transfer-panel-pagination-controls">
            <button
              type="button"
              className="transfer-panel-pagination-btn"
              onClick={goPrev}
              disabled={page <= 1}
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
              Prev
            </button>
            <button
              type="button"
              className="transfer-panel-pagination-btn"
              onClick={goNext}
              disabled={page >= totalPages}
            >
              Next
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferPanel;
