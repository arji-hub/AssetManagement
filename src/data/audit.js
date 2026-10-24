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
  damaged: {
    label: "Damaged",
    icon: "fa-solid fa-screwdriver-wrench",
    className: "damaged",
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
  damaged: "Damaged",
};

export const AUDIT_STATUS_COLORS = {
  audited: "#1a7d1a",
  not_audited: "#666666",
  missing: "#860100",
  misplaced: "#b36b00",
  damaged: "#c2410c",
};

export const AUDIT_SESSION_STATUS_CONFIG = {
  ongoing: {
    label: "Ongoing",
    icon: "fa-solid fa-spinner",
    className: "ongoing",
  },
  completed: {
    label: "Completed",
    icon: "fa-solid fa-circle-check",
    className: "completed",
  },
};

// ── Add to data/audit.js ─────────────────────────────────────────────────────
export const AUDIT_CYCLE_DAYS = 90; // a room is overdue past this many days since its last completed audit
export const STALE_AUDIT_DAYS = 14; // an in-progress audit is "stale" after this many days...
export const STALE_PROGRESS_PERCENT = 30; // ...if it's still under this much progress

