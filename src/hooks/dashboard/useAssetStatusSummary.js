import { useEffect, useMemo, useState } from "react";
import { subscribeToAssets } from "../../services/asset";
import { subscribeToAssetsByCustodian } from "../../services/user";
import { ROLES } from "../../data/roles";
import { ASSET_STATUS } from "../../data/assets";

/**
 * Loads the current asset list (admin: all assets, custodian: assets they
 * hold) and reduces it to a per-status count — the data source for
 * AssetStatusDashboardPanel's donut chart.
 *
 * Unlike useAssetSummary (which buckets acquisition/condemn *events* over
 * a time range), this hook only cares about each asset's *current*
 * status, so there's no range param and no separate transfer-event
 * subscription — it reuses the same live asset subscription pattern.
 *
 * @param {object} user           Firestore user object ({ uid, role, ... })
 * @param {Array|null} mockAssets Storybook/test bypass — fixed asset array
 */
export function useAssetStatusSummary(user, mockAssets = null) {
  const [assets, setAssets] = useState(mockAssets ?? []);
  const [loading, setLoading] = useState(!mockAssets);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    if (mockAssets) return; // Storybook / test bypass — skip the Firestore subscription
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

  const { breakdown, totalAssets } = useMemo(() => {
    const counts = ASSET_STATUS.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    assets.forEach((asset) => {
      if (counts[asset.status] !== undefined) {
        counts[asset.status] += 1;
      }
    });

    // Keep the fixed ASSET_STATUS order, drop statuses with nothing in
    // them so the donut/legend don't show empty zero-count slices.
    const breakdown = ASSET_STATUS.map((status) => ({
      status,
      count: counts[status],
    })).filter((entry) => entry.count > 0);

    return { breakdown, totalAssets: assets.length };
  }, [assets]);

  return { breakdown, totalAssets, loading, error };
}
