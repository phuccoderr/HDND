import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export type ScreenSplitMode = "mobile" | "tablet" | "desktop";

export interface ScreenSplitState {
  mode: ScreenSplitMode;
  columns: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

function getScreenSplitMode(width: number): ScreenSplitMode {
  if (width < MOBILE_BREAKPOINT) return "mobile";
  if (width < TABLET_BREAKPOINT) return "tablet";
  return "desktop";
}

export function useScreenSplit(): ScreenSplitState {
  const [mode, setMode] = useState<ScreenSplitMode>(() => {
    if (typeof window === "undefined") return "desktop";
    return getScreenSplitMode(window.innerWidth);
  });

  useEffect(() => {
    const updateMode = () => {
      setMode(getScreenSplitMode(window.innerWidth));
    };

    const mobileQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );
    const tabletQuery = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px)`,
    );

    const handleChange = () => updateMode();

    mobileQuery.addEventListener?.("change", handleChange);
    tabletQuery.addEventListener?.("change", handleChange);
    window.addEventListener("resize", updateMode);

    updateMode();

    return () => {
      mobileQuery.removeEventListener?.("change", handleChange);
      tabletQuery.removeEventListener?.("change", handleChange);
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  const columns = mode === "desktop" ? 3 : mode === "tablet" ? 2 : 1;

  return {
    mode,
    columns,
    isMobile: mode === "mobile",
    isTablet: mode === "tablet",
    isDesktop: mode === "desktop",
  };
}
