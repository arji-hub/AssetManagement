import React from "react";
import "./LabelCard.css";

function LabelCard({ label, value, className = "" }) {
  return (
    <div className={`label-card ${className}`}>
      <span className="label-card-label">{label}</span>
      <span className="label-card-value">{value || "—"}</span>
    </div>
  );
}

export default LabelCard;
