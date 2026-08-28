import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AuditPanel.css";

function AuditPanel({
  icon,
  title,
  description,
  lastEntry,
  badgeVariant = "neutral",
  actionLabel = "Open",
  onClick,
}) {
  return (
    <button className="audit-panel-card" onClick={onClick} type="button">
      <span className="audit-panel-rail" aria-hidden="true" />

      <div className="audit-panel-icon">
        <FontAwesomeIcon icon={icon} aria-hidden="true" />
      </div>

      <div className="audit-panel-body">
        <h4 className="audit-panel-title">{title}</h4>
        <p className="audit-panel-desc">{description}</p>
      </div>

      <div className="audit-panel-footer">
        <span
          className={`audit-panel-status audit-panel-status--${badgeVariant}`}
        >
          <span className="audit-panel-status-dot" aria-hidden="true" />
          {lastEntry ? `Last entry ${lastEntry}` : "No recent entries"}
        </span>

        <span className="audit-panel-action">
          {actionLabel}
          <FontAwesomeIcon
            icon="arrow-right"
            className="audit-panel-arrow"
            aria-hidden="true"
          />
        </span>
      </div>
    </button>
  );
}

AuditPanel.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  lastEntry: PropTypes.string,
  badgeVariant: PropTypes.oneOf(["danger", "neutral"]),
  actionLabel: PropTypes.string,
  onClick: PropTypes.func,
};

export default AuditPanel;
