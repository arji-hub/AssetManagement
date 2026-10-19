import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../../../utils/date";
import "./AckBadge.css";
/**
 * "approved" | "declined" | "pending" | "closed"
 *  - pending: not acknowledged yet and the request is still open
 *  - closed:  not acknowledged and the request is already resolved (no response)
 */
export function resolveAckState(ack, request) {
  if (!ack?.acknowledged) {
    const isResolved =
      request?.status === "completed" || request?.status === "denied";
    return isResolved ? "closed" : "pending";
  }
  return ack.response === "declined" ? "declined" : "approved";
}

const STATE_CONFIG = {
  approved: { icon: "fa-solid fa-circle-check", modifier: "done" },
  declined: { icon: "fa-solid fa-circle-xmark", modifier: "declined" },
  pending: { icon: "fa-solid fa-clock", modifier: "pending" },
  closed: { icon: "fa-solid fa-ban", modifier: "closed" },
};

function AckBadge({ label, ack, request }) {
  const state = resolveAckState(ack, request);
  const { icon, modifier } = STATE_CONFIG[state];

  const isAdmin = label === "Admin";
  const name = ack?.name;

  const statusText = {
    approved: `Approved · ${formatDate(ack?.acknowledged_at)}`,
    declined: `Declined · ${formatDate(ack?.acknowledged_at)}`,
    pending: "Pending",
    closed: "No response",
  }[state];

  return (
    <div className={`transfer-ack-badge transfer-ack-badge--${modifier}`}>
      <FontAwesomeIcon icon={icon} />
      <div className="transfer-ack-badge-text">
        <span className="transfer-ack-badge-label">
          {label}
          {name ? (
            ` : ${name}`
          ) : !isAdmin ? (
            <>
              {" "}
              : <em>Unallocated</em>
            </>
          ) : null}
        </span>
        <span className="transfer-ack-badge-status">{statusText}</span>
      </div>
    </div>
  );
}

export default AckBadge;
