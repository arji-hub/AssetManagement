import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTable from "../../hooks/shared/useTable";
import Pagination from "../ui/pagination/Pagination";
import "./Table.css";

function Table({
  columns,
  items,
  renderItem,
  loading,
  error,
  emptyMessage = "No items found.",
  emptyIcon = "fa-solid fa-box-open",
  desktopPageSize = 12,
  mobilePageSize = 6,
  itemLabel = "items",
  hideHeaderOnMobile = false,
}) {
  const { gridStyle, pagedData, emptyState, showPagination, pagination } =
    useTable({
      columns,
      items,
      loading,
      error,
      emptyMessage,
      emptyIcon,
      desktopPageSize,
      mobilePageSize,
    });

  return (
    <div className="panel-container" style={gridStyle}>
      {columns && (
        <div
          className={`panel-header${hideHeaderOnMobile ? " panel-header--hide-mobile" : ""}`}
        >
          {columns.map((col) => (
            <div
              key={col.key}
              className="panel-header-cell"
              data-priority={col.priority || "high"}
            >
              {col.label}
            </div>
          ))}
        </div>
      )}

      <div className="panel-grid">
        {emptyState ? (
          <div className="panel-empty">
            <FontAwesomeIcon icon={emptyState.icon} spin={emptyState.spin} />
            <p>{emptyState.message}</p>
          </div>
        ) : (
          pagedData.map(renderItem)
        )}
      </div>

      {showPagination && <Pagination {...pagination} itemLabel={itemLabel} />}
    </div>
  );
}

export default Table;
