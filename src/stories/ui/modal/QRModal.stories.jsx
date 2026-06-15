import { useState } from "react";
import QRModal from "../../../components/ui/modal/QRModal";

export default {
  title: "Modal/QRModal",
  component: QRModal,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onCameraScan: { action: "camera scan clicked" },
    onImageUpload: { action: "image uploaded" },
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
        <QRModal {...args} isOpen={open} onClose={() => setOpen(false)} />
      </>
    );
  },
};