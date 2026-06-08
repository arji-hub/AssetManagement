import React, { useState } from "react";
import "./RoomAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/modal/FilterModal";

const MOCK_ASSETS = [
  {
    id: 1,
    name: "Laptop Dell XPS 15",
    category: "Electronics",
    custodian: "Ralph Gomez M. Gatmaitan",
    status: "Active",
    dateAssigned: "2024-01-10",
  },
  {
    id: 2,
    name: "Office Chair",
    category: "Furniture",
    custodian: "Jasper C. Ortega",
    status: "Active",
    dateAssigned: "2023-08-22",
  },
  {
    id: 3,
    name: "Projector Epson X41",
    category: "Electronics",
    custodian: "Jonathan D. Santos",
    status: "Under Repair",
    dateAssigned: "2023-05-15",
  },
  {
    id: 4,
    name: "Whiteboard 4x6",
    category: "Furniture",
    custodian: "Ralph Gomez M. Gatmaitan",
    status: "Active",
    dateAssigned: "2022-11-03",
  },
  {
    id: 5,
    name: "Desktop PC",
    category: "Electronics",
    custodian: "Michael B. Tomacruz",
    status: "Inactive",
    dateAssigned: "2021-09-18",
  },
  {
    id: 6,
    name: "Filing Cabinet",
    category: "Furniture",
    custodian: "Jasper C. Ortega",
    status: "Active",
    dateAssigned: "2023-12-01",
  },
];

const STATUS_CLASS = {
  Active: "status-active",
  Inactive: "status-inactive",
  "Under Repair": "status-repair",
};

const INITIAL_FILTERS = {
  status: "",
  category: "",
  custodian: "",
};

function RoomAssets() {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filteredAssets = MOCK_ASSETS.filter((asset) => {
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.category && asset.category !== filters.category) return false;
    if (filters.custodian && asset.custodian !== filters.custodian) return false;
    return true;
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowFilter(false);
  };

  return (
    <MainLayout>
      <div className="room-assets-page">
        {/* ── Top bar ── */}
        <div className="room-assets-top">
          <div className="room-assets-header">
            <button
              className="return-button"
              onClick={() => navigate("/room")}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" />
              Back
            </button>
            <div>
              <h1 className="room-assets-title">Assets in Room</h1>
              <p className="room-assets-subtitle">
                Showing assets located in <strong>{roomName}</strong>
              </p>
            </div>
          </div>

          <div className="room-assets-settings">
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
        <div className="room-assets-list">
          {filteredAssets.length === 0 ? (
            <div className="room-assets-empty">
              <FontAwesomeIcon icon="fa-solid fa-box-open" />
              <p>No assets found in this room.</p>
            </div>
          ) : (
            <table className="room-assets-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Custodian</th>
                  <th>Status</th>
                  <th>Date Assigned</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, index) => (
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
                    <td>{asset.custodian}</td>
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

      {/* ── Filter Modal ── */}
      {showFilter && (
        <FilterModal
          filters={filters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </MainLayout>
  );
}

export default RoomAssets;