import { useRef } from "react";
import { useSectionNav } from "../../hooks/landing/useSectionNav";
import { useScrollReveal } from "../../hooks/landing/useScrollReveal";
import Header from "../../components/landingPage/Header";
import Footer from "../../components/landingPage/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  SYSTEM_OVERVIEW,
  MISSION,
  FEATURES,
  TEAM_MEMBERS,
} from "../../data/about";
import "./About.css";

function About() {
  const sectionRefs = {
    system: useRef(null),
    mission: useRef(null),
    features: useRef(null),
    team: useRef(null),
  };

  const { goToSection, consumeScrollIntent } = useSectionNav(sectionRefs);
  consumeScrollIntent(sectionRefs);

  const {
    system: systemVisible,
    mission: missionVisible,
    features: featuresVisible,
    team: teamVisible,
  } = useScrollReveal(sectionRefs, { enterAt: 0.85, exitAt: 0.05 });

  return (
    <div className="about-page">
      <Header onNavigate={goToSection} />
      <div className="page-content">
        <section
          ref={sectionRefs.system}
          className={`system-section${systemVisible ? " is-visible" : ""}`}
        >
          <div className="section-title">
            <FontAwesomeIcon
              icon="layer-group"
              className="section-title__icon"
            />
            <h2>{SYSTEM_OVERVIEW.title}</h2>
          </div>
          <div className="prose-card">
            <p className="prose-card__text">{SYSTEM_OVERVIEW.description}</p>
          </div>
        </section>

        <section
          ref={sectionRefs.mission}
          className={`mission-section${missionVisible ? " is-visible" : ""}`}
        >
          <div className="section-title">
            <FontAwesomeIcon icon="bullseye" className="section-title__icon" />
            <h2>{MISSION.title}</h2>
          </div>
          <div className="prose-card">
            <p className="prose-card__text">{MISSION.description}</p>
          </div>
        </section>

        <section
          ref={sectionRefs.features}
          className={`features-section${featuresVisible ? " is-visible" : ""}`}
        >
          <div className="section-title">
            <h2>What the System Offers</h2>
            <p>
              Built for CICT — from asset lookup to full lifecycle management.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((feature, index) => (
              <div
                className="feature-card"
                key={feature.title}
                style={{ "--reveal-index": index }}
              >
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

        <section
          ref={sectionRefs.team}
          className={`team-section${teamVisible ? " is-visible" : ""}`}
        >
          <div className="section-title">
            <h2>Meet the Team</h2>
            <p>The people behind the CICT Asset Management System.</p>
          </div>

          <div className="team-grid">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                className="team-card"
                key={member.name + member.role}
                style={{ "--reveal-index": index }}
              >
                <div className="team-card__header">
                  <h3 className="team-card__name">{member.name}</h3>
                  <span className="team-card__role">{member.role}</span>
                </div>
                <p className="team-card__bio">{member.bio}</p>
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
