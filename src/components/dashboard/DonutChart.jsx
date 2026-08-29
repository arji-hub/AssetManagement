import "./DonutChart.css";
import { STATUS_COLORS } from "../../data/assets";

function DonutChart({
  statusBreakdown,
  loading = false,
  error = null,
  title,
  icon,
}) {
  if (loading) {
    return (
      <div className="donut-chart">
        <div className="donut-chart__spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donut-chart">
        <div className="donut-chart__error">Error: {error.message}</div>
      </div>
    );
  }

  const entries = Object.entries(statusBreakdown);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="donut-chart">
        <div className="donut-chart__header">
          <h3 className="donut-chart__title">{title}</h3>
          {icon && <span className="donut-chart__icon">{icon}</span>}
        </div>
        <div className="donut-chart__empty">
          <p className="donut-chart__empty-text">No assets to show yet.</p>
        </div>
      </div>
    );
  }

  let cumulativePercent = 0;
  const segments = entries.map(([status, count]) => {
    const percent = (count / total) * 100;
    const dashoffset = -cumulativePercent;
    cumulativePercent += percent;
    return {
      status,
      count,
      percent,
      dashoffset,
      color:
        status === "Working"
          ? "var(--maroon-700)"
          : STATUS_COLORS[status]?.bg || STATUS_COLORS.Undefined.bg,
    };
  });

  return (
    <div className="donut-chart">
      <div className="donut-chart__header">
        <h3 className="donut-chart__title">{title}</h3>
        {icon && <span className="donut-chart__icon">{icon}</span>}
      </div>
      <div className="donut-chart__body">
        {/* Chart Section */}
        <div className="donut-chart__chart-wrapper">
          <div className="donut-chart__chart">
            <svg viewBox="0 0 36 36" className="donut-chart__svg">
              {/* Background track */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                className="donut-chart__track"
                strokeWidth="3.5"
              />
              {/* Animated segments */}
              {segments.map((seg) => (
                <circle
                  key={seg.status}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="3.5"
                  strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
                  strokeDashoffset={seg.dashoffset}
                  className="donut-chart__segment"
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            {/* Center content */}
            <div className="donut-chart__center">
              <div className="donut-chart__total">{total}</div>
              <div className="donut-chart__label">Items</div>
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="donut-chart__legend">
          {segments.map((seg) => (
            <div key={seg.status} className="donut-chart__legend-item">
              <div className="donut-chart__legend-header">
                <span
                  className="donut-chart__legend-dot"
                  style={{ backgroundColor: seg.color }}
                  aria-label={`${seg.status} color indicator`}
                />
                <span className="donut-chart__legend-status">{seg.status}</span>
              </div>
              <div className="donut-chart__legend-percent">
                {Math.round(seg.percent)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonutChart;
