import "./AuditProgressCard.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function AuditProgressCard({
  audits,
  loading = false,
  error = null,
  onStartAudit,
  icon,
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="audit-progress-card">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-progress-card">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  const navigateAudit = (audit) => {
    navigate(`/audit/room/${audit.room_id}/${audit.id}`);
  };

  return (
    <div className="audit-progress-card">
      <div className="audit-card__header">
        <p className="audit-card__title">Ongoing audits</p>
        {icon && <span className="audit-card__icon">{icon}</span>}
      </div>

      {audits.length === 0 ? (
        <div className="audit-card__empty-state">
          <span className="audit-card__empty-icon">
            <FontAwesomeIcon icon={["fas", "clipboard-check"]} />
          </span>
          <p className="audit-card__empty-text">No active audits.</p>
          <p className="audit-card__empty-subtext">
            Start a new one to begin tracking room-by-room progress.
          </p>
          <button
            type="button"
            onClick={onStartAudit}
            className="audit-card__button"
          >
            Start new audit
          </button>
        </div>
      ) : (
        <div className="audit-card__list">
          {audits.map((audit) => {
            const percent =
              audit.total_assets > 0
                ? Math.round((audit.audited_count / audit.total_assets) * 100)
                : 0;
            return (
              <div
                key={audit.id}
                className="audit-card__item"
                onClick={() => navigateAudit(audit)}
                style={{ cursor: "pointer" }}
              >
                <div className="audit-card__item-header">
                  <span className="audit-card__item-number">
                    {audit.audit_no}
                  </span>
                  <span className="audit-card__item-badge">{percent}%</span>
                </div>
                <div className="audit-card__progress-bar">
                  <div
                    className="audit-card__progress-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {audit.discrepancy_count > 0 && (
                  <p className="audit-card__discrepancy">
                    {audit.discrepancy_count} discrepancy
                    {audit.discrepancy_count === 1 ? "y" : "ies"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuditProgressCard;
