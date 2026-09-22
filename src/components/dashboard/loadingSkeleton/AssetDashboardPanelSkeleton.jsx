import "../AssetDashboardPanel.css";
import "./DashboardPanelSkeleton.css";

// Rough candlestick-height profile so the placeholder reads as a chart
// rather than a flat gray box. Values are percentages of the chart height.
const BAR_HEIGHTS = [40, 65, 30, 78, 55, 70, 45, 60, 35, 72, 50, 66];

function AssetDashboardPanelSkeleton() {
  return (
    <div
      className="panel asset-panel"
      aria-busy="true"
      aria-label="Loading asset summary"
    >
      <div className="asset-panel-header">
        <div className="asset-panel-title">
          <span className="skel skel-icon" />
          <span className="skel skel-text skel-title" />
        </div>
        <div className="skel skel-toggle" />
      </div>

      <div className="skel skel-text" style={{ width: 150, marginTop: 10 }} />

      <div className="asset-panel-stat-row">
        <span className="skel skel-total" />
        <span className="skel skel-pill" />
      </div>

      <div className="asset-panel-chart">
        <div className="skel-bars">
          {BAR_HEIGHTS.map((height, index) => (
            <span
              key={index}
              className="skel"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      <div className="asset-panel-legend">
        <span className="asset-panel-legend-item">
          <span className="skel skel-swatch" />
          <span className="skel skel-text" style={{ width: 60 }} />
          <span className="skel skel-text" style={{ width: 18 }} />
        </span>
        <span className="asset-panel-legend-item">
          <span className="skel skel-swatch" />
          <span className="skel skel-text" style={{ width: 60 }} />
          <span className="skel skel-text" style={{ width: 18 }} />
        </span>
      </div>

      <div className="asset-panel-footer">
        <span className="skel skel-text" style={{ width: 90 }} />
        <span className="skel skel-text" style={{ width: 90 }} />
      </div>
    </div>
  );
}

export default AssetDashboardPanelSkeleton;
