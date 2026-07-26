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
import { formatDate } from "../../utils/date";

const REPORT_TYPE_LABELS = {
  damaged: "DAMAGED",
  missing: "MISSING",
};

const REPORT_TYPE_COLORS = {
  damaged: "#860100",
  missing: "#8a5c00",
};

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

  // ── Meta rows (Log Name / Generated Date) ──
  metaRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#000",
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

  // ── Summary strip ──
  summaryRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#000",
  },
  summaryCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: "#000",
    alignItems: "center",
  },
  summaryCellLast: {
    flex: 1,
    padding: 6,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#333",
    marginTop: 2,
    textAlign: "center",
  },
  summaryValueFlag: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#860100",
  },

  // ── Table ──
  table: {
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    marginTop: 10,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f2f2f2",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 22,
  },
  colReportNo: {
    width: "13%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colDescription: {
    width: "38%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colType: {
    width: "15%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colLocation: {
    width: "20%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colDate: {
    width: "14%",
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
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
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

export function ReportLogPDF({ reportLog, reports, preparedByName }) {
  const rows = (reports ?? []).map((report) => ({
    report_no: report.report_no || "—",
    description: report.description || "",
    type: report.type || "unknown",
    location: report.location || "—",
    created_at: report.created_at,
  }));

  // Fill with empty rows if needed
  while (rows.length < MIN_ROWS) {
    rows.push({ type: "" });
  }

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
          <Text style={styles.title}>ASSET REPORT LOG</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>
              LOG NAME: {reportLog?.log_name}
            </Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE: {formatDate(reportLog?.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValue}>
              {reportLog?.report_count ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>TOTAL REPORTS</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.summaryValueFlag}>
              {reportLog?.damaged_count ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>DAMAGED</Text>
          </View>
          <View style={styles.summaryCellLast}>
            <Text style={styles.summaryValueFlag}>
              {reportLog?.missing_count ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>MISSING</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colReportNo}>
              <Text style={styles.headerCellText}>REPORT NO.</Text>
            </View>
            <View style={styles.colDescription}>
              <Text style={styles.headerCellText}>DESCRIPTION</Text>
            </View>
            <View style={styles.colType}>
              <Text style={styles.headerCellText}>TYPE</Text>
            </View>
            <View style={styles.colLocation}>
              <Text style={styles.headerCellText}>LOCATION</Text>
            </View>
            <View style={styles.colDate}>
              <Text style={styles.headerCellText}>DATE</Text>
            </View>
          </View>

          {rows.map((row, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.colReportNo}>
                <Text style={styles.cellText}>{row.report_no}</Text>
              </View>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>{row.description}</Text>
              </View>
              <View style={styles.colType}>
                <Text
                  style={[
                    styles.statusText,
                    { color: REPORT_TYPE_COLORS[row.type] || "#000" },
                  ]}
                >
                  {REPORT_TYPE_LABELS[row.type] || ""}
                </Text>
              </View>
              <View style={styles.colLocation}>
                <Text style={styles.cellText}>{row.location}</Text>
              </View>
              <View style={styles.colDate}>
                <Text style={styles.cellText}>
                  {row.created_at ? formatDate(row.created_at) : ""}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Prepared by:</Text>
            <Text style={styles.signatureName}>
              {preparedByName || "_____________________"}
            </Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Noted by:</Text>
            <Text style={styles.signatureName}>_____________________</Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Property Custodian
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
