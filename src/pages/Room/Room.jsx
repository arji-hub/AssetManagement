import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Room.css";
import RoomCard from "../../components/ui/card/RoomCard";
import { fetchRooms } from "../../services/room";
import RoomModal from "../../components/ui/modal/RoomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Room() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [assetCountFilter, setAssetCountFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms()
      .then((data) => setRooms(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddRoom = async ({ name }) => {
    // await addRoom({ name }); — plug in your Firestore call here
    setRooms((prev) => [...prev, { id: name, name, assetCount: 0 }]);
  };

  const filteredRooms = rooms
    .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((r) => {
      if (assetCountFilter === "none") return r.assetCount === 0;
      if (assetCountFilter === "low")
        return r.assetCount >= 1 && r.assetCount <= 10;
      if (assetCountFilter === "medium")
        return r.assetCount >= 11 && r.assetCount <= 50;
      if (assetCountFilter === "high") return r.assetCount > 50;
      return true;
    });

  return (
    <MainLayout>
      <div className="room-page">
        <div className="room-top">
          <div className="room-header">
            <h1>Room </h1>
            <p>Welcome, {user.username}! This is the room page.</p>
          </div>
          <div className="room-settings">
            <div className="search-bar">
              <FontAwesomeIcon
                icon="fa-solid fa-magnifying-glass"
                className="search-icon"
              />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filters">
              <label htmlFor="asset-count-filter">Assets:</label>
              <select
                id="asset-count-filter"
                name="assetCount"
                value={assetCountFilter}
                onChange={(e) => setAssetCountFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="none">None (0)</option>
                <option value="low">Low (1–10)</option>
                <option value="medium">Medium (11–50)</option>
                <option value="high">High (50+)</option>
              </select>
            </div>
            <button
              className="settings-button"
              onClick={() => setShowModal(true)}
            >
              Add Room
            </button>
            {showModal && (
              <RoomModal
                onClose={() => setShowModal(false)}
                onSubmit={handleAddRoom}
                existingRooms={rooms.map((r) => r.name)}
              />
            )}
          </div>
        </div>
        <div className="room-cards">
          {loading && <p className="room-status">Loading rooms...</p>}
          {error && (
            <p className="room-status room-status--error">Error: {error}</p>
          )}
          {!loading && !error && filteredRooms.length === 0 && (
            <p className="room-status">No rooms found.</p>
          )}
          {filteredRooms.map(({ id, name, assetCount }) => (
            <RoomCard key={id} roomName={name} totalAssets={assetCount} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default Room;
