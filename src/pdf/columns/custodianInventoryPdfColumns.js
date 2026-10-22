function formatCellDate(value) {
  if (!value) return "";
  const d = value?.toDate ? value.toDate() : new Date(value);
  return isNaN(d) ? "" : d.toLocaleDateString();
}

export const custodianInventoryPdfColumns = [
  {
    key: "name",
    header: "ASSET NAME",
    width: "34%",
    render: (a) => a.description,
  },
  {
    key: "category",
    header: "CATEGORY",
    width: "22%",
    render: (a) => a.category_id,
  },
  { key: "room", header: "ROOM", width: "18%", render: (a) => a.room_name },
  { key: "status", header: "STATUS", width: "14%", render: (a) => a.status },
  {
    key: "date",
    header: "DATE ASSIGNED",
    width: "12%",
    render: (a) => formatCellDate(a.date_assigned),
  },
];
