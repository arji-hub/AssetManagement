import NavButton from "../../../components/ui/button/NavButton";

export default {
  title: "UI/NavButton",
  component: NavButton,
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
