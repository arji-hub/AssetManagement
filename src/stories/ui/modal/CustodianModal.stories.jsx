import CustodianModal from "../../../components/ui/modal/CustodianModal";

export default {
  title: "Modal/CustodianModal",
  component: CustodianModal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onClose: () => {},
    onSubmit: () => {},
  },
};

export const Default = {
  name: "Empty Form",
};

export const FilledForm = {
  name: "Filled Form (Add Record Active)",
  play: async ({ canvas, userEvent }) => {
    // ← v10 passes these directly as arguments
    await userEvent.type(
      canvas.getByPlaceholderText("Enter email"),
      "juandelacruz@gmail.com",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Enter password"),
      "juantothree",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Enter username"),
      "JONAS",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Enter first name"),
      "JONAS",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Enter last name"),
      "ORTIZ",
    );
  },
};

export const PartialForm = {
  name: "Partial Form (Add Record Still Blocked)",
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("Enter email"),
      "juandelacruz@gmail.com",
    );
    await userEvent.type(
      canvas.getByPlaceholderText("Enter password"),
      "juantothree",
    );
  },
};
