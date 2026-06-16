// AssetPreview.jsx
import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../../components/ui/status/LoadingScreen";
import LandingPage from "../LandingPage/LandingPage";
import { fetchAssetByID } from "../../services/asset";

function AssetPreview() {
  const { user, loading } = useAuth();
  const { assetId } = useParams();
  const [preview, setPreview] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    console.log("effect ran — user:", user, "loading:", loading);
    if (!user) {
      fetchAssetByID(assetId)
        .then((asset) => {
          console.log("fetched:", asset);
          setPreview(asset);
        })
        .catch((err) => {
          console.log("fetch error:", err);
          setPreview(null);
        })
        .finally(() => setFetching(false));
    }
  }, [assetId, user]);

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={`/asset/info/${assetId}`} replace />;
  if (fetching) return <LoadingScreen />;

  return <LandingPage previewAsset={preview} />;
}

export default AssetPreview;
