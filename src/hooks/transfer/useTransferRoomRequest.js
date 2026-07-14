import { useState, useRef, useEffect } from "react";
import { fetchAssetByID } from "../../services/asset";
import { fetchRooms } from "../../services/room";
import { addTransferRoom } from "../../services/transfer";
import { useAuth } from "../../context/AuthContext";

function useTransferRoomRequest({ onClose, assetID = "" } = {}) {
  const { user } = useAuth();
  const assetInputRef = useRef(null);

  // asset lookup
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState(null);

  // destination room dropdown
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);
  const [moveTo, setMoveTo] = useState("");

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleStatusClose = () => {
    if (submitStatus === "success") {
      setSubmitStatus(null);
      onClose?.();
    } else {
      setSubmitStatus(null);
    }
  };

  // --- asset lookup ---
  const lookupAsset = async (id) => {
    const trimmedId = id.trim();
    if (!trimmedId) return;

    setAssetLoading(true);
    setAssetError(null);
    setAsset(null);

    try {
      const result = await fetchAssetByID(trimmedId);
      if (result.status?.toLowerCase() === "condemned") {
        setAssetError("This asset is archived and cannot be moved.");
        return;
      }
      setAsset(result);
    } catch (err) {
      setAssetError(err.message || "Failed to fetch asset.");
    } finally {
      setAssetLoading(false);
    }
  };

  // --- rooms list (for dropdown) ---
  const loadRooms = async () => {
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const result = await fetchRooms();
      setRooms(result);
    } catch (err) {
      setRoomsError(err.message || "Failed to load rooms.");
    } finally {
      setRoomsLoading(false);
    }
  };

  // focus input on mount, auto-fill + lookup if assetID was passed in, load rooms
  useEffect(() => {
    if (assetID) {
      setAssetId(assetID);
      lookupAsset(assetID);
    } else {
      assetInputRef.current?.focus();
    }
    loadRooms();
  }, []);

  // close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // --- handlers ---
  const handleFindAsset = () => lookupAsset(assetId);
  const handleAssetIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindAsset();
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    // validation
    if (!asset) {
      setSubmitError("Please find a valid asset before submitting.");
      return;
    }
    if (!moveTo) {
      setSubmitError("Please select a destination room.");
      return;
    }
    if (moveTo === asset.room_id) {
      setSubmitError("Asset is already in this room.");
      return;
    }

    setSubmitStatus("loading");
    setIsSubmitting(true);
    try {
      const result = await addTransferRoom(
        {
          asset_id: asset.id,
          asset_name: asset.description,
          room_from: asset.room_id || null,
          move_to: moveTo,
        },
        user.uid,
      );
      console.log("Room transfer submitted:", result);
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message || "Failed to move asset.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = !!asset && !!moveTo;

  return {
    // refs
    assetInputRef,
    // asset state
    assetId,
    asset,
    assetLoading,
    assetError,
    // rooms state
    rooms,
    roomsLoading,
    roomsError,
    moveTo,
    // submit state
    submitError,
    isSubmitting,
    submitStatus,
    handleStatusClose,
    isFormValid,
    // setters
    setAssetId,
    setMoveTo,
    // handlers
    handleFindAsset,
    handleAssetIdKeyDown,
    handleSubmit,
  };
}

export default useTransferRoomRequest;
