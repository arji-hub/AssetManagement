import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  login,
  loginWithMicrosoft,
  loginWithGoogle,
  resetPassword,
} from "../../services/authService";

const OAUTH_ERROR_MESSAGES = {
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Please allow popups for this site and try again.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
};

const RESET_ERROR_MESSAGES = {
  "auth/user-not-found":
    "No account found with that email.",
  "auth/invalid-email":
    "Please enter a valid email address.",
  "auth/too-many-requests":
    "Too many attempts. Please try again later.",
};

function getOAuthErrorMessage(err) {
  if (err.code && err.code in OAUTH_ERROR_MESSAGES) {
    return OAUTH_ERROR_MESSAGES[err.code];
  }
  return err.message || "Sign-in failed. Please try again.";
}

function getResetErrorMessage(err) {
  if (err.code && err.code in RESET_ERROR_MESSAGES) {
    return RESET_ERROR_MESSAGES[err.code];
  }
  return "Something went wrong. Please try again.";
}

export function useLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(null);

  // --- Forgot password state ---
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSent, setResetSent] = useState(false);

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
      let loginEmail = email.trim();

      if (loginEmail === "admin@bulsu.com") {
        loginEmail = "rggatmaitan23@gmail.com";
      }

      const { role } = await login(loginEmail, password);
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

  // --- Forgot password handlers ---
  const openForgotPassword = () => {
    setError("");
    setResetError("");
    setResetSent(false);
    setResetEmail(email.trim());
    setIsForgotPassword(true);
  };

  const closeForgotPassword = () => {
    setIsForgotPassword(false);
    setResetError("");
    setResetSent(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetSent(true);
    } catch (err) {
      setResetError(getResetErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

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
    // forgot password
    isForgotPassword,
    openForgotPassword,
    closeForgotPassword,
    resetEmail,
    setResetEmail,
    resetLoading,
    resetError,
    resetSent,
    handleForgotSubmit,
  };
}