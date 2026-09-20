import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAssetsQR } from "../../services/qr";
import { fetchCustodians } from "../../services/user";
import { ROLES } from "../../data/roles";
import { downloadQRZip } from "../../utils/qrExport";

const PAGE_SIZE = 8;

function uniqueOptions(assets, idKey, nameKey) {
  const map = new Map();
  assets.forEach((a) => {
    if (a[idKey] && !map.has(a[idKey])) {
      map.set(a[idKey], { id: a[idKey], name: a[nameKey] || a[idKey] });
    }
  });
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * State + actions for the "Generate & Print QR" mode of the QR page.
 * (The scanner mode keeps using useQRScanner.)
 */
export function useQR() {
  const { user } = useAuth();
  // Adjust if your AuthContext exposes these differently.
  const role = user?.role;
  const uid = user?.uid;
  const isAdmin = role === ROLES.ADMIN;

  /* ── data ── */
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssets = useCallback(async () => {
    if (!role || !uid) return;
    setAssetsLoading(true);
    setError("");
    try {
      setAssets(await fetchAssetsQR(role, uid));
    } catch (err) {
      console.error("[useQR] Failed to load assets:", err);
      setError(err.message || "Failed to load assets.");
    } finally {
      setAssetsLoading(false);
    }
  }, [role, uid]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  /* ── custodians (admin only — powers the Custodian filter) ── */
  const [custodians, setCustodians] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    fetchCustodians()
      .then((list) => {
        if (cancelled) return;
        setCustodians(
          list
            .filter((c) => c.asset_count > 0)
            .sort((a, b) => a.fullname.localeCompare(b.fullname)),
        );
      })
      .catch((err) => {
        // the filter just stays empty — don't block the page over it
        console.error("[useQR] Failed to load custodians:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  /* ── filters ── */
  const [search, setSearchState] = useState("");
  const [roomFilter, setRoomFilterState] = useState("all");
  const [categoryFilter, setCategoryFilterState] = useState("all");
  const [custodianFilter, setCustodianFilterState] = useState("all");
  const [page, setPage] = useState(1);

  // every filter change jumps back to page 1
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };
  const setSearch = withPageReset(setSearchState);
  const setRoomFilter = withPageReset(setRoomFilterState);
  const setCategoryFilter = withPageReset(setCategoryFilterState);
  const setCustodianFilter = withPageReset(setCustodianFilterState);

  const hasActiveFilters =
    search.trim() !== "" ||
    roomFilter !== "all" ||
    categoryFilter !== "all" ||
    custodianFilter !== "all";

  const resetFilters = () => {
    setSearchState("");
    setRoomFilterState("all");
    setCategoryFilterState("all");
    setCustodianFilterState("all");
    setPage(1);
  };

  const rooms = useMemo(
    () => uniqueOptions(assets, "room_id", "room_name"),
    [assets],
  );
  const categories = useMemo(
    () => uniqueOptions(assets, "category_id", "category_name"),
    [assets],
  );

  const filteredAssets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return assets.filter((a) => {
      if (roomFilter === "unallocated") {
        if (a.room_id) return false;
      } else if (roomFilter !== "all" && a.room_id !== roomFilter) {
        return false;
      }
      if (categoryFilter !== "all" && a.category_id !== categoryFilter) {
        return false;
      }

      // custodian filter is admin-only; an asset belongs to a custodian
      // as either its property custodian or its local MR
      if (isAdmin && custodianFilter !== "all") {
        if (custodianFilter === "unassigned") {
          if (a.property_custodian || a.local_mr) return false;
        } else if (
          a.property_custodian !== custodianFilter &&
          a.local_mr !== custodianFilter
        ) {
          return false;
        }
      }

      if (!term) return true;

      return [a.id, a.description, a.serial_number].some(
        (v) => v && String(v).toLowerCase().includes(term),
      );
    });
  }, [assets, search, roomFilter, categoryFilter, custodianFilter, isAdmin]);

  /* ── pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAssets = useMemo(
    () =>
      filteredAssets.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredAssets, currentPage],
  );
  const pageStart = filteredAssets.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredAssets.length);

  /* ── selection (persists across pages + filter changes) ── */
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const toggleAsset = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // assets whose QR hasn't been generated yet can't be selected
  const selectableAssets = useMemo(
    () => filteredAssets.filter((a) => a.has_qr),
    [filteredAssets],
  );

  const allVisibleSelected =
    selectableAssets.length > 0 &&
    selectableAssets.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        selectableAssets.forEach((a) => next.delete(a.id));
      } else {
        selectableAssets.forEach((a) => next.add(a.id));
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedAssets = useMemo(
    () => assets.filter((a) => selectedIds.has(a.id)),
    [assets, selectedIds],
  );

  /* ── sticker sheet size (drives QRSheetPDF) ── */
  const [sheetSize, setSheetSize] = useState("small");

  /* ── ZIP export (print + PDF go through PDFPreviewModal) ── */
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ done: 0, total: 0 });
  const [exportError, setExportError] = useState("");
  const [notice, setNotice] = useState(null); // { type: "success" | "warning", message }

  const canExport = selectedAssets.length > 0 && !exporting;

  const handleDownloadZIP = async () => {
    if (!canExport) return;

    const count = selectedAssets.length;

    setExporting(true);
    setExportError("");
    setNotice(null);
    setExportProgress({ done: 0, total: count });

    try {
      const { failed } = await downloadQRZip(selectedAssets, setExportProgress);

      if (failed.length) {
        setNotice({
          type: "warning",
          message: `${count - failed.length} of ${count} QR codes added to the ZIP. Couldn't load: ${failed.join(", ")}.`,
        });
      } else {
        setNotice({
          type: "success",
          message: `${count} QR code${count !== 1 ? "s" : ""} downloaded as ZIP.`,
        });
      }
    } catch (err) {
      console.error("[useQR] ZIP export failed:", err);
      setExportError(err.message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const dismissExportError = () => setExportError("");
  const dismissNotice = () => setNotice(null);

  return {
    // data
    assets,
    assetsLoading,
    error,
    refresh: loadAssets,

    // filters
    search,
    setSearch,
    roomFilter,
    setRoomFilter,
    categoryFilter,
    setCategoryFilter,
    isAdmin,
    custodians,
    custodianFilter,
    setCustodianFilter,
    rooms,
    categories,
    hasActiveFilters,
    resetFilters,
    filteredAssets,

    // pagination
    pagedAssets,
    currentPage,
    totalPages,
    setPage,
    pageStart,
    pageEnd,

    // selection
    selectedIds,
    selectedAssets,
    toggleAsset,
    allVisibleSelected,
    selectableCount: selectableAssets.length,
    toggleSelectAll,
    clearSelection,

    // sticker sheet
    sheetSize,
    setSheetSize,

    // ZIP export
    exporting,
    exportProgress,
    exportError,
    dismissExportError,
    notice,
    dismissNotice,
    canExport,
    handleDownloadZIP,
  };
}
