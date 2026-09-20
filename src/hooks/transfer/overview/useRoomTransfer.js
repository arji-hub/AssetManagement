import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ROLES from "../../../data/roles";
import { useAssetData } from "./useAssetData";
import { useAssetSelectionState } from "./useAssetSelectionState";
import { useTransferSubmit } from "./useTransferSubmit";
import { subscribeToRooms } from "../../../services/room";

/**
 * Transfer flow for the "room" variant — the Move Asset button on
 * TransferRoom.jsx. Not bound to a single custodian's acknowledgment, so
 * there's no From/To custodian step at all — just picking assets and a
 * destination room. Writes one transfer_room doc per asset (via
 * useTransferSubmit) instead of a batched transfer_request, and skips
 * the normal ack/approve flow entirely.
 *
 * ⚠️ Field names below (asset.description, asset.room_id,
 * asset.property_custodian) are best-guess based on the existing
 * hooks/services — verify against your actual Firestore schema.
 */
export function useRoomTransfer() {
  const variant = "room";
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isFulltime = user?.role === ROLES.FULLTIME;
  const isParttime = user?.role === ROLES.PARTTIME;

  const usesSourcePicker = false;

  const {
    assets,
    assetsLoading,
    rooms,
    categories,
    custodians,
    custodianList,
    error,
  } = useAssetData({ user, variant, isRoom: true });

  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  // Room-move variant only — custodian/localMR lock the owner via the
  // header source picker instead, so this is the room variant's
  // equivalent asset-list filter.
  const [custodianFilter, setCustodianFilter] = useState("all");
  const [targetRoom, setTargetRoom] = useState(undefined);
  const [allRooms, setAllRooms] = useState([]);
  const [roomsError, setRoomsError] = useState(null);

  useEffect(() => {
    const unsubRooms = subscribeToRooms(
      (list) =>
        setAllRooms((list ?? []).filter((r) => r.status !== "inactive")),
      (err) => setRoomsError(err.message),
    );
    return () => unsubRooms();
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (custodianFilter !== "all" && a.property_custodian !== custodianFilter)
        return false;
      if (roomFilter !== "all" && a.room_id !== roomFilter) return false;
      if (categoryFilter !== "all" && a.category_id !== categoryFilter)
        return false;
      if (
        search &&
        !`${a.description ?? ""} ${a.id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [assets, custodianFilter, roomFilter, categoryFilter, search]);

  const {
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
  } = useAssetSelectionState({ assets, filteredAssets });

  const {
    submitting,
    submitError,
    submitSuccess,
    status,
    dismissSubmitError,
    canSubmit,
    handleConfirm,
    handleDone,
  } = useTransferSubmit({
    variant,
    selectedAssets,
    targetRoom,
    fromCustodian: null,
    toCustodian: null,
    notes: "",
    user,
    navigate,
    toChosen: true,
  });

  return {
    isAdmin,
    isFulltime,
    isParttime,
    custodianList,
    // Doesn't apply to this variant (localMR-only) — inert stub.
    ownerFilter: "all",
    setOwnerFilter: () => {},
    assets: filteredAssets,
    assetsLoading,
    allRooms,
    rooms,
    categories,
    custodians,
    search,
    setSearch,
    roomFilter,
    setRoomFilter,
    categoryFilter,
    setCategoryFilter,
    custodianFilter,
    setCustodianFilter,
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
    usesSourcePicker,
    fromCustodian: null,
    selectSource: () => {},
    toCustodian: null,
    setToCustodian: () => {},
    toChosen: true,
    toOptions: [],
    selectDestination: () => {},
    targetRoom,
    setTargetRoom,
    notes: "",
    setNotes: () => {},
    submitting,
    error: error || roomsError,
    submitError,
    submitSuccess,
    status,
    dismissSubmitError,
    canSubmit,
    handleConfirm,
    handleDone,
  };
}
