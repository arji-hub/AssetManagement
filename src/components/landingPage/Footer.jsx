import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">BSU Asset Management</div>

      <nav className="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Institutional Profile</a>
        <a href="#">Contact IT Support</a>
      </nav>

      <div className="footer-copyright">
        © 2024 Bulacan State University - CICT. All rights reserved.
      </div>
    </footer>
  );
}
export default Footer;
