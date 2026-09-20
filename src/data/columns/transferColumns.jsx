import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import { TRANSFER_TYPE_LABELS } from "../transfer";

const renderRoomName = (value) =>
  value || <em style={{ fontStyle: "italic" }}>Unallocated</em>;

export const TRANSFER_COLUMNS = {
  action: [
    {
      key: "asset_id",
      label: "Assets Transferred",
      width: "0.9fr",
      priority: "high",
      render: (r) => (
        <span className="asset-count-cell">
          <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
          <span className="asset-count-text">{r.asset_count || "#"}</span>
        </span>
      ),
      card: { role: "title" },
    },
    {
      key: "type",
      label: "Type",
      width: "1.5fr",
      priority: "high",
      render: (r) => TRANSFER_TYPE_LABELS[r.type] ?? r.type,
      card: { role: "type" },
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
      key: "asset_count",
      label: "Assets Moved",
      width: "0.5fr",
      priority: "high",
      render: (r) => (
        <span className="asset-count-cell">
          <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
          <span className="asset-count-text">{r.asset_count || "#"}</span>
        </span>
      ),
      card: { role: "title" },
    },
    {
      key: "from",
      label: "From",
      width: "1fr",
      priority: "high",
      render: (r) => renderRoomName(r.room_from),
      card: { role: "from" },
    },
    {
      key: "to",
      label: "To",
      width: "1fr",
      priority: "high",
      render: (r) => renderRoomName(r.move_to),
      card: { role: "to" },
    },
    {
      key: "date",
      label: "Date",
      width: "1fr",
      priority: "medium",
      render: (r) => formatDate(r.created_at),
      card: { role: "date" },
    },
  ],
};
