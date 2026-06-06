import CustodianCard from "../../components/ui/CustodianCard";

export default {
  title: "Cards/CustodianCard",
  component: CustodianCard,
  tags: ["autodocs"],
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
