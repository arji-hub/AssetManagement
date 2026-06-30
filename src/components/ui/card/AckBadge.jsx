import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../utils/date";
import "./AckBadge.css";

function AckBadge({ label, ack }) {
  const acknowledged = ack?.acknowledged === true;
  //create const if label not admin then name is {ack.name ? ack.name : "unassigned"}
  const name = label !== "Admin" ? ack?.name || "Unassigned" : null;
  return (
    <div
      className={`transfer-ack-badge ${acknowledged ? "transfer-ack-badge--done" : ""}`}
    >
      <FontAwesomeIcon
        icon={acknowledged ? "fa-solid fa-circle-check" : "fa-solid fa-clock"}
      />
      <div className="transfer-ack-badge-text">
        <span className="transfer-ack-badge-label">
          <span className="transfer-ack-badge-label">
            {label}
            {name ? (
              name === "Unassigned" ? (
                <>
                  {" "}
                  : <em>Unallocated</em>
                </>
              ) : (
                ` : ${name}`
              )
            ) : (
              ""
            )}
          </span>
        </span>
        <span className="transfer-ack-badge-status">
          {acknowledged ? formatDate(ack.acknowledged_at) : "Pending"}
        </span>
      </div>
    </div>
  );
}

export default AckBadge;
