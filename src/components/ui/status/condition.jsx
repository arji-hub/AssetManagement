import React from "react";
import { STATUS_COLORS } from "../../../data/assets";
import "./condition.css";

export function Condition({ condition }) {
  const style = STATUS_COLORS[condition] || {
    bg: "#e5e7eb",
    color: "#111",
  };

  return (
    <span
      className="asset-condition"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {condition}
    </span>
  );
}
