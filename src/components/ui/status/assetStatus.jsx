import React from "react";
import { STATUS_COLORS } from "../../../data/assets";
import { toTitleCase } from "../../../utils/TextCasing";
import "./assetStatus.css";

export function Status({ status }) {
  const normalized = toTitleCase(status);

  const style = STATUS_COLORS[normalized] || {
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
      {normalized}
    </span>
  );
}