import MainLayout from "../../components/layout/MainLayout";
import "./Room.css";
import "../../components/layout/Toolbar.css";
import Table from "../../components/panel/Table";
import RoomCard from "../../components/ui/card/room/RoomCard";
import RoomModal from "../../components/modal/RoomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRoom } from "../../hooks/room/useRoom";
import { ROOM_FILTER_OPTIONS } from "../../data/room";
import { displayDate } from "../../utils/date";
import { roomColumns } from "../../data/columns";

function Room() {
  const {
    loading,
    error,
    activeFilter,
    handleFilterChange,
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
              <label htmlFor="asset-count-filter" className="filters-label">
                Assets:
              </label>
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

        <div className="room-sub-tabs">
          {ROOM_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`room-sub-tab${
                activeFilter === opt.key ? " room-sub-tab--active" : ""
              }`}
              onClick={() => handleFilterChange(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="room-cards">
          <Table
            columns={roomColumns}
            items={filteredRooms}
            loading={loading}
            error={error}
            itemLabel="rooms"
            emptyMessage="No rooms found."
            renderItem={(room) => (
              <RoomCard key={room.id} room={room} columns={roomColumns} />
            )}
          />
        </div>
      </div>
    </MainLayout>
  );
}

export default Room;
