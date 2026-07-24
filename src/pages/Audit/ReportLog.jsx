import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import AuditCard from "../../components/ui/card/AuditCard";
import useReportLog from "../../hooks/audit/useReportLog";
import "./ReportLog.css";

function ReportLog() {
  const {
    search,
    setSearch,
    filteredLogs,
    logsLoading,
    logsError,
    stats,
    handleNewReport,
  } = useReportLog();

  return (
    <MainLayout>
      <div className="report-log-page">
        <div className="report-log-header">
          <div className="report-log-header-left">
            <div>
              <h2 className="report-log-title">Report Logs</h2>
              <p className="report-log-subtitle">
                View curated records of past damage and missing reports.
              </p>
            </div>
          </div>

          <div className="report-log-header-actions">
            <button
              className="report-log-btn-primary"
              type="button"
              onClick={handleNewReport}
            >
              <FontAwesomeIcon icon="fa-solid fa-plus" />
              New Report Log
            </button>
          </div>
        </div>

        <div className="report-log-stats">
          <AuditCard
            variant="secondary"
            label="Total logs"
            value={logsLoading ? "—" : stats.totalLogs}
          />
          <AuditCard
            variant="primary"
            label="Damage reports"
            value={logsLoading ? "—" : stats.damageReports}
          />
          <AuditCard
            variant="neutral"
            label="Missing reports"
            value={logsLoading ? "—" : stats.missingReports}
          />
        </div>

        <div className="report-log-filter">
          <div className="report-log-search">
            <FontAwesomeIcon
              icon="magnifying-glass"
              className="report-log-search-icon"
            />
            <input
              type="text"
              placeholder="Search logs by log no. or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="report-log-btn-secondary" type="button">
            <FontAwesomeIcon icon="fa-solid fa-sliders" />
            Filter
          </button>
        </div>

        {logsError && (
          <p className="report-log-error" role="alert">
            {logsError}
          </p>
        )}

        {/* TODO: replace with a ReportLogHistory table component */}
        {filteredLogs.length === 0 && !logsLoading && (
          <p className="report-log-empty">No report logs yet.</p>
        )}
      </div>
    </MainLayout>
  );
}

export default ReportLog;
