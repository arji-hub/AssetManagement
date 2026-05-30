import LoadingScreen from "../../components/ui/LoadingScreen";

export default {
  title: "UI/LoadingScreen",
  component: LoadingScreen,
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f7f9fc" },
        { name: "dark", value: "#252537" },
      ],
    },
    layout: "fullscreen",
  },
};

export const Default = {
  args: {},
};
