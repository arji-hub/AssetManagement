import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./FilterModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ASSET_CATEGORIES, ASSET_STATUS } from "../../../data/assets";
import { fetchRooms } from "../../../api/room";

const MOCK_CUSTODIANS = [
  "Ralph Gomez M. Gatmaitan",
  "Jasper C. Ortega",
  "Jonathan D. Santos",
  "Michael B. Tomacruz",
];

function FilterModal({
  filters,
  onApply,
  onClear,
  onClose,
  initialRooms = null,
  context = "other", // "room" | "custodian" | "other"
}) {
  const [local, setLocal] = useState({ custodian: "", ...filters });
  const [rooms, setRooms] = useState(initialRooms ?? []);
  const [roomsLoading, setRoomsLoading] = useState(initialRooms === null);
  const [roomSearch, setRoomSearch] = useState("");
  const [custodianSearch, setCustodianSearch] = useState("");

  useEffect(() => {
    if (initialRooms !== null) return;
    async function loadRooms() {
      try {
        const data = await fetchRooms();
        setRooms(data.map((r) => (typeof r === "string" ? r : r.name)));
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

          {/* Room — hidden when context is "room" */}
          {context !== "room" && (
            <>
              <div className="filter-section">
                <p className="filter-section-label">ROOM</p>
                {roomsLoading ? (
                  <p className="filter-loading">Loading rooms...</p>
                ) : rooms.length === 0 ? (
                  <p className="filter-empty">No rooms found.</p>
                ) : (
                  <>
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
                          setLocal((prev) => ({
                            ...prev,
                            room: e.target.value,
                          }))
                        }
                        size={4}
                      >
                        <option value="">All Rooms</option>
                        {rooms
                          .filter((room) =>
                            room
                              .toLowerCase()
                              .includes(roomSearch.toLowerCase()),
                          )
                          .map((room) => (
                            <option key={room} value={room}>
                              {room}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Custodian — hidden when context is "custodian" */}
          {context !== "custodian" && (
            <>
              <div className="filter-divider" />
              <div className="filter-section">
                <p className="filter-section-label">CUSTODIAN</p>
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
                    {MOCK_CUSTODIANS.filter((name) =>
                      name
                        .toLowerCase()
                        .includes(custodianSearch.toLowerCase()),
                    ).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
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
  initialRooms: PropTypes.arrayOf(PropTypes.string),
  context: PropTypes.oneOf(["room", "custodian", "other"]),
};

export default FilterModal;
