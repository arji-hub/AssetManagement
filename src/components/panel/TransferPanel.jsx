import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTransferPanel } from "../../hooks/useTransferPanel";
import TransferCard from "../ui/card/TransferCard";
import { EMPTY_STATE_CONFIG } from "../../data/transfer";
import TransferRoomCard from "../ui/card/TransferRoomCard";
import "./TransferPanel.css";

function TransferPanel({
  group = "action",
  items: itemsProp,
  loading: loadingProp,
  error: errorProp,
}) {
  const hook = useTransferPanel(group, { skip: itemsProp !== undefined });

  const items = itemsProp ?? hook.items;
  const loading = loadingProp ?? hook.loading;
  const error = errorProp ?? hook.error;
  const handleRowClick = hook.handleRowClick;

  const emptyState = EMPTY_STATE_CONFIG[group] || EMPTY_STATE_CONFIG.action;
  const showHeader =
    !loading && !error && items.length != 0 && group !== "room_logs";
  const showRoomHeader =
    !loading && !error && items.length !== 0 && group === "room_logs";

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
    </div>
  );
}

export default TransferPanel;
