import "./AuditProgressCard.css";

function AuditProgressCard({
  audits,
  loading = false,
  error = null,
  onStartAudit,
}) {
  if (loading) {
    return (
      <div className="audit-card">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-card">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="audit-card">
      <p className="audit-card__title">Ongoing audits</p>

      {audits.length === 0 ? (
        <div>
          <p className="audit-card__empty-text">No active audits.</p>
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
              <div key={audit.id} className="audit-card__item">
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
                    {audit.discrepancy_count} discrepanc
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
