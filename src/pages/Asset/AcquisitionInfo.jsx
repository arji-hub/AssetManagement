import React from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../components/layout/MainLayout";
import SearchBar from "../../components/ui/searchBar/SearchBar";
import Table from "../../components/panel/Table";
import AssetCard from "../../components/ui/card/asset/AssetCard";
import BackButton from "../../components/ui/button/BackButton";
import ViewAssetDocument from "../../components/modal/ViewAssetDocument";
import { useAcquisitionInfo } from "../../hooks/asset/useAcquisitionInfo";
import { useAssetFilters } from "../../hooks/asset/useAssetFilters";
import { assetColumns } from "../../data/columns";
import { formatAcquiredDate } from "../../data/columns/acquisitionColumns";
import AuditCard from "../../components/ui/card/audit/AuditCard";
import { toTitleCase } from "../../utils/TextCasing";
import "./Asset.css";
import "./Acquisition.css";

function Stat({ label, children }) {
  return (
    <div>
      <p className="acq-summary-label">{label}</p>
      <p className="acq-summary-value">{children}</p>
    </div>
  );
}

function AcquisitionInfo() {
  const { id } = useParams();

  const { acquisition, assets, loading, error } = useAcquisitionInfo(id);
  const { search, setSearch, filteredAssets } = useAssetFilters(assets);

  const isDonated = acquisition?.acquisition_type === "donated";

  return (
    <MainLayout>
      <div className="asset-page">
        <div className="asset-header">
          <div className="acq-header-main">
            <BackButton />
            <div className="asset-header-left">
              <h1 className="title">Acquisition</h1>
              <p className="date">{id}</p>
            </div>
          </div>

          <div className="asset-header-right">
            {acquisition?.document_url && (
              <ViewAssetDocument doc_image_url={acquisition.document_url}>
                {(open) => (
                  <button className="asset-filter-btn" onClick={open}>
                    <FontAwesomeIcon icon="fa-solid fa-file-lines" />
                    Document
                  </button>
                )}
              </ViewAssetDocument>
            )}
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search assets..."
              className="asset-search-wrap"
            />
          </div>
        </div>

        {acquisition && (
          <div className="acq-summary">
            <AuditCard
              label="Type"
              icon="fa-solid fa-tag"
              value={toTitleCase(acquisition.acquisition_type ?? "") || "N/A"}
            />
            <AuditCard
              label="Date acquired"
              value={formatAcquiredDate(acquisition.date_acquired) || "N/A"}
            />
            <AuditCard
              label={isDonated ? "Donated by" : "Supplier"}
              value={acquisition.source || "N/A"}
            />
            <AuditCard
              label="Assets"
              icon="fa-solid fa-boxes-stacked"
              value={acquisition.asset_count}
            />
          </div>
        )}

        <Table
          columns={assetColumns}
          items={filteredAssets}
          loading={loading}
          error={error}
          itemLabel="assets"
          emptyMessage="No assets found for this acquisition."
          emptyIcon="fa-solid fa-box-open"
          desktopPageSize={20}
          mobilePageSize={10}
          renderItem={(asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              columns={assetColumns}
            />
          )}
        />
      </div>
    </MainLayout>
  );
}

export default AcquisitionInfo;
