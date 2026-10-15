import React from "react";
import BackButton from "../button/BackButton";
import "./ReportInfoSkeleton.css";

function Sk({ w = "100%", h = 14, r, className = "" }) {
  return (
    <span
      className={`sk ${className}`}
      style={{ width: w, height: h, borderRadius: r }}
      aria-hidden="true"
    />
  );
}

function ReportInfoSkeleton() {
  return (
    <div
      className="report-info-page"
      role="status"
      aria-busy="true"
      aria-label="Loading report information"
    >
      {/* ── Header (static parts are real, actions are skeleton) ── */}
      <div className="asset-info-header">
        <div className="asset-info-breadcrumb">
          <BackButton />
          <span className="breadcrumb-parent">Report Information</span>
        </div>
        <div className="report-info-actions">
          <Sk w={190} h={36} r={8} />
          <Sk w={100} h={36} r={8} />
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="report-info-card">
        {/* Card header */}
        <div className="report-info-card-header">
          <div
            className="report-info-card-header-left"
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <Sk w={110} h={12} />
            <Sk w={260} h={24} />
            <Sk w={140} h={13} />
          </div>
          <div className="report-info-card-header-right">
            <Sk w={110} h={16} />
          </div>
        </div>

        {/* Narrative */}
        <div className="report-info-section">
          <div className="report-info-section-header">
            <Sk w={130} h={12} />
            <Sk w={80} h={22} r={999} />
          </div>
          <div className="report-info-narrative sk-narrative">
            <Sk h={13} />
            <Sk h={13} />
            <Sk w="70%" h={13} />
          </div>
        </div>

        {/* Evidence + details */}
        <div className="report-info-grid">
          <div className="report-info-details">
            {[0, 1, 2, 3].map((i) => (
              <div className="report-info-detail-box" key={i}>
                <Sk w={70} h={10} />
                <Sk w="65%" h={16} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Status history ── */}
      <div className="report-info-status-card">
        <Sk w={120} h={12} />
        <div className="report-info-log">
          {[0, 1, 2].map((i) => (
            <div className="sk-log-item" key={i}>
              <Sk w={28} h={28} r={999} />
              <div className="sk-log-text">
                <Sk w={90} h={13} />
                <Sk w={120} h={11} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportInfoSkeleton;
