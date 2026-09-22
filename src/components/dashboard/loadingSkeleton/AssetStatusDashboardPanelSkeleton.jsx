import "../AssetStatusDashboardPanel.css";
import "./DashboardPanelSkeleton.css";

// Mirrors the real STATUS_DESCRIPTIONS keys so the placeholder legend
// has the right number of rows and roughly the right label widths.
const LEGEND_ROWS = [
  { name: 60, desc: 90 },
  { name: 55, desc: 70 },
  { name: 70, desc: 100 },
  { name: 65, desc: 80 },
  { name: 75, desc: 95 },
];

function AssetStatusDashboardPanelSkeleton() {
  return (
    <div
      className="panel asset-status-panel"
      aria-busy="true"
      aria-label="Loading asset status breakdown"
    >
      <div className="asset-status-panel-header">
        <div className="asset-status-panel-title">
          <span className="skel skel-icon" />
          <span className="skel skel-text skel-title" />
        </div>
      </div>

      <div className="skel skel-text" style={{ width: 140, marginTop: 10 }} />

      <div className="asset-status-panel-body">
        <div className="asset-status-panel-donut">
          <span className="skel skel-donut" />
        </div>

        <ul className="asset-status-panel-legend">
          {LEGEND_ROWS.map((row, index) => (
            <li key={index} className="asset-status-panel-legend-item">
              <span className="skel skel-swatch" />
              <span className="asset-status-panel-legend-text">
                <span
                  className="skel skel-text"
                  style={{ width: row.name, height: 11 }}
                />
                <span
                  className="skel skel-text"
                  style={{ width: row.desc, height: 10, marginTop: 4 }}
                />
              </span>
              <span className="skel skel-text" style={{ width: 20 }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AssetStatusDashboardPanelSkeleton;
