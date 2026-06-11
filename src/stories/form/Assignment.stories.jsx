// src/stories/form/Assignment.stories.jsx
import { useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Assignment from "../../components/form/Assignment";

library.add(faTriangleExclamation);

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_FULLTIME = [
  { id: "ft-1", fullname: "Juan dela Cruz" },
  { id: "ft-2", fullname: "Maria Santos" },
];

const MOCK_PARTTIME = [
  { id: "pt-1", fullname: "Pedro Reyes" },
  { id: "pt-2", fullname: "Ana Gonzales" },
];

const MOCK_ROOMS = [
  { id: "room-1", name: "ProgLab 1" },
  { id: "room-2", name: "ProgLab 2" },
  { id: "room-3", name: "SDL 1" },
  { id: "room-4", name: "Faculty Room" },
];

const EMPTY_FORM = {
  primary_custodian: "",
  local_custodian: "",
  room_id: "",
};

// ─── Stateful wrapper ─────────────────────────────────────────────────────────
function AssignmentWrapper({
  initialForm = EMPTY_FORM,
  skippedWarning = false,
  loadingOptions = false,
  fulltimeCustodians = MOCK_FULLTIME,
  parttimeCustodians = MOCK_PARTTIME,
  rooms = MOCK_ROOMS,
}) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Assignment
      form={form}
      onChange={handleChange}
      skippedWarning={skippedWarning}
      fulltimeCustodians={fulltimeCustodians}
      parttimeCustodians={parttimeCustodians}
      rooms={rooms}
      loadingOptions={loadingOptions}
    />
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
export default {
  title: "Form/Assignment",
  component: Assignment,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

// All dropdowns empty — initial state when user lands on Step 3
export const Default = {
  name: "Empty (unassigned)",
  render: () => <AssignmentWrapper />,
};

// Dropdowns still loading from Firestore
export const Loading = {
  name: "Loading options",
  render: () => (
    <AssignmentWrapper
      loadingOptions={true}
      fulltimeCustodians={[]}
      parttimeCustodians={[]}
      rooms={[]}
    />
  ),
};

// User clicked "Skip for now" — warning banner visible
export const SkipWarning = {
  name: "Skip warning visible",
  render: () => <AssignmentWrapper skippedWarning={true} />,
};

// All fields selected — Save button would be enabled
export const FullyAssigned = {
  name: "Fully assigned",
  render: () => (
    <AssignmentWrapper
      initialForm={{
        primary_custodian: "ft-1",
        local_custodian: "pt-2",
        room_id: "room-1",
      }}
    />
  ),
};

// Only room selected — partial assignment
export const RoomOnlyAssigned = {
  name: "Room only assigned",
  render: () => (
    <AssignmentWrapper
      initialForm={{
        primary_custodian: "",
        local_custodian: "",
        room_id: "room-3",
      }}
    />
  ),
};

// No custodians or rooms available — empty Firestore collections edge case
export const NoCustodiansOrRooms = {
  name: "No custodians or rooms available",
  render: () => (
    <AssignmentWrapper
      fulltimeCustodians={[]}
      parttimeCustodians={[]}
      rooms={[]}
    />
  ),
};