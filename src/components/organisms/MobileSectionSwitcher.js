import { useEffect, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteSideNav } from "../../hooks/useRouteSideNav";
import { BottomSheet } from "./BottomSheet";
import { BANNER_STRIP_BG } from "./BannerControls";

// One-shot CTA on every page load: the chevron bounces once, then a single
// chip previewing one other section grows in white, shifts to the banner's
// own accent color, then shrinks away to nothing — teaches the tap-to-open
// gesture and hints at what's inside without being loud about it. Purely
// decorative (pointer-events none) so it never intercepts taps.
const PEEK_DELAY_MS = 900;
const PEEK_DURATION_MS = 1600;

const PEEK_CSS = `
  @keyframes sectionSwitcherPeek {
    0%   { opacity: 0; transform: scale(0.4); background-color: #FFFFFF; color: #18181B; }
    22%  { opacity: 1; transform: scale(1.3); background-color: #FFFFFF; color: #18181B; }
    50%  { opacity: 1; transform: scale(1.05); background-color: var(--peek-accent); color: #FFFFFF; }
    78%  { opacity: 1; transform: scale(1); background-color: var(--peek-accent); color: #FFFFFF; }
    100% { opacity: 0; transform: scale(0); background-color: var(--peek-accent); color: #FFFFFF; }
  }
  @keyframes sectionSwitcherChevronBounce {
    0%, 100% { transform: translateY(0); }
    20% { transform: translateY(2px); }
    40% { transform: translateY(-3px); }
    60% { transform: translateY(1px); }
    80% { transform: translateY(-1px); }
  }
`;

// Renders the "teamHubSwitcher" item type inline instead of as a single flat
// row — mirrors the desktop SideNav's TeamHubBlock (2026-08-27): the team's
// own tabs (Profile/Schedule/Roster/etc.) by default, toggled to a grid of
// every team's logo for quick team-switching, using the same teams/tabs/
// onTeamClick data useRouteSideNav already builds for the desktop nav.
//
// 2026-08-28 revision: one header row now carries both the team name and the
// mode control (Switch Teams / ← back), instead of two stacked bars — and
// the logo watermark is sized to sit behind the entire block (tabs or grid),
// not just a corner accent, with rows given a semi-transparent black bg so
// the logo reads through behind them instead of being hidden under opaque
// rows. Grid is 6 columns x 3 rows — matches the 6-wide grid pattern already
// used elsewhere on mobile, and still divides the 18 tracked teams evenly.
const GRID_SKELETON_CSS = `
@keyframes teamGridSkeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const TeamHubSwitcherSheetBlock = ({ item, team, pathname, onNavigate }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const loadedCountRef = useRef(0);
  const primary = team?.primary || "#E53E3E";
  const secondary = team?.secondary || primary;

  const openGrid = () => {
    loadedCountRef.current = 0;
    setGridReady(false);
    setShowGrid(true);
  };

  const handleTileSettled = () => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= item.teams.length) setGridReady(true);
  };

  return (
    <Box mt="0.5rem" position="relative" overflow="hidden" borderTop="2px solid" borderColor={secondary}>
      <style>{GRID_SKELETON_CSS}</style>
      {team?.logo && (
        <Image
          src={team.logo}
          alt=""
          position="absolute"
          left="50%"
          top="50%"
          style={{ transform: "translate(-50%, -50%)" }}
          w="85%"
          h="85%"
          objectFit="contain"
          opacity={0.14}
          pointerEvents="none"
        />
      )}

      <Flex align="center" justify="space-between" px="1rem" py="0.7rem" bg={primary} position="relative" zIndex={1}>
        <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.05em">
          {item.label}
        </Text>
        <Box
          as="button"
          type="button"
          onClick={() => (showGrid ? setShowGrid(false) : openGrid())}
          display="flex"
          alignItems="center"
          gap="0.3rem"
        >
          <Text fontSize="0.72rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.05em">
            {showGrid ? "←" : "Switch Teams"}
          </Text>
        </Box>
      </Flex>

      <Box position="relative" zIndex={1}>
        {showGrid ? (
          <Box position="relative">
            {/* minmax(0, 1fr): a plain 1fr won't shrink below a logo's natural
                width, which pushed the sixth column off a phone screen. Flush
                wall, the Team Schedules mobile look: no gaps, square tiles. */}
            <Grid
              templateColumns="repeat(6, minmax(0, 1fr))"
              gap={0}
              p={0}
              opacity={gridReady ? 1 : 0}
              transition="opacity 0.2s ease"
              pointerEvents={gridReady ? "auto" : "none"}
            >
              {item.teams.map((t) => (
                <Box
                  key={t.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    item.onTeamClick?.(t.id);
                    onNavigate();
                  }}
                  aspectRatio="1"
                  minW={0}
                  borderRadius="0"
                  p="0.35rem"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={t.id === item.teamId ? "whiteAlpha.300" : "blackAlpha.400"}
                  border="1px solid"
                  borderColor={t.id === item.teamId ? secondary : "whiteAlpha.100"}
                  borderBottomWidth="0.2rem"
                  borderBottomColor={t.colors?.primary ?? "whiteAlpha.300"}
                  opacity={t.id === item.teamId ? 1 : 0.85}
                  title={t.name}
                >
                  <Image
                    src={t.logo}
                    alt={t.name}
                    w="80%"
                    h="80%"
                    objectFit="contain"
                    onLoad={handleTileSettled}
                    onError={handleTileSettled}
                  />
                </Box>
              ))}
            </Grid>

            {!gridReady && (
              <>
                <Grid
                  position="absolute"
                  inset="0"
                  templateColumns="repeat(6, minmax(0, 1fr))"
                  gap={0}
                  p={0}
                  pointerEvents="none"
                >
                  {item.teams.map((t) => (
                    <Box
                      key={t.id}
                      aspectRatio="1"
                      borderRadius="0"
                      style={{
                        background: "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.06) 75%)",
                        backgroundSize: "300% 100%",
                        animation: "teamGridSkeletonShimmer 1.2s linear infinite",
                      }}
                    />
                  ))}
                </Grid>
                <Flex
                  position="absolute"
                  inset="0"
                  align="center"
                  justify="center"
                  direction="column"
                  gap="0.5rem"
                  pointerEvents="none"
                  bg="blackAlpha.500"
                >
                  <Spinner size="sm" color={secondary} />
                  <Text fontSize="0.65rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.1em">
                    Loading Teams
                  </Text>
                </Flex>
              </>
            )}
          </Box>
        ) : (
          item.tabs.map((tab) => {
            const isActive = tab.active ?? pathname === tab.path;
            return (
              <Box
                key={tab.id}
                as="button"
                type="button"
                onClick={() => {
                  tab.onClick?.();
                  onNavigate();
                }}
                w="full"
                textAlign="left"
                pl="1.75rem"
                pr="1rem"
                py="0.75rem"
                bg={isActive ? "blackAlpha.600" : "blackAlpha.400"}
                borderLeft="3px solid"
                borderLeftColor={isActive ? secondary : "transparent"}
                borderBottom="1px solid"
                borderBottomColor={`${secondary}55`}
              >
                <Text
                  fontSize="0.78rem"
                  fontWeight="bold"
                  color={isActive ? "white" : "whiteAlpha.700"}
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  {tab.label}
                </Text>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

// Mobile stand-in for the desktop SideNav — trigger bar (styled to look like
// it's still part of the banner via the `accent` prop) that opens a bottom
// sheet listing the current hub's sections. Sources its data from the same
// useRouteSideNav() hook MainLayout already feeds to SideNav, so there's no
// separate mobile nav model to keep in sync — reusable on any hub page, not
// just Game Center; the caller just passes the color its own banner uses
// (brand purple on a generic hub banner, a team's own color on a team page).
export const MobileSectionSwitcher = ({ accent = "#A855F7" }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { stack, items: navItems } = useRouteSideNav(navigate);
  // Locked sections (Player Analytics, postponed) stay in the sidebar greyed
  // out; the mobile sheet simply leaves them off.
  const items = navItems.filter((item) => !item.locked && !item.mobileHidden);
  const [isOpen, setIsOpen] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  const activeIndex = items.findIndex((item) => item.active);
  const nextItem = items.length > 1 ? items[(Math.max(activeIndex, 0) + 1) % items.length] : null;

  useEffect(() => {
    if (!nextItem) return undefined;
    const openTimer = setTimeout(() => setIsPeeking(true), PEEK_DELAY_MS);
    const closeTimer = setTimeout(() => setIsPeeking(false), PEEK_DELAY_MS + PEEK_DURATION_MS);
    return () => {
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!items.length) return null;

  // On a team hub page, none of the Schools-level items (Directory/Wiki/
  // Rosters Hub) are ever the active one — without this, the pill fell back
  // to items[0] ("DIRECTORY") no matter which team tab you were actually on.
  // Check the team hub's own tabs for a pathname match first.
  const teamSwitcherItem = items.find((item) => item.type === "teamHubSwitcher");
  const activeTeamTab = teamSwitcherItem?.tabs?.find((tab) => pathname === tab.path);
  const activeItem = items.find((item) => item.active) ?? activeTeamTab ?? teamSwitcherItem ?? items[0];
  const currentLabel = activeItem?.label ?? stack[0]?.breadcrumb ?? stack[0]?.label ?? "Menu";

  return (
    <>
      <style>{PEEK_CSS}</style>
      <Box position="relative" flexShrink={0}>
        <Flex
          as="button"
          type="button"
          onClick={() => setIsOpen(true)}
          align="center"
          gap="0.4rem"
          pl="0.9rem"
          pr="1.5rem"
          py="0.5rem"
          bg={`linear-gradient(110deg, ${accent} 0%, ${BANNER_STRIP_BG} 100%)`}
          borderBottomRightRadius="1.75rem"
          flexShrink={0}
        >
          <Text fontSize="0.75rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
            {currentLabel}
          </Text>
          <Box as="span" display="inline-flex" style={isPeeking ? { animation: "sectionSwitcherChevronBounce 0.6s ease" } : undefined}>
            <ChevronDown size={14} color="white" />
          </Box>
        </Flex>

        {isPeeking && (
          <Flex
            position="absolute"
            top="100%"
            left="0.9rem"
            mt="0.35rem"
            align="center"
            gap="0.35rem"
            px="0.7rem"
            py="0.4rem"
            borderRadius="0"
            boxShadow="0 0.4rem 0.9rem rgba(0,0,0,0.4)"
            pointerEvents="none"
            zIndex={20}
            style={{ "--peek-accent": accent, animation: `sectionSwitcherPeek ${PEEK_DURATION_MS}ms ease` }}
            transformOrigin="top"
          >
            <Text fontSize="0.7rem" fontWeight="black" color="inherit" lineHeight={1}>
              →
            </Text>
            <Text fontSize="0.7rem" fontWeight="black" color="inherit" textTransform="uppercase" letterSpacing="0.04em" lineClamp={1} lineHeight={1}>
              {nextItem.label}
            </Text>
          </Flex>
        )}
      </Box>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={stack[0]?.label ?? "Sections"}>
        <Flex direction="column" py="0.4rem">
          {items.map((item) => {
            if (item.type === "teamHubSwitcher") {
              return (
                <TeamHubSwitcherSheetBlock
                  key={item.id}
                  item={item}
                  team={stack[0]}
                  pathname={pathname}
                  onNavigate={() => setIsOpen(false)}
                />
              );
            }
            return (
              <Box
                key={item.id}
                as="button"
                type="button"
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                w="full"
                textAlign="left"
                px="1rem"
                py="0.85rem"
                bg={item.active ? "whiteAlpha.100" : "transparent"}
                borderLeft="3px solid"
                borderColor={item.active ? accent : "transparent"}
              >
                <Text
                  fontSize="0.85rem"
                  fontWeight="black"
                  color={item.active ? "white" : "whiteAlpha.700"}
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  {item.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};
