import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useAssetSummary } from "../../hooks/dashboard/useAssetSummary";
import "./AssetDashboardPanel.css";

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const CHART_PADDING_Y = 12;

const MODE_CONFIG = {
  acquisition: {
    subtitle: "Acquired vs condemned",
    primaryKey: "acquired",
    secondaryKey: "condemned",
    primaryLabel: "Acquired",
    secondaryLabel: "Condemned",
    footerLinkLabel: "Review assets",
  },
  assignment: {
    subtitle: "Assigned vs removed",
    primaryKey: "assigned",
    secondaryKey: "removed",
    primaryLabel: "Assigned",
    secondaryLabel: "Removed",
    footerLinkLabel: "View my assets",
  },
};

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

function AssetDashboardPanel({
  user: userProp,
  mockAssets,
  defaultRange = "month",
}) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  const [range, setRange] = useState(defaultRange);
  const { totalAssets, mode, series, totals, trend, loading, error } =
    useAssetSummary(user, range, mockAssets);

  const config = MODE_CONFIG[mode] ?? MODE_CONFIG.acquisition;

  const { primaryPath, secondaryPath, maxValue, primaryTotal, secondaryTotal } =
    useMemo(() => {
      const primaryValues = series.map(
        (point) => point[config.primaryKey] ?? 0,
      );
      const secondaryValues = series.map(
        (point) => point[config.secondaryKey] ?? 0,
      );
      const max = Math.max(4, ...primaryValues, ...secondaryValues);

      return {
        primaryPath: buildSmoothPath(toPoints(primaryValues, max)),
        secondaryPath: buildSmoothPath(toPoints(secondaryValues, max)),
        maxValue: max,
        primaryTotal: primaryValues.reduce((sum, value) => sum + value, 0),
        secondaryTotal: secondaryValues.reduce((sum, value) => sum + value, 0),
      };
    }, [series, config.primaryKey, config.secondaryKey]);

  const periodLabel = range === "month" ? "this month" : "this year";
  const firstLabel = series[0]?.label ?? "";
  const lastLabel = series[series.length - 1]?.label ?? "";

  return (
    <div className="panel asset-panel">
      <div className="asset-panel-header">
        <div className="asset-panel-title">
          <span className="asset-panel-icon">
            <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
          </span>
          <span>Assets</span>
        </div>

        <div
          className="asset-panel-range-toggle"
          role="tablist"
          aria-label="Asset range"
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

      <div className="asset-panel-subtitle">
        {config.subtitle} ({periodLabel})
      </div>

      <div className="asset-panel-stat-row">
        <span className="asset-panel-total">{loading ? "—" : totals.all}</span>
        {!loading && trend.direction !== "flat" && (
          <span className={`asset-panel-trend is-${trend.direction}`}>
            <i
              className={`fa-solid fa-arrow-${trend.direction === "up" ? "up" : "down"}`}
              aria-hidden="true"
            />
            {Math.abs(trend.deltaPercent)}%
          </span>
        )}
      </div>

      <div className="asset-panel-chart">
        {error ? (
          <div className="asset-panel-empty">Couldn't load asset data.</div>
        ) : (
          <>
            <div className="asset-panel-gridlines">
              <span>{maxValue}</span>
              <span>0</span>
            </div>
            <svg
              className="asset-panel-svg"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1={CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_PADDING_Y}
                className="asset-panel-guide"
              />
              <line
                x1="0"
                y1={CHART_HEIGHT - CHART_PADDING_Y}
                x2={CHART_WIDTH}
                y2={CHART_HEIGHT - CHART_PADDING_Y}
                className="asset-panel-guide"
              />
              <path
                d={secondaryPath}
                className="asset-panel-line asset-panel-line-secondary"
              />
              <path
                d={primaryPath}
                className="asset-panel-line asset-panel-line-primary"
              />
            </svg>
            <div className="asset-panel-x-labels">
              <span>{firstLabel}</span>
              <span>{lastLabel}</span>
            </div>
          </>
        )}
      </div>

      <div className="asset-panel-legend">
        <span className="asset-panel-legend-item">
          <span className="asset-panel-legend-swatch asset-panel-legend-swatch-primary" />
          {config.primaryLabel}
          <span className="asset-panel-legend-count">
            {loading ? "—" : primaryTotal}
          </span>
        </span>
        <span className="asset-panel-legend-item">
          <span className="asset-panel-legend-swatch asset-panel-legend-swatch-secondary" />
          {config.secondaryLabel}
          <span className="asset-panel-legend-count">
            {loading ? "—" : secondaryTotal}
          </span>
        </span>
      </div>

      <div className="asset-panel-footer">
        <span className="asset-panel-footer-meta">
          {loading ? "Loading…" : `${totalAssets} total assets`}
        </span>
        <Link to="/asset" className="asset-panel-footer-link">
          {config.footerLinkLabel}
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default AssetDashboardPanel;
