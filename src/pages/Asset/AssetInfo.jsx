import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAssetByID } from "../../services/asset";
import InfoCard from "../../components/ui/card/InfoCard";
import HistoryCard from "../../components/ui/card/HistoryCard";
import "./AssetInfo.css";

function AssetInfo() {
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
      <div className="asset-info-page">
        {/* ── Header ── */}
        <div className="asset-info-header">
          <div className="asset-info-breadcrumb">
            <span className="breadcrumb-parent">Asset Information</span>
          </div>
          <div className="asset-info-actions">
            <button className="action-btn" disabled>
              <i className="ti ti-file-description" aria-hidden="true" />{" "}
              Document
            </button>
            <button className="action-btn" disabled>
              <i className="ti ti-download" aria-hidden="true" /> Export
            </button>
            <button className="action-btn" disabled>
              <i className="ti ti-printer" aria-hidden="true" /> Print
            </button>
            <button className="action-btn" disabled>
              <i className="ti ti-edit" aria-hidden="true" /> Edit
            </button>
            <button className="action-btn action-btn--danger" disabled>
              <i className="ti ti-alert-triangle" aria-hidden="true" /> Report
              Incident
            </button>
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
