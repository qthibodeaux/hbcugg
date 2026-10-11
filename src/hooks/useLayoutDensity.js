import { createContext, createElement, useContext, useMemo } from "react";
import { useBreakpointValue } from "@chakra-ui/react";

export const LAYOUT_DENSITY = {
  MOBILE: "mobile",
  COMPACT: "compact",
  STANDARD: "standard",
};

export const getLayoutDensity = ({ breakpoint = "base", hasSidebar = false } = {}) => {
  if (breakpoint === "base" || breakpoint === "sm") return LAYOUT_DENSITY.MOBILE;
  if (breakpoint === "md") return LAYOUT_DENSITY.COMPACT;
  if (breakpoint === "lg") return hasSidebar ? LAYOUT_DENSITY.COMPACT : LAYOUT_DENSITY.STANDARD;
  return LAYOUT_DENSITY.STANDARD;
};

const LayoutDensityContext = createContext({
  density: LAYOUT_DENSITY.STANDARD,
  breakpoint: "lg",
  hasSidebar: false,
  isMobile: false,
  isCompact: false,
  isStandard: true,
});

export const LayoutDensityProvider = ({ hasSidebar = false, children }) => {
  const breakpoint = useBreakpointValue(
    { base: "base", sm: "sm", md: "md", lg: "lg", xl: "xl", "2xl": "2xl" },
    { fallback: "lg" },
  );

  const value = useMemo(() => {
    const density = getLayoutDensity({ breakpoint, hasSidebar });
    return {
      density,
      breakpoint,
      hasSidebar,
      isMobile: density === LAYOUT_DENSITY.MOBILE,
      isCompact: density === LAYOUT_DENSITY.COMPACT,
      isStandard: density === LAYOUT_DENSITY.STANDARD,
    };
  }, [breakpoint, hasSidebar]);

  return createElement(LayoutDensityContext.Provider, { value }, children);
};

export const useLayoutDensity = () => useContext(LayoutDensityContext);

export default useLayoutDensity;
