import { MemoryRouter } from "react-router-dom";
import BackButton from "../../../components/ui/button/BackButton";

export default {
  title: "UI/BackButton",
  component: BackButton,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

// Default state — BackButton takes no props, so this is the only
// real variant; other stories below simulate different history
// conditions rather than different props.
export const Default = {};

// Simulates landing on a page with prior in-app history present
// (idx > 0), so clicking the button calls navigate(-1).
export const WithHistory = {
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={["/dashboard", "/audit/room"]}
        initialIndex={1}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
  render: () => {
    // MemoryRouter doesn't populate window.history.state the same
    // way a real browser does, so this story is mainly useful for
    // visually confirming layout/hover states rather than testing
    // the actual fallback branching logic (that's better covered by
    // a unit test that mocks window.history.state directly).
    return <BackButton />;
  },
};

export const NoHistoryFallback = {
  render: () => <BackButton />,
};
