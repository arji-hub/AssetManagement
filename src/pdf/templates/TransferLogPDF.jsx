import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { transferLogPdfColumns } from "../columns/transferLogPdfColumns";

import { formatDate } from "../../utils/date";

/**
 * Transfer report – render only for completed requests.
 * Props: request, items (getRequestItems(request)), ackAdmin, ackFrom, ackTo
 * (from useTransferInfo), plus optional fromLabel / toLabel for local MR types.
 */
export function TransferLogPDF({
  request,
  items = [],
  ackAdmin,
  ackFrom,
  ackTo,
  fromLabel = "FROM CUSTODIAN",
  toLabel = "TO CUSTODIAN",
}) {
  // Admin always signs; From / To only get a block when they exist (2 or 3 signatories).
  const signers = [
    {
      label: "Approved by:",
      caption: "Signature Over Printed Name of Admin",
      name: ackAdmin?.name,
    },
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
  ].filter(Boolean);

  return (
    <PDFLayout title="INVENTORY TRANSFER REPORT" formCode="BulSU-OP-CICT-14F4">
      <MetaRows
        rows={[
          [
            `${fromLabel}: ${ackFrom?.name || "—"}`,
            `${toLabel}: ${ackTo?.name || "—"}`,
          ],
          [`NOTES: ${request?.notes || "—"}`],
          [
            `ASSET COUNT: ${items.length}`,
            `DATE : ${formatDate(request?.completed_at)}`,
          ],
        ]}
      />
      <PDFTable
        columns={transferLogPdfColumns}
        rows={items}
        footer={<Signatures signers={signers} />}
      />
    </PDFLayout>
  );
}
