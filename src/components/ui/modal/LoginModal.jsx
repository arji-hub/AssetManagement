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
  } = useLogin();

  return (
    <div className="login-modal-box">
      <img
        className="login-watermark"
        src={CICTLOGO}
        alt=""
        aria-hidden="true"
      />

      <div className="login-icon">
        <FontAwesomeIcon icon="fa-solid fa-user-shield" />{" "}
      </div>
      <div className="login-modal-title">STAFF PORTAL</div>

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
          <span>Forgot?</span>
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
