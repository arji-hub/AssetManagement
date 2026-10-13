import ROLES from "../data/roles";
import { TRANSFER_TYPES, STATUS } from "../data/transfer";
import { getMillis, toDate } from "./date";

// Pure transfer helpers: no Firestore access in this file.

// If STATUS already defines COMPLETED / DENIED, swap these literals for them.
const COMPLETED = "completed";
const DENIED = "denied";

export const CLOSED_STATUSES = [COMPLETED, DENIED];

export const isOpenRequest = (request) =>
  !CLOSED_STATUSES.includes(request.status);

// ─── sorting ───────────────────────────────────────────────────────

export function sortByDateDesc(items, field = "created_at") {
  return [...items].sort((a, b) => getMillis(b[field]) - getMillis(a[field]));
}

// ─── acknowledgments / status ──────────────────────────────────────

/** True when `uid` is a from/to/custodian party that has NOT yet acknowledged. */
export function isAwaitingAcknowledgment(request, uid) {
  const acks = request.acknowledgments || {};
  return ["from", "to", "property_custodian"].some(
    (key) => acks[key]?.uid === uid && acks[key]?.acknowledged === false,
  );
}

/**
 * Status after an approve/decline action, or null when it stays unchanged.
 * `acks` is the post-action state: { admin, from, to } booleans.
 */
export function resolveNextStatus(isApprove, acks) {
  if (!isApprove) return DENIED;
  if (acks.admin && acks.from && acks.to) return COMPLETED;
  if (!acks.admin && acks.from && acks.to) return STATUS.FOR_APPROVAL;
  return null;
}

export function resolveTransferType(from, to) {
  if (!from && !to) {
    throw new Error(
      "Invalid transfer request: 'from' and 'to' cannot both be empty.",
    );
  }

  if (!from) return TRANSFER_TYPES.ASSIGN;
  if (!to) return TRANSFER_TYPES.REMOVE;

  if (from.role === ROLES.FULLTIME && to.role === ROLES.PARTTIME) {
    return TRANSFER_TYPES.ASSIGNMR;
  }
  if (from.role === ROLES.PARTTIME && to.role === ROLES.FULLTIME) {
    return TRANSFER_TYPES.REMOVEMR;
  }

  return TRANSFER_TYPES.TRANSFER;
}

/** Non-admin assign/remove requests need admin approval first. */
export function resolveInitialStatus(type, isAdmin) {
  const needsApproval =
    (type === TRANSFER_TYPES.ASSIGN || type === TRANSFER_TYPES.REMOVE) &&
    !isAdmin;
  return needsApproval ? STATUS.FOR_APPROVAL : STATUS.PENDING;
}

export function buildStatusLogEntry(action, byRole, byName, note) {
  return {
    action,
    by: byRole,
    by_name: byName,
    date: new Date(), // arrayUnion can't hold serverTimestamp()
    note: note || "",
  };
}

// ─── items ─────────────────────────────────────────────────────────

/** Drop items with no asset_id and keep only the first of each asset_id. */
export function dedupeItemsByAssetId(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.asset_id || seen.has(item.asset_id)) return false;
    seen.add(item.asset_id);
    return true;
  });
}

/** Items of a transfer request, supporting the legacy single-asset shape. */
export function getRequestItems(request) {
  if (Array.isArray(request?.items) && request.items.length > 0) {
    return request.items;
  }
  if (request?.asset_id) {
    return [
      {
        asset_id: request.asset_id,
        asset_description: request.asset_description,
      },
    ];
  }
  return [];
}

/** Items of a room transfer log, supporting the legacy single-asset shape. */
export function getRoomTransferItems(log) {
  if (Array.isArray(log?.items) && log.items.length > 0) return log.items;
  if (log?.asset_id) {
    return [
      {
        asset_id: log.asset_id,
        asset_name: log.asset_name,
        room_from: log.room_from ?? null,
      },
    ];
  }
  return [];
}

// ─── room transfers ────────────────────────────────────────────────

/** Validate + de-dupe room transfer items. `target` is the room id or null. */
export function normalizeRoomTransferItems(items, target) {
  const seen = new Set();
  const clean = [];

  for (const item of items) {
    if (!item?.asset_id) {
      throw new Error("TransferRoom: every item needs an asset_id");
    }
    if (!item.asset_name) {
      throw new Error(
        `TransferRoom: asset_name is required (${item.asset_id})`,
      );
    }
    if (seen.has(item.asset_id)) continue;
    seen.add(item.asset_id);

    const roomFrom = item.room_from || null;
    if (roomFrom === target) {
      throw new Error(
        target
          ? `TransferRoom: asset ${item.asset_id} is already in that room`
          : `TransferRoom: asset ${item.asset_id} has no room to remove it from`,
      );
    }

    clean.push({
      asset_id: item.asset_id,
      asset_name: item.asset_name,
      room_from: roomFrom,
    });
  }

  return clean;
}

/**
 * Net asset-count change per room for the items that were actually moved,
 * e.g. 20 assets out of room A => A: -20. Zero deltas are dropped.
 * Returns Map<roomId, delta>.
 */
export function computeRoomCountDeltas(movedItems, target) {
  const deltas = new Map();
  const bump = (roomId, n) => {
    if (roomId) deltas.set(roomId, (deltas.get(roomId) ?? 0) + n);
  };

  for (const item of movedItems) {
    bump(item.room_from, -1);
    bump(target, +1);
  }

  return new Map([...deltas].filter(([, delta]) => delta !== 0));
}

// ─── promotion ─────────────────────────────────────────────────────

/**
 * Group a custodian's local-MR asset docs by property custodian uid
 * (null = none). Assets already owned by `custodianId` are skipped.
 */
export function groupAssetsByPropertyCustodian(assetDocs, custodianId) {
  const groups = new Map(); // propertyCustodianUid | null -> items[]

  assetDocs.forEach((d) => {
    const { property_custodian, description } = d.data();
    const pc = property_custodian ?? null;
    if (pc === custodianId) return;

    if (!groups.has(pc)) groups.set(pc, []);
    groups.get(pc).push({ asset_id: d.id, asset_description: description });
  });

  return groups;
}

// ─── dashboard stats: range / bucket helpers ───────────────────────

export function getRangeBounds(range) {
  const now = new Date();
  if (range === "year") {
    return {
      currentStart: new Date(now.getFullYear(), 0, 1),
      previousStart: new Date(now.getFullYear() - 1, 0, 1),
    };
  }
  return {
    currentStart: new Date(now.getFullYear(), now.getMonth(), 1),
    previousStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  };
}

function bucketKey(date, range) {
  return range === "year"
    ? `${date.getFullYear()}-${date.getMonth()}`
    : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function bucketLabel(date, range) {
  return range === "year"
    ? date.toLocaleString("en-US", { month: "short" })
    : String(date.getDate());
}

/**
 * One bucket per month (year view) or per day (month view) up to today.
 * Each bucket starts as { key, label, ...seed }.
 */
function createBucketMap(range, seed) {
  const now = new Date();
  const isYear = range === "year";
  const count = isYear ? now.getMonth() + 1 : now.getDate();
  const buckets = new Map();

  for (let i = 0; i < count; i++) {
    const date = isYear
      ? new Date(now.getFullYear(), i, 1)
      : new Date(now.getFullYear(), now.getMonth(), i + 1);
    const key = bucketKey(date, range);
    buckets.set(key, { key, label: bucketLabel(date, range), ...seed });
  }

  return buckets;
}

export function computeTrend(current, previous) {
  const direction =
    current === previous ? "flat" : current > previous ? "up" : "down";

  const deltaPercent =
    previous === 0
      ? current === 0
        ? 0
        : 100
      : Math.round(((current - previous) / Math.abs(previous)) * 100);

  return { direction, deltaPercent };
}

/**
 * For a completed request, tells which period it falls in
 * ("current" | "previous") or null if it should be ignored.
 */
function classifyCompletion(item, { currentStart, previousStart }) {
  if (item.status !== COMPLETED) return null;

  const completedAt = toDate(item.completed_at);
  if (!completedAt) return null;

  if (completedAt >= currentStart) return { completedAt, period: "current" };
  if (completedAt >= previousStart) return { completedAt, period: "previous" };
  return null;
}

// ─── dashboard stats: admin view (circulation) ─────────────────────

export function summarizeTransferActivity(items, range) {
  const bounds = getRangeBounds(range);
  const buckets = createBucketMap(range, { requests: 0, assets: 0 });
  const current = { requests: 0, assets: 0 };
  const previous = { requests: 0, assets: 0 };

  items.forEach((item) => {
    const completion = classifyCompletion(item, bounds);
    if (!completion) return;

    const assetCount = getRequestItems(item).length || 1;
    const isCurrent = completion.period === "current";
    const totals = isCurrent ? current : previous;

    totals.requests += 1;
    totals.assets += assetCount;

    if (isCurrent) {
      const bucket = buckets.get(bucketKey(completion.completedAt, range));
      if (bucket) {
        bucket.requests += 1;
        bucket.assets += assetCount;
      }
    }
  });

  // Trend reflects circulation (assets moved), the headline metric on the
  // admin card; request count is a secondary stat.
  return {
    series: Array.from(buckets.values()),
    totals: {
      all: current.assets,
      requests: current.requests,
      assets: current.assets,
    },
    trend: computeTrend(current.assets, previous.assets),
  };
}

// ─── dashboard stats: custodian view (assigned vs removed) ─────────

export function summarizeCustodianAssignmentEvents(items, range, uid) {
  const bounds = getRangeBounds(range);
  const buckets = createBucketMap(range, { assigned: 0, removed: 0 });
  const current = { assigned: 0, removed: 0 };
  const previous = { assigned: 0, removed: 0 };

  items.forEach((item) => {
    const wasAssigned = item.acknowledgments?.to?.uid === uid;
    const wasRemoved = item.acknowledgments?.from?.uid === uid;
    if (!wasAssigned && !wasRemoved) return;

    const completion = classifyCompletion(item, bounds);
    if (!completion) return;

    // One request can move several assets, so count assets, not requests.
    const assetCount = getRequestItems(item).length || 1;
    const isCurrent = completion.period === "current";
    const totals = isCurrent ? current : previous;

    if (wasAssigned) totals.assigned += assetCount;
    if (wasRemoved) totals.removed += assetCount;

    if (isCurrent) {
      const bucket = buckets.get(bucketKey(completion.completedAt, range));
      if (bucket) {
        if (wasAssigned) bucket.assigned += assetCount;
        if (wasRemoved) bucket.removed += assetCount;
      }
    }
  });

  const currentTotal = current.assigned + current.removed;
  const previousTotal = previous.assigned + previous.removed;
  const currentNet = current.assigned - current.removed;
  const previousNet = previous.assigned - previous.removed;

  // AssetDashboardPanel reads totals.all/assigned/removed + trend;
  // TransferDashboardPanel's net-custody view reads netTotal/netTrend and
  // each bucket's `net`.
  return {
    series: Array.from(buckets.values(), (bucket) => ({
      ...bucket,
      net: bucket.assigned - bucket.removed,
    })),
    totals: {
      all: currentTotal,
      assigned: current.assigned,
      removed: current.removed,
    },
    trend: computeTrend(currentTotal, previousTotal),
    netTotal: currentNet,
    netTrend: computeTrend(currentNet, previousNet),
  };
}
