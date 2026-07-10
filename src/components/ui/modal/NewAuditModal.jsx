import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAuditStart from "../../../hooks/useAuditStart";
import "./NewAuditModal.css";

function NewAuditModal() {
  const {
    roomInputRef,
    isOpen,
    roomSearch,
    setRoomSearch,
    roomResults,
    roomLoading,
    roomError,
    selectedRoom,
    setSelectedRoom,
    roomOptions,
    suggestedRooms,
    suggestedLoading,
    handleOpen,
    handleClose,
    handleFindRoom,
    handleRoomSearchKeyDown,
    handleSelectRoom,
    handleProceed,
  } = useAuditStart();

  const [showDropdown, setShowDropdown] = useState(false);
  const foundRoom = roomResults[0] ?? null;

  const filteredOptions = roomSearch.trim()
    ? roomOptions.filter((r) =>
        r.name.toLowerCase().includes(roomSearch.toLowerCase()),
      )
    : [];

  return (
    <>
      <button
        className="audit-room-btn-primary"
        type="button"
        onClick={handleOpen}
      >
        <FontAwesomeIcon icon="plus" />
        New audit
      </button>

      {isOpen && (
        <div className="audit-modal-overlay">
          <div
            className="audit-modal-backdrop"
            onClick={handleClose}
            aria-hidden="true"
          ></div>
          <div
            className="audit-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-audit-modal-title"
          >
            <div className="audit-modal-header">
              <h3 id="new-audit-modal-title" className="audit-modal-title">
                Start new audit
              </h3>
              <button
                className="audit-modal-close"
                type="button"
                onClick={handleClose}
                aria-label="Close"
              >
                <FontAwesomeIcon icon="xmark" />
              </button>
            </div>

            <div className="audit-modal-body">
              <div
                className={`audit-modal-field ${roomError ? "has-error" : ""}`}
              >
                <label htmlFor="new-audit-room-input">
                  Search room by name
                </label>
                <div className="audit-modal-search audit-autocomplete-wrapper">
                  <input
                    id="new-audit-room-input"
                    ref={roomInputRef}
                    type="text"
                    autoComplete="off"
                    placeholder="e.g. SDL1 or Proglab1"
                    value={roomSearch}
                    onChange={(e) => {
                      setRoomSearch(e.target.value);
                      setShowDropdown(true);
                      if (selectedRoom) setSelectedRoom(null);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 120)}
                    onKeyDown={handleRoomSearchKeyDown}
                    disabled={roomLoading}
                    autoFocus
                  />
                  {showDropdown && filteredOptions.length > 0 && (
                    <ul className="audit-autocomplete-list">
                      {filteredOptions.map((r) => (
                        <li
                          key={r.id}
                          onMouseDown={() => {
                            handleSelectRoom(r);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="audit-autocomplete-name">
                            {r.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    className="audit-modal-find-btn"
                    onClick={handleFindRoom}
                    disabled={roomLoading || !roomSearch.trim()}
                    aria-label="Find room"
                  >
                    {roomLoading ? (
                      <FontAwesomeIcon icon="fa-solid fa-spinner" spin />
                    ) : (
                      <FontAwesomeIcon icon="magnifying-glass" />
                    )}
                  </button>
                </div>
                {roomError && (
                  <span className="audit-modal-error" role="alert">
                    {roomError}
                  </span>
                )}
              </div>

              {/* room preview — result of search or dropdown selection */}
              {foundRoom && (
                <div
                  className={`audit-modal-room-preview ${
                    selectedRoom?.room_id === foundRoom.room_id
                      ? "audit-modal-room-preview--selected"
                      : ""
                  }`}
                  onClick={() => setSelectedRoom(foundRoom)}
                  role="button"
                  tabIndex={0}
                >
                  <FontAwesomeIcon icon="fa-solid fa-circle-check" />
                  <div>
                    <p className="audit-modal-room-preview-title">
                      {foundRoom.room_name}
                    </p>
                    <p className="audit-modal-room-preview-sub">
                      {foundRoom.last_audited_at
                        ? `Last audited ${foundRoom.last_audited_at}`
                        : "No audit recorded"}
                    </p>
                  </div>
                </div>
              )}

              {/* suggested rooms — oldest last_audited_at, top 3 */}

              <div className="audit-modal-suggested">
                <p className="audit-modal-suggested-label">
                  Suggested room to audit
                </p>

                {suggestedLoading ? (
                  <p className="audit-modal-suggested-empty">Loading…</p>
                ) : suggestedRooms.length === 0 ? (
                  <p className="audit-modal-suggested-empty">
                    No rooms available.
                  </p>
                ) : (
                  <div className="audit-modal-suggested-list">
                    {suggestedRooms.map((room) => (
                      <div
                        key={room.id}
                        className="audit-modal-suggested-item"
                        onClick={() => handleSelectRoom(room)}
                      >
                        <div>
                          <p className="audit-modal-suggested-item-title">
                            {room.name}
                          </p>
                          <p className="audit-modal-suggested-item-sub">
                            {room.last_audited_at
                              ? `Last audited ${room.last_audited_at}`
                              : "No audit recorded"}
                          </p>
                        </div>
                        <FontAwesomeIcon
                          icon="chevron-right"
                          className="audit-modal-suggested-item-chevron"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="audit-modal-actions">
                <button
                  className="audit-modal-proceed"
                  type="button"
                  disabled={!selectedRoom}
                  onClick={handleProceed}
                >
                  Proceed to audit session
                  <FontAwesomeIcon icon="arrow-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NewAuditModal;
