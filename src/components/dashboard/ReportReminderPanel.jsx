import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import { useReportReminder } from "../../hooks/dashboard/useReportReminder";
import { REPORT_STATUS } from "../../data/reports";
import ReportReminderPanelSkeleton from "./loadingSkeleton/ReportReminderPanelSkeleton";
import "./ReportReminderPanel.css";

const MAX_ROWS = 5;

const TYPE_LABEL = {
  [REPORT_STATUS.MISSING]: "Missing",
  [REPORT_STATUS.DAMAGED]: "Damaged",
};

function formatAge(days) {
  if (days === null || days === undefined) return "—";
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

/**
 * Summary notice at the very top of the dashboard. Shows a skeleton while
 * loading and renders nothing on error or when there is nothing missing /
 * damaged, so it only takes space when there is something to act on.
 */
function ReportReminderPanel({ user: userProp, mockReports, mockAssets }) {
  const auth = useAuth();
  const user = userProp ?? auth?.user;
  const [expanded, setExpanded] = useState(false);

  const { items, counts, isAdmin, loading, error } = useReportReminder(
    user,
    mockReports,
    mockAssets,
  );

  if (loading) return <ReportReminderPanelSkeleton />;
  if (error || counts.total === 0) return null;

  const tone = counts.missing > 0 ? "missing" : "damaged";
  const plural = counts.total === 1 ? "" : "s";

  const eyebrow = isAdmin ? "Open incidents" : "Action required";
  const heading = isAdmin
    ? `${counts.total} asset${plural} reported missing / damaged`
    : `${counts.total} of your assets ${counts.total === 1 ? "is" : "are"} missing / damaged`;
  const subtext = isAdmin
    ? "Open reports across all rooms that have not been endorsed for repair or resolved."
    : "These assets are in your custody and still have an open report.";

  const visible = items.slice(0, MAX_ROWS);
  const hiddenCount = items.length - visible.length;

  return (
    <section
      className={`report-reminder is-${tone}`}
      aria-label="Missing and damaged asset reminder"
    >
      <div className="report-reminder-main">
        <div className="report-reminder-summary">
          <span className="report-reminder-icon" aria-hidden="true">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
          </span>
          <div className="report-reminder-text">
            <span className="report-reminder-eyebrow">{eyebrow}</span>
            <h2 className="report-reminder-heading">{heading}</h2>
            <p className="report-reminder-sub">{subtext}</p>
          </div>
        </div>

        <dl className="report-reminder-metrics">
          <div className="report-reminder-metric is-missing">
            <dt>
              <span className="report-reminder-dot" aria-hidden="true" />
              Missing
            </dt>
            <dd>{counts.missing}</dd>
          </div>
          <div className="report-reminder-metric is-damaged">
            <dt>
              <span className="report-reminder-dot" aria-hidden="true" />
              Damaged
            </dt>
            <dd>{counts.damaged}</dd>
          </div>
        </dl>

        <div className="report-reminder-actions">
          {/* same route the Reports panel links to */}
          <Link
            to="/report"
            className="report-reminder-btn report-reminder-btn--primary"
          >
            View reports
          </Link>
          <button
            type="button"
            className="report-reminder-btn report-reminder-btn--ghost"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls="report-reminder-details"
          >
            {expanded ? "Hide details" : "Show details"}
            <i
              className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="report-reminder-details" id="report-reminder-details">
          <div className="report-reminder-table-wrap">
            <table className="report-reminder-table">
              <thead>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col">Asset</th>
                  <th scope="col">Location</th>
                  <th scope="col">Report no.</th>
                  <th scope="col">Reported</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Status">
                      <span
                        className={`report-reminder-status is-${item.status}`}
                      >
                        <span
                          className="report-reminder-dot"
                          aria-hidden="true"
                        />
                        {TYPE_LABEL[item.status]}
                      </span>
                    </td>
                    <td data-label="Asset">
                      <span className="report-reminder-asset">
                        <span className="report-reminder-asset-name">
                          {item.description || item.assetId}
                        </span>
                        {item.description && (
                          <span className="report-reminder-mono">
                            {item.assetId}
                          </span>
                        )}
                      </span>
                    </td>
                    <td data-label="Location">{item.roomName || "—"}</td>
                    <td data-label="Report no.">
                      <span className="report-reminder-mono">
                        {item.reportNo || "—"}
                      </span>
                    </td>
                    <td data-label="Reported">{formatAge(item.daysOpen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hiddenCount > 0 && (
            <p className="report-reminder-more">
              {hiddenCount} more open report{hiddenCount === 1 ? "" : "s"}.{" "}
              <Link to="/report" className="report-reminder-link">
                View all
              </Link>
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default ReportReminderPanel;
