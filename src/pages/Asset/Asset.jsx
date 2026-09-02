// src/pages/Asset/Asset.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { ROLES } from "../../data/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Asset.css";
import FilterModal from "../../components/modal/FilterModal";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import { useAssetFilters } from "../../hooks/asset/useAssetFilters";
import { useAssets } from "../../hooks/asset/useAssets";
import { displayDate } from "../../utils/date";
import Table from "../../components/panel/Table";
import AssetCard from "../../components/ui/card/asset/AssetCard";
import { assetColumns } from "../../data/columns";

function Asset() {
  const { role, currentUser } = useAuth();
  const navigate = useNavigate();

  const isAdmin = role === ROLES.ADMIN;

  const { assets, loading, error } = useAssets(role, currentUser);

  const {
    showFilter,
    setShowFilter,
    filters,
    setFilters,
    search,
    setSearch,
    activeFilterCount,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
    rooms,
    categories,
    custodians,
    loadingOptions,
  } = useAssetFilters(assets);

  return (
    <MainLayout>
      <div className="asset-page">
        {/* header */}
        <div className="asset-header">
          <div className="asset-header-left">
            <h1 className="title">Assets</h1>
            <p className="date">{displayDate}</p>
          </div>

          <div className="asset-header-right">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search assets..."
              className="asset-search-wrap"
            />

            <button
              className={`asset-filter-btn${activeFilterCount > 0 ? " asset-filter-btn--active" : ""}`}
              onClick={() => setShowFilter(true)}
            >
              <FontAwesomeIcon icon="fa-solid fa-sliders" />
              Filters
              {activeFilterCount > 0 && (
                <span className="asset-filter-badge">{activeFilterCount}</span>
              )}
            </button>

            {isAdmin && (
              <button
                className="asset-add-btn"
                onClick={() => navigate("/asset/registration")}
              >
                + Add Asset
              </button>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="asset-active-filters">
            {Object.entries(filters).map(([key, val]) =>
              val ? (
                <span key={key} className="asset-active-pill">
                  {val}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, [key]: "" }))
                    }
                    aria-label={`Remove ${key} filter`}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-xmark" />
                  </button>
                </span>
              ) : null,
            )}
            <button className="asset-clear-all" onClick={handleClearFilters}>
              Clear all
            </button>
          </div>
        )}

        <Table
          columns={assetColumns}
          items={filteredAssets}
          loading={loading}
          error={error}
          itemLabel="assets"
          emptyMessage="No assets found."
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

        {showFilter && (
          <FilterModal
            context="asset"
            filters={filters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
            onClose={() => setShowFilter(false)}
            rooms={rooms}
            categories={categories}
            custodians={custodians}
            loadingOptions={loadingOptions}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default Asset;
