// ReportPanel.stories.jsx

import React from "react";
import { MemoryRouter } from "react-router-dom";
import ReportPanel from "../../components/panel/ReportPanel";
import { MOCK_REPORTS } from "../../data/reports";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";

library.add(fas, far);

export default {
  title: "Panel/ReportPanel",
  component: ReportPanel,
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

// Incident tab — damaged + missing
export const Incident = {
  args: {
    group: "incident",
    statusFilter: ["damaged", "missing"],
    reports: MOCK_REPORTS,
    loading: false,
    error: null,
  },
};

// Incident — damaged only
export const IncidentDamagedOnly = {
  args: {
    group: "incident",
    statusFilter: ["damaged"],
    reports: MOCK_REPORTS,
    loading: false,
    error: null,
  },
};

// Incident — missing only
export const IncidentMissingOnly = {
  args: {
    group: "incident",
    statusFilter: ["missing"],
    reports: MOCK_REPORTS,
    loading: false,
    error: null,
  },
};

// Repair tab
export const Repair = {
  args: {
    group: "repair",
    statusFilter: ["damaged", "missing", "for_repair", "found"],
    reports: MOCK_REPORTS,
    loading: false,
    error: null,
  },
};

// Resolved tab
export const Resolved = {
  args: {
    group: "resolved",
    statusFilter: ["working"],
    reports: MOCK_REPORTS,
    loading: false,
    error: null,
  },
};

// Archive tab
export const Archive = {
  args: {
    group: "archive",
    statusFilter: ["condemned"],
    reports: MOCK_REPORTS,
    loading: false,
    error: null,
  },
};

// Loading state
export const Loading = {
  args: {
    group: "incident",
    statusFilter: ["damaged", "missing"],
    reports: [],
    loading: true,
    error: null,
  },
};

// Error state
export const Error = {
  args: {
    group: "incident",
    statusFilter: ["damaged", "missing"],
    reports: [],
    loading: false,
    error: "Failed to fetch reports.",
  },
};

// Empty state
export const Empty = {
  args: {
    group: "incident",
    statusFilter: ["damaged", "missing"],
    reports: [],
    loading: false,
    error: null,
  },
};
