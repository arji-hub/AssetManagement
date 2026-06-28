import { useState, useRef, useEffect } from "react";
import { fetchAssetByID } from "../services/asset";
import { findCustodian } from "../services/user";
import { addTransferRequest } from "../services/transfer";
import { useAuth } from "../context/AuthContext";

function useTransferRequest({ onClose, assetID = "" } = {}) {
  const { user } = useAuth();
  const assetInputRef = useRef(null);

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

  // form fields
  const [description, setDescription] = useState("");
  const [currentCustodian, setCurrentCustodian] = useState(null);
  const [notes, setNotes] = useState("");

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
    setDescription("");
    setCurrentCustodian(null);

    try {
      const result = await fetchAssetByID(trimmedId);
      if (result.status?.toLowerCase() === "condemned") {
        setAssetError("This asset is archived and cannot be transferred.");
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
      setCustodian(result);
    } catch (err) {
      setCustodianError(err.message || "Failed to fetch custodian.");
    } finally {
      setCustodianLoading(false);
    }
  };

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

    // validation
    if (!asset) {
      setSubmitError("Please find a valid asset before submitting.");
      return;
    }
    if (!custodian) {
      setSubmitError("Please find a valid custodian to transfer to.");
      return;
    }

    setSubmitStatus("loading");
    setIsSubmitting(true);
    try {
      const result = await addTransferRequest(
        {
          asset_id: asset.id,
          asset_description: description,
          from: asset.property_custodian_uid || null,
          to: custodian
            ? {
                uid: custodian.id,
                name: custodian.fullname,
                role: custodian.role,
              }
            : null,
          notes: notes.trim(),
        },
        user.uid,
        `${user.firstname} ${user.lastname}`,
        user.role,
      );
      console.log("Transfer request submitted:", result);
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message || "Failed to submit transfer request.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = !!asset && !!custodian;

  return {
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
