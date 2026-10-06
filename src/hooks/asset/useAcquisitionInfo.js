import { useState, useEffect, useMemo } from "react";
import {
  fetchAssetsByAcquisitionId,
  groupAssetsIntoAcquisitions,
} from "../../services/asset";

export function useAcquisitionInfo(acquisitionId) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!acquisitionId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAssetsByAcquisitionId(acquisitionId)
      .then((data) => {
        if (cancelled) return;
        setAssets(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [acquisitionId]);

  // The summary comes from the assets themselves, so no second fetch.
  const acquisition = useMemo(
    () => groupAssetsIntoAcquisitions(assets)[0] ?? null,
    [assets],
  );

  return { acquisition, assets, loading, error };
}
