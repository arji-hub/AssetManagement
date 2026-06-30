import { useState, useEffect, useCallback } from "react";
import { fetchReports } from "../services/report";
import { useAuth } from "../context/AuthContext";
import ROLES from "../data/roles";

export function useReports() {
  const { role, user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user) {
      console.log("fetch skipped: no user");
      return;
    }

    console.log("fetching reports for:", {
      role,
      uid: user.uid,
      isAdmin: role === ROLES.ADMIN,
    });

    setLoading(true);
    setError(null);
    try {
      const reports =
        role === ROLES.ADMIN
          ? await fetchReports()
          : await fetchReports(user.uid);

      console.log("reports returned:", reports.length, reports);
      setData(reports);
    } catch (err) {
      console.error("fetch reports error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [role, user]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
