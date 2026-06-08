import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./FilterModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ASSET_CATEGORIES, ASSET_STATUS } from "../../../data/assets";
import { fetchRooms } from "../../../api/room";

function FilterModal({
  filters,
  onApply,
  onClear,
  onClose,
  initialRooms = null,
}) {
  const [local, setLocal] = useState(filters);
  const [rooms, setRooms] = useState(initialRooms ?? []);
  const [roomsLoading, setRoomsLoading] = useState(initialRooms === null);

  useEffect(() => {
    if (initialRooms !== null) return;
    async function loadRooms() {
      try {
        const roomNames = await fetchRooms();
        setRooms(roomNames);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setRoomsLoading(false);
      }
    }
    loadRooms();
  }, []);

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
            <select
              className="filter-select"
              value={local.category}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <option value="">All Categories</option>
              {ASSET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-divider" />

          {/* Room */}
          <div className="filter-section">
            <p className="filter-section-label">ROOM</p>
            {roomsLoading ? (
              <p className="filter-loading">Loading rooms...</p>
            ) : rooms.length === 0 ? (
              <p className="filter-empty">No rooms found.</p>
            ) : (
              <select
                className="filter-select filter-select--room"
                value={local.room}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, room: e.target.value }))
                }
                size={4}
              >
                <option value="">All Rooms</option>
                {rooms.map((room) => {
                  const name = typeof room === "string" ? room : room.name;
                  return (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
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
  }).isRequired,
  onApply: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  initialRooms: PropTypes.arrayOf(PropTypes.string),
};

export default FilterModal;
