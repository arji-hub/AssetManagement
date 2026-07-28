import { useEffect, useState } from "react";
import { fetchCustodians } from "../../services/user";

export function useCustodianCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCustodians()
      .then((data) => {
        if (!cancelled) {
          setCount(data.length);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { totalCustodians: count, loading, error };
}