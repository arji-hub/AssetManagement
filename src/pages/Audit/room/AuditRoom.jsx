import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import NewAuditRoomModal from "../../../components/ui/modal/NewAuditRoomModal";
import AuditCard from "../../../components/ui/card/audit/AuditCard";
import BackButton from "../../../components/ui/button/BackButton";
import useRoomLogs from "../../../hooks/audit/useRoomLogs";
import { RoomListPDF } from "../../../pdf/templates/RoomListPDF";
import { PDFPreviewModal } from "../../../components/ui/modal/PDFPreviewModal";
import { roomAuditColumns } from "../../../data/columns";
import Table from "../../../components/panel/Table";
import AuditRoomCard from "../../../components/ui/card/audit/AuditRoomCard";
import "./AuditRoom.css";

function AuditRoom() {
  const { rooms, roomsLoading, roomsError, search, setSearch } = useRoomLogs();
  const openWithRoomRef = useRef(null);

  /* move here list of rooms then per room may view inventory pdf
  then on top beside new audit or katabi ng search bar there is room pdf btn */
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
          <AuditCard variant="secondary" label="Total audits" value={"—"} />
          <AuditCard variant="primary" label="Rooms not audited" value={"—"} />
          <AuditCard
            variant="neutral"
            label="Avg. discrepancy rate"
            value={"—"}
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
              placeholder="Search room"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PDFPreviewModal
            title="Room List"
            fileName="room-list.pdf"
            document={<RoomListPDF rooms={rooms} />}
            triggerLabel="Room List"
          />
        </div>

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
                onClick={() => openWithRoomRef.current?.(room)}
              />
            )}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default AuditRoom;
