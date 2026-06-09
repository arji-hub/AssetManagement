import React, { useState } from "react";
import "./RoomAssets.css";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterModal from "../../components/ui/modal/FilterModal";
import { Condition } from "../../components/ui/status/condition";

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

const convertDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    if (filters.custodian && asset.custodian !== filters.custodian)
      return false;
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
            <button className="return-button" onClick={() => navigate("/room")}>
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
                    <td className="asset-name">{asset.name}</td>
                    <td>{asset.category}</td>
                    <td>{asset.custodian}</td>
                    <td>
                      <Condition condition={asset.status} />
                    </td>
                    <td>{convertDate(asset.dateAssigned)}</td>
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
          context="room"
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
