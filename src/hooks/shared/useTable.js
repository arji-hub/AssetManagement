import usePagination from "./usePagination";

const gridTemplate = (columns, filterFn) =>
  columns
    .filter(filterFn)
    .map((c) => c.width || "1fr")
    .join(" ");

export default function useTable({
  columns,
  items,
  loading,
  error,
  emptyMessage = "No items found.",
  emptyIcon = "fa-solid fa-box-open",
  desktopPageSize = 12,
  mobilePageSize = 6,
}) {
  const {
    pagedData,
    page,
    totalPages,
    rangeStart,
    rangeEnd,
    total,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
  } = usePagination({ data: items, desktopPageSize, mobilePageSize });

  const gridStyle = columns && {
    "--table-grid-columns": gridTemplate(columns, () => true),
    "--table-grid-columns-tablet": gridTemplate(
      columns,
      (c) => c.priority !== "low",
    ),
    "--table-grid-columns-mobile": gridTemplate(
      columns,
      (c) => (c.priority || "high") === "high",
    ),
  };

  const showPagination = !loading && !error && items.length > 0;

  let emptyState = null;
  if (loading) {
    emptyState = {
      icon: "fa-solid fa-spinner",
      message: "Loading…",
      spin: true,
    };
  } else if (error) {
    emptyState = {
      icon: "fa-solid fa-triangle-exclamation",
      message: typeof error === "string" ? error : "Failed to load data.",
      spin: false,
    };
  } else if (items.length === 0) {
    emptyState = { icon: emptyIcon, message: emptyMessage, spin: false };
  }

  return {
    gridStyle,
    pagedData,
    emptyState,
    showPagination,
    pagination: {
      rangeStart,
      rangeEnd,
      total,
      page,
      totalPages,
      onPrev: prevPage,
      onNext: nextPage,
      isFirstPage,
      isLastPage,
    },
  };
}
