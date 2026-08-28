import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./AuditCard.css";

function AuditCard({ variant = "neutral", icon, label, value, hint, children }) {
  return (
    <div className={`audit-card audit-card--${variant}`}>
      <div className="audit-card-header">
        <p className="audit-card-label">{label}</p>
        {icon && (
          <span className="audit-card-icon">
            <FontAwesomeIcon icon={icon} />
          </span>
        )}
      </div>
      <p className="audit-card-value">{value}</p>
      {children}
      {hint && <p className="audit-card-hint">{hint}</p>}
    </div>
  );
}

export default AuditCard;