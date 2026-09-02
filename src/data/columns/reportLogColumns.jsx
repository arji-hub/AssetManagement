import { formatDate } from "../../utils/date";

export const reportLogColumns = [
  {
    key: "log_name",
    label: "Log Name",
    width: "1.6fr",
    priority: "high",
    card: { role: "title" },
    render: (log) => log.log_name || "—",
  },
  {
    key: "report_count",
    label: "Total Reports",
    width: "1fr",
    priority: "high",
    card: { role: "badge" },
    render: (log) => (
      <span className="report-log-badge">{log.report_count ?? 0}</span>
    ),
  },
  {
    key: "damaged_count",
    label: "Damaged",
    width: "0.9fr",
    priority: "medium",
    card: { role: "stat", icon: "fa-solid fa-triangle-exclamation" },
    render: (log) => (
      <span
        className={
          log.damaged_count > 0 ? "report-log-damaged" : "report-log-muted"
        }
      >
        {log.damaged_count ?? 0}
      </span>
    ),
  },
  {
    key: "missing_count",
    label: "Missing",
    width: "0.9fr",
    priority: "medium",
    card: { role: "stat", icon: "fa-solid fa-circle-question" },
    render: (log) => (
      <span
        className={
          log.missing_count > 0 ? "report-log-missing" : "report-log-muted"
        }
      >
        {log.missing_count ?? 0}
      </span>
    ),
  },
  {
    key: "created_at",
    label: "Date Generated",
    width: "1fr",
    priority: "low",
    card: { role: "date" },
    render: (log) => (
      <span className="report-log-muted">{formatDate(log.created_at)}</span>
    ),
  },
];
