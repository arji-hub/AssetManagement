// src/components/ui/modal/AuditConfirmRoomModal.stories.jsx
import React from "react";
import AuditConfirmRoomModal from "../../../components/ui/modal/AuditConfirmRoomModal";

export default {
  title: "Modals/AuditConfirmRoomModal",
  component: AuditConfirmRoomModal,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onConfirm: { action: "confirmed" },
    roomName: { control: "text" },
  },
};

// ── Stories ───────────────────────────────────────────────
// This modal owns its own trigger button and internal isOpen state, so every
// story renders closed by default — click "Create new audit" in the canvas
// to open it and exercise Cancel / Proceed.

export const Default = {
  args: {
    roomName: "Room 204",
  },
};

export const NoRoomNameProvided = {
  args: {
    roomName: undefined,
  },
};

export const LongRoomName = {
  args: {
    roomName: "College of Information and Communications Technology — Server Room",
  },
};