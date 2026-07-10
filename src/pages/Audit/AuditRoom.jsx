import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import NewAuditModal from "../../components/ui/modal/NewAuditModal";
import AuditCard from "../../components/ui/card/AuditCard";
import AuditHistory from "../../components/panel/AuditHistory";
import BackButton from "../../components/ui/button/BackButton";
import "./AuditRoom.css";

// Placeholder data until useAuditHistory / useRooms hooks are wired up
const mockStats = {
  total_audits: 124,
  rooms_pending: 12,
  avg_discrepancy_rate: 4.2,
};

const mockLogs = [
  {
    audit_no: "AUD-2023-089",
    room_id: "room_302",
    room_name: "Room 302 - Computer Lab",
    date: "2023-10-24",
    auditor: "Admin User",
    status: "completed",
    discrepancy_count: 3,
  },
  {
    audit_no: "AUD-2023-090",
    room_id: "room_401",
    room_name: "Room 401 - IT Office",
    date: "2023-10-25",
    auditor: "M. Santos",
    status: "in_progress",
    discrepancy_count: null,
  },
  {
    audit_no: "AUD-2023-088",
    room_id: "room_303",
    room_name: "Room 303 - Lecture Hall",
    date: "2023-10-22",
    auditor: "R. Dela Cruz",
    status: "completed",
    discrepancy_count: 0,
  },
  {
    audit_no: "AUD-2023-087",
    room_id: "room_server_a",
    room_name: "Server Room A",
    date: "2023-10-20",
    auditor: "Admin User",
    status: "completed",
    discrepancy_count: 1,
  },
];

function AuditRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredLogs = mockLogs.filter((log) => {
    const haystack = `${log.room_name} ${log.auditor}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  function handleLogAction(log) {
    if (log.status === "in_progress") {
      navigate(`/audit/room/session/${log.room_id}`);
    } else {
      navigate(`/audit/room/${log.audit_no}`);
    }
  }

  return (
    <MainLayout>
      <div className="audit-room-page">
        <div className="audit-room-header">
          <div className="audit-room-header-left">
            <BackButton />
            <div>
              <h2 className="audit-room-title">Audit Room Logs</h2>
              <p className="audit-room-subtitle">
                View historical records and current status of institutional
                space audits.
              </p>
            </div>
          </div>

          <div className="audit-room-header-actions">
            <NewAuditModal />
          </div>
        </div>

        <div className="audit-room-stats">
          <AuditCard
            variant="secondary"
            label="Total audits"
            value={mockStats.total_audits}
            hint="Academic year 2023-2024"
          />
          <AuditCard
            variant="primary"
            label="Rooms pending"
            value={mockStats.rooms_pending}
            hint="Due by end of semester"
          />
          <AuditCard
            variant="neutral"
            label="Avg. discrepancy rate"
            value={`${mockStats.avg_discrepancy_rate}%`}
            hint="Across all audited spaces"
          />
        </div>

        <div className="audit-room-filter">
          <div className="audit-room-search">
            <FontAwesomeIcon
              icon="magnifying-glass"
              className="audit-room-search-icon"
            />
            <input
              type="text"
              placeholder="Search logs by room or auditor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="audit-room-btn-secondary" type="button">
            <FontAwesomeIcon icon="fa-solid fa-sliders" />
            Filter
          </button>
        </div>

        <AuditHistory logs={filteredLogs} onLogAction={handleLogAction} />
      </div>
    </MainLayout>
  );
}

export default AuditRoom;
