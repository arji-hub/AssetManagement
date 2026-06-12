import { useState } from "react";
import RoomModal from "../../../components/ui/modal/RoomModal";

// ── Decorator ────────────────────────────────────────────────────────────────
// RoomModal is now a controlled component — it needs value/onChange from
// outside. This decorator wraps every story in a stateful parent so the
// input stays functional in the Storybook canvas.
const withRoomState = (Story, context) => {
  const [value, setValue] = useState(context.args.value ?? "");
  const [error, setError] = useState(context.args.error ?? "");

  const handleChange = (e) => {
    const next = e.target.value;
    setValue(next);
    // Clear error on change, matching hook behaviour
    if (error) setError("");
  };

  return (
    <Story
      args={{
        ...context.args,
        value,
        onChange: handleChange,
        error,
      }}
    />
  );
};

// ── Meta ─────────────────────────────────────────────────────────────────────
export default {
  title: "Modal/RoomModal",
  component: RoomModal,
  decorators: [withRoomState],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    onClose: () => {},
    onSubmit: async () => {},
    value: "",
    onChange: () => {},
    error: "",
    isSubmitting: false,
  },
};

// ── Stories ──────────────────────────────────────────────────────────────────
export const Default = {
  name: "Empty Form",
};

export const FilledForm = {
  name: "Filled Form (Add Room Active)",
  args: {
    value: "Computer Lab 3",
  },
};

export const DuplicateError = {
  name: "Duplicate Name (Blocked)",
  args: {
    value: "Computer Lab 1",
    error: '"Computer Lab 1" already exists.',
  },
};

export const IsSubmitting = {
  name: "Slow Submit (Loading State)",
  args: {
    value: "New Room",
    isSubmitting: true,
  },
};

export const SubmitError = {
  name: "Submit Error (Firestore Failure)",
  args: {
    value: "New Room",
    error: "Firestore: permission denied.",
  },
};