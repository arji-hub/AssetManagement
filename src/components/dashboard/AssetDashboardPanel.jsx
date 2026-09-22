import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useAssetSummary } from "../../hooks/dashboard/useAssetSummary";
import AssetDashboardPanelSkeleton from "./loadingSkeleton/AssetDashboardPanelSkeleton";
import "./AssetDashboardPanel.css";

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const CHART_PADDING_Y = 12;
const CANDLE_MIN_BODY_HEIGHT = 1.5;

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

function formatSigned(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

/**
 * Chains buckets into a running OHLC series, the way a real stock chart
 * works: each candle's open is wherever the previous one closed, so the
 * whole series drifts up and down over time instead of each bar judging
 * itself against zero in isolation.
 *   open  = running total carried in from the previous bucket
 *   close = open + net (primary - secondary) for this bucket
 *   high  = open + primary  (the peak if all gains landed before losses)
 *   low   = open - secondary (the trough if all losses landed first)
 * high/low naturally bound open and close since primary/secondary >= 0.
 * The running total starts at 0 — this chart shows the *trend* of net
 * change across the period, not an absolute inventory count.
 */
function buildOHLC(series, primaryKey, secondaryKey) {
  let cumulative = 0;

  return series.map((point, index) => {
    const primary = point[primaryKey] ?? 0;
    const secondary = point[secondaryKey] ?? 0;
    const open = cumulative;
    const high = open + primary;
    const low = open - secondary;
    const close = open + primary - secondary;
    cumulative = close;

    return {
      key: point.key ?? index,
      open,
      high,
      low,
      close,
      primary,
      secondary,
      isUp: close >= open,
    };
  });
}

function valueToY(value, dataMin, dataMax) {
  const usableHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const range = dataMax - dataMin || 1;
  return CHART_PADDING_Y + ((dataMax - value) / range) * usableHeight;
}

/** Lays out pixel positions for each OHLC candle against a shared scale. */
function layoutCandles(ohlc, dataMin, dataMax) {
  const n = ohlc.length;
  if (n === 0) return [];

  const colWidth = CHART_WIDTH / n;
  const bodyWidth = Math.max(2, Math.min(14, colWidth * 0.55));

  return ohlc.map((candle, index) => {
    const x = (index + 0.5) * colWidth;

    let bodyTopY = valueToY(
      Math.max(candle.open, candle.close),
      dataMin,
      dataMax,
    );
    let bodyBottomY = valueToY(
      Math.min(candle.open, candle.close),
      dataMin,
      dataMax,
    );

    if (bodyBottomY - bodyTopY < CANDLE_MIN_BODY_HEIGHT) {
      const mid = (bodyTopY + bodyBottomY) / 2;
      bodyTopY = mid - CANDLE_MIN_BODY_HEIGHT / 2;
      bodyBottomY = mid + CANDLE_MIN_BODY_HEIGHT / 2;
    }

    return {
      key: candle.key,
      x,
      bodyWidth,
      wickTopY: valueToY(candle.high, dataMin, dataMax),
      wickBottomY: valueToY(candle.low, dataMin, dataMax),
      bodyTopY,
      bodyBottomY,
      isUp: candle.isUp,
    };
  });
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

  const { candles, dataMin, dataMax, zeroY, primaryTotal, secondaryTotal } =
    useMemo(() => {
      const primaryValues = series.map(
        (point) => point[config.primaryKey] ?? 0,
      );
      const secondaryValues = series.map(
        (point) => point[config.secondaryKey] ?? 0,
      );

      const ohlc = buildOHLC(series, config.primaryKey, config.secondaryKey);

      let min = Math.min(0, ...ohlc.map((c) => c.low));
      let max = Math.max(0, ...ohlc.map((c) => c.high));
      // Pad a near-flat series (e.g. all zeros) so it doesn't collapse to
      // an unreadable sliver.
      if (max - min < 4) {
        const mid = (max + min) / 2;
        min = mid - 2;
        max = mid + 2;
      }

      return {
        candles: layoutCandles(ohlc, min, max),
        dataMin: min,
        dataMax: max,
        zeroY: valueToY(0, min, max),
        primaryTotal: primaryValues.reduce((sum, value) => sum + value, 0),
        secondaryTotal: secondaryValues.reduce((sum, value) => sum + value, 0),
      };
    }, [series, config.primaryKey, config.secondaryKey]);

  if (loading) {
    return <AssetDashboardPanelSkeleton />;
  }

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
              <span>{formatSigned(Math.round(dataMax))}</span>
              <span>{formatSigned(Math.round(dataMin))}</span>
            </div>
            <svg
              className="asset-panel-svg"
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1={zeroY}
                x2={CHART_WIDTH}
                y2={zeroY}
                className="asset-panel-guide asset-panel-guide-zero"
              />
              {candles.map((candle) => (
                <g key={candle.key}>
                  <line
                    x1={candle.x}
                    y1={candle.wickTopY}
                    x2={candle.x}
                    y2={candle.wickBottomY}
                    className={`asset-candle-wick ${candle.isUp ? "is-up" : "is-down"}`}
                  />
                  <rect
                    x={candle.x - candle.bodyWidth / 2}
                    y={candle.bodyTopY}
                    width={candle.bodyWidth}
                    height={candle.bodyBottomY - candle.bodyTopY}
                    rx="1"
                    className={`asset-candle-body ${candle.isUp ? "is-up" : "is-down"}`}
                  />
                </g>
              ))}
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
