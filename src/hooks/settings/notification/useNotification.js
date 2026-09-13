import { useState, useEffect, useCallback, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
// Adjust this import to wherever your project exports its Firestore
// `db` instance (e.g. "../../../firebase/config" or "../../../lib/firebase").
import { db } from "../../../services/firebase-config";
import { useAuth } from "../../../context/AuthContext";

// Keep this in sync with functions/utils/notificationPrefs.js — that
// file is the source of truth backend-side; this is its client mirror.
const DEFAULT_PREFS = {
  report: true,
  transfer_request: true,
  transfer_room: true,
};

function useNotification() {
  const { user } = useAuth();

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Last-known-good prefs, used to build the next optimistic update and
  // to roll back to if a save fails — kept out of state so toggling
  // doesn't need to wait on a render to read the current value.
  const committedPrefsRef = useRef(DEFAULT_PREFS);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const snap = await getDoc(doc(db, "user", user.uid));
        if (cancelled) return;

        const stored = snap.exists() ? snap.data().notification_prefs : null;
        const merged = { ...DEFAULT_PREFS, ...(stored || {}) };

        committedPrefsRef.current = merged;
        setPrefs(merged);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load notification preferences:", err);
          setLoadError("Couldn't load your notification settings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const toggle = useCallback(
    async (category) => {
      if (!user?.uid || savingKey) return;

      const next = {
        ...committedPrefsRef.current,
        [category]: !committedPrefsRef.current[category],
      };

      setSaveError(null);
      setSavingKey(category);
      setPrefs(next); // optimistic — flips immediately, rolled back on failure

      try {
        await updateDoc(doc(db, "user", user.uid), {
          notification_prefs: next,
        });
        committedPrefsRef.current = next;
      } catch (err) {
        console.error("Failed to save notification preference:", err);
        setSaveError("Couldn't save that change — please try again.");
        setPrefs(committedPrefsRef.current);
      } finally {
        setSavingKey(null);
      }
    },
    [user?.uid, savingKey],
  );

  return { prefs, loading, loadError, savingKey, saveError, toggle };
}

export default useNotification;
