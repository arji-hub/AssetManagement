import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAssets } from "../../services/asset";
import { ROLES } from "../../data/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Asset.css";
import { Condition } from "../../components/ui/status/condition";

function Asset() {
  const { user, role, currentUser } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = role === ROLES.ADMIN;

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

  //date formatter
  const fmtDate = (val) => {
    if (!val) return "—";
    if (val?.toDate) return val.toDate().toLocaleDateString("en-GB");
    return new Date(val).toLocaleDateString("en-GB");
  };

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

        {/* table */}
        <div className="asset-table-wrap">
          {loading ? (
            <div className="asset-empty">Loading assets…</div>
          ) : error ? (
            <div className="asset-empty asset-empty--error">{error}</div>
          ) : assets.length === 0 ? (
            <div className="asset-empty">No assets found.</div>
          ) : (
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
                  <th>Condition</th>
                  <th>Date Acquired</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
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
                      <Condition condition={asset.condition} />
                    </td>
                    <td>{fmtDate(asset.date_acquired)}</td>
                    <td>
                      <button
                        className="asset-action-btn"
                        onClick={() => {
                          /* open action menu */
                        }}
                        aria-label="Actions"
                      >
                        <FontAwesomeIcon icon="fa-solid fa-ellipsis-vertical" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* footer bar */}
        <div className="asset-footer-bar">
          <span>
            {assets.length} asset{assets.length !== 1 ? "s" : ""} shown
          </span>
        </div>
      </div>
    </MainLayout>
  );
}

export default Asset;
