import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MainLayout from "../../../components/layout/MainLayout";
import Settings from "../Settings";
import { useAuth } from "../../../context/AuthContext";
import { useLinkedAccounts } from "../../../hooks/settings/security/useLinkedAccounts";
import { usePasswordReset } from "../../../hooks/settings/security/usePasswordReset";
import { GoogleIcon, MicrosoftIcon } from "../../../assets/OAuthIcons";
import "./Security.css";

function ProviderRow({
  icon,
  name,
  connected,
  email,
  busy,
  onConnect,
  onDisconnect,
}) {
  return (
    <div className="settings-row">
      <span className="settings-row-label">{name}</span>
      <div className="settings-row-value settings-provider-value">
        <div className="settings-provider-info">
          <span className="settings-provider-icon">{icon}</span>
          {connected ? (
            <span className="settings-provider-email">{email}</span>
          ) : (
            <span className="settings-provider-status">Not connected</span>
          )}
        </div>
        <button
          type="button"
          className={
            connected ? "settings-edit-btn is-editing" : "settings-edit-btn"
          }
          onClick={connected ? onDisconnect : onConnect}
          disabled={busy}
        >
          {busy
            ? connected
              ? "Removing..."
              : "Connecting..."
            : connected
              ? "Disconnect"
              : "Connect"}
        </button>
      </div>
    </div>
  );
}

function Security() {
  const { user } = useAuth();

  const {
    isLinked,
    getLinkedEmail,
    pending,
    error: linkError,
    handleLinkGoogle,
    handleLinkMicrosoft,
    handleUnlink,
  } = useLinkedAccounts();

  const {
    status: resetStatus,
    error: resetError,
    handleSendReset,
  } = usePasswordReset(user?.email);

  return (
    <MainLayout>
      <Settings>
        <div className="settings-content">
          {/* Password */}
          <section className="settings-section">
            <div className="settings-section-header">
              <div>
                <h3>Password</h3>
                <p>
                  Reset your password using a secure link sent to your
                  registered email.
                </p>
              </div>
            </div>

            <div className="settings-rows">
              <div className="settings-row">
                <span className="settings-row-label">Email</span>
                <span className="settings-row-value">{user?.email || "—"}</span>
              </div>

              <div className="settings-row">
                <span className="settings-row-label">Reset password</span>
                <div className="settings-row-value settings-reset-row">
                  <button
                    type="button"
                    className="settings-edit-btn"
                    onClick={handleSendReset}
                    disabled={resetStatus === "sending" || !user?.email}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-key" />
                    {resetStatus === "sending"
                      ? "Sending..."
                      : "Send reset link"}
                  </button>
                  {resetStatus === "sent" && (
                    <span className="settings-reset-success">
                      Reset link sent — check your inbox.
                    </span>
                  )}
                  {resetStatus === "error" && (
                    <span className="field-error">{resetError}</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Linked accounts */}
          <section className="settings-section">
            <div className="settings-section-header">
              <div>
                <h3>Linked accounts</h3>
                <p>
                  Connect Google or Microsoft to sign in without a password.
                </p>
              </div>
            </div>

            {linkError && (
              <p className="settings-save-error settings-linked-error">
                {linkError}
              </p>
            )}

            <div className="settings-rows">
              <ProviderRow
                icon={<GoogleIcon />}
                name="Google"
                connected={isLinked("google.com")}
                email={getLinkedEmail("google.com")}
                busy={pending === "google"}
                onConnect={handleLinkGoogle}
                onDisconnect={() => handleUnlink("google.com")}
              />
              <ProviderRow
                icon={<MicrosoftIcon />}
                name="Microsoft"
                connected={isLinked("microsoft.com")}
                email={getLinkedEmail("microsoft.com")}
                busy={pending === "microsoft"}
                onConnect={handleLinkMicrosoft}
                onDisconnect={() => handleUnlink("microsoft.com")}
              />
            </div>
          </section>
        </div>
      </Settings>
    </MainLayout>
  );
}

export default Security;
