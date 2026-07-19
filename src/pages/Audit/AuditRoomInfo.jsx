import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import useRoomInfo from "../../hooks/audit/useRoomInfo";
import AuditCard from "../../components/ui/card/AuditCard";
import { useParams } from "react-router-dom";
import BackButton from "../../components/ui/button/BackButton";
import { formatDate } from "../../utils/date";
import { STATUS_CONFIG } from "../../data/audit";
import Camera from "../../components/camera/Camera";
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
    progressPercent,
    roomName,
    verifyingId,
    verifiedItem,
    hasItems,
    handleVerifyItem,
    handleScan,
    isCameraOpen,
    setIsCameraOpen,
  } = useRoomInfo(auditID);

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
                {loading ? "Loading audit…" : (roomName ?? "Unknown audit")}
              </h1>
              {error && (
                <p className="audit-session-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="audit-camera-scan"
            onClick={() => setIsCameraOpen(true)}
          >
            <FontAwesomeIcon icon="fa-solid fa-camera" />
            Scan Asset
          </button>
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
            value={loading ? "—" : audit.audited_count}
          />

          <AuditCard
            variant="primary"
            label="Discrepancies"
            value={loading ? "—" : audit.discrepancy_count}
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
              <span className="audit-session-card-label">Audit No.</span>
              <span>{audit?.audit_no || "—"}</span>
            </div>

            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Conducted by</span>
              <span>{audit?.audited_by_name || "—"}</span>
            </div>

            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Room</span>
              <span>{roomName ? roomName : "—"}</span>
            </div>

            <div className="audit-session-meta-row">
              <span className="audit-session-card-label">Started</span>
              <span>
                {audit?.created_at ? formatDate(audit.created_at) : "—"}
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
                    <th></th>
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
                      <td>
                        {item.audit_status == "not_audited" && (
                          <button
                            className="audit-session-verify-btn audit-session-verify-btn--full-width"
                            onClick={() =>
                              handleVerifyItem(item.id, item.audit_status)
                            }
                            disabled={verifyingId === item.id}
                            title="Mark as audited"
                          >
                            {verifyingId === item.id ? (
                              <>
                                <FontAwesomeIcon
                                  icon="fa-solid fa-spinner"
                                  spin
                                />
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon="fa-solid fa-check" />
                                Verify
                              </>
                            )}
                          </button>
                        )}
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
                      {item.description && (
                        <div className="audit-session-card-meta-row">
                          <span className="audit-session-card-meta-value">
                            {item.description}
                          </span>
                        </div>
                      )}
                      {item.category && (
                        <div className="audit-session-card-meta-row">
                          <div
                            className="audit-session-card-meta-icon"
                            title="Category"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-tag" />
                          </div>
                          <span className="audit-session-card-meta-value">
                            {item.category}
                          </span>
                        </div>
                      )}
                      {item.custodian && (
                        <div className="audit-session-card-meta-row">
                          <div
                            className="audit-session-card-meta-icon"
                            title="Custodian"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-user" />
                          </div>
                          <span className="audit-session-card-meta-value">
                            {item.custodian}
                          </span>
                        </div>
                      )}
                      {item.audited_at && (
                        <div className="audit-session-card-meta-row">
                          <div
                            className="audit-session-card-meta-icon"
                            title="Audited at"
                          >
                            <FontAwesomeIcon icon="fa-solid fa-calendar-check" />
                          </div>
                          <span className="audit-session-card-meta-value">
                            {formatDate(item.audited_at)}
                          </span>
                        </div>
                      )}
                    </div>
                    {item.audit_status == "not_audited" && (
                      <button
                        className="audit-session-verify-btn audit-session-verify-btn--full-width"
                        onClick={() =>
                          handleVerifyItem(item.id, item.audit_status)
                        }
                        disabled={
                          item.audit_status === "audited" ||
                          verifyingId === item.id
                        }
                        title={
                          item.audit_status === "audited"
                            ? "Already audited"
                            : "Mark as audited"
                        }
                      >
                        {verifyingId === item.id ? (
                          <>
                            <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon="fa-solid fa-check" />
                            Verify
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <Camera
          isOpen={isCameraOpen}
          onScan={handleScan}
          onClose={() => setIsCameraOpen(false)}
        />
      </div>
    </MainLayout>
  );
}

export default AuditRoomInfo;

//verify button in room info todo: add button scan camera
