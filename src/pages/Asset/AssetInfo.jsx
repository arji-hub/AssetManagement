import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAssetByID } from "../../services/asset";
import InfoCard from "../../components/panel/InfoCard";
import HistoryCard from "../../components/panel/HistoryCard";
import ViewAssetQR from "../../components/ui/modal/ViewAssetQr";
import ViewAssetDocument from "../../components/ui/modal/ViewAssetDocument";
import ManageAsset from "../../components/ui/dropdown/ManageAsset";
import "./AssetInfo.css";

function AssetInfo() {
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAssetByID(assetId)
      .then(setAsset)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [assetId]);
  if (loading)
    return (
      <MainLayout>
        <div className="asset-info-loading">Loading asset...</div>
      </MainLayout>
    );
  if (error)
    return (
      <MainLayout>
        <div className="asset-info-error">{error}</div>
      </MainLayout>
    );

  return (
    <MainLayout>
      {
        //show asset
        console.log("Asset Info:", asset)
      }
      <div className="asset-info-page">
        {/* ── Header ── */}
        <div className="asset-info-header">
          <div className="asset-info-breadcrumb">
            <button
              className="return-button"
              onClick={() => navigate("/asset")}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              Back
            </button>
            <span className="breadcrumb-parent">Asset Information</span>
          </div>
          <div className="asset-info-actions">
            <button className="action-btn" disabled>
              <i className="ti ti-download" aria-hidden="true" /> wala pa
            </button>
            <ViewAssetDocument doc_image_url={asset.doc_image_url} />
            <ViewAssetQR qr_code_url={asset.qr_code_url} assetID={assetId} />
            <ManageAsset asset={asset} />
          </div>
        </div>

        {/* ── Info Card ── */}
        <InfoCard asset={asset} />

        {/* ── History Card ── */}
        <HistoryCard assetId={assetId} />
      </div>
    </MainLayout>
  );
}

export default AssetInfo;
