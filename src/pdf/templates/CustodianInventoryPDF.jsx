import { Text } from "@react-pdf/renderer";
import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { styles } from "../styles/pdfStyles";
import { custodianInventoryPdfColumns } from "../columns/custodianInventoryPdfColumns";

const CERTIFICATION =
  "I acknowledge receipt of the assets listed above and accept responsibility for their proper use, care, and safekeeping.";

// Fixed format so the date doesn't vary with the viewer's browser locale.
const today = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function CustodianInventoryPDF({ custodianName, assets = [] }) {
  return (
    <PDFLayout
      title="CUSTODIAN ASSET ACCOUNTABILITY FORM"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Custodian details</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Custodian", value: custodianName },
            { label: "Date prepared", value: today() },
          ],
          [{ label: "Total assets assigned", value: assets.length }],
        ]}
      />

      <SectionLabel>Assigned assets</SectionLabel>
      <PDFTable
        columns={custodianInventoryPdfColumns}
        rows={assets}
        zebra
        headerFill
        summary={`Total assets: ${assets.length}`}
        footer={
          <>
            <Text style={styles.certification}>{CERTIFICATION}</Text>
            <Signatures
              signers={[
                {
                  label: "Prepared by:",
                  caption: "Signature Over Printed Name of Custodian",
                  name: custodianName,
                },
              ]}
            />
          </>
        }
      />
    </PDFLayout>
  );
}
