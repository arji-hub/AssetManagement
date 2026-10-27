// Header image + footer image (both every page), title + form code on page 1,
// "Page X of Y" on every page.
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import defaultHeaderImg from "../../assets/PDFTemplate/Header.png";
import defaultFooterImg from "../../assets/PDFTemplate/Footer.png";
import { usePDFAssets } from "../renderer/pdfAssetsContext";
import { styles } from "./pdfStyles";

function Header({ src }) {
  return (
    <View style={styles.headerWrap} fixed>
      <Image src={src} style={styles.headerImage} />
    </View>
  );
}

function Footer({ src }) {
  return (
    <View style={styles.footerWrap} fixed>
      <Image src={src} style={styles.footerImage} />
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

// headerSrc / footerSrc come from fetchHeaderFooterSources() in the caller.
// They are optional: without them the bundled defaults are used.
export function PDFLayout({ title, formCode, children }) {
  const { headerSrc, footerSrc } = usePDFAssets();
  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        <Header src={headerSrc || defaultHeaderImg} />
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {formCode ? <Text style={styles.formCode}>{formCode}</Text> : null}
        </View>

        {children}

        <Footer src={footerSrc || defaultFooterImg} />
        <PageNumber />
      </Page>
    </Document>
  );
}
