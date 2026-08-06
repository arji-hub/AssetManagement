// src/hooks/landing/useScrollReveal.js
import { useEffect, useRef, useState } from "react";

/**
 * Custom scroll-based visibility system.
 * Recalculates on every scroll/resize using getBoundingClientRect,
 * so the trigger points are always relative to the *current* viewport —
 * accurate across screen sizes, and reversible both ways: scrolling down
 * reveals a section, scrolling back up past it hides it again (and it
 * re-reveals if you scroll back down).
 *
 * @param {Object} refs - map of key -> ref, e.g. { system: ref1, mission: ref2 }
 * @param {Object} [options]
 * @param {number} [options.enterAt=0.85] - fraction of viewport height the section's
 *   top must cross (from the bottom) before it's considered visible
 * @param {number} [options.exitAt=0.1] - fraction of viewport height the section's
 *   bottom must stay below before it's considered scrolled past
 */
export function useScrollReveal(refs, { enterAt = 0.85, exitAt = 0.1 } = {}) {
  const [visibility, setVisibility] = useState(() =>
    Object.keys(refs).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
  );

  // keep latest refs/options available inside the listener without
  // re-subscribing scroll/resize on every render
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const optionsRef = useRef({ enterAt, exitAt });
  optionsRef.current = { enterAt, exitAt };

  const rafId = useRef(null);

  useEffect(() => {
    const calculate = () => {
      const vh = window.innerHeight;
      const { enterAt, exitAt } = optionsRef.current;
      const currentRefs = refsRef.current;
      const next = {};

      for (const key of Object.keys(currentRefs)) {
        const el = currentRefs[key].current;
        if (!el) {
          next[key] = false;
          continue;
        }
        const rect = el.getBoundingClientRect();
        next[key] = rect.top <= vh * enterAt && rect.bottom >= vh * exitAt;
      }

      setVisibility((prev) => {
        const changed = Object.keys(next).some((k) => next[k] !== prev[k]);
        return changed ? next : prev;
      });

      rafId.current = null;
    };

    const onScrollOrResize = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(calculate);
      }
    };

    calculate(); // set initial state on mount

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return visibility;
}