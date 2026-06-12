// src/stories/form/ImagePanel.stories.jsx
import { useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faXmark,
  faImage,
  faCamera,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import ImagePanel from "../../components/form/ImagePanel";

library.add(faXmark, faImage, faCamera, faUpload);

function ImagePanelWrapper({ title, required, initialImage = null }) {
  const [image, setImage] = useState(initialImage);
  return (
    <ImagePanel
      title={title}
      image={image}
      onImageChange={setImage}
      required={required}
    />
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
export default {
  title: "Form/ImagePanel",
  component: ImagePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

// Empty, optional — no red border
export const Default = {
  name: "Empty (optional)",
  render: () => <ImagePanelWrapper title="Asset Image" required={false} />,
};

// Empty, required — shows red/warning border
export const RequiredEmpty = {
  name: "Empty (required)",
  render: () => <ImagePanelWrapper title="Asset Image" required={true} />,
};

// Pre-filled with an existing image URL (simulates edit mode)
export const WithExistingImage = {
  name: "With existing image",
  render: () => (
    <ImagePanelWrapper
      title="PAR / ICS Document"
      required={true}
      initialImage={{
        preview: "https://placehold.co/400x300?text=Document+Image",
      }}
    />
  ),
};

// Document panel variant
export const DocumentPanel = {
  name: "Document panel (empty, required)",
  render: () => (
    <ImagePanelWrapper title="PAR / ICS Document" required={true} />
  ),
};
