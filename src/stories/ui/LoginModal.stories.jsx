import React from "react";
import LoginModal from "../../components/ui/LoginModal";

export default {
  title: "UI/LoginModal",
  component: LoginModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onLogin: { action: "login submitted" },
  },
};

const Template = (args) => <LoginModal {...args} />;

export const Default = Template.bind({});
Default.args = {
  onLogin: async (email, password) => {
    console.log("Login attempted:", email, password);
  },
};

export const WithError = Template.bind({});
WithError.args = {
  onLogin: async () => {
    throw new Error("Invalid username or password.");
  },
};
WithError.storyName = "With error (wrong credentials)";

export const Loading = Template.bind({});
Loading.args = {
  onLogin: async () => {
    await new Promise((resolve) => setTimeout(resolve, 99999));
  },
};
Loading.storyName = "Loading state";

export const OnBackground = (args) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 60px 60px",
    }}
  >
    <LoginModal {...args} />
  </div>
);
OnBackground.args = {
  onLogin: async (email, password) => {
    console.log("Login attempted:", email, password);
  },
};
OnBackground.storyName = "On dark background";