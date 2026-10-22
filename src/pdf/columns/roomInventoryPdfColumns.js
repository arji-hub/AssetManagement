function prettyStatus(value) {
  if (!value) return "—";
  const s = String(value).replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const roomInventoryPdfColumns = [
  {
    key: "no",
    header: "NO.",
    width: "6%",
    align: "center",
    render: (_, i) => i + 1,
  },
  {
    key: "type",
    header: "EQUIPMENT TYPE",
    width: "24%",
    render: (a) => a.category_name || "—",
  },
  {
    key: "brand",
    header: "BRAND/ DESCRIPTION",
    width: "30%",
    render: (a) => a.description || "—",
  },
  {
    key: "serial",
    header: "SERIAL NO./ MODEL NO.",
    width: "24%",
    softBreak: true,
    chunkSize: 20,
    mono: true,
    render: (a) => a.serial_number || "—",
  },
  {
    key: "status",
    header: "STATUS",
    width: "16%",
    align: "center",
    render: (a) => prettyStatus(a.status),
  },
];
