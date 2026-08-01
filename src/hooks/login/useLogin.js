import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  login,
  loginWithMicrosoft,
  loginWithGoogle,
} from "../../services/authService";

const OAUTH_ERROR_MESSAGES = {
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Please allow popups for this site and try again.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
};

function getOAuthErrorMessage(err) {
  if (err.code && err.code in OAUTH_ERROR_MESSAGES) {
    return OAUTH_ERROR_MESSAGES[err.code];
  }
  return err.message || "Sign-in failed. Please try again.";
}

export function useLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  const routeByRole = (role) => {
    if (role === "admin" || role === "parttime" || role === "fulltime") {
      navigate("/dashboard");
    } else {
      throw new Error("No role assigned.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { role } = await login(email, password);
      routeByRole(role);
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftClick = async () => {
    setError("");
    setOauthLoading("microsoft");
    try {
      const { role } = await loginWithMicrosoft();
      routeByRole(role);
    } catch (err) {
      const message = getOAuthErrorMessage(err);
      if (message) setError(message);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleGoogleClick = async () => {
    setError("");
    setOauthLoading("google");
    try {
      const { role } = await loginWithGoogle();
      routeByRole(role);
    } catch (err) {
      const message = getOAuthErrorMessage(err);
      if (message) setError(message);
    } finally {
      setOauthLoading(null);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const isBusy = loading;

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    showPassword,
    togglePasswordVisibility,
    oauthLoading,
    isBusy,
    handleSubmit,
    handleMicrosoftClick,
    handleGoogleClick,
  };
}
