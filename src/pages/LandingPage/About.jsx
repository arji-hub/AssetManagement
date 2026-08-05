import { useRef } from "react";
import { useSectionNav } from "../../hooks/landing/useSectionNav";
import Header from "../../components/landingPage/Header";
import Footer from "../../components/landingPage/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faUserShield,
  faClipboardCheck,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import "./About.css";

const FEATURES = [
  {
    icon: faQrcode,
    title: "Instant Asset Lookup",
    description:
      "Scan any CICT QR tag to instantly pull up an asset's history, condition, and current custodian — no account needed.",
  },
  {
    icon: faUserShield,
    title: "Exclusive Faculty Access",
    description:
      "A dedicated, interactive system built for CICT faculty and staff at BulSU main campus, secured behind role-based login.",
  },
  {
    icon: faClipboardCheck,
    title: "QR-Powered Auditing",
    description:
      "Run room audits by scanning asset QR tags directly, flagging discrepancies in real time and cutting manual checklist work.",
  },
  {
    icon: faChartLine,
    title: "Live Monitoring & Management",
    description:
      "Track transfers, reports, and asset status across every room and custodian from one centralized dashboard.",
  },
];

function About() {
  const sectionRefs = {
    features: useRef(null),
  };

  const { goToSection, consumeScrollIntent } = useSectionNav(sectionRefs);
  consumeScrollIntent(sectionRefs);

  return (
    <div className="about-page">
      <Header onNavigate={goToSection} />
      <div className="page-content">
        <h1>About CICT Asset Management System</h1>

        <section ref={sectionRefs.features} className="features-section">
          <div className="section-title">
            <h2>What the System Offers</h2>
            <p>
              Built for CICT — from asset lookup to full lifecycle management.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <div className="feature-card__icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__description">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default About;