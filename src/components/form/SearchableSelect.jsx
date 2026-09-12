// src/components/form/SearchableSelect.jsx
import { useEffect, useRef, useState } from "react";
import "./SearchableSelect.css";

/**
 * Generic searchable + scrollable dropdown for a single choice out of a
 * (potentially long) option list. Options are { id, label }. Selecting
 * calls onSelect(id) — wire that into onChange({ target: { name, value } })
 * at the call site to match native <select> onChange handlers.
 */
function SearchableSelect({
  options,
  value,
  onSelect,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches.",
  loading = false,
  error = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedLabel = options.find((o) => o.id === value)?.label || "";

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [isOpen]);

  function handleSelect(id) {
    onSelect(id);
    setIsOpen(false);
  }

  function handleTriggerKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  }

  return (
    <div className="reg-searchable" ref={containerRef}>
      <button
        type="button"
        className={`reg-searchable-trigger ${error ? "reg-input--error" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        disabled={loading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedLabel ? "" : "reg-searchable-placeholder"}>
          {loading ? "Loading…" : selectedLabel || placeholder}
        </span>
        <span className="reg-searchable-caret" aria-hidden="true" />
      </button>

      {isOpen && !loading && (
        <div className="reg-searchable-panel">
          <input
            ref={searchInputRef}
            type="text"
            className="reg-searchable-search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
          />

          <ul className="reg-searchable-list" role="listbox">
            {filteredOptions.length === 0 ? (
              <li className="reg-searchable-empty">{emptyMessage}</li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={option.id === value}
                  className={`reg-searchable-option ${
                    option.id === value ? "reg-searchable-option--active" : ""
                  }`}
                  onClick={() => handleSelect(option.id)}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
