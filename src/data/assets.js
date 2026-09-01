export const ASSET_CATEGORIES = [
  "Computer Set",
  "Laboratory",
  "Network",
  "Cables & Accessories",
  "Peripheral",
  "Storage Device",
  "Furniture",
  "Safety Equipment",
];

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
    bg: "var(--status-success-2-bg)",
    color: "var(--status-success-2)",
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
    bg: "var(--status-pending-2-bg)",
    color: "var(--status-pending-2)",
  },
  Missing: {
    bg: "var(--status-danger-2-bg)",
    color: "var(--status-danger-2)",
  },
  Found: {
    bg: "var(--status-success-2-bg)",
    color: "var(--status-success-2)",
  },

  // transfer statuses
  Pending: {
    bg: "var(--status-pending-2-bg)",
    color: "var(--status-pending-2)",
  },
  "For Approval": {
    bg: "var(--status-info-2-bg)",
    color: "var(--status-info-2)",
  },
  Completed: {
    bg: "var(--status-success-2-bg)",
    color: "var(--status-success-2)",
  },
  Denied: {
    bg: "var(--status-danger-2-bg)",
    color: "var(--status-danger-2)",
  },

  // audit statuses
  Ongoing: {
    bg: "var(--status-warning-bg)",
    color: "var(--status-warning)",
  },
};
