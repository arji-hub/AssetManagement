import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ReportLogPagination.css";

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const delta = 1;

  const rangeStart = Math.max(2, currentPage - delta);
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);
  if (rangeStart > 2) pages.push("ellipsis-start");

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < totalPages - 1) pages.push("ellipsis-end");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function ReportLogPagination({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onGoToPage,
}) {
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="report-log-pagination">
      <button
        className="report-log-pagination-btn"
        type="button"
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
      </button>

      <div className="report-log-pagination-numbers">
        {pages.map((page, index) =>
          typeof page === "number" ? (
            <button
              key={page}
              type="button"
              className={`report-log-pagination-page ${
                page === currentPage ? "report-log-pagination-page-active" : ""
              }`}
              onClick={() => onGoToPage(page)}
            >
              {page}
            </button>
          ) : (
            <span
              key={`${page}-${index}`}
              className="report-log-pagination-ellipsis"
            >
              …
            </span>
          ),
        )}
      </div>

      <button
        className="report-log-pagination-btn"
        type="button"
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
      </button>
    </div>
  );
}

export default ReportLogPagination;
