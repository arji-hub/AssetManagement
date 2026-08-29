import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import Table from "../../components/panel/Table";
import CustodianCard from "../../components/ui/card/custodian/CustodianCard";
import CustodianModal from "../../components/ui/modal/CustodianModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCustodian } from "../../hooks/custodian/useCustodian";
import { CUSTODIAN_FILTER_OPTIONS } from "../../data/roles";
import { CustodianListPDF } from "../../pdf/templates/CustodianListPDF";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { displayDate } from "../../utils/date";
import { custodianColumns } from "../../data/columns";

function Custodian() {
  const {
    custodians,
    isFetching,
    activeFilter,
    handleFilterChange,
    searchQuery,
    setSearchQuery,
    assetCountFilter,
    setAssetCountFilter,
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
            {/*  <PDFPreviewModal
              title="Custodian List"
              fileName="custodian-list.pdf"
              document={<CustodianListPDF custodians={custodians} />}
              triggerLabel="Custodian List"
            /> */}
            <div className="search-bar">
              <FontAwesomeIcon
                icon="fa-solid fa-magnifying-glass"
                className="search-icon"
              />
              <input
                type="text"
                placeholder="Search custodians..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filters">
              <label htmlFor="asset-count-filter" className="filters-label">
                Assets:
              </label>
              <select
                id="asset-count-filter"
                name="assetCount"
                value={assetCountFilter}
                onChange={(e) => setAssetCountFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="none">None (0)</option>
                <option value="low">Low (1–10)</option>
                <option value="medium">Medium (11–50)</option>
                <option value="high">High (50+)</option>
              </select>
            </div>
            <button className="settings-button" onClick={openModal}>
              Add Custodian
            </button>
          </div>
        </div>

        <div className="custodian-sub-tabs">
          {CUSTODIAN_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`custodian-sub-tab${
                activeFilter === opt.key ? " custodian-sub-tab--active" : ""
              }`}
              onClick={() => handleFilterChange(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="custodian-cards">
          <Table
            columns={custodianColumns}
            items={custodians}
            loading={isFetching}
            itemLabel="custodians"
            emptyMessage="No custodians found."
            renderItem={(custodian) => (
              <CustodianCard
                key={custodian.id}
                custodian={custodian}
                columns={custodianColumns}
              />
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
