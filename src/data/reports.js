// reports data
export const REPORT_TYPES = [
  { value: "damaged", label: "Damaged" },
  { value: "missing", label: "Missing" },
];

export const ACTION_LABELS = {
  for_repair: "Endorse for Repair",
  found: "Mark as Found",
  working: "Mark as Working",
  condemned: "Condemn Asset",
};

export const TABS = [
  { key: "incident", label: "Incident" },
  { key: "repair", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "archive", label: "Archive" },
];

export const REPORT_STATUS = {
  DAMAGED: "damaged",
  MISSING: "missing",
  FOR_REPAIR: "for_repair",
  WORKING: "working",
  FOUND: "found",
  CONDEMNED: "condemned",
};

export const STATUS_GROUPS = {
  incident: [REPORT_STATUS.DAMAGED, REPORT_STATUS.MISSING],
  repair: [REPORT_STATUS.FOR_REPAIR],
  resolved: [REPORT_STATUS.WORKING, REPORT_STATUS.FOUND],
  archive: [REPORT_STATUS.CONDEMNED],
};

export const ASSET_CLEARING_STATUSES = [
  REPORT_STATUS.WORKING,
  REPORT_STATUS.FOUND,
  REPORT_STATUS.CONDEMNED,
];

