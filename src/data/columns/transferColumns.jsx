import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import { TRANSFER_TYPE_LABELS } from "../transfer";

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
