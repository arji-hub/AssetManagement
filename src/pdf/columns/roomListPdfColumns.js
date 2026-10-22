export const roomListPdfColumns = [
  {
    key: "no",
    header: "NO.",
    width: "6%",
    align: "center",
    render: (_, i) => i + 1,
  },
  {
    key: "name",
    header: "ROOM NAME",
    width: "34%",
    render: (r) => r.name || "—",
  },
  {
    key: "custodian",
    header: "ROOM CUSTODIAN",
    width: "36%",
    render: (r) => r.roomCustodian || "—",
  },
  {
    key: "assets",
    header: "TOTAL ASSETS",
    width: "24%",
    align: "center",
    render: (r) => r.assetCount ?? 0,
  },
];
