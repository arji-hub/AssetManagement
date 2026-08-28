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
    background: "rgba(220, 38, 38, 0.12)",
    text: "#991b1b",
  },
  fulltime: {
    background: "rgba(29, 78, 216, 0.12)",
    text: "#1e3a8a",
  },
  parttime: {
    background: "rgba(34, 197, 94, 0.12)",
    text: "#166534",
  },
};

export const CUSTODIAN_FILTER_OPTIONS = [
  { key: ROLES.FULLTIME, label: "Full-time" },
  { key: ROLES.PARTTIME, label: "Part-time" },
  { key: "archive", label: "Archive" },
];
