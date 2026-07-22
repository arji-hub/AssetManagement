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

export const STATUS_COLORS = {
  //undefined
  Undefined: { bg: "rgba(200, 200, 200, 0.7)", color: "#333333" },

  // asset statuses
  Working: { bg: "rgba(0, 255, 128, 0.7)", color: "#003d1f" },
  Condemned: { bg: "rgba(160, 160, 255, 0.7)", color: "#0d0d2e" },

  // report statuses
  Damaged: { bg: "rgba(255, 120, 0, 0.7)", color: "#2e1500" },
  "For Repair": { bg: "rgba(255, 200, 0, 0.7)", color: "#3d2e00" },
  Missing: { bg: "rgba(255, 50, 80, 0.7)", color: "#1a0008" },
  Found: { bg: "rgba(0, 255, 128, 0.7)", color: "#003d1f" },

  //transfer statuses
  Pending: { bg: "rgba(255, 200, 0, 0.7)", color: "#3d2e00" },
  "For Approval": { bg: "rgba(120, 130, 255, 0.7)", color: "#10103d" },
  Completed: { bg: "rgba(0, 255, 128, 0.7)", color: "#003d1f" },
  Denied: { bg: "rgba(255, 50, 80, 0.7)", color: "#1a0008" },

  // audit statuses
  Completed: { bg: "rgba(0, 255, 128, 0.7)", color: "#003d1f" },
  Ongoing: { bg: "rgba(255, 120, 0, 0.7)", color: "#2e1500" },
};
