import React from "react";
import PropTypes from "prop-types";
import "./RoomTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useRoomGrid from "../../hooks/room/useRoomGrid";
import RoomCard from "../ui/card/RoomCard";

function RoomTable({
  rooms,
  loading,
  error,
  emptyMessage = "No rooms found.",
  desktopPageSize = 7,
  mobilePageSize = 6,
  onRowAction,
}) {
  const {
    pagedData,
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    total,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
  } = useRoomGrid({ data: rooms, desktopPageSize, mobilePageSize });

  const showPagination = !loading && !error && rooms.length > 0;

  const renderEmptyState = (icon, message) => (
    <div className="room-table-empty">
      <FontAwesomeIcon icon={icon} spin={icon === "fa-solid fa-spinner"} />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="room-table-container">
      <div className="room-table">
        {loading
          ? renderEmptyState("fa-solid fa-spinner", "Loading rooms…")
          : error
            ? renderEmptyState(
                "fa-solid fa-triangle-exclamation",
                typeof error === "string" ? error : "Failed to load rooms.",
              )
            : rooms.length === 0
              ? renderEmptyState("fa-solid fa-box-open", emptyMessage)
              : pagedData.map((room) => (
                  <RoomCard key={room.id} room={room} onClick={onRowAction} />
                ))}
      </div>

      {showPagination && (
        <div className="room-pagination">
          <span className="room-pagination-info">
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          <div className="room-pagination-controls">
            <button
              className="room-page-btn"
              onClick={prevPage}
              disabled={isFirstPage}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
            </button>
            <span className="room-page-indicator">
              {page} / {totalPages}
            </span>
            <button
              className="room-page-btn"
              onClick={nextPage}
              disabled={isLastPage}
              aria-label="Next page"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

RoomTable.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      assetCount: PropTypes.number,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  emptyMessage: PropTypes.string,
  desktopPageSize: PropTypes.number,
  mobilePageSize: PropTypes.number,
  onRowAction: PropTypes.func,
};

export default RoomTable;
