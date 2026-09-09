import "./Form.css";
import "./Media.css";
import ImagePanel from "./ImagePanel";

function Media({
  assetImage,
  setAssetImage,
  docImage,
  setDocImage,
  acquisitionType,
}) {
  const isDonated = acquisitionType === "donated";
  const docTitle = isDonated ? "Deed of Donation" : "PAR / ICS Document";

  return (
    <div className="reg-card">
      <p className="reg-card-title">Asset Media</p>
      <p className="reg-card-subtitle">
        Both images are required before proceeding.
      </p>

      <div className="reg-media-grid">
        <ImagePanel
          title="Asset Image"
          image={assetImage}
          onImageChange={setAssetImage}
          required
        />
        <ImagePanel
          title={docTitle}
          image={docImage}
          onImageChange={setDocImage}
          required
        />
      </div>
    </div>
  );
}

export default Media;
