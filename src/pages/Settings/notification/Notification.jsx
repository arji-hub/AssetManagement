import MainLayout from "../../../components/layout/MainLayout";
import useNotification from "../../../hooks/settings/notification/useNotification";
import Settings from "../Settings";
import "./Notification.css";

// Keep these keys in sync with functions/utils/notificationPrefs.js
// (DEFAULT_PREFS) — each key is a category a trigger function checks
// before sending mail.
const CATEGORIES = [
  {
    key: "report",
    label: "Reports",
    description:
      "New reports filed, and status updates, for assets you're associated with.",
  },
  {
    key: "transfer_request",
    label: "Transfer Requests",
    description:
      "Approval requests and resolutions for asset transfer requests you're involved in.",
  },
  {
    key: "transfer_room",
    label: "Room Transfers",
    description: "When an asset you're associated with is moved to a new room.",
  },
];

function Notification() {
  const { prefs, loading, loadError, savingKey, saveError, toggle } =
    useNotification();

  return (
    <MainLayout>
      <Settings>
        <section className="settings-section">
          <div className="settings-section-header">
            <div>
              <h3>Email Notifications</h3>
              <p>
                Choose which events send you an email. These preferences only
                affect your own account.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="category-list-empty">Loading preferences...</div>
          ) : loadError ? (
            <div className="category-list-empty">{loadError}</div>
          ) : (
            <div className="settings-rows">
              {CATEGORIES.map((category) => {
                const isOn = prefs[category.key] !== false;
                const isSaving = savingKey === category.key;

                return (
                  <div className="settings-row" key={category.key}>
                    <span className="settings-row-label">{category.label}</span>

                    <div className="notif-row-value">
                      <p className="notif-row-desc">{category.description}</p>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isOn}
                        aria-label={`${isOn ? "Disable" : "Enable"} ${category.label} email notifications`}
                        className="notif-toggle"
                        disabled={isSaving}
                        onClick={() => toggle(category.key)}
                      >
                        <span className="notif-toggle-thumb" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {saveError && (
            <div className="settings-form-actions">
              <p className="settings-save-error">{saveError}</p>
            </div>
          )}
        </section>
      </Settings>
    </MainLayout>
  );
}

export default Notification;
