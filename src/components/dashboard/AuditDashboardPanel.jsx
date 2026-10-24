import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useAuditSummary } from "../../hooks/dashboard/useAuditSummary";
import AuditDashboardPanelSkeleton from "./loadingSkeleton/AuditDashboardPanelSkeleton";
import "./AuditDashboardPanel.css";

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

function AuditDashboardPanel({
  user: userProp,
  mockAudits,
  mockRooms,
  defaultRange = "month",
}) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  const [range, setRange] = useState(defaultRange);
  const { series, totals, trend, loading, error } = useAuditSummary(
    user,
    range,
    mockAudits,
    mockRooms,
  );

  const { completedPath, discrepancyPath, maxValue, discrepancyTotal } =
    useMemo(() => {
      const completedValues = series.map((point) => point.completed);
      const discrepancyValues = series.map((point) => point.discrepancies);
      const max = Math.max(4, ...completedValues, ...discrepancyValues);

      return {
        completedPath: buildSmoothPath(toPoints(completedValues, max)),
        discrepancyPath: buildSmoothPath(toPoints(discrepancyValues, max)),
        maxValue: max,
        discrepancyTotal: discrepancyValues.reduce((sum, v) => sum + v, 0),
      };
    }, [series]);

  const periodLabel = range === "month" ? "this month" : "this year";
  const firstLabel = series[0]?.label ?? "";
  const lastLabel = series[series.length - 1]?.label ?? "";

  if (loading) {
    return <AuditDashboardPanelSkeleton />;
  }

  return (
    <div className="panel audit-panel">
      <div className="audit-panel-header">
        <div className="audit-panel-title">
          <span className="audit-panel-icon">
            <FontAwesomeIcon icon="fa-solid fa-clipboard-check" />
          </span>
          <span>Audits</span>
        </div>

        <div
          className="audit-panel-range-toggle"
          role="tablist"
          aria-label="Audit range"
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

      <div className="audit-panel-subtitle">
        Audits completed &amp; discrepancies ({periodLabel})
      </div>

      <div className="audit-panel-stat-row">
        <span className="audit-panel-total">{totals.completed}</span>
        {trend.direction !== "flat" && (
          <span className={`audit-panel-trend is-${trend.direction}`}>
            <i
              className={`fa-solid fa-arrow-${trend.direction === "up" ? "up" : "down"}`}
              aria-hidden="true"
            />
            {Math.abs(trend.deltaPercent)}%
          </span>
        )}
      </div>

      <div className="audit-panel-chart">
        {error ? (
          <div className="audit-panel-empty">Couldn't load audit data.</div>
        ) : (
          <>
            <div className="audit-panel-gridlines">
              <span>{maxValue}</span>
              <span>0</span>
            </div>
            <svg
              className="audit-panel-svg"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1={CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_PADDING_Y}
                className="audit-panel-guide"
              />
              <line
                x1="0"
                y1={CHART_HEIGHT - CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT - CHART_PADDING_Y}
                className="audit-panel-guide"
              />
              <path
                d={discrepancyPath}
                className="audit-panel-line audit-panel-line-discrepancy"
              />
              <path
                d={completedPath}
                className="audit-panel-line audit-panel-line-completed"
              />
            </svg>
            <div className="audit-panel-x-labels">
              <span>{firstLabel}</span>
              <span>{lastLabel}</span>
            </div>
          </>
        )}
      </div>

      <div className="audit-panel-legend">
        <span className="audit-panel-legend-item">
          <span className="audit-panel-legend-swatch audit-panel-legend-swatch-completed" />
          Completed
          <span className="audit-panel-legend-count">{totals.completed}</span>
        </span>
        <span className="audit-panel-legend-item">
          <span className="audit-panel-legend-swatch audit-panel-legend-swatch-discrepancy" />
          Discrepancies
          <span className="audit-panel-legend-count">{discrepancyTotal}</span>
        </span>
      </div>

      <div className="audit-panel-footer">
        <span className="audit-panel-footer-meta">
          {totals.inProgress} in progress
        </span>
        <Link to="/audit" className="audit-panel-footer-link">
          Review audits
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default AuditDashboardPanel;
