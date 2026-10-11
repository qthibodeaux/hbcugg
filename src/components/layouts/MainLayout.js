import { Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import SideNav from "../organisms/SideNav";
import { useRouteSideNav } from "../../hooks/useRouteSideNav";
import { LayoutDensityProvider } from "../../hooks/useLayoutDensity";

const SIDEBAR_W = "clamp(150px, 17vw, 255px)";

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const sideNavState = useRouteSideNav(navigate);
  const { stack, items } = sideNavState;
  const hasSidebar = stack.length > 0;
  const hasSideNavContent = stack.length > 0 || items.length > 0;

  return (
    // One width drives both the sidebar and the content offset, so the two can
    // never disagree. Wide: sidebar at 255px, content capped at PAGE_MAX_W (1100px) and
    // centred in what's left (the gap). Below ~1500px the sidebar scales with
    // the window (17vw) alongside the content, bottoming out at 150px; at the
    // 768px mobile cut-off it hides.
    <Box minH="100vh" bg="bg.primary" style={{ "--app-header-height": "64px", "--sidebar-w": SIDEBAR_W }}>
      <LayoutDensityProvider hasSidebar={hasSidebar}>
        {hasSideNavContent && <SideNav navState={sideNavState} />}
        {/* SideNav renders only when it has items, so offset on the same test. */}
        <Box ml={items.length > 0 ? { base: 0, md: "var(--sidebar-w)" } : 0}>
          {children}
        </Box>
      </LayoutDensityProvider>
    </Box>
  );
};

export default MainLayout;
