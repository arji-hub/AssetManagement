import { Status } from "../components/ui/status/assetStatus";
import { formatDate } from "../utils/date";
import { getReportType } from "../utils/report";
import { toTitleCase } from "../utils/TextCasing";
import { TRANSFER_TYPE_LABELS } from "./transfer";

export const assetColumns = [
  {
    key: "id",
    label: "Asset ID",
    width: "0.9fr",
    priority: "high",
    render: (a) => a.id || "—",
    card: { role: "hidden" },
  },
  {
    key: "desc",
    label: "Description",
    width: "2.5fr",
    priority: "high",
    render: (a) => a.description || "—",
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category_id || "—",
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "qty",
    label: "Qty",
    width: "0.6fr",
    priority: "low",
    render: (a) => a.qty ?? 1,
    card: { icon: "fa-solid fa-boxes-stacked" },
  },
  {
    key: "value",
    label: "Unit Value",
    width: "1fr",
    priority: "low",
    render: (a) => `₱${a.unit_value?.toLocaleString() ?? "—"}`,
    card: { icon: "fa-solid fa-peso-sign" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
];

export const roomAssetsColumns = [
  {
    key: "name",
    label: "Asset Name",
    width: "2.2fr",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "custodian",
    label: "Custodian",
    width: "1.5fr",
    priority: "high",
    render: (a) => a.name,
    card: { icon: "fa-solid fa-user" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.date),
  },
];

/* ── Assets held by a custodian (Custodian detail view) ── */
export const custodianAssetsColumns = [
  {
    key: "name",
    label: "Asset Name",
    width: "2.2fr",
    priority: "high",
    render: (a) => a.description,
  },
  {
    key: "category",
    label: "Category",
    width: "1fr",
    priority: "medium",
    render: (a) => a.category_id,
    card: { icon: "fa-solid fa-tag" },
  },
  {
    key: "room",
    label: "Room",
    width: "1.2fr",
    priority: "medium",
    render: (a) => a.room_id,
    card: { icon: "fa-solid fa-door-open" },
  },
  {
    key: "status",
    label: "Status",
    width: "1fr",
    priority: "high",
    render: (a) => <Status status={a.status} />,
  },
  {
    key: "date",
    label: "Date Assigned",
    width: "1.2fr",
    priority: "low",
    render: (a) => formatDate(a.created_at),
  },
];

/* ── Rooms (Room list page) ── */
export const roomColumns = [
  {
    key: "name",
    label: "Room",
    width: "1.5fr",
    priority: "high",
  },
  {
    key: "custodian",
    label: "Custodian",
    width: "1fr",
    priority: "high",
  },
  {
    key: "audit",
    label: "Last Audited",
    width: "1fr",
    priority: "medium",
  },
  {
    key: "assets",
    label: "Total Assets",
    width: "auto",
    priority: "high",
  },
];

/* ── Custodians (Custodian list page) ── */
export const custodianColumns = [
  {
    key: "name",
    label: "Name",
    width: "1.5fr",
    priority: "high",
  },
  {
    key: "email",
    label: "Email",
    width: "1.5fr",
    priority: "medium",
  },
  {
    key: "role",
    label: "Role",
    width: "1fr",
    priority: "high",
  },
  {
    key: "assets",
    label: "Assets in Custody",
    width: "auto",
    priority: "high",
  },
];

const IncidentBadge = ({ report }) => {
  const type = getReportType(report);
  return (
    <span className={`report-card-incident-type ${type}`}>
      {toTitleCase(type)}
    </span>
  );
};

export const REPORT_COLUMNS = {
  incident: [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "0.9fr",
      priority: "high",
      render: (r) => r.asset_id || "—",
      card: { role: "title" },
    },
    {
      key: "description",
      label: "Description",
      width: "2.5fr",
      priority: "high",
      render: (r) => r.description || "—",
      card: { role: "desc" },
    },
    {
      key: "location",
      label: "Location",
      width: "1fr",
      priority: "medium",
      render: (r) => r.location || "—",
      card: { role: "meta", icon: "fa-solid fa-location-dot" },
    },
    {
      key: "reported_by",
      label: "Reported By",
      width: "1.3fr",
      priority: "medium",
      render: (r) => r.reported_by_name || "—",
      card: { role: "meta", icon: "fa-solid fa-user" },
    },
    {
      key: "date",
      label: "Date",
      width: "1fr",
      priority: "low",
      render: (r) => formatDate(r.date_reported),
      card: { role: "date" },
    },
    {
      key: "status",
      label: "Status",
      width: "1fr",
      priority: "high",
      render: (r) => <Status status={r.status} />,
      card: { role: "badge" },
    },
  ],

  repair: [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "0.9fr",
      priority: "high",
      render: (r) => r.asset_id || "—",
      card: { role: "title" },
    },
    {
      key: "desc",
      label: "Description",
      width: "2.5fr",
      priority: "high",
      render: (r) => r.description || "—",
      card: { role: "desc" },
    },
    {
      key: "location",
      label: "Location",
      width: "1fr",
      priority: "medium",
      render: (r) => r.location || "—",
      card: { role: "meta", icon: "fa-solid fa-location-dot" },
    },
    {
      key: "reported_by",
      label: "Reported By",
      width: "1.3fr",
      priority: "medium",
      render: (r) => r.reported_by_name || "—",
      card: { role: "meta", icon: "fa-solid fa-user" },
    },
    {
      key: "date",
      label: "Date",
      width: "1fr",
      priority: "low",
      render: (r) => formatDate(r.date_reported),
      card: { role: "date" },
    },
  ],

  resolved: [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "0.9fr",
      priority: "high",
      render: (r) => r.asset_id || "—",
      card: { role: "title" },
    },
    {
      key: "desc",
      label: "Description",
      width: "2fr",
      priority: "high",
      render: (r) => r.description || "—",
      card: { role: "desc" },
    },
    {
      key: "location",
      label: "Location",
      width: "1fr",
      priority: "medium",
      render: (r) => r.location || "—",
      card: { role: "meta", icon: "fa-solid fa-location-dot" },
    },
    {
      key: "reported_by",
      label: "Reported By",
      width: "1.2fr",
      priority: "medium",
      render: (r) => r.reported_by_name || "—",
      card: { role: "meta", icon: "fa-solid fa-user" },
    },
    {
      key: "incident",
      label: "Incident",
      width: "1fr",
      priority: "medium",
      render: (r) => <IncidentBadge report={r} />,
      card: { role: "badge" },
    },
    {
      key: "resolved_at",
      label: "Date Resolved",
      width: "1fr",
      priority: "low",
      render: (r) => formatDate(r.date_resolved),
      card: { role: "date" },
    },
  ],

  archive: [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "0.9fr",
      priority: "high",
      render: (r) => r.asset_id || "—",
      card: { role: "title" },
    },
    {
      key: "desc",
      label: "Description",
      width: "2fr",
      priority: "high",
      render: (r) => r.description || "—",
      card: { role: "desc" },
    },
    {
      key: "location",
      label: "Location",
      width: "1fr",
      priority: "medium",
      render: (r) => r.location || "—",
      card: { role: "meta", icon: "fa-solid fa-location-dot" },
    },
    {
      key: "reported_by",
      label: "Reported By",
      width: "1.2fr",
      priority: "medium",
      render: (r) => r.reported_by_name || "—",
      card: { role: "meta", icon: "fa-solid fa-user" },
    },
    {
      key: "incident",
      label: "Incident",
      width: "1fr",
      priority: "medium",
      render: (r) => <IncidentBadge report={r} />,
      card: { role: "badge" },
    },
    {
      key: "date_resolved",
      label: "Date Resolved",
      width: "1fr",
      priority: "low",
      render: (r) => formatDate(r.date_resolved),
      card: { role: "date" },
    },
  ],
};

/* ── Transfer requests (Transfer page — action/requested/logs sub-tabs) ── */
export const TRANSFER_COLUMNS = {
  action: [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "0.7fr",
      priority: "high",
      render: (r) => r.asset_id || "—",
      card: { role: "title" },
    },
    {
      key: "desc",
      label: "Description",
      width: "2.3fr",
      priority: "high",
      render: (r) => r.asset_description || "—",
      card: { role: "desc" },
    },
    {
      key: "type",
      label: "Type",
      width: "1.5fr",
      priority: "medium",
      render: (r) => TRANSFER_TYPE_LABELS[r.type] ?? r.type,
      card: { role: "meta" },
    },
    {
      key: "requested_by",
      label: "Requested By",
      width: "1.5fr",
      priority: "medium",
      render: (r) => r.requested_by_name || "—",
      card: { role: "meta" },
    },
    {
      key: "status",
      label: "Status",
      width: "1fr",
      priority: "high",
      render: (r) => <Status status={r.status} />,
      card: { role: "badge" },
    },
    {
      key: "date",
      label: "Date",
      width: "1fr",
      priority: "low",
      render: (r) => formatDate(r.created_at),
      card: { role: "date" },
    },
  ],

  /* ── Room transfer logs (Transfer Room page) ── */
  room: [
    {
      key: "asset_id",
      label: "Asset ID",
      width: "0.5fr",
      priority: "high",
      render: (r) => r.asset_id || "—",
      card: { role: "title" },
    },
    {
      key: "desc",
      label: "Description",
      width: "3fr",
      priority: "high",
      render: (r) => r.asset_name || "—",
      card: { role: "desc" },
    },
    {
      key: "from",
      label: "From",
      width: "1fr",
      priority: "medium",
      render: (r) => r.room_from || "—",
      card: { role: "from" },
    },
    {
      key: "to",
      label: "To",
      width: "1fr",
      priority: "medium",
      render: (r) => r.move_to || "—",
      card: { role: "to" },
    },
    {
      key: "date",
      label: "Date",
      width: "1fr",
      priority: "low",
      render: (r) => formatDate(r.created_at),
      card: { role: "date" },
    },
  ],
};
