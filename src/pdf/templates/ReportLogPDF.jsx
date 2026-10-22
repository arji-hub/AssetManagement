import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDFLayout } from "../styles/PDFLayout";
import { MetaGrid, PDFTable, SectionLabel } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { COLORS, styles } from "../styles/pdfStyles";
import { reportLogPdfColumns } from "../columns/reportLogPdfColumns";

import { formatDate } from "../../utils/date";

const CERTIFICATION =
  "This certifies that the reports listed above are a true record of the damaged and missing assets reported under this log.";

// Only this form has a summary strip, so its styles stay local.
const local = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.black,
    marginTop: -1, // attaches to the details grid without a doubled border
  },
  summaryCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: COLORS.black,
    alignItems: "center",
  },
  summaryCellLast: { flex: 1, padding: 6, alignItems: "center" },
  summaryValue: { fontSize: 12, fontWeight: "bold" },
  summaryValueFlag: { fontSize: 12, fontWeight: "bold", color: COLORS.maroon },
  summaryLabel: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
});

function SummaryStrip({ items }) {
  return (
    <View style={local.summaryRow} wrap={false}>
      {items.map((s, i) => (
        <View
          key={s.label}
          style={
            i === items.length - 1 ? local.summaryCellLast : local.summaryCell
          }
        >
          <Text style={s.flag ? local.summaryValueFlag : local.summaryValue}>
            {s.value}
          </Text>
          <Text style={local.summaryLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportLogPDF({ reportLog, reports = [], preparedByName }) {
  const rows = reports ?? [];

  return (
    <PDFLayout
      title="ASSET REPORT LOG"
      formCode="College of Information and Communications Technology"
    >
      <SectionLabel>Log details</SectionLabel>
      <MetaGrid
        rows={[
          [
            { label: "Log name", value: reportLog?.log_name },
            {
              label: "Date",
              value: reportLog?.created_at
                ? formatDate(reportLog.created_at)
                : "",
            },
          ],
        ]}
      />
      <SummaryStrip
        items={[
          {
            label: "Total reports",
            value: reportLog?.report_count ?? rows.length,
          },
          {
            label: "Damaged",
            value: reportLog?.damaged_count ?? 0,
            flag: true,
          },
          {
            label: "Missing",
            value: reportLog?.missing_count ?? 0,
            flag: true,
          },
        ]}
      />

      <SectionLabel>Reported assets</SectionLabel>
      <PDFTable
        columns={reportLogPdfColumns}
        rows={rows}
        zebra
        headerFill
        summary={`Total reports: ${rows.length}`}
        footer={
          <>
            <Text style={styles.certification}>{CERTIFICATION}</Text>
            <Signatures
              signers={[
                {
                  label: "Prepared by:",
                  caption: "Signature Over Printed Name",
                  name: preparedByName,
                },
              ]}
            />
          </>
        }
      />
    </PDFLayout>
  );
}
