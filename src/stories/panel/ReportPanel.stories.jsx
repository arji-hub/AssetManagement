import { MemoryRouter } from "react-router-dom";
import ReportPanel from "../../components/panel/ReportPanel";

export default {
  title: "Panel/ReportPanel",
  component: ReportPanel,
  // ReportPanel calls useNavigate() internally on row click,
  // so it needs a Router ancestor to avoid the invariant error.
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/report"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    group: {
      control: "select",
      options: ["incident", "repair", "condemn"],
    },
  },
};

export const IncidentReports = {
  args: {
    group: "incident",
  },
};

export const ForRepair = {
  args: {
    group: "repair",
  },
};

export const Condemnation = {
  args: {
    group: "condemn",
  },
};

export const UnknownGroup = {
  args: {
    group: "nonexistent",
  },
};
