export const ASSET_STATUS = [
  "Working",
  "Missing",
  "For Repair",
  "Damaged",
  "Condemned",
];

// asset assignment
export const UNALLOCATED_ROOM = "Unallocated";
export const UNASSIGNED_CUSTODIAN = "Unassigned";

// data/status.js

export const getStatusBgColor = (status) => {
  return STATUS_COLORS[status]?.bg || STATUS_COLORS.Undefined.bg;
};

export const STATUS_COLORS = {
  // undefined
  Undefined: {
    bg: "var(--status-neutral-bg)",
    color: "var(--status-neutral)",
  },

  // asset statuses
  Working: {
    bg: "var(--status-success-bg)",
    color: "var(--status-success)",
  },
  Condemned: {
    bg: "var(--status-condemned-bg)",
    color: "var(--status-condemned)",
  },

  // report statuses
  Damaged: {
    bg: "var(--status-warning-bg)",
    color: "var(--status-warning)",
  },
  "For Repair": {
    bg: "var(--status-pending-bg)",
    color: "var(--status-pending)",
  },
  Missing: {
    bg: "var(--status-danger-bg)",
    color: "var(--status-danger)",
  },
  Found: {
    bg: "var(--status-success-bg)",
    color: "var(--status-success)",
  },

  // transfer statuses
  Pending: {
    bg: "var(--status-pending-bg)",
    color: "var(--status-pending)",
  },
  "For Approval": {
    bg: "var(--status-info-bg)",
    color: "var(--status-info)",
  },
  Completed: {
    bg: "var(--status-success-bg)",
    color: "var(--status-success)",
  },
  Denied: {
    bg: "var(--status-danger-bg)",
    color: "var(--status-danger)",
  },

  // audit statuses
  Ongoing: {
    bg: "var(--status-warning-bg)",
    color: "var(--status-warning)",
  },
};
