import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ROLES from "../../../data/roles";
import { useAssetData } from "./useAssetData";
import { useAssetSelectionState } from "./useAssetSelectionState";
import { useTransferSubmit } from "./useTransferSubmit";
import { fetchCustodians } from "../../../services/user";

/**
 * Transfer flow for the "custodian" variant — the Transfer Asset button
 * on Transfer.jsx. One custodian hands assets to another (or to/from
 * "Unassigned"), going through the normal ack/approve flow.
 *
 * ⚠️ Field names below (asset.description, asset.room_id,
 * asset.property_custodian, custodian.fullname) are best-guess based on
 * the existing hooks/services — verify against your actual Firestore
 * schema and adjust.
 */
export function useCustodianTransfer() {
  const variant = "custodian";
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isFulltime = user?.role === ROLES.FULLTIME;
  const isParttime = user?.role === ROLES.PARTTIME;

  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Custodian === null is "Unassigned"
  // Custodian === undefined means "nothing picked yet"
  const [fromCustodian, setFromCustodian] = useState(undefined);
  const [toCustodian, setToCustodian] = useState(undefined);

  //if user not admin set the fromCustodian to user
  useEffect(() => {
    const loadFromCustodian = async () => {
      if (isAdmin) return;

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
    custodians,
    custodianList,
    error,
  } = useAssetData({ user: fromCustodian, variant });

  const [notes, setNotes] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const ownedByChosenSource = fromCustodian
        ? a.property_custodian === fromCustodian.id ||
          a.local_mr === fromCustodian.id
        : !a.property_custodian;
      if (!ownedByChosenSource) return false;

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
  }, [assets, fromCustodian, roomFilter, categoryFilter, search]);

  const {
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
  } = useAssetSelectionState({ assets, filteredAssets });

  // Step 1 — lock the asset list to one source custodian (or
  // "Unassigned"). Passing null means "Unassigned" was chosen
  // deliberately, not "nothing chosen yet"
  const selectSource = useCallback((custodian) => {
    setFromCustodian(custodian);
  }, []);

  // Destination picker: custodian === null means "Unassigned" was
  // deliberately chosen — a removal, not an incomplete selection. That
  // null flows straight through to addTransferRequest's `to`, so
  // resolveTransferType sees `to` as falsy and files the request as a
  // REMOVE instead of a TRANSFER.
  const selectDestination = useCallback((custodian) => {
    setToCustodian(custodian);
  }, []);

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
    // Owner-filter and room-target/custodian-filter fields don't apply
    // to this variant (see TransferOverview.jsx's render conditions) —
    // returned as inert stubs so the component needs no changes.
    ownerFilter: "all",
    setOwnerFilter: () => {},
    assets: filteredAssets,
    assetsLoading,
    rooms,
    categories,
    custodians,
    search,
    setSearch,
    roomFilter,
    setRoomFilter,
    categoryFilter,
    setCategoryFilter,
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
    setToCustodian,
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
