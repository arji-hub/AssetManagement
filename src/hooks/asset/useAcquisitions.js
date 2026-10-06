import { useState, useEffect, useMemo } from "react";
import { subscribeToAcquisitions } from "../../services/asset";
import { ROLES } from "../../data/roles";

export function useAcquisitions(role) {
  const [acquisitions, setAcquisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (role !== ROLES.ADMIN) return;
    setLoading(true);

    const unsubscribe = subscribeToAcquisitions(
      role,
      (data) => {
        setAcquisitions(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [role]);

  const filteredAcquisitions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return acquisitions;
    return acquisitions.filter((a) =>
      [a.id, a.acquisition_type, a.source]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [acquisitions, search]);

  return { filteredAcquisitions, loading, error, search, setSearch };
}
