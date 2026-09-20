import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import BackButton from "../../components/ui/button/BackButton";
import { Status } from "../../components/ui/status/assetStatus";
import { formatDate } from "../../utils/date";
import { useTransferRoomInfo } from "../../hooks/transfer/useTransferRoomInfo";
import "./TransferInfo.css"; // shared page/card/list styles
import "./TransferRoomInfo.css"; // room-specific additions

function TransferRoomInfo() {
  const { log, items, loading, error, isRemoval, typeLabel, handleAssetClick } =
    useTransferRoomInfo();

  if (loading) return <MainLayout></MainLayout>;

  if (error)
    return (
      <MainLayout>
        <div className="transfer-info-error">{error}</div>
      </MainLayout>
    );

  if (!log) return null;

  const isSingleAsset = items.length === 1;

  return (
    <MainLayout>
      <div className="transfer-info-page">
        {/* ── Top bar ── */}
        <div className="transfer-info-topbar">
          <div className="transfer-info-breadcrumb">
            <BackButton />
            <span>Room Transfer</span>
          </div>
        </div>

        {/* ── Main card ── */}
        <div className="transfer-info-card">
          {/* Hero */}
          <div className="transfer-info-hero">
            <div className="transfer-info-hero-main">
              <span className="transfer-info-type-pill">{typeLabel}</span>
              <h1 className="transfer-info-asset-name">
                {isSingleAsset
                  ? items[0]?.asset_name
                  : `${items.length} assets`}
              </h1>
              <p className="transfer-info-asset-id">
                {isSingleAsset
                  ? items[0]?.asset_id
                  : `${items.length} items in this move`}
              </p>
            </div>

            <div className="transfer-info-hero-meta">
              {/* room moves complete on creation — no approval flow */}
              <Status status="completed" />
              <span className="transfer-info-date">
                {formatDate(log.created_at)}
              </span>
            </div>
          </div>

          {/* Meta strip */}
          <div className="transfer-info-meta-strip">
            <div className="transfer-info-meta-item">
              <span className="transfer-info-meta-label">Moved by</span>
              <span className="transfer-info-meta-value">
                {log.move_by_name || "—"}
              </span>
            </div>

            <div className="transfer-info-meta-item">
              <span className="transfer-info-meta-label">
                {isRemoval ? "Result" : "Moved to"}
              </span>
              <span className="transfer-info-meta-value">
                {isRemoval ? (
                  <em className="transfer-info-unassigned">Unassigned</em>
                ) : (
                  log.move_to_name || log.move_to
                )}
              </span>
            </div>

            <div className="transfer-info-meta-item">
              <span className="transfer-info-meta-label">Assets moved</span>
              <span className="transfer-info-meta-value">{items.length}</span>
            </div>
          </div>

          {/* Assets in this move */}
          {items.length > 0 && (
            <div className="transfer-info-section">
              <span className="transfer-info-section-label">
                Assets · {items.length}
              </span>
              <div className="transfer-info-items-list transfer-room-items-list">
                {items.map((item) => (
                  <div
                    className="transfer-info-item-row"
                    key={item.asset_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleAssetClick(item.asset_id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAssetClick(item.asset_id);
                      }
                    }}
                  >
                    <div className="transfer-room-item-main">
                      <span className="transfer-info-item-desc">
                        {item.asset_name}
                      </span>
                      <span className="transfer-info-item-id">
                        {item.asset_id}
                      </span>
                    </div>

                    <span className="transfer-room-item-from">
                      <span className="transfer-room-item-from-label">
                        From
                      </span>
                      {item.room_from_name ? (
                        item.room_from_name
                      ) : (
                        <em className="transfer-info-unassigned">No room</em>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default TransferRoomInfo;
