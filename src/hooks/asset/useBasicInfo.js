import { useState, useEffect, useRef } from "react";

const initialErrors = {
  serial_number: "",
  category_id: "",
  description: "",
  date_acquired: "",
  unit_value: "",
  qty: "",
};

export function useBasicInfo(form) {
  const [error, setError] = useState(initialErrors);
  const debounceRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];

  // sync validation for the rest of the fields, live on every form change
  useEffect(() => {
    setError((prev) => ({
      ...prev,
      category_id: form.category_id ? "" : "Category is required.",
      description: form.description?.trim() ? "" : "Description is required.",
      date_acquired: !form.date_acquired
        ? "Date acquired is required."
        : form.date_acquired > today
          ? "Date acquired cannot be in the future."
          : "",
      unit_value: (() => {
        const num = parseFloat(form.unit_value);
        if (form.unit_value === "" || form.unit_value === null)
          return "Unit value is required.";
        if (isNaN(num)) return "Unit value must be a number.";
        if (num <= 0) return "Unit value must be greater than 0.";
        return "";
      })(),
      qty: (() => {
        const num = parseInt(form.qty, 10);
        if (form.qty === "" || form.qty === null)
          return "Quantity is required.";
        if (isNaN(num)) return "Quantity must be a number.";
        if (num <= 0) return "Quantity must be greater than 0.";
        if (!Number.isInteger(num)) return "Quantity must be a whole number.";
        return "";
      })(),
    }));
  }, [
    form.category_id,
    form.description,
    form.date_acquired,
    form.unit_value,
    form.qty,
    today,
  ]);

  const isValid = Object.values(error).every((msg) => msg === "");

  return { error, isValid, today };
}
