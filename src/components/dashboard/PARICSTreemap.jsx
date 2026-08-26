// components/dashboard/PARICSTreemap.jsx
import "./PARICSTreemap.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(value);
}

function PARICSTreemap({
  par,
  ics,
  totalCount,
  totalValue,
  loading = false,
  error = null,
}) {
  if (loading) {
    return (
      <div className="paric-card">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paric-card">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="paric-card">
        <p className="paric-card__title">PAR / ICS breakdown</p>
        <p className="paric-card__empty-text">No classified assets yet.</p>
      </div>
    );
  }

  const parShare = totalValue > 0 ? (par.value / totalValue) * 100 : 50;
  const icsShare = totalValue > 0 ? (ics.value / totalValue) * 100 : 50;

  return (
    <div className="paric-card">
      <div className="paric-card__header">
        <p className="paric-card__title">PAR / ICS breakdown</p>
        <span className="paric-card__total">{formatCurrency(totalValue)}</span>
      </div>

      <div className="paric-treemap">
        <div
          className="paric-treemap__block paric-treemap__block--par"
          style={{ flexBasis: `${parShare}%` }}
        >
          <span className="paric-treemap__count">
            {par.count} item{par.count === 1 ? "" : "s"}
          </span>
        </div>

        <div
          className="paric-treemap__block paric-treemap__block--ics"
          style={{ flexBasis: `${icsShare}%` }}
        >
          <span className="paric-treemap__count">
            {ics.count} item{ics.count === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="paric-card__meta">
        <div className="paric-card__meta-values">
          <span className="paric-card__meta-value paric-card__meta-value--par">
            PAR {formatCurrency(par.value)}
          </span>
          <span className="paric-card__meta-value paric-card__meta-value--ics">
            ICS {formatCurrency(ics.value)}
          </span>
        </div>
        <p className="paric-card__footnote">
          {totalCount} classified asset{totalCount === 1 ? "" : "s"} total
        </p>
      </div>
    </div>
  );
}

export default PARICSTreemap;