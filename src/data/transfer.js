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
  assign_local_mr: "Assign Local MR",
  remove_custodian: "Remove Custodian",
  remove_local_mr: "Remove Local MR",
};

export const TRANSFER_TYPES = {
  ASSIGN: "assign_custodian",
  TRANSFER: "transfer_custodian",
  REMOVE: "remove_custodian",
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

export const MOCK_TRANSFERS = [
  {
    id: "txn-001",
    asset_id: "cict-1001",
    asset_description: "Laptop, Dell Inspiron 15, 8GB RAM, 512GB SSD",
    type: "assign_custodian",
    requested_by_name: "Admin User",
    status: "pending",
    created_at: { seconds: 1750000000 },
  },
  {
    id: "txn-002",
    asset_id: "cict-1002",
    asset_description: "Desktop PC, Intel Core i5, 256GB Disk Drive, 8GB RAM",
    type: "transfer_custodian",
    requested_by_name: "Admin User",
    status: "for_approval",
    created_at: { seconds: 1750100000 },
  },
  {
    id: "txn-003",
    asset_id: "cict-1003",
    asset_description: "Epson Projector, 3LCD, WXGA",
    type: "assign_local_mr",
    requested_by_name: "Admin User",
    status: "completed",
    created_at: { seconds: 1750200000 },
  },
];

export const MOCK_ROOM_LOGS = [
  {
    id: "room-001",
    asset_id: "cict-1001",
    asset_name: "Laptop, Dell Inspiron 15",
    room_from: "Room 101",
    move_to: "Room 204",
    created_at: { seconds: 1750000000 },
  },
  {
    id: "room-002",
    asset_id: "cict-1002",
    asset_name: "Desktop PC, Intel Core i5",
    room_from: null,
    move_to: "Room 101",
    created_at: { seconds: 1750100000 },
  },
];
