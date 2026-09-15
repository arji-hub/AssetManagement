import { useEffect, useState } from "react";
import {
  subscribeToPendingSummary,
  subscribeToTransferTrend,
  summarizeTransferItems,
} from "../../services/transfer";

export function useTransferSummary(user, range, mockTransfers) {
  const isMocked = mockTransfers !== undefined;

  const [series, setSeries] = useState([]);
  const [totals, setTotals] = useState({ all: 0, unresolved: 0 });
  const [trend, setTrend] = useState({ direction: "flat", deltaPercent: 0 });
  const [loading, setLoading] = useState(!isMocked);
  const [error, setError] = useState(null);

  // Live backlog count (Pending + For Approval) — independent of range,
  // same figure the original simple hook exposed as `pendingCount`.
  useEffect(() => {
    if (isMocked) return;
    if (!user?.uid) return;

    const unsubscribe = subscribeToPendingSummary(
      user,
      (count) => setTotals((prev) => ({ ...prev, unresolved: count })),
      (err) => setError(err),
    );

    return () => unsubscribe?.();
  }, [user?.uid, user?.role, isMocked]);

  // Month/Year bucketed trend for the chart.
  useEffect(() => {
    if (isMocked) {
      const summary = summarizeTransferItems(mockTransfers ?? [], range);
      setSeries(summary.series);
      setTotals((prev) => ({
        ...prev,
        all: summary.totals.all,
        unresolved: summary.totals.all,
      }));
      setTrend(summary.trend);
      setLoading(false);
      return;
    }

    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToTransferTrend(
      user,
      range,
      (summary) => {
        setSeries(summary.series);
        setTotals((prev) => ({ ...prev, all: summary.totals.all }));
        setTrend(summary.trend);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );

    return () => unsubscribe?.();
  }, [user?.uid, user?.role, range, isMocked, mockTransfers]);

  return { series, totals, trend, loading, error };
}
