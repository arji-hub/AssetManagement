import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import BackButton from "../../components/ui/button/BackButton";
import ReportLogPagination from "../../components/ui/pagination/ReportLogPagination";
import useReportLogInfo from "../../hooks/audit/useReportLogInfo";
import { formatDate } from "../../utils/date";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { ReportLogPDF } from "../../pdf/templates/ReportLogPDF";
import "./ReportLogInfo.css";

function ReportLogInfo() {
  const {
    reportLog,
    loading,
    error,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filteredReports,
    paginatedReports,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    handleRowClick,
  } = useReportLogInfo();
  return (
    <MainLayout>
      <div className="report-log-info-page">
        <div className="report-log-info-header">
          <div className="report-log-info-header-left">
            <BackButton nav="/audit/report" />
            <div>
              <h2 className="report-log-info-title">
                {loading
                  ? "Loading log..."
                  : (reportLog?.log_name ?? "Report Log")}
              </h2>
              <p className="report-log-info-subtitle">
                {loading
                  ? "Fetching log details..."
                  : `${reportLog?.audit_no ? `${reportLog.audit_no} · ` : ""}Generated ${formatDate(reportLog?.created_at)}`}
              </p>
            </div>
          </div>
          {!loading && reportLog && (
            <div className="report-log-info-header-actions">
              <PDFPreviewModal
                title="Report Log"
                fileName={`report-log-${reportLog.id}.pdf`}
                document={
                  <ReportLogPDF
                    reportLog={reportLog}
                    reports={reportLog.reportInfo}
                  />
                }
                triggerLabel="View Report Log PDF"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="report-log-info-error" role="alert">
            {error}
          </p>
        )}

        {!loading && reportLog && (
          <div className="report-log-info-stats">
            <div className="report-log-info-stat-card">
              <div className="report-log-info-stat-icon report-log-info-stat-icon-total">
                <FontAwesomeIcon icon="fa-solid fa-layer-group" />
              </div>
              <div>
                <p className="report-log-info-stat-value">
                  {reportLog.report_count ?? 0}
                </p>
                <p className="report-log-info-stat-label">Total Reports</p>
              </div>
            </div>

            <div className="report-log-info-stat-card">
              <div className="report-log-info-stat-icon report-log-info-stat-icon-damaged">
                <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
              </div>
              <div>
                <p className="report-log-info-stat-value">
                  {reportLog.damaged_count ?? 0}
                </p>
                <p className="report-log-info-stat-label">Damaged</p>
              </div>
            </div>

            <div className="report-log-info-stat-card">
              <div className="report-log-info-stat-icon report-log-info-stat-icon-missing">
                <FontAwesomeIcon icon="fa-solid fa-circle-question" />
              </div>
              <div>
                <p className="report-log-info-stat-value">
                  {reportLog.missing_count ?? 0}
                </p>
                <p className="report-log-info-stat-label">Missing</p>
              </div>
            </div>
          </div>
        )}

        <div className="report-log-info-filter">
          <div className="report-log-info-search">
            <FontAwesomeIcon
              icon="magnifying-glass"
              className="report-log-info-search-icon"
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

          {!loading && reportLog && (
            <p className="report-log-info-count">
              {filteredReports.length} of {reportLog.report_count ?? 0} reports
            </p>
          )}
        </div>

        {/* Desktop table */}
        <div className="report-log-info-table-wrapper">
          <table className="report-log-info-table">
            <thead>
              <tr>
                <th>Report No.</th>
                <th>Description</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>Location</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="report-log-info-table-empty">
                    Loading reports...
                  </td>
                </tr>
              )}

              {!loading && filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="report-log-info-table-empty">
                    No reports match your filters.
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedReports.map((report) => (
                  <tr key={report.id} onClick={() => handleRowClick(report.id)}>
                    <td>{report.report_no}</td>
                    <td>{report.description}</td>
                    <td>
                      <span
                        className={`report-log-info-type-badge report-log-info-type-${report.type}`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td>
                      {report.reported_by ? report.reported_by_name : "---"}
                    </td>
                    <td>{report.location}</td>
                    <td>{formatDate(report.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="report-log-info-card-list">
          {loading && (
            <p className="report-log-info-card-empty">Loading reports...</p>
          )}

          {!loading && filteredReports.length === 0 && (
            <p className="report-log-info-card-empty">
              No reports match your filters.
            </p>
          )}

          {!loading &&
            paginatedReports.map((report) => (
              <div
                key={report.id}
                className="report-log-info-card"
                onClick={() => handleRowClick(report.id)}
              >
                <div className="report-log-info-card-header">
                  <p className="report-log-info-card-title">
                    {report.report_no}
                  </p>
                  <span
                    className={`report-log-info-type-badge report-log-info-type-${report.type}`}
                  >
                    {report.type}
                  </span>
                </div>
                <div className="report-log-info-card-meta">
                  {report.description && (
                    <div className="report-log-info-card-meta-row">
                      <div className="report-log-info-card-description">
                        <div
                          className="report-log-info-card-meta-icon"
                          title="Description"
                        >
                          <FontAwesomeIcon icon="fa-solid fa-file-lines" />
                        </div>
                        <span className="report-log-info-card-meta-value">
                          {report.description}
                        </span>
                      </div>
                    </div>
                  )}

                  {report.location && (
                    <div className="report-log-info-card-meta-row">
                      <div className="report-log-info-card-description">
                        <div
                          className="report-log-info-card-meta-icon"
                          title="Location"
                        >
                          <FontAwesomeIcon icon="fa-solid fa-location-dot" />
                        </div>
                        <span className="report-log-info-card-meta-value">
                          {report.location}
                        </span>
                      </div>
                    </div>
                  )}

                  {(report.reported_by_name || report.reported_by) && (
                    <div className="report-log-info-card-meta-row">
                      <div className="report-log-info-card-custodian">
                        <div
                          className="report-log-info-card-meta-icon"
                          title="Reported by"
                        >
                          <FontAwesomeIcon icon="fa-solid fa-user" />
                        </div>
                        <span className="report-log-info-card-meta-value">
                          {report.reported_by_name ?? report.reported_by}
                        </span>
                      </div>
                      <div className="report-log-info-card-date">
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
      </div>
    </MainLayout>
  );
}

export default ReportLogInfo;
