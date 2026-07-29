import { useEffect, useState } from "react";
import { subscribeToAssets } from "../../services/asset";
import { subscribeToAssetsByCustodian } from "../../services/user";
import { ROLES } from "../../data/roles";

export function useAssetSummary(user) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    const unsubscribe =
      user.role === ROLES.ADMIN
        ? subscribeToAssets(ROLES.ADMIN, user.uid, onData, onErr)
        : subscribeToAssetsByCustodian(user.uid, onData, onErr);

    return unsubscribe;
  }, [user?.uid, user?.role]);

  const statusBreakdown = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    assets,
    totalAssets: assets.length,
    statusBreakdown,
    loading,
    error,
  };
}