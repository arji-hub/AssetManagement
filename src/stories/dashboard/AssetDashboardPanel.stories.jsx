// src/stories/dashboard/AssetDashboardPanel.stories.jsx
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBoxesStacked,
  faArrowUp,
  faArrowDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { MemoryRouter } from "react-router-dom";
import AssetDashboardPanel from "../../components/dashboard/AssetDashboardPanel";
import { ROLES } from "../../data/roles";
import { MOCK_ASSETS, MOCK_CUSTODIAN_TRANSFERS } from "../../data/mock_data";
import "../../components/layout/Navbar.css";

library.add(faBoxesStacked, faArrowUp, faArrowDown, faChevronRight);

const mockAdminUser = {
  uid: "uid_admin_001",
  role: ROLES.ADMIN,
  firstname: "Admin",
};

const mockCustodianUser = {
  uid: "uid_custodian_002",
  role: ROLES.FULLTIME,
  firstname: "Lance",
};

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString();
}

let assetIdCounter = 0;
function buildRecentAsset({ status, date }) {
  assetIdCounter += 1;
  const assetId = `cict-mock-${1200 + assetIdCounter}`;
  return {
    id: assetId,
    asset_id: assetId,
    category_id: "cat-misc",
    description: "Mock asset item",
    cost: 5000,
    qty: 1,
    tracking_mode: "single_bulk",
    status,
    property_custodian: status === "Condemned" ? null : "uid_custodian_002",
    local_mr: null,
    room_id: status === "Condemned" ? null : "room-301",
    serial_number: null,
    date_acquired: date,
    created_at: date,
    updated_at: date,
  };
}

let transferIdCounter = 0;
function buildRecentTransfer({
  direction,
  date,
  custodianUid = "uid_custodian_002",
}) {
  transferIdCounter += 1;
  const isAssign = direction === "assigned";
  return {
    id: `txn-mock-${300 + transferIdCounter}`,
    asset_id: `cict-mock-${1200 + transferIdCounter}`,
    asset_description: "Mock asset item",
    requested_by: "uid_admin_001",
    requested_by_name: "Admin",
    requested_by_role: "admin",
    type: isAssign ? "assign_custodian" : "remove_custodian",
    status: "completed",
    completed_at: date,
    created_at: date,
    updated_at: date,
    acknowledgments: {
      admin: { acknowledged: true, uid: "uid_admin_001" },
      from: { acknowledged: true, uid: isAssign ? null : custodianUid },
      to: { acknowledged: true, uid: isAssign ? custodianUid : null },
    },
  };
}

// Guaranteed to fall in the current month, whenever the story is opened
const mockAssetsThisMonth = [
  buildRecentAsset({ status: "Working", date: daysAgo(1) }),
  buildRecentAsset({ status: "Working", date: daysAgo(3) }),
  buildRecentAsset({ status: "Condemned", date: daysAgo(4) }),
  buildRecentAsset({ status: "Working", date: daysAgo(7) }),
  buildRecentAsset({ status: "Working", date: daysAgo(9) }),
  buildRecentAsset({ status: "Condemned", date: daysAgo(10) }),
  buildRecentAsset({ status: "Working", date: daysAgo(14) }),
  buildRecentAsset({ status: "Working", date: daysAgo(18) }),
];

const mockCustodianEventsThisMonth = [
  buildRecentTransfer({ direction: "assigned", date: daysAgo(2) }),
  buildRecentTransfer({ direction: "assigned", date: daysAgo(5) }),
  buildRecentTransfer({ direction: "removed", date: daysAgo(6) }),
  buildRecentTransfer({ direction: "assigned", date: daysAgo(9) }),
  buildRecentTransfer({ direction: "removed", date: daysAgo(12) }),
  buildRecentTransfer({ direction: "assigned", date: daysAgo(16) }),
];

// Real fixture data — spans Jan–Sep 2026, good spread for the Year view
const mockAssetsThisYear = MOCK_ASSETS;
const mockCustodianEventsThisYear = MOCK_CUSTODIAN_TRANSFERS;

export default {
  title: "Dashboard/AssetDashboardPanel",
  component: AssetDashboardPanel,
  // Same container-driven sizing pattern as ReportDashboardPanel: the panel
  // itself is width:100%/height:100%, so the wrapper's containerWidth /
  // containerHeight args stand in for whatever the dashboard grid cell
  // would give it. Drag the Controls sliders, or the bottom-right corner
  // for freeform checks.
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
        "Firestore user object ({ uid, role, ... }). Determines mode: admin sees acquired-vs-condemned, any other role sees assigned-vs-removed for that uid. Falls back to the AuthContext user when omitted.",
    },
    mockAssets: {
      control: false,
      description:
        "Bypasses the Firestore asset subscription with a fixed array — used for Storybook/tests. Drives the admin (acquisition) view.",
    },
    mockAssignmentEvents: {
      control: false,
      description:
        "Bypasses the Firestore transfer_request subscription with a fixed array of completed transfer events — used for Storybook/tests. Drives the non-admin (assignment) view.",
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
        "Storybook-only: width of the wrapper div around the panel, standing in for whatever the dashboard grid cell would give it. Not a real component prop.",
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

export const AdminMonth = {
  name: "Admin — Month (acquired vs condemned)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisMonth,
    defaultRange: "month",
  },
};

export const AdminYear = {
  name: "Admin — Year (acquired vs condemned)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisYear,
    defaultRange: "year",
  },
};

export const CustodianMonth = {
  name: "Custodian — Month (assigned vs removed)",
  args: {
    user: mockCustodianUser,
    mockAssignmentEvents: mockCustodianEventsThisMonth,
    defaultRange: "month",
  },
};

export const CustodianYear = {
  name: "Custodian — Year (assigned vs removed)",
  args: {
    user: mockCustodianUser,
    mockAssignmentEvents: mockCustodianEventsThisYear,
    defaultRange: "year",
  },
};

export const Empty = {
  name: "No data",
  args: {
    user: mockAdminUser,
    mockAssets: [],
    defaultRange: "month",
  },
};

export const Loading = {
  name: "Loading state",
  args: {
    user: null,
    mockAssets: null,
    mockAssignmentEvents: null,
    defaultRange: "month",
  },
};

// --- Sizing presets -------------------------------------------------
export const Narrow = {
  name: "Sizing — narrow (220px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisMonth,
    defaultRange: "month",
    containerWidth: 220,
    containerHeight: 300,
  },
};

export const Compact = {
  name: "Sizing — compact (300px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisMonth,
    defaultRange: "month",
    containerWidth: 300,
    containerHeight: 320,
  },
};

export const Wide = {
  name: "Sizing — wide, at cap (720px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisYear,
    defaultRange: "year",
    containerWidth: 720,
    containerHeight: 360,
  },
};

export const OverflowGuard = {
  name: "Sizing — wrapper wider than cap (900px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisYear,
    defaultRange: "year",
    containerWidth: 900,
    containerHeight: 360,
  },
};

export const SizingPlayground = {
  name: "Sizing — playground",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsThisMonth,
    defaultRange: "month",
    containerWidth: 360,
    containerHeight: 340,
  },
};
