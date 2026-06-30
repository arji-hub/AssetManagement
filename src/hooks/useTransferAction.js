import { useState, useEffect, useRef } from "react";

const COUNTDOWN = 5;

export function useTransferAction(type, onClose, onConfirm) {
  const [remarks, setRemarks] = useState("");
  const [seconds, setSeconds] = useState(COUNTDOWN);
  const [ready, setReady] = useState(false);
  const textareaRef = useRef(null);

  const isApprove = type === "approve";

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // countdown
  useEffect(() => {
    if (ready) return;
    if (seconds === 0) {
      setReady(true);
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, ready]);

  const handleConfirm = () => {
    onConfirm(remarks.trim());
  };

  return {
    remarks,
    setRemarks,
    seconds,
    ready,
    textareaRef,
    isApprove,
    handleConfirm,
  };
}