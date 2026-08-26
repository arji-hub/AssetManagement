import React from "react";
import Table from "./Table";
import AssetCard from "../ui/card/AssetCard";
import "./AssetTable.css";

function AssetTable({
  columns,
  data,
  loading,
  error,
  emptyMessage = "No assets found.",
  onRowAction,
  desktopPageSize = 20,
  mobilePageSize = 10,
}) {
  const gridTemplate = columns.map((c) => c.width || "1fr").join(" ");

  const gridTemplateNoLow = columns
    .filter((c) => c.priority !== "low")
    .map((c) => c.width || "1fr")
    .join(" ");

  const gridTemplateHighOnly = columns
    .filter((c) => (c.priority || "high") === "high")
    .map((c) => c.width || "1fr")
    .join(" ");

  return (
    <div
      className="asset-table-container"
      style={{
        "--asset-grid-columns": gridTemplate,
        "--asset-grid-columns-tablet": gridTemplateNoLow,
        "--asset-grid-columns-mobile": gridTemplateHighOnly,
      }}
    >
      <div className="asset-table-header">
        {columns.map((col) => (
          <div
            key={col.key}
            className="asset-table-header-cell"
            data-priority={col.priority || "high"}
          >
            {col.label}
          </div>
        ))}
      </div>

      <Table
        items={data}
        loading={loading}
        error={error}
        itemLabel="assets"
        emptyMessage={emptyMessage}
        emptyIcon="fa-solid fa-box-open"
        desktopPageSize={desktopPageSize}
        mobilePageSize={mobilePageSize}
        renderItem={(asset, index) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            index={index}
            columns={columns}
            onClick={onRowAction}
          />
        )}
      />
    </div>
  );
}

export default AssetTable;
