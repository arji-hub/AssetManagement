import { useState, useEffect } from "react";
import {
  subscribeToAssetsByCustodian,
  fetchCustodians,
} from "../services/user";

export function useCustodianAssets(username) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError(null);

      try {
        const custodians = await fetchCustodians();
        const match = custodians.find((c) => c.username === username);

        if (cancelled) return;

        if (!match) {
          setError(new Error("Custodian not found."));
          setLoading(false);
          return;
        }

        unsubscribe = subscribeToAssetsByCustodian(
          match.id,
          (assets) => {
            setAssets(assets);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
          },
        );
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [username]);

  return { assets, loading, error };
}
