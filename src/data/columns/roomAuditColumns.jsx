import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatDate } from "../../utils/date";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { RoomInventoryPDF } from "../../pdf/templates/RoomInventoryPDF";
import { useRoomAssets } from "../../hooks/room/useRoomAssets";

function AuditFormCell({ audit }) {
  const { assets, roomName } = useRoomAssets(audit.id);

  return (
    <PDFPreviewModal
      title="Inventory Form"
      fileName={`room-inventory-${audit.id}.pdf`}
      document={<RoomInventoryPDF roomName={roomName} assets={assets} />}
      triggerLabel={
        <>
          <FontAwesomeIcon icon="fa-solid fa-file-pdf" />
          View
        </>
      }
    />
  );
}

export const roomAuditColumns = [
  {
    key: "room",
    label: "Room",
    width: "1.2fr",
    priority: "high",
    card: { role: "title" },
    render: (audit) => (
      <span className="room-row-name">
        <FontAwesomeIcon
          icon="fa-solid fa-door-open"
          className="icon-door icon-door--open"
        />
        <FontAwesomeIcon
          icon="fa-solid fa-door-closed"
          className="icon-door icon-door--closed"
        />
        <span className="room-row-name-text">
          {audit.name || audit.room_name || audit.room?.name}
        </span>
      </span>
    ),
  },
  {
    key: "last_audit",
    label: "Last Audit",
    width: "1fr",
    priority: "high",
    card: { role: "date" },
    render: (audit) => (
      <span className="room-row-audit">
        {audit.audited_at || audit.last_audited_at
          ? formatDate(audit.audited_at || audit.last_audited_at)
          : "Not yet audited"}
      </span>
    ),
  },
  {
    key: "assets",
    label: "Total Assets",
    width: "140px",
    priority: "high",
    card: { role: "assets" },
    render: (audit) => (
      <span className="room-row-assets-count">
        <FontAwesomeIcon icon="fa-solid fa-box-archive" />
        {audit.assetCount ?? audit.total_assets ?? 0}
      </span>
    ),
  },
  {
    key: "form",
    label: "Form",
    width: "180px",
    priority: "high",
    card: { role: "action" },
    render: (audit) => <AuditFormCell audit={audit} />,
  },
];
