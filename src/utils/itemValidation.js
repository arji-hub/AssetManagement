const isBlank = (v) =>
  v === undefined || v === null || (typeof v === "string" && !v.trim());

const REQUIRED_FIELDS = [
  { key: "description", label: "Description" },
  { key: "category_id", label: "Category" },
  { key: "qty", label: "Quantity", valid: (v) => parseInt(v, 10) > 0 },
  {
    key: "unit_value",
    label: "Unit Value",
    skipIf: ({ isDonated }) => isDonated,
  },
  {
    key: "assetImage",
    label: "Asset image",
    valid: (v) => !!(v?.file || v?.preview),
  },
];

export function getMissingFields(item, ctx = {}) {
  const missing = REQUIRED_FIELDS.filter((f) => {
    if (f.skipIf?.(ctx)) return false;
    const v = item[f.key];
    return f.valid ? !f.valid(v) : isBlank(v);
  }).map((f) => f.label);

  const qty = parseInt(item.qty, 10) || 1;
  if (item.tracking_mode === "individual" && qty > 1) {
    const serials = item.serial_numbers || [];
    const filled = serials.filter((s) => !isBlank(s)).length;
    if (filled < qty) missing.push("Serial numbers");
  }

  return missing;
}
