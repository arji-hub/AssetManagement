import React from "react";
import PropTypes from "prop-types";
import "./CustodianTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCustodianGrid from "../../hooks/custodian/useCustodianGrid";
import CustodianCard from "../ui/card/CustodianCard";

function CustodianTable({
  custodians,
  loading,
  error,
  emptyMessage = "No custodians found.",
  desktopPageSize = 12,
  mobilePageSize = 6,
  onRowAction,
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
  } = useCustodianGrid({
    data: custodians,
    desktopPageSize,
    mobilePageSize,
  });

  const showPagination = !loading && !error && custodians.length > 0;

  const renderEmptyState = (icon, message) => (
    <div className="custodian-table-empty">
      <FontAwesomeIcon icon={icon} spin={icon === "fa-solid fa-spinner"} />
      <p>{message}</p>
    </div>
  );

  return (
    <div className="custodian-table-container">
      <div className="custodian-table">
        {loading
          ? renderEmptyState("fa-solid fa-spinner", "Loading custodians…")
          : error
            ? renderEmptyState(
                "fa-solid fa-triangle-exclamation",
                typeof error === "string"
                  ? error
                  : "Failed to load custodians.",
              )
            : custodians.length === 0
              ? renderEmptyState("fa-solid fa-box-open", emptyMessage)
              : pagedData.map((custodian) => (
                  <CustodianCard
                    key={custodian.username}
                    custodian={custodian}
                    onClick={onRowAction}
                  />
                ))}
      </div>

      {showPagination && (
        <div className="custodian-pagination">
          <span className="custodian-pagination-info">
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          <div className="custodian-pagination-controls">
            <button
              className="custodian-page-btn"
              onClick={prevPage}
              disabled={isFirstPage}
              aria-label="Previous page"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-left" />
            </button>
            <span className="custodian-page-indicator">
              {page} / {totalPages}
            </span>
            <button
              className="custodian-page-btn"
              onClick={nextPage}
              disabled={isLastPage}
              aria-label="Next page"
            >
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

CustodianTable.propTypes = {
  custodians: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      fullname: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      asset_count: PropTypes.number,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  emptyMessage: PropTypes.string,
  desktopPageSize: PropTypes.number,
  mobilePageSize: PropTypes.number,
  onRowAction: PropTypes.func,
};

export default CustodianTable;
