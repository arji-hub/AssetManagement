import React, { useState } from "react";
import { STATUS_COLORS } from "../../data/assets";
import { useAssetHistory } from "../../hooks/asset/useAssetHistory";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./HistoryCard.css";
import { toTitleCase } from "../../utils/TextCasing";

const HISTORY_FILTERS = ["All Events", "Transfer", "Incident"];

function StatusBadge({ status }) {
  if (!status) return null;
  const style = STATUS_COLORS[toTitleCase(status)] || {
    bg: "rgba(136,136,136,0.7)",
    color: "#1f1f1f",
  };
  return (
    <span
      className="history-card-status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  );
}

function HistoryCard({ assetId }) {
  const [filter, setFilter] = useState("All Events");
  const { history, loading, error, handleItemClick } = useAssetHistory(assetId);

  const filtered =
    filter === "All Events"
      ? history
      : history.filter((h) => h.type === filter);

  return (
    <div className="history-card">
      <div className="history-card-header">
        <h2 className="history-card-title">Asset History</h2>
        <div className="history-card-filters">
          {HISTORY_FILTERS.map((f) => (
            <button
              key={f}
              className={`history-card-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="history-card-list">
        {loading ? (
          <div className="history-card-empty">Loading history…</div>
        ) : error ? (
          <div className="history-card-empty">Failed to load history.</div>
        ) : filtered.length === 0 ? (
          <div className="history-card-empty">No events found.</div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="history-card-item"
              onClick={() => handleItemClick(item)}
            >
              <div className="history-card-item-icon">
                <FontAwesomeIcon
                  icon={
                    item.type === "Transfer"
                      ? "fa-solid fa-arrow-right"
                      : "fa-solid fa-circle-exclamation"
                  }
                />
              </div>
              <div className="history-card-item-body">
                <div className="history-card-item-top">
                  <span className="history-card-item-type">{item.type}</span>
                  <StatusBadge status={item.status} />
                  <span className="history-card-item-reporter">
                    Reported by: {item.reported_by}
                  </span>
                </div>
                <p className="history-card-item-desc">{item.description}</p>
              </div>
              <div className="history-card-item-date">
                <span>{item.date}</span>
                <span className="history-card-item-time">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryCard;
