import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import { fetchAssets } from "../../services/assetService";
import { ROLES } from "../../data/roles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Asset.css";

//condition badge color map
const CONDITION_COLORS = {
  Working: { bg: "#16a34a", color: "#fff" },
  Missing: { bg: "#dc2626", color: "#fff" },
  "Under Maintenance": { bg: "#d97706", color: "#fff" },
  Damaged: { bg: "#ea580c", color: "#fff" },
  Condemned: { bg: "#6b7280", color: "#fff" },
};

function ConditionBadge({ condition }) {
  const style = CONDITION_COLORS[condition] || {
    bg: "#6b7280",
    color: "#fff",
    cursor: "default",
  };
  return (
    <span
      className="asset-condition-badge"
      style={{ background: style.bg, color: style.color, cursor: style.cursor }}
    >
      {condition}
    </span>
  );
}

//filter dropdown
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="asset-filter-wrap">
      <button
        className={`asset-filter-btn ${value ? "asset-filter-btn--active" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        {value || label}
        <FontAwesomeIcon
          icon="fa-solid fa-chevron-down"
          className="asset-filter-icon"
        />
      </button>
      {open && (
        <div className="asset-filter-dropdown">
          <div
            className="asset-filter-option"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            All
          </div>
          {options.map((opt) => (
            <div
              key={opt}
              className={`asset-filter-option ${value === opt ? "asset-filter-option--selected" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//main component
function Asset() {
  const { user, role, currentUser } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filter state
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterCustodian, setFilterCustodian] = useState("");
  const [search, setSearch] = useState("");

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

  //derive unique filter options from data
  const categories = useMemo(
    () => [...new Set(assets.map((a) => a.category_id).filter(Boolean))],
    [assets],
  );
  const locations = useMemo(
    () => [...new Set(assets.map((a) => a.room_id).filter(Boolean))],
    [assets],
  );
  const conditions = useMemo(
    () => [...new Set(assets.map((a) => a.condition).filter(Boolean))],
    [assets],
  );
  const custodians = useMemo(
    () => [
      ...new Set(assets.map((a) => a.property_custodian_name).filter(Boolean)),
    ],
    [assets],
  );

  //filtered list
  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.asset_id?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.serial_number?.toLowerCase().includes(q);
      const matchCat = !filterCategory || a.category_id === filterCategory;
      const matchLoc = !filterLocation || a.room_id === filterLocation;
      const matchCond = !filterCondition || a.condition === filterCondition;
      const matchCust =
        !filterCustodian || a.property_custodian === filterCustodian;
      return matchSearch && matchCat && matchLoc && matchCond && matchCust;
    });
  }, [
    assets,
    search,
    filterCategory,
    filterLocation,
    filterCondition,
    filterCustodian,
  ]);

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
            {/* filters */}
            <FilterDropdown
              label="Category ▾"
              options={categories}
              value={filterCategory}
              onChange={setFilterCategory}
            />
            <FilterDropdown
              label="Location ▾"
              options={locations}
              value={filterLocation}
              onChange={setFilterLocation}
            />
            <FilterDropdown
              label="Condition ▾"
              options={conditions}
              value={filterCondition}
              onChange={setFilterCondition}
            />
            {isAdmin && (
              <FilterDropdown
                label="Custodian ▾"
                options={custodians}
                value={filterCustodian}
                onChange={setFilterCustodian}
              />
            )}

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

        {/* search */}
        <div className="asset-search-wrap">
          <FontAwesomeIcon
            icon="fa-solid fa-magnifying-glass"
            className="asset-search-icon"
          />
          <input
            className="asset-search"
            placeholder="Search by ID, description, serial number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* table */}
        <div className="asset-table-wrap">
          {loading ? (
            <div className="asset-empty">Loading assets…</div>
          ) : error ? (
            <div className="asset-empty asset-empty--error">{error}</div>
          ) : filtered.length === 0 ? (
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
                {filtered.map((asset) => (
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
                      <ConditionBadge condition={asset.condition} />
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
            {filtered.length} asset{filtered.length !== 1 ? "s" : ""} shown
          </span>
        </div>
      </div>
    </MainLayout>
  );
}

export default Asset;
