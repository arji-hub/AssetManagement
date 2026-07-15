import { useState, useEffect } from "react";
import {
  subscribeToAssetsByCustodian,
  findCustodian,
} from "../../services/user";

export function useCustodianAssets(username) {
  const [assets, setAssets] = useState([]);
  const [fullname, setFullname] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError(null);
      setFullname(null);

      try {
        const custodian = await findCustodian(username);

        if (cancelled) return;

        if (!custodian) {
          setError(new Error("Custodian not found."));
          setLoading(false);
          return;
        }

        setFullname(custodian.fullname);

        unsubscribe = subscribeToAssetsByCustodian(
          custodian.id,
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

    if (username) start();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [username]);

  return { assets, fullname, loading, error };
}