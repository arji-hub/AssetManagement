// src/stories/dashboard/TransferDashboardPanel.stories.jsx
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faRightLeft,
  faArrowUp,
  faArrowDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { MemoryRouter } from "react-router-dom";
import TransferDashboardPanel from "../../components/dashboard/TransferDashboardPanel";
import { ROLES } from "../../data/roles";
import "../../components/layout/Navbar.css";

library.add(faRightLeft, faArrowUp, faArrowDown, faChevronRight);

const mockUser = {
  uid: "mock-user-1",
  role: ROLES.ADMIN,
  firstname: "Arji",
};

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString();
}

function monthsAgo(n) {
  const date = new Date();
  date.setMonth(date.getMonth() - n);
  return date.toISOString();
}

let idCounter = 0;
function buildTransfer({ status, date }) {
  idCounter += 1;
  return {
    id: `mock-transfer-${idCounter}`,
    asset_id: `cict-${2000 + idCounter}`,
    status,
    created_at: date,
  };
}

// Guaranteed to fall within the current month, whenever the story is opened
const mockTransfersThisMonth = [
  buildTransfer({ status: "pending", date: daysAgo(1) }),
  buildTransfer({ status: "for_approval", date: daysAgo(2) }),
  buildTransfer({ status: "pending", date: daysAgo(3) }),
  buildTransfer({ status: "pending", date: daysAgo(5) }),
  buildTransfer({ status: "for_approval", date: daysAgo(6) }),
  buildTransfer({ status: "for_approval", date: daysAgo(6) }),
  buildTransfer({ status: "pending", date: daysAgo(9) }),
  buildTransfer({ status: "for_approval", date: daysAgo(10) }),
  buildTransfer({ status: "pending", date: daysAgo(14) }),
  buildTransfer({ status: "for_approval", date: daysAgo(18) }),
  // A couple already resolved — excluded from the chart/totals by design,
  // included here to confirm the summarizer actually filters them out.
  buildTransfer({ status: "completed", date: daysAgo(4) }),
  buildTransfer({ status: "denied", date: daysAgo(7) }),
];

// Spread across the last several months, for the Year view
const mockTransfersThisYear = [
  buildTransfer({ status: "pending", date: monthsAgo(0) }),
  buildTransfer({ status: "for_approval", date: monthsAgo(0) }),
  buildTransfer({ status: "pending", date: monthsAgo(1) }),
  buildTransfer({ status: "for_approval", date: monthsAgo(1) }),
  buildTransfer({ status: "pending", date: monthsAgo(2) }),
  buildTransfer({ status: "pending", date: monthsAgo(3) }),
  buildTransfer({ status: "for_approval", date: monthsAgo(3) }),
  buildTransfer({ status: "pending", date: monthsAgo(4) }),
  buildTransfer({ status: "for_approval", date: monthsAgo(5) }),
];

export default {
  title: "Dashboard/TransferDashboardPanel",
  component: TransferDashboardPanel,
  // Same sizing-via-args pattern as ReportDashboardPanel: the panel
  // itself is width:100%/height:100% and lets its *container* dictate
  // its size. Drag containerWidth/containerHeight in Controls to watch
  // the container-query breakpoints in TransferDashboardPanel.css kick
  // in, or drag the wrapper's resize corner directly.
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
    mockTransfers: {
      control: false,
      description:
        "Bypasses the Firestore subscriptions with a fixed transfer_request array — used for Storybook/tests. Omit (leave undefined) to fall through to the real subscription (requires a live Firebase connection).",
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
    mockTransfers: mockTransfersThisMonth,
    defaultRange: "month",
  },
};

export const YearView = {
  name: "Year — with data",
  args: {
    user: mockUser,
    mockTransfers: mockTransfersThisYear,
    defaultRange: "year",
  },
};

export const Empty = {
  name: "No transfers",
  args: {
    user: mockUser,
    mockTransfers: [],
    defaultRange: "month",
  },
};

export const Loading = {
  name: "Loading state",
  args: {
    user: null,
    mockTransfers: undefined,
    defaultRange: "month",
  },
};

// --- Sizing presets ---------------------------------------------------

export const Narrow = {
  name: "Sizing — narrow (220px)",
  args: {
    user: mockUser,
    mockTransfers: mockTransfersThisMonth,
    defaultRange: "month",
    containerWidth: 220,
    containerHeight: 300,
  },
};

export const Compact = {
  name: "Sizing — compact (300px)",
  args: {
    user: mockUser,
    mockTransfers: mockTransfersThisMonth,
    defaultRange: "month",
    containerWidth: 300,
    containerHeight: 320,
  },
};

export const Wide = {
  name: "Sizing — wide, at cap (720px)",
  args: {
    user: mockUser,
    mockTransfers: mockTransfersThisYear,
    defaultRange: "year",
    containerWidth: 720,
    containerHeight: 360,
  },
};

export const OverflowGuard = {
  name: "Sizing — wrapper wider than cap (900px)",
  args: {
    user: mockUser,
    mockTransfers: mockTransfersThisYear,
    defaultRange: "year",
    containerWidth: 900,
    containerHeight: 360,
  },
};

export const SizingPlayground = {
  name: "Sizing — playground",
  args: {
    user: mockUser,
    mockTransfers: mockTransfersThisMonth,
    defaultRange: "month",
    containerWidth: 360,
    containerHeight: 340,
  },
};
