import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToAction,
  subscribeToRequested,
  subscribeToLogs,
  subscribeToRoomLogs,
} from "../../services/transfer";
import useResponsivePageSize from "../asset/useResponsivePageSize";
import { EMPTY_STATE_CONFIG } from "../../data/transfer";

export function useTransferPanel(
  group,
  {
    items: itemsProp,
    loading: loadingProp,
    error: errorProp,
    desktopPageSize = 10,
    mobilePageSize = 5,
  } = {},
) {
  const { user, role } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  const skip = itemsProp !== undefined;

  const [rawItems, setRawItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const pageSize = useResponsivePageSize(desktopPageSize, mobilePageSize);
  const [page, setPage] = React.useState(1);

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
  }, [group, uid, role, skip]);

  const resolvedRawItems = itemsProp ?? rawItems;
  const resolvedLoading = loadingProp ?? loading;
  const resolvedError = errorProp ?? error;

  const totalPages = Math.max(1, Math.ceil(resolvedRawItems.length / pageSize));

  // Clamp page back in range if data or pageSize shrinks (e.g. resize, new snapshot)
  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  // Jump back to page 1 whenever the active group/tab changes
  React.useEffect(() => {
    setPage(1);
  }, [group]);

  const items = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return resolvedRawItems.slice(start, start + pageSize);
  }, [resolvedRawItems, page, pageSize]);

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  };

  const goPrev = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  const emptyState = EMPTY_STATE_CONFIG[group] || EMPTY_STATE_CONFIG.action;

  const showHeader =
    !resolvedLoading &&
    !resolvedError &&
    items.length !== 0 &&
    group !== "room_logs";

  const showRoomHeader =
    !resolvedLoading &&
    !resolvedError &&
    items.length !== 0 &&
    group === "room_logs";

  return {
    items,
    totalCount: resolvedRawItems.length,
    loading: resolvedLoading,
    error: resolvedError,
    handleRowClick,
    page,
    totalPages,
    pageSize,
    goPrev,
    goNext,
    goToPage,
    emptyState,
    showHeader,
    showRoomHeader,
  };
}
