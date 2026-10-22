import { Text } from "@react-pdf/renderer";
import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { styles } from "../styles/pdfStyles";
import { roomInventoryPdfColumns } from "../columns/roomInventoryPdfColumns";

const CERTIFICATION =
  "This certifies that the equipment listed above was inventoried in the room indicated on the date shown.";

// Fixed format so the date doesn't vary with the viewer's browser locale.
const today = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function RoomInventoryPDF({ roomName, assets = [] }) {
  return (
    <PDFLayout
      title="ROOM EQUIPMENT INVENTORY FORM"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Room details</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Room name", value: roomName },
            { label: "Date prepared", value: today() },
          ],
          [{ label: "Total equipment", value: assets.length }],
        ]}
      />

      <SectionLabel>Equipment inventory</SectionLabel>
      <PDFTable
        columns={roomInventoryPdfColumns}
        rows={assets}
        zebra
        headerFill
        summary={`Total equipment: ${assets.length}`}
        footer={
          <>
            <Text style={styles.certification}>{CERTIFICATION}</Text>
            <Signatures
              signers={[
                {
                  label: "Prepared by:",
                  caption: "Signature Over Printed Name of Technician",
                },
              ]}
            />
          </>
        }
      />
    </PDFLayout>
  );
}
