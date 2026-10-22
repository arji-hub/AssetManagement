import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  maroon: "#860100",
  black: "#000",
  muted: "#333",
};

export const PAGE_PADDING_TOP = 36;
export const PAGE_PADDING_X = 36;
export const FOOTER_RESERVE = 90;

export const styles = StyleSheet.create({
  page: {
    paddingTop: PAGE_PADDING_TOP,
    paddingHorizontal: PAGE_PADDING_X,
    paddingBottom: FOOTER_RESERVE,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: COLORS.black,
  },

  // ── Title ──
  titleWrap: { alignItems: "center", marginTop: 10, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: "bold", letterSpacing: 0.5 },

  // ── Meta rows ──
  metaRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.black,
  },
  metaCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderColor: COLORS.black,
  },
  metaCellLast: { flex: 1, padding: 6 },
  metaLabel: { fontSize: 9, fontWeight: "bold" },
  tableGap: { height: 10 },

  // ── Table ──
  tableTopLine: { borderTopWidth: 1, borderColor: COLORS.black }, // fixed: repeats every page
  tableHeaderRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.black,
  },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.black,
    minHeight: 22,
  },
  cell: { padding: 5, justifyContent: "center", borderColor: COLORS.black },
  cellDivider: { borderRightWidth: 1 },
  cellCenterAlign: { alignItems: "center" },
  headerCellText: { fontSize: 8, fontWeight: "bold", textAlign: "center" },
  cellText: { fontSize: 9 },
  textCenter: { textAlign: "center" },
  textBold: { fontWeight: "bold" },

  // ── Signatures ──
  signatureWrap: { marginTop: 40 },
  signatureRow: { flexDirection: "row", justifyContent: "space-between" },
  signatureBlock: { alignItems: "flex-start" },
  signatureLabel: { fontSize: 9 },
  signatureLine: {
    width: "100%",
    height: 30,
    borderBottomWidth: 1,
    borderColor: COLORS.black,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  signatureName: { fontSize: 9, fontWeight: "bold", paddingBottom: 2 },
  signatureCaption: { fontSize: 7, color: COLORS.muted, marginTop: 2 },

  headerWrap: {
    marginTop: -PAGE_PADDING_TOP,
    marginHorizontal: -PAGE_PADDING_X,
  },
  headerImage: { width: "100%" },
  footerWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },
  footerImage: { width: "100%" },
});
