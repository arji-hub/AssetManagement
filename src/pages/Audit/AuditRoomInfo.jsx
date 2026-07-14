import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import useRoomInfo from "../../hooks/audit/useRoomInfo";
import AuditCard from "../../components/ui/card/AuditCard";
import { useParams } from "react-router-dom";
import BackButton from "../../components/ui/button/BackButton";
import { formatDate } from "../../utils/date";
import "./AuditRoomInfo.css";

// == Local presentational helpers ==========================================

function DiscrepancyBanner({ hasDiscrepancies, discrepancyCount }) {
  if (!hasDiscrepancies) return null;

  return (
    <div className="audit-session-discrepancy-banner" role="alert">
      <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
      {discrepancyCount} discrepanc{discrepancyCount === 1 ? "y" : "ies"} found
      in this audit
    </div>
  );
}

const STATUS_CONFIG = {
  audited: {
    label: "Audited",
    icon: "fa-solid fa-check",
    className: "audited",
  },
  not_audited: {
    label: "Not audited",
    icon: "fa-solid fa-minus",
    className: "not-audited",
  },
  misplaced: {
    label: "Misplaced",
    icon: "fa-solid fa-triangle-exclamation",
    className: "misplaced",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    icon: "fa-solid fa-question",
    className: "unknown",
  };

  return (
    <span
      className={`audit-status-badge audit-status-badge--${config.className}`}
    >
      <FontAwesomeIcon icon={config.icon} />
      {config.label}
    </span>
  );
}

// == Component ==============================================================

function AuditRoomInfo() {
  const { auditID } = useParams();
  const {
    audit,
    auditItems,
    loading,
    error,
    totalAssets,
    auditedCount,
    progressPercent,
  } = useRoomInfo(auditID);

  const hasItems = !loading && auditItems.length > 0;

  return (
    <MainLayout>
      <div className="audit-session-page">
        {/* Header */}
        <div className="audit-session-header">
          <div className="audit-session-header-left">
            <BackButton className="audit-session-back-btn" />

            <div className="audit-session-title-group">
              <p className="audit-session-eyebrow">Audit session</p>
              <h1 className="audit-session-room-name">
                {loading
                  ? "Loading audit…"
                  : (audit?.audit_no ?? "Unknown audit")}
              </h1>
              {error && (
                <p className="audit-session-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Discrepancy banner */}
        {audit && (
          <DiscrepancyBanner
            hasDiscrepancies={audit.has_discrepancies}
            discrepancyCount={audit.discrepancy_count}
          />
        )}

        {/* Stats */}
        <div className="audit-session-stats">
          <AuditCard
            variant="primary"
            label="Total assets"
            value={loading ? "—" : totalAssets}
          />

          <AuditCard
            variant="primary"
            label="Audited"
            value={loading ? "—" : auditedCount}
          />

          <AuditCard
            variant="neutral"
            label="Discrepancies"
            value={loading ? "—" : (audit?.discrepancy_count ?? 0)}
          />

          <AuditCard
            variant="progress"
            label="Progress"
            value={`${progressPercent}%`}
          >
            <div className="audit-card-progress-bar">
              <div
                className="audit-card-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </AuditCard>
        </div>

        {/* Audit meta */}
        <div className="audit-session-table-wrap">
          <h3 className="audit-session-section-title">Audit details</h3>
          <div className="audit-session-meta-grid">
            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Conducted by</span>
              <span>{audit?.audited_by_name || "—"}</span>
            </div>
            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Room</span>
              <span>{audit?.room_id || "—"}</span>
            </div>
            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Started</span>
              <span>
                {audit?.created_at ? formatDate(audit.created_at) : "—"}
              </span>
            </div>
            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Completed</span>
              <span>
                {audit?.completed_at ? formatDate(audit.completed_at) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Audit items */}
        <div className="audit-session-table-wrap">
          <h3 className="audit-session-section-title">Audit items</h3>

          {error && (
            <p className="audit-session-error" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <p className="audit-session-empty">Loading audit items…</p>
          ) : !hasItems ? (
            <p className="audit-session-empty">No audit items recorded yet.</p>
          ) : (
            <>
              {/* Desktop table */}
              <table className="audit-session-table">
                <thead>
                  <tr>
                    <th>Asset ID</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Custodian</th>
                    <th>Status</th>
                    <th>Audited at</th>
                  </tr>
                </thead>
                <tbody>
                  {auditItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.asset_id ?? item.id}</td>
                      <td>{item.description || "—"}</td>
                      <td>{item.category || "—"}</td>
                      <td>{item.custodian || "—"}</td>
                      <td>
                        <StatusBadge status={item.audit_status} />
                      </td>
                      <td>
                        {item.audited_at ? formatDate(item.audited_at) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="audit-session-card-list">
                {auditItems.map((item) => (
                  <div key={item.id} className="audit-session-card">
                    <div className="audit-session-card-header">
                      <p className="audit-session-card-title">
                        {item.asset_id ?? item.id}
                      </p>
                      <StatusBadge status={item.audit_status} />
                    </div>
                    <div className="audit-session-card-meta">
                      <div className="audit-session-card-meta-row">
                        <span className="audit-session-card-label">
                          Description
                        </span>
                        <span className="audit-session-card-label-description">{item.description || "—"}</span>
                      </div>
                      <div className="audit-session-card-meta-row">
                        <span className="audit-session-card-label">
                          Category
                        </span>
                        <span>{item.category || "—"}</span>
                      </div>
                      <div className="audit-session-card-meta-row">
                        <span className="audit-session-card-label">
                          Custodian
                        </span>
                        <span>{item.custodian || "—"}</span>
                      </div>
                      <div className="audit-session-card-meta-row">
                        <span className="audit-session-card-label">
                          Audited at
                        </span>
                        <span>
                          {item.audited_at ? formatDate(item.audited_at) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default AuditRoomInfo;
