const REPORT_STATUS = {
  DAMAGED: "damaged",
  MISSING: "missing",
  FOR_REPAIR: "for_repair",
  FOUND: "found",
  WORKING: "working",
  CONDEMNED: "condemned",
};

const STATUS_LABELS = {
  [REPORT_STATUS.DAMAGED]: "Damaged",
  [REPORT_STATUS.MISSING]: "Missing",
  [REPORT_STATUS.FOR_REPAIR]: "For Repair",
  [REPORT_STATUS.FOUND]: "Found",
  [REPORT_STATUS.WORKING]: "Working",
  [REPORT_STATUS.CONDEMNED]: "Condemned",
};

function humanizeStatus(status) {
  if (STATUS_LABELS[status]) return STATUS_LABELS[status];
  if (!status) return "Unknown";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

module.exports = { REPORT_STATUS, STATUS_LABELS, humanizeStatus };
