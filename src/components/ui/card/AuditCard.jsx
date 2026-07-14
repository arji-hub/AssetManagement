import React from "react";
import "./AuditCard.css";

function AuditCard({ variant = "neutral", label, value, hint, children }) {
  return (
    <div className={`audit-card audit-card--${variant}`}>
      <p className="audit-card-label">{label}</p>
      <p className="audit-card-value">{value}</p>
      {children}
      {hint && <p className="audit-card-hint">{hint}</p>}
    </div>
  );
}

export default AuditCard;