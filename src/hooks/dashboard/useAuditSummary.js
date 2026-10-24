import { useEffect, useMemo, useState } from "react";
import { subscribeToAudits } from "../../services/audit";
import { subscribeToRooms } from "../../services/room";
import {
  AUDIT_CYCLE_DAYS,
  STALE_AUDIT_DAYS,
  STALE_PROGRESS_PERCENT,
} from "../../data/audit";
import {
  parseDate,
  buildEmptyBuckets,
  getPeriodBounds,
} from "../../utils/dashboardRange";

const DAY_MS = 86400000;

// audit_room.status is written as "Ongoing" on create and "completed" on
// completion, so compare case-insensitively and treat everything else as open.
const isDone = (audit) =>
  String(audit.status ?? "").toLowerCase() === "completed";

const progressOf = (audit) =>
  audit.total_assets > 0
    ? Math.round(((audit.audited_count ?? 0) / audit.total_assets) * 100)
    : 0;

/**
 * Admin-only audit summary: completed audits + discrepancies bucketed over
 * the selected range, plus the "needs attention" lists (overdue rooms and
 * stale in-progress audits).
 *
 * @param {object} user              Firestore user object ({ uid, role, ... })
 * @param {"month"|"year"} range
 * @param {Array|null} mockAudits    Storybook/test bypass
 * @param {Array|null} mockRooms     Storybook/test bypass
 */
export function useAuditSummary(
  user,
  range = "month",
  mockAudits = null,
  mockRooms = null,
) {
  const [audits, setAudits] = useState(mockAudits ?? []);
  const [rooms, setRooms] = useState(mockRooms ?? []);
  const [loading, setLoading] = useState(!mockAudits);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mockAudits) return;
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    let auditsReady = false;
    let roomsReady = false;
    const checkDone = () => {
      if (auditsReady && roomsReady) setLoading(false);
    };
    const onErr = (err) => {
      setError(err);
      setLoading(false);
    };

    const unsubAudits = subscribeToAudits((data) => {
      setAudits(data);
      auditsReady = true;
      checkDone();
    }, onErr);

    const unsubRooms = subscribeToRooms((data) => {
      setRooms(data);
      roomsReady = true;
      checkDone();
    }, onErr);

    return () => {
      unsubAudits();
      unsubRooms();
    };
  }, [user?.uid, mockAudits]);

  return useMemo(() => {
    const now = new Date();
    const buckets = buildEmptyBuckets(range, now, () => ({
      completed: 0,
      discrepancies: 0,
    }));
    const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

    const { start, end } = getPeriodBounds(range, now, 0);
    const { start: prevStart, end: prevEnd } = getPeriodBounds(range, now, -1);

    let completed = 0;
    let prevCompleted = 0;
    let discrepancies = 0;
    const lastAuditByRoom = new Map(); // room_id -> latest completed_at

    for (const audit of audits.filter(isDone)) {
      const at = parseDate(audit.completed_at);
      if (!at) continue;

      const known = lastAuditByRoom.get(audit.room_id);
      if (!known || at > known) lastAuditByRoom.set(audit.room_id, at);

      if (at >= prevStart && at < prevEnd) prevCompleted += 1;
      if (at < start || at >= end) continue;

      completed += 1;
      discrepancies += audit.discrepancy_count ?? 0;

      const bucket = bucketByKey.get(
        range === "month" ? at.getDate() : at.getMonth(),
      );
      if (bucket) {
        bucket.completed += 1;
        bucket.discrepancies += audit.discrepancy_count ?? 0;
      }
    }

    const inProgress = audits.filter((a) => !isDone(a));

    const staleAudits = inProgress
      .filter((a) => {
        const startedAt = parseDate(a.created_at);
        return (
          startedAt &&
          (now - startedAt) / DAY_MS > STALE_AUDIT_DAYS &&
          progressOf(a) < STALE_PROGRESS_PERCENT
        );
      })
      .map((a) => ({
        ...a,
        progress: progressOf(a),
        daysOpen: Math.floor((now - parseDate(a.created_at)) / DAY_MS),
      }))
      .sort((a, b) => b.daysOpen - a.daysOpen);

    const overdueRooms = rooms
      .filter((r) => (r.status ?? "active") !== "inactive") // skip archived rooms
      .map((r) => {
        const last = lastAuditByRoom.get(r.id) ?? null;
        return {
          ...r,
          lastAuditedAt: last,
          daysSince: last ? Math.floor((now - last) / DAY_MS) : null,
        };
      })
      .filter((r) => r.daysSince === null || r.daysSince > AUDIT_CYCLE_DAYS)
      .sort((a, b) => (b.daysSince ?? Infinity) - (a.daysSince ?? Infinity));

    const delta = completed - prevCompleted;

    return {
      series: buckets,
      totals: {
        completed,
        discrepancies,
        inProgress: inProgress.length,
        overdueRooms: overdueRooms.length,
        neverAudited: overdueRooms.filter((r) => r.daysSince === null).length,
      },
      attention: { staleAudits, overdueRooms },
      trend: {
        delta,
        deltaPercent:
          prevCompleted === 0
            ? completed > 0
              ? 100
              : 0
            : Math.round((delta / prevCompleted) * 100),
        direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      },
      loading,
      error,
    };
  }, [audits, rooms, range, loading, error]);
}
