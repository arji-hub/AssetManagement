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

  // ── Meta row (Log Name / Generated Date) ──
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
  tableGap: {
    height: 10,
  },
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
  colRoom: {
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
  cellTextItalic: {
    fontStyle: "italic",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
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
    justifyContent: "flex-end",
    alignItems: "center",
  },
  signatureName: {
    fontSize: 9,
    fontWeight: "bold",
    paddingBottom: 2,
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

const FORM_CODE = "BulSU-OP-CICT-14F4";
const REVISION = "0";
const TAIL_ROWS = 3; // last rows that always travel with the signatures

const renderRow = (row, index) => (
  <View style={styles.tableRow} key={index} wrap={false}>
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
    <View style={styles.colRoom}>
      <Text
        style={[
          styles.cellText,
          row.room === "Unallocated" && styles.cellTextItalic,
        ]}
      >
        {row.room}
      </Text>
    </View>
    <View style={styles.colDate}>
      <Text style={styles.cellText}>
        {row.created_at ? formatDate(row.created_at) : ""}
      </Text>
    </View>
  </View>
);

export function ReportLogPDF({ reportLog, reports, preparedByName }) {
  const rows = (reports ?? []).map((report) => ({
    report_no: report.report_no || "—",
    description: report.description || "",
    type: report.type || "unknown",
    room: report.room_name || "Unallocated",
    created_at: report.created_at,
  }));

  const safeRows = rows.length ? rows : [{ type: "" }]; // never an empty table
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
          <Text style={styles.title}>ASSET REPORT LOG</Text>
        </View>

        {/* Meta row */}
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

        {/* Summary strip */}
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

        {/* Gap between summary and table (page 1 only) */}
        <View style={styles.tableGap} />

        {/* Top line: repeats at the top of every page */}
        <View style={styles.tableTopLine} fixed />

        {/* Column header: page 1 only */}
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
          <View style={styles.colRoom}>
            <Text style={styles.headerCellText}>ROOM</Text>
          </View>
          <View style={styles.colDate}>
            <Text style={styles.headerCellText}>DATE</Text>
          </View>
        </View>

        {/* Data rows */}
        {bodyRows.map(renderRow)}

        {/* Last rows + signatures stay together on one page */}
        <View wrap={false}>
          {tailRows.map((row, i) => renderRow(row, splitAt + i))}

          <View style={styles.signatureWrap}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Prepared by:</Text>
                <View style={styles.signatureLine}>
                  {preparedByName ? (
                    <Text style={styles.signatureName}>{preparedByName}</Text>
                  ) : null}
                </View>
                <Text style={styles.signatureCaption}>
                  Signature Over Printed Name
                </Text>
              </View>
              <View style={styles.signatureBlock}>
                <Text style={styles.signatureLabel}>Noted by:</Text>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureCaption}>
                  Signature Over Printed Name of Property Custodian
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
