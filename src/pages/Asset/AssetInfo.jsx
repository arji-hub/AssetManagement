import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

function AssetInfo() {
  const { assetId } = useParams();

  return (
    <MainLayout>this page is under development — assetId: {assetId}</MainLayout>
  );
}

export default AssetInfo;
