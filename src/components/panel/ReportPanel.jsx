import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportCard from "../ui/card/ReportCard";
import "./ReportPanel.css";

const STATUS_GROUPS = {
  incident: ["pending"],
  repair: ["for_repair", "found"],
  condemn: ["condemned"],
};

const MOCK_REPORTS = [
  {
    id: "rpt-001",
    asset_id: "cict-I001",
    description: "Epson printer Dot Matrix not printing properly.",
    room_id: "SDL1",
    reported_by_name: "Ralph Jasper Ortiz",
    date_reported: "2023-10-15",
    status: "pending",
  },
  {
    id: "rpt-002",
    asset_id: "cict-I002",
    description: "Monitor screen flickering intermittently.",
    room_id: "SDL1",
    reported_by_name: "Ralph Jasper Ortiz",
    date_reported: "2023-10-15",
    status: "pending",
  },
  {
    id: "rpt-003",
    asset_id: "cict-I003",
    description: "Keyboard keys unresponsive, missing spacebar.",
    room_id: "Room 301",
    reported_by_name: "Maria Santos",
    date_reported: "2023-10-12",
    status: "for_repair",
  },
  {
    id: "rpt-004",
    asset_id: "cict-I004",
    description: "Projector bulb dimming, needs replacement.",
    room_id: "Room 205",
    reported_by_name: "Lance Reyes",
    date_reported: "2023-10-10",
    status: "for_repair",
  },
  {
    id: "rpt-005",
    asset_id: "cict-I005",
    description: "Asset located after being reported missing.",
    room_id: "SDL2",
    reported_by_name: "Admin",
    date_reported: "2023-10-08",
    status: "found",
  },
  {
    id: "rpt-006",
    asset_id: "cict-I006",
    description: "Office chair armrest broken.",
    room_id: "Room 301",
    reported_by_name: "Juan Dela Cruz",
    date_reported: "2023-10-05",
    status: "pending",
  },
  {
    id: "rpt-007",
    asset_id: "cict-I007",
    description: "Power cable frayed and exposed wiring.",
    room_id: "SDL1",
    reported_by_name: "Maria Santos",
    date_reported: "2023-09-28",
    status: "condemned",
  },
  {
    id: "rpt-008",
    asset_id: "cict-I008",
    description: "Unit assessed as beyond repair, motherboard fried.",
    room_id: "Room 205",
    reported_by_name: "Admin",
    date_reported: "2023-09-20",
    status: "condemned",
  },
  {
    id: "rpt-009",
    asset_id: "cict-I009",
    description: "Air conditioning unit not cooling.",
    room_id: "Room 301",
    reported_by_name: "Lance Reyes",
    date_reported: "2023-09-18",
    status: "for_repair",
  },
  {
    id: "rpt-010",
    asset_id: "cict-I010",
    description: "Asset missing during routine inventory check.",
    room_id: "SDL2",
    reported_by_name: "Ralph Jasper Ortiz",
    date_reported: "2023-09-15",
    status: "pending",
  },
];

const COLUMNS = [
  "Asset ID",
  "Description",
  "Location",
  "Reported By",
  "Date",
  "Status",
];

function ReportPanel({ group = "incident" }) {
  const navigate = useNavigate();

  const [reports] = useState(MOCK_REPORTS);
  const [loading] = useState(false);
  const [error] = useState(null);

  const allowedStatuses = STATUS_GROUPS[group] || [];
  const filteredReports = (reports || []).filter((r) =>
    allowedStatuses.includes(r.status),
  );

  const handleRowClick = (report) => {
    navigate(`/report/${report.id}`);
  };

  return (
    
    <div className="report-panel">
      <div className="report-panel-header">
        {COLUMNS.map((col) => (
          <div key={col} className="report-panel-header-cell">
            {col}
          </div>
        ))}
      </div>

      <div className="report-panel-body">
        {loading ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
            <p>Loading reports…</p>
          </div>
        ) : error ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
            <p>{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="report-panel-empty">
            <FontAwesomeIcon icon="fa-solid fa-clipboard" />
            <p>No reports found.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={handleRowClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ReportPanel;
