import "./DonutChart.css";
import { STATUS_COLORS, getStatusBgColor } from "../../data/assets";

function DonutChart({ statusBreakdown, loading = false, error = null, title }) {
  if (loading) {
    return (
      <div className="donut-chart">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donut-chart">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  const entries = Object.entries(statusBreakdown);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="donut-chart">
        <p className="donut-chart__title">{title}</p>
        <p className="donut-chart__empty-text">No assets to show yet.</p>
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
      color: getStatusBgColor(status),
    };
  });

  return (
    <div className="donut-chart">
      <p className="donut-chart__title">{title}</p>
      <div className="donut-chart__chart">
        <svg viewBox="0 0 36 36" className="donut-chart__svg">
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="transparent"
            className="donut-chart__track"
            strokeWidth="4"
          />
          {segments.map((seg) => (
            <circle
              key={seg.status}
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={seg.color}
              strokeWidth="4"
              strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
              strokeDashoffset={seg.dashoffset}
              className="donut-chart__segment"
            />
          ))}
        </svg>
        <div className="donut-chart__center">
          <span className="donut-chart__total">{total}</span>
          <span className="donut-chart__label">Items</span>
        </div>
      </div>
      <div className="donut-chart__legend">
        {segments.map((seg) => (
          <div key={seg.status} className="donut-chart__legend-item">
            <span className="donut-chart__legend-status">
              <span
                className="donut-chart__legend-dot"
                style={{ backgroundColor: seg.color }}
              />
              {seg.status}
            </span>
            <span className="donut-chart__legend-percent">
              {Math.round(seg.percent)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonutChart;
