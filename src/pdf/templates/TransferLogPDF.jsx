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

  // ── Meta rows (From / To / Notes / Asset count / Date) ──
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
  metaCellFull: {
    flex: 1,
    padding: 6,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "bold",
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
  colItemNo: {
    width: "12%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colAssetId: {
    width: "33%",
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
  },
  colDescription: {
    width: "55%",
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
  cellTextCenter: {
    fontSize: 9,
    textAlign: "center",
  },
  cellTextBreak: {
    fontSize: 9,
    wordBreak: "break-all",
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

const FORM_CODE = "BulSU-OP-CICT-14F4"; // TODO: replace with the real form code
const REVISION = "0";
const TAIL_ROWS = 3; // last rows that always travel with the signatures

// react-pdf's Text only breaks lines at spaces/hyphens by default, so a long
// unbroken asset ID just overflows the cell instead of wrapping. Force an
// actual line break every few characters so it's guaranteed to wrap.
function insertSoftBreaks(text, chunkSize = 20) {
  if (!text) return text;
  const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, "g")) || [text];
  return chunks.join("\n");
}

const renderRow = (row, index) => (
  <View style={styles.tableRow} key={index} wrap={false}>
    <View style={styles.colItemNo}>
      <Text style={styles.cellTextCenter}>{row.itemNo}</Text>
    </View>
    <View style={styles.colAssetId}>
      <Text style={styles.cellTextBreak}>{row.assetId}</Text>
    </View>
    <View style={styles.colDescription}>
      <Text style={styles.cellText}>{row.description}</Text>
    </View>
  </View>
);

/**
 * Transfer report – render only for completed requests.
 *
 * Props: request, items (getRequestItems(request)), ackAdmin, ackFrom, ackTo
 * (from useTransferInfo), plus optional fromLabel / toLabel for local MR types.
 */
export function TransferLogPDF({
  request,
  items = [],
  ackAdmin,
  ackFrom,
  ackTo,
  fromLabel = "FROM CUSTODIAN",
  toLabel = "TO CUSTODIAN",
}) {
  const rows = items.map((item, index) => ({
    itemNo: String(index + 1),
    assetId: insertSoftBreaks(item.asset_id) || "—",
    description: item.asset_description || "",
  }));

  const safeRows = rows.length
    ? rows
    : [{ itemNo: "", assetId: "", description: "" }]; // never an empty table
  const splitAt = Math.max(0, safeRows.length - TAIL_ROWS);
  const bodyRows = safeRows.slice(0, splitAt);
  const tailRows = safeRows.slice(splitAt);

  // Admin always signs. From / To only get a block when they exist, so the
  // form has 2 or 3 signatories.
  const signers = [
    {
      label: "Approved by:",
      caption: "Signature Over Printed Name of Admin",
      name: ackAdmin?.name,
    },
    ackFrom?.name
      ? {
          label: "Released by:",
          caption: "Signature Over Printed Name of Custodian",
          name: ackFrom.name,
        }
      : null,
    ackTo?.name
      ? {
          label: "Received by:",
          caption: "Signature Over Printed Name of Custodian",
          name: ackTo.name,
        }
      : null,
  ].filter(Boolean);

  const blockWidth = signers.length === 3 ? "30%" : "45%";

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
          <Text style={styles.title}>INVENTORY TRANSFER REPORT</Text>
        </View>

        {/* Meta rows */}
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>
              {fromLabel}: {ackFrom?.name || "—"}
            </Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              {toLabel}: {ackTo?.name || "—"}
            </Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaCellFull}>
            <Text style={styles.metaLabel}>NOTES: {request?.notes || "—"}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ASSET COUNT: {items.length}</Text>
          </View>
          <View style={styles.metaCellLast}>
            <Text style={styles.metaLabel}>
              DATE : {formatDate(request?.completed_at)}
            </Text>
          </View>
        </View>

        {/* Gap between meta and table (page 1 only) */}
        <View style={styles.tableGap} />

        {/* Top line: repeats at the top of every page */}
        <View style={styles.tableTopLine} fixed />

        {/* Column header: page 1 only */}
        <View style={styles.tableHeaderRow}>
          <View style={styles.colItemNo}>
            <Text style={styles.headerCellText}>ITEM NO.</Text>
          </View>
          <View style={styles.colAssetId}>
            <Text style={styles.headerCellText}>ASSET ID</Text>
          </View>
          <View style={styles.colDescription}>
            <Text style={styles.headerCellText}>DESCRIPTION</Text>
          </View>
        </View>

        {/* Data rows */}
        {bodyRows.map(renderRow)}

        {/* Last rows + signatures stay together on one page */}
        <View wrap={false}>
          {tailRows.map((row, i) => renderRow(row, splitAt + i))}

          <View style={styles.signatureWrap}>
            <View style={styles.signatureRow}>
              {signers.map((s) => (
                <View
                  style={[styles.signatureBlock, { width: blockWidth }]}
                  key={s.label}
                >
                  <Text style={styles.signatureLabel}>{s.label}</Text>
                  <View style={styles.signatureLine}>
                    {s.name ? (
                      <Text style={styles.signatureName}>{s.name}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.signatureCaption}>{s.caption}</Text>
                </View>
              ))}
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
