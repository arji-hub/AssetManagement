import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAssets } from "../../services/asset";
import { ROLES } from "../../data/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Asset.css";
import { Status } from "../../components/ui/status/assetStatus";
import FilterModal from "../../components/ui/modal/FilterModal";
import { useAssetFilters } from "../../hooks/useAssetFilters";
import { formatDate } from "../../utils/formatDate";

function Asset() {
  const { user, role, currentUser } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = role === ROLES.ADMIN;

  const {
    showFilter,
    setShowFilter,
    filters,
    setFilters,
    activeFilterCount,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
    rooms,
    categories,
    custodians,
    loadingOptions,
  } = useAssetFilters(assets);
  // fetch assets
  useEffect(() => {
    console.log("Current user:", currentUser.uid, "Role:", role);
    if (!currentUser) return;
    setLoading(true);
    fetchAssets(role, currentUser.uid)
      .then(setAssets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [role, currentUser]);

  const today = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <MainLayout>
      <div className="asset-page">
        {/* header */}
        <div className="asset-header">
          <div className="asset-header-left">
            <h1 className="asset-title">Assets</h1>
            <p className="asset-date">{today}</p>
          </div>

          <div className="asset-header-right">
            {/* Filter button */}
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

            {/* Add Asset — admin only */}
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

        {/* active filter pills */}
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

        {/* table */}
        <div className="asset-table-wrap">
          <table className="asset-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Location</th>
                <th>Custodian</th>
                <th>Local MR</th>
                <th>Qty</th>
                <th>Unit Value</th>
                <th>Status</th>
                <th>Date Acquired</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="100%" className="asset-empty-cell">
                    <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                    <p>Loading assets…</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="100%" className="asset-empty-cell">
                    <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
                    <p>{error}</p>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="100%" className="asset-empty-cell">
                    <FontAwesomeIcon icon="fa-solid fa-box-open" />
                    No assets found.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.id || "—"}</td>
                    <td className="asset-desc">{asset.description || "—"}</td>
                    <td>{asset.category_id || "—"}</td>
                    <td>{asset.room_id || "—"}</td>
                    <td>{asset.property_custodian_name || "—"}</td>
                    <td>{asset.local_mr_name || "—"}</td>
                    <td>{asset.qty ?? 1}</td>
                    <td>{asset.unit_value?.toLocaleString() ?? "—"}</td>
                    <td>
                      <Status status={asset.status} />
                    </td>
                    <td>{formatDate(asset.date_acquired)}</td>
                    <td>
                      <button
                        className="asset-action-btn"
                        onClick={() => navigate(`/asset/${asset.id}`)}
                        aria-label="Actions"
                      >
                        <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* footer bar */}
        <div className="asset-footer-bar">
          <span>
            {filteredAssets.length} asset
            {filteredAssets.length !== 1 ? "s" : ""} shown
            {activeFilterCount > 0 && ` (filtered from ${assets.length})`}
          </span>
        </div>

        {/* filter modal */}
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
