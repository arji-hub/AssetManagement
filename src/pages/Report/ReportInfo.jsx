import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { fetchReportByID } from "../../services/report";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../data/roles";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import { getReportType } from "../../utils/report";
import LoadingScreen from "../../components/ui/status/LoadingScreen";
import ReportLog from "../../components/ui/card/ReportLog";
import "./ReportInfo.css";

function ReportInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchReportByID(id)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <MainLayout>
        <LoadingScreen />
      </MainLayout>
    );

  if (error)
    return (
      <MainLayout>
        <div className="asset-info-error">{error}</div>
      </MainLayout>
    );

  const reportType = getReportType(report);
  const isDamaged = report.status === "damaged";
  const isMissing = report.status === "missing";
  const isForRepair = report.status === "for_repair";
  const isFound = report.status === "found";
  const isResolved =
    report.status === "working" || report.status === "condemned";

  // photo from first status_log entry that has an image
  const evidencePhoto = report.status_log?.find((log) => log.img)?.img ?? null;

  return (
    <MainLayout>
      <div className="report-info-page">
        {/* ── Header ── */}
        <div className="asset-info-header">
          <div className="asset-info-breadcrumb">
            <button
              className="return-button"
              onClick={() => navigate("/report")}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              Back
            </button>
            <span className="breadcrumb-parent">Report Information</span>
          </div>
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
              <h2 className="report-info-asset-name">
                {report.asset_description}
              </h2>
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

            {/* Details */}
            <div className="report-info-details">
              <div className="report-info-detail-box">
                <span className="report-info-field-label">LOCATION</span>
                <p className="report-info-field-value">
                  {report.location || "—"}
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

          {/* ── Actions ── */}
          {isAdmin && !isResolved && (
            <div className="report-info-actions">
              {/* Damaged actions */}
              {isDamaged && (
                <>
                  <button className="action-btn" disabled>
                    <i className="ti ti-tool" aria-hidden="true" />
                    Endorse for Repair
                  </button>
                  <button className="action-btn action-btn--danger" disabled>
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}

              {/* Missing actions */}
              {isMissing && (
                <>
                  <button className="action-btn" disabled>
                    <i className="ti ti-circle-check" aria-hidden="true" />
                    Mark as Found
                  </button>
                  <button className="action-btn action-btn--danger" disabled>
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}

              {/* For Repair actions */}
              {isForRepair && (
                <>
                  <button className="action-btn" disabled>
                    <i className="ti ti-circle-check" aria-hidden="true" />
                    Mark as Working
                  </button>
                  <button className="action-btn action-btn--danger" disabled>
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}

              {/* Found actions */}
              {isFound && (
                <>
                  <button className="action-btn" disabled>
                    <i className="ti ti-circle-check" aria-hidden="true" />
                    Mark as Working
                  </button>
                  <button className="action-btn action-btn--danger" disabled>
                    <i className="ti ti-ban" aria-hidden="true" />
                    Condemn
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Status Log */}
        <div className="report-log-card">
          <span className="report-info-section-label">STATUS HISTORY</span>
          <div className="report-info-log">
            {report.status_log.map((log, index) => (
              <ReportLog key={index} log={log} />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ReportInfo;
