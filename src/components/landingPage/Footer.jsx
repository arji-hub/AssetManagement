import "./Footer.css";
import elib from "../../assets/image/elib.png";
import bulsuLogo from "../../assets/logo/bulsu-white.png";
import bulsuLogoGold from "../../assets/logo/bulsu-gold.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faFacebook } from "@fortawesome/free-brands-svg-icons";

function Footer() {
  const handleClick = () => {
    alert("This feature has not been implemented yet.");
  };

  return (
    <footer className="footer" style={{ backgroundImage: `url(${elib})` }}>
      <div className="footer-logo">BulSU CICT Asset Management</div>

      <div className="footer-socials">
        <a
          href="https://github.com/arji-hub/AssetManagement"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Repository"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>

        <a
          href="https://www.bulsu.edu.ph/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bulacan State University Website"
          className="footer-logo-link"
        >
          <img
            src={bulsuLogo}
            alt="BulSU"
            className="footer-social-logo logo-default"
          />
          <img
            src={bulsuLogoGold}
            alt=""
            className="footer-social-logo logo-hover"
            aria-hidden="true"
          />
        </a>

        <a
          href="https://www.facebook.com/BulsuCICT.official"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook Page"
        >
          <FontAwesomeIcon icon={faFacebook} />
        </a>
      </div>

      <div className="footer-copyright">
        © 2026 BulSU CICT - BSIT 4GG2 Grp-5. All rights reserved.
      </div>
    </footer>
  );
}
export default Footer;
