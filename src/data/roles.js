export const ROLES = {
  ADMIN: "admin",
  PARTTIME: "parttime",
  FULLTIME: "fulltime",
};
export default ROLES;

export const ROLE_LABELS = {
  admin: "Administrator",
  parttime: "Part-time Faculty",
  fulltime: "Full-time Faculty",
};

export const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: ROLES.FULLTIME, label: "Full-time" },
  { value: ROLES.PARTTIME, label: "Part-time" },
];

export const ROLES_COLOR = {
  admin: {
    background: "var(--danger-bg)",
    text: "var(--danger)",
  },
  fulltime: {
    background: "var(--info-bg)",
    text: "var(--info)",
  },
  parttime: {
    background: "var(--success-bg)",
    text: "var(--success)",
  },
};

export const CUSTODIAN_FILTER_OPTIONS = [
  { key: ROLES.FULLTIME, label: "Full-time" },
  { key: ROLES.PARTTIME, label: "Part-time" },
  { key: "archive", label: "Archive" },
];
