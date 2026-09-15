export const TOP_TABS = [
  { key: "transfers", label: "Transfers" },
  { key: "rooms", label: "Rooms" },
];

export const SUB_TABS = [
  { key: "action", label: "Action" },
  { key: "requested", label: "Requested" },
  { key: "logs", label: "Logs" },
];

export const ROOM_SUB_TABS = [{ key: "logs", label: "Logs" }];

export const TRANSFER_TYPE_LABELS = {
  assign_custodian: "Assign Custodian",
  transfer_custodian: "Transfer Custodian",
  assign_localmr: "Assign Local MR",
  remove_custodian: "Remove Custodian",
  remove_localmr: "Remove Local MR",
};

export const TRANSFER_TYPES = {
  ASSIGN: "assign_custodian",
  TRANSFER: "transfer_custodian",
  REMOVE: "remove_custodian",
  ASSIGNMR: "assign_localmr",
  REMOVEMR: "remove_localmr",
};

export const STATUS = {
  PENDING: "pending",
  FOR_APPROVAL: "for_approval",
};

export const EMPTY_STATE_CONFIG = {
  action: {
    icon: "fa-solid fa-inbox",
    message: "No transfers require your action.",
  },
  requested: {
    icon: "fa-solid fa-paper-plane",
    message: "You haven't created any transfer requests yet.",
  },
  logs: {
    icon: "fa-solid fa-clock-rotate-left",
    message: "No completed or denied transfers to show.",
  },
  room_logs: {
    icon: "fa-solid fa-door-open",
    message: "No room transfers on record.",
  },
};

// add to data/transfer.js
