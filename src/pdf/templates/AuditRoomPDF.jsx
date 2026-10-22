import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { auditRoomPdfColumns } from "../columns/auditRoomPdfColumns";

import { formatDate } from "../../utils/date";

export function AuditRoomPDF({ roomName, audit, items = [] }) {
  const auditorName =
    audit.audited_by_name && audit.audited_by_name !== "—"
      ? audit.audited_by_name
      : "";

  return (
    <PDFLayout title="ROOM ASSET AUDIT REPORT" formCode="BulSU-OP-CICT-14F3">
      <MetaRows
        rows={[
          [`ROOM NAME: ${roomName}`, `AUDIT NO.: ${audit.audit_no}`],
          [
            `AUDITED BY: ${audit.audited_by_name}`,
            `DATE : ${formatDate(audit.completed_at)}`,
          ],
          [
            `TOTAL ASSETS: ${audit.total_assets}`,
            `DISCREPANCIES FOUND: ${audit.discrepancy_count}`,
          ],
        ]}
      />
      <PDFTable
        columns={auditRoomPdfColumns}
        rows={items}
        footer={
          <Signatures
            signers={[
              {
                label: "Audited by:",
                caption: "Signature Over Printed Name of Auditor",
                name: auditorName,
              },
              {
                label: "Noted by:",
                caption: "Signature Over Printed Name of Custodian",
              },
            ]}
          />
        }
      />
    </PDFLayout>
  );
}
