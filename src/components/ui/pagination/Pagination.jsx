import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Pagination.css";

function Pagination({
  rangeStart,
  rangeEnd,
  total,
  page,
  totalPages,
  onPrev,
  onNext,
  isFirstPage,
  isLastPage,
  itemLabel = "items",
}) {
  return (
    <div className="panel-pagination">
      <span className="panel-pagination-info">
        Showing {rangeStart}–{rangeEnd} of {total} {itemLabel}
      </span>
      <div className="panel-pagination-controls">
        <button
          className="panel-page-btn"
          onClick={onPrev}
          disabled={isFirstPage}
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
        </button>
        <span className="panel-page-indicator">
          {page} / {totalPages}
        </span>
        <button
          className="panel-page-btn"
          onClick={onNext}
          disabled={isLastPage}
          aria-label="Next page"
        >
          <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
