import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addAsset } from "../../services/asset";
import { useAuth } from "../../context/AuthContext";

const INITIAL_FORM = {
  serial_number: "",
  category_id: "",
  date_acquired: "",
  description: "",
  unit_value: "",
  remarks: "",
  qty: "1",
  primary_custodian: "",
  local_custodian: "",
  room_id: "",
};

export function useAssetRegistrationForm() {
  const navigate = useNavigate();
  const { role } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [assetImage, setAssetImage] = useState(null);
  const [docImage, setDocImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  const isAssigned =
    form.primary_custodian || form.local_custodian || form.room_id;

  // Hide the skip warning as soon as the user picks any assignment field
  useEffect(() => {
    if (showSkipWarning && isAssigned) {
      setShowSkipWarning(false);
    }
  }, [form.primary_custodian, form.local_custodian, form.room_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canProceed = () => {
    if (step === 1)
      return (
        form.description.trim() !== "" &&
        form.category_id !== "" &&
        form.date_acquired !== "" &&
        form.unit_value !== "" &&
        form.qty !== ""
      );
    if (step === 2) return assetImage !== null && docImage !== null;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    setShowSkipWarning(false);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setShowSkipWarning(false);
    setStep((s) => s - 1);
  };

  const handleSkip = () => {
    if (!showSkipWarning) {
      setShowSkipWarning(true);
    } else {
      handleSave(true);
    }
  };

  const handleSave = async (skipped = false) => {
    setSaving(true);
    setSaveError(null);
    try {
      await addAsset(
        {
          ...form,
          assetImageFile: assetImage.file,
          docImageFile: docImage.file,
        },
        role,
      );
      navigate("/asset");
    } catch (err) {
      console.error(err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return {
    step,
    form,
    assetImage,
    setAssetImage,
    docImage,
    setDocImage,
    saving,
    saveError,
    showSkipWarning,
    isAssigned,
    handleChange,
    canProceed,
    handleNext,
    handleBack,
    handleSkip,
    handleSave,
  };
}