import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/roles";
import {
  subscribeToAction,
  subscribeToRequested,
  subscribeToLogs,
  subscribeToRoomLogs,
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

    const authedUser = { uid, role };

    setLoading(true);
    setError(null);

    const onData = (data) => {
      setItems(data);
      setLoading(false);
    };

    const onErr = (err) => {
      setError(err);
      setLoading(false);
    };

    let unsubscribe = () => {};

    if (group === "action") {
      unsubscribe = subscribeToAction(authedUser, onData, onErr);
    } else if (group === "requested") {
      unsubscribe = subscribeToRequested(authedUser, onData, onErr);
    } else if (group === "logs") {
      unsubscribe = subscribeToLogs(authedUser, onData, onErr);
    } else if (group === "room_logs") {
      unsubscribe = subscribeToRoomLogs(onData, onErr);
    }

    return () => unsubscribe();
  }, [group, uid, role, skip]);

  return { items, loading, error, handleRowClick };
}
