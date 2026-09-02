import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import BackButton from "../../../components/ui/button/BackButton";
import GenerateReportLogModal from "../../../components/modal/GenerateReportLogModal";
import AddingStatusModal from "../../../components/ui/status/AddingStatusModal";
import useReportLogCreate from "../../../hooks/audit/useReportLogCreate";
import { reportLogCreateColumns } from "../../../data/columns";
import Table from "../../../components/panel/Table";
import ReportLogCreateCard from "../../../components/ui/card/audit/ReportLogCreateCard";
import "./ReportLogCreate.css";
import DateRangeModal from "../../../components/modal/DateRangeModal";

function ReportLogCreate() {
  const {
    loading,
    error,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    filteredReports,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelectedReports,
    allFilteredSelected,
    isGenerateModalOpen,
    logName,
    setLogName,
    openGenerateModal,
    closeGenerateModal,
    handleGenerate,
    generateStatus,
    generateErrorMessage,
    closeStatusModal,
    handleReportClick,
  } = useReportLogCreate();

  return (
    <MainLayout>
      <div className="report-log-create-page">
        <div className="report-log-create-header">
          <div className="report-log-create-header-left">
            <BackButton nav="/audit/report" />
            <div>
              <h2 className="report-log-create-title">Create Report Log</h2>
              <p className="report-log-create-subtitle">
                Filter and select reports to include in this log.
              </p>
            </div>
          </div>

          <div className="report-log-create-header-actions">
            <button
              className="report-log-btn-primary"
              type="button"
              onClick={openGenerateModal}
              disabled={selectedIds.size === 0}
            >
              <FontAwesomeIcon icon="fa-solid fa-bolt" />
              Generate ({selectedIds.size})
            </button>
          </div>
        </div>

        <div className="report-log-create-filter">
          <div className="report-log-search">
            <FontAwesomeIcon
              icon="magnifying-glass"
              className="report-log-search-icon"
            />
            <input
              type="text"
              placeholder="Search by report no. or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="report-filter-segment">
            {[
              { value: "all", label: "All" },
              { value: "damaged", label: "Damaged" },
              { value: "missing", label: "Missing" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`report-filter-option ${
                  typeFilter === opt.value ? "report-filter-option--active" : ""
                }`}
                onClick={() => setTypeFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <DateRangeModal
            startDate={startDate}
            endDate={endDate}
            onApply={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        {error && (
          <p className="report-log-error" role="alert">
            {error}
          </p>
        )}

        {!loading && filteredReports.length > 0 && (
          <div className="report-log-toolbar">
            <div className="report-log-toolbar-left">
              <label className="report-log-select-all">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                />
                Select all filtered
              </label>
            </div>

            <div className="report-log-toolbar-right">
              <span className="report-log-selected-count">
                {selectedIds.size} of {filteredReports.length} selected
              </span>

              {selectedIds.size > 0 && (
                <button
                  type="button"
                  className="report-log-btn-clear"
                  onClick={clearSelectedReports}
                  aria-label="Clear all selections"
                >
                  <FontAwesomeIcon icon="fa-solid fa-xmark" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}

        <div className="report-log-create-table">
          <Table
            columns={reportLogCreateColumns}
            items={filteredReports}
            loading={loading}
            error={error}
            itemLabel="reports"
            emptyMessage="No reports match your filters."
            renderItem={(report) => (
              <ReportLogCreateCard
                key={report.id}
                report={report}
                columns={reportLogCreateColumns}
                selected={selectedIds.has(report.id)}
                onToggleSelect={toggleSelect}
                onClick={(r) => handleReportClick(r.id)}
              />
            )}
          />
        </div>

        {isGenerateModalOpen && (
          <GenerateReportLogModal
            logName={logName}
            setLogName={setLogName}
            selectedCount={selectedIds.size}
            onClose={closeGenerateModal}
            onSubmit={handleGenerate}
            isSubmitting={false}
          />
        )}

        {generateStatus && (
          <AddingStatusModal
            title="Report Log"
            status={generateStatus}
            errorMessage={generateErrorMessage}
            onClose={closeStatusModal}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default ReportLogCreate;
