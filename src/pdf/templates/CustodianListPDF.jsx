// src/pdf/templates/CustodianListPDF.jsx
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
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 64, // room for the fixed footer
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
  },

  // ── Form title ──
  titleWrap: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // ── Meta row (Date / Total Count) ──
  // No bottom border: the table top line draws it
  metaRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
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
  // Thin line that repeats at the top of every page (fixed)
  tableTopLine: {
    borderTopWidth: 1,
    borderColor: "#000",
  },
  // Header prints on page 1 only
  tableHeaderRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 22,
  },
  colNo: {
    width: "5%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  colName: {
    width: "35%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colEmail: {
    width: "30%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colRole: {
    width: "15%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colAssets: {
    width: "15%",
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
  signatureWrap: {
    marginTop: 40,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "45%",
    alignItems: "flex-start",
  },
  signatureLabel: {
    fontSize: 9,
  },
  signatureLine: {
    width: "100%",
    height: 30,
    borderBottomWidth: 1,
    borderColor: "#000",
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

const FORM_CODE = "BulSU-OP-CICT-14F3";
const REVISION = "0";
const TAIL_ROWS = 3; // last rows that always travel with the signatures

const ROLE_LABELS = {
  admin: "Admin",
  fulltime: "Full-time Faculty",
  parttime: "Part-time Faculty",
};

function formatRole(role) {
  return ROLE_LABELS[role] || role || "";
}

// `index` is the row's position in the whole list, so numbering keeps going
// across the body rows and the tail rows.
const renderRow = (item, index) => (
  <View style={styles.tableRow} key={index} wrap={false}>
    <View style={styles.colNo}>
      <Text style={styles.cellTextCenter}>{item.name ? index + 1 : ""}</Text>
    </View>
    <View style={styles.colName}>
      <Text style={styles.cellText}>{item.name}</Text>
    </View>
    <View style={styles.colEmail}>
      <Text style={styles.cellText}>{item.email}</Text>
    </View>
    <View style={styles.colRole}>
      <Text style={styles.cellText}>{item.role}</Text>
    </View>
    <View style={styles.colAssets}>
      <Text style={styles.cellTextCenter}>{item.name ? item.assets : ""}</Text>
    </View>
  </View>
);

export function CustodianListPDF({ custodians = [] }) {
  const rows = custodians.map((c) => ({
    name: c.fullname || "",
    email: c.email || "",
    role: formatRole(c.role),
    assets: c.asset_count ?? 0,
  }));

  const safeRows = rows.length ? rows : [{}]; // never an empty table
  const splitAt = Math.max(0, safeRows.length - TAIL_ROWS);
  const bodyRows = safeRows.slice(0, splitAt);
  const tailRows = safeRows.slice(splitAt);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Letterhead (page 1 only) */}
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
          <Text style={styles.title}>CUSTODIAN LIST</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>
              TOTAL CUSTODIANS: {custodians.length}
            </Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Top line: repeats at the top of every page */}
        <View style={styles.tableTopLine} fixed />

        {/* Column header: page 1 only */}
        <View style={styles.tableHeaderRow}>
          <View style={styles.colNo}>
            <Text style={styles.headerCellText}>NO.</Text>
          </View>
          <View style={styles.colName}>
            <Text style={styles.headerCellText}>NAME</Text>
          </View>
          <View style={styles.colEmail}>
            <Text style={styles.headerCellText}>EMAIL</Text>
          </View>
          <View style={styles.colRole}>
            <Text style={styles.headerCellText}>CLASSIFICATION</Text>
          </View>
          <View style={styles.colAssets}>
            <Text style={styles.headerCellText}>TOTAL ASSETS</Text>
          </View>
        </View>

        {/* Data rows */}
        {bodyRows.map(renderRow)}

        {/* Last rows + signatures stay together on one page */}
        <View wrap={false}>
          {tailRows.map((item, i) => renderRow(item, splitAt + i))}

          <View style={styles.signatureWrap}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Prepared by:</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureCaption}>
                  Signature Over Printed Name
                </Text>
              </View>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Noted by:</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureCaption}>
                  Signature Over Printed Name of Admin
                </Text>
              </View>
            </View>
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
