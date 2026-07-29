import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase-config";
import { subscribeToAction } from "../../services/transfer";
import { ROLES } from "../../data/roles";

export function useTransferSummary(user) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    let unsubscribe;

    if (user.role === ROLES.ADMIN) {
      const q = query(
        collection(db, "transfer_request"),
        where("status", "in", ["pending", "for_approval"]),
      );
      unsubscribe = onSnapshot(
        q,
        (snap) => {
          setCount(snap.size);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      );
    } else {
      unsubscribe = subscribeToAction(
        user,
        (items) => {
          setCount(items.length);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        },
      );
    }

    return () => unsubscribe?.();
  }, [user?.uid, user?.role]);

  return { pendingCount: count, loading, error };
}