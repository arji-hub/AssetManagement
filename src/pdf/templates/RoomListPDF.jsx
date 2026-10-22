import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { roomListPdfColumns } from "../columns/roomListPdfColumns";

const today = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function RoomListPDF({ rooms = [] }) {
  const totalAssets = rooms.reduce((sum, r) => sum + (r.assetCount || 0), 0);

  return (
    <PDFLayout
      title="ROOM LIST"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Summary</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Total rooms", value: rooms.length },
            { label: "Total assets", value: totalAssets },
            { label: "Date prepared", value: today() },
          ],
        ]}
      />

      <SectionLabel>Rooms</SectionLabel>
      <PDFTable
        columns={roomListPdfColumns}
        rows={rooms}
        zebra
        headerFill
        totalRow={{ name: "TOTAL", assets: totalAssets }}
        footer={
          <Signatures
            signers={[
              {
                label: "Prepared by:",
                caption: "Signature Over Printed Name of Technician",
              },
            ]}
          />
        }
      />
    </PDFLayout>
  );
}
