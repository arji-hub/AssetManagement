import NavButton from "../../components/ui/NavButton";

export default {
  title: "UI/NavButton",
  component: NavButton,
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#252537" },
        { name: "light", value: "#D9D9D9" },
      ],
    },
  },
};

export const Active = {
  args: {
    label: "Dashboard",
    isActive: true,
  },
};

export const Inactive = {
  args: {
    label: "Dashboard",
    isActive: false,
  },
};
