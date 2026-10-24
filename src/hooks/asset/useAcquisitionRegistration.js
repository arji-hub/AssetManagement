// src/hooks/asset/useAcquisitionRegistration.js
import { useState, useEffect, useMemo, useRef } from "react";
import { getMissingFields } from "../../utils/itemValidation";
import { addAcquisitionBatch } from "../../services/asset";
import { useAuth } from "../../context/AuthContext";
import { fetchCustodians } from "../../services/user";
import { fetchRooms } from "../../services/room";
import { fetchCategories } from "../../services/category";
import { todayISO } from "../../utils/date";
import { scanAcquisitionDoc } from "../../services/scan";

const INITIAL_ACQUISITION = {
  acquisition_type: "purchased",
  date_acquired: todayISO,
  donated_by: "",
  supplier: "",
};

function nextSerial(serial, used) {
  const raw = serial?.trim();
  if (!raw) return "";
  const m = raw.match(/^(.*?)(\d+)$/);
  const prefix = m ? m[1] : `${raw}-`;
  const pad = m ? m[2].length : 2;
  let n = m ? parseInt(m[2], 10) : 1;
  let candidate;
  do {
    n += 1;
    candidate = `${prefix}${String(n).padStart(pad, "0")}`;
  } while (used.has(candidate));
  used.add(candidate);
  return candidate;
}

function collectSerials(item) {
  const qty = parseInt(item.qty, 10) || 1;
  const list =
    item.tracking_mode === "individual" && qty > 1
      ? item.serial_numbers || []
      : [item.serial_number];
  return list.map((s) => s?.trim()).filter(Boolean);
}

export function useAcquisitionRegistration() {
  const { role, user } = useAuth();

  // ── step 1: acquisition-level state (filled once) ─────────────────────
  const [step, setStep] = useState(1);
  const [acquisitionInfo, setAcquisitionInfo] = useState(INITIAL_ACQUISITION);
  const [docImage, setDocImageState] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scanItemCount, setScanItemCount] = useState(0);
  const scanRunRef = useRef(0);
  const setDocImage = (img) => {
    scanRunRef.current += 1;
    setDocImageState(img);
    setScanning(false);
    setScanStatus(null);
    setScanError(null);
    setScanItemCount(0);
  };

  const handleScanDoc = async () => {
    if (!docImage?.file) return;
    const runId = ++scanRunRef.current;
    setScanning(true);
    setScanStatus(null);
    setScanError(null);
    try {
      const result = await scanAcquisitionDoc(
        docImage.file,
        acquisitionInfo.acquisition_type,
        categories,
      );
      if (runId !== scanRunRef.current) return;

      const { date_acquired, donated_by, supplier } = result.acquisition || {};
      if (date_acquired) setAcquisitionField("date_acquired", date_acquired);
      if (isDonated && donated_by)
        setAcquisitionField("donated_by", donated_by);
      if (!isDonated && supplier) setAcquisitionField("supplier", supplier);

      const scannedItems = (result.items || []).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        tracking_mode: item.qty > 1 ? "individual" : "bulk",
      }));
      setItems(scannedItems);
      setScanItemCount(scannedItems.length);
      setScanStatus("success");
    } catch (err) {
      if (runId !== scanRunRef.current) return;
      console.error("Scan failed:", err);
      setScanError(err.message || "Could not read the document.");
      setScanStatus("error");
    } finally {
      if (runId === scanRunRef.current) setScanning(false);
    }
  };

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
  const missingByItem = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      const missing = getMissingFields(item, { isDonated });
      if (missing.length) map[item.id] = missing;
    });
    return map;
  }, [items, isDonated]);

  const incompleteCount = Object.keys(missingByItem).length;
  const canProceedStep2 = items.length > 0 && incompleteCount === 0;

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
    if (!canProceedStep2) return;
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
    const src = items.find((i) => i.id === id);
    if (!src) return;

    const used = new Set(items.flatMap(collectSerials)); // every serial in the batch
    const qty = parseInt(src.qty, 10) || 1;
    const isIndividual = src.tracking_mode === "individual" && qty > 1;

    let serial_number = src.serial_number;
    let serial_numbers = src.serial_numbers || [];

    if (isIndividual) {
      // continue the sequence: UNIT-01..10 -> UNIT-11..20
      let cursor = [...serial_numbers].reverse().find((s) => s?.trim()) || "";
      serial_numbers = serial_numbers.map(
        () => (cursor = nextSerial(cursor, used)),
      );
      serial_number = serial_numbers[0] || "";
    } else {
      serial_number = nextSerial(src.serial_number, used);
    }

    const copy = {
      ...src,
      id: crypto.randomUUID(),
      serial_number,
      serial_numbers,
    };

    // insert right after the original so the copy appears next to it
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)];
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
    scanning,
    handleScanDoc,
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
    missingByItem,
    incompleteCount,
    canProceedStep2,
    scanStatus,
    scanError,
    scanItemCount,
  };
}
