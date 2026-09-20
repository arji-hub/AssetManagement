import { useEffect, useMemo, useState } from "react";
import { subscribeToAssets } from "../../../services/asset";
import {
  subscribeToAssetsByCustodian,
  fetchCustodians,
} from "../../../services/user";
import { subscribeToRooms } from "../../../services/room";
import { subscribeToCategories } from "../../../services/category";
import ROLES from "../../../data/roles";

/**
 * Data layer for TransferOverview: the live asset subscription, the
 * room/category chrome (admins only), and the custodian directory.
 *
 * Nothing here is variant-specific beyond which asset subscription to use
 * and which custodian role the picker lists get filtered down to.
 */

export const UNALLOCATED_ROOM_ID = "unallocated";

export const matchesRoomFilter = (asset, roomFilter) => {
  if (roomFilter === "all") return true;
  if (roomFilter === UNALLOCATED_ROOM_ID) return !asset.room_id;
  return asset.room_id === roomFilter;
};

export function useAssetData({ user, variant, isRoom = false }) {
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [allRooms, setAllRooms] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [error, setError] = useState(null);

  // ── Asset pool: same live-subscription pattern as the dashboard hooks ──
  useEffect(() => {
    setAssetsLoading(true);

    const onData = (data) => {
      setAssets(data);
      setAssetsLoading(false);
    };

    const onErr = (err) => {
      setError(err.message);
      setAssetsLoading(false);
    };

    const unsubscribe = isRoom
      ? subscribeToAssets(ROLES.ADMIN, user?.id, onData, onErr)
      : subscribeToAssetsByCustodian(user?.id ?? null, onData, onErr);

    return unsubscribe;
  }, [user?.id, isRoom]);

  useEffect(() => {
    const unsubRooms = subscribeToRooms(setAllRooms, (err) =>
      setError(err.message),
    );
    const unsubCategories = subscribeToCategories(setAllCategories, (err) =>
      setError(err.message),
    );
    return () => {
      unsubRooms();
      unsubCategories();
    };
  }, []);

  // ── Narrow rooms/categories down to only the ones actually in use —
  //    i.e. some asset in the current pool references that room_id /
  //    category_id. Keeps the filter dropdowns from listing rooms or
  //    categories with nothing to filter to. ──

  const usedRoomIds = useMemo(
    () => new Set(assets.map((a) => a.room_id).filter(Boolean)),
    [assets],
  );

  const hasUnallocated = useMemo(
    () => assets.some((a) => !a.room_id),
    [assets],
  );
  console.log(assets);

  const usedCategoryIds = useMemo(
    () => new Set(assets.map((a) => a.category_id).filter(Boolean)),
    [assets],
  );

  const rooms = useMemo(() => {
    const used = allRooms.filter((r) => usedRoomIds.has(r.id));
    return hasUnallocated
      ? [{ id: UNALLOCATED_ROOM_ID, name: "Unallocated" }, ...used]
      : used;
  }, [allRooms, usedRoomIds, hasUnallocated]);
  console.log(hasUnallocated);
  console.log(rooms);

  const categories = useMemo(
    () => allCategories.filter((c) => usedCategoryIds.has(c.id)),
    [allCategories, usedCategoryIds],
  );

  const [allCustodians, setAllCustodians] = useState([]);

  useEffect(() => {
    fetchCustodians()
      .then(setAllCustodians)
      .catch((err) => setError(err.message));
  }, []);

  // Which pool of custodians is relevant depends on the variant:
  // "custodian" pairs full-time custodians with each other, "localMR"
  // pairs part-time (Local MR) custodians, and "room" doesn't involve a
  // from/to custodian pair at all so it falls back to full-time for the
  // asset-list filter.
  const custodianRole = variant === "localMR" ? "parttime" : "fulltime";

  const custodians = useMemo(
    () => allCustodians.filter((c) => c.role === custodianRole),
    [allCustodians, custodianRole],
  );

  // localMR, part-time user only: lets them narrow their own asset list
  // down to the assets owned by one specific full-time custodian, via
  // the transfer-overview-header-source filter. This is a pure asset
  // filter — it never touches fromCustodian/toCustodian, which stay
  // locked to "self" / whatever partTimeReturnTarget resolves.

  const custodianList = useMemo(() => {
    return allCustodians.filter((c) => {
      if (c.role !== ROLES.FULLTIME) return false;

      if (variant === "localMR") {
        return assets.some((asset) => asset.property_custodian === c.id);
      }

      return true;
    });
  }, [allCustodians, assets, variant]);

  return {
    assets,
    assetsLoading,
    rooms,
    categories,
    custodians,
    custodianList,
    error,
    setError,
  };
}
