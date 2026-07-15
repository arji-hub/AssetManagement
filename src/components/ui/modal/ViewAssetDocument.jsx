import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useDocumentViewer from "../../../hooks/camera/useDocumentViewer";
import "./ViewAssetDocument.css";

function ViewAssetDocument({ doc_image_url, children }) {
  const {
    isDocActive,
    zoom,
    pan,
    MIN_ZOOM,
    MAX_ZOOM,
    openModal,
    closeModal,
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useDocumentViewer();

  return (
    <>
      {children ? (
        children(openModal)
      ) : (
        <button className="action-btn" onClick={openModal}>
          <FontAwesomeIcon icon="fa-solid fa-file-lines" /> Document
        </button>
      )}

      {isDocActive && (
        <div className="doc-modal-overlay" onClick={closeModal}>
          <div
            className="doc-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="doc-modal-viewport"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                cursor: zoom > MIN_ZOOM ? "grab" : "default",
                touchAction: "none",
              }}
            >
              <img
                src={doc_image_url}
                alt="Asset Document"
                className="doc-modal-image"
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              />
            </div>

            <div className="doc-modal-controls">
              <button
                className="doc-modal-zoom-btn"
                onClick={zoomOut}
                disabled={zoom === MIN_ZOOM}
                aria-label="Zoom out"
              >
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-minus" />
              </button>
              <span className="doc-modal-zoom-level">
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="doc-modal-zoom-btn"
                onClick={zoomIn}
                disabled={zoom === MAX_ZOOM}
                aria-label="Zoom in"
              >
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass-plus" />
              </button>
              {zoom !== MIN_ZOOM && (
                <button
                  className="doc-modal-zoom-btn doc-modal-zoom-reset"
                  onClick={resetZoom}
                  aria-label="Reset zoom"
                >
                  <FontAwesomeIcon icon="fa-solid fa-arrow-rotate-left" />
                </button>
              )}
            </div>

            <button className="doc-modal-close" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewAssetDocument;
