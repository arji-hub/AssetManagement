// src/stories/dashboard/AssetStatusDashboardPanel.stories.jsx
import { library } from "@fortawesome/fontawesome-svg-core";
import { faChartPie } from "@fortawesome/free-solid-svg-icons";
import AssetStatusDashboardPanel from "../../components/dashboard/AssetStatusDashboardPanel";
import { ROLES } from "../../data/roles";
import "../../components/layout/Navbar.css";

library.add(faChartPie);

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

let assetIdCounter = 0;
function buildAsset({ status, custodian = "uid_custodian_002" }) {
  assetIdCounter += 1;
  const assetId = `cict-mock-${1500 + assetIdCounter}`;
  return {
    id: assetId,
    asset_id: assetId,
    category_id: "cat-misc",
    description: "Mock asset item",
    cost: 5000,
    qty: 1,
    tracking_mode: "single_bulk",
    status,
    property_custodian: status === "Condemned" ? null : custodian,
    local_mr: null,
    room_id: status === "Condemned" ? null : "room-301",
    serial_number: null,
    date_acquired: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildStatusSpread(counts, custodian) {
  return Object.entries(counts).flatMap(([status, count]) =>
    Array.from({ length: count }, () => buildAsset({ status, custodian })),
  );
}

// A realistic full-inventory spread — every status represented, weighted
// toward Working the way a real department's asset list would be.
const mockAssetsAdmin = buildStatusSpread({
  Working: 42,
  "For Repair": 6,
  Damaged: 5,
  Missing: 2,
  Condemned: 9,
});

// A single custodian's smaller, mostly-Working set.
const mockAssetsCustodian = buildStatusSpread(
  {
    Working: 7,
    "For Repair": 1,
    Damaged: 1,
  },
  "uid_custodian_002",
);

// Every asset in the same state — exercises the donut rendering a full
// single-color ring instead of multiple arcs.
const mockAssetsSingleStatus = buildStatusSpread({ Working: 15 });

// Two statuses only, to check the legend/description pairing reads fine
// with just a couple of rows.
const mockAssetsTwoStatuses = buildStatusSpread({
  Working: 10,
  Condemned: 4,
});

export default {
  title: "Dashboard/AssetStatusDashboardPanel",
  component: AssetStatusDashboardPanel,
  // Same container-driven sizing pattern as AssetDashboardPanel: the panel
  // is width:100%/height:100%, so the wrapper's containerWidth /
  // containerHeight args stand in for whatever the dashboard grid cell
  // would give it.
  decorators: [
    (Story, context) => {
      const { containerWidth = 320, containerHeight = 340 } = context.args;

      return (
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
        "Firestore user object ({ uid, role, ... }). Determines the asset source: admin sees every asset, any other role sees only assets they currently hold. Falls back to the AuthContext user when omitted.",
    },
    mockAssets: {
      control: false,
      description:
        "Bypasses the Firestore asset subscription with a fixed array — used for Storybook/tests.",
    },
    containerWidth: {
      control: { type: "range", min: 180, max: 900, step: 10 },
      description:
        "Storybook-only: width of the wrapper div around the panel, standing in for whatever the dashboard grid cell would give it. Not a real component prop.",
      table: { category: "Sizing (Storybook only)" },
    },
    containerHeight: {
      control: { type: "range", min: 220, max: 600, step: 10 },
      description:
        "Storybook-only: height of the wrapper div around the panel. Not a real component prop.",
      table: { category: "Sizing (Storybook only)" },
    },
  },
};

export const AdminView = {
  name: "Admin — full inventory (all statuses)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsAdmin,
  },
};

export const CustodianView = {
  name: "Custodian — assigned assets",
  args: {
    user: mockCustodianUser,
    mockAssets: mockAssetsCustodian,
  },
};

export const SingleStatus = {
  name: "All one status (full ring)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsSingleStatus,
  },
};

export const TwoStatuses = {
  name: "Two statuses only",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsTwoStatuses,
  },
};

export const Empty = {
  name: "No data",
  args: {
    user: mockAdminUser,
    mockAssets: [],
  },
};

export const Loading = {
  name: "Loading state",
  args: {
    user: null,
    mockAssets: null,
  },
};

// --- Sizing presets -------------------------------------------------
export const Narrow = {
  name: "Sizing — narrow (220px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsAdmin,
    containerWidth: 220,
    containerHeight: 340,
  },
};

export const Compact = {
  name: "Sizing — compact (300px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsAdmin,
    containerWidth: 300,
    containerHeight: 340,
  },
};

export const Wide = {
  name: "Sizing — wide (600px)",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsAdmin,
    containerWidth: 600,
    containerHeight: 380,
  },
};

export const SizingPlayground = {
  name: "Sizing — playground",
  args: {
    user: mockAdminUser,
    mockAssets: mockAssetsAdmin,
    containerWidth: 320,
    containerHeight: 340,
  },
};
