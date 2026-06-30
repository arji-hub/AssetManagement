import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../data/roles";
import { SUB_TABS } from "../data/transfer";

export function useTransferPage({ currentTop = "transfers" } = {}) {
  const { role } = useAuth();
  const isRole = role;
  const navigate = useNavigate();

  const [activeTop, setActiveTop] = React.useState("transfers");
  const [activeTransferSub, setActiveTransferSub] = React.useState("action");
  const [activeRoomSub, setActiveRoomSub] = React.useState("logs");

  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [showTransferMR, setShowTransferMR] = React.useState(false);
  const [showTransferRoomModal, setShowTransferRoomModal] = React.useState(false);

  const activeSub =
    activeTop === "transfers" ? activeTransferSub : activeRoomSub;
  const setActiveSub =
    activeTop === "transfers" ? setActiveTransferSub : setActiveRoomSub;

  const visibleSubTabs =
    activeTop === "rooms" ? SUB_TABS.filter((t) => t.key === "logs") : SUB_TABS;

  const handleTopTabChange = (key) => {
    setActiveTop(key);
  };

  const handleSubTabChange = (key) => {
    setActiveSub(key);
  };

  const handleTransferRequest = () => setShowTransferModal(true);
  const handleTransferModalClose = () => setShowTransferModal(false);

  const handleTransferMR = () => setShowTransferMR(true);
  const handleTransferMRClose = () => setShowTransferMR(false);

  const handleTransferRoom = () => setShowTransferRoomModal(true);
  const handleTransferRoomModalClose = () => setShowTransferRoomModal(false);

  const handleTopTabClick = (tabKey) => {
    if (tabKey === currentTop) return; // already on this page, no-op
    navigate(tabKey === "rooms" ? "/transfer/room" : "/transfer");
  };

  return {
    // role / permissions
    isRole,

    // tab state
    activeTop,
    activeTransferSub,
    activeRoomSub,
    activeSub,
    visibleSubTabs,

    // handlers
    handleTopTabChange,
    handleSubTabChange,
    handleTopTabClick,

    // transfer modal
    showTransferModal,
    handleTransferRequest,
    handleTransferModalClose,
    showTransferMR,
    handleTransferMR,
    handleTransferMRClose,

    // transfer room modal
    showTransferRoomModal,
    handleTransferRoom,
    handleTransferRoomModalClose,
  };
}