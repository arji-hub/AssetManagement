import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { roomInventoryPdfColumns } from "../columns/roomInventoryPdfColumns";

export function RoomInventoryPDF({ roomName, assets = [] }) {
  return (
    <PDFLayout
      title="ROOM EQUIPMENT INVENTORY FORM"
      formCode="BulSU-OP-CICT-14F2"
    >
      <MetaRows
        rows={[
          [
            `ROOM NAME: ${roomName || "—"}`,
            `DATE: ${new Date().toLocaleDateString()}`,
          ],
        ]}
      />
      <PDFTable
        columns={roomInventoryPdfColumns}
        rows={assets}
        footer={
          <Signatures
            signers={[
              {
                label: "Prepared by:",
                caption: "Signature Over Printed Name of Technician",
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
