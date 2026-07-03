import { useState, useEffect } from "react";
import { subscribeToReports } from "../services/report";
import { useAuth } from "../context/AuthContext";
import ROLES from "../data/roles";

export function useReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const uidFilter = role === ROLES.ADMIN ? undefined : user.uid;

    const unsubscribe = subscribeToReports(
      uidFilter,
      (reports) => {
        setData(reports);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [role, user]);

  return { data, loading, error };
}
