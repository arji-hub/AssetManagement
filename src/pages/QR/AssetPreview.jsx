// AssetPreview.jsx
import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../../components/ui/status/LoadingScreen";
import LandingPage from "./LandingPage";
import { getAssetPreview } from "../../services/assetService";

function AssetPreview() {
  const { user, loading } = useAuth();
  const { assetId } = useParams();
  const [preview, setPreview] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) {
      getAssetPreview(assetId)
        .then(setPreview)
        .finally(() => setFetching(false));
    }
  }, [assetId, user]);

  if (loading) return <LoadingScreen />;

  if (user) {
    return <Navigate to={`/asset/${assetId}`} replace />;
  }

  if (fetching) return <LoadingScreen />;

  return <LandingPage previewAsset={preview} />;
}

export default AssetPreview;