// src/pages/Audit/room/AuditRoom.jsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import NewAuditRoomModal from "../../../components/modal/NewAuditRoomModal";
import AuditCard from "../../../components/ui/card/audit/AuditCard";
import BackButton from "../../../components/ui/button/BackButton";
import useRoomLogs from "../../../hooks/audit/room/useRoomLogs";
import { RoomListPDF } from "../../../pdf/templates/RoomListPDF";
import { PDFPreviewModal } from "../../../components/modal/PDFPreviewModal";
import RoomAuditFilter from "../../../components/ui/filter/RoomAuditFilter";
import { roomAuditColumns, previousAuditColumns } from "../../../data/columns";
import Table from "../../../components/panel/Table";
import AuditRoomCard from "../../../components/ui/card/audit/AuditRoomCard";
import DiscrepancyCard from "../../../components/ui/card/audit/DiscrepancyCard";
import SearchBar from "../../../components/ui/searchBar/SearchBar";
import "./AuditRoom.css";

function AuditRoom() {
  const navigate = useNavigate();
  const {
    rooms,
    roomsLoading,
    roomsError,
    search,
    setSearch,
    auditFilter,
    setAuditFilter,
    totalAudits,
    roomsNotAudited,
    avgDiscrepancyRate,
    previousAudits,
  } = useRoomLogs();
  const openWithRoomRef = useRef(null);

  const handleOpenRoom = (room) => {
    navigate(`/audit/room/${room.id}`);
  };

  return (
    <MainLayout>
      <div className="audit-room-page">
        <div className="audit-room-header">
          <div className="audit-room-header-left">
            <BackButton nav="/audit" />
            <div>
              <h2 className="audit-room-title">Audit Room Logs</h2>
              <p className="audit-room-subtitle">
                View historical records and current status of institutional
                space audits.
              </p>
            </div>
          </div>

          <div className="audit-room-header-actions">
            <NewAuditRoomModal
              onReady={(fn) => {
                openWithRoomRef.current = fn;
              }}
            />
          </div>
        </div>

        <div className="audit-room-stats">
          <AuditCard
            variant="secondary"
            label="Total audits"
            value={totalAudits}
          />
          <AuditCard
            variant="primary"
            label="Rooms not audited"
            value={roomsNotAudited}
          />
          <AuditCard
            variant="neutral"
            label="Avg. discrepancy rate"
            value={`${avgDiscrepancyRate}%`}
          />
        </div>

        <div className="audit-room-filter">
          <div className="audit-room-search">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search room"
            />
          </div>

          <div className="audit-room-filter-actions">
            <RoomAuditFilter value={auditFilter} onChange={setAuditFilter} />
            <PDFPreviewModal
              title="Room List"
              fileName="room-list.pdf"
              document={<RoomListPDF rooms={rooms} />}
              triggerLabel="Room List"
            />
          </div>
        </div>

        <div className="audit-room-primary-section">
          <div className="room-audit">
            <Table
              columns={roomAuditColumns}
              items={rooms}
              loading={roomsLoading}
              error={roomsError}
              itemLabel="rooms"
              emptyMessage="No rooms found."
              renderItem={(room) => (
                <AuditRoomCard
                  key={room.id}
                  room={room}
                  columns={roomAuditColumns}
                  onClick={() => handleOpenRoom(room)}
                />
              )}
            />
          </div>
        </div>

        {/* Previous audits across all rooms — secondary panel */}
        <div className="audit-room-history-section">
          <h3 className="audit-room-section-title audit-room-section-title--secondary">
            Previous Audits
          </h3>
          <Table
            columns={previousAuditColumns}
            items={previousAudits}
            loading={roomsLoading}
            error={roomsError}
            itemLabel="audits"
            emptyMessage="No previous audits found."
            desktopPageSize={10}
            mobilePageSize={5}
            renderItem={(audit, index) => (
              <DiscrepancyCard
                key={audit.id}
                audit={audit}
                index={index}
                columns={previousAuditColumns}
              />
            )}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default AuditRoom;
