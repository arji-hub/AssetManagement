import { useState, useEffect, useCallback } from "react";
import {
  getLinkedProviders,
  linkGoogleAccount,
  linkMicrosoftAccount,
  unlinkProvider,
} from "../../services/authService";

const OAUTH_ERROR_MESSAGES = {
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/popup-blocked":
    "Your browser blocked the popup. Please allow popups for this site and try again.",
  "auth/credential-already-in-use":
    "This account is already linked to a different user.",
  "auth/provider-already-linked":
    "This provider is already linked to your account.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
};

function getErrorMessage(err) {
  if (err.code && err.code in OAUTH_ERROR_MESSAGES) {
    return OAUTH_ERROR_MESSAGES[err.code];
  }
  return err.message || "Something went wrong. Please try again.";
}

export function useProfile() {
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [pending, setPending] = useState(null); // "google" | "microsoft" | null
  const [error, setError] = useState("");

  const refreshLinkedProviders = useCallback(() => {
    setLinkedProviders(getLinkedProviders());
  }, []);

  useEffect(() => {
    refreshLinkedProviders();
  }, [refreshLinkedProviders]);

  const isLinked = useCallback(
    (providerId) => linkedProviders.some((p) => p.providerId === providerId),
    [linkedProviders],
  );

  const getLinkedEmail = useCallback(
    (providerId) =>
      linkedProviders.find((p) => p.providerId === providerId)?.email ?? null,
    [linkedProviders],
  );

  const handleLinkGoogle = async () => {
    setError("");
    setPending("google");
    try {
      await linkGoogleAccount();
      refreshLinkedProviders();
    } catch (err) {
      const message = getErrorMessage(err);
      if (message) setError(message);
    } finally {
      setPending(null);
    }
  };

  const handleLinkMicrosoft = async () => {
    setError("");
    setPending("microsoft");
    try {
      await linkMicrosoftAccount();
      refreshLinkedProviders();
    } catch (err) {
      const message = getErrorMessage(err);
      if (message) setError(message);
    } finally {
      setPending(null);
    }
  };

  const handleUnlink = async (providerId) => {
    setError("");
    setPending(providerId === "google.com" ? "google" : "microsoft");
    try {
      await unlinkProvider(providerId);
      refreshLinkedProviders();
    } catch (err) {
      const message = getErrorMessage(err);
      if (message) setError(message);
    } finally {
      setPending(null);
    }
  };

  return {
    isLinked,
    getLinkedEmail,
    pending,
    error,
    handleLinkGoogle,
    handleLinkMicrosoft,
    handleUnlink,
  };
}
