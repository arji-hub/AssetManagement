import { useState, useEffect, useMemo } from "react";
import { subscribeToAssets } from "../../services/asset";
import { addReport } from "../../services/report";
import { useAuth } from "../../context/AuthContext";

function useReportRegistration({ onClose, assetID = "" }) {
  const { user } = useAuth();

  const [type, setType] = useState("damaged");

  // asset list + selection
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetError, setAssetError] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(assetID || "");

  // form fields
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

  // --- live asset list (role-scoped inside subscribeToAssets) ---
  useEffect(() => {
    if (!user?.uid || !user?.role) {
      setAssetsLoading(false);
      return;
    }

    let unsubscribe;
    try {
      unsubscribe = subscribeToAssets(
        user.role,
        user.uid,
        (list) => {
          const reportable = list.filter(
            (a) => a.status?.toLowerCase() !== "condemned",
          );
          setAssets(reportable);
          setAssetsLoading(false);
        },
        (err) => {
          setAssetError(err.message || "Failed to load assets.");
          setAssetsLoading(false);
        },
      );
    } catch (err) {
      // subscribeToAssets throws synchronously on an invalid role
      setAssetError(err.message || "Failed to load assets.");
      setAssetsLoading(false);
    }

    return () => unsubscribe?.();
  }, [user?.uid, user?.role]);

  // validate a preselected asset once the list has loaded
  useEffect(() => {
    if (assetsLoading || !assetID) return;
    if (!assets.some((a) => a.id === assetID)) {
      setSelectedAssetId("");
      setAssetError("This asset is archived or could not be found.");
    }
  }, [assetsLoading, assets, assetID]);

  // clean up object URL on unmount / photo change
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // close on Escape — but not when Escape is meant for the searchable select
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (e.target?.closest?.(".reg-searchable")) return;
      onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // --- derived ---
  const assetOptions = useMemo(
    () =>
      assets.map((a) => ({
        id: a.id,
        label: `${a.id} — ${a.description || "Asset"}`,
      })),
    [assets],
  );

  const asset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) || null,
    [assets, selectedAssetId],
  );

  const description = asset ? asset.description || "Asset" : "";

  // --- handlers ---
  const handleAssetSelect = (id) => {
    setSelectedAssetId(id);
    setAssetError(null);
  };

  const handleTypeChange = (nextType) => {
    setType(nextType);
    if (nextType === "missing") {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(null);
      setPhotoPreview(null);
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
      setSubmitError("Please select a valid asset before submitting.");
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
      await addReport(
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
    // state
    type,
    asset,
    assetOptions,
    selectedAssetId,
    assetsLoading,
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
    setNarrative,
    // handlers
    handleAssetSelect,
    handleTypeChange,
    handlePhotoChange,
    handleRemovePhoto,
    handleSubmit,
  };
}

export default useReportRegistration;
