import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
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

  letterheadDivider: {
    borderBottomWidth: 1.5,
    borderColor: "#860100",
    marginTop: 8,
    marginBottom: 12,
  },

  titleWrap: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // ── Meta row (Custodian / Date) ──
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
  colName: {
    width: "34%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colCategory: {
    width: "22%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colRoom: {
    width: "18%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colStatus: {
    width: "14%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colDate: {
    width: "12%",
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
const FORM_CODE = "BulSU-OP-CICT-14F3";
const REVISION = "0";

function formatCellDate(value) {
  if (!value) return "";
  const d = value?.toDate ? value.toDate() : new Date(value);
  return isNaN(d) ? "" : d.toLocaleDateString();
}

export function CustodianInventoryPDF({ custodianName, assets = [] }) {
  const rows = assets.map((a) => ({
    name: a.description || "",
    category: a.category_id || "",
    room: a.room_id || "",
    status: a.status || "",
    date: formatCellDate(a.created_at),
  }));

  while (rows.length < MIN_ROWS) rows.push({});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead */}
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
          <Text style={styles.title}>CUSTODIAN ASSET ACCOUNTABILITY FORM</Text>
        </View>

        {/* Custodian / Date */}
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>
              CUSTODIAN: {custodianName || "—"}
            </Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colName}>
              <Text style={styles.headerCellText}>ASSET NAME</Text>
            </View>
            <View style={styles.colCategory}>
              <Text style={styles.headerCellText}>CATEGORY</Text>
            </View>
            <View style={styles.colRoom}>
              <Text style={styles.headerCellText}>ROOM</Text>
            </View>
            <View style={styles.colStatus}>
              <Text style={styles.headerCellText}>STATUS</Text>
            </View>
            <View style={styles.colDate}>
              <Text style={styles.headerCellText}>DATE ASSIGNED</Text>
            </View>
          </View>

          {rows.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.colName}>
                <Text style={styles.cellText}>{item.name}</Text>
              </View>
              <View style={styles.colCategory}>
                <Text style={styles.cellText}>{item.category}</Text>
              </View>
              <View style={styles.colRoom}>
                <Text style={styles.cellText}>{item.room}</Text>
              </View>
              <View style={styles.colStatus}>
                <Text style={styles.cellText}>{item.status}</Text>
              </View>
              <View style={styles.colDate}>
                <Text style={styles.cellText}>{item.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Signatures */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Prepared by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Custodian
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Noted by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Property Officer
            </Text>
          </View>
        </View>

        {/* Footer */}
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