// src/components/ui/SearchBar/SearchBar.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./SearchBar.css";

/**
 * Reusable search input with a leading icon.
 *
 * @param {string} value - current search text
 * @param {(value: string) => void} onChange - called with the new text on input
 * @param {string} [placeholder] - input placeholder text
 * @param {string} [className] - optional extra class for per-instance sizing
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`search-bar ${className}`.trim()}>
      <FontAwesomeIcon
        icon="fa-solid fa-magnifying-glass"
        className="search-icon"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
