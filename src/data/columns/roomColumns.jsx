import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../utils/date";

export const roomColumns = [
  {
    key: "name",
    label: "Room",
    width: "1.2fr",
    priority: "high",
    card: { role: "title" },
    render: (room) => (
      <span className="room-row-name">
        <FontAwesomeIcon
          icon="fa-solid fa-door-open"
          className="icon-door icon-door--open"
        />
        <FontAwesomeIcon
          icon="fa-solid fa-door-closed"
          className="icon-door icon-door--closed"
        />
        <span className="room-row-name-text">{room.name}</span>
      </span>
    ),
  },
  {
    key: "custodian",
    label: "Custodian",
    width: "1.3fr",
    priority: "medium",
    card: { role: "meta", icon: "fa-regular fa-user" },
    render: (room) => (
      <span className="room-row-custodian">{room.roomCustodian || "—"}</span>
    ),
  },
  {
    key: "audit",
    label: "Last Audited",
    width: "1fr",
    priority: "high",
    card: { role: "date" },
    render: (room) => (
      <span className="room-row-audit">
        {room.last_audited_at
          ? formatDate(room.last_audited_at)
          : "Not yet audited"}
      </span>
    ),
  },
  {
    key: "assets",
    label: "Total Assets",
    width: "140px",
    priority: "high",
    card: { role: "assets" },
    render: (room) => (
      <span className="room-row-assets-count">
        <FontAwesomeIcon icon="fa-solid fa-box-archive" />
        {room.assetCount ?? 0}
      </span>
    ),
  },
];
