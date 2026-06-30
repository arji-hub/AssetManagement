import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/roles";
import {
  fetchAction,
  fetchRequested,
  fetchLogs,
  fetchRoomLogs,
} from "../services/transfer";

export function useTransferPanel(group, { skip = false } = {}) {
  const { user, role } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleRowClick = (item) => {
    if (group !== "room_logs") {
      navigate(`/transfer/${item.id}`);
    }
  };

  React.useEffect(() => {
    if (skip || !uid) return;

    let cancelled = false;
    const user = { uid, role };

    setLoading(true);
    setError(null);

    async function load() {
      try {
        let data = [];

        if (group === "action") data = await fetchAction(user);
        else if (group === "requested") data = await fetchRequested(user);
        else if (group === "logs") data = await fetchLogs(user);
        else if (group === "room_logs") data = await fetchRoomLogs();

        if (!cancelled) {
          setItems(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [group, uid, role, skip]);

  return { items, loading, error, handleRowClick };
}
