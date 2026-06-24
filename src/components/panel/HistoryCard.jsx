import React, { useState } from "react";
import { STATUS_COLORS } from "../../data/assets";
import "./HistoryCard.css";

const HISTORY_FILTERS = ["All Events", "Transfer", "Incident"];
const MOCK_HISTORY = [
  {
    id: 1,
    type: "Incident",
    status: "Working",
    description: "All good and in working condition.",
    reported_by: "Admin",
    date: "Oct 16, 2023",
    time: "11:13am",
  },
  {
    id: 2,
    type: "Incident",
    status: "For Repair",
    description: "Screen flickering intermittently. Needs technician check.",
    reported_by: "Juan Dela Cruz",
    date: "Oct 15, 2023",
    time: "9:45am",
  },
  {
    id: 3,
    type: "Transfer",
    status: null,
    description: "Transferred from Room 301 to SDL I.",
    reported_by: "Admin",
    date: "Sep 10, 2023",
    time: "2:00pm",
  },
  {
    id: 4,
    type: "Incident",
    status: "Damaged",
    description: "Power cable damaged. Replacement requested.",
    reported_by: "Maria Santos",
    date: "Aug 22, 2023",
    time: "10:30am",
  },
  {
    id: 5,
    type: "Transfer",
    status: null,
    description: "Initial deployment to Room 301.",
    reported_by: "Admin",
    date: "Mar 21, 2017",
    time: "8:00am",
  },
  {
    id: 6,
    type: "Incident",
    status: "Missing",
    description: "Asset not found during routine inventory check.",
    reported_by: "Lance Reyes",
    date: "Jul 5, 2023",
    time: "3:15pm",
  },
  {
    id: 7,
    type: "Incident",
    status: "Working",
    description: "Asset recovered and returned to its assigned room.",
    reported_by: "Admin",
    date: "Jul 8, 2023",
    time: "9:00am",
  },
  {
    id: 8,
    type: "Transfer",
    status: null,
    description: "Temporarily moved to Room 205 for semester use.",
    reported_by: "Ralph Jasper",
    date: "Jun 12, 2023",
    time: "1:30pm",
  },
  {
    id: 9,
    type: "Incident",
    status: "Condemned",
    description: "Unit assessed as beyond repair. Recommended for disposal.",
    reported_by: "Admin",
    date: "May 3, 2023",
    time: "10:00am",
  },
  {
    id: 10,
    type: "Incident",
    status: "For Repair",
    description: "Keyboard unresponsive. Sent to ICT technician for servicing.",
    reported_by: "Maria Santos",
    date: "Apr 18, 2023",
    time: "2:45pm",
  },
];

function StatusBadge({ status }) {
  if (!status) return null;
  const style = STATUS_COLORS[status] || {
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
  const [history, setHistory] = useState(MOCK_HISTORY);

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
        {filtered.length === 0 ? (
          <div className="history-card-empty">No events found.</div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="history-card-item">
              <div className="history-card-item-icon">
                <i
                  className={`ti ${item.type === "Transfer" ? "ti-arrow-right" : "ti-alert-circle"}`}
                  aria-hidden="true"
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
