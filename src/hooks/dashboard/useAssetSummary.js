import { useEffect, useMemo, useState } from "react";
import { subscribeToAssets, summarizeAssetEvents } from "../../services/asset";
import { subscribeToAssetsByCustodian } from "../../services/user";
import {
  subscribeToCustodianAssignmentTrend,
  summarizeCustodianAssignmentEvents,
} from "../../services/transfer";
import { ROLES } from "../../data/roles";

export function useAssetSummary(
  user,
  range = "month",
  mockAssets = null,
  mockAssignmentEvents = null,
) {
  const [assets, setAssets] = useState(mockAssets ?? []);
  const [loading, setLoading] = useState(!mockAssets);
  const [error, setError] = useState(null);

  const [assignmentTrend, setAssignmentTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(!mockAssignmentEvents);

  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (mockAssets) return;

    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    const onData = (data) => {
      setAssets(data);
      setLoading(false);
    };
    const onErr = (err) => {
      setError(err);
      setLoading(false);
    };

    const unsubscribe = isAdmin
      ? subscribeToAssets(ROLES.ADMIN, user.uid, onData, onErr)
      : subscribeToAssetsByCustodian(user.uid, onData, onErr);
    return unsubscribe;
  }, [user?.uid, user?.role, isAdmin, mockAssets]);

  // Custodian assign/remove history comes from transfer_request events,
  // not from the current asset list — separate subscription (also bypassable).
  useEffect(() => {
    if (mockAssignmentEvents) return; // Storybook / test bypass
    if (!user?.uid || isAdmin) {
      setAssignmentTrend(null);
      setTrendLoading(false);
      return;
    }

    setTrendLoading(true);
    const unsubscribe = subscribeToCustodianAssignmentTrend(
      user,
      range,
      (summary) => {
        setAssignmentTrend(summary);
        setTrendLoading(false);
      },
      () => setTrendLoading(false),
    );

    return unsubscribe;
  }, [user?.uid, user?.role, isAdmin, range, mockAssignmentEvents]);

  const statusBreakdown = useMemo(
    () =>
      assets.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      }, {}),
    [assets],
  );

  const eventSummary = useMemo(() => {
    if (isAdmin) return summarizeAssetEvents(assets, range);
    if (mockAssignmentEvents) {
      return summarizeCustodianAssignmentEvents(
        mockAssignmentEvents,
        range,
        user?.uid,
      );
    }
    return (
      assignmentTrend ?? {
        series: [],
        totals: { all: 0, assigned: 0, removed: 0 },
        trend: { direction: "flat", deltaPercent: 0 },
      }
    );
  }, [
    isAdmin,
    assets,
    range,
    assignmentTrend,
    mockAssignmentEvents,
    user?.uid,
  ]);

  return {
    assets,
    totalAssets: assets.length,
    statusBreakdown,
    mode: isAdmin ? "acquisition" : "assignment",
    series: eventSummary.series,
    totals: eventSummary.totals,
    trend: eventSummary.trend,
    loading: isAdmin ? loading : loading || trendLoading,
    error,
  };
}
