export const STATUS_CONFIG = {
  audited: {
    label: "Audited",
    icon: "fa-solid fa-check",
    className: "audited",
  },
  not_audited: {
    label: "Not audited",
    icon: "fa-solid fa-eye-slash",
    className: "not-audited",
  },
  misplaced: {
    label: "Misplaced",
    icon: "fa-solid fa-triangle-exclamation",
    className: "misplaced",
  },
  missing: {
    label: "Missing",
    icon: "fa-solid fa-circle-xmark",
    className: "missing",
  },
};

export const AUDIT_NO_CONFIG = {
  room: { counterId: "audit_room", prefix: "ARM" },
  report: { counterId: "audit_report", prefix: "ARPT" },
};

export const AUDIT_STATUS_LABELS = {
  audited: "Audited",
  not_audited: "Not Audited",
  missing: "Missing",
  misplaced: "Misplaced",
};

export const AUDIT_STATUS_COLORS = {
  audited: "#1a7d1a",
  not_audited: "#666666",
  missing: "#860100",
  misplaced: "#b36b00",
};
