import "./StatCard.css";

function StatCard({
  title,
  value = 0,
  description = null,
  loading = false,
  error = null,
  variant = "default",
}) {
  const isAlert = variant === "alert";

  return (
    <div
      className={`stat-card ${isAlert ? "stat-card--alert" : "stat-card--default"}`}
    >
      <p className="stat-card__title">{title}</p>
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
        <p className="stat-card__description">{description}</p>
      )}
    </div>
  );
}

export default StatCard;
