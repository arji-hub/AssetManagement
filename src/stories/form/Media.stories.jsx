import { useState } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faXmark,
  faImage,
  faCamera,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import Media from "../../components/form/Media";

library.add(faXmark, faImage, faCamera, faUpload);

function MediaWrapper({ initialAssetImage = null, initialDocImage = null }) {
  const [assetImage, setAssetImage] = useState(initialAssetImage);
  const [docImage, setDocImage] = useState(initialDocImage);

  return (
    <Media
      assetImage={assetImage}
      setAssetImage={setAssetImage}
      docImage={docImage}
      setDocImage={setDocImage}
    />
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────
export default {
  title: "Form/Media",
  component: Media,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

// ─── Stories ──────────────────────────────────────────────────────────────────

// Both panels empty — initial state when user lands on Step 2
export const Default = {
  name: "Both empty",
  render: () => <MediaWrapper />,
};

// Asset image filled, document empty — partial state
export const AssetImageOnly = {
  name: "Asset image filled, document empty",
  render: () => (
    <MediaWrapper
      initialAssetImage={{
        preview: "https://placehold.co/400x300?text=Asset+Image",
      }}
    />
  ),
};

// Document filled, asset empty — partial state
export const DocImageOnly = {
  name: "Document filled, asset empty",
  render: () => (
    <MediaWrapper
      initialDocImage={{
        preview: "https://placehold.co/400x300?text=PAR+Document",
      }}
    />
  ),
};

// Both panels filled — ready to proceed to Step 3
export const BothFilled = {
  name: "Both filled (ready to proceed)",
  render: () => (
    <MediaWrapper
      initialAssetImage={{
        preview: "https://placehold.co/400x300?text=Asset+Image",
      }}
      initialDocImage={{
        preview: "https://placehold.co/400x300?text=PAR+Document",
      }}
    />
  ),
};
