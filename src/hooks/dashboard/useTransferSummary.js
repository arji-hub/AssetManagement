import { useEffect, useState } from "react";
import {
  subscribeToPendingSummary,
  subscribeToTransferActivityTrend,
  subscribeToCustodianAssignmentTrend,
  summarizeTransferActivity,
  summarizeCustodianAssignmentEvents,
} from "../../services/transfer";

export function useTransferSummary(user, range, mockTransfers) {
  const isMocked = mockTransfers !== undefined;
  const isAdmin = user?.role === "admin";

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
      (err) => {
        console.error(
          "useTransferSummary: subscribeToPendingSummary failed",
          err,
        );
        setError(err);
      },
    );

    return () => unsubscribe?.();
  }, [user?.uid, user?.role, isMocked]);

  // Month/Year bucketed trend for the chart. Admin sees circulation
  // (requests resolved vs assets moved); everyone else sees their own
  // net custody (assets assigned to them minus assets removed from them).
  useEffect(() => {
    if (isMocked) {
      if (isAdmin) {
        const summary = summarizeTransferActivity(mockTransfers ?? [], range);
        setSeries(summary.series);
        setTotals((prev) => ({
          ...prev,
          all: summary.totals.assets,
          requests: summary.totals.requests,
          assets: summary.totals.assets,
        }));
        setTrend(summary.trend);
      } else {
        const summary = summarizeCustodianAssignmentEvents(
          mockTransfers ?? [],
          range,
          user?.uid,
        );
        setSeries(summary.series);
        setTotals((prev) => ({ ...prev, all: summary.netTotal }));
        setTrend(summary.netTrend);
      }
      setLoading(false);
      return;
    }

    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const onError = (err) => {
      console.error(
        `useTransferSummary: ${isAdmin ? "subscribeToTransferActivityTrend" : "subscribeToCustodianAssignmentTrend"} failed`,
        err,
      );
      setError(err);
      setLoading(false);
    };

    const unsubscribe = isAdmin
      ? subscribeToTransferActivityTrend(
          user,
          range,
          (summary) => {
            setSeries(summary.series);
            setTotals((prev) => ({
              ...prev,
              all: summary.totals.assets,
              requests: summary.totals.requests,
              assets: summary.totals.assets,
            }));
            setTrend(summary.trend);
            setLoading(false);
          },
          onError,
        )
      : subscribeToCustodianAssignmentTrend(
          user,
          range,
          (summary) => {
            setSeries(summary.series);
            setTotals((prev) => ({ ...prev, all: summary.netTotal }));
            setTrend(summary.netTrend);
            setLoading(false);
          },
          onError,
        );

    return () => unsubscribe?.();
  }, [user?.uid, user?.role, range, isMocked, mockTransfers]);

  return { series, totals, trend, loading, error };
}
