import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useReportSummary } from "../../hooks/dashboard/useReportSummary";
import "./ReportDashboardPanel.css";

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const CHART_PADDING_Y = 12;

function buildSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}

function toPoints(values, maxValue) {
  const usableHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const step = values.length > 1 ? CHART_WIDTH / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: index * step,
    y:
      CHART_PADDING_Y +
      usableHeight -
      (maxValue === 0 ? 0 : (value / maxValue) * usableHeight),
  }));
}

function ReportDashboardPanel({
  user: userProp,
  mockReports,
  defaultRange = "month",
}) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  const [range, setRange] = useState(defaultRange);
  const { series, totals, trend, loading, error } = useReportSummary(
    user,
    range,
    mockReports,
  );

  const { damagedPath, missingPath, maxValue, damagedTotal, missingTotal } =
    useMemo(() => {
      const damagedValues = series.map((point) => point.damaged);
      const missingValues = series.map((point) => point.missing);
      const max = Math.max(4, ...damagedValues, ...missingValues);

      return {
        damagedPath: buildSmoothPath(toPoints(damagedValues, max)),
        missingPath: buildSmoothPath(toPoints(missingValues, max)),
        maxValue: max,
        damagedTotal: damagedValues.reduce((sum, value) => sum + value, 0),
        missingTotal: missingValues.reduce((sum, value) => sum + value, 0),
      };
    }, [series]);

  const periodLabel = range === "month" ? "This month" : "This year";
  const firstLabel = series[0]?.label ?? "";
  const lastLabel = series[series.length - 1]?.label ?? "";

  return (
    <div className="panel report-panel">
      <div className="report-panel-header">
        <div className="report-panel-title">
          <span className="report-panel-icon">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
          </span>
          <span>Reports</span>
        </div>

        <div
          className="report-panel-range-toggle"
          role="tablist"
          aria-label="Report range"
        >
          <button
            type="button"
            role="tab"
            aria-selected={range === "month"}
            className={range === "month" ? "is-active" : ""}
            onClick={() => setRange("month")}
          >
            Month
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={range === "year"}
            className={range === "year" ? "is-active" : ""}
            onClick={() => setRange("year")}
          >
            Year
          </button>
        </div>
      </div>

      <div className="report-panel-subtitle">
        Damaged &amp; missing ({periodLabel.toLowerCase()})
      </div>

      <div className="report-panel-stat-row">
        <span className="report-panel-total">{loading ? "—" : totals.all}</span>
        {!loading && trend.direction !== "flat" && (
          <span className={`report-panel-trend is-${trend.direction}`}>
            <i
              className={`fa-solid fa-arrow-${trend.direction === "up" ? "up" : "down"}`}
              aria-hidden="true"
            />
            {Math.abs(trend.deltaPercent)}%
          </span>
        )}
      </div>

      <div className="report-panel-chart">
        {error ? (
          <div className="report-panel-empty">Couldn't load report data.</div>
        ) : (
          <>
            <div className="report-panel-gridlines">
              <span>{maxValue}</span>
              <span>0</span>
            </div>
            <svg
              className="report-panel-svg"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1={CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_PADDING_Y}
                className="report-panel-guide"
              />
              <line
                x1="0"
                y1={CHART_HEIGHT - CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT - CHART_PADDING_Y}
                className="report-panel-guide"
              />
              <path
                d={missingPath}
                className="report-panel-line report-panel-line-missing"
              />
              <path
                d={damagedPath}
                className="report-panel-line report-panel-line-damaged"
              />
            </svg>
            <div className="report-panel-x-labels">
              <span>{firstLabel}</span>
              <span>{lastLabel}</span>
            </div>
          </>
        )}
      </div>

      <div className="report-panel-legend">
        <span className="report-panel-legend-item">
          <span className="report-panel-legend-swatch report-panel-legend-swatch-damaged" />
          Damaged
          <span className="report-panel-legend-count">
            {loading ? "—" : damagedTotal}
          </span>
        </span>
        <span className="report-panel-legend-item">
          <span className="report-panel-legend-swatch report-panel-legend-swatch-missing" />
          Missing
          <span className="report-panel-legend-count">
            {loading ? "—" : missingTotal}
          </span>
        </span>
      </div>

      <div className="report-panel-footer">
        <span className="report-panel-footer-meta">
          {loading ? "Loading…" : `${totals.unresolved} unresolved`}
        </span>
        <Link to="/report" className="report-panel-footer-link">
          Review reports
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default ReportDashboardPanel;
