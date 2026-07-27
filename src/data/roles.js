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
