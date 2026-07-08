// src/pdf/templates/RoomInventoryPDF.jsx
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import cictLogo from "../../assets/CICTLOGO.png";
import bulsuLogo from "../../assets/BULSULOGO.png";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#000",
  },

  // ── Letterhead ──
  letterheadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: {
    width: 55,
    height: 55,
  },
  letterheadText: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  republicText: {
    fontSize: 9,
    color: "#000",
  },
  universityText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#860100",
    marginTop: 1,
    letterSpacing: 0.3,
  },
  collegeText: {
    fontSize: 10,
    color: "#000",
    marginTop: 1,
  },
  cityText: {
    fontSize: 9,
    color: "#000",
    marginTop: 1,
  },

  // ── Divider under letterhead ──
  letterheadDivider: {
    borderBottomWidth: 1.5,
    borderColor: "#860100",
    marginTop: 8,
    marginBottom: 12,
  },

  // ── Form title ──
  titleWrap: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // ── Meta row (Room Name / Date) ──
  metaRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 10,
  },
  metaCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  metaCellLast: {
    flex: 1,
    padding: 6,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "bold",
  },

  // ── Table ──
  table: {
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f2f2f2",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 22,
  },
  colType: {
    width: "28%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colBrand: {
    width: "34%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colSerial: {
    width: "22%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colStatus: {
    width: "16%",
    padding: 5,
    justifyContent: "center",
  },
  headerCellText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  cellText: {
    fontSize: 9,
  },

  // ── Signatures ──
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  signatureBlock: {
    width: "45%",
    alignItems: "flex-start",
  },
  signatureLabel: {
    fontSize: 9,
    marginBottom: 30,
  },
  signatureName: {
    fontSize: 9,
    fontWeight: "bold",
  },
  signatureCaption: {
    fontSize: 7,
    color: "#333",
    marginTop: 2,
  },

  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#444",
  },
});

const MIN_ROWS = 14;
const FORM_CODE = "BulSU-OP-CICT-14F2";
const REVISION = "0";

export function RoomInventoryPDF({ roomName, assets = [] }) {
  const rows = assets.map((a) => ({
    type: a.category || "",
    brand: a.description || "",
    serial: a.serial_number || "",
    status: a.status || "",
  }));

  while (rows.length < MIN_ROWS) rows.push({});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.letterheadRow}>
          <Image src={cictLogo} style={styles.logo} />
          <View style={styles.letterheadText}>
            <Text style={styles.republicText}>Republic of the Philippines</Text>
            <Text style={styles.universityText}>BULACAN STATE UNIVERSITY</Text>
            <Text style={styles.collegeText}>
              College of Information and Communication Technology
            </Text>
            <Text style={styles.cityText}>City of Malolos</Text>
          </View>
          <Image src={bulsuLogo} style={styles.logo} />
        </View>
        <View style={styles.letterheadDivider} />

        <View style={styles.titleWrap}>
          <Text style={styles.title}>ROOM EQUIPMENT INVENTORY FORM</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ROOM NAME: {roomName || "—"}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colType}>
              <Text style={styles.headerCellText}>EQUIPMENT TYPE</Text>
            </View>
            <View style={styles.colBrand}>
              <Text style={styles.headerCellText}>BRAND/ DESCRIPTION</Text>
            </View>
            <View style={styles.colSerial}>
              <Text style={styles.headerCellText}>SERIAL NO./ MODEL NO.</Text>
            </View>
            <View style={styles.colStatus}>
              <Text style={styles.headerCellText}>STATUS</Text>
            </View>
          </View>

          {rows.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.colType}>
                <Text style={styles.cellText}>{item.type}</Text>
              </View>
              <View style={styles.colBrand}>
                <Text style={styles.cellText}>{item.brand}</Text>
              </View>
              <View style={styles.colSerial}>
                <Text style={styles.cellText}>{item.serial}</Text>
              </View>
              <View style={styles.colStatus}>
                <Text style={styles.cellText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Prepared by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Technician
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Noted by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Custodian
            </Text>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text>
            {FORM_CODE}
            {"\n"}Revision: {REVISION}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
