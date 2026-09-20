import { useState, useEffect } from "react";
import "./Header.css";
import CICTLOGO from "../../assets/logo/CICTLOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../hooks/settings/theme/useTheme";

export default function Header({ onNavigate }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : "light";

  useEffect(() => {
    // Threshold before the header switches into its "scrolled" look.
    const SCROLL_THRESHOLD = 40;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    // Run once on mount in case the page loads already scrolled
    // (e.g. navigating back with scroll position restored).
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (section) => {
    onNavigate(section);
    setMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? "header--scrolled" : ""}`}>
      <div className="header-logo">
        <button
          type="button"
          className="header-logo-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${nextTheme} mode`}
          title={`Switch to ${nextTheme} mode`}
        >
          <img src={CICTLOGO} alt="" />
        </button>
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
