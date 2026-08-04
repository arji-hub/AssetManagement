import { useRef } from "react";

import Header from "../../components/landingPage/Header";
import Body from "../../components/landingPage/Body";
import Footer from "../../components/landingPage/Footer";

import "./LandingPage.css";

export default function LandingPage() {
  // Sections
  const heroRef = useRef(null);
  const campusRef = useRef(null);

  // Navigation
  const scrollToSection = (section) => {
    const sections = {
      home: heroRef,
      campus: campusRef,
    };

    sections[section]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="landing-page">
      <Header onNavigate={scrollToSection} />

      <Body heroRef={heroRef} featuresRef={campusRef} />

      <Footer />
    </div>
  );
}
