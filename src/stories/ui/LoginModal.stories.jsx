import { useState } from "react";
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

export const Default = {
  args: {
    isOpen: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(args.isOpen);

    return (
      <>
        <LoginModal
          {...args}
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
};