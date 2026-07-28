import { useEffect, useState } from "react";
import { subscribeToReports } from "../../services/report";
import { ROLES } from "../../data/roles";

export function useReportSummary(user) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const uidFilter = user.role === ROLES.ADMIN ? undefined : user.uid;

    const unsubscribe = subscribeToReports(
      uidFilter,
      (data) => {
        setReports(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, user?.role]);

  const openReportsCount = reports.filter((r) => r.date_resolved === null).length;

  return { reports, openReportsCount, loading, error };
}