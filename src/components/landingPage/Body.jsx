import bulsuGate from "../../assets/image/bulsuGate.png";
import pimentel from "../../assets/image/pimentel.png";
import elib from "../../assets/image/elib.png";
import CICTLOGO from "../../assets/logo/CICTLOGO.png";
import BULSULOGO from "../../assets/logo/BULSULOGO.png";
import { useNavigate } from "react-router-dom";
import "./Body.css";

function Body({ heroRef, featuresRef }) {
  const navigate = useNavigate();
  return (
    <main className="body">
      {/* ================= HERO ================= */}

      <section ref={heroRef} className="hero-section">
        <div className="hero-background">
          <img src={bulsuGate} alt="Bulacan State University" />

          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-logo">
            <img src={CICTLOGO} alt="CICT Logo" className="cict-logo" />
            <img src={BULSULOGO} alt="BULSU Logo" className="bulsu-logo" />
          </div>
          <h1>Asset Management System</h1>

          <p>"Every asset accounted for, every byte in its place."</p>

          <div className="hero-buttons">
            <button
              className="primary-btn"
              onClick={() => navigate("/login?view=qr")}
            >
              Scan Asset QR Code
            </button>
          </div>
        </div>
      </section>

      {/* ================= CAMPUS ================= */}

      <section ref={featuresRef} className="campus-section">
        <div className="section-title">
          <h2>Campus Presence</h2>

          <p>Monitoring key institutional facilities across the university.</p>
        </div>

        <div className="campus-grid">
          {/* Main Card */}

          <div className="campus-card large">
            <img src={elib} alt="pimentel building" />

            <div className="card-content">
              <span className="badge">Primary Hub</span>

              <h3>Main Administration Building</h3>

              <p>
                Centralized asset tracking for executive offices, IT
                infrastructure and faculty resources.
              </p>

              <div className="card-footer">
                <span>12,450 Assets</span>

                <button>View Details →</button>
              </div>
            </div>
          </div>

          {/* Small Card */}

          <div className="campus-card">
            <img src={pimentel} alt="" />

            <div className="card-content">
              <h3>Pimentel Hall</h3>

              <p>Dedicated tracking for CICT laboratories and equipment.</p>

              <div className="card-footer">
                <span>8,120 Assets</span>

                <button>View Details →</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Body;
