import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { displayDate } from "../../utils/date";
import { TOP_TABS } from "../../data/transfer";
import { useTransferPage } from "../../hooks/transfer/useTransferPage";
import TransferPanel from "../../components/panel/TransferPanel";
import TransferModal from "../../components/ui/modal/TransferModal";
import TransferMR from "../../components/ui/modal/TransferMR";
import ROLES from "../../data/roles";
import "./Transfer.css";

function Transfer() {
  const {
    isRole,
    activeTransferSub,
    visibleSubTabs,
    handleSubTabChange,
    handleTopTabClick,
    showTransferModal,
    handleTransferRequest,
    handleTransferModalClose,
    showTransferMR,
    handleTransferMR,
    handleTransferMRClose,
  } = useTransferPage({ currentTop: "transfers" });

  return (
    <MainLayout>
      <div className="transfer-page">
        {/* header */}
        <div className="transfer-header">
          <div className="transfer-header-left">
            <h1 className="transfer-title">Transfers</h1>
            <p className="transfer-date">{displayDate}</p>
          </div>

          <div className="transfer-header-right">
            {isRole != ROLES.ADMIN && (
              <button
                className="transfer-action-btn"
                onClick={handleTransferMR}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-group" />
                Local MR
              </button>
            )}
            {isRole != ROLES.PARTTIME && (
              <button
                className="transfer-action-btn"
                onClick={handleTransferRequest}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-tag" />
                Transfer Custodian
              </button>
            )}
          </div>
        </div>

        {/* top tabs */}
        {isRole == ROLES.ADMIN && (
          <div className="transfer-top-tabs">
            {TOP_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`transfer-top-tab${
                  tab.key === "transfers" ? " transfer-top-tab--active" : ""
                }`}
                onClick={() => handleTopTabClick(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* sub tabs */}
        <div className="transfer-sub-tabs">
          {visibleSubTabs.map((tab) => (
            <button
              key={tab.key}
              className={`transfer-sub-tab${
                activeTransferSub === tab.key ? " transfer-sub-tab--active" : ""
              }`}
              onClick={() => handleSubTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="transfer-table-wrap">
          {activeTransferSub === "action" && <TransferPanel group="action" />}
          {activeTransferSub === "requested" && (
            <TransferPanel group="requested" />
          )}
          {activeTransferSub === "logs" && <TransferPanel group="logs" />}
        </div>

        {showTransferModal && (
          <TransferModal onClose={handleTransferModalClose} />
        )}
        {showTransferMR && <TransferMR onClose={handleTransferMRClose} />}
      </div>
    </MainLayout>
  );
}

export default Transfer;
