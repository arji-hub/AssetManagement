import "./Header.css";

export default function Header({ onNavigate }) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">BSU Asset Management</div>

        <nav className="header-nav">
          <button
            className="nav-link active"
            onClick={() => onNavigate("home")}
          >
            Home
          </button>

          <button className="nav-link" onClick={() => onNavigate("features")}>
            Features
          </button>

          <button className="nav-link" onClick={() => onNavigate("about")}>
            About
          </button>

          <button className="nav-link" onClick={() => onNavigate("contact")}>
            Contact
          </button>
        </nav>
      </div>

      <div className="header-right">
        <button className="login-btn">User Login</button>
      </div>
    </header>
  );
}
