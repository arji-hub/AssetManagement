import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { today } from "../../utils/date";
import { TOP_TABS } from "../../data/transfer";
import { useTransferPage } from "../../hooks/useTransferPage";
import TransferPanel from "../../components/panel/TransferPanel";
import { ROOM_SUB_TABS } from "../../data/transfer";
import TransferRoomModal from "../../components/ui/modal/TransferRoomModal";
import "./Transfer.css";

function TransferRoom() {
  const {
    showTransferRoomModal,
    handleTransferRoom,
    handleTransferRoomModalClose,
    handleTopTabClick,
  } = useTransferPage({ currentTop: "rooms" });

  return (
    <MainLayout>
      <div className="transfer-page">
        {/* header */}
        <div className="transfer-header">
          <div className="transfer-header-left">
            <h1 className="transfer-title">Transfers</h1>
            <p className="transfer-date">{today}</p>
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

        {/* top tabs */}
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

        {/* sub tabs */}
        <div className="transfer-sub-tabs">
          {ROOM_SUB_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`transfer-sub-tab${
                tab.key === "logs" ? " transfer-sub-tab--active" : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="transfer-table-wrap">
          <TransferPanel group="room_logs" />
        </div>

        {showTransferRoomModal && (
          <TransferRoomModal onClose={handleTransferRoomModalClose} />
        )}
      </div>
    </MainLayout>
  );
}

export default TransferRoom;
