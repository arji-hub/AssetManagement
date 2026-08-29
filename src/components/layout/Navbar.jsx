import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import NavButton from "../ui/button/NavButton";
import "./Navbar.css";
import logo from "../../assets/logo/CICTLOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ROLES } from "../../data/roles";
import LogoutModal from "../ui/modal/LogoutModal";
import { useNavigate } from "react-router-dom";

const allRoles = [ROLES.ADMIN, ROLES.PARTTIME, ROLES.FULLTIME];

const defaultNavItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    roles: allRoles,
    icon: "chart-line",
  },
  { label: "Asset", path: "/asset", roles: allRoles, icon: "boxes-stacked" },
  { label: "QR Code", path: "/qr", roles: allRoles, icon: "qrcode" },
  {
    label: "Audit",
    path: "/audit",
    roles: [ROLES.ADMIN],
    icon: "clipboard-check",
  },
  {
    label: "Incident",
    path: "/report",
    roles: allRoles,
    icon: "triangle-exclamation",
  },
  { label: "Transfer", path: "/transfer", roles: allRoles, icon: "right-left" },
  {
    label: "Custodian",
    path: "/custodian",
    roles: [ROLES.ADMIN],
    icon: "user-shield",
  },
  { label: "Room", path: "/room", roles: [ROLES.ADMIN], icon: "door-closed" },
];

function Navbar({
  children,
  title = "ASSET MANAGEMENT SYSTEM",
  userName = "User",
  userEmail = "",
  userRole = "admin",
  navItems = defaultNavItems,
  activePath = "/dashboard",
  onNavigate = () => {},
  onLogout = () => {},
  defaultSidebarOpen = false,
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);

  const [theme, setTheme] = useState(
    () => localStorage.getItem("cict-ams-theme") || "light",
  );

  useEffect(() => {
    localStorage.setItem("cict-ams-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const filteredNavItems = navItems.filter((item) =>
    item.roles ? item.roles.includes(userRole) : true,
  );

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="layout-wrapper" data-theme={theme}>
      {/* logout modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        userEmail={userEmail}
      />
      {/*COLLUMN 1 SIDEBAR */}
      <aside
        className={`sidebar
            ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}
        `}
      >
        {/*LOGO — click toggles dark/light mode*/}
        <div
          className="sidebar-logo-area"
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleTheme();
            }
          }}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          <img src={logo} alt="CICT Logo" className="sidebar-logo-img" />
          <p className="sidebar-logo-text">CICT-AMS</p>
        </div>

        {/*NAV PATHS*/}
        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <NavButton
              key={item.path}
              label={item.label}
              icon={item.icon}
              isActive={activePath.startsWith(item.path)}
              onClick={() => {
                onNavigate(item.path);
                setSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        {/*FOOTER*/}
        <div className="sidebar-footer">
          <button className="logout-sidebar-btn" onClick={handleLogoutClick}>
            <span>
              <FontAwesomeIcon
                icon="fa-solid fa-arrow-right-from-bracket"
                flip="horizontal"
              />
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/*sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/*COLLUMN2 TOPNAV && CONTENT */}
      <div className="right-column">
        {/*-TOPNAV-*/}
        <header className="top-navbar">
          {/*BURGER BTN (mobile only)*/}
          <button
            className={`burger-btn`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon="fa-solid fa-bars" />
          </button>

          {/* title */}
          <h1 className="app-title">{title}</h1>

          {/* user info */}
          <div
            className="navbar-right navbar-right-tooltip"
            onClick={() => navigate("/profile")}
            aria-label="Go to profile"
          >
            <div className="user-info">
              <span className="user-role">{userRole}</span>
              <span className="user-name">{userName}</span>
            </div>
            <FontAwesomeIcon
              icon="fa-solid fa-circle-user"
              style={{ fontSize: "36px" }}
            />
          </div>
        </header>

        {/* main content */}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

Navbar.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  userName: PropTypes.string,
  userEmail: PropTypes.string,
  userRole: PropTypes.string,
  navItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    }),
  ),
  activePath: PropTypes.string,
  onNavigate: PropTypes.func,
  onLogout: PropTypes.func,
  defaultSidebarOpen: PropTypes.bool,
};

export default Navbar;
