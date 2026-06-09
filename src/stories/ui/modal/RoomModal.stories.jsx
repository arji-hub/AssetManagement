import RoomModal from "../../../components/ui/modal/RoomModal";

export default {
  title: "Modal/RoomModal",
  component: RoomModal,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onClose: () => {},
    onSubmit: async () => {},
    existingRooms: [],
  },
};

export const Default = {
  name: "Empty Form",
};

export const FilledForm = {
  name: "Filled Form (Add Room Active)",
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Computer Lab 1"),
      "Computer Lab 3",
    );
  },
};

export const DuplicateRoom = {
  name: "Duplicate Name (Blocked)",
  args: {
    existingRooms: ["Computer Lab 1", "Room 101", "Faculty Office"],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Computer Lab 1"),
      "Computer Lab 1",
    );
  },
};

export const SlowSubmit = {
  name: "Slow Submit (Loading State)",
  args: {
    onSubmit: async () => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Computer Lab 1"),
      "New Room",
    );
    await userEvent.click(canvas.getByRole("button", { name: /add room/i }));
  },
};

export const SubmitError = {
  name: "Submit Error (Firestore Failure)",
  args: {
    onSubmit: async () => {
      await new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Firestore: permission denied.")),
          800,
        ),
      );
    },
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("e.g. Computer Lab 1"),
      "New Room",
    );
    await userEvent.click(canvas.getByRole("button", { name: /add room/i }));
  },
};
