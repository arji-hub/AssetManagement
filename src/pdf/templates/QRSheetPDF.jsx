// src/pdf/templates/QRSheetPDF.jsx
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { SHEET_LAYOUTS } from "../../utils/qrExport";

// A4 in points, with ~10mm page padding
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const PAGE_PADDING = 28;
const INNER_W = PAGE_W - PAGE_PADDING * 2;
// small buffer so a full grid never spills onto a blank extra page
const INNER_H = PAGE_H - PAGE_PADDING * 2 - 2;

const styles = StyleSheet.create({
  page: {
    padding: PAGE_PADDING,
    fontFamily: "Helvetica",
    color: "#000",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  // dashed border doubles as the cut guide for the sticker
  cell: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#b5b5b5",
    borderStyle: "dashed",
  },
  id: {
    marginTop: 6,
    fontWeight: "bold",
    textAlign: "center",
  },
});

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export function QRSheetPDF({ assets = [], size = "small" }) {
  const layout = SHEET_LAYOUTS[size] ?? SHEET_LAYOUTS.small;

  const cellW = Math.floor(INNER_W / layout.cols);
  const cellH = Math.floor(INNER_H / layout.rows);

  // never let the QR outgrow its cell (leaves room for the ID underneath)
  const qrSize = Math.min(layout.qrPt, cellW - 16, cellH - layout.idPt - 28);

  const pages = chunk(assets, layout.cols * layout.rows);
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((group, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.grid}>
            {group.map((asset) => (
              <View
                key={asset.id}
                style={[styles.cell, { width: cellW, height: cellH }]}
                wrap={false}
              >
                <Image
                  src={asset.qr_code_url}
                  style={{ width: qrSize, height: qrSize }}
                />
                <Text style={[styles.id, { fontSize: layout.idPt }]}>
                  {asset.id}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
