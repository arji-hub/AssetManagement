// Header image + footer image (both every page), title + form code on page 1,
// "Page X of Y" on every page.
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import headerImg from "../../assets/PDFTemplate/Header.png";
import footerImg from "../../assets/PDFTemplate/Footer.png";
import { styles } from "./pdfStyles";

function Header() {
  return (
    <View style={styles.headerWrap} fixed>
      <Image src={headerImg} style={styles.headerImage} />
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footerWrap} fixed>
      <Image src={footerImg} style={styles.footerImage} />
    </View>
  );
}

function PageNumber() {
  return (
    <Text
      style={styles.pageNumber}
      fixed
      render={({ pageNumber, totalPages }) =>
        `Page ${pageNumber} of ${totalPages}`
      }
    />
  );
}

export function PDFLayout({ title, formCode, children }) {
  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {formCode ? <Text style={styles.formCode}>{formCode}</Text> : null}
        </View>

        {children}

        <Footer />
        <PageNumber />
      </Page>
    </Document>
  );
}
