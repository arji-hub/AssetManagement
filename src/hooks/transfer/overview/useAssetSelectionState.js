import { useCallback, useMemo, useState } from "react";

/**
 * Checkbox-selection mechanics shared by all three transfer variants:
 * which asset ids are selected, toggling one/all (scoped to whatever's
 * currently visible under the active filters), and deriving the
 * selected Asset objects from the full asset list.
 */
export function useAssetSelectionState({ assets, filteredAssets }) {
  const [selectedIds, setSelectedIds] = useState(new Set());

  const toggleAsset = useCallback((assetId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  }, []);

  const allVisibleSelected =
    filteredAssets.length > 0 &&
    filteredAssets.every((a) => selectedIds.has(a.id));

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = filteredAssets.every((a) => next.has(a.id));
      filteredAssets.forEach((a) => {
        if (allSelected) next.delete(a.id);
        else next.add(a.id);
      });
      return next;
    });
  }, [filteredAssets]);

  const selectedAssets = useMemo(
    () => assets.filter((a) => selectedIds.has(a.id)),
    [assets, selectedIds],
  );

  return {
    selectedIds,
    setSelectedIds,
    toggleAsset,
    allVisibleSelected,
    toggleSelectAll,
    selectedAssets,
  };
}
