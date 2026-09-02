import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import BackButton from "../../../components/ui/button/BackButton";
import useReportLogInfo from "../../../hooks/audit/useReportLogInfo";
import { formatDate } from "../../../utils/date";
import { PDFPreviewModal } from "../../../components/modal/PDFPreviewModal";
import { ReportLogPDF } from "../../../pdf/templates/ReportLogPDF";
import { reportLogInfoColumns } from "../../../data/columns";
import Table from "../../../components/panel/Table";
import ReportLogInfoCard from "../../../components/ui/card/audit/ReportLogInfoCard";
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

        <div className="report-log-info-table">
          <Table
            columns={reportLogInfoColumns}
            items={filteredReports}
            loading={loading}
            error={error}
            itemLabel="reports"
            emptyMessage="No reports match your filters."
            renderItem={(report) => (
              <ReportLogInfoCard
                key={report.id}
                report={report}
                columns={reportLogInfoColumns}
                onClick={() => handleRowClick(report.id)}
              />
            )}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default ReportLogInfo;
