import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import CustodianTable from "../../components/panel/CustodianTable";
import CustodianModal from "../../components/ui/modal/CustodianModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { useCustodian } from "../../hooks/custodian/useCustodian";
import { ROLE_FILTER_OPTIONS } from "../../data/roles";
import { CustodianListPDF } from "../../pdf/templates/CustodianListPDF";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { displayDate } from "../../utils/date";

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
            <h1 className="title">Custodian</h1>
            <p className="date">{displayDate}</p>
          </div>
          <div className="custodian-settings">
            <PDFPreviewModal
              title="Custodian List"
              fileName="custodian-list.pdf"
              document={<CustodianListPDF custodians={custodians} />}
              triggerLabel="Custodian List"
            />
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
        <div className="custodian-cards">
          <CustodianTable custodians={custodians} loading={isFetching} />
        </div>
      </div>

      {showModal && (
        <CustodianModal
          onClose={closeModal}
          onSubmit={handleAddCustodian}
          isSubmitting={isSubmitting}
        />
      )}

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
