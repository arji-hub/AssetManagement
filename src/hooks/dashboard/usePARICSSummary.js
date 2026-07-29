// hooks/dashboard/usePARICSSummary.js
import { useMemo } from "react";
import { ROLES } from "../../data/roles";

const PAR_THRESHOLD = 50000;

export function usePARICSSummary(
  user,
  assets = [],
  loading = false,
  error = null,
  threshold = PAR_THRESHOLD,
) {
  const summary = useMemo(() => {
    const isAdmin = user?.role === ROLES.ADMIN;

    const scopedAssets = isAdmin
      ? assets
      : assets.filter(
          (asset) =>
            asset.property_custodian === user?.uid ||
            asset.local_mr === user?.uid,
        );

    const buckets = {
      PAR: { count: 0, value: 0 },
      ICS: { count: 0, value: 0 },
    };

    for (const asset of scopedAssets) {
      const value = Number(asset.unit_value) || 0;
      const bucket = value >= threshold ? "PAR" : "ICS";
      buckets[bucket].count += 1;
      buckets[bucket].value += value;
    }

    const totalCount = buckets.PAR.count + buckets.ICS.count;
    const totalValue = buckets.PAR.value + buckets.ICS.value;

    return {
      par: buckets.PAR,
      ics: buckets.ICS,
      totalCount,
      totalValue,
    };
  }, [assets, threshold, user?.uid, user?.role]);

  return { ...summary, loading, error };
}
