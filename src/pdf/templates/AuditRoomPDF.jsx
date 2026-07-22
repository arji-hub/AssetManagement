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
import useAuditRoomPDF from "../../hooks/audit/useAuditRoomPDF";
import { AUDIT_STATUS_LABELS, AUDIT_STATUS_COLORS } from "../../data/audit";

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

  // ── Meta rows (Room / Audit No / Date / Auditor) ──
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
  colSerial: {
    width: "20%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colDescription: {
    width: "32%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colCategory: {
    width: "16%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colCustodian: {
    width: "20%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colAuditStatus: {
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
  cellTextBreak: {
    fontSize: 9,
    wordBreak: "break-all",
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
const FORM_CODE = "BulSU-OP-CICT-14F3";
const REVISION = "0";

// react-pdf's Text only breaks lines at spaces/hyphens by default, so a long
// unbroken serial number just overflows the cell instead of wrapping. Force
// an actual line break every few characters so it's guaranteed to wrap.
function insertSoftBreaks(text, chunkSize = 20) {
  if (!text) return text;
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [text];
  return chunks.join("\n");
}

export function AuditRoomPDF({ auditID }) {
  const {
    audit,
    items,
    discrepancyItems,
    loading,
    error,
    roomName,
    auditNo,
    auditedByName,
    completedAt,
    totalAssets,
    auditedCount,
    discrepancyCount,
    hasDiscrepancies,
    status,
    roomCustodian,
  } = useAuditRoomPDF(auditID);

  // Show loading or error state
  if (loading) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Loading audit data...</Text>
        </Page>
      </Document>
    );
  }

  if (error) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ color: "#b30000" }}>Error: {error}</Text>
        </Page>
      </Document>
    );
  }

  // Prepare rows for table
  const rows = items.map((item) => ({
    serial: insertSoftBreaks(item.serial_number) || "—",
    description: item.description || "",
    category: item.category || "",
    custodian: item.custodian || "—",
    audit_status: item.audit_status || "not_audited",
  }));

  // Append discrepancy items (missing / misplaced / unexpected) after audited items
  discrepancyItems.forEach((item) => {
    rows.push({
      serial: insertSoftBreaks(item.serial_number) || "—",
      description: item.description || "",
      category: item.category || "",
      custodian: item.custodian || "—",
      audit_status: item.type || item.audit_status || "unexpected",
    });
  });

  // Fill with empty rows if needed
  while (rows.length < MIN_ROWS) {
    rows.push({ audit_status: "" });
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
          <Text style={styles.title}>ROOM ASSET AUDIT REPORT</Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ROOM NAME: {roomName}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>AUDIT NO.: {auditNo}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>AUDITED BY: {auditedByName}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE : {formatDate(completedAt)}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>TOTAL ASSETS: {totalAssets}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DISCREPANCIES FOUND: {discrepancyCount}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.colSerial}>
              <Text style={styles.headerCellText}>SERIAL NO./ MODEL NO.</Text>
            </View>
            <View style={styles.colDescription}>
              <Text style={styles.headerCellText}>DESCRIPTION</Text>
            </View>
            <View style={styles.colCategory}>
              <Text style={styles.headerCellText}>CATEGORY</Text>
            </View>
            <View style={styles.colCustodian}>
              <Text style={styles.headerCellText}>CUSTODIAN</Text>
            </View>
            <View style={styles.colAuditStatus}>
              <Text style={styles.headerCellText}>STATUS</Text>
            </View>
          </View>

          {rows.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.colSerial}>
                <Text style={styles.cellTextBreak}>{item.serial}</Text>
              </View>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>{item.description}</Text>
              </View>
              <View style={styles.colCategory}>
                <Text style={styles.cellText}>{item.category}</Text>
              </View>
              <View style={styles.colCustodian}>
                <Text style={styles.cellText}>{item.custodian}</Text>
              </View>
              <View style={styles.colAuditStatus}>
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: AUDIT_STATUS_COLORS[item.audit_status] || "#000",
                    },
                  ]}
                >
                  {AUDIT_STATUS_LABELS[item.audit_status] || ""}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Audited by:</Text>
            <Text style={styles.signatureName}>
              {auditedByName && auditedByName !== "—"
                ? auditedByName
                : "_____________________"}
            </Text>
            <Text style={styles.signatureCaption}>
              Signature Over Printed Name of Auditor
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
