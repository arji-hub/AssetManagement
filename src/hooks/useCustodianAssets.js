import { useState, useEffect, useCallback } from "react";
import { fetchAssetsByCustodian, fetchCustodians } from "../services/user";

export function useCustodianAssets(username) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const UID = async (username) => {
    const custodians = await fetchCustodians();
    const match = custodians.find((c) => c.username === username);
    return match ? match.id : null;
  };

  const loadAssets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const uid = await UID(username);  
      if (!uid) throw new Error("Custodian not found.");

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
