import { ROLES } from "../data/roles";

export function getRole(role) {
  if (role === ROLES.PARTTIME) return "Part Time";
  if (role === ROLES.FULLTIME) return "Full Time";
  if (role === ROLES.ADMIN) return "Administrator";
  return "Unknown";
}