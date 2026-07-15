import React from "react";
import AuditHistory from "../../components/panel/AuditHistory";

const mockSessions = [
  {
    audit_no: "AUD-0089",
    room_name: "Comp Lab 402",
    conducted_by_name: "Dr. Elena Smith",
    date: "Oct 24, 2023",
    status: "completed",
    discrepancy_count: 0,
  },
  {
    audit_no: "AUD-0090",
    room_name: "Admin Office 12",
    conducted_by_name: "Marcus Thorne",
    date: "Oct 25, 2023",
    status: "in_progress",
    discrepancy_count: 4,
  },
  {
    audit_no: "AUD-0091",
    room_name: "Physics Lab B",
    conducted_by_name: "Sarah Connor",
    date: "Oct 25, 2023",
    status: "completed",
    discrepancy_count: 2,
  },
  {
    audit_no: "AUD-0092",
    room_name: "Main Library",
    conducted_by_name: "Dr. Elena Smith",
    date: "Oct 26, 2023",
    status: "in_progress",
    discrepancy_count: 0,
  },
];

export default {
  title: "Panel/AuditHistory",
  component: AuditHistory,
};

export const Default = {
  args: {
    sessions: mockSessions,
    onViewAll: () => alert("View all sessions"),
    onRowClick: (session) => alert(`Open session ${session.audit_no}`),
  },
};

export const Empty = {
  args: {
    sessions: [],
    onViewAll: () => alert("View all sessions"),
    onRowClick: () => {},
  },
};