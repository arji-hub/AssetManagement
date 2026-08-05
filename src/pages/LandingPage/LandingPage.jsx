import { useRef } from "react";
import { useSectionNav } from "../../hooks/landing/useSectionNav";
import Header from "../../components/landingPage/Header";
import Body from "../../components/landingPage/Body";
import Footer from "../../components/landingPage/Footer";
import "./LandingPage.css";

export default function LandingPage({ previewAsset }) {
  const sectionRefs = {
    hero: useRef(null),
    campus: useRef(null),
    qr: useRef(null),
  };

  const { goToSection, consumeScrollIntent } = useSectionNav(sectionRefs);
  consumeScrollIntent(sectionRefs);

  return (
    <div className="landing-page">
      <Header onNavigate={goToSection} />
      <Body sectionRefs={sectionRefs} previewAsset={previewAsset} />
      <Footer />
    </div>
  );
}