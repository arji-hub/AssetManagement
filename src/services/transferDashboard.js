/**
 * services/transferDashboard.js
 *
 * Dashboard panels (TransferDashboardPanel / AssetDashboardPanel):
 * trend + pending-summary subscriptions.
 */
import { query, where, onSnapshot } from "firebase/firestore";
import { STATUS } from "../data/transfer";
import {
  getRangeBounds,
  summarizeTransferActivity,
  summarizeCustodianAssignmentEvents,
} from "../utils/transfer";
import {
  PARTICIPANT_FIELDS,
  transferCol,
  isAdminUser,
  subscribeMerged,
} from "./transferShared";
import { subscribeToAction } from "./transferRequest";

/** Requests created since `sinceDate` that are visible to `user`. */
function subscribeScopedSince(user, sinceDate, callback, onError) {
  const since = where("created_at", ">=", sinceDate);

  const queries = isAdminUser(user)
    ? [query(transferCol(), since)]
    : PARTICIPANT_FIELDS.map((field) =>
        query(transferCol(), since, where(field, "==", user.uid)),
      );

  return subscribeMerged(queries, callback, onError);
}

const emptyTransferActivity = () => ({
  series: [],
  totals: { all: 0, requests: 0, assets: 0 },
  trend: { direction: "flat", deltaPercent: 0 },
});

const emptyCustodianTrend = () => ({
  series: [],
  totals: { all: 0, assigned: 0, removed: 0 },
  trend: { direction: "flat", deltaPercent: 0 },
});

/** Month/Year circulation feed (admin view) for TransferDashboardPanel's chart. */
export function subscribeToTransferActivityTrend(
  user,
  range,
  callback,
  onError,
) {
  if (!user?.uid) {
    callback(emptyTransferActivity());
    return () => {};
  }

  return subscribeScopedSince(
    user,
    getRangeBounds(range).previousStart,
    (items) => callback(summarizeTransferActivity(items, range)),
    onError,
  );
}

/** Month/Year assigned-vs-removed trend feed for AssetDashboardPanel (custodian view). */
export function subscribeToCustodianAssignmentTrend(
  user,
  range,
  callback,
  onError,
) {
  if (!user?.uid) {
    callback(emptyCustodianTrend());
    return () => {};
  }

  return subscribeScopedSince(
    user,
    getRangeBounds(range).previousStart,
    (items) =>
      callback(summarizeCustodianAssignmentEvents(items, range, user.uid)),
    onError,
  );
}

export function subscribeToPendingSummary(user, callback, onError) {
  if (!user?.uid) {
    callback(0);
    return () => {};
  }

  if (isAdminUser(user)) {
    return onSnapshot(
      query(
        transferCol(),
        where("status", "in", [STATUS.PENDING, STATUS.FOR_APPROVAL]),
      ),
      (snap) => callback(snap.size),
      (err) => onError?.(err),
    );
  }

  return subscribeToAction(user, (items) => callback(items.length), onError);
}
