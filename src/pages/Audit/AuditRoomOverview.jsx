import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import useRoomOverview from "../../hooks/audit/useRoomOverview";
import AuditCard from "../../components/ui/card/AuditCard";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import BackButton from "../../components/ui/button/BackButton";
import "./AuditRoomOverview.css";

function statusBadgeClass(status) {
  if (status === "completed") return "audit-history-badge--completed";
  if (status === "in_progress") return "audit-history-badge--progress";
  return "audit-history-badge--neutral";
}

function AuditRoomOverview() {
  const navigate = useNavigate();
  const { roomID } = useParams();

  const {
    room,
    roomLoading,
    roomError,
    assets,
    assetsLoading,
    assetsError,
    totalAssets,
    topCustodian,
    previousAudits,
    auditsLoading,
    auditsError,
    lastAuditedAt,
  } = useRoomOverview(roomID);

  return (
    <MainLayout>
      <div className="audit-session-page">
        {/* Header */}
        <div className="audit-session-header">
          <div className="audit-session-header-left">
            <BackButton className="audit-session-back-btn" />

            <div className="audit-session-title-group">
              <p className="audit-session-eyebrow">Room overview</p>
              <h1 className="audit-session-room-name">
                {roomLoading ? "Loading room…" : (room?.name ?? "Unknown room")}
              </h1>
              {roomError && (
                <p className="audit-session-error" role="alert">
                  {roomError}
                </p>
              )}
            </div>
          </div>

          <button type="button" className="audit-session-scan-btn">
            Create new audit
          </button>
        </div>

        {/* Stats */}
        <div className="audit-session-stats">
          <AuditCard
            variant="primary"
            icon="fa-solid fa-boxes-stacked"
            label="Total assets"
            value={assetsLoading ? "—" : totalAssets}
            hint="Registered to this room"
          />

          <AuditCard
            variant="secondary"
            icon="fa-solid fa-user-shield"
            label="Room custodian"
            value={
              assetsLoading
                ? "—"
                : topCustodian
                  ? topCustodian.name
                  : "Unassigned"
            }
            hint={
              !assetsLoading && topCustodian
                ? `Holds ${topCustodian.count} of ${totalAssets} assets`
                : null
            }
          />

          <AuditCard
            variant="neutral"
            icon="fa-solid fa-calendar-check"
            label="Last audited"
            value={
              auditsLoading
                ? "—"
                : lastAuditedAt
                  ? formatDate(lastAuditedAt)
                  : "Never"
            }
            hint={
              !auditsLoading && previousAudits.length > 0
                ? `${previousAudits.length} audit${previousAudits.length === 1 ? "" : "s"} conducted`
                : null
            }
          />
        </div>

        {/* Asset list */}
        <div className="audit-session-table-wrap">
          <h3 className="audit-session-section-title">Assets in this room</h3>

          {assetsError && (
            <p className="audit-session-error" role="alert">
              {assetsError}
            </p>
          )}

          {assetsLoading ? (
            <p className="audit-session-empty">Loading assets…</p>
          ) : assets.length === 0 ? (
            <p className="audit-session-empty">No assets found in this room.</p>
          ) : (
            <div className="audit-session-scroll-area">
              {/* Desktop table */}
              <table className="audit-session-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Custodian</th>
                    <th>Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => navigate(`/asset/info/${asset.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{asset.description || "—"}</td>
                      <td>{asset.category || "—"}</td>
                      <td>{asset.custodian_name || asset.name || "—"}</td>
                      <td>
                        <Status status={asset.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="audit-card-list">
                {assets.map((asset) => (
                  <div
                    className="audit-card-row"
                    key={asset.id}
                    onClick={() => navigate(`/asset/info/${asset.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <p className="audit-card-row-title">
                      {asset.description || "—"}
                    </p>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">Category</span>
                      <span>{asset.category || "—"}</span>
                    </div>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">Custodian</span>
                      <span>{asset.custodian_name || asset.name || "—"}</span>
                    </div>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">Condition</span>
                      <Status status={asset.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Previous audits */}
        <div className="audit-session-table-wrap">
          <h3 className="audit-session-section-title">Previous audits</h3>

          {auditsError && (
            <p className="audit-session-error" role="alert">
              {auditsError}
            </p>
          )}

          {auditsLoading ? (
            <p className="audit-session-empty">Loading audit history…</p>
          ) : previousAudits.length === 0 ? (
            <p className="audit-session-empty">No audits conducted yet.</p>
          ) : (
            <div className="audit-session-scroll-area">
              {/* Desktop table */}
              <table className="audit-session-table">
                <thead>
                  <tr>
                    <th>Audit No.</th>
                    <th>Conducted by</th>
                    <th>Date</th>
                    <th>Audited</th>
                    <th>Discrepancies</th>
                  </tr>
                </thead>
                <tbody>
                  {previousAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      onClick={() =>
                        navigate(`/audit/room/${roomID}/${audit.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <td className="audit-history-audit-no">
                        {audit.audit_no}
                      </td>
                      <td>{audit.audited_by_name || "—"}</td>
                      <td className="audit-history-muted">
                        {formatDate(audit.completed_at ?? audit.created_at)}
                      </td>
                      <td>
                        {audit.audited_count}/{audit.total_assets}
                      </td>
                      <td
                        className={
                          audit.discrepancy_count > 0
                            ? "audit-history-discrepancy"
                            : ""
                        }
                      >
                        {audit.discrepancy_count ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile card list */}
              <div className="audit-card-list">
                {previousAudits.map((audit) => (
                  <div className="audit-card-row" key={audit.id}>
                    <p className="audit-card-row-title audit-history-audit-no">
                      {audit.audit_no}
                    </p>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">Conducted by</span>
                      <span>{audit.audited_by_name || "—"}</span>
                    </div>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">Date</span>
                      <span className="audit-history-muted">
                        {formatDate(audit.completed_at ?? audit.created_at)}
                      </span>
                    </div>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">Audited</span>
                      <span>
                        {audit.audited_count}/{audit.total_assets}
                      </span>
                    </div>
                    <div className="audit-card-row-meta">
                      <span className="audit-card-row-label">
                        Discrepancies
                      </span>
                      <span
                        className={
                          audit.discrepancy_count > 0
                            ? "audit-history-discrepancy"
                            : ""
                        }
                      >
                        {audit.discrepancy_count ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default AuditRoomOverview;
