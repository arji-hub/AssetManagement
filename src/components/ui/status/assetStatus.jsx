import React from "react";
import { STATUS_COLORS } from "../../../data/assets";
import "./assetStatus.css";

export function Status({ status }) {
  const style = STATUS_COLORS[status] || {
    bg: "#e5e7eb",
    color: "#111",
  };

  return (
    <span
      className="asset-status"
      style={{
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {status}
    </span>
  );
}
