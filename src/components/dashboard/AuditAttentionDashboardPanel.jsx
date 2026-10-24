import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useAuditSummary } from "../../hooks/dashboard/useAuditSummary";
import AuditAttentionDashboardPanelSkeleton from "./loadingSkeleton/AuditAttentionDashboardPanelSkeleton";
import "./AuditDashboardPanel.css";

const MAX_ROWS = 4;

const roomAuditPath = (roomId) => `/audit/room/${roomId}`;
const auditSessionPath = (roomId, auditId) =>
  `/audit/room/${roomId}/${auditId}`;

function AttentionRow({ to, title, meta, tone }) {
  return (
    <li>
      <Link to={to} className="audit-attention-row">
        <span className="audit-attention-row-text">
          <span className="audit-attention-row-title">{title}</span>
          <span className="audit-attention-row-meta">{meta}</span>
        </span>
        <span className={`audit-attention-row-tag is-${tone}`}>
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

function AuditAttentionDashboardPanel({
  user: userProp,
  mockAudits,
  mockRooms,
}) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  // Range only affects the chart; the attention lists ignore it.
  const { attention, totals, loading, error } = useAuditSummary(
    user,
    "month",
    mockAudits,
    mockRooms,
  );

  if (loading) {
    return <AuditAttentionDashboardPanelSkeleton />;
  }

  const { overdueRooms, staleAudits } = attention;
  const nothingToDo = overdueRooms.length === 0 && staleAudits.length === 0;

  return (
    <div className="panel audit-panel audit-attention-panel">
      <div className="audit-panel-header">
        <div className="audit-panel-title">
          <span className="audit-panel-icon">
            <FontAwesomeIcon icon="fa-solid fa-door-open" />
          </span>
          <span>Needs Attention</span>
        </div>
      </div>

      <div className="audit-panel-subtitle">
        Overdue rooms &amp; stalled audits
      </div>

      <div className="audit-panel-stat-row">
        <span className="audit-panel-total">
          {totals.overdueRooms + staleAudits.length}
        </span>
      </div>

      <div className="audit-attention-body">
        {error ? (
          <div className="audit-panel-empty">Couldn't load audit data.</div>
        ) : nothingToDo ? (
          <div className="audit-panel-empty">
            All rooms are up to date. Nothing to chase.
          </div>
        ) : (
          <>
            {overdueRooms.length > 0 && (
              <section>
                <h4 className="audit-attention-heading">
                  Overdue rooms
                  {totals.neverAudited > 0 && (
                    <span className="audit-attention-heading-note">
                      {totals.neverAudited} never audited
                    </span>
                  )}
                </h4>
                <ul className="audit-attention-list">
                  {overdueRooms.slice(0, MAX_ROWS).map((room) => (
                    <AttentionRow
                      key={room.id}
                      to={roomAuditPath(room.id)}
                      title={room.name ?? room.id}
                      meta={
                        room.daysSince === null
                          ? "Never audited"
                          : `Last audited ${room.daysSince} days ago`
                      }
                      tone={room.daysSince === null ? "danger" : "warning"}
                    />
                  ))}
                </ul>
              </section>
            )}

            {staleAudits.length > 0 && (
              <section>
                <h4 className="audit-attention-heading">Stalled audits</h4>
                <ul className="audit-attention-list">
                  {staleAudits.slice(0, MAX_ROWS).map((audit) => (
                    <AttentionRow
                      key={audit.id}
                      to={auditSessionPath(audit.room_id, audit.id)}
                      title={audit.room_name ?? audit.audit_no ?? audit.id}
                      meta={`Open ${audit.daysOpen} days · ${audit.progress}% done`}
                      tone="warning"
                    />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>

      <div className="audit-panel-footer">
        <span className="audit-panel-footer-meta">
          {overdueRooms.length > MAX_ROWS || staleAudits.length > MAX_ROWS
            ? "Showing top items"
            : `${totals.inProgress} audits in progress`}
        </span>
        <Link to="/audit" className="audit-panel-footer-link">
          Go to audits
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default AuditAttentionDashboardPanel;
