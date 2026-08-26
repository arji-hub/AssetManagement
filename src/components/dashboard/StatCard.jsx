import "./StatCard.css";

function StatCard({
  title,
  value = 0,
  description = null,
  loading = false,
  error = null,
  icon,
}) {
  return (
    <div className="stat-card stat-card--default">
      <div className="stat-card__header">
        <p className="stat-card__title">{title}</p>
        {icon && <span className="stat-card__icon">{icon}</span>}
      </div>

      <p className="stat-card__value">
        {loading ? (
          <span className="stat-card__loading">Loading...</span>
        ) : error ? (
          <span className="stat-card__error">Error</span>
        ) : (
          value
        )}
      </p>

      {!loading && !error && description && (
        <>
          <hr className="stat-card__divider" />
          <p className="stat-card__description">{description}</p>
        </>
      )}
    </div>
  );
}

export default StatCard;
