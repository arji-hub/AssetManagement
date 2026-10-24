import "../ReportReminderPanel.css";
import "./DashboardPanelSkeleton.css";

// Reuses the real notice's classes so height, padding and the responsive
// container breakpoints match exactly.
function ReportReminderPanelSkeleton() {
  return (
    <section
      className="report-reminder"
      aria-busy="true"
      aria-label="Loading missing and damaged asset reminder"
    >
      <div className="report-reminder-main">
        <div className="report-reminder-summary">
          <span
            className="skel"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: "var(--radius-sm)",
            }}
          />
          <div className="report-reminder-text">
            <span
              className="skel skel-text"
              style={{ width: 90, height: 10 }}
            />
            <span
              className="skel skel-text"
              style={{
                display: "block",
                width: 280,
                maxWidth: "100%",
                height: 16,
                marginTop: 4,
              }}
            />
            <span
              className="skel skel-text"
              style={{
                display: "block",
                width: 360,
                maxWidth: "100%",
                height: 12,
                marginTop: 6,
              }}
            />
          </div>
        </div>

        <div className="report-reminder-metrics">
          {[0, 1].map((key) => (
            <div key={key} className="report-reminder-metric">
              <span
                className="skel skel-text"
                style={{ width: 52, height: 10 }}
              />
              <span className="skel" style={{ width: 28, height: 24 }} />
            </div>
          ))}
        </div>

        <div className="report-reminder-actions">
          <span
            className="skel report-reminder-btn"
            style={{ width: 110, border: "none" }}
          />
          <span
            className="skel report-reminder-btn"
            style={{ width: 110, border: "none" }}
          />
        </div>
      </div>
    </section>
  );
}

export default ReportReminderPanelSkeleton;
