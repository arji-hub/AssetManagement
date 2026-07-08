import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    marginBottom: 16,
    borderBottom: "1px solid #ccc",
    paddingBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "bold" },
  subtitle: { fontSize: 10, color: "#555", marginTop: 2 },
  table: { marginTop: 10 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1px solid #333",
    paddingVertical: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    paddingVertical: 4,
  },
  cell: { flex: 1, paddingHorizontal: 2 },
  cellIndex: { width: 24 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});
