import { Text } from "@react-pdf/renderer";
import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { styles } from "../styles/pdfStyles";
import { auditRoomPdfColumns } from "../columns/auditRoomPdfColumns";

import { formatDate } from "../../utils/date";

const CERTIFICATION =
  "This certifies that the room assets listed above were physically verified on the date indicated, and that the findings reflect their status at the time of the audit.";

export function AuditRoomPDF({ roomName, audit, items = [] }) {
  // One cleaned name, used in both the details block and the signature.
  const auditorName =
    audit?.audited_by_name && audit.audited_by_name !== "—"
      ? audit.audited_by_name
      : "";

  return (
    <PDFLayout
      title="ROOM ASSET AUDIT REPORT"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Audit details</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Room name", value: roomName },
            { label: "Audit no.", value: audit?.audit_no },
          ],
          [
            { label: "Audited by", value: auditorName },
            {
              label: "Date completed",
              value: audit?.completed_at ? formatDate(audit.completed_at) : "",
            },
          ],
          [
            {
              label: "Total assets",
              value: audit?.total_assets ?? items.length,
            },
            {
              label: "Discrepancies found",
              value: audit?.discrepancy_count ?? 0,
            },
          ],
        ]}
      />

      <SectionLabel>Audit findings</SectionLabel>
      <PDFTable
        columns={auditRoomPdfColumns}
        rows={items}
        zebra
        headerFill
        summary={`Total assets audited: ${items.length}`}
        footer={
          <>
            <Text style={styles.certification}>{CERTIFICATION}</Text>
            <Signatures
              signers={[
                {
                  label: "Audited by:",
                  caption: "Signature Over Printed Name of Auditor",
                  name: auditorName,
                },
              ]}
            />
          </>
        }
      />
    </PDFLayout>
  );
}
