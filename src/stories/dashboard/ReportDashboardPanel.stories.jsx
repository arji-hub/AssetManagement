// src/stories/dashboard/ReportDashboardPanel.stories.jsx
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faTriangleExclamation,
  faArrowUp,
  faArrowDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { MemoryRouter } from "react-router-dom";
import ReportDashboardPanel from "../../components/dashboard/ReportDashboardPanel";
import { ROLES } from "../../data/roles";
import { REPORT_STATUS } from "../../data/reports";
import { MOCK_REPORTS } from "../../data/mock_data";
import "../../components/layout/Navbar.css";

library.add(faTriangleExclamation, faArrowUp, faArrowDown, faChevronRight);

const mockUser = {
  uid: "mock-user-1",
  role: ROLES.ADMIN,
  firstname: "Arji",
};

// Mirrors the mapping subscribeToReports does on raw Firestore docs,
// so MOCK_REPORTS can feed useReportSummary the same shape it expects.
function toSummaryShape(report) {
  const latestLog = report.status_log?.[report.status_log.length - 1];
  return {
    id: report.id,
    asset_id: report.asset_id,
    description: report.asset_description,
    location: report.location,
    custodian: report.current_custodian,
    reported_by: report.reported_by,
    reported_by_name: report.reported_by_name,
    status: report.status,
    date_resolved: report.date_resolved,
    status_log: report.status_log,
    created_at: report.created_at,
    updated_at: report.updated_at,
    date_reported: report.status_log?.[0]?.date ?? report.date_reported ?? null,
    narrative: report.status_log?.[0]?.note ?? report.narrative ?? null,
    type: report.status_log?.[0]?.status ?? null,
    latest_note: latestLog?.note ?? null,
    latest_date: latestLog?.date ?? null,
  };
}

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString();
}

let idCounter = 0;
function buildRecentReport({ type, date, resolved = false }) {
  idCounter += 1;
  return {
    id: `mock-recent-${idCounter}`,
    asset_id: `cict-${1000 + idCounter}`,
    description:
      type === REPORT_STATUS.DAMAGED ? "Projector unit" : "Wireless mouse",
    location: "Room 301",
    custodian: "mock-custodian-1",
    reported_by: "mock-user-1",
    reported_by_name: "Arji Santos",
    status: type,
    date_resolved: resolved ? date : null,
    status_log: [
      { date, status: type, note: "Reported via mock data", img: null },
    ],
    created_at: date,
    updated_at: date,
    date_reported: date,
    narrative: "Reported via mock data",
    type,
    latest_note: "Reported via mock data",
    latest_date: date,
  };
}

// Guaranteed to fall in the current month, whenever the story is opened
const mockReportsThisMonth = [
  buildRecentReport({ type: REPORT_STATUS.DAMAGED, date: daysAgo(1) }),
  buildRecentReport({ type: REPORT_STATUS.MISSING, date: daysAgo(2) }),
  buildRecentReport({
    type: REPORT_STATUS.DAMAGED,
    date: daysAgo(3),
    resolved: true,
  }),
  buildRecentReport({ type: REPORT_STATUS.DAMAGED, date: daysAgo(5) }),
  buildRecentReport({ type: REPORT_STATUS.MISSING, date: daysAgo(6) }),
  buildRecentReport({ type: REPORT_STATUS.MISSING, date: daysAgo(6) }),
  buildRecentReport({
    type: REPORT_STATUS.DAMAGED,
    date: daysAgo(9),
    resolved: true,
  }),
  buildRecentReport({ type: REPORT_STATUS.MISSING, date: daysAgo(10) }),
  buildRecentReport({ type: REPORT_STATUS.DAMAGED, date: daysAgo(14) }),
  buildRecentReport({ type: REPORT_STATUS.MISSING, date: daysAgo(18) }),
];

// Real fixture data — already spans Jan–Jun 2026, good spread for the Year view
const mockReportsThisYear = MOCK_REPORTS.map(toSummaryShape);

export default {
  title: "Dashboard/ReportDashboardPanel",
  component: ReportDashboardPanel,
  // The panel itself is width:100%/height:100% and lets its *container*
  // dictate its size (that's how it'll actually be used in the dashboard
  // grid). So instead of hardcoding a wrapper size, the wrapper reads
  // `containerWidth` / `containerHeight` from args — use the Storybook
  // Controls panel to drag those and watch the panel's own container
  // queries (see ReportDashboardPanel.css) kick in at each size. The
  // wrapper is also manually resizable (drag the bottom-right corner) for
  // freeform checks in between control steps.
  decorators: [
    (Story, context) => {
      const { containerWidth = 360, containerHeight = 340 } = context.args;

      return (
        <MemoryRouter>
          <div
            className="layout-wrapper"
            data-theme="light"
            style={{
              width: containerWidth,
              height: containerHeight,
              resize: "both",
              overflow: "auto",
              border: "1px dashed var(--border-subtle, #ccc)",
            }}
          >
            <Story />
          </div>
        </MemoryRouter>
      );
    },
  ],
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    user: {
      control: false,
      description:
        "Firestore user object ({ uid, role, ... }). Falls back to the AuthContext user when omitted — pass this to override in Storybook since no AuthProvider wraps these stories.",
    },
    mockReports: {
      control: false,
      description:
        "Bypasses the Firestore subscribeToReports listener with a fixed report array — used for Storybook/tests. Pass null to fall through to the real subscription (requires a live Firebase connection).",
    },
    defaultRange: {
      control: { type: "radio" },
      options: ["month", "year"],
      description:
        "Initial chart range shown before the user toggles Month/Year.",
    },
    containerWidth: {
      control: { type: "range", min: 180, max: 900, step: 10 },
      description:
        "Storybook-only: width of the wrapper div around the panel, standing in for whatever the dashboard grid cell would give it. The panel itself caps at max-width: 720px regardless of this value. Not a real component prop.",
      table: { category: "Sizing (Storybook only)" },
    },
    containerHeight: {
      control: { type: "range", min: 180, max: 600, step: 10 },
      description:
        "Storybook-only: height of the wrapper div around the panel. Not a real component prop.",
      table: { category: "Sizing (Storybook only)" },
    },
  },
};

export const Default = {
  name: "Month — with data",
  args: {
    user: mockUser,
    mockReports: mockReportsThisMonth,
    defaultRange: "month",
  },
};

export const YearView = {
  name: "Year — with data",
  args: {
    user: mockUser,
    mockReports: mockReportsThisYear,
    defaultRange: "year",
  },
};

export const Empty = {
  name: "No reports",
  args: {
    user: mockUser,
    mockReports: [],
    defaultRange: "month",
  },
};

export const Loading = {
  name: "Loading state",
  args: {
    user: null,
    mockReports: null,
    defaultRange: "month",
  },
};

// --- Sizing presets -------------------------------------------------
// Same data, different wrapper sizes, so you can eyeball each container
// query breakpoint (420px / 320px / 240px) without dragging the corner
// by hand. Pick "Sizing Playground" and use the Controls panel for
// anything in between.

export const Narrow = {
  name: "Sizing — narrow (220px)",
  args: {
    user: mockUser,
    mockReports: mockReportsThisMonth,
    defaultRange: "month",
    containerWidth: 220,
    containerHeight: 300,
  },
};

export const Compact = {
  name: "Sizing — compact (300px)",
  args: {
    user: mockUser,
    mockReports: mockReportsThisMonth,
    defaultRange: "month",
    containerWidth: 300,
    containerHeight: 320,
  },
};

export const Wide = {
  name: "Sizing — wide, at cap (720px)",
  args: {
    user: mockUser,
    mockReports: mockReportsThisYear,
    defaultRange: "year",
    containerWidth: 720,
    containerHeight: 360,
  },
};

export const OverflowGuard = {
  name: "Sizing — wrapper wider than cap (900px)",
  args: {
    user: mockUser,
    mockReports: mockReportsThisYear,
    defaultRange: "year",
    containerWidth: 900,
    containerHeight: 360,
  },
};

export const SizingPlayground = {
  name: "Sizing — playground",
  args: {
    user: mockUser,
    mockReports: mockReportsThisMonth,
    defaultRange: "month",
    containerWidth: 360,
    containerHeight: 340,
  },
};
