import React, { useState } from "react";
import LogoutModal from "../../components/ui/LogoutModal";

export default {
  title: "UI/LogoutModal",
  component: LogoutModal,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onConfirm: { action: "confirmed logout" },
    onCancel: { action: "cancel clicked" },
  },
};

const Template = (args) => {
  const [open, setOpen] = useState(args.isOpen);

  const handleCancel = () => {
    setOpen(false);
    args.onCancel();
  };

  const handleConfirm = () => {
    setOpen(false);
    args.onConfirm();
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>logout</button>

      <LogoutModal
        {...args}
        isOpen={open}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  isOpen: false,
  userEmail: "user@example.com",
};

export const Open = Template.bind({});
Open.args = {
  isOpen: true,
  userEmail: "user@example.com",
};
