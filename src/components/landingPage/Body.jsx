import bulsuGate from "../../assets/image/bulsuGate.png";
import "./Body.css";

function Body({ heroRef, featuresRef }) {
  return (
    <main className="body">
      {/* ================= HERO ================= */}

      <section ref={heroRef} className="hero-section">
        <div className="hero-background">
          <img src={bulsuGate} alt="Bulacan State University" />

          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <h1>Institutional Asset Control</h1>

          <p>
            Secure, track, and manage university infrastructure with precision.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Access Dashboard</button>

            <button className="secondary-btn">Public Directory</button>
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
            <img src="/images/main-building.jpg" alt="" />

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
            <img src="/images/pimentel.jpg" alt="" />

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
