// utils/NotificationPrefs.js
//
// Shared helper for gating trigger-function emails on each recipient's
// stored notification_prefs (set from the Notifications settings page,
// see hooks/settings/notification/useNotification.js on the client).
//
// A missing prefs map, or a missing key within it, defaults to "on" so
// existing users keep receiving email until they explicitly opt out.
// Keep this category list in sync with CATEGORIES in Notification.jsx.

const DEFAULT_PREFS = {
  report: true,
  transfer_request: true,
  transfer_room: true,
};

/**
 * @param {{ notification_prefs?: Record<string, boolean> | null } | null} userData
 * @param {keyof typeof DEFAULT_PREFS} category
 */
function isNotificationEnabled(userData, category) {
  if (!userData) return false;

  const prefs = userData.notification_prefs;
  if (prefs && Object.prototype.hasOwnProperty.call(prefs, category)) {
    return prefs[category] !== false;
  }

  return DEFAULT_PREFS[category] !== false;
}

module.exports = { isNotificationEnabled, DEFAULT_PREFS };
