import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { roomListPdfColumns } from "../columns/roomListPdfColumns";

export function RoomListPDF({ rooms = [] }) {
  const totalAssets = rooms.reduce((sum, r) => sum + (r.assetCount || 0), 0);

  return (
    <PDFLayout title="ROOM LIST" formCode="BulSU-OP-CICT-14F4">
      <MetaRows
        rows={[
          [
            `TOTAL ROOMS: ${rooms.length}`,
            `DATE: ${new Date().toLocaleDateString()}`,
          ],
        ]}
      />
      <PDFTable
        columns={roomListPdfColumns}
        rows={rooms}
        totalRow={{ name: "TOTAL", assets: totalAssets }}
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
