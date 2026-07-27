import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import CustodianCard from "../../components/ui/card/CustodianCard";
import CustodianModal from "../../components/ui/modal/CustodianModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { useCustodian } from "../../hooks/custodian/useCustodian";
import { ROLE_FILTER_OPTIONS } from "../../data/roles";

function Custodian() {
  const { user } = useAuth();
  const {
    custodians,
    isFetching,
    roleFilter,
    handleRoleFilter,
    showModal,
    openModal,
    closeModal,
    isSubmitting,
    handleAddCustodian,
    status,
    submitError,
    handleStatusClose,
  } = useCustodian();

  return (
    <MainLayout>
      <div className="custodian-page">
        <div className="custodian-top">
          <div className="custodian-header">
            <h1>Custodian</h1>
            <p>Welcome, {user.username}! This is the custodian page.</p>
          </div>
          <div className="custodian-settings">
            {/* Filters */}
            <div className="report-filter-segment">
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`report-filter-option ${
                    roleFilter === opt.value
                      ? "report-filter-option--active"
                      : ""
                  }`}
                  onClick={() => handleRoleFilter(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="settings-button" onClick={openModal}>
              Add Custodian
            </button>
          </div>
        </div>

        {/* ── Custodian Cards ── */}
        <div className="custodian-cards">
          {isFetching ? (
            <p className="custodian-loading">Loading custodians...</p>
          ) : custodians.length === 0 ? (
            <p className="custodian-empty">No custodians found.</p>
          ) : (
            custodians.map((c) => (
              <CustodianCard
                key={c.id}
                name={c.fullname}
                username={c.username}
                classification={c.role}
                totalAssets={c.asset_count ?? 0}
              />
            ))
          )}
        </div>
      </div>

      {/* ── CustodianModal ── */}
      {showModal && (
        <CustodianModal
          onClose={closeModal}
          onSubmit={handleAddCustodian}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ── Status Modal ── */}
      {status !== "idle" && (
        <AddingStatusModal
          title="Custodian"
          status={status}
          errorMessage={submitError}
          onClose={handleStatusClose}
        />
      )}
    </MainLayout>
  );
}

export default Custodian;
