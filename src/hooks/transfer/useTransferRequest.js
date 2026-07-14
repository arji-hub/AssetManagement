import { useState, useRef, useEffect } from "react";
import { fetchAssetByID } from "../../services/asset";
import { findCustodian, fetchUsersByRole } from "../../services/user";
import { addTransferRequest } from "../../services/transfer";
import { useAuth } from "../../context/AuthContext";
import ROLES from "../../data/roles";
import { toLowerCase } from "../../utils/TextCasing";

function useTransferRequest({ onClose, assetID = "" } = {}) {
  const { user, role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;
  const assetInputRef = useRef(null);

  //transfer or remove
  const [mode, setMode] = useState("transfer");

  // asset lookup
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState(null);

  // custodian ("to") lookup
  const [custodianId, setCustodianId] = useState("");
  const [custodian, setCustodian] = useState(null);
  const [custodianLoading, setCustodianLoading] = useState(false);
  const [custodianError, setCustodianError] = useState(null);
  const [custodianOptions, setCustodianOptions] = useState([]);

  // form fields
  const [description, setDescription] = useState("");
  const [currentCustodian, setCurrentCustodian] = useState(null);
  const [notes, setNotes] = useState("");

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  //if mode remove
  useEffect(() => {
    if (mode === "remove") {
      setCustodianId("");
      setCustodian(null);
      setCustodianError(null);
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

  // --- asset lookup ---
  const lookupAsset = async (id) => {
    const trimmedId = toLowerCase(id.trim());
    if (!trimmedId) return;

    setAssetLoading(true);
    setAssetError(null);
    setAsset(null);
    setDescription("");
    setCurrentCustodian(null);

    try {
      const result = await fetchAssetByID(trimmedId);
      if (result.status?.toLowerCase() === "condemned") {
        setAssetError("This asset is archived and cannot be transferred.");
        return;
      }
      const isAssigned = user.uid === result.property_custodian;
      if (!isAdmin && !isAssigned) {
        setAssetError("This asset is currently not in your custody.");
        return;
      }
      setAsset(result);
      setDescription(result.description || "Asset");
      setCurrentCustodian(result.property_custodian_name || null);
    } catch (err) {
      setAssetError(err.message || "Failed to fetch asset.");
    } finally {
      setAssetLoading(false);
    }
  };

  // --- custodian lookup ---
  const lookupCustodian = async (id) => {
    const trimmedId = id.trim();
    if (!trimmedId) return;

    setCustodianLoading(true);
    setCustodianError(null);
    setCustodian(null);

    try {
      const result = await findCustodian(trimmedId);
      if (result.role !== ROLES.FULLTIME) {
        setCustodianError(
          "You cannot assign Custodian to a Parttime faculty. Select another",
        );
        return;
      }

      const isAssigned = user.uid === result.id;
      if (isAssigned) {
        setCustodianError(
          "You are already the custodian of this asset and cannot transfer it to yourself.",
        );
        return;
      }

      const isCurrentCustodian = result.id === asset?.property_custodian;
      if (isCurrentCustodian) {
        setCustodianError(
          "This custodian is already assigned to this asset. Select a different custodian.",
        );
        return;
      }

      setCustodian(result);
    } catch (err) {
      setCustodianError(err.message || "Failed to fetch custodian.");
    } finally {
      setCustodianLoading(false);
    }
  };

  //fetch custodian options
  useEffect(() => {
    fetchUsersByRole(ROLES.FULLTIME)
      .then(setCustodianOptions)
      .catch((err) => console.error("Failed to load custodian list:", err));
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

  const handleFindCustodian = () => lookupCustodian(custodianId);
  const handleCustodianIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindCustodian();
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!asset) {
      setSubmitError("Please find a valid asset before submitting.");
      return;
    }
    if (mode !== "remove" && !custodian) {
      setSubmitError("Please find a valid custodian to transfer to.");
      return;
    }
    if (mode === "remove" && !asset.property_custodian) {
      setSubmitError("This asset has no custodian assigned to remove.");
      return;
    }
    if (
      mode === "remove" &&
      !isAdmin &&
      user.uid !== asset.property_custodian
    ) {
      setSubmitError(
        "You can only remove custody of an asset currently assigned to you.",
      );
      return;
    }

    setSubmitStatus("loading");
    setIsSubmitting(true);
    try {
      const to =
        mode === "remove"
          ? null
          : custodian
            ? {
                uid: custodian.id,
                name: custodian.fullname,
                role: custodian.role,
              }
            : null;
      console.log("to", to);
      const from = asset.property_custodian
        ? {
            uid: asset.property_custodian,
            name: asset.property_custodian_name || null,
            role: ROLES.FULLTIME,
          }
        : null;
      const result = await addTransferRequest(
        {
          asset_id: asset.id,
          asset_description: description,
          from,
          to,
          notes: notes.trim(),
        },
        user.uid,
        `${user.firstname} ${user.lastname}`,
        user.role,
      );
      //log result for debugging
      console.log("Transfer request submitted:", result);
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message || "Failed to submit transfer request.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    mode === "remove"
      ? !!asset &&
        !!asset.property_custodian &&
        (isAdmin || user.uid === asset.property_custodian)
      : !!asset && !!custodian;

  return {
    //mode
    mode,
    setMode,
    // refs
    assetInputRef,
    // asset state
    assetId,
    asset,
    assetLoading,
    assetError,
    // custodian state
    custodianId,
    custodian,
    custodianLoading,
    custodianError,
    custodianOptions,
    // form fields
    description,
    currentCustodian,
    notes,
    // submit state
    submitError,
    isSubmitting,
    submitStatus,
    handleStatusClose,
    isFormValid,
    // setters
    setAssetId,
    setCustodianId,
    setNotes,
    // handlers
    handleFindAsset,
    handleAssetIdKeyDown,
    handleFindCustodian,
    handleCustodianIdKeyDown,
    handleSubmit,
  };
}

export default useTransferRequest;
