import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

const SECTION_ROUTES = {
  hero: "/",
  campus: "/",
  qr: "/",
  features: "/about",
};

export function useSectionNav(localRefs) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollTo = (section, refsOverride) => {
    const refs = refsOverride || localRefs;
    refs?.[section]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const goToSection = (section) => {
    const targetRoute = SECTION_ROUTES[section];

    if (targetRoute === location.pathname) {
      // already on the right page — just scroll
      scrollTo(section);
    } else {
      // navigate there, then scroll once mounted
      navigate(targetRoute, { state: { scrollTo: section } });
    }
  };

  // call this in each page that owns refs, once on mount
  const consumeScrollIntent = (refs) => {
    useEffect(() => {
      if (location.state?.scrollTo) {
        requestAnimationFrame(() => scrollTo(location.state.scrollTo, refs));
        navigate(location.pathname, { replace: true, state: {} });
      }
    }, []);
  };

  return { goToSection, consumeScrollIntent };
}
