import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { GoogleIcon, MicrosoftIcon } from "../../../assets/OAuthIcons";
import CICTLOGO from "../../../assets/logo/CICTLOGO.png";
import { useLogin } from "../../../hooks/login/useLogin";
import "./LoginModal.css";

function LoginModal() {
  const {
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
    isForgotPassword,
    openForgotPassword,
    closeForgotPassword,
    resetEmail,
    setResetEmail,
    resetLoading,
    resetError,
    resetSent,
    handleForgotSubmit,
  } = useLogin();

  if (isForgotPassword) {
    return (
      <div className="login-modal-box">
        <img
          className="login-watermark"
          src={CICTLOGO}
          alt=""
          aria-hidden="true"
        />

        <div className="login-modal-title">
          RESET PASSWORD
          <FontAwesomeIcon icon="fa-solid fa-key" />
          <h2 className="subtitle">Enter your email to receive a reset link</h2>
        </div>

        {resetSent ? (
          <>
            <p className="login-modal-success">
              If an account exists for <strong>{resetEmail}</strong>, a reset
              link has been sent. Check your inbox (and spam folder).
            </p>
            <button
              type="button"
              className="login-modal-submit-btn"
              onClick={closeForgotPassword}
            >
              Back to Sign in
            </button>
          </>
        ) : (
          <>
            {resetError && <p className="login-modal-error">{resetError}</p>}

            <form onSubmit={handleForgotSubmit}>
              <div className="login-modal-field-label">E-mail</div>
              <div className="login-modal-field">
                <span className="login-modal-field-icon">
                  <FontAwesomeIcon icon="fa-solid fa-envelope" />
                </span>
                <input
                  type="email"
                  placeholder="user@ms.bulsu.edu.ph"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="login-modal-submit-btn"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  "Sending..."
                ) : (
                  <>
                    Send reset link{" "}
                    <FontAwesomeIcon icon="fa-regular fa-paper-plane" />
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              className="login-modal-back-btn"
              onClick={closeForgotPassword}
            >
              Back to Sign in
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="login-modal-box">
      <img
        className="login-watermark"
        src={CICTLOGO}
        alt=""
        aria-hidden="true"
      />

      <div className="login-modal-title">
        STAFF PORTAL
        <FontAwesomeIcon icon="fa-solid fa-user-shield" />
        <h2 className="subtitle">Exclusive access for CICT faculty</h2>
      </div>

      {error && <p className="login-modal-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="login-modal-field-label">E-mail</div>
        <div className="login-modal-field">
          <span className="login-modal-field-icon">
            <FontAwesomeIcon icon="fa-solid fa-envelope" />
          </span>
          <input
            type="email"
            placeholder="user@ms.bulsu.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="login-modal-field-icon2">
            <FontAwesomeIcon icon={faUser} />
          </span>
        </div>

        <div className="login-modal-field-label">
          Password
          <span onClick={openForgotPassword} style={{ cursor: "pointer" }}>
            Forgot?
          </span>
        </div>
        <div className="login-modal-field">
          <span className="login-modal-field-icon">
            <FontAwesomeIcon icon="fa-solid fa-lock" />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            className="login-modal-field-icon2 login-modal-eye"
            onClick={togglePasswordVisibility}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>

        <button
          type="submit"
          className="login-modal-submit-btn"
          disabled={isBusy}
        >
          {loading ? "Logging in...  " : "Sign in  "}
          <FontAwesomeIcon icon="fa-solid fa-arrow-right" />
        </button>
      </form>

      <div className="login-modal-divider">
        <span>or continue with</span>
      </div>

      <div className="login-modal-oauth-group">
        <button
          type="button"
          className="login-modal-oauth-btn"
          onClick={handleGoogleClick}
          disabled={oauthLoading === "google"}
        >
          <GoogleIcon />
          <span>{oauthLoading === "google" ? "Signing in..." : "Google"}</span>
        </button>

        <button
          type="button"
          className="login-modal-oauth-btn"
          onClick={handleMicrosoftClick}
          disabled={oauthLoading === "microsoft"}
        >
          <MicrosoftIcon />
          <span>
            {oauthLoading === "microsoft" ? "Signing in..." : "Microsoft"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default LoginModal;
