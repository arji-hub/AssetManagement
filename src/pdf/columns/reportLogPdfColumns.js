import { formatDate } from "../../utils/date";

const REPORT_TYPE_LABELS = { damaged: "DAMAGED", missing: "MISSING" };
const REPORT_TYPE_COLORS = { damaged: "#860100", missing: "#8a5c00" };

export const reportLogPdfColumns = [
  {
    key: "no",
    header: "REPORT NO.",
    width: "13%",
    render: (r) => r.report_no || "—",
  },
  {
    key: "description",
    header: "DESCRIPTION",
    width: "38%",
    render: (r) => r.description,
  },
  {
    key: "type",
    header: "TYPE",
    width: "15%",
    render: (r) => REPORT_TYPE_LABELS[r.type] || "",
    textStyle: (r) => ({
      fontWeight: "bold",
      color: REPORT_TYPE_COLORS[r.type] || "#000",
    }),
  },
  {
    key: "room",
    header: "ROOM",
    width: "20%",
    render: (r) => r.room_name || "Unallocated",
    textStyle: (r) => (r.room_name ? undefined : { fontStyle: "italic" }),
  },
  {
    key: "date",
    header: "DATE",
    width: "14%",
    render: (r) => (r.created_at ? formatDate(r.created_at) : ""),
  },
];
