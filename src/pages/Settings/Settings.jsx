import { NavLink } from "react-router-dom";
import "./Settings.css";

const SETTINGS_TABS = [
  { label: "Profile", path: "/settings/profile" },
  { label: "Security", path: "/settings/security" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "System Config", path: "/settings/system-config" },
  { label: "Theme", path: "/settings/theme" },
];

function Settings({ children }) {
  return (
    <div className="settings-page">
      <header className="settings-page-header">
        <h1>Settings</h1>
        <p>Manage your account.</p>
      </header>

      <nav className="settings-tabs" aria-label="Settings sections">
        {SETTINGS_TABS.map((tab) => (
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
