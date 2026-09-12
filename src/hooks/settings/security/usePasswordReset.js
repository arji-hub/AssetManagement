import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../services/firebase-config";

// status: "idle" | "sending" | "sent" | "error"
export function usePasswordReset(email) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSendReset = async () => {
    if (!email) return;

    setStatus("sending");
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("sent");
    } catch (err) {
      setError(
        err.code === "auth/too-many-requests"
          ? "Too many attempts. Please wait a bit before trying again."
          : err.message || "Couldn't send the reset link. Please try again.",
      );
      setStatus("error");
    }
  };

  return { status, error, handleSendReset };
}
