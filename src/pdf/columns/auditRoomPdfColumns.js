import { AUDIT_STATUS_LABELS, AUDIT_STATUS_COLORS } from "../../data/audit";

const statusOf = (r) => r.audit_status || "not_audited";

export const auditRoomPdfColumns = [
  {
    key: "serial",
    header: "SERIAL NO./ MODEL NO.",
    width: "20%",
    softBreak: true,
    render: (r) => r.serial_number || "—",
  },
  {
    key: "description",
    header: "DESCRIPTION",
    width: "32%",
    render: (r) => r.description,
  },
  {
    key: "category",
    header: "CATEGORY",
    width: "16%",
    render: (r) => r.category,
  },
  {
    key: "custodian",
    header: "CUSTODIAN",
    width: "20%",
    render: (r) => r.custodian || "—",
  },
  {
    key: "status",
    header: "STATUS",
    width: "12%",
    render: (r) => AUDIT_STATUS_LABELS[statusOf(r)] || statusOf(r),
    textStyle: (r) => ({
      fontWeight: "bold",
      color: AUDIT_STATUS_COLORS[statusOf(r)] || "#000",
    }),
  },
];
