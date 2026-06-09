import React, { useState } from "react";
import "./CustodianAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/modal/FilterModal";
import { ASSET_STATUS, ASSET_CATEGORIES } from "../../data/assets";
import { Status } from "../../components/ui/status/assetStatus";
import { useAssetFilters } from "../../hooks/useAssetFilters";

const MOCK_ASSETS = [
  {
    id: 1,
    name: "Laptop Dell XPS 15",
    category: "Electronics",
    room: "SDL1",
    status: "Working",
    dateAssigned: "2024-01-10",
    custodian: "John Mark Reyes",
  },
  {
    id: 2,
    name: "Office Chair",
    category: "Furniture",
    room: "SDL2",
    status: "Missing",
    dateAssigned: "2023-08-22",
    custodian: "Maria Clara Santos",
  },
  {
    id: 3,
    name: "Projector Epson X41",
    category: "Electronics",
    room: "Proglab 1",
    status: "For Repair",
    dateAssigned: "2023-05-15",
    custodian: "Andrei Luis Cruz",
  },
  {
    id: 4,
    name: "Whiteboard 4x6",
    category: "Furniture",
    room: "SDL3",
    status: "Working",
    dateAssigned: "2022-11-03",
    custodian: "Angelica Mae Dizon",
  },
  {
    id: 5,
    name: "Desktop PC",
    category: "Electronics",
    room: "Proglab 2",
    status: "Condemned",
    dateAssigned: "2021-09-18",
    custodian: "Michael Angelo Torres",
  },
  {
    id: 6,
    name: "Filing Cabinet",
    category: "Furniture",
    room: "SDL4",
    status: "Working",
    dateAssigned: "2023-12-01",
    custodian: "Kristine Joy Bautista",
  },
  {
    id: 7,
    name: "Printer HP LaserJet Pro",
    category: "Electronics",
    room: "Admin Office",
    status: "For Repair",
    dateAssigned: "2024-02-14",
    custodian: "Ronald James Lim",
  },
  {
    id: 8,
    name: "Air Conditioner 1.5HP",
    category: "Appliance",
    room: "SDL1",
    status: "Working",
    dateAssigned: "2022-06-30",
    custodian: "Patricia Anne Gomez",
  },
  {
    id: 9,
    name: "Steel Locker",
    category: "Furniture",
    room: "Storage Room",
    status: "Missing",
    dateAssigned: "2023-03-19",
    custodian: "Kevin Rafael Santos",
  },
  {
    id: 10,
    name: "Network Router TP-Link",
    category: "Electronics",
    room: "Server Room",
    status: "Working",
    dateAssigned: "2024-05-08",
    custodian: "Stephanie Marie Dela Cruz",
  },
];


function CustodianAssets() {
  const { username } = useParams();
  const navigate = useNavigate();
  //const [assets, setAssets] = useState([]);
  const [assets] = useState(MOCK_ASSETS);

  const {
    showFilter,
    setShowFilter,
    filters,
    setFilters,
    activeFilterCount,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
  } = useAssetFilters(assets);

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
                Showing assets registered For <strong>{username}</strong>
              </p>
            </div>
          </div>

          <div className="assets-settings">
            <button
              className={`filter-button ${activeFilterCount > 0 ? "filter-button--active" : ""}`}
              onClick={() => setShowFilter(true)}
            >
              <FontAwesomeIcon icon="fa-solid fa-sliders" />
              Filters
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Asset list ── */}
        <div className="assets-list">
          {filteredAssets.length === 0 ? (
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
                  <th>Room</th>
                  <th>Status</th>
                  <th>Date Assigned</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, index) => (
                  <tr key={asset.id}>
                    <td className="asset-index">{index + 1}</td>
                    <td className="asset-name">{asset.name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.room}</td>
                    <td>
                      <Status status={asset.status} />
                    </td>
                    <td>{asset.dateAssigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Filter Modal ── */}
      {showFilter && (
        <FilterModal
          context="custodian"
          filters={filters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </MainLayout>
  );
}

export default CustodianAssets;
