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

export const STATUS_COLORS = Object.fromEntries([
  ["Working", { bg: "rgba(59, 114, 68, 0.5)", color: "#1a5c23" }],

  ["Missing", { bg: "rgba(220, 38, 38, 0.5)", color: "#a31515" }],

  ["For Repair", { bg: "rgba(180, 155, 10, 0.5)", color: "#8a6d00" }],

  ["Damaged", { bg: "rgba(234, 88, 12, 0.5)", color: "#a3450a" }],

  ["Condemned", { bg: "rgba(107, 114, 128, 0.5)", color: "#3f4655" }],
]);
