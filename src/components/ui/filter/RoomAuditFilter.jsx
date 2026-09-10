// src/components/ui/filter/RoomAuditFilter.jsx
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./RoomAuditFilter.css";

const OPTIONS = [
  { value: "recent_desc", label: "Recently audited (newest first)" },
  { value: "recent_asc", label: "Recently audited (oldest first)" },
  { value: "not_audited", label: "Not yet audited" },
];

function RoomAuditFilter({ value, onChange }) {
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

  return (
    <div className="room-audit-filter" ref={ref}>
      <button
        type="button"
        className="room-audit-filter-btn"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FontAwesomeIcon icon="fa-solid fa-sliders" />
        Filter
      </button>

      {open && (
        <div className="room-audit-filter-menu" role="menu">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="menuitemradio"
              aria-checked={value === opt.value}
              className={`room-audit-filter-item${
                value === opt.value ? " room-audit-filter-item--active" : ""
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

export default RoomAuditFilter;
