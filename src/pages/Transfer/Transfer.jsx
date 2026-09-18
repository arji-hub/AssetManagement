import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { displayDate } from "../../utils/date";
import { TOP_TABS } from "../../data/transfer";
import { useTransfers } from "../../hooks/transfer/useTransfers";
import Table from "../../components/panel/Table";
import TransferCard from "../../components/ui/card/transfer/TransferCard";
import ROLES from "../../data/roles";
import { TRANSFER_COLUMNS } from "../../data/columns";
import "./Transfer.css";

function Transfer() {
  const navigate = useNavigate();
  const {
    isRole,
    activeTransferSub,
    visibleSubTabs,
    handleSubTabChange,
    handleTopTabClick,
    items,
    loading,
    error,
    handleRowClick,
    emptyState,
  } = useTransfers({ currentTop: "transfers" });

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
                onClick={() => navigate("/transfer/new/local-mr")}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-group" />
                Local MR
              </button>
            )}
            {isRole != ROLES.PARTTIME && (
              <button
                className="transfer-action-btn"
                onClick={() => navigate("/transfer/new/asset")}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-tag" />
                Transfer Asset
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
            columns={TRANSFER_COLUMNS.action}
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
                columns={TRANSFER_COLUMNS.action}
                onClick={handleRowClick}
              />
            )}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default Transfer;
