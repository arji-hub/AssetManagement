import { useState, useEffect, useCallback } from "react";
import { fetchAssetsByCustodian } from "../services/user";
import { findCustodianUidByUsername } from "../services/user";

export function useCustodianAssets(username) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const uid = await findCustodianUidByUsername(username);
      if (!uid) {
        setAssets([]);
        return;
      }
      const data = await fetchAssetsByCustodian(uid);
      setAssets(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return { assets, loading, error, refetch: loadAssets };
}
