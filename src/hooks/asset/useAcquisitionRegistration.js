// src/hooks/asset/useAcquisitionRegistration.js
import { useState, useEffect } from "react";
import { addAcquisitionBatch } from "../../services/asset";
import { useAuth } from "../../context/AuthContext";
import { fetchCustodians } from "../../services/user";
import { fetchRooms } from "../../services/room";
import { fetchCategories } from "../../services/category";
import { todayISO } from "../../utils/date";

const INITIAL_ACQUISITION = {
  acquisition_type: "purchased", // "purchased" | "donated"
  date_acquired: todayISO,
  donated_by: "", // donated only
  supplier: "", // purchased only
  po_reference: "", // purchased only, optional
};

export function useAcquisitionRegistration() {
  const { role, user } = useAuth();

  // ── step 1: acquisition-level state (filled once) ─────────────────────
  const [step, setStep] = useState(1);
  const [acquisitionInfo, setAcquisitionInfo] = useState(INITIAL_ACQUISITION);
  const [docImage, setDocImage] = useState(null);

  // ── step 2: line items ──────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // ── save state ───────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // ── dropdown data ────────────────────────────────────────────────────
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

  const isDonated = acquisitionInfo.acquisition_type === "donated";
  const fulltimeCustodians = custodians.filter((c) => c.role === "fulltime");

  // ── step 1 handlers ──────────────────────────────────────────────────
  const handleAcquisitionChange = (e) => {
    const { name, value } = e.target;
    setAcquisitionInfo((prev) => ({ ...prev, [name]: value }));
  };

  const setAcquisitionField = (name, value) =>
    setAcquisitionInfo((prev) => ({ ...prev, [name]: value }));

  const canProceedStep1 = () => {
    if (!acquisitionInfo.date_acquired) return false;
    if (!docImage) return false;
    if (isDonated && !acquisitionInfo.donated_by.trim()) return false;
    if (!isDonated && !acquisitionInfo.supplier.trim()) return false;
    return true;
  };

  const goToItems = () => {
    if (!canProceedStep1()) return;
    setStep(2);
  };
  const goBackToAcquisition = () => setStep(1);

  const goToReview = () => {
    if (items.length === 0) return;
    setStep(3);
  };
  const goBackToItems = () => setStep(2);

  // ── step 2 handlers ──────────────────────────────────────────────────
  const openAddItem = () => {
    setEditingItemId(null);
    setItemModalOpen(true);
  };

  const openEditItem = (id) => {
    setEditingItemId(id);
    setItemModalOpen(true);
  };

  const closeItemModal = () => {
    setEditingItemId(null);
    setItemModalOpen(false);
  };

  const editingItem = editingItemId
    ? items.find((i) => i.id === editingItemId) || null
    : null;

  const saveItem = (payload) => {
    if (editingItemId) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingItemId ? { ...payload, id: editingItemId } : i,
        ),
      );
    } else {
      setItems((prev) => [...prev, { ...payload, id: crypto.randomUUID() }]);
    }
    closeItemModal();
  };

  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const duplicateItem = (id) => {
    setItems((prev) => {
      const source = prev.find((i) => i.id === id);
      if (!source) return prev;
      return [
        ...prev,
        {
          ...source,
          id: crypto.randomUUID(),
          serial_number: "",
          serial_numbers: [],
        },
      ];
    });
  };

  // ── final submit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSaving(true);
    setSaveStatus("loading");
    setSaveError(null);
    try {
      const fullname = [user.firstname, user.middlename, user.lastname]
        .filter((part) => part && part !== "_")
        .join(" ");

      await addAcquisitionBatch(acquisitionInfo, docImage.file, items, role, {
        uid: user.uid,
        name: fullname,
        role: user.role,
      });
      setSaveStatus("success");
    } catch (err) {
      console.error(err);
      setSaveError(err.message);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return {
    step,
    acquisitionInfo,
    docImage,
    setDocImage,
    isDonated,
    handleAcquisitionChange,
    setAcquisitionField,
    canProceedStep1,
    goToItems,
    goBackToAcquisition,
    goToReview,
    goBackToItems,
    items,
    itemModalOpen,
    editingItem,
    openAddItem,
    openEditItem,
    closeItemModal,
    saveItem,
    removeItem,
    duplicateItem,
    saving,
    saveStatus,
    setSaveStatus,
    saveError,
    categories,
    rooms,
    fulltimeCustodians,
    loadingOptions,
    handleSubmit,
  };
}
