import React from "react";
import AuditRoom from "../../components/panel/AuditRoom";

export default {
  title: "Panel/AuditRoom",
  component: AuditRoom,
};

export const Default = {
  args: {
    roomsOverdue: 3,
    onClick: () => alert("Navigate to Audit Room page"),
  },
};

export const NoOverdueRooms = {
  args: {
    roomsOverdue: 0,
    onClick: () => alert("Navigate to Audit Room page"),
  },
};