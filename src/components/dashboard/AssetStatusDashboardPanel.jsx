import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAssetStatusSummary } from "../../hooks/dashboard/useAssetStatusSummary";
import { STATUS_COLORS } from "../../data/assets";
import "./AssetStatusDashboardPanel.css";

const CHART_SIZE = 160;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 60;
const STROKE_WIDTH = 20;

const STATUS_DESCRIPTIONS = {
  Working: "In service and usable",
  Missing: "Unaccounted for",
  "For Repair": "Undergoing repair",
  Damaged: "Reported damaged",
  Condemned: "Retired from use",
};

function AssetStatusDashboardPanel({ user: userProp, mockAssets }) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  const { breakdown, totalAssets, loading, error } = useAssetStatusSummary(
    user,
    mockAssets,
  );

  // Each slice is expressed as a percentage of the circle's path length
  // (pathLength=100 on the <circle>, so "percent" doubles as the dash
  // length). offset is the negative running total of prior slices' share,
  // which — combined with the -90deg group rotation below — walks each
  // slice clockwise starting from 12 o'clock.
  const slices = useMemo(() => {
    if (!breakdown.length || totalAssets === 0) return [];

    let cumulativePercent = 0;
    return breakdown.map((entry) => {
      const percent = (entry.count / totalAssets) * 100;
      const slice = { ...entry, percent, offset: -cumulativePercent };
      cumulativePercent += percent;
      return slice;
    });
  }, [breakdown, totalAssets]);

  return (
    <div className="panel asset-status-panel">
      <div className="asset-status-panel-header">
        <div className="asset-status-panel-title">
          <span className="asset-status-panel-icon">
            <FontAwesomeIcon icon="fa-solid fa-chart-pie" />
          </span>
          <span>Asset Status</span>
        </div>
      </div>

      <div className="asset-status-panel-subtitle">
        Current condition breakdown
      </div>

      <div className="asset-status-panel-body">
        {error ? (
          <div className="asset-status-panel-empty">
            Couldn't load asset data.
          </div>
        ) : loading ? (
          <div className="asset-status-panel-empty">Loading…</div>
        ) : totalAssets === 0 ? (
          <div className="asset-status-panel-empty">No assets yet.</div>
        ) : (
          <>
            <div className="asset-status-panel-donut">
              <svg
                viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
                className="asset-status-panel-donut-svg"
              >
                <circle
                  cx={CHART_CENTER}
                  cy={CHART_CENTER}
                  r={CHART_RADIUS}
                  strokeWidth={STROKE_WIDTH}
                  className="asset-status-panel-donut-track"
                />
                <g transform={`rotate(-90 ${CHART_CENTER} ${CHART_CENTER})`}>
                  {slices.map((slice) => (
                    <circle
                      key={slice.status}
                      cx={CHART_CENTER}
                      cy={CHART_CENTER}
                      r={CHART_RADIUS}
                      strokeWidth={STROKE_WIDTH}
                      pathLength={100}
                      strokeDasharray={`${slice.percent} ${100 - slice.percent}`}
                      strokeDashoffset={slice.offset}
                      className="asset-status-panel-donut-slice"
                      style={{ stroke: STATUS_COLORS[slice.status]?.color }}
                    />
                  ))}
                </g>
              </svg>
              <div className="asset-status-panel-donut-center">
                <span className="asset-status-panel-donut-total">
                  {totalAssets}
                </span>
                <span className="asset-status-panel-donut-label">Assets</span>
              </div>
            </div>

            <ul className="asset-status-panel-legend">
              {breakdown.map((entry) => (
                <li
                  key={entry.status}
                  className="asset-status-panel-legend-item"
                >
                  <span
                    className="asset-status-panel-legend-swatch"
                    style={{ background: STATUS_COLORS[entry.status]?.color }}
                  />
                  <span className="asset-status-panel-legend-text">
                    <span className="asset-status-panel-legend-name">
                      {entry.status}
                    </span>
                    <span className="asset-status-panel-legend-desc">
                      {STATUS_DESCRIPTIONS[entry.status] ?? ""}
                    </span>
                  </span>
                  <span className="asset-status-panel-legend-count">
                    {entry.count}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default AssetStatusDashboardPanel;
