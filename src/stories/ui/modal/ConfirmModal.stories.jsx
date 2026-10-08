import React, { useState } from "react";
import {
  faTrash,
  faCircleInfo,
  faCircleCheck,
  faClipboardCheck,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "./ConfirmModal";

// ── Preview wrapper ───────────────────────────────────────
// ConfirmModal is controlled and has no trigger, so each story gets a
// button plus local isOpen state. Pass `isOpen: true` in args to have a
// story start with the dialog already showing.
function ModalPreview({ triggerLabel = "Open modal", ...props }) {
  const [isOpen, setIsOpen] = useState(props.isOpen ?? false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{ padding: "8px 16px", cursor: "pointer" }}
      >
        {triggerLabel}
      </button>

      <ConfirmModal
        {...props}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          props.onClose?.();
        }}
      />
    </>
  );
}

export default {
  title: "Modal/ConfirmModal",
  component: ConfirmModal,
  render: (args) => <ModalPreview {...args} />,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onConfirm: { action: "confirmed" },
    onClose: { action: "closed" },
    isOpen: { control: "boolean" },
    title: { control: "text" },
    iconTone: {
      control: "select",
      options: ["warning", "danger", "success", "info"],
    },
    confirmTone: {
      control: "select",
      options: ["success", "danger", "primary"],
    },
    confirmLabel: { control: "text" },
    cancelLabel: { control: "text" },
    closeLabel: { control: "text" },
    infoOnly: { control: "boolean" },
    closeOnOverlayClick: { control: "boolean" },
    // Icons are FontAwesome definition objects, so they can't be edited
    // from the controls panel.
    icon: { control: false },
    confirmIcon: { control: false },
    children: { control: false },
  },
  args: {
    title: "Are you sure?",
    children: <p>This action will be applied right away.</p>,
  },
};

// ── Stories ───────────────────────────────────────────────
// Click the trigger button in the canvas to open the dialog and try
// Cancel / Confirm, the Escape key, and clicking the backdrop.

export const Default = {};

export const AuditStart = {
  args: {
    title: "Start a new audit?",
    icon: faClipboardCheck,
    children: (
      <p>
        This will begin a new audit session for Room 204. Make sure any audit
        currently in progress for this room has been completed first.
      </p>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Mirrors the copy used by AuditConfirmRoomModal.",
      },
    },
  },
};

export const Destructive = {
  args: {
    title: "Delete this asset?",
    icon: faTrash,
    iconTone: "danger",
    confirmTone: "danger",
    confirmLabel: "Delete",
    confirmIcon: faTrash,
    children: <p>This action can't be undone.</p>,
  },
};

export const SuccessTone = {
  args: {
    title: "Mark audit as complete?",
    icon: faCircleCheck,
    iconTone: "success",
    confirmTone: "success",
    confirmLabel: "Complete audit",
    children: <p>You won't be able to scan more assets after this.</p>,
  },
};

export const InfoTone = {
  args: {
    title: "Heads up",
    icon: faCircleInfo,
    iconTone: "info",
    confirmTone: "primary",
    confirmLabel: "Continue",
    confirmIcon: null,
    children: <p>Changes are saved automatically as you go.</p>,
  },
};

export const InfoOnly = {
  args: {
    title: "No assets to audit",
    infoOnly: true,
    closeLabel: "Return",
    children: (
      <p>
        This room (Room 204) has no assets yet. Add assets to this room before
        starting an audit.
      </p>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Replaces the old isEmpty branch: a single close button, no confirm action.",
      },
    },
  },
};

export const CustomLabels = {
  args: {
    title: "Discard unsaved changes?",
    confirmLabel: "Discard",
    confirmTone: "danger",
    confirmIcon: null,
    cancelLabel: "Keep editing",
    children: <p>Your edits to this form will be lost.</p>,
  },
};

export const RichContent = {
  args: {
    title: "Reassign custodian?",
    icon: faLock,
    children: (
      <>
        <p>
          <strong>Room 204</strong> will be reassigned. The following will
          change:
        </p>
        <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
          <li>Custodian of 14 assets</li>
          <li>Responsibility for the next audit</li>
        </ul>
      </>
    ),
  },
};

export const NoIcon = {
  args: {
    title: "Confirm action",
    icon: null,
    children: <p>A plain dialog without a header icon.</p>,
  },
};

export const OverlayClickDisabled = {
  args: {
    title: "Finish before leaving",
    closeOnOverlayClick: false,
    children: (
      <p>
        Clicking the backdrop won't dismiss this one. Use the buttons or Esc.
      </p>
    ),
  },
};

export const LongContent = {
  args: {
    title: "College of Information and Communications Technology — Server Room",
    children: (
      <p>
        This will begin a new audit session for the College of Information and
        Communications Technology Server Room. Make sure any audit currently in
        progress for this room has been completed first, and that every
        custodian has been notified of the upcoming schedule.
      </p>
    ),
  },
};

// Starts with the dialog already showing, handy for visual regression tests.
export const OpenByDefault = {
  args: {
    isOpen: true,
    title: "Start a new audit?",
    icon: faClipboardCheck,
    children: <p>Rendered open on load.</p>,
  },
};
