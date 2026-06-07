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
  },
};

// ── No filters selected (default) ────────────────────────────
export const Default = {
  name: "No Filters Selected",
  args: {
    filters: { status: "", category: "", room: "" },
    initialRooms: ["Room 101", "Room 102", "Lab A", "Lab B", "SDL 1"],
  },
};

export const AllSelected = {
  name: "All Filters Selected",
  args: {
    filters: { status: "Working", category: "Computer Set", room: "Lab A" },
    initialRooms: ["Room 101", "Room 102", "Lab A", "Lab B", "SDL 1"],
  },
};
