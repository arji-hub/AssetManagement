import { MemoryRouter } from "react-router-dom";
import CustodianCard from "../../../components/ui/card/CustodianCard";

export default {
  title: "Cards/CustodianCard",
  component: CustodianCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    name: {
      control: "text",
    },
    username: {
      control: "text",
    },
    classification: {
      control: "select",
      options: ["fulltime", "parttime"],
    },
    totalAssets: {
      control: "number",
    },
  },
};

export const Default = {
  args: {
    name: "Ralph Jasper B. Ortiz",
    classification: "fulltime",
    totalAssets: 777,
    username: "ralphjasper",
  },
};
