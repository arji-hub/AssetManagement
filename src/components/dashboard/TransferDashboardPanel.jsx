import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useTransferSummary } from "../../hooks/dashboard/useTransferSummary";
import "./TransferDashboardPanel.css";

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

function TransferDashboardPanel({
  user: userProp,
  mockTransfers,
  defaultRange = "month",
}) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  const [range, setRange] = useState(defaultRange);
  const { series, totals, trend, loading, error } = useTransferSummary(
    user,
    range,
    mockTransfers,
  );

  const {
    pendingPath,
    forApprovalPath,
    maxValue,
    pendingTotal,
    forApprovalTotal,
  } = useMemo(() => {
    const pendingValues = series.map((point) => point.pending);
    const forApprovalValues = series.map((point) => point.forApproval);
    const max = Math.max(4, ...pendingValues, ...forApprovalValues);

    return {
      pendingPath: buildSmoothPath(toPoints(pendingValues, max)),
      forApprovalPath: buildSmoothPath(toPoints(forApprovalValues, max)),
      maxValue: max,
      pendingTotal: pendingValues.reduce((sum, value) => sum + value, 0),
      forApprovalTotal: forApprovalValues.reduce(
        (sum, value) => sum + value,
        0,
      ),
    };
  }, [series]);

  const periodLabel = range === "month" ? "This month" : "This year";
  const firstLabel = series[0]?.label ?? "";
  const lastLabel = series[series.length - 1]?.label ?? "";

  return (
    <div className="panel transfer-panel">
      <div className="transfer-panel-header">
        <div className="transfer-panel-title">
          <span className="transfer-panel-icon">
            <FontAwesomeIcon icon="fa-solid fa-right-left" />
          </span>
          <span>Transfers</span>
        </div>

        <div
          className="transfer-panel-range-toggle"
          role="tablist"
          aria-label="Transfer range"
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

      <div className="transfer-panel-subtitle">
        Pending &amp; for approval ({periodLabel.toLowerCase()})
      </div>

      <div className="transfer-panel-stat-row">
        <span className="transfer-panel-total">
          {loading ? "—" : totals.all}
        </span>
        {!loading && trend.direction !== "flat" && (
          <span className={`transfer-panel-trend is-${trend.direction}`}>
            <i
              className={`fa-solid fa-arrow-${trend.direction === "up" ? "up" : "down"}`}
              aria-hidden="true"
            />
            {Math.abs(trend.deltaPercent)}%
          </span>
        )}
      </div>

      <div className="transfer-panel-chart">
        {error ? (
          <div className="transfer-panel-empty">
            Couldn't load transfer data.
          </div>
        ) : (
          <>
            <div className="transfer-panel-gridlines">
              <span>{maxValue}</span>
              <span>0</span>
            </div>
            <svg
              className="transfer-panel-svg"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1={CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_PADDING_Y}
                className="transfer-panel-guide"
              />
              <line
                x1="0"
                y1={CHART_HEIGHT - CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT - CHART_PADDING_Y}
                className="transfer-panel-guide"
              />
              <path
                d={forApprovalPath}
                className="transfer-panel-line transfer-panel-line-approval"
              />
              <path
                d={pendingPath}
                className="transfer-panel-line transfer-panel-line-pending"
              />
            </svg>
            <div className="transfer-panel-x-labels">
              <span>{firstLabel}</span>
              <span>{lastLabel}</span>
            </div>
          </>
        )}
      </div>

      <div className="transfer-panel-legend">
        <span className="transfer-panel-legend-item">
          <span className="transfer-panel-legend-swatch transfer-panel-legend-swatch-pending" />
          Pending
          <span className="transfer-panel-legend-count">
            {loading ? "—" : pendingTotal}
          </span>
        </span>
        <span className="transfer-panel-legend-item">
          <span className="transfer-panel-legend-swatch transfer-panel-legend-swatch-approval" />
          For Approval
          <span className="transfer-panel-legend-count">
            {loading ? "—" : forApprovalTotal}
          </span>
        </span>
      </div>

      <div className="transfer-panel-footer">
        <span className="transfer-panel-footer-meta">
          {loading ? "Loading…" : `${totals.unresolved} awaiting action`}
        </span>
        <Link to="/transfer" className="transfer-panel-footer-link">
          Review transfers
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default TransferDashboardPanel;
