import { useState, useMemo } from "react";

const ITEMS_PER_PAGE = 10;

function useAuditRoomHistory({ sessions = [] }) {
  const [page, setPage] = useState(1);

  const { items, totalCount, totalPages } = useMemo(() => {
    const total = sessions.length;
    const totalPagesCalc = Math.ceil(total / ITEMS_PER_PAGE);
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedItems = sessions.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalCount: total,
      totalPages: totalPagesCalc,
    };
  }, [sessions, page]);

  const goPrev = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goNext = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  return {
    items,
    totalCount,
    page,
    totalPages,
    goPrev,
    goNext,
  };
}

export default useAuditRoomHistory;
