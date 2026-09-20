import React from "react";
import "./TableSkeleton.css";

// Deterministic widths so the skeleton doesn't jump between renders
const WIDTHS = [72, 58, 84, 46, 66, 78];

function TableSkeleton({ columns = [], rows = 8 }) {
  const hasBadge = columns.some((c) => c.key === "status");
  const hasCategory = columns.some((c) => c.key === "category");

  return (
    <>
      <span className="skeleton-sr-only" role="status">
        Loading…
      </span>

      {Array.from({ length: rows }, (_, r) => (
        <React.Fragment key={r}>
          {/* ── Desktop / tablet row (mirrors .asset-card-row) ── */}
          <div className="skeleton-row" aria-hidden="true">
            {columns.map((col, c) => (
              <div
                key={col.key}
                className="skeleton-row-cell"
                data-priority={col.priority || "high"}
              >
                <span
                  className={`skeleton-bar${
                    col.key === "status" ? " skeleton-bar--pill" : ""
                  }`}
                  style={
                    col.key === "status"
                      ? undefined
                      : { width: `${WIDTHS[(r + c) % WIDTHS.length]}%` }
                  }
                />
              </div>
            ))}
          </div>

          {/* ── Mobile card (mirrors .asset-card) ── */}
          <div className="skeleton-card" aria-hidden="true">
            {(hasCategory || hasBadge) && (
              <div className="skeleton-card-header">
                {hasCategory ? (
                  <span className="skeleton-bar skeleton-bar--category" />
                ) : (
                  <span />
                )}
                {hasBadge && (
                  <span className="skeleton-bar skeleton-bar--pill" />
                )}
              </div>
            )}

            <div className="skeleton-card-title">
              <span className="skeleton-bar" style={{ width: "92%" }} />
              <span
                className="skeleton-bar"
                style={{ width: `${WIDTHS[r % WIDTHS.length] - 20}%` }}
              />
            </div>

            <div className="skeleton-card-meta">
              <span className="skeleton-bar skeleton-bar--meta" />
              <span className="skeleton-bar skeleton-bar--meta" />
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

export default TableSkeleton;
