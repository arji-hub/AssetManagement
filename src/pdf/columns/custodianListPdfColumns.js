const ROLE_LABELS = {
  admin: "Admin",
  fulltime: "Full-time Faculty",
  parttime: "Part-time Faculty",
};

export const custodianListPdfColumns = [
  {
    key: "no",
    header: "NO.",
    width: "5%",
    align: "center",
    render: (_, i) => i + 1,
  },
  { key: "name", header: "NAME", width: "35%", render: (c) => c.fullname },
  { key: "email", header: "EMAIL", width: "30%", render: (c) => c.email },
  {
    key: "role",
    header: "CLASSIFICATION",
    width: "15%",
    render: (c) => ROLE_LABELS[c.role] || c.role,
  },
  {
    key: "assets",
    header: "TOTAL ASSETS",
    width: "15%",
    align: "center",
    render: (c) => c.asset_count ?? 0,
  },
];
