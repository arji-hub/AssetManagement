import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addAsset } from "../services/asset";
import { useAuth } from "../context/AuthContext";
import { fetchCustodians } from "../services/user";
import { fetchRooms } from "../services/room";
import { fetchCategories } from "../services/category";
import { useBasicInfo } from "./useBasicInfo";

const today = new Date().toISOString().split("T")[0];

const INITIAL_FORM = {
  serial_number: "",
  category_id: "",
  date_acquired: today  ,
  description: "",
  unit_value: "1.00",
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
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // ── step 1 validation (fields + serial number check) ──────────────────────
  const {
    error: basicInfoError,
    checkingSerial,
    isValid: basicInfoValid,
  } = useBasicInfo(form);

  // ── dropdown data ────────────────────────────────────────────────────────
  const [custodians, setCustodians] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [fetchedCustodians, fetchedRooms, fetchedCategories] =
          await Promise.all([
            fetchCustodians(),
            fetchRooms(),
            fetchCategories(),
          ]);
        setCustodians(fetchedCustodians);
        setRooms(fetchedRooms);
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const isAssigned = form.primary_custodian || form.room_id;

  useEffect(() => {
    if (showSkipWarning && isAssigned) {
      setShowSkipWarning(false);
    }
  }, [form.primary_custodian, form.room_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const canProceed = () => {
    if (step === 1) return basicInfoValid;
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
    if (!basicInfoValid) {
      setSaveError("Please fix the errors in Basic Info before saving.");
      setSaveStatus("error");
      return;
    }

    setSaving(true);
    setSaveStatus("loading");
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
      setSaveStatus("success");
    } catch (err) {
      console.error(err);
      setSaveError(err.message);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const fulltimeCustodians = custodians.filter((c) => c.role === "fulltime");

  return {
    step,
    form,
    error: basicInfoError,
    checkingSerial,
    assetImage,
    setAssetImage,
    docImage,
    setDocImage,
    saving,
    saveError,
    saveStatus,
    setSaveStatus,
    showSkipWarning,
    isAssigned,
    categories,
    rooms,
    fulltimeCustodians,
    loadingOptions,
    handleChange,
    canProceed,
    handleNext,
    handleBack,
    handleSkip,
    handleSave,
  };
}
