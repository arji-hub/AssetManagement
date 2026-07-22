export const STATUS_CONFIG = {
  audited: {
    label: "Audited",
    icon: "fa-solid fa-check",
    className: "audited",
  },
  not_audited: {
    label: "Not audited",
    icon: "fa-solid fa-minus",
    className: "not-audited",
  },
  misplaced: {
    label: "Misplaced",
    icon: "fa-solid fa-triangle-exclamation",
    className: "misplaced",
  },
};

export const AUDIT_NO_CONFIG = {
  room: { counterId: "audit_room", prefix: "ARM" },
  report: { counterId: "audit_report", prefix: "ARPT" },
};

export const AUDIT_STATUS_LABELS = {
  audited: "Audited",
  not_audited: "Not Audited",
  misplaced: "Misplaced",
};

export const AUDIT_STATUS_COLORS = {
  audited: "#1a7d1a",
  not_audited: "#666666",
  misplaced: "#b36b00",
};
