import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAssetByID } from "../../services/asset";

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

  if (loading) return <MainLayout>Loading...</MainLayout>;
  if (error) return <MainLayout>{error}</MainLayout>;

  return (
    <MainLayout>
      <div style={{ padding: "1rem", lineHeight: 1.8 }}>
        <p>Asset ID: {asset.id}</p>
        <p>Serial Number: {asset.serial_number}</p>
        <p>Category: {asset.category_id}</p>
        <p>Description: {asset.description}</p>
        <p>Date Acquired: {asset.date_acquired?.toDate?.().toLocaleDateString("en-GB") ?? String(asset.date_acquired)}</p>
        <p>Unit Value: {asset.unit_value}</p>
        <p>Quantity: {asset.qty}</p>
        <p>Status: {asset.status}</p>
        <p>Remarks: {asset.remarks}</p>
        <p>Asset Image URL: {asset.asset_image_url}</p>
        <p>Document Image URL: {asset.doc_image_url}</p>
        <p>QR Code URL: {asset.qr_code_url}</p>
        <p>Property Custodian: {asset.property_custodian_name}</p>
        <p>Local MR: {asset.local_mr_name}</p>
        <p>Room: {asset.room_id}</p>
        <p>Created At: {asset.created_at?.toDate?.().toLocaleString("en-GB")}</p>
        <p>Updated At: {asset.updated_at?.toDate?.().toLocaleString("en-GB")}</p>
      </div>
    </MainLayout>
  );
}

export default AssetInfo;