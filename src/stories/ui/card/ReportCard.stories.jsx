// ReportCard.stories.jsx

import React from "react";
import { MemoryRouter } from "react-router-dom";
import ReportCard from "../../../components/ui/card/ReportCard";
import "../../../components/panel/ReportPanel.css";
import "../../../components/ui/card/ReportCard.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

const DAMAGED_REPORT = {
  id: "rpt-001",
  asset_id: "cict-I001",
  asset_description: "Epson Printer L120",
  location: "SDL1",
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
};

const MISSING_REPORT = {
  id: "rpt-002",
  asset_id: "cict-I006",
  asset_description: "HP Laptop 14s",
  location: "SDL2",
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
};

const FOR_REPAIR_REPORT = {
  id: "rpt-003",
  asset_id: "cict-I011",
  asset_description: "Desktop PC Unit",
  location: "SDL1",
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
};

const WORKING_REPORT = {
  id: "rpt-004",
  asset_id: "cict-I016",
  asset_description: "HP LaserJet Printer",
  location: "Faculty Room",
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
      status: "working",
      date: "2026-05-12T14:00:00Z",
      img: null,
      note: "Toner replaced, print quality restored.",
    },
  ],
};

const CONDEMNED_REPORT = {
  id: "rpt-005",
  asset_id: "cict-I013",
  asset_description: "CRT Monitor 17in",
  location: "Room 205",
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
      status: "condemned",
      date: "2026-04-10T10:00:00Z",
      img: null,
      note: "Repair cost exceeds asset value.",
    },
  ],
};

const RESOLVED_MISSING_REPORT = {
  id: "rpt-006",
  asset_id: "cict-I018",
  asset_description: "Wireless Keyboard",
  location: "SDL1",
  reported_by_name: "Juan Dela Cruz",
  date_reported: "2026-04-20T09:00:00Z",
  narrative: "Keyboard missing from workstation during room transfer.",
  status: "working",
  date_resolved: "2026-04-22T10:00:00Z",
  status_log: [
    {
      status: "missing",
      date: "2026-04-20T09:00:00Z",
      img: null,
      note: "Initial report submitted.",
    },
    {
      status: "found",
      date: "2026-04-21T08:00:00Z",
      img: null,
      note: "Found in SDL2.",
    },
    {
      status: "working",
      date: "2026-04-22T10:00:00Z",
      img: null,
      note: "Returned to workstation.",
    },
  ],
};

const CONDEMNED_MISSING_REPORT = {
  id: "rpt-007",
  asset_id: "cict-I020",
  asset_description: "USB Hub 7-port",
  location: "SDL2",
  reported_by_name: "Ralph Jasper Ortiz",
  date_reported: "2026-01-15T09:00:00Z",
  narrative: "Hub missing after lab reorganization, found later damaged.",
  status: "condemned",
  date_resolved: "2026-01-25T10:00:00Z",
  status_log: [
    {
      status: "missing",
      date: "2026-01-15T09:00:00Z",
      img: null,
      note: "Initial report submitted.",
    },
    {
      status: "condemned",
      date: "2026-01-25T10:00:00Z",
      img: null,
      note: "Internal board damaged beyond repair.",
    },
  ],
};

const handleClick = (report) => console.log("Clicked:", report.id);

const withPanel = (group, children) => (
  <div className={`report-panel ${group}`} style={{ padding: "8px" }}>
    {children}
  </div>
);

export default {
  title: "Cards/ReportCard",
  component: ReportCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ padding: "24px" }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

// Incident group
export const IncidentDamaged = {
  render: () =>
    withPanel(
      "incident",
      <ReportCard
        report={DAMAGED_REPORT}
        group="incident"
        onClick={handleClick}
      />,
    ),
};

export const IncidentMissing = {
  render: () =>
    withPanel(
      "incident",
      <ReportCard
        report={MISSING_REPORT}
        group="incident"
        onClick={handleClick}
      />,
    ),
};

// Repair group
export const Repair = {
  render: () =>
    withPanel(
      "repair",
      <ReportCard
        report={FOR_REPAIR_REPORT}
        group="repair"
        onClick={handleClick}
      />,
    ),
};

// Resolved group
export const ResolvedDamaged = {
  render: () =>
    withPanel(
      "resolved",
      <ReportCard
        report={WORKING_REPORT}
        group="resolved"
        onClick={handleClick}
      />,
    ),
};

export const ResolvedMissing = {
  render: () =>
    withPanel(
      "resolved",
      <ReportCard
        report={RESOLVED_MISSING_REPORT}
        group="resolved"
        onClick={handleClick}
      />,
    ),
};

// Archive group
export const ArchiveDamaged = {
  render: () =>
    withPanel(
      "archive",
      <ReportCard
        report={CONDEMNED_REPORT}
        group="archive"
        onClick={handleClick}
      />,
    ),
};

export const ArchiveMissing = {
  render: () =>
    withPanel(
      "archive",
      <ReportCard
        report={CONDEMNED_MISSING_REPORT}
        group="archive"
        onClick={handleClick}
      />,
    ),
};
