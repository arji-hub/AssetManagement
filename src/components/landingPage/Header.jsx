import { useState } from "react";
import "./Header.css";
import CICTLOGO from "../../assets/logo/CICTLOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function Header({ onNavigate }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (section) => {
    onNavigate(section);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-logo">
        <img src={CICTLOGO} alt="CICT Logo" />
        <span>CICT-AMS Project</span>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
      </button>

      <div className={`header-right ${menuOpen ? "open" : ""}`}>
        <nav className="header-nav">
          <button className="nav-link" onClick={() => handleNavigate("hero")}>
            Home
          </button>

          <button className="nav-link" onClick={() => handleNavigate("qr")}>
            How to Scan
          </button>

          <button
            className="nav-link"
            onClick={() => handleNavigate("features")}
          >
            Features
          </button>

          <button className="nav-link" onClick={() => navigate("/about")}>
            About
          </button>
        </nav>

        {/*Exclusive login for cict staffs only */}
        <button className="login-btn" onClick={() => navigate("/login")}>
          <FontAwesomeIcon icon="fa-solid fa-user-shield" />
          <span className="desktop-text">Access Portal</span>
          <span className="mobile-text">Continue as Staff</span>
        </button>
      </div>
    </header>
  );
}
