import { useEffect, useState } from "react";
import { subscribeToCategories } from "../../services/category";

/**
 * Lightweight, read-only hook for populating category <select> inputs
 * (asset registration, filters, etc.) from the live "category"
 * collection instead of the old static ASSET_CATEGORIES array.
 * Not for the Settings > System Config admin CRUD — see useCategories.
 */
const isOthers = (name) => name?.trim().toLowerCase() === "others";

function useCategoryOptions() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (data) => {
        const options = data
          .map((c) => ({ id: c.id, name: c.name }))
          .sort((a, b) => {
            if (isOthers(a.name)) return -1;
            if (isOthers(b.name)) return 1;
            return a.name.localeCompare(b.name);
          });
        setCategories(options);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load categories.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
}

export default useCategoryOptions;
