import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 560;

export default function useResponsivePageSize(
  desktopSize = 20,
  mobileSize = 10,
  breakpoint = MOBILE_BREAKPOINT,
) {
  const getSize = () =>
    typeof window !== "undefined" && window.innerWidth <= breakpoint
      ? mobileSize
      : desktopSize;

  const [pageSize, setPageSize] = useState(getSize);

  useEffect(() => {
    let frame;
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setPageSize(getSize()));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopSize, mobileSize, breakpoint]);

  return pageSize;
}
