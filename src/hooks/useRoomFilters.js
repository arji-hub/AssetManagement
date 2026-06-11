import { useState, useMemo } from "react";

export function useRoomFilters(rooms) {
  const [searchQuery, setSearchQuery] = useState("");
  const [assetCountFilter, setAssetCountFilter] = useState("");

  const filteredRooms = useMemo(() => {
    return rooms
      .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((r) => {
        if (assetCountFilter === "none") return r.assetCount === 0;
        if (assetCountFilter === "low")
          return r.assetCount >= 1 && r.assetCount <= 10;
        if (assetCountFilter === "medium")
          return r.assetCount >= 11 && r.assetCount <= 50;
        if (assetCountFilter === "high") return r.assetCount > 50;
        return true;
      });
  }, [rooms, searchQuery, assetCountFilter]);

  return {
    searchQuery,
    setSearchQuery,
    assetCountFilter,
    setAssetCountFilter,
    filteredRooms,
  };
}