import { useState } from "react";
import PropTypes from "prop-types";
import NavButton from "../ui/NavButton";
import "./Navbar.css";
import logo from "../../assets/CICTLOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const defaultNavItems = [
  { label: "Dashboard", path: "/dashboard" }, //all users
  { label: "Asset", path: "/asset" },// all users
  { label: "QR Code", path: "/qr" },// all users
  { label: "Audit", path: "/audit" },// admin only
  { label: "Report", path: "/report" },// all users
  { label: "Faculty", path: "/faculty" }, //admin only
  { label: "Room", path: "/room" },// admin only
];

function Navbar({
  children,
  title = "ASSET MANAGEMENT SYSTEM",
  userName = "User",
  userRole = "admin",
  navItems = defaultNavItems,
  activePath = "/dashboard",
  onNavigate = () => {},
  onLogout = () => {},
  defaultSidebarOpen = false,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);

  return (
    <div className="layout-wrapper">
      {/*COLLUMN 1 SIDEBAR */}
      <aside
        className={`sidebar
            ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}
        `}
      >
        {/*LOGO*/}
        <div className="sidebar-logo-area">
          <img src={logo} alt="CICT Logo" className="sidebar-logo-img" />
          <p className="sidebar-logo-text">
            College of Information and Communications Technology
          </p>
        </div>

        {/*NAV PATHS*/}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavButton
              key={item.path}
              label={item.label}
              icon={item.icon}
              isActive={activePath === item.path}
              onClick={() => {
                onNavigate(item.path);
                setSidebarOpen(false);
              }}
            />
          ))}
        </nav>

        {/*FOOTER*/}
        <div className="sidebar-footer">
          <button className="logout-sidebar-btn" onClick={onLogout}>
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
          <div className="navbar-right">
            <div className="user-info">
              <span className="user-role">{userRole}</span>
              <span className="user-name">{userName}</span>
            </div>
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
