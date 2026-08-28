import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import Table from "../../components/panel/Table";
import CustodianCard from "../../components/ui/card/custodian/CustodianCard";
import CustodianModal from "../../components/ui/modal/CustodianModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { useCustodian } from "../../hooks/custodian/useCustodian";
import { ROLE_FILTER_OPTIONS } from "../../data/roles";
import { CustodianListPDF } from "../../pdf/templates/CustodianListPDF";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { displayDate } from "../../utils/date";
import { custodianColumns } from "../../data/Columns";

function Custodian() {
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
          <Table
            columns={custodianColumns}
            items={custodians}
            loading={isFetching}
            itemLabel="custodians"
            emptyMessage="No custodians found."
            renderItem={(custodian) => (
              <CustodianCard key={custodian.id} custodian={custodian} />
            )}
          />
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
