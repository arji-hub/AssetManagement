import { useState, useMemo } from "react";

const INITIAL_FILTERS = { status: "", category: "", room: "", custodian: "" };

export function useAssetFilters(assets = []) {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowFilter(false);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (filters.status && asset.status !== filters.status) return false;
      if (filters.category && asset.category_id !== filters.category) return false;
      if (filters.room && asset.room_id !== filters.room) return false;
      if (filters.custodian && asset.property_custodian_name !== filters.custodian) return false;
      return true;
    });
  }, [assets, filters]);

  return {
    showFilter,
    setShowFilter,
    filters,
    setFilters,
    activeFilterCount,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
  };
}