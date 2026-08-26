import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import usePagination from "../../hooks/shared/usePagination";
import Pagination from "../ui/pagination/Pagination";
import "./Table.css";

function Table({
  items,
  renderItem,
  loading,
  error,
  emptyMessage = "No items found.",
  emptyIcon = "fa-solid fa-box-open",
  desktopPageSize = 12,
  mobilePageSize = 6,
  itemLabel = "items",
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

  const showPagination = !loading && !error && items.length > 0;

  const renderEmptyState = (icon, message) => (
    <div className="panel-empty">
      <FontAwesomeIcon icon={icon} spin={icon === "fa-solid fa-spinner"} />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="panel-container">
      <div className="panel-grid">
        {loading
          ? renderEmptyState("fa-solid fa-spinner", "Loading…")
          : error
            ? renderEmptyState(
                "fa-solid fa-triangle-exclamation",
                typeof error === "string" ? error : "Failed to load data.",
              )
            : items.length === 0
              ? renderEmptyState(emptyIcon, emptyMessage)
              : pagedData.map(renderItem)}
      </div>

      {showPagination && (
        <Pagination
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          total={total}
          page={page}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
          isFirstPage={isFirstPage}
          isLastPage={isLastPage}
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
}

export default Table;
