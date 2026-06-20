import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import FilterModal from "../../../components/ui/modal/FilterModal";

const BASE_FILTERS = { status: "", category: "", room: "", custodian: "" };

// Mirrors the shape AuthProvider actually provides:
// { currentUser, role, user, loading, logout }
const adminAuth = {
  currentUser: { uid: "mock-admin-uid" },
  role: "admin",
  user: {
    uid: "mock-admin-uid",
    firstname: "Juan",
    lastname: "Dela Cruz",
    role: "admin",
    username: "juan.delacruz",
  },
  loading: false,
  logout: () => {},
};

const custodianAuth = {
  currentUser: { uid: "mock-custodian-uid" },
  role: "fulltime",
  user: {
    uid: "mock-custodian-uid",
    firstname: "Jasper",
    lastname: "Ortega",
    role: "fulltime",
    username: "jasper.ortega",
  },
  loading: false,
  logout: () => {},
};

// Mock rooms — at least 5 examples
const mockRooms = ["Room 101", "Room 102", "Lab A", "Lab B", "SDL 1"];

// Mock categories — at least 5 examples
const mockCategories = [
  "Computer Set",
  "Furniture",
  "Networking Equipment",
  "Audio Visual",
  "Office Supplies",
];

// Mock custodians — at least 5 examples (plain strings, matching component's expected shape)
const mockCustodians = [
  "Jasper C. Ortega",
  "Maria L. Santos",
  "Paolo R. Reyes",
  "Angelica M. Cruz",
  "Benedict T. Aquino",
];

export default {
  title: "Modal/FilterModal",
  component: FilterModal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onApply: () => {},
    onClear: () => {},
    onClose: () => {},
    rooms: mockRooms,
    categories: mockCategories,
    custodians: mockCustodians,
    filters: BASE_FILTERS,
    context: "other",
  },
};

// ── Admin view (custodian filter visible) ──────────────────────
export const AdminView = {
  name: "Admin (Custodian Filter Visible)",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export const AdminViewSelected = {
  name: "Admin (Filters Selected)",
  args: {
    filters: {
      status: "Working",
      category: "Computer Set",
      room: "Lab A",
      custodian: "Jasper C. Ortega",
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

// ── Custodian view (custodian filter auto-hidden via role check) ──
export const CustodianView = {
  name: "Custodian (Custodian Filter Hidden)",
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={custodianAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

export const CustodianViewSelected = {
  name: "Custodian (Filters Selected)",
  args: {
    filters: {
      status: "Working",
      category: "Computer Set",
      room: "Lab A",
      custodian: "",
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={custodianAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

// ── Loading state ────────────────────────────────────────────────
export const LoadingOptions = {
  name: "Loading Options (Admin)",
  args: {
    loadingOptions: true,
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

// ── Empty state — verifies "No rooms found." / "No custodians found." ──
export const EmptyOptions = {
  name: "Empty Options (Admin)",
  args: {
    rooms: [],
    categories: [],
    custodians: [],
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};

// ── Room context — Room section hidden ──────────────────────────
export const RoomContext = {
  name: "Room Context (Room Filter Hidden)",
  args: {
    context: "room",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthContext.Provider value={adminAuth}>
          <Story />
        </AuthContext.Provider>
      </MemoryRouter>
    ),
  ],
};
