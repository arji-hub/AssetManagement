import PropTypes from "prop-types";
import { GoogleIcon, MicrosoftIcon } from "../../../assets/OAuthIcons";
import "./LinkedAccountsCard.css";

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
    <div className="linked-account-row">
      <div className="linked-account-icon">{icon}</div>

      <div className="linked-account-info">
        <span className="linked-account-name">{name}</span>
        {connected ? (
          <span className="linked-account-email">{email}</span>
        ) : (
          <span className="linked-account-status">Not connected</span>
        )}
      </div>

      {connected ? (
        <button
          type="button"
          className="linked-account-btn is-connected"
          onClick={onDisconnect}
          disabled={busy}
        >
          {busy ? "Removing..." : "Disconnect"}
        </button>
      ) : (
        <button
          type="button"
          className="linked-account-btn"
          onClick={onConnect}
          disabled={busy}
        >
          {busy ? "Connecting..." : "Connect"}
        </button>
      )}
    </div>
  );
}

ProviderRow.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  connected: PropTypes.bool.isRequired,
  email: PropTypes.string,
  busy: PropTypes.bool.isRequired,
  onConnect: PropTypes.func.isRequired,
  onDisconnect: PropTypes.func.isRequired,
};

function LinkedAccountsCard({
  isLinked,
  getLinkedEmail,
  pending,
  error,
  handleLinkGoogle,
  handleLinkMicrosoft,
  handleUnlink,
}) {
  return (
    <div className="linked-accounts-card">
      <h2 className="linked-accounts-title">Linked accounts</h2>
      <p className="linked-accounts-subtitle">
        Connect Google or Microsoft to sign in without a password.
      </p>

      {error && <p className="linked-accounts-error">{error}</p>}

      <div className="linked-accounts-list">
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
    </div>
  );
}

LinkedAccountsCard.propTypes = {
  isLinked: PropTypes.func.isRequired,
  getLinkedEmail: PropTypes.func.isRequired,
  pending: PropTypes.string,
  error: PropTypes.string.isRequired,
  handleLinkGoogle: PropTypes.func.isRequired,
  handleLinkMicrosoft: PropTypes.func.isRequired,
  handleUnlink: PropTypes.func.isRequired,
};

export default LinkedAccountsCard;
