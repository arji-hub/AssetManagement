// src/hooks/asset/useItemForm.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { findExistingSerialNumbers } from "../../services/asset"; // adjust path to match your actual services location

const EMPTY_ITEM = {
  serial_number: "",
  serial_numbers: [],
  category_id: "",
  description: "",
  unit_value: "1.00",
  remarks: "",
  qty: "1",
  tracking_mode: "single_bulk",
  primary_custodian: "",
  room_id: "",
};

// serials actually "in use" by a given item, regardless of tracking mode
function getItemSerials(item) {
  const qty = parseInt(item?.qty, 10) || 1;
  const isIndividual = item?.tracking_mode === "individual" && qty > 1;
  if (isIndividual) {
    return (item.serial_numbers || []).map((s) => s?.trim()).filter(Boolean);
  }
  const single = item?.serial_number?.trim();
  return single ? [single] : [];
}

/**
 * @param {object|null} initialItem
 * @param {boolean} isDonated
 * @param {Array} existingItems  every OTHER item already in this batch
 *   (the parent should pass its full `items` list — this hook filters out
 *   the one currently being edited by id)
 */
export function useItemForm(initialItem, isDonated, existingItems = []) {
  const [item, setItem] = useState(() =>
    initialItem ? { ...EMPTY_ITEM, ...initialItem } : EMPTY_ITEM,
  );
  const [assetImage, setAssetImage] = useState(initialItem?.assetImage || null);
  const [error, setError] = useState({});
  const [serialsChecking, setSerialsChecking] = useState(false);
  const [dbDuplicateSerials, setDbDuplicateSerials] = useState(new Set());
  const debounceRef = useRef(null);

  useEffect(() => {
    setItem(initialItem ? { ...EMPTY_ITEM, ...initialItem } : EMPTY_ITEM);
    setAssetImage(initialItem?.assetImage || null);
    setError({});
    setDbDuplicateSerials(new Set());
  }, [initialItem]);

  const qty = parseInt(item.qty, 10) || 1;
  const isIndividual = item.tracking_mode === "individual" && qty > 1;

  // serials already claimed by other items in this same batch
  const otherItemsSerials = useMemo(() => {
    const set = new Set();
    existingItems
      .filter((it) => it.id !== initialItem?.id)
      .forEach((it) => getItemSerials(it).forEach((s) => set.add(s)));
    return set;
  }, [existingItems, initialItem]);

  useEffect(() => {
    if (!isIndividual) return;
    setItem((prev) => {
      const current = prev.serial_numbers || [];
      if (current.length === qty) return prev;
      const next = Array.from({ length: qty }, (_, i) => current[i] || "");
      return { ...prev, serial_numbers: next };
    });
  }, [isIndividual, qty]);

  useEffect(() => {
    if (qty <= 1 && item.tracking_mode !== "single_bulk") {
      setItem((prev) => ({ ...prev, tracking_mode: "single_bulk" }));
    }
  }, [qty, item.tracking_mode]);

  // live, debounced DB existence check as the user types
  useEffect(() => {
    const serials = getItemSerials(item);
    if (!serials.length) {
      setDbDuplicateSerials(new Set());
      setSerialsChecking(false);
      return;
    }
    setSerialsChecking(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const found = await findExistingSerialNumbers(serials);
        setDbDuplicateSerials(found);
      } finally {
        setSerialsChecking(false);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    item.serial_number,
    JSON.stringify(item.serial_numbers),
    item.tracking_mode,
  ]);

  // recompute serial-specific errors live, from whatever we currently know
  useEffect(() => {
    if (isIndividual) {
      const counts = {};
      (item.serial_numbers || []).forEach((s) => {
        const v = s?.trim();
        if (v) counts[v] = (counts[v] || 0) + 1;
      });
      const perUnitErrors = (item.serial_numbers || []).map((s) => {
        const v = s?.trim();
        if (!v) return "";
        if (counts[v] > 1) return "Duplicate within this item.";
        if (otherItemsSerials.has(v))
          return "Already used by another item in this batch.";
        if (dbDuplicateSerials.has(v))
          return "Serial number already exists in the system.";
        return "";
      });
      setError((prev) => ({
        ...prev,
        serial_numbers: perUnitErrors,
        serial_number: "",
      }));
    } else {
      const v = item.serial_number?.trim();
      let msg = "";
      if (v) {
        if (otherItemsSerials.has(v))
          msg = "Already used by another item in this batch.";
        else if (dbDuplicateSerials.has(v))
          msg = "Serial number already exists in the system.";
      }
      setError((prev) => ({ ...prev, serial_number: msg, serial_numbers: [] }));
    }
  }, [
    item.serial_number,
    item.serial_numbers,
    isIndividual,
    otherItemsSerials,
    dbDuplicateSerials,
  ]);

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

  const validate = useCallback(async () => {
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

    // ── authoritative, non-debounced DB check right before save ──
    const serials = getItemSerials(item);
    let freshDbDuplicates = dbDuplicateSerials;
    if (serials.length) {
      freshDbDuplicates = await findExistingSerialNumbers(serials);
      setDbDuplicateSerials(freshDbDuplicates);
    }

    if (isIndividual) {
      const counts = {};
      (item.serial_numbers || []).forEach((s) => {
        const v = s?.trim();
        if (v) counts[v] = (counts[v] || 0) + 1;
      });
      const perUnitErrors = (item.serial_numbers || []).map((s) => {
        const v = s?.trim();
        if (!v) return "";
        if (counts[v] > 1) return "Duplicate within this item.";
        if (otherItemsSerials.has(v))
          return "Already used by another item in this batch.";
        if (freshDbDuplicates.has(v))
          return "Serial number already exists in the system.";
        return "";
      });
      if (perUnitErrors.some(Boolean)) nextError.serial_numbers = perUnitErrors;
    } else {
      const v = item.serial_number?.trim();
      if (v) {
        if (otherItemsSerials.has(v)) {
          nextError.serial_number =
            "Already used by another item in this batch.";
        } else if (freshDbDuplicates.has(v)) {
          nextError.serial_number =
            "Serial number already exists in the system.";
        }
      }
    }

    setError(nextError);

    const scalarOk = [
      "category_id",
      "description",
      "unit_value",
      "qty",
      "tracking_mode",
      "assetImage",
      "serial_number",
    ].every((k) => !nextError[k]);
    const arrOk =
      !Array.isArray(nextError.serial_numbers) ||
      !nextError.serial_numbers.some(Boolean);

    return scalarOk && arrOk;
  }, [
    item,
    isDonated,
    qty,
    isIndividual,
    assetImage,
    otherItemsSerials,
    dbDuplicateSerials,
  ]);

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
    serialsChecking,
    handleChange,
    setSerialAt,
    autoNumberSerials,
    validate,
    toPayload,
  };
}
