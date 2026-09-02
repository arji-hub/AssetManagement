import MainLayout from "../../components/layout/MainLayout";
import "./Custodian.css";
import Table from "../../components/panel/Table";
import CustodianCard from "../../components/ui/card/custodian/CustodianCard";
import CustodianModal from "../../components/modal/CustodianModal";
import AddingStatusModal from "../../components/ui/status/AddingStatusModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCustodian } from "../../hooks/custodian/useCustodian";
import { CUSTODIAN_FILTER_OPTIONS } from "../../data/roles";
import { displayDate } from "../../utils/date";
import { custodianColumns } from "../../data/columns";
import SearchBar from "../../components/ui/searchBar/SearchBar";
import AssetCountFilter from "../../components/ui/filter/AssetCountFilter";

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
            <div className="search-bar-wrapper">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search custodians..."
              />
            </div>
            <AssetCountFilter
              value={assetCountFilter}
              onChange={setAssetCountFilter}
            />

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
