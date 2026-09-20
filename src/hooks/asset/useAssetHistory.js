import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROLES from "../../data/roles";
import { subscribeToReportsByAsset } from "../../services/report";
import {
  subscribeToTransfersByAsset,
  subscribeToRoomTransfersByAsset,
  getRequestItems,
  getRoomTransferItems,
} from "../../services/transfer";
import { resolveRoomName } from "../../services/room";
import { splitDateTime, toSortableDate } from "../../utils/date";

// "…(with 3 other assets)." — for batched requests that carry several assets
function withOthers(description, count) {
  const others = (count ?? 1) - 1;
  if (others <= 0) return description;
  return `${description.replace(/\.$/, "")} (with ${others} other asset${
    others === 1 ? "" : "s"
  }).`;
}

// report doc → history item shape
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
    clickable: true,
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
    description: withOthers(description, getRequestItems(transfer).length),
    reported_by: transfer.requested_by_name || "Unknown",
    date,
    time,
    sortDate: toSortableDate(transfer.created_at),
    clickable: true,
  };
}

// roomTransfer._from / ._to are already resolved to room names (see effect)
function normalizeRoomTransfer(roomTransfer, isAdmin) {
  const { date, time } = splitDateTime(roomTransfer.created_at);
  const from = roomTransfer._from;
  const to = roomTransfer._to;

  let description;
  if (from && to) {
    description = `Moved from ${from} to ${to}.`;
  } else if (to) {
    description = `Moved to ${to}.`;
  } else if (from) {
    description = `Removed from ${from}.`; // move_to === null
  } else {
    description = "Room updated.";
  }

  return {
    id: `room-${roomTransfer.id}`,
    type: "Transfer",
    status: null,
    description: withOthers(description, roomTransfer._count),
    reported_by: "Admin",
    date,
    time,
    sortDate: toSortableDate(roomTransfer.created_at),
    // the room-move page is admin-only (see App.jsx)
    clickable: isAdmin,
  };
}

export function useAssetHistory(assetId) {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === ROLES.ADMIN;

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
    // reset so a previous asset's events never flash while the next loads
    setError(null);
    setReports([]);
    setTransfers([]);
    setRoomTransfers([]);

    if (!assetId) {
      setLoadedFlags({ reports: true, transfers: true, roomTransfers: true });
      return;
    }

    setLoadedFlags({ reports: false, transfers: false, roomTransfers: false });

    let active = true; // ignore late callbacks after cleanup
    let roomRun = 0; // ignore stale async enrichment results

    const markLoaded = (source) =>
      setLoadedFlags((prev) => ({ ...prev, [source]: true }));

    // An errored source still counts as "loaded", otherwise the card would
    // sit on "Loading history…" forever and never reach its error state.
    const handleError = (source) => (err) => {
      if (!active) return;
      console.error(`useAssetHistory: ${source} subscription failed`, err);
      setError(err);
      markLoaded(source);
    };

    const unsub1 = subscribeToReportsByAsset(
      assetId,
      (data) => {
        if (!active) return;
        setReports(data);
        markLoaded("reports");
      },
      handleError("reports"),
    );

    const unsub2 = subscribeToTransfersByAsset(
      assetId,
      (data) => {
        if (!active) return;
        setTransfers(data);
        markLoaded("transfers");
      },
      handleError("transfers"),
    );

    const unsub3 = subscribeToRoomTransfersByAsset(
      assetId,
      async (data) => {
        const run = ++roomRun;
        try {
          const enriched = await Promise.all(
            data.map(async (log) => {
              const items = getRoomTransferItems(log);
              // room_from lives on each item; pick this asset's entry
              const item = items.find((i) => i.asset_id === assetId);
              const [to, from] = await Promise.all([
                resolveRoomName(log.move_to), // null → null (removal)
                resolveRoomName(item?.room_from),
              ]);
              return {
                ...log,
                _to: to,
                _from: from,
                _count: log.asset_count ?? items.length,
              };
            }),
          );
          if (!active || run !== roomRun) return;
          setRoomTransfers(enriched);
          markLoaded("roomTransfers");
        } catch (err) {
          handleError("roomTransfers")(err);
        }
      },
      handleError("roomTransfers"),
    );

    return () => {
      active = false;
      unsub1();
      unsub2();
      unsub3();
    };
  }, [assetId]);

  const history = useMemo(() => {
    const merged = [
      ...reports.map(normalizeReport),
      ...transfers.map(normalizeTransfer),
      ...roomTransfers.map((r) => normalizeRoomTransfer(r, isAdmin)),
    ];

    merged.sort((a, b) => b.sortDate - a.sortDate);

    return merged.map(({ sortDate, ...rest }) => rest);
  }, [reports, transfers, roomTransfers, isAdmin]);

  const loading = !(
    loadedFlags.reports &&
    loadedFlags.transfers &&
    loadedFlags.roomTransfers
  );

  function handleItemClick(item) {
    if (!item.clickable) return;

    if (item.id.startsWith("report-")) {
      navigate(`/report/${item.id.slice("report-".length)}`);
    } else if (item.id.startsWith("transfer-")) {
      navigate(`/transfer/${item.id.slice("transfer-".length)}`);
    } else if (item.id.startsWith("room-")) {
      navigate(`/transfer/room/${item.id.slice("room-".length)}`);
    }
  }

  return { history, loading, error, handleItemClick };
}
