import React from "react";
import "./LabelCard.css";

function LabelCard({ label, value, className = "", onClick, style }) {
  return (
    <div
      className={`label-card ${className}`}
      onClick={onClick}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
    >
      <span className="label-card-label">{label}</span>
      <span className="label-card-value">{value || "—"}</span>
    </div>
  );
}

export default LabelCard;
