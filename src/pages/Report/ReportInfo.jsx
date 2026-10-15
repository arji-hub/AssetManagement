import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import ReportLog from "../../components/ui/card/report/ReportLog";
import ReportActionModal from "../../components/modal/ReportActionModal";
import BackButton from "../../components/ui/button/BackButton";
import { useReportInfo } from "../../hooks/report/useReportInfo";
import ReportInfoSkeleton from "../../components/ui/skeleton/ReportInfoSkeleton";
import "./ReportInfo.css";

function ReportInfo() {
  const { id } = useParams();
  const {
    report,
    loading,
    error,
    reportType,
    evidencePhoto,
    isAdmin,
    isDamaged,
    isMissing,
    isForRepair,
    isResolved,
    actionModal,
    openAction,
    closeAction,
    refresh,
  } = useReportInfo(id);

  if (loading)
    return (
      <MainLayout>
        <ReportInfoSkeleton />
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout>
        <div className="asset-info-error">{error}</div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="report-info-page">
        {/* ── Header ── */}
        <div className="asset-info-header">
          <div className="asset-info-breadcrumb">
            <BackButton />
            <span className="breadcrumb-parent">Report Information</span>
          </div>
          {/* ── Actions ── */}
          {isAdmin && !isResolved && (
            <div className="report-info-actions">
              {/* Damaged actions */}
              {isDamaged && (
                <>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => openAction("for_repair")}
                  >
                    <i className="ti ti-tool" aria-hidden="true" />
                    Endorse for Repair/Replacement
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => openAction("condemned")}
                  >
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}

              {/* Missing actions */}
              {isMissing && (
                <>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => openAction("found")}
                  >
                    <i className="ti ti-circle-check" aria-hidden="true" />
                    Mark as Found
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => openAction("condemned")}
                  >
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}

              {/* For Repair or Found actions */}
              {isForRepair && (
                <>
                  <button
                    className="action-btn action-btn--danger"
                    onClick={() => openAction("working")}
                  >
                    <i className="ti ti-circle-check" aria-hidden="true" />
                    Mark as Resolved
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => openAction("condemned")}
                  >
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Main Card ── */}
        <div className="report-info-card">
          {/* Card Header */}
          <div className="report-info-card-header">
            <div className="report-info-card-header-left">
              <span className="report-info-type-label">
                {reportType === "damaged"
                  ? "Incident Report"
                  : "Missing Report"}
              </span>
              <h2 className="report-info-asset-name">{report.description}</h2>
              <p className="report-info-asset-id">{report.asset_id}</p>
            </div>
            <div className="report-info-card-header-right">
              <span className="report-info-date">
                {formatDate(report.date_reported)}
              </span>
            </div>
          </div>

          {/* Narrative */}
          <div className="report-info-section">
            <div className="report-info-section-header">
              <span className="report-info-section-label">
                INCIDENT NARRATIVE
              </span>
              <Status status={report.status} />
            </div>
            <p className="report-info-narrative">{report.narrative}</p>
          </div>

          {/* Evidence + Details Grid */}
          <div className="report-info-grid">
            {/* Evidence — damaged only */}
            {isDamaged && (
              <div className="report-info-evidence">
                <span className="report-info-field-label">EVIDENCE</span>
                {evidencePhoto ? (
                  <img
                    src={evidencePhoto}
                    alt="Evidence"
                    className="report-info-evidence-img"
                  />
                ) : (
                  <div className="report-info-evidence-placeholder">
                    <FontAwesomeIcon icon="fa-solid fa-image" />
                    <span>No photo</span>
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="report-info-details">
              <div className="report-info-detail-box">
                <span className="report-info-field-label">ROOM</span>
                <p className="report-info-field-value">
                  {report.room_name || (
                    <span style={{ fontStyle: "italic" }}>Unallocated</span>
                  )}
                </p>
              </div>
              <div className="report-info-detail-box">
                <span className="report-info-field-label">CUSTODIAN</span>
                <p className="report-info-field-value">
                  {report.custodian_name || "—"}
                </p>
              </div>
              <div className="report-info-detail-box">
                <span className="report-info-field-label">REPORTED BY</span>
                <p className="report-info-field-value report-info-field-value--upper">
                  {report.reported_by_name || "—"}
                </p>
              </div>
              <div className="report-info-detail-box">
                <span className="report-info-field-label">REPORT NO.</span>
                <p className="report-info-field-value">
                  {report.report_no || "—"}
                </p>
              </div>
              {report.date_resolved && (
                <div className="report-info-detail-box">
                  <span className="report-info-field-label">DATE RESOLVED</span>
                  <p className="report-info-field-value">
                    {formatDate(report.date_resolved)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Log */}
        <div className="report-info-status-card">
          <span className="report-info-section-label">STATUS HISTORY</span>
          <div className="report-info-log">
            {report.status_log.map((log, index) => (
              <ReportLog key={index} log={log} />
            ))}
          </div>
        </div>
      </div>

      {actionModal && (
        <ReportActionModal
          report={report}
          newStatus={actionModal}
          onClose={closeAction}
          onSuccess={refresh}
        />
      )}
    </MainLayout>
  );
}

export default ReportInfo;
