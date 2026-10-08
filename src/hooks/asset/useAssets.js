import { useState, useEffect } from "react";
import { subscribeToAssets } from "../../services/asset";

export function useAssets(role, currentUser) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const unsubscribe = subscribeToAssets(
      role,
      currentUser.uid,
      (assets) => {
        setAssets(assets);
        console.log("Assets updated:", assets);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [role, currentUser]);

  return { assets, loading, error };
}
