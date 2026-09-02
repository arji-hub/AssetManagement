import { formatDate } from "../../utils/date";

export const reportLogInfoColumns = [
  {
    key: "report_no",
    label: "Report No.",
    width: "1fr",
    priority: "high",
    card: { role: "title" },
    render: (r) => r.report_no || "—",
  },
  {
    key: "description",
    label: "Description",
    width: "2.2fr",
    priority: "high",
    card: { role: "desc", icon: "fa-solid fa-file-lines" },
    render: (r) => r.description || "—",
  },
  {
    key: "type",
    label: "Type",
    width: "0.9fr",
    priority: "high",
    card: { role: "badge" },
    render: (r) => (
      <span
        className={`report-log-info-type-badge report-log-info-type-${r.type}`}
      >
        {r.type}
      </span>
    ),
  },
  {
    key: "reported_by",
    label: "Reported By",
    width: "1.2fr",
    priority: "medium",
    card: { role: "meta", icon: "fa-solid fa-user" },
    render: (r) => (r.reported_by ? r.reported_by_name : "---"),
  },
  {
    key: "location",
    label: "Location",
    width: "1fr",
    priority: "medium",
    card: { role: "meta", icon: "fa-solid fa-location-dot" },
    render: (r) => r.location || "—",
  },
  {
    key: "date",
    label: "Date",
    width: "1fr",
    priority: "low",
    card: { role: "date" },
    render: (r) => formatDate(r.created_at),
  },
];
