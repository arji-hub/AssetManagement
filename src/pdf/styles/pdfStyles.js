import { StyleSheet } from "@react-pdf/renderer";

export const COLORS = {
  maroon: "#860100",
  golden: "#D4A017",
  black: "#000",
  muted: "#333",
  zebra: "#F7F7F7",
  headerFill: "#F2F2F2",
};

export const PAGE_PADDING_TOP = 36;
export const PAGE_PADDING_X = 36;
export const FOOTER_RESERVE = 90;
export const PAGE_NUMBER_BOTTOM = FOOTER_RESERVE - 14;

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

  formCode: { fontSize: 7, color: COLORS.muted, marginTop: 3 },

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

  sectionLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: COLORS.maroon,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  metaLabelSmall: {
    fontSize: 7,
    color: COLORS.muted,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: { fontSize: 10 },
  metaRowStacked: { marginTop: -1 },

  // ── Table ──
  tableTopLine: { borderTopWidth: 1, borderColor: COLORS.black },
  tableHeaderRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.black,
  },
  tableHeaderFill: { backgroundColor: COLORS.headerFill },
  tableRow: {
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.black,
    minHeight: 22,
  },
  tableRowAlt: { backgroundColor: COLORS.zebra },
  cell: { padding: 5, justifyContent: "center", borderColor: COLORS.black },
  cellDivider: { borderRightWidth: 1 },
  cellCenterAlign: { alignItems: "center" },
  headerCellText: { fontSize: 8, fontWeight: "bold", textAlign: "center" },
  cellText: { fontSize: 9 },
  textCenter: { textAlign: "center" },
  textBold: { fontWeight: "bold" },
  textMono: { fontFamily: "Courier", fontSize: 8.5 },
  totalLine: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: 6,
  },

  certification: { fontSize: 8, lineHeight: 1.4, marginTop: 16 },

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
  signatureCaption: {
    fontSize: 7,
    color: COLORS.muted,
    marginTop: 2,
    width: "100%",
    textAlign: "center",
  },

  headerWrap: {
    marginTop: -PAGE_PADDING_TOP,
    marginHorizontal: -PAGE_PADDING_X,
  },
  headerImage: { width: "100%" },
  footerWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },
  footerImage: { width: "100%" },
  pageNumber: {
    position: "absolute",
    bottom: PAGE_NUMBER_BOTTOM,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 7,
    color: COLORS.muted,
  },
});
