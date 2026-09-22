import "../TransferDashboardPanel.css";
import "./DashboardPanelSkeleton.css";

// The real panel's legend differs by role: admins see two series
// (Requests / Assets), custodians see one (Net change). Since role
// often isn't known until the user is loaded, default to the admin
// (two-item) shape and let callers pass `isAdmin={false}` once they
// know better, if they want the tighter custodian layout up front.
function TransferDashboardPanelSkeleton({ isAdmin = true }) {
  return (
    <div
      className="panel transfer-panel"
      aria-busy="true"
      aria-label="Loading transfer summary"
    >
      <div className="transfer-panel-header">
        <div className="transfer-panel-title">
          <span className="skel skel-icon" />
          <span className="skel skel-text skel-title" />
        </div>
        <div className="skel skel-toggle" />
      </div>

      <div className="skel skel-text" style={{ width: 170, marginTop: 10 }} />

      <div className="transfer-panel-stat-row">
        <span className="skel skel-total" />
        <span className="skel skel-pill" />
      </div>

      <div className="transfer-panel-chart">
        <span className="skel skel-chart-block" />
      </div>

      <div className="transfer-panel-legend">
        {isAdmin ? (
          <>
            <span className="transfer-panel-legend-item">
              <span className="skel skel-swatch" />
              <span className="skel skel-text" style={{ width: 55 }} />
              <span className="skel skel-text" style={{ width: 18 }} />
            </span>
            <span className="transfer-panel-legend-item">
              <span className="skel skel-swatch" />
              <span className="skel skel-text" style={{ width: 45 }} />
              <span className="skel skel-text" style={{ width: 18 }} />
            </span>
          </>
        ) : (
          <span className="transfer-panel-legend-item">
            <span className="skel skel-swatch" />
            <span className="skel skel-text" style={{ width: 70 }} />
            <span className="skel skel-text" style={{ width: 24 }} />
          </span>
        )}
      </div>

      <div className="transfer-panel-footer">
        <span className="skel skel-text" style={{ width: 110 }} />
        <span className="skel skel-text" style={{ width: 100 }} />
      </div>
    </div>
  );
}

export default TransferDashboardPanelSkeleton;
