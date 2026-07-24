import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import BackButton from "../../components/ui/button/BackButton";
import ReportLogPagination from "../../components/ui/pagination/ReportLogPagination";
import GenerateReportLogModal from "../../components/ui/modal/GenerateReportLogModal";
import useReportLogCreate from "../../hooks/audit/useReportLogCreate";
import { formatDate } from "../../utils/date";
import "./ReportLogCreate.css";

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
    paginatedReports,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    allFilteredSelected,
    isGenerateModalOpen,
    logName,
    setLogName,
    openGenerateModal,
    closeGenerateModal,
    handleGenerate,
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

          <select
            className="report-log-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="damaged">Damage</option>
            <option value="missing">Missing</option>
          </select>

          <div className="report-log-date-range">
            <input
              type="date"
              className="report-log-date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
            />
            <span className="report-log-date-separator">to</span>
            <input
              type="date"
              className="report-log-date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />
          </div>
        </div>

        {error && (
          <p className="report-log-error" role="alert">
            {error}
          </p>
        )}

        {!loading && filteredReports.length > 0 && (
          <div className="report-log-toolbar">
            <label className="report-log-select-all">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={toggleSelectAll}
              />
              Select all filtered
            </label>
            <span className="report-log-selected-count">
              {selectedIds.size} of {filteredReports.length} selected
            </span>
          </div>
        )}

        {/* Desktop table */}
        <div className="report-log-table-wrapper">
          <table className="report-log-table">
            <thead>
              <tr>
                <th className="report-log-table-checkbox-col"></th>
                <th>Report No.</th>
                <th>Description</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="report-log-table-empty">
                    Loading reports...
                  </td>
                </tr>
              )}

              {!loading && filteredReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="report-log-table-empty">
                    No reports match your filters.
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(report.id)}
                        onChange={() => toggleSelect(report.id)}
                      />
                    </td>
                    <td>{report.report_no}</td>
                    <td>{report.description}</td>
                    <td>
                      <span
                        className={`report-log-type-badge report-log-type-${report.type}`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td>{report.reported_by_name}</td>
                    <td>{formatDate(report.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="report-log-card-list">
          {loading && (
            <p className="report-log-card-empty">Loading reports...</p>
          )}

          {!loading && filteredReports.length === 0 && (
            <p className="report-log-card-empty">
              No reports match your filters.
            </p>
          )}

          {!loading &&
            paginatedReports.map((report) => (
              <div
                key={report.id}
                className={`report-log-card ${
                  selectedIds.has(report.id) ? "report-log-card-selected" : ""
                }`}
              >
                <div className="report-log-card-header">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(report.id)}
                    onChange={() => toggleSelect(report.id)}
                  />
                  <p className="report-log-card-title">{report.report_no}</p>
                  <span
                    className={`report-log-type-badge report-log-type-${report.type}`}
                  >
                    {report.type}
                  </span>
                </div>
                <div className="report-log-card-meta">
                  {report.description && (
                    <div className="report-log-card-meta-row">
                      <div className="report-log-card-description">
                        <div
                          className="report-log-card-meta-icon"
                          title="Description"
                        >
                          <FontAwesomeIcon icon="fa-solid fa-file-lines" />
                        </div>

                        <span className="report-log-card-meta-value">
                          {report.description}
                        </span>
                      </div>
                    </div>
                  )}
                  {report.reported_by_name && (
                    <div className="report-log-card-meta-row">
                      <div className="report-log-card-custodian">
                        <div
                          className="report-log-card-meta-icon"
                          title="Reported by"
                        >
                          <FontAwesomeIcon icon="fa-solid fa-user" />
                        </div>
                        <span className="report-log-card-meta-value">
                          {report.reported_by_name}
                        </span>
                      </div>
                      <div className="report-log-card-date">
                        {formatDate(report.created_at)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {!loading && filteredReports.length > 0 && (
          <ReportLogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={prevPage}
            onNext={nextPage}
            onGoToPage={goToPage}
          />
        )}

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
      </div>
    </MainLayout>
  );
}

export default ReportLogCreate;
