import { useState, useRef, useEffect } from "react";
import { fetchAssetByID } from "../services/asset";
import { findCustodian, fetchUsersByRole } from "../services/user";
import { addTransferRequest } from "../services/transfer";
import { useAuth } from "../context/AuthContext";
import ROLES from "../data/roles";
import { toLowerCase } from "../utils/TextCasing";

function useTransferMR({ onClose, assetID = "" } = {}) {
  const { user, role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const isPartTime = role === ROLES.PARTTIME;
  const assetInputRef = useRef(null);

  // assign or remove
  const [mode, setMode] = useState(isPartTime ? "remove" : "assign");

  // asset lookup
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState(null);

  // local_mr ("to") lookup — only relevant in assign mode
  const [mrId, setMrId] = useState("");
  const [mr, setMr] = useState(null);
  const [mrLoading, setMrLoading] = useState(false);
  const [mrError, setMrError] = useState(null);
  const [localmrOptions, setLocalmrOptions] = useState([]);

  // form fields
  const [description, setDescription] = useState("");
  const [currentMR, setCurrentMR] = useState(null);
  const [notes, setNotes] = useState("");

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSetMode = (next) => {
    if (isPartTime) return;
    setMode(next);
  };

  // clear mr lookup state when switching to remove mode
  useEffect(() => {
    if (mode === "remove") {
      setMrId("");
      setMr(null);
      setMrError(null);
    }
  }, [mode]);

  const handleStatusClose = () => {
    if (submitStatus === "success") {
      setSubmitStatus(null);
      onClose?.();
    } else {
      setSubmitStatus(null);
    }
  };

  // is the current user the asset's property_custodian?
  const isCustodian = (a) => !!a && user.uid === a.property_custodian;
  // is the current user the asset's current local_mr?
  const isCurrentLocalMR = (a) => !!a && user.uid === a.local_mr;

  // --- asset lookup ---
  const lookupAsset = async (id) => {
    const trimmedId = toLowerCase(id.trim());
    if (!trimmedId) return;

    setAssetLoading(true);
    setAssetError(null);
    setAsset(null);
    setDescription("");
    setCurrentMR(null);

    try {
      const result = await fetchAssetByID(trimmedId);
      if (result.status?.toLowerCase() === "condemned") {
        setAssetError("This asset is archived and cannot be modified.");
        return;
      }

      // only the asset's property_custodian (or an admin) may manage its local_mr
      const allowed =
        isAdmin || isCustodian(result) || isCurrentLocalMR(result);
      if (!allowed) {
        setAssetError(
          "You don't have permission to manage the local MR for this asset.",
        );
        return;
      }

      setAsset(result);
      setDescription(result.description || "Asset");
      setCurrentMR(result.local_mr_name || null);
    } catch (err) {
      setAssetError(err.message || "Failed to fetch asset.");
    } finally {
      setAssetLoading(false);
    }
  };

  // --- local_mr ("to") lookup ---
  const lookupMR = async (id) => {
    const trimmedId = id.trim();
    if (!trimmedId) return;

    setMrLoading(true);
    setMrError(null);
    setMr(null);

    try {
      const result = await findCustodian(trimmedId);
      if (result.role !== ROLES.PARTTIME) {
        setMrError(
          "You cannot assign local MR to a Fulltime faculty. Select another",
        );
        return;
      }

      if (user.uid === result.id) {
        setMrError("You cannot assign yourself as the local MR.");
        return;
      }
      if (asset?.local_mr && result.id === asset.local_mr) {
        setMrError("This person is already the local MR for this asset.");
        return;
      }

      setMr(result);
    } catch (err) {
      setMrError(err.message || "Failed to fetch user.");
    } finally {
      setMrLoading(false);
    }
  };

  //fetch custodian options
  useEffect(() => {
    fetchUsersByRole(ROLES.PARTTIME)
      .then(setLocalmrOptions)
      .catch((err) => console.error("Failed to load local mr list:", err));
  }, []);

  // focus input on mount, auto-fill + lookup if assetID was passed in
  useEffect(() => {
    if (assetID) {
      setAssetId(assetID);
      lookupAsset(assetID);
    } else {
      assetInputRef.current?.focus();
    }
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

  const handleFindMR = () => lookupMR(mrId);
  const handleMrIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindMR();
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!asset) {
      setSubmitError("Please find a valid asset before submitting.");
      return;
    }
    if (mode === "assign" && !mr) {
      setSubmitError("Please find a valid person to assign as local MR.");
      return;
    }
    if (mode === "remove" && !asset.local_mr) {
      setSubmitError("This asset has no local MR assigned to remove.");
      return;
    }

    // Permission rules:
    // - assign: only the property_custodian may assign a local_mr
    // - remove: property_custodian or the current
    //   local_mr may remove their own assignment
    if (mode === "assign" && !isCustodian(asset)) {
      setSubmitError("Only the property custodian can assign a local MR.");
      return;
    }
    if (mode === "remove" && !isCustodian(asset) && !isCurrentLocalMR(asset)) {
      setSubmitError(
        "Only the property custodian or the current local MR can remove this assignment.",
      );
      return;
    }

    setSubmitStatus("loading");
    setIsSubmitting(true);
    try {
      // assign:  from = custodian (fulltime)  -> to = mr (parttime)
      // remove:  from = current mr (parttime) -> to = custodian (fulltime)
      const from =
        mode === "assign"
          ? { uid: asset.property_custodian, role: ROLES.FULLTIME }
          : { uid: asset.local_mr, role: ROLES.PARTTIME };

      const to =
        mode === "assign"
          ? { uid: mr.id, name: mr.fullname, role: mr.role }
          : { uid: asset.property_custodian, role: ROLES.FULLTIME };

      const result = await addTransferRequest(
        {
          asset_id: asset.id,
          asset_description: description,
          from,
          to,
          notes: notes.trim(),
          isLocalMR: true,
        },
        user.uid,
        `${user.firstname} ${user.lastname}`,
        user.role,
      );
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message || "Failed to submit MR request.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    mode === "assign"
      ? !!asset && !!mr && (isAdmin || isCustodian(asset))
      : !!asset &&
        !!asset.local_mr &&
        (isAdmin || isCustodian(asset) || isCurrentLocalMR(asset));

  return {
    // mode
    mode,
    setMode: handleSetMode,
    //part time state
    isPartTime,
    // refs
    assetInputRef,
    // asset state
    assetId,
    asset,
    assetLoading,
    assetError,
    // mr state
    mrId,
    mr,
    mrLoading,
    mrError,
    localmrOptions,
    // form fields
    description,
    currentMR,
    notes,
    // submit state
    submitError,
    isSubmitting,
    submitStatus,
    handleStatusClose,
    isFormValid,
    // setters
    setAssetId,
    setMrId,
    setNotes,
    // handlers
    handleFindAsset,
    handleAssetIdKeyDown,
    handleFindMR,
    handleMrIdKeyDown,
    handleSubmit,
  };
}

export default useTransferMR;
