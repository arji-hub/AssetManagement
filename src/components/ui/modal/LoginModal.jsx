import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { GoogleIcon, MicrosoftIcon } from "../../../assets/OAuthIcons";
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
    <div className="login-modal-overlay">
      <div className="login-modal-box">
        <div className="login-modal-title">LOGIN</div>

        {error && <p className="login-modal-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="login-modal-field">
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="login-modal-field-icon">
              <FontAwesomeIcon icon={faUser} />
            </span>
          </div>

          <div className="login-modal-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="login-modal-field-icon login-modal-eye"
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
            {loading ? "Logging in..." : "Login"}
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
            disabled={isBusy}
          >
            <GoogleIcon />
            <span>
              {oauthLoading === "google" ? "Signing in..." : "Google"}
            </span>
          </button>

          <button
            type="button"
            className="login-modal-oauth-btn"
            onClick={handleMicrosoftClick}
            disabled={isBusy}
          >
            <MicrosoftIcon />
            <span>
              {oauthLoading === "microsoft" ? "Signing in..." : "Microsoft"}
            </span>
          </button>
        </div>

        {/*<div className="login-modal-footer">
          <span>Remember me</span>
          <span>Forgot Password</span>
        </div> */}
      </div>
    </div>
  );
}

export default LoginModal;
