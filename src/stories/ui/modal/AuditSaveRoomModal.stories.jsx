// src/components/ui/modal/AuditSaveRoomModal.stories.jsx
import React, { useState } from "react";
import AuditSaveRoomModal from "../../../components/ui/modal/AuditSaveRoomModal";

export default {
  title: "Modals/AuditSaveRoomModal",
  component: AuditSaveRoomModal,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed" },
    isOpen: { control: "boolean" },
    roomName: { control: "text" },
    auditedCount: { control: "number" },
    totalAssets: { control: "number" },
    discrepancyCount: { control: "number" },
  },
};

// ── Stories ───────────────────────────────────────────────

export const Default = {
  args: {
    isOpen: true,
    roomName: "Room 204",
    auditedCount: 3,
    totalAssets: 5,
    discrepancyCount: 1,
  },
};

export const FullyAuditedNoDiscrepancies = {
  args: {
    isOpen: true,
    roomName: "Server Room",
    auditedCount: 12,
    totalAssets: 12,
    discrepancyCount: 0,
  },
};

export const IncompleteWithRemainingAssets = {
  args: {
    isOpen: true,
    roomName: "Main Warehouse",
    auditedCount: 6,
    totalAssets: 20,
    discrepancyCount: 0,
  },
};

export const MultipleDiscrepancies = {
  args: {
    isOpen: true,
    roomName: "IT Department",
    auditedCount: 10,
    totalAssets: 10,
    discrepancyCount: 4,
  },
};

export const NoRoomOrStatsProvided = {
  args: {
    isOpen: true,
    roomName: "",
    auditedCount: 0,
    totalAssets: 0,
    discrepancyCount: 0,
  },
};

// ── Interactive story ─────────────────────────────────────
// Since AuditSaveRoomModal is externally controlled (isOpen/onClose come
// from the parent), this story wires up local state and a trigger button so
// Cancel/Proceed/overlay-click can actually be exercised in the canvas.
export const Interactive = {
  render: (args) => {
    function InteractiveWrapper() {
      const [isOpen, setIsOpen] = useState(false);

      return (
        <>
          <button
            type="button"
            className="audit-session-save-btn"
            onClick={() => setIsOpen(true)}
          >
            Complete Audit
          </button>

          <AuditSaveRoomModal
            {...args}
            isOpen={isOpen}
            onClose={() => {
              args.onClose?.();
              setIsOpen(false);
            }}
            onConfirm={() => {
              args.onConfirm?.();
              setIsOpen(false);
            }}
          />
        </>
      );
    }

    return <InteractiveWrapper />;
  },
  args: {
    roomName: "Room 204",
    auditedCount: 3,
    totalAssets: 5,
    discrepancyCount: 1,
  },
};
