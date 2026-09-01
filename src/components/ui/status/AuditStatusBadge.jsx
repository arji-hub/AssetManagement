import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { STATUS_CONFIG } from "../../../data/audit";

function AuditStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status || "Unknown",
    icon: "fa-solid fa-question",
    className: "unknown",
  };

  return (
    <span
      className={`audit-status-badge audit-status-badge--${config.className}`}
    >
      <FontAwesomeIcon icon={config.icon} />
      {config.label}
    </span>
  );
}

export default AuditStatusBadge;
