import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { SUB_TABS, EMPTY_STATE_CONFIG } from "../../data/transfer";
import {
  subscribeToAction,
  subscribeToRequested,
  subscribeToLogs,
  subscribeToRoomLogs,
} from "../../services/transfer";

export function useTransfers({ currentTop = "transfers" } = {}) {
  const { user, role } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  // ── page / tab state ──
  const [activeTop, setActiveTop] = React.useState(currentTop);
  const [activeTransferSub, setActiveTransferSub] = React.useState("action");
  const [activeRoomSub, setActiveRoomSub] = React.useState("logs");

  React.useState(false);

  const activeSub =
    activeTop === "transfers" ? activeTransferSub : activeRoomSub;
  const setActiveSub =
    activeTop === "transfers" ? setActiveTransferSub : setActiveRoomSub;

  const visibleSubTabs =
    activeTop === "rooms" ? SUB_TABS.filter((t) => t.key === "logs") : SUB_TABS;

  const handleTopTabChange = (key) => setActiveTop(key);
  const handleSubTabChange = (key) => setActiveSub(key);

  const handleTopTabClick = (tabKey) => {
    if (tabKey === currentTop) return; // already on this page, no-op
    navigate(tabKey === "rooms" ? "/transfer/room" : "/transfer");
  };

  // ── data fetching ──
  // "rooms" page always subscribes to room_logs; "transfers" page uses the active sub-tab
  const group = currentTop === "rooms" ? "room_logs" : activeTransferSub;

  const [rawItems, setRawItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handleRowClick = (item) => {
    if (group !== "room_logs") {
      navigate(`/transfer/${item.id}`);
    }
  };

  React.useEffect(() => {
    if (!uid) return;

    const authedUser = { uid, role };

    setLoading(true);
    setError(null);

    const onData = (data) => {
      setRawItems(data);
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
  }, [group, uid, role]);

  const emptyState = EMPTY_STATE_CONFIG[group] || EMPTY_STATE_CONFIG.action;

  return {
    // role / permissions
    isRole: role,

    // tab state
    activeTop,
    activeTransferSub,
    activeRoomSub,
    activeSub,
    visibleSubTabs,
    handleTopTabChange,
    handleSubTabChange,
    handleTopTabClick,

    // data
    items: rawItems,
    loading,
    error,
    handleRowClick,
    emptyState,
  };
}
