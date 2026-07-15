import { useState, useRef, useCallback } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

function useDocumentViewer() {
  // ─── State ────────────────────────────────────────────────
  const [isDocActive, setIsDocActive] = useState(false);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const clampZoom = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  // ─── Modal open/close ─────────────────────────────────────
  const openModal = () => {
    setIsDocActive(true);
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setIsDocActive(false);
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  };

  // ─── Zoom controls ────────────────────────────────────────
  const zoomIn = () => setZoom((z) => clampZoom(z + ZOOM_STEP));

  const zoomOut = () =>
    setZoom((z) => {
      const next = clampZoom(z - ZOOM_STEP);
      if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });

  const resetZoom = () => {
    setZoom(MIN_ZOOM);
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

  // ─── Mouse drag (desktop) ─────────────────────────────────
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

  // ─── Touch drag (mobile) ──────────────────────────────────
  const handleTouchStart = (e) => {
    if (zoom === MIN_ZOOM) return;
    if (e.touches.length !== 1) return; // ignore multi-touch (pinch etc.)
    isDragging.current = true;
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    panStart.current = { ...pan };
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return {
    // state
    isDocActive,
    zoom,
    pan,
    MIN_ZOOM,
    MAX_ZOOM,
    // modal
    openModal,
    closeModal,
    // zoom
    zoomIn,
    zoomOut,
    resetZoom,
    handleWheel,
    // mouse
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    // touch
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

export default useDocumentViewer;