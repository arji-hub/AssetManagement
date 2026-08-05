// src/pdf/templates/RoomListPDF.jsx
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import cictLogo from "../../assets/logo/CICTLOGO.png";
import bulsuLogo from "../../assets/logo/BULSULOGO.png";

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

  // ── Meta row (Total Rooms / Date) ──
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
  colNo: {
    width: "6%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  colName: {
    width: "32%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colCustodian: {
    width: "32%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colAssets: {
    width: "30%",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCellText: {
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
  },
  cellText: {
    fontSize: 9,
  },
  cellTextCenter: {
    fontSize: 9,
    textAlign: "center",
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
const FORM_CODE = "BulSU-OP-CICT-14F4";
const REVISION = "0";

export function RoomListPDF({ rooms = [] }) {
  const rows = rooms.map((r) => ({
    name: r.name || "",
    custodian: r.roomCustodian || "",
    assets: r.assetCount ?? 0,
  }));

  const totalAssets = rooms.reduce((sum, r) => sum + (r.assetCount || 0), 0);

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
          <Text style={styles.title}>ROOM LIST</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>TOTAL ROOMS: {rooms.length}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colNo}>
              <Text style={styles.headerCellText}>NO.</Text>
            </View>
            <View style={styles.colName}>
              <Text style={styles.headerCellText}>ROOM NAME</Text>
            </View>
            <View style={styles.colCustodian}>
              <Text style={styles.headerCellText}>ROOM CUSTODIAN</Text>
            </View>
            <View style={styles.colAssets}>
              <Text style={styles.headerCellText}>TOTAL ASSETS</Text>
            </View>
          </View>

          {rows.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.colNo}>
                <Text style={styles.cellTextCenter}>
                  {item.name ? index + 1 : ""}
                </Text>
              </View>
              <View style={styles.colName}>
                <Text style={styles.cellText}>{item.name}</Text>
              </View>
              <View style={styles.colCustodian}>
                <Text style={styles.cellText}>{item.custodian}</Text>
              </View>
              <View style={styles.colAssets}>
                <Text style={styles.cellTextCenter}>
                  {item.name ? item.assets : ""}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.tableRow}>
            <View style={styles.colNo}>
              <Text style={styles.cellText}></Text>
            </View>
            <View style={styles.colName}>
              <Text style={[styles.cellText, { fontWeight: "bold" }]}>
                TOTAL
              </Text>
            </View>
            <View style={styles.colCustodian}>
              <Text style={styles.cellText}></Text>
            </View>
            <View style={styles.colAssets}>
              <Text style={[styles.cellTextCenter, { fontWeight: "bold" }]}>
                {totalAssets}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Prepared by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Noted by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Admin
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
