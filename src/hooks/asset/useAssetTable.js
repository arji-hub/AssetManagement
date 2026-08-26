import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useResponsivePageSize from "../shared/useResponsivePageSize";

/**
 * Encapsulates all AssetTable behavior: pagination, page-size responsiveness,
 * and row-action navigation. AssetTable.jsx should contain zero logic beyond
 * rendering what this hook returns.
 *
 * @param {Object} params
 * @param {Array} params.data - filtered assets (pre-pagination)
 * @param {Array} params.columns
 * @param {(asset) => void} [params.onRowAction]
 * @param {number} [params.desktopPageSize=20]
 * @param {number} [params.mobilePageSize=10]
 */
export default function useAssetTable({
  data,
  columns,
  onRowAction,
  desktopPageSize = 20,
  mobilePageSize = 10,
}) {
  const navigate = useNavigate();
  const pageSize = useResponsivePageSize(desktopPageSize, mobilePageSize);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  // Reset to page 1 when the data set or page size changes.
  useEffect(() => {
    setPage(1);
  }, [data.length, pageSize]);

  // Clamp page if it exceeds totalPages (e.g. data shrank).
  useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goToPage = useCallback(
    (p) =>
      setPage((current) => Math.min(Math.max(1, p), totalPages) || current),
    [totalPages],
  );

  const nextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const prevPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

  const handleRowAction = useCallback(
    (asset) => {
      if (onRowAction) return onRowAction(asset);
      navigate(`/asset/${asset.id}`);
    },
    [onRowAction, navigate],
  );

  const colSpan = columns.length + 1;

  const rangeStart = data.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, data.length);

  return {
    pagedData,
    page,
    totalPages,
    pageSize,
    colSpan,
    rangeStart,
    rangeEnd,
    total: data.length,
    goToPage,
    nextPage,
    prevPage,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
    handleRowAction,
    // absolute index helper so "#" columns count correctly across pages
    getAbsoluteIndex: (pageLocalIndex) =>
      (page - 1) * pageSize + pageLocalIndex,
  };
}
