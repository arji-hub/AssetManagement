import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToReportsByAsset } from "../../services/report";
import {
  subscribeToTransfersByAsset,
  subscribeToRoomTransfersByAsset,
} from "../../services/transfer";
import { fetchRoom } from "../../services/room";
import {
  formatDateTime,
  splitDateTime,
  toSortableDate,
} from "../../utils/date";

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
  const navigate = useNavigate();
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
    if (!assetId) {
      return;
    }

    setLoadedFlags({ reports: false, transfers: false, roomTransfers: false });

    const handleError = (source) => (err) => {
      setError(err);
    };

    const unsub1 = subscribeToReportsByAsset(
      assetId,
      (data) => {
        setReports(data);
        setLoadedFlags((prev) => {
          const next = { ...prev, reports: true };
          return next;
        });
      },
      handleError("reports"),
    );

    const unsub2 = subscribeToTransfersByAsset(
      assetId,
      (data) => {
        setTransfers(data);
        setLoadedFlags((prev) => {
          const next = { ...prev, transfers: true };
          return next;
        });
      },
      (err) => {
        return handleError("transfers")(err);
      },
    );

    const roomNameCache = new Map();

    async function resolveRoom(id) {
      if (!id) return { id: null, name: null };
      if (roomNameCache.has(id)) return roomNameCache.get(id);
      try {
        const room = await fetchRoom(id);
        const resolved = { id: room.id, name: room.name };
        roomNameCache.set(id, resolved);
        return resolved;
      } catch {
        // room deleted or lookup failed — fall back gracefully
        const fallback = { id, name: "Unknown room" };
        roomNameCache.set(id, fallback);
        return fallback;
      }
    }

    async function enrichTransfers(rawTransfers) {
      return Promise.all(
        rawTransfers.map(async (t) => {
          const [to, from] = await Promise.all([
            resolveRoom(t.move_to),
            resolveRoom(t.room_from),
          ]);
          return {
            ...t,
            move_to: to.name,
            move_to_id: to.id,
            room_from: from.name,
            room_from_id: from.id,
          };
        }),
      );
    }

    const unsub3 = subscribeToRoomTransfersByAsset(
      assetId,
      async (data) => {
        const enriched = await enrichTransfers(data);
        setRoomTransfers(enriched);
        setLoadedFlags((prev) => ({ ...prev, roomTransfers: true }));
      },
      handleError("roomTransfers"),
    );

    return () => {
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

  function handleItemClick(item) {
    if (item.id.startsWith("report-")) {
      const uid = item.id.replace("report-", "");
      navigate(`/report/${uid}`);
    } else if (item.id.startsWith("transfer-")) {
      const uid = item.id.replace("transfer-", "");
      navigate(`/transfer/${uid}`);
    }
    // room- prefixed items: no navigation, intentionally left as no-op
  }

  return { history, loading, error, handleItemClick };
}
