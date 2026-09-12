// src/hooks/asset/useItemForm.js
import { useState, useEffect, useCallback } from "react";

const EMPTY_ITEM = {
  serial_number: "",
  serial_numbers: [],
  category_id: "",
  description: "",
  unit_value: "1.00", // only used when the acquisition is "purchased"
  remarks: "",
  qty: "1",
  tracking_mode: "single_bulk", // "single_bulk" | "individual"
  primary_custodian: "",
  room_id: "",
};

/**
 * Owns the state for a single line item inside the "Add/Edit asset" modal.
 * initialItem is null when adding a new item, or an existing item object
 * (as stored in useAcquisitionRegistration's `items` array) when editing.
 */
export function useItemForm(initialItem, isDonated) {
  const [item, setItem] = useState(() =>
    initialItem ? { ...EMPTY_ITEM, ...initialItem } : EMPTY_ITEM,
  );
  const [assetImage, setAssetImage] = useState(initialItem?.assetImage || null);
  const [error, setError] = useState({});

  // re-sync if a different item is opened for editing
  useEffect(() => {
    setItem(initialItem ? { ...EMPTY_ITEM, ...initialItem } : EMPTY_ITEM);
    setAssetImage(initialItem?.assetImage || null);
    setError({});
  }, [initialItem]);

  const qty = parseInt(item.qty, 10) || 1;
  const isIndividual = item.tracking_mode === "individual" && qty > 1;

  // keep serial_numbers array length in sync with qty while in individual mode
  useEffect(() => {
    if (!isIndividual) return;
    setItem((prev) => {
      const current = prev.serial_numbers || [];
      if (current.length === qty) return prev;
      const next = Array.from({ length: qty }, (_, i) => current[i] || "");
      return { ...prev, serial_numbers: next };
    });
  }, [isIndividual, qty]);

  // drop back to single_bulk if qty is edited down to 1
  useEffect(() => {
    if (qty <= 1 && item.tracking_mode !== "single_bulk") {
      setItem((prev) => ({ ...prev, tracking_mode: "single_bulk" }));
    }
  }, [qty, item.tracking_mode]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
    setError((prev) => (prev[name] ? { ...prev, [name]: null } : prev));
  }, []);

  const setSerialAt = useCallback((index, value) => {
    setItem((prev) => {
      const next = [...(prev.serial_numbers || [])];
      next[index] = value;
      return { ...prev, serial_numbers: next };
    });
  }, []);

  const autoNumberSerials = useCallback(() => {
    setItem((prev) => {
      const base = prev.serial_number?.trim() || "SN";
      const next = Array.from(
        { length: qty },
        (_, i) => `${base}-${String(i + 1).padStart(2, "0")}`,
      );
      return { ...prev, serial_numbers: next };
    });
  }, [qty]);

  const validate = useCallback(() => {
    const nextError = {};

    if (!item.category_id) nextError.category_id = "Category is required.";
    if (!item.description.trim())
      nextError.description = "Description is required.";

    if (!isDonated) {
      const cost = parseFloat(item.unit_value);
      if (!cost || cost <= 0)
        nextError.unit_value = "Enter a valid unit value.";
    }

    if (!qty || qty < 1) nextError.qty = "Quantity must be at least 1.";
    if (isIndividual && !item.tracking_mode)
      nextError.tracking_mode = "Choose a tracking mode.";

    if (!assetImage) nextError.assetImage = "Asset image is required.";

    // TODO: port over the per-serial uniqueness check from the original
    // useBasicInfo.js (not available when this hook was generated) — it
    // should validate item.serial_number in bulk mode and every entry of
    // item.serial_numbers in individual mode against existing Firestore
    // asset docs.

    setError(nextError);
    return Object.keys(nextError).length === 0;
  }, [item, isDonated, qty, isIndividual, assetImage]);

  const toPayload = useCallback(
    () => ({ ...item, assetImage }),
    [item, assetImage],
  );

  return {
    item,
    error,
    assetImage,
    setAssetImage,
    qty,
    isIndividual,
    handleChange,
    setSerialAt,
    autoNumberSerials,
    validate,
    toPayload,
  };
}
