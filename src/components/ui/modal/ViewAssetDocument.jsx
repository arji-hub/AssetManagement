import React, { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ViewAssetDocument.css";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function ViewAssetDocument({ doc_image_url, children }) {
  const [isDocActive, setIsDocActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const openModal = () => {
    setIsDocActive(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setIsDocActive(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  const zoomIn = () => setZoom((z) => clampZoom(z + ZOOM_STEP));
  const zoomOut = () =>
    setZoom((z) => {
      const next = clampZoom(z - ZOOM_STEP);
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((z) => {
      const next = clampZoom(z + delta);
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleMouseDown = (e) => {
    if (zoom === MIN_ZOOM) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

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
              style={{ cursor: zoom > MIN_ZOOM ? "grab" : "default" }}
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
