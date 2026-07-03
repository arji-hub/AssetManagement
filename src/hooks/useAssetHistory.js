import { useState, useEffect, useMemo } from "react";
import { subscribeToReportsByAsset } from "../services/report";
import {
  subscribeToTransfersByAsset,
  subscribeToRoomTransfersByAsset,
} from "../services/transfer";
import { formatDateTime, splitDateTime, toSortableDate } from "../utils/date";

// report doc → MOCK_HISTORY shape
function normalizeReport(report) {
  const { date, time } = splitDateTime(report.created_at);
  return {
    id: `report-${report.id}`,
    type: "Incident",
    status: report.status,
    description:
      report.narrative || report.description || "No description provided.",
    reported_by: report.reported_by_name || "Unknown",
    date,
    time,
    sortDate: toSortableDate(report.created_at),
  };
}

function normalizeTransfer(transfer) {
  const { date, time } = splitDateTime(transfer.created_at);
  const fromName = transfer.acknowledgments?.from?.name;
  const toName = transfer.acknowledgments?.to?.name;

  let description;
  if (fromName && toName) {
    description = `Transferred from ${fromName} to ${toName}.`;
  } else if (toName) {
    description = `Assigned to ${toName}.`;
  } else if (fromName) {
    description = `Removed from ${fromName}.`;
  } else {
    description = "Transfer request submitted.";
  }

  return {
    id: `transfer-${transfer.id}`,
    type: "Transfer",
    status: null,
    description,
    reported_by: transfer.requested_by_name || "Unknown",
    date,
    time,
    sortDate: toSortableDate(transfer.created_at),
  };
}

function normalizeRoomTransfer(roomTransfer) {
  const { date, time } = splitDateTime(roomTransfer.created_at);
  const from = roomTransfer.room_from || "unassigned";
  const to = roomTransfer.move_to || "unknown room";

  return {
    id: `room-${roomTransfer.id}`,
    type: "Transfer",
    status: null,
    description: `Transferred from ${from} to ${to}.`,
    reported_by: "Admin",
    date,
    time,
    sortDate: toSortableDate(roomTransfer.created_at),
  };
}

export function useAssetHistory(assetId) {
  const [reports, setReports] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [roomTransfers, setRoomTransfers] = useState([]);
  const [loadedFlags, setLoadedFlags] = useState({
    reports: false,
    transfers: false,
    roomTransfers: false,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("[useAssetHistory] effect start, assetId:", assetId);

    if (!assetId) {
      console.log("[useAssetHistory] no assetId, skipping subscriptions");
      return;
    }

    setLoadedFlags({ reports: false, transfers: false, roomTransfers: false });

    const handleError = (source) => (err) => {
      console.error(`[useAssetHistory] ${source} ERROR:`, err);
      setError(err);
    };

    console.log("[useAssetHistory] subscribing to reports...");
    const unsub1 = subscribeToReportsByAsset(
      assetId,
      (data) => {
        console.log("[useAssetHistory] reports received:", data.length, data);
        setReports(data);
        setLoadedFlags((prev) => {
          const next = { ...prev, reports: true };
          console.log("[useAssetHistory] loadedFlags after reports:", next);
          return next;
        });
      },
      handleError("reports"),
    );

    console.log("[useAssetHistory] subscribing to transfers...");
    const unsub2 = subscribeToTransfersByAsset(
      assetId,
      (data) => {
        console.log("[useAssetHistory] transfers received:", data.length, data);
        setTransfers(data);
        setLoadedFlags((prev) => {
          const next = { ...prev, transfers: true };
          console.log("[useAssetHistory] loadedFlags after transfers:", next);
          return next;
        });
      },
      handleError("transfers"),
    );

    console.log("[useAssetHistory] subscribing to roomTransfers...");
    const unsub3 = subscribeToRoomTransfersByAsset(
      assetId,
      (data) => {
        console.log(
          "[useAssetHistory] roomTransfers received:",
          data.length,
          data,
        );
        setRoomTransfers(data);
        setLoadedFlags((prev) => {
          const next = { ...prev, roomTransfers: true };
          console.log(
            "[useAssetHistory] loadedFlags after roomTransfers:",
            next,
          );
          return next;
        });
      },
      handleError("roomTransfers"),
    );

    return () => {
      console.log("[useAssetHistory] cleanup, unsubscribing all");
      unsub1();
      unsub2();
      unsub3();
    };
  }, [assetId]);

  const history = useMemo(() => {
    const merged = [
      ...reports.map(normalizeReport),
      ...transfers.map(normalizeTransfer),
      ...roomTransfers.map(normalizeRoomTransfer),
    ];

    merged.sort((a, b) => b.sortDate - a.sortDate);

    return merged.map(({ sortDate, ...rest }) => rest);
  }, [reports, transfers, roomTransfers]);

  const loading = !(
    loadedFlags.reports &&
    loadedFlags.transfers &&
    loadedFlags.roomTransfers
  );

  console.log(
    "[useAssetHistory] render — loadedFlags:",
    loadedFlags,
    "loading:",
    loading,
  );

  return { history, loading, error };
}
