import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDFLayout } from "../styles/PDFLayout";
import { MetaRows, PDFTable } from "../styles/PDFTable";
import { Signatures } from "../styles/PDFSignature";
import { reportLogPdfColumns } from "../columns/reportLogPdfColumns";

import { formatDate } from "../../utils/date";

// Only this form has a summary strip, so its styles stay local.
const local = StyleSheet.create({
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
  summaryCellLast: { flex: 1, padding: 6, alignItems: "center" },
  summaryValue: { fontSize: 12, fontWeight: "bold" },
  summaryValueFlag: { fontSize: 12, fontWeight: "bold", color: "#860100" },
  summaryLabel: {
    fontSize: 7,
    color: "#333",
    marginTop: 2,
    textAlign: "center",
  },
});

function SummaryStrip({ items }) {
  return (
    <View style={local.summaryRow}>
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
  return (
    <PDFLayout title="ASSET REPORT LOG" formCode="BulSU-OP-CICT-14F4">
      <MetaRows
        rows={[
          [
            `LOG NAME: ${reportLog?.log_name}`,
            `DATE: ${formatDate(reportLog?.created_at)}`,
          ],
        ]}
      />
      <SummaryStrip
        items={[
          { label: "TOTAL REPORTS", value: reportLog?.report_count ?? 0 },
          {
            label: "DAMAGED",
            value: reportLog?.damaged_count ?? 0,
            flag: true,
          },
          {
            label: "MISSING",
            value: reportLog?.missing_count ?? 0,
            flag: true,
          },
        ]}
      />
      <PDFTable
        columns={reportLogPdfColumns}
        rows={reports ?? []}
        footer={
          <Signatures
            signers={[
              {
                label: "Prepared by:",
                caption: "Signature Over Printed Name",
                name: preparedByName,
              },
              {
                label: "Noted by:",
                caption: "Signature Over Printed Name of Property Custodian",
              },
            ]}
          />
        }
      />
    </PDFLayout>
  );
}
