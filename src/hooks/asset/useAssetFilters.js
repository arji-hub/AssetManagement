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

        const usedRoomIds = new Set(
          assets.map((a) => a.room_id).filter(Boolean),
        );
        const usedCategoryIds = new Set(
          assets.map((a) => a.category_id).filter(Boolean),
        );
        const usedCustodianNames = new Set(
          assets.map((a) => a.property_custodian_fullname).filter(Boolean),
        );
        const hasUnallocatedRoom = assets.some((a) => !a.room_id);
        const hasUnassignedCustodian = assets.some(
          (a) => !a.property_custodian,
        );

        const mappedRooms = fetchedRooms
          .map((r) =>
            typeof r === "string"
              ? { id: r, name: r }
              : { id: r.id, name: r.name },
          )
          .filter((r) => usedRoomIds.has(r.id));

        setRooms(
          hasUnallocatedRoom
            ? [{ id: UNALLOCATED_ROOM, name: "Unallocated" }, ...mappedRooms]
            : mappedRooms,
        );

        setCategories(
          fetchedCategories
            .map((r) =>
              typeof r === "string"
                ? { id: r, name: r }
                : { id: r.id, name: r.name },
            )
            .filter((c) => usedCategoryIds.has(c.id)),
        );

        const mappedCustodians = fetchedCustodians
          .map((c) => (typeof c === "string" ? c : c.fullname))
          .filter((name) => usedCustodianNames.has(name));

        setCustodians(
          hasUnassignedCustodian
            ? [UNASSIGNED_CUSTODIAN, ...mappedCustodians]
            : mappedCustodians,
        );
      } catch (err) {
        console.error("Failed to load filter options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [assets]);

  console.log(custodians);
  console.log(rooms);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  //Resolve each active filter's stored value (often an id) to a display label
  const getFilterLabel = (key, value) => {
    if (key === "room") {
      if (value === UNALLOCATED_ROOM) return "Unallocated";
      return rooms.find((r) => r.id === value)?.name ?? value;
    }
    if (key === "category") {
      return categories.find((c) => c.id === value)?.name ?? value;
    }
    if (key === "custodian") {
      if (value === UNASSIGNED_CUSTODIAN) return "Unassigned";
      return value;
    }
    return value;
  };

  //Ready-to-render list of active filters, id resolved to name
  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, val]) => Boolean(val))
        .map(([key, val]) => ({
          key,
          value: val,
          label: getFilterLabel(key, val),
        })),
    [filters, rooms, custodians],
  );

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilter(false);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowFilter(false);
  };

  const handleRemoveFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
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
      } else if (filters.room && asset.room_id !== filters.room) {
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
    activeFilters,
    handleRemoveFilter,
    filteredAssets,
    handleApplyFilters,
    handleClearFilters,
    rooms,
    categories,
    custodians,
    loadingOptions,
  };
}
