// src/components/ui/modal/PDFPreviewModal.stories.jsx
import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PDFPreviewModal } from "../../../components/ui/modal/PDFPreviewModal";

// ── Mock data ─────────────────────────────────────────────
const mockAssets = [
  {
    id: "1",
    description: "Dell Latitude 5420",
    category: "Laptop",
    name: "Juan Dela Cruz",
    status: "working",
    date: "2026-01-15",
  },
  {
    id: "2",
    description: "HP LaserJet Pro M404",
    category: "Printer",
    name: "Maria Santos",
    status: "damaged",
    date: "2026-02-03",
  },
  {
    id: "3",
    description: "Logitech MX Master 3",
    category: "Peripheral",
    name: "Juan Dela Cruz",
    status: "working",
    date: "2026-01-15",
  },
  {
    id: "4",
    description: 'Samsung 27" Monitor',
    category: "Monitor",
    name: "Pedro Reyes",
    status: "missing",
    date: "2025-11-20",
  },
  {
    id: "5",
    description: "Cisco Catalyst Switch",
    category: "Networking",
    name: "IT Room",
    status: "for_repair",
    date: "2025-09-10",
  },
];

// ── Minimal mock PDF document (standalone, no external deps) ──
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  header: {
    marginBottom: 16,
    borderBottom: "1px solid #ccc",
    paddingBottom: 8,
  },
  title: { fontSize: 16, fontWeight: "bold" },
  subtitle: { fontSize: 10, color: "#555", marginTop: 2 },
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
});

function MockRoomInventoryPDF({ roomName = "Room 204", assets = mockAssets }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Room Inventory Report</Text>
          <Text style={styles.subtitle}>
            Room: {roomName} • {assets.length} assets
          </Text>
        </View>

        <View>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cell, styles.cellIndex]}>#</Text>
            <Text style={styles.cell}>Asset Name</Text>
            <Text style={styles.cell}>Category</Text>
            <Text style={styles.cell}>Custodian</Text>
            <Text style={styles.cell}>Status</Text>
            <Text style={styles.cell}>Date Assigned</Text>
          </View>

          {assets.map((asset, index) => (
            <View key={asset.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.cellIndex]}>{index + 1}</Text>
              <Text style={styles.cell}>{asset.description}</Text>
              <Text style={styles.cell}>{asset.category}</Text>
              <Text style={styles.cell}>{asset.name}</Text>
              <Text style={styles.cell}>{asset.status}</Text>
              <Text style={styles.cell}>{asset.date}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

// ── Storybook config ─────────────────────────────────────
export default {
  title: "Modal/PDFPreviewModal",
  component: PDFPreviewModal,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    triggerLabel: { control: "text" },
    title: { control: "text" },
    fileName: { control: "text" },
  },
};

// ── Stories ───────────────────────────────────────────────
export const Default = {
  args: {
    title: "Room Inventory Form",
    triggerLabel: "Room Inventory Form",
    fileName: "room-inventory-room-204.pdf",
    document: <MockRoomInventoryPDF />,
  },
};

export const EmptyRoom = {
  args: {
    title: "Room Inventory Form",
    triggerLabel: "Room Inventory Form",
    fileName: "room-inventory-empty.pdf",
    document: <MockRoomInventoryPDF roomName="Storage B" assets={[]} />,
  },
};

export const LargeAssetList = {
  args: {
    title: "Room Inventory Form",
    triggerLabel: "Room Inventory Form",
    fileName: "room-inventory-large.pdf",
    document: (
      <MockRoomInventoryPDF
        roomName="Main Warehouse"
        assets={Array.from({ length: 40 }, (_, i) => ({
          id: String(i + 1),
          description: `Asset Item ${i + 1}`,
          category: ["Laptop", "Monitor", "Printer", "Networking"][i % 4],
          name: ["Juan Dela Cruz", "Maria Santos", "Pedro Reyes"][i % 3],
          status: ["working", "damaged", "missing", "for_repair"][i % 4],
          date: "2026-01-15",
        }))}
      />
    ),
  },
};

export const StyledTrigger = {
  args: {
    title: "Room Inventory Form",
    triggerLabel: "Room Inventory Form",
    triggerClassName: "filter-button",
    fileName: "room-inventory-styled.pdf",
    document: <MockRoomInventoryPDF />,
  },
};
