import { MemoryRouter } from "react-router-dom";
import FilterModal from "../../../components/ui/modal/FilterModal";

export default {
  title: "Modal/FilterModal",
  component: FilterModal,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    onApply: () => {},
    onClear: () => {},
    onClose: () => {},
    initialRooms: ["Room 101", "Room 102", "Lab A", "Lab B", "SDL 1"],
  },
};

const BASE_FILTERS = { status: "", category: "", room: "", custodian: "" };

// ── Default (shows all sections) ─────────────────────────────
export const Default = {
  name: "Default (All Sections Visible)",
  args: {
    filters: BASE_FILTERS,
    context: "other",
  },
};

export const AllSelected = {
  name: "All Filters Selected",
  args: {
    filters: {
      status: "Working",
      category: "Computer Set",
      room: "Lab A",
      custodian: "Jasper C. Ortega",
    },
    context: "other",
  },
};

// ── Used in Custodian context (Room section hidden) ───────────
export const CustodianContext = {
  name: "Custodian Context (Room Hidden)",
  args: {
    filters: BASE_FILTERS,
    context: "custodian",
  },
};

export const CustodianContextSelected = {
  name: "Custodian Context (Filters Selected)",
  args: {
    filters: {
      status: "Working",
      category: "Computer Set",
      room: "",
      custodian: "",
    },
    context: "custodian",
  },
};

// ── Used in Room context (Custodian section hidden) ───────────
export const RoomContext = {
  name: "Room Context (Custodian Hidden)",
  args: {
    filters: BASE_FILTERS,
    context: "room",
  },
};

export const RoomContextSelected = {
  name: "Room Context (Filters Selected)",
  args: {
    filters: {
      status: "Active",
      category: "Furniture",
      room: "",
      custodian: "",
    },
    context: "room",
  },
};
