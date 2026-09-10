// src/components/ui/assetCountFilter/AssetCountFilter.jsx
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
 * @param {string} [label] - label text shown on the trigger button
 * @param {string} [id] - id used for the trigger button
 * @param {{value: string, label: string}[]} [options] - override the bucket options
 */
export default function AssetCountFilter({
  value,
  onChange,
  label = "Assets",
  id = "asset-count-filter",
  options = DEFAULT_OPTIONS,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="asset-count-filter" ref={ref}>
      <button
        type="button"
        id={id}
        className="asset-count-filter-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon="fa-solid fa-boxes-stacked" />
        {label}
        {activeLabel && activeLabel !== "All" && (
          <span className="asset-count-filter-active">{activeLabel}</span>
        )}
      </button>

      {open && (
        <div className="asset-count-filter-menu" role="menu">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === opt.value}
              className={`asset-count-filter-item${
                value === opt.value ? " asset-count-filter-item--active" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {value === opt.value && (
                <FontAwesomeIcon icon="fa-solid fa-check" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
