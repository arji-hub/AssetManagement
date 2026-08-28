import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { displayDate } from "../../utils/date";
import { TOP_TABS } from "../../data/transfer";
import { useTransfers } from "../../hooks/transfer/useTransfers";
import Table from "../../components/panel/Table";
import TransferCard from "../../components/ui/card/transfer/TransferCard";
import TransferModal from "../../components/ui/modal/TransferModal";
import TransferMR from "../../components/ui/modal/TransferMR";
import ROLES from "../../data/roles";
import { TRANSFER_COLUMNS } from "../../data/Columns";
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
    items,
    loading,
    error,
    handleRowClick,
    emptyState,
    showHeader,
  } = useTransfers({ currentTop: "transfers" });

  const columns = showHeader ? TRANSFER_COLUMNS.action : undefined;

  return (
    <MainLayout>
      <div className="transfer-page">
        <div className="transfer-header">
          <div className="transfer-header-left">
            <h1 className="title">Transfer</h1>
            <p className="date">{displayDate}</p>
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

        {isRole == ROLES.ADMIN && (
          <div className="transfer-top-tabs">
            {TOP_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`transfer-top-tab${tab.key === "transfers" ? " transfer-top-tab--active" : ""}`}
                onClick={() => handleTopTabClick(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="transfer-sub-tabs">
          {visibleSubTabs.map((tab) => (
            <button
              key={tab.key}
              className={`transfer-sub-tab${activeTransferSub === tab.key ? " transfer-sub-tab--active" : ""}`}
              onClick={() => handleSubTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="transfer-table-wrap">
          <Table
            columns={columns}
            items={items}
            loading={loading}
            error={error}
            itemLabel="transfers"
            emptyMessage={emptyState.message}
            emptyIcon={emptyState.icon}
            hideHeaderOnMobile
            renderItem={(item) => (
              <TransferCard
                key={item.id}
                request={item}
                columns={columns}
                onClick={handleRowClick}
              />
            )}
          />
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
