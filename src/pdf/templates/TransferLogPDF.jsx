import { Text } from "@react-pdf/renderer";
import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { styles } from "../styles/pdfStyles";
import { transferLogPdfColumns } from "../columns/transferLogPdfColumns";

import { formatDate } from "../../utils/date";

const CERTIFICATION =
  "This certifies that the items listed above were transferred from the releasing custodian to the receiving custodian on the date indicated.";

export function TransferLogPDF({
  request,
  items = [],
  ackAdmin,
  ackFrom,
  ackTo,
  fromLabel = "Released from (custodian)",
  toLabel = "Received by (custodian)",
}) {
  const signers = [
    ackFrom?.name && {
      label: "Released by:",
      caption: "Signature Over Printed Name of Custodian",
      name: ackFrom.name,
    },
    ackTo?.name && {
      label: "Received by:",
      caption: "Signature Over Printed Name of Custodian",
      name: ackTo.name,
    },
    {
      label: "Approved by:",
      caption: "Signature Over Printed Name of Admin",
      name: ackAdmin?.name,
    },
  ].filter(Boolean);
  return (
    <PDFLayout
      title="INVENTORY TRANSFER REPORT"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Transfer details</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Asset count", value: items.length },
            {
              label: "Date completed",
              value: request?.completed_at
                ? formatDate(request.completed_at)
                : "",
            },
          ],
        ]}
      />

      <SectionLabel>Custodian</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: fromLabel, value: ackFrom?.name },
            { label: toLabel, value: ackTo?.name },
          ],
        ]}
      />

      <SectionLabel>Remarks / purpose</SectionLabel>
      <MetaGrid rows={[[{ label: "Notes", value: request?.notes }]]} />

      <SectionLabel>Items transferred</SectionLabel>
      <PDFTable
        columns={transferLogPdfColumns}
        rows={items}
        zebra
        headerFill
        summary={`Total items: ${items.length}`}
        footer={
          <>
            <Text style={styles.certification}>{CERTIFICATION}</Text>
            <Signatures signers={signers} />
          </>
        }
      />
    </PDFLayout>
  );
}
