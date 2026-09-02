import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { displayDate } from "../../utils/date";
import { TOP_TABS, ROOM_SUB_TABS } from "../../data/transfer";
import { useTransfers } from "../../hooks/transfer/useTransfers";
import Table from "../../components/panel/Table";
import TransferRoomCard from "../../components/ui/card/transfer/TransferRoomCard";
import TransferRoomModal from "../../components/modal/TransferRoomModal";
import { TRANSFER_COLUMNS } from "../../data/columns";
import "./Transfer.css";

function TransferRoom() {
  const {
    handleTopTabClick,
    activeRoomSub,
    handleSubTabChange,
    showTransferRoomModal,
    handleTransferRoom,
    handleTransferRoomModalClose,
    items,
    loading,
    error,
    emptyState,
  } = useTransfers({ currentTop: "rooms" });

  return (
    <MainLayout>
      <div className="transfer-page">
        <div className="transfer-header">
          <div className="transfer-header-left">
            <h1 className="title">Transfer</h1>
            <p className="date">{displayDate}</p>
          </div>

          <div className="transfer-header-right">
            <button
              className="transfer-action-btn"
              onClick={handleTransferRoom}
            >
              <FontAwesomeIcon icon="fa-solid fa-right-left" />
              Move Asset
            </button>
          </div>
        </div>

        <div className="transfer-top-tabs">
          {TOP_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`transfer-top-tab${
                tab.key === "rooms" ? " transfer-top-tab--active" : ""
              }`}
              onClick={() => handleTopTabClick(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="transfer-sub-tabs">
          {ROOM_SUB_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`transfer-sub-tab${
                tab.key === activeRoomSub ? " transfer-sub-tab--active" : ""
              }`}
              onClick={() => handleSubTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="transfer-table-wrap">
          <Table
            columns={TRANSFER_COLUMNS.room}
            items={items}
            loading={loading}
            error={error}
            itemLabel="room transfers"
            emptyMessage={emptyState.message}
            emptyIcon={emptyState.icon}
            hideHeaderOnMobile
            renderItem={(item) => (
              <TransferRoomCard
                key={item.id}
                request={item}
                columns={TRANSFER_COLUMNS.room}
              />
            )}
          />
        </div>

        {showTransferRoomModal && (
          <TransferRoomModal onClose={handleTransferRoomModalClose} />
        )}
      </div>
    </MainLayout>
  );
}

export default TransferRoom;
