import React from "react";
import "./SkeletonAssetInfo.css";

/**
 * Base Skeleton Component
 */
function Skeleton({ variant = "text", className = "", style = {}, ...props }) {
  return (
    <div
      className={`skeleton skeleton--${variant} ${className}`}
      style={style}
      {...props}
    />
  );
}

/**
 * InfoCard Skeleton - Shows loading state for asset details
 */
export function InfoCardSkeleton() {
  return (
    <div className="info-card info-card--skeleton">
      {/* Header band skeleton */}
      <div className="info-card-header">
        <Skeleton variant="text" style={{ width: "120px", height: "16px" }} />
        <Skeleton
          variant="text"
          style={{ width: "100px", height: "14px", marginLeft: "auto" }}
        />
      </div>

      {/* Body skeleton */}
      <div className="info-card-body info-card-body--skeleton">
        {/* Left: description + fields */}
        <div className="info-card-detail-col">
          {/* Title block */}
          <div className="info-card-title-block">
            <Skeleton
              variant="text"
              style={{ width: "80px", height: "11px" }}
            />
            <Skeleton
              variant="text"
              style={{ width: "100%", height: "28px", marginTop: "8px" }}
            />
          </div>

          {/* Details grid */}
          <div className="info-card-details-grid">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="info-card-detail-item info-card-detail-item--skeleton"
              >
                <Skeleton
                  variant="text"
                  style={{ width: "60px", height: "11px" }}
                />
                <Skeleton
                  variant="text"
                  style={{ width: "80%", height: "16px", marginTop: "6px" }}
                />
              </div>
            ))}
            {/* Full-width remarks */}
            <div className="info-card-detail-item info-card-detail-item--full info-card-detail-item--skeleton">
              <Skeleton
                variant="text"
                style={{ width: "60px", height: "11px" }}
              />
              <Skeleton
                variant="text"
                style={{ width: "100%", height: "12px", marginTop: "6px" }}
              />
              <Skeleton
                variant="text"
                style={{ width: "95%", height: "12px", marginTop: "4px" }}
              />
            </div>
          </div>
        </div>

        {/* Right: image skeleton */}
        <Skeleton variant="image" className="info-card-main-img" />
      </div>
    </div>
  );
}

/**
 * HistoryCard Skeleton - Shows loading state for asset history
 */
export function HistoryCardSkeleton() {
  return (
    <div className="history-card history-card--skeleton">
      {/* Header skeleton */}
      <div className="history-card-header">
        <Skeleton variant="text" style={{ width: "140px", height: "16px" }} />
        <div className="history-card-filters">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              variant="button"
              style={{ width: "90px", height: "28px" }}
            />
          ))}
        </div>
      </div>

      {/* Items skeleton */}
      <div className="history-card-list">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="history-card-item history-card-item--skeleton"
          >
            {/* Icon */}
            <Skeleton
              variant="circle"
              style={{ width: "34px", height: "34px", flexShrink: 0 }}
            />

            {/* Content */}
            <div className="history-card-item-body">
              <div className="history-card-item-top">
                <Skeleton
                  variant="text"
                  style={{ width: "80px", height: "13px" }}
                />
                <Skeleton
                  variant="text"
                  style={{ width: "60px", height: "12px", marginLeft: "8px" }}
                />
              </div>
              <Skeleton
                variant="text"
                style={{ width: "100%", height: "12px", marginTop: "6px" }}
              />
              <Skeleton
                variant="text"
                style={{ width: "90%", height: "12px", marginTop: "4px" }}
              />
            </div>

            {/* Date */}
            <Skeleton
              variant="text"
              style={{ width: "50px", height: "12px", flexShrink: 0 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
