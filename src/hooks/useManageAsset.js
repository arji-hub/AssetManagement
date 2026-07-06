// hooks/useManageAsset.js

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const CLOSE_ANIM_MS = 160;

export default function useManageAsset(asset) {
  const { user, role } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // controls actual presence in DOM
  const [activeModal, setActiveModal] = useState(null); // "transfer" | "mr" | "report" | null
  const wrapperRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const openMenu = () => {
    clearTimeout(closeTimeoutRef.current);
    setIsMounted(true);
    // next tick so the enter animation actually plays from its initial state
    requestAnimationFrame(() => setIsOpen(true));
  };

  const closeMenu = () => {
    setIsOpen(false);
    closeTimeoutRef.current = setTimeout(
      () => setIsMounted(false),
      CLOSE_ANIM_MS,
    );
  };

  const toggleMenu = () => (isOpen ? closeMenu() : openMenu());

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const openModal = (modalName) => {
    setActiveModal(modalName);
    closeMenu();
  };

  const closeModal = () => setActiveModal(null);

  // --- permissions ---
  const isAdmin = role === "admin";
  const isPropertyCustodian = !!user && user.uid === asset?.property_custodian;
  const isLocalMR = !!user && user.uid === asset?.local_mr;
  const isAffiliated = isAdmin || isPropertyCustodian || isLocalMR;

  // Report: visible to everyone.
  const canReport = true;

  // Transfer: admin, or the asset's property custodian, or its local MR.
  const canTransfer = isAffiliated;

  // Local MR: property custodian or local MR only — never admin.
  const canLocalMR = !isAdmin && (isPropertyCustodian || isLocalMR);

  return {
    isOpen,
    isMounted,
    activeModal,
    wrapperRef,
    toggleMenu,
    openModal,
    closeModal,
    permissions: {
      canReport,
      canTransfer,
      canLocalMR,
    },
  };
}
