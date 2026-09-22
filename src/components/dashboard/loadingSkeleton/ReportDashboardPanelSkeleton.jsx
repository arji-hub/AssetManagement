import "../ReportDashboardPanel.css";
import "./DashboardPanelSkeleton.css";

function ReportDashboardPanelSkeleton() {
  return (
    <div
      className="panel report-panel"
      aria-busy="true"
      aria-label="Loading report summary"
    >
      <div className="report-panel-header">
        <div className="report-panel-title">
          <span className="skel skel-icon" />
          <span className="skel skel-text skel-title" />
        </div>
        <div className="skel skel-toggle" />
      </div>

      <div className="skel skel-text" style={{ width: 160, marginTop: 10 }} />

      <div className="report-panel-stat-row">
        <span className="skel skel-total" />
        <span className="skel skel-pill" />
      </div>

      <div className="report-panel-chart">
        <span className="skel skel-chart-block" />
      </div>

      <div className="report-panel-legend">
        <span className="report-panel-legend-item">
          <span className="skel skel-swatch" />
          <span className="skel skel-text" style={{ width: 60 }} />
          <span className="skel skel-text" style={{ width: 18 }} />
        </span>
        <span className="report-panel-legend-item">
          <span className="skel skel-swatch" />
          <span className="skel skel-text" style={{ width: 55 }} />
          <span className="skel skel-text" style={{ width: 18 }} />
        </span>
      </div>

      <div className="report-panel-footer">
        <span className="skel skel-text" style={{ width: 100 }} />
        <span className="skel skel-text" style={{ width: 100 }} />
      </div>
    </div>
  );
}

export default ReportDashboardPanelSkeleton;
