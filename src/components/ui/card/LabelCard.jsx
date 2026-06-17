import React from "react";
import "./LabelCard.css";

function LabelCard({ label, value }) {
  return (
    <div className="label-card">
      <span className="label-card-label">{label}</span>
      <span className="label-card-value">{value || "—"}</span>
    </div>
  );
}

export default LabelCard;