// src/hooks/asset/useAssetFilters.js
import { useState, useEffect, useMemo } from "react";
import { fetchCustodians } from "../../services/user";
import { fetchRooms } from "../../services/room";
import { fetchCategories } from "../../services/category";
import { toLowerCase } from "../../utils/TextCasing";
import { UNALLOCATED_ROOM, UNASSIGNED_CUSTODIAN } from "../../data/assets";

const INITIAL_FILTERS = {
  status: "",
  category: "",
  room: "",
  custodian: "",
};

const SEARCHABLE_FIELDS = ["id", "description", "serial_number"];

export function useAssetFilters(assets = []) {
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [search, setSearch] = useState("");

  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [custodians, setCustodians] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [fetchedRooms, fetchedCategories, fetchedCustodians] =
          await Promise.all([
            fetchRooms(),
            fetchCategories(),
            fetchCustodians(),
          ]);
        setRooms(fetchedRooms.map((r) => (typeof r === "string" ? r : r.name)));
        setCategories(
          fetchedCategories.map((c) => (typeof c === "string" ? c : c.name)),
        );
        setCustodians(
          fetchedCustodians.map((c) =>
            typeof c === "string" ? c : c.fullname,
          ),
        );
      } catch (err) {
        console.error("Failed to load filter options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

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
    const query = toLowerCase(search.trim());

    return assets.filter((asset) => {
      //status if condemn
      if (!filters.status && asset.status === "Condemned") return false;

      //status
      if (filters.status && asset.status !== filters.status) return false;

      //category
      if (filters.category && asset.category_id !== filters.category)
        return false;

      //room
      if (filters.room === UNALLOCATED_ROOM) {
        if (asset.room_id) return false;
      } else if (filters.room && asset.room_id !== toLowerCase(filters.room)) {
        return false;
      }

      //custodian
      if (filters.custodian === UNASSIGNED_CUSTODIAN) {
        if (asset.property_custodian) return false;
      } else if (
        filters.custodian &&
        asset.property_custodian_fullname !== filters.custodian
      ) {
        return false;
      }

      //search
      if (query) {
        const matches = SEARCHABLE_FIELDS.some((field) =>
          toLowerCase(asset[field] ?? "").includes(query),
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [assets, filters, search]);

  return {
    showFilter,
    setShowFilter,
    setFilters,
    filters,
    search,
    setSearch,
    activeFilterCount,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
    rooms,
    categories,
    custodians,
    loadingOptions,
  };
}
