import { useEffect, useMemo, useState } from "react";
import { subscribeToReports } from "../../services/report";
import { subscribeToAssets } from "../../services/asset";
import { ROLES } from "../../data/roles";
import { REPORT_STATUS } from "../../data/reports";

const DAY_MS = 86400000;

function parseDate(value) {
  if (!value) return null;
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Powers ReportReminderPanel: the assets that are CURRENTLY missing or
 * damaged, i.e. whose report is still open and still in the "damaged" or
 * "missing" state (not yet endorsed for repair, found, or resolved).
 *
 * - Admin: every such report in the system.
 * - Everyone else: only reports on assets where the logged-in user is the
 *   property custodian or the local MR. Custody comes from the asset's
 *   CURRENT local_mr / property_custodian (via subscribeToAssets), not from
 *   the custodian stamped on the report at filing time, so a transferred
 *   asset reminds its new holder. This also drops reports the user merely
 *   filed (subscribeToReports also matches reported_by) on assets they
 *   don't hold.
 *
 * @param {object} user              AuthContext user ({ uid, role, ... })
 * @param {Array|null} mockReports   Storybook/test bypass
 * @param {Array|null} mockAssets    Storybook/test bypass (non-admin only)
 */
export function useReportReminder(user, mockReports = null, mockAssets = null) {
  const isAdmin = user?.role === ROLES.ADMIN;

  const [reports, setReports] = useState(mockReports ?? []);
  const [assets, setAssets] = useState(mockAssets ?? []);
  const [reportsLoading, setReportsLoading] = useState(!mockReports);
  const [assetsLoading, setAssetsLoading] = useState(!isAdmin && !mockAssets);
  const [error, setError] = useState(null);

  // Reports: admin gets everything, others get the service's broad filter
  // (custodian / local MR / reporter) which we tighten below.
  useEffect(() => {
    if (mockReports) return;
    if (!user?.uid) return;

    setReportsLoading(true);
    setError(null);

    return subscribeToReports(
      isAdmin ? undefined : user.uid,
      (data) => {
        setReports(data);
        setReportsLoading(false);
      },
      (err) => {
        setError(err);
        setReportsLoading(false);
      },
    );
  }, [user?.uid, isAdmin, mockReports]);

  // Assets in the user's custody (admin doesn't need this).
  useEffect(() => {
    if (isAdmin) {
      setAssetsLoading(false);
      return;
    }
    if (mockAssets) return;
    if (!user?.uid) return;

    setAssetsLoading(true);

    return subscribeToAssets(
      user.role,
      user.uid,
      (data) => {
        setAssets(data);
        setAssetsLoading(false);
      },
      (err) => {
        setError(err);
        setAssetsLoading(false);
      },
    );
  }, [user?.uid, user?.role, isAdmin, mockAssets]);

  const { items, counts } = useMemo(() => {
    const heldIds = isAdmin
      ? null
      : new Set(assets.flatMap((a) => [a.id, a.asset_id].filter(Boolean)));

    const now = new Date();
    const byAsset = new Map(); // one entry per asset, even if data is messy

    for (const report of reports) {
      const isIncident =
        report.status === REPORT_STATUS.DAMAGED ||
        report.status === REPORT_STATUS.MISSING;
      if (!isIncident || report.date_resolved) continue;
      if (heldIds && !heldIds.has(report.asset_id)) continue;
      if (byAsset.has(report.asset_id)) continue;

      const reportedAt = parseDate(report.date_reported ?? report.created_at);

      byAsset.set(report.asset_id, {
        id: report.id,
        assetId: report.asset_id,
        reportNo: report.report_no,
        description: report.description,
        roomName: report.room_name,
        status: report.status, // "missing" | "damaged"
        reportedAt,
        daysOpen: reportedAt
          ? Math.max(0, Math.floor((now - reportedAt) / DAY_MS))
          : null,
      });
    }

    // Missing first (more urgent), then longest-open first.
    const list = [...byAsset.values()].sort((a, b) => {
      if (a.status !== b.status)
        return a.status === REPORT_STATUS.MISSING ? -1 : 1;
      return (b.daysOpen ?? -1) - (a.daysOpen ?? -1);
    });

    const missing = list.filter(
      (i) => i.status === REPORT_STATUS.MISSING,
    ).length;
    const damaged = list.length - missing;

    return { items: list, counts: { missing, damaged, total: list.length } };
  }, [reports, assets, isAdmin]);

  return {
    items,
    counts,
    isAdmin,
    loading: reportsLoading || assetsLoading,
    error,
  };
}
