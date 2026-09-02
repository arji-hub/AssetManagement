import MainLayout from "../../components/layout/MainLayout";
import "./Room.css";
import Table from "../../components/panel/Table";
import RoomCard from "../../components/ui/card/room/RoomCard";
import RoomModal from "../../components/modal/RoomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRoom } from "../../hooks/room/useRoom";
import { ROOM_FILTER_OPTIONS } from "../../data/room";
import { displayDate } from "../../utils/date";
import { roomColumns } from "../../data/columns";
import SearchBar from "../../components/ui/searchBar/SearchBar";
import AssetCountFilter from "../../components/ui/filter/AssetCountFilter";

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
            <div className="search-bar-wrapper">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search rooms..."
              />
            </div>

            <AssetCountFilter
              value={assetCountFilter}
              onChange={setAssetCountFilter}
            />

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
