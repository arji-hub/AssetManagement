import React from "react";
import { useTransferPanel } from "../../hooks/transfer/useTransferPanel";
import Table from "./Table";
import TransferCard from "../ui/card/transfer/TransferCard";
import TransferRoomCard from "../ui/card/transfer/TransferRoomCard";
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

      <Table
        items={items}
        loading={loading}
        error={error}
        itemLabel="transfers"
        emptyMessage={emptyState.message}
        emptyIcon={emptyState.icon}
        renderItem={(item) =>
          group === "room_logs" ? (
            <TransferRoomCard key={item.id} request={item} />
          ) : (
            <TransferCard
              key={item.id}
              request={item}
              onClick={handleRowClick}
            />
          )
        }
      />
    </div>
  );
}

export default TransferPanel;
