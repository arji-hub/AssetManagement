import "../AuditDashboardPanel.css";
import "./DashboardPanelSkeleton.css";

function AuditDashboardPanelSkeleton() {
  return (
    <div
      className="panel audit-panel"
      aria-busy="true"
      aria-label="Loading audit summary"
    >
      <div className="audit-panel-header">
        <div className="audit-panel-title">
          <span className="skel skel-icon" />
          <span className="skel skel-text skel-title" />
        </div>
        <div className="skel skel-toggle" />
      </div>

      <div className="skel skel-text" style={{ width: 190, marginTop: 10 }} />

      <div className="audit-panel-stat-row">
        <span className="skel skel-total" />
        <span className="skel skel-pill" />
      </div>

      <div className="audit-panel-chart">
        <span className="skel skel-chart-block" />
      </div>

      <div className="audit-panel-legend">
        <span className="audit-panel-legend-item">
          <span className="skel skel-swatch" />
          <span className="skel skel-text" style={{ width: 70 }} />
          <span className="skel skel-text" style={{ width: 18 }} />
        </span>
        <span className="audit-panel-legend-item">
          <span className="skel skel-swatch" />
          <span className="skel skel-text" style={{ width: 85 }} />
          <span className="skel skel-text" style={{ width: 18 }} />
        </span>
      </div>

      <div className="audit-panel-footer">
        <span className="skel skel-text" style={{ width: 90 }} />
        <span className="skel skel-text" style={{ width: 100 }} />
      </div>
    </div>
  );
}

export default AuditDashboardPanelSkeleton;
