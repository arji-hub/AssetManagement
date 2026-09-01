import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getRole } from "../../utils/role";
import { ROLES_COLOR } from "../roles";

export const custodianColumns = [
  {
    key: "name",
    label: "Name",
    width: "1.5fr",
    priority: "high",
    card: { role: "title" },
    render: (custodian) => (
      <span className="custodian-row-name">
        <FontAwesomeIcon
          icon="fa-regular fa-user"
          className="icon-user icon-user--default"
        />
        <FontAwesomeIcon
          icon="fa-solid fa-user"
          className="icon-user icon-user--hover"
        />
        <span className="custodian-row-name-text">{custodian.fullname}</span>
      </span>
    ),
  },
  {
    key: "email",
    label: "Email",
    width: "1.5fr",
    priority: "low",
    card: { role: "meta" },
    render: (custodian) => (
      <span className="custodian-row-email">{custodian.email || "—"}</span>
    ),
  },
  {
    key: "role",
    label: "Role",
    width: "1fr",
    priority: "high",
    card: { role: "badge" },
    render: (custodian) => {
      const roleColor = ROLES_COLOR[custodian.role];
      const badgeStyle = {
        background: roleColor?.background || "rgba(59, 114, 68, 0.3)",
        color: roleColor?.text || "#004700",
      };
      return (
        <span className="custodian-badge" style={badgeStyle}>
          {getRole(custodian.role)}
        </span>
      );
    },
  },
  {
    key: "assets",
    label: "Assets in Custody",
    width: "140px",
    priority: "high",
    card: { role: "assets" },
    render: (custodian) => (
      <span className="custodian-row-assets-count">
        <FontAwesomeIcon icon="fa-solid fa-box-archive" />
        {custodian.asset_count ?? 0}
      </span>
    ),
  },
];
