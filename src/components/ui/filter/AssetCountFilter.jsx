// src/components/ui/assetCountFilter/AssetCountFilter.jsx
import "./AssetCountFilter.css";

const DEFAULT_OPTIONS = [
  { value: "", label: "All" },
  { value: "none", label: "None (0)" },
  { value: "low", label: "Low (1–10)" },
  { value: "medium", label: "Medium (11–50)" },
  { value: "high", label: "High (50+)" },
];

/**
 * Dropdown filter for bucketed asset counts (None/Low/Medium/High).
 *
 * @param {string} value - current selected bucket
 * @param {(value: string) => void} onChange - called with the new value on select
 * @param {string} [label] - label text shown before the select
 * @param {string} [id] - id shared between the label's htmlFor and the select
 * @param {{value: string, label: string}[]} [options] - override the bucket options
 */
export default function AssetCountFilter({
  value,
  onChange,
  label = "Assets:",
  id = "asset-count-filter",
  options = DEFAULT_OPTIONS,
}) {
  return (
    <div className="asset-count-filter">
      <label htmlFor={id} className="asset-count-filter-label">
        {label}
      </label>
      <select
        id={id}
        name="assetCount"
        className="asset-count-filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
