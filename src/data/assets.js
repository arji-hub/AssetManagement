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
  ["Working", { bg: "rgba(59, 114, 68, 0.15)", color: "#004700" }],

  ["Missing", { bg: "rgba(220, 38, 38, 0.15)", color: "#7f1d1d" }],

  ["For Repair", { bg: "rgba(180, 155, 10, 0.15)", color: "#5a4500" }],

  ["Damaged", { bg: "rgba(234, 88, 12, 0.15)", color: "#7c2d12" }],

  ["Condemned", { bg: "rgba(107, 114, 128, 0.15)", color: "#1f2937" }],
]);

