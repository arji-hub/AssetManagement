import { formatDate } from "../../utils/date";
import { COLORS } from "../styles/pdfStyles";

const REPORT_TYPE_LABELS = { damaged: "DAMAGED", missing: "MISSING" };
const REPORT_TYPE_COLORS = { damaged: COLORS.maroon, missing: COLORS.golden };

export const reportLogPdfColumns = [
  {
    key: "no",
    header: "REPORT NO.",
    width: "14%",
    softBreak: true,
    chunkSize: 11,
    mono: true,
    render: (r) => r.report_no || "—",
  },
  {
    key: "description",
    header: "DESCRIPTION",
    width: "36%",
    render: (r) => r.description || "—",
  },
  {
    key: "type",
    header: "TYPE",
    width: "15%",
    align: "center",
    render: (r) => REPORT_TYPE_LABELS[r.type] || "—",
    textStyle: (r) => ({
      fontWeight: "bold",
      color: REPORT_TYPE_COLORS[r.type] || COLORS.black,
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
    width: "15%",
    align: "center",
    render: (r) => (r.created_at ? formatDate(r.created_at) : "—"),
  },
];
