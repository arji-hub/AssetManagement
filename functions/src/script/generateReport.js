/**
 * One-time script to seed the Firestore 'report' collection with sample data.
 * Creates one record per category: damaged, missing, for_repair, found, working, condemned
 *
 * HOW TO RUN:
 *   1. Place serviceAccountKey.json in the same folder as this script
 *   2. Run: node generateReports.js
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const serviceAccount = require("../../serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const SAMPLE_REPORTS = [
  // ── DAMAGED (Incident Report) ─────────────────────────────────────────────
  {
    asset_id: "cict-I001",
    asset_description: "Epson Printer L120",
    location: "SDL1",
    current_custodian: "uid_custodian_001",
    reported_by: "uid_reporter_001",
    reported_by_name: "Ralph Jasper Ortiz",
    date_reported: "2026-06-20T08:30:00Z",
    narrative: "Printer not feeding paper correctly, jams frequently.",
    status: "damaged",
    date_resolved: null,
    status_log: [
      {
        status: "damaged",
        date: "2026-06-20T08:30:00Z",
        img: null,
        note: "Initial report submitted.",
      },
    ],
  },

  // ── MISSING (Incident Report) ─────────────────────────────────────────────
  {
    asset_id: "cict-I006",
    asset_description: "HP Laptop 14s",
    location: "SDL2",
    current_custodian: "uid_custodian_005",
    reported_by: "uid_reporter_002",
    reported_by_name: "Maria Santos",
    date_reported: "2026-06-20T13:00:00Z",
    narrative: "Laptop not found in assigned location during inventory.",
    status: "missing",
    date_resolved: null,
    status_log: [
      {
        status: "missing",
        date: "2026-06-20T13:00:00Z",
        img: null,
        note: "Initial report submitted.",
      },
    ],
  },

  // ── FOR REPAIR ────────────────────────────────────────────────────────────
  {
    asset_id: "cict-I011",
    asset_description: "Desktop PC Unit",
    location: "SDL1",
    current_custodian: "uid_custodian_001",
    reported_by: "uid_reporter_003",
    reported_by_name: "Lance Reyes",
    date_reported: "2026-06-10T08:00:00Z",
    narrative: "PC not booting, suspected hard drive failure.",
    status: "for_repair",
    date_resolved: null,
    status_log: [
      {
        status: "damaged",
        date: "2026-06-10T08:00:00Z",
        img: null,
        note: "Initial report submitted.",
      },
      {
        status: "for_repair",
        date: "2026-06-11T09:00:00Z",
        img: null,
        note: "Endorsed to IT for diagnosis.",
      },
    ],
  },

  // ── FOUND ─────────────────────────────────────────────────────────────────
  {
    asset_id: "cict-I012",
    asset_description: "Extension Power Cable 10m",
    location: "SDL1",
    current_custodian: "uid_custodian_001",
    reported_by: "uid_reporter_002",
    reported_by_name: "Maria Santos",
    date_reported: "2026-06-08T09:00:00Z",
    narrative: "Cable missing, later found mislabeled in storage room.",
    status: "found",
    date_resolved: "2026-06-09T10:00:00Z",
    status_log: [
      {
        status: "missing",
        date: "2026-06-08T09:00:00Z",
        img: null,
        note: "Initial report submitted.",
      },
      {
        status: "found",
        date: "2026-06-09T10:00:00Z",
        img: null,
        note: "Found in SDL1 storage, mislabeled bin.",
      },
    ],
  },

  // ── WORKING (Resolved) ────────────────────────────────────────────────────
  {
    asset_id: "cict-I016",
    asset_description: "HP LaserJet Printer",
    location: "Faculty Room",
    current_custodian: "uid_custodian_004",
    reported_by: "uid_reporter_003",
    reported_by_name: "Lance Reyes",
    date_reported: "2026-05-05T08:00:00Z",
    narrative: "Printer producing faded output, toner suspected empty.",
    status: "working",
    date_resolved: "2026-05-12T14:00:00Z",
    status_log: [
      {
        status: "damaged",
        date: "2026-05-05T08:00:00Z",
        img: null,
        note: "Initial report submitted.",
      },
      {
        status: "for_repair",
        date: "2026-05-06T09:00:00Z",
        img: null,
        note: "Sent to IT for toner replacement.",
      },
      {
        status: "working",
        date: "2026-05-12T14:00:00Z",
        img: null,
        note: "Toner replaced, print quality restored.",
      },
    ],
  },

  // ── CONDEMNED (Archive) ───────────────────────────────────────────────────
  {
    asset_id: "cict-I013",
    asset_description: "CRT Monitor 17in",
    location: "Room 205",
    current_custodian: "uid_custodian_003",
    reported_by: "uid_admin_001",
    reported_by_name: "Admin",
    date_reported: "2026-04-01T08:00:00Z",
    narrative: "Monitor completely dead, no display output at all.",
    status: "condemned",
    date_resolved: "2026-04-10T10:00:00Z",
    status_log: [
      {
        status: "damaged",
        date: "2026-04-01T08:00:00Z",
        img: null,
        note: "Initial report submitted.",
      },
      {
        status: "for_repair",
        date: "2026-04-03T09:00:00Z",
        img: null,
        note: "Sent to technician for diagnosis.",
      },
      {
        status: "condemned",
        date: "2026-04-10T10:00:00Z",
        img: null,
        note: "Repair cost exceeds asset value, condemned.",
      },
    ],
  },
];

async function generateReports() {
  const counterRef = db.collection("counters").doc("report");

  // Initialize counter if it doesn't exist
  const counterSnap = await counterRef.get();
  if (!counterSnap.exists) {
    await counterRef.set({ count: 0 });
    console.log("✅  Initialized report counter.");
  }

  for (const report of SAMPLE_REPORTS) {
    try {
      const report_no = await db.runTransaction(async (transaction) => {
        const counter = await transaction.get(counterRef);
        const next = (counter.data()?.count ?? 0) + 1;
        transaction.update(counterRef, { count: next });
        return `RPT-${String(next).padStart(4, "0")}`;
      });

      const docRef = await db.collection("report").add({
        ...report,
        report_no,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });

      console.log(
        `✅  [${report_no}] ${report.asset_description} (${report.status}) → ${docRef.id}`,
      );
    } catch (error) {
      console.error(
        `❌  Failed to insert ${report.asset_description}:`,
        error.message,
      );
    }
  }

  console.log("\n🎉  Done seeding reports.");
  process.exit(0);
}

generateReports().catch((error) => {
  console.error("❌  Script failed:", error);
  process.exit(1);
});
