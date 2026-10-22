function formatCellDate(value) {
  if (!value) return "—";
  const d = value?.toDate ? value.toDate() : new Date(value);
  return isNaN(d) ? "—" : d.toLocaleDateString();
}

// "in_use" -> "In use"
function prettyStatus(value) {
  if (!value) return "—";
  const s = String(value).replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const custodianInventoryPdfColumns = [
  {
    key: "no",
    header: "NO.",
    width: "6%",
    align: "center",
    render: (_, i) => i + 1,
  },
  {
    key: "name",
    header: "ASSET NAME",
    width: "30%",
    render: (a) => a.description || "—",
  },
  {
    key: "category",
    header: "CATEGORY",
    width: "20%",
    // category_id is likely a raw ID; prefer a name if the data has one
    render: (a) => a.category_name || a.category_id || "—",
  },
  {
    key: "room",
    header: "ROOM",
    width: "16%",
    render: (a) => a.room_name || "—",
  },
  {
    key: "status",
    header: "STATUS",
    width: "13%",
    align: "center",
    render: (a) => prettyStatus(a.status),
  },
  {
    key: "date",
    header: "DATE ASSIGNED",
    width: "15%",
    align: "center",
    render: (a) => formatCellDate(a.date_assigned),
  },
];
