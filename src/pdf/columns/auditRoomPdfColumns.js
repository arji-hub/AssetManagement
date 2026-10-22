import { AUDIT_STATUS_LABELS, AUDIT_STATUS_COLORS } from "../../data/audit";

const statusOf = (r) => r.audit_status || "not_audited";

export const auditRoomPdfColumns = [
  {
    key: "no",
    header: "NO.",
    width: "6%",
    align: "center",
    render: (_, i) => i + 1,
  },
  {
    key: "description",
    header: "DESCRIPTION",
    width: "28%",
    render: (r) => r.description || "—",
  },
  {
    key: "serial",
    header: "SERIAL NO./ MODEL NO.",
    width: "20%",
    softBreak: true,
    chunkSize: 16, // Courier 8.5pt fits ~18 chars in this column
    mono: true,
    render: (r) => r.serial_number || "—",
  },
  {
    key: "category",
    header: "CATEGORY",
    width: "14%",
    render: (r) => r.category || "—",
  },
  {
    key: "custodian",
    header: "CUSTODIAN",
    width: "18%",
    render: (r) => r.custodian || "—",
  },
  {
    key: "status",
    header: "STATUS",
    width: "14%",
    align: "center",
    render: (r) => AUDIT_STATUS_LABELS[statusOf(r)] || statusOf(r),
    textStyle: (r) => ({
      fontWeight: "bold",
      color: AUDIT_STATUS_COLORS[statusOf(r)] || "#000",
    }),
  },
];
