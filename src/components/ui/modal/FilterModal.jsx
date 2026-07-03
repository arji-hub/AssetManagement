import { useState } from "react";
import PropTypes from "prop-types";
import "./FilterModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ASSET_STATUS } from "../../../data/assets";
import { useAuth } from "../../../context/AuthContext";
import { ROLES } from "../../../data/roles";
import { UNALLOCATED_ROOM, UNASSIGNED_CUSTODIAN } from "../../../data/assets";

function FilterModal({
  filters,
  onApply,
  onClear,
  onClose,
  rooms = [],
  categories = [],
  custodians = [],
  loadingOptions = false,
  context = "other",
}) {
  const { role } = useAuth();
  const effectiveContext = role !== ROLES.ADMIN ? "custodian" : context;

  const [local, setLocal] = useState({
    custodian: "",
    status: "",
    category: "",
    room: "",
    ...filters,
  });
  const [roomSearch, setRoomSearch] = useState("");
  const [custodianSearch, setCustodianSearch] = useState("");

  // Sanitize list props — strips undefined, null, and empty strings
  const safeRooms = rooms.filter(Boolean);
  const safeCustodians = custodians.filter(Boolean);
  const safeCategories = categories.filter(Boolean);

  const handleSelect = (key, value) => {
    setLocal((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
  };

  return (
    <div className="filter-overlay" onClick={onClose}>
      <div className="filter-container" onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div className="filter-header">
          <h2 className="filter-title">Filters</h2>
          <button className="filter-close" onClick={onClose}>
            <FontAwesomeIcon icon="fa-solid fa-xmark" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="filter-body">
          {/* Status */}
          <div className="filter-section">
            <p className="filter-section-label">STATUS</p>
            <div className="filter-chips">
              {ASSET_STATUS.map((option) => (
                <button
                  key={option}
                  className={`filter-chip ${local.status === option ? "filter-chip--active" : ""}`}
                  onClick={() => handleSelect("status", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-divider" />

          {/* Category */}
          <div className="filter-section">
            <p className="filter-section-label">CATEGORY</p>
            {loadingOptions ? (
              <p className="filter-loading">Loading categories...</p>
            ) : (
              <select
                className="filter-select"
                value={local.category}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">All Categories</option>
                {safeCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Room — hidden when context is "room" */}
          {context !== "room" && (
            <>
              <div className="filter-divider" />
              <div className="filter-section">
                <p className="filter-section-label">ROOM</p>
                {loadingOptions ? (
                  <p className="filter-loading">Loading rooms...</p>
                ) : safeRooms.length === 0 ? (
                  <p className="filter-empty">No rooms found.</p>
                ) : (
                  <div className="filter-list">
                    <div className="filter-search-wrapper">
                      <FontAwesomeIcon
                        icon="fa-solid fa-magnifying-glass"
                        className="filter-search-icon"
                      />
                      <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Search rooms..."
                        value={roomSearch}
                        onChange={(e) => setRoomSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="filter-select filter-select--scrollable"
                      value={local.room}
                      onChange={(e) =>
                        setLocal((prev) => ({ ...prev, room: e.target.value }))
                      }
                      size={4}
                    >
                      <option value="">All Rooms</option>
                      <option value={UNALLOCATED_ROOM}>Unallocated</option>
                      {safeRooms
                        .filter((room) =>
                          room.toLowerCase().includes(roomSearch.toLowerCase()),
                        )
                        .map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Custodian — hidden when context is "custodian" */}
          {effectiveContext !== "custodian" && (
            <>
              <div className="filter-divider" />
              <div className="filter-section">
                <p className="filter-section-label">CUSTODIAN</p>
                {loadingOptions ? (
                  <p className="filter-loading">Loading custodians...</p>
                ) : safeCustodians.length === 0 ? (
                  <p className="filter-empty">No custodians found.</p>
                ) : (
                  <div className="filter-list">
                    <div className="filter-search-wrapper">
                      <FontAwesomeIcon
                        icon="fa-solid fa-magnifying-glass"
                        className="filter-search-icon"
                      />
                      <input
                        type="text"
                        className="filter-search-input"
                        placeholder="Search custodians..."
                        value={custodianSearch}
                        onChange={(e) => setCustodianSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="filter-select filter-select--scrollable"
                      value={local.custodian}
                      onChange={(e) =>
                        setLocal((prev) => ({
                          ...prev,
                          custodian: e.target.value,
                        }))
                      }
                      size={4}
                    >
                      <option value="">All Custodians</option>
                      <option value={UNASSIGNED_CUSTODIAN}>Unassigned</option>
                      {safeCustodians
                        .filter((name) =>
                          name
                            .toLowerCase()
                            .includes(custodianSearch.toLowerCase()),
                        )
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="filter-footer">
          <button className="filter-clear" onClick={onClear}>
            Clear All
          </button>
          <button className="filter-apply" onClick={() => onApply(local)}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

FilterModal.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
    category: PropTypes.string,
    room: PropTypes.string,
    custodian: PropTypes.string,
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.string),
  categories: PropTypes.arrayOf(PropTypes.string),
  custodians: PropTypes.arrayOf(PropTypes.string),
  loadingOptions: PropTypes.bool,
  context: PropTypes.oneOf(["room", "custodian", "asset", "other"]),
};

export default FilterModal;
