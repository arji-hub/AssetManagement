import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ROLES from "../../../data/roles";
import { useAssetData } from "./useAssetData";
import { useAssetSelectionState } from "./useAssetSelectionState";
import { useTransferSubmit } from "./useTransferSubmit";
import { fetchCustodians } from "../../../services/user";

/**
 * Transfer flow for the "localMR" variant — the Local MR button on
 * Transfer.jsx. Full-time custodians assign assets out to (or reclaim
 * assets from) their part-time Local MRs.
 *
 * ⚠️ Field names below (asset.description, asset.room_id,
 * asset.property_custodian, custodian.fullname) are best-guess based on
 * the existing hooks/services — verify against your actual Firestore
 * schema and adjust.
 */
export function useLocalMRTransfer() {
  const variant = "localMR";
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isFulltime = user?.role === ROLES.FULLTIME;
  const isParttime = user?.role === ROLES.PARTTIME;

  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [ownerFilter, setOwnerFilter] = useState("all");

  const [fromCustodian, setFromCustodian] = useState(null);
  const [toCustodian, setToCustodian] = useState(null);
  const [notes, setNotes] = useState("");

  // If user is a custodian (parttime or fulltime), set fromCustodian to their own record
  useEffect(() => {
    if (isAdmin) return;

    const loadFromCustodian = async () => {
      try {
        const custodians = await fetchCustodians();
        const custodian = custodians.find((c) => c.id === user.uid);
        setFromCustodian(custodian ?? null);
      } catch (error) {
        console.error("Failed to fetch custodian:", error);
        setFromCustodian(null);
      }
    };

    loadFromCustodian();
  }, [isAdmin, user]);

  const {
    assets,
    assetsLoading,
    rooms,
    categories,
    custodians: localMRs,
    custodianList: ownerFilterList,
    error,
  } = useAssetData({ user: fromCustodian, isAdmin, variant });

  //if  user=Fulltime set custodianList to localMRs
  // Fulltime users pick a destination from `localMRs` (part-timers);
  // parttime users use the hook's own owner-filter list (fulltimers).

  const custodianList = useMemo(() => {
    if (isAdmin || isParttime) return ownerFilterList;

    // Only show localMRs whose id exists in assets' local_mr
    const localMrIds = new Set(assets.map((asset) => asset.local_mr));

    return localMRs.filter((custodian) => localMrIds.has(custodian.id));
  }, [isAdmin, isParttime, ownerFilterList, assets, localMRs]);

  // Set ownerFilter based on user type: parttime -> first custodian, fulltime -> first asset's local_mr
  useEffect(() => {
    if (isAdmin) return;

    if (isParttime) {
      const ownerValue =
        assets.find((a) => a.local_mr != null)?.local_mr ?? null;
      setOwnerFilter(ownerValue);
    } else if (isFulltime) {
      setOwnerFilter(custodianList[0]?.id ?? null);
    }
  }, [isAdmin, isParttime, isFulltime, assets, custodianList]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (variant == "localMR" && user.role == ROLES.FULLTIME) {
        const haveLocalMR = a.local_mr == ownerFilter;
        if (!haveLocalMR) return false;
      }

      const ownedByChosenSource = fromCustodian
        ? a.property_custodian === fromCustodian.id ||
          a.local_mr === fromCustodian.id
        : !a.property_custodian;
      if (!ownedByChosenSource) return false;

      // Part-time user: further narrow to one full-time owner via the
      // header-source filter (ownedByChosenSource above already
      // guarantees local_mr === fromCustodian.id).
      if (
        isParttime &&
        ownerFilter !== "all" &&
        a.property_custodian !== ownerFilter
      )
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
  }, [
    assets,
    fromCustodian,
    isParttime,
    ownerFilter,
    roomFilter,
    categoryFilter,
    search,
  ]);

  const {
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
    setSelectedIds,
  } = useAssetSelectionState({ assets, filteredAssets });

  const selectSource = useCallback((custodian) => {
    setFromCustodian(custodian);
    setToCustodian(null);
  }, []);

  const selectDestination = useCallback((custodian) => {
    setToCustodian(custodian);
  }, []);

  useEffect(() => {
    if (isAdmin || isFulltime) return;
    setToCustodian(null);
  }, [isAdmin, isFulltime]);

  //if change property custodian then reset selectedIds
  useEffect(() => {
    setSelectedIds(new Set());
  }, [ownerFilter, fromCustodian]);

  useEffect(() => {
    const owner = custodianList.find((c) => c.id === ownerFilter);
    setToCustodian(owner ?? null);
  }, [isParttime, ownerFilter, custodianList]);

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
    targetRoom: null,
    fromCustodian,
    toCustodian,
    notes,
    user,
    navigate,
  });

  return {
    isAdmin,
    isFulltime,
    isParttime,
    custodianList,
    ownerFilter,
    setOwnerFilter,
    assets: filteredAssets,
    assetsLoading,
    rooms,
    categories,
    custodians: localMRs,
    search,
    setSearch,
    roomFilter,
    setRoomFilter,
    categoryFilter,
    setCategoryFilter,
    // Doesn't apply to this variant (room-move only) — inert stub.
    custodianFilter: "all",
    setCustodianFilter: () => {},
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
    fromCustodian,
    selectSource,
    toCustodian,
    selectDestination,
    targetRoom: null,
    setTargetRoom: () => {},
    notes,
    setNotes,
    submitting,
    error,
    submitError,
    submitSuccess,
    status,
    dismissSubmitError,
    canSubmit,
    handleConfirm,
    handleDone,
  };
}
