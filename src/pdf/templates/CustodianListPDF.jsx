import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { custodianListPdfColumns } from "../columns/custodianListPdfColumns";

export function CustodianListPDF({ custodians = [] }) {
  return (
    <PDFLayout title="CUSTODIAN LIST" formCode="BulSU-OP-CICT-14F3">
      <MetaRows
        rows={[
          [
            `TOTAL CUSTODIANS: ${custodians.length}`,
            `DATE: ${new Date().toLocaleDateString()}`,
          ],
        ]}
      />
      <PDFTable
        columns={custodianListPdfColumns}
        rows={custodians}
        footer={
          <Signatures
            signers={[
              { label: "Prepared by:", caption: "Signature Over Printed Name" },
              {
                label: "Noted by:",
                caption: "Signature Over Printed Name of Admin",
              },
            ]}
          />
        }
      />
    </PDFLayout>
  );
}
