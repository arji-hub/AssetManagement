import "../AuditDashboardPanel.css";
import "./DashboardPanelSkeleton.css";

// Rough title/meta widths so the placeholder rows don't look uniform.
const ROWS = [
  { title: 110, meta: 150 },
  { title: 90, meta: 130 },
  { title: 125, meta: 140 },
];

function SkeletonRow({ title, meta }) {
  return (
    <li>
      <div className="audit-attention-row">
        <span className="audit-attention-row-text">
          <span
            className="skel skel-text"
            style={{ width: title, height: 13 }}
          />
          <span
            className="skel skel-text"
            style={{ width: meta, height: 10, marginTop: 5 }}
          />
        </span>
        <span className="skel skel-text" style={{ width: 8, height: 10 }} />
      </div>
    </li>
  );
}

function AuditAttentionDashboardPanelSkeleton() {
  return (
    <div
      className="panel audit-panel audit-attention-panel"
      aria-busy="true"
      aria-label="Loading audit items that need attention"
    >
      <div className="audit-panel-header">
        <div className="audit-panel-title">
          <span className="skel skel-icon" />
          <span className="skel skel-text" style={{ width: 110, height: 15 }} />
        </div>
      </div>

      <div className="skel skel-text" style={{ width: 170, marginTop: 10 }} />

      <div className="audit-panel-stat-row">
        <span className="skel skel-total" />
      </div>

      <div className="audit-attention-body">
        <section>
          <h4 className="audit-attention-heading">
            <span className="skel skel-text" style={{ width: 90 }} />
          </h4>
          <ul className="audit-attention-list">
            {ROWS.map((row, index) => (
              <SkeletonRow key={index} {...row} />
            ))}
          </ul>
        </section>
      </div>

      <div className="audit-panel-footer">
        <span className="skel skel-text" style={{ width: 110 }} />
        <span className="skel skel-text" style={{ width: 90 }} />
      </div>
    </div>
  );
}

export default AuditAttentionDashboardPanelSkeleton;
