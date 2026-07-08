import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "./pdfStyles";

export function PDFLayout({ title, subtitle, children }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {children}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} • Generated ${new Date().toLocaleString()}`
          }
        />
      </Page>
    </Document>
  );
}
