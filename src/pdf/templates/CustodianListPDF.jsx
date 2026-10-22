import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { custodianListPdfColumns } from "../columns/custodianListPdfColumns";

// Fixed format so the date doesn't vary with the viewer's browser locale.
const today = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function CustodianListPDF({ custodians = [] }) {
  const totalAssets = custodians.reduce(
    (sum, c) => sum + (c.asset_count || 0),
    0,
  );

  return (
    <PDFLayout
      title="CUSTODIAN LIST"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Summary</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Total custodians", value: custodians.length },
            { label: "Total assets assigned", value: totalAssets },
            { label: "Date prepared", value: today() },
          ],
        ]}
      />

      <SectionLabel>Custodians</SectionLabel>
      <PDFTable
        columns={custodianListPdfColumns}
        rows={custodians}
        zebra
        headerFill
        summary={`Total custodians: ${custodians.length}  |  Total assets: ${totalAssets}`}
        footer={
          <Signatures
            signers={[
              { label: "Prepared by:", caption: "Signature Over Printed Name" },
            ]}
          />
        }
      />
    </PDFLayout>
  );
}
