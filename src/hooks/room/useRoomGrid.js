import { useState, useEffect, useMemo, useCallback } from "react";
import useResponsivePageSize from "../asset/useResponsivePageSize";

export default function useRoomGrid({
  data,
  desktopPageSize = 12,
  mobilePageSize = 6,
}) {
  const pageSize = useResponsivePageSize(desktopPageSize, mobilePageSize);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [data.length, pageSize]);

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

  const rangeStart = data.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, data.length);

  return {
    pagedData,
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    total: data.length,
    nextPage,
    prevPage,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
  };
}
