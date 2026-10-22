import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { custodianInventoryPdfColumns } from "../columns/custodianInventoryPdfColumns";

export function CustodianInventoryPDF({ custodianName, assets = [] }) {
  return (
    <PDFLayout
      title="CUSTODIAN ASSET ACCOUNTABILITY FORM"
      formCode="BulSU-OP-CICT-14F3"
    >
      <MetaRows
        rows={[
          [
            `CUSTODIAN: ${custodianName || "—"}`,
            `DATE: ${new Date().toLocaleDateString()}`,
          ],
        ]}
      />
      <PDFTable
        columns={custodianInventoryPdfColumns}
        rows={assets}
        footer={
          <Signatures
            signers={[
              {
                label: "Prepared by:",
                caption: "Signature Over Printed Name of Custodian",
              },
              {
                label: "Noted by:",
                caption: "Signature Over Printed Name of Property Officer",
              },
            ]}
          />
        }
      />
    </PDFLayout>
  );
}
