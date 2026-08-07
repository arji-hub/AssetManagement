import React from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../components/layout/MainLayout";
import "./Room.css";
import RoomTable from "../../components/panel/RoomTable";
import RoomModal from "../../components/ui/modal/RoomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRoom } from "../../hooks/room/useRoom";
import { RoomListPDF } from "../../pdf/templates/RoomListPDF";
import { PDFPreviewModal } from "../../components/ui/modal/PDFPreviewModal";
import { displayDate } from "../../utils/date";

function Room() {
  const { user } = useAuth();
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    assetCountFilter,
    setAssetCountFilter,
    filteredRooms,
    showModal,
    openModal,
    closeModal,
    name,
    roomError,
    saving,
    handleChange,
    handleSave,
  } = useRoom();

  return (
    <MainLayout>
      <div className="room-page">
        <div className="room-top">
          <div className="room-header">
            <h1 className="title">Room</h1>
            <p className="date">{displayDate}</p>
          </div>
          <div className="room-settings">
            <PDFPreviewModal
              title="Room List"
              fileName="room-list.pdf"
              document={<RoomListPDF rooms={filteredRooms} />}
              triggerLabel="Room List"
            />
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
            <button className="settings-button" onClick={openModal}>
              Add Room
            </button>
            {showModal && (
              <RoomModal
                onClose={closeModal}
                onSubmit={handleSave}
                value={name}
                onChange={handleChange}
                error={roomError}
                isSubmitting={saving}
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
          <RoomTable rooms={filteredRooms} loading={loading} error={error} />
        </div>
      </div>
    </MainLayout>
  );
}

export default Room;
