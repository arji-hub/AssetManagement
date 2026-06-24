import { useState, useRef, useEffect } from "react";
import { fetchAssetByID } from "../services/asset";
import { addReport } from "../services/report";
import { useAuth } from "../context/AuthContext";

function useReportRegistration({ onClose, assetID = "" }) {
  const { user } = useAuth();
  const assetInputRef = useRef(null);

  const [type, setType] = useState("damaged");

  // asset lookup
  const [assetId, setAssetId] = useState("");
  const [asset, setAsset] = useState(null);
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState(null);

  // form fields
  const [description, setDescription] = useState("");
  const [narrative, setNarrative] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const handleStatusClose = () => {
    if (submitStatus === "success") {
      setSubmitStatus(null);
      onClose();
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

    try {
      const result = await fetchAssetByID(trimmedId);
      setAsset(result);
      setDescription(result.description || "Asset");
    } catch (err) {
      setAssetError(err.message || "Failed to fetch asset.");
    } finally {
      setAssetLoading(false);
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

  // clean up object URL on unmount / photo change
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // --- handlers ---
  const handleTypeChange = (nextType) => {
    setType(nextType);
    if (nextType === "missing") {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(null);
      setPhotoPreview(null);
    }
  };

  const handleFindAsset = () => lookupAsset(assetId);

  const handleAssetIdKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFindAsset();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    setSubmitError(null);

    // validation
    if (!asset) {
      setSubmitError("Please find a valid asset before submitting.");
      return;
    }
    if (!narrative.trim()) {
      setSubmitError("Please describe what happened.");
      return;
    }
    if (type === "damaged" && !photo) {
      setSubmitError("Please attach a photo of the damage.");
      return;
    }

    setSubmitStatus("loading");
    setIsSubmitting(true);
    try {
      const result = await addReport(
        {
          type,
          asset_id: asset.id,
          asset,
          description,
          narrative: narrative.trim(),
          photo: type === "damaged" ? photo : null,
        },
        user.uid,
        `${user.firstname} ${user.lastname}`,
      );
      console.log("Report submitted:", result);
      setSubmitStatus("success");
    } catch (err) {
      setSubmitError(err.message || "Failed to submit report.");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    !!asset && narrative.trim().length > 0 && (type !== "damaged" || !!photo);

  return {
    // refs
    assetInputRef,
    // state
    type,
    assetId,
    asset,
    assetLoading,
    assetError,
    description,
    narrative,
    photo,
    photoPreview,
    submitError,
    isSubmitting,
    submitStatus,
    handleStatusClose,
    isFormValid,
    // setters
    setAssetId,
    setNarrative,
    // handlers
    handleTypeChange,
    handleFindAsset,
    handleAssetIdKeyDown,
    handlePhotoChange,
    handleRemovePhoto,
    handleSubmit,
  };
}

export default useReportRegistration;
