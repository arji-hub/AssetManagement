import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../hooks/settings/theme/useTheme";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../data/roles";
import "./Settings.css";

const SETTINGS_TABS = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Security", path: "/settings/security" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "System Config", path: "/settings/system-config", adminOnly: true },
];

function Settings({ children }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";
  const isAdmin = user?.role === ROLES.ADMIN;

  const visibleTabs = SETTINGS_TABS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account.</p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          className="settings-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          <span className="settings-theme-toggle-icon settings-theme-toggle-icon-sun">
            <FontAwesomeIcon icon="fa-solid fa-sun" />
          </span>
          <span className="settings-theme-toggle-icon settings-theme-toggle-icon-moon">
            <FontAwesomeIcon icon="fa-solid fa-moon" />
          </span>
          <span className="settings-theme-toggle-thumb" />
        </button>
      </header>

      <nav className="settings-tabs" aria-label="Settings sections">
        {visibleTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              isActive ? "settings-tab is-active" : "settings-tab"
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="settings-content">{children}</div>
    </div>
  );
}

export default Settings;
