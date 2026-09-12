import { useEffect, useState } from "react";
import { subscribeToCategories } from "../../services/category"; // adjust path to wherever category.js lives

/**
 * Lightweight, read-only hook for populating category <select> inputs
 * (asset registration, filters, etc.) from the live "category"
 * collection instead of the old static ASSET_CATEGORIES array.
 * Not for the Settings > System Config admin CRUD — see useCategories.
 */
function useCategoryOptions() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (data) => {
        const names = data
          .map((c) => c.name)
          .sort((a, b) => a.localeCompare(b));
        setCategories(names);
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
