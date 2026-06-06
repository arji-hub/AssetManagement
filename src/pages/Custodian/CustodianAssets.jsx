import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./CustodianAssets.css";

// Placeholder asset data — replace with real Firestore fetch using username
const MOCK_ASSETS = [
  {
    id: 1,
    name: "Laptop Dell XPS 15",
    category: "Electronics",
    status: "Active",
    dateAssigned: "2024-01-10",
  },
  {
    id: 2,
    name: "Office Chair",
    category: "Furniture",
    status: "Active",
    dateAssigned: "2023-08-22",
  },
  {
    id: 3,
    name: "Projector Epson X41",
    category: "Electronics",
    status: "Under Repair",
    dateAssigned: "2023-05-15",
  },
  {
    id: 4,
    name: "Whiteboard 4x6",
    category: "Furniture",
    status: "Active",
    dateAssigned: "2022-11-03",
  },
  {
    id: 5,
    name: "Desktop PC",
    category: "Electronics",
    status: "Inactive",
    dateAssigned: "2021-09-18",
  },
  {
    id: 6,
    name: "Filing Cabinet",
    category: "Furniture",
    status: "Active",
    dateAssigned: "2023-12-01",
  },
];

const STATUS_CLASS = {
  Active: "status-active",
  Inactive: "status-inactive",
  "Under Repair": "status-repair",
};

function CustodianAssets() {
  const { username } = useParams();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="assets-page">
        {/* ── Top bar ── */}
        <div className="assets-top">
          <div className="assets-header">
            <button
              className="return-button"
              onClick={() => navigate("/custodian")}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              Back
            </button>
            <div>
              <h1 className="assets-title">Assets in Custody</h1>
              <p className="assets-subtitle">
                Showing assets registered under <strong>{username}</strong>
              </p>
            </div>
          </div>

          <div className="assets-settings">
            <div className="filters">
              <label htmlFor="status-filter">Status:</label>
              <select id="status-filter">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="repair">Under Repair</option>
              </select>
            </div>
            <div className="filters">
              <label htmlFor="category-filter">Category:</label>
              <select id="category-filter">
                <option value="">All</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Asset list ── */}
        <div className="assets-list">
          {MOCK_ASSETS.length === 0 ? (
            <div className="assets-empty">
              <FontAwesomeIcon icon="fa-solid fa-box-open" />
              <p>No assets found for this custodian.</p>
            </div>
          ) : (
            <table className="assets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date Assigned</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ASSETS.map((asset, index) => (
                  <tr key={asset.id}>
                    <td className="asset-index">{index + 1}</td>
                    <td className="asset-name">
                      <FontAwesomeIcon
                        icon="fa-solid fa-box-archive"
                        className="asset-row-icon"
                      />
                      {asset.name}
                    </td>
                    <td>{asset.category}</td>
                    <td>
                      <span
                        className={`asset-status ${STATUS_CLASS[asset.status]}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td>{asset.dateAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default CustodianAssets;
