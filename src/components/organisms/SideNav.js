import { memo, useCallback, useRef, useState } from "react";
import { Box, Flex, Grid, Text, VStack, Image, IconButton, Spinner } from "@chakra-ui/react";
import { LayoutGrid, List, Lock, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideNavGameButton } from "./SideNavGameButton";
import { ThemeSwitch } from "./ThemeSwitch";
import { THEME_SWITCH_ENABLED } from "../../theme/colorScheme";

const DEFAULT_ACCENT = "#E53E3E";

const SIDE_NAV_SKELETON_CSS = `
@keyframes sideNavSkeletonShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
/* Team block. Normal: logo (switcher beside it) over the full name and the
   conference · division line. Narrow sidebar: just the logo and switcher. */
.snv-team-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas: "logo switch" "name name";
  row-gap: 0.6rem;
  column-gap: 0.75rem;
}
.snv-team-logo { grid-area: logo; }
.snv-team-name { grid-area: name; }
.snv-team-switch { grid-area: switch; justify-self: end; align-self: start; }
@container (max-width: 205px) {
  .snv-team-head { grid-template-areas: "logo switch"; }
  .snv-team-name { display: none; }
}
`;

// ─── Hub Header Block (generic, non-team hubs) ──────────────────────────────
// Kept deliberately quiet — a flat surface-color panel, small logo-or-initial
// avatar, thin two-color accent bar. Team hubs get their own bold header
// (TeamHubBlock below) instead of this; rendering both would be two stacked
// team-color bars for the same identity. See inspo/sidebar inspo review,
// 2026-08-27 — HubButton.js is this component's visual reference.
const HubHeaderBlock = memo(({ stack }) => {
  if (!stack || stack.length === 0) return null;
  const entity = stack[0];
  if (entity.id === "team") return null;

  const primary = entity.primary || DEFAULT_ACCENT;
  const secondary = entity.secondary || primary;
  const initial = (entity.shortName || entity.label || "?").slice(0, 2);

  return (
    <Box mb={4}>
      <Flex align="center" gap={3} p={4} bg="bg.secondary">
        {entity.logo ? (
          <Box w={9} h={9} minW={9} display="flex" alignItems="center" justifyContent="center">
            <Image src={entity.logo} alt="" w="full" h="full" objectFit="contain" />
          </Box>
        ) : (
          <Flex
            align="center"
            justify="center"
            w={9}
            h={9}
            minW={9}
            bg={primary}
            borderRadius="lg"
            color="white"
            fontWeight="black"
            fontSize="sm"
            boxShadow="sm"
          >
            {initial}
          </Flex>
        )}
        <Box minW={0}>
          <Text
            fontSize="clamp(0.8rem, 6.8cqw, 1.09rem)"
            fontWeight="extrabold"
            letterSpacing="widest"
            color="text.primary"
            textTransform="uppercase"
            lineHeight="1.25"
          >
            {entity.label}
          </Text>
          {entity.breadcrumb && (
            <Text fontSize="0.78rem" fontWeight="bold" letterSpacing="wider" color="text.muted" mt={0.5}>
              {entity.breadcrumb}
            </Text>
          )}
        </Box>
      </Flex>
      <Flex w="full" h="3px">
        <Box flex="1" bg={primary} />
        <Box flex="1" bg={secondary} />
      </Flex>
    </Box>
  );
});

HubHeaderBlock.displayName = "HubHeaderBlock";

// ─── Nav Item ────────────────────────────────────────────────────────────────
// Bigger, bolder shape ported from inspo/sidebar inspo/SidebarButtons/
// SidebarButton.js (2026-08-27): heavier weight, thicker active border, tinted
// active background. Kept the tint color driven by item.accent (already
// threaded through by useRouteSideNav for team/hub context) instead of the
// inspo's hardcoded brand red, so team pages tint with the team's own color.
const NavItem = memo(({ item, depth = 0 }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = item.active ?? pathname === item.path;
  const isIndented = item.indent || depth > 0;
  const accent = item.accent || DEFAULT_ACCENT;

  const handleClick = useCallback(() => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
  }, [item, navigate]);

  const baseStyle = {
    w: "full",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    py: isIndented ? 5 : 3.5,
    // Sized off the sidebar's own width (it is a size container), so labels
    // scale as the sidebar narrows instead of jumping at breakpoints.
    px: isIndented ? "clamp(0.6rem, 7.8cqw, 1.25rem)" : "clamp(0.5rem, 6.3cqw, 1rem)",
    fontSize: isIndented ? "clamp(0.76rem, 6.65cqw, 1.06rem)" : "clamp(0.72rem, 6.15cqw, 0.98rem)",
    fontWeight: isIndented ? "bold" : "extrabold",
    letterSpacing: "0.03em",
    lineHeight: "1.25",
    color: isActive ? "text.primary" : isIndented ? "text.secondary" : "text.primary",
    bg: isActive ? `${accent}26` : "transparent",
    borderLeft: "3px solid",
    borderColor: isActive ? accent : "transparent",
    transition: "all 0.15s ease",
    cursor: "pointer",
    _hover: { bg: isActive ? `${accent}33` : "whiteAlpha.50" },
    position: "relative",
  };

  // Locked: shown so the section's shape stays visible, but not a link.
  if (item.locked) {
    return (
      <Box {...baseStyle} as="div" aria-disabled="true" color="text.muted" bg="transparent" borderColor="transparent" cursor="not-allowed" _hover={{}} opacity={0.6}>
        <Text textTransform="uppercase" lineHeight="1.25" minW={0} overflowWrap="break-word">
          {item.label}
        </Text>
        <Box as={Lock} boxSize="0.8em" flexShrink={0} ml={2} />
      </Box>
    );
  }

  return (
    <Box as="button" onClick={handleClick} {...baseStyle}>
      <Text textTransform="uppercase" lineHeight="1.25" minW={0} overflowWrap="break-word">
        {item.label}
      </Text>
    </Box>
  );
});

NavItem.displayName = "NavItem";

// ─── Team Hub Block ──────────────────────────────────────────────────────────
// Consolidates what the inspo split across SchoolButton (identity block) and
// SchoolHubSwitcher (toggle header) into one bar — a team page only gets one
// bold team-color header, and that header doubles as the switch-team trigger.
// Toggling swaps this team's own tabs for a grid of every team's real logo;
// no simulated loading delay (the inspo's setTimeout never gated anything
// visible, so there was nothing worth keeping from it).
const TeamHubBlock = memo(({ team, switcher }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const loadedCountRef = useRef(0);
  const primary = team.primary || switcher.accent || DEFAULT_ACCENT;
  const meta = [team.conference, team.division].filter(Boolean).join(" • ");

  // Same load-gated reveal as the mobile switcher: hold the real grid hidden
  // until every logo has actually settled, so the whole set fades in at once
  // instead of tiles popping in one by one. Tied to real onLoad/onError
  // rather than a guessed timer, and onError counts so it can't hang.
  const openGrid = () => {
    loadedCountRef.current = 0;
    setGridReady(false);
    setShowGrid(true);
  };

  const handleTileSettled = () => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= switcher.teams.length) setGridReady(true);
  };

  return (
    <Box mt={2} mb={4}>
      <style>{SIDE_NAV_SKELETON_CSS}</style>
      {/* Wide: logo · name · switcher in one row. Narrow (see the container
          query in SIDE_NAV_SKELETON_CSS): logo and switcher share the top row,
          the abbreviation and conference line run full width underneath. */}
      <Box className="snv-team-head" p={4} bg={primary}>
        {team.logo && (
          <Box
            className="snv-team-logo"
            w={11}
            h={11}
            minW={11}
            bg="white"
            borderRadius="lg"
            p={1.5}
            boxShadow="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image src={team.logo} alt="" w="full" h="full" objectFit="contain" />
          </Box>
        )}
        <Box className="snv-team-name" minW={0}>
          <Text
            color="white"
            fontWeight="black"
            fontSize="clamp(0.9rem, 8.2cqw, 1.31rem)"
            letterSpacing="tight"
            lineHeight="1.25"
          >
            {team.label}
          </Text>
          {meta && (
            <Text color="whiteAlpha.800" fontSize="clamp(0.62rem, 5cqw, 0.78rem)" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" mt={0.5}>
              {meta}
            </Text>
          )}
        </Box>
        <IconButton
          className="snv-team-switch"
          aria-label={showGrid ? "Show team menu" : "Switch team"}
          onClick={() => (showGrid ? setShowGrid(false) : openGrid())}
          size="sm"
          variant="ghost"
          color="white"
          flexShrink={0}
          _hover={{ bg: "whiteAlpha.200" }}
        >
          {showGrid ? <List size={16} /> : <LayoutGrid size={16} />}
        </IconButton>
      </Box>

      {showGrid ? (
        <Box position="relative" bg="bg.secondary">
          <Grid
            templateColumns="repeat(3, 1fr)"
            gap={1}
            p={3}
            opacity={gridReady ? 1 : 0}
            transition="opacity 0.2s ease"
            pointerEvents={gridReady ? "auto" : "none"}
          >
            {switcher.teams.map((t) => (
              <Box
                key={t.id}
                as="button"
                onClick={() => {
                  switcher.onTeamClick(t.id);
                  setShowGrid(false);
                }}
                w={12}
                h={12}
                mx="auto"
                borderRadius="md"
                p={1.5}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={t.id === switcher.teamId ? "whiteAlpha.100" : "transparent"}
                opacity={t.id === switcher.teamId ? 1 : 0.55}
                _hover={{ opacity: 1, bg: "whiteAlpha.100" }}
                transition="all 0.15s"
                title={t.name}
              >
                <Image
                  src={t.logo}
                  alt={t.name}
                  w="full"
                  h="full"
                  objectFit="contain"
                  onLoad={handleTileSettled}
                  onError={handleTileSettled}
                />
              </Box>
            ))}
          </Grid>

          {!gridReady && (
            <>
              <Grid position="absolute" inset={0} templateColumns="repeat(3, 1fr)" gap={1} p={3} pointerEvents="none">
                {switcher.teams.map((t) => (
                  <Box
                    key={t.id}
                    w={12}
                    h={12}
                    mx="auto"
                    borderRadius="md"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.06) 75%)",
                      backgroundSize: "300% 100%",
                      animation: "sideNavSkeletonShimmer 1.2s linear infinite",
                    }}
                  />
                ))}
              </Grid>
              <Flex
                position="absolute"
                inset={0}
                align="center"
                justify="center"
                direction="column"
                gap={2}
                pointerEvents="none"
                bg="blackAlpha.500"
              >
                <Spinner size="sm" color={primary} />
                <Text fontSize="2xs" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest">
                  Loading Teams
                </Text>
              </Flex>
            </>
          )}
        </Box>
      ) : (
        <VStack gap={0} align="stretch">
          {switcher.tabs.map((tab) => (
            <NavItem key={tab.id} item={{ ...tab, accent: primary }} />
          ))}
        </VStack>
      )}
    </Box>
  );
});

TeamHubBlock.displayName = "TeamHubBlock";

// ─── Venue Hub Block ─────────────────────────────────────────────────────────
// TeamHubBlock catered to stadiums. Same shape — color-bar header that
// doubles as the switch trigger, toggling to a tile grid — but the header
// wears the selected venue's home-team color (slate when nothing is picked
// or the site is neutral), campus tiles are the home team's real logo, and
// the neutral sites follow as initials tiles since they have no mark.
const NEUTRAL_ACCENT = "#2D3748";
const venueInitials = (name) =>
  String(name ?? "")
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(at|of|the|and)$/i.test(w))
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 3);

const VenueHubBlock = memo(({ switcher }) => {
  const [showGrid, setShowGrid] = useState(false);
  const primary = switcher.accent || NEUTRAL_ACCENT;
  const hasVenue = Boolean(switcher.venueId);

  const tileStyle = (active) => ({
    w: 12,
    h: 12,
    mx: "auto",
    borderRadius: "md",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bg: active ? "whiteAlpha.100" : "transparent",
    opacity: active ? 1 : 0.55,
    _hover: { opacity: 1, bg: "whiteAlpha.100" },
    transition: "all 0.15s",
  });

  const pick = (id) => {
    switcher.onVenueClick(id);
    setShowGrid(false);
  };

  return (
    <Box mt={2} mb={4}>
      <Flex align="center" justify="space-between" gap={2} p={4} bg={primary}>
        <Flex align="center" gap={3} minW={0} as="button" onClick={switcher.onClick} textAlign="left">
          <Box
            w={11}
            h={11}
            minW={11}
            bg="white"
            borderRadius="lg"
            p={1.5}
            boxShadow="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={primary}
          >
            {switcher.logo ? (
              <Image src={switcher.logo} alt="" w="full" h="full" objectFit="contain" />
            ) : (
              <MapPin size={22} />
            )}
          </Box>
          <Box minW={0}>
            <Text
              color="white"
              fontWeight="black"
              fontSize="clamp(0.85rem, 7cqw, 1.13rem)"
              letterSpacing="tight"
              lineHeight="1.15"
              lineClamp={2}
            >
              {switcher.label}
            </Text>
            {switcher.meta && (
              <Text color="whiteAlpha.800" fontSize="0.72rem" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" lineClamp={1}>
                {switcher.meta}
              </Text>
            )}
          </Box>
        </Flex>
        <IconButton
          aria-label={showGrid ? "Hide venues" : "Switch venue"}
          onClick={() => setShowGrid((v) => !v)}
          size="sm"
          variant="ghost"
          color="white"
          flexShrink={0}
          _hover={{ bg: "whiteAlpha.200" }}
        >
          {showGrid ? <List size={16} /> : <LayoutGrid size={16} />}
        </IconButton>
      </Flex>

      {showGrid ? (
        <Box bg="bg.secondary" pb={2}>
          <Text px={3} pt={3} pb={1} fontSize="0.6rem" fontWeight="black" color="text.muted" letterSpacing="0.3em" textTransform="uppercase">
            Campus
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={1} px={3}>
            {switcher.campus.map((v) => (
              <Box key={v.id} as="button" onClick={() => pick(v.id)} p={1.5} title={v.name} {...tileStyle(v.id === switcher.venueId)}>
                {v.logo ? (
                  <Image src={v.logo} alt={v.name} w="full" h="full" objectFit="contain" />
                ) : (
                  <Text fontSize="0.7rem" fontWeight="black" color="white">{venueInitials(v.name)}</Text>
                )}
              </Box>
            ))}
          </Grid>
          <Text px={3} pt={3} pb={1} fontSize="0.6rem" fontWeight="black" color="text.muted" letterSpacing="0.3em" textTransform="uppercase">
            Neutral sites
          </Text>
          <Grid templateColumns="repeat(3, 1fr)" gap={1} px={3}>
            {switcher.neutral.map((v) => (
              <Box
                key={v.id}
                as="button"
                onClick={() => pick(v.id)}
                title={v.name}
                border="1px solid"
                borderColor="whiteAlpha.200"
                {...tileStyle(v.id === switcher.venueId)}
              >
                <Text fontSize="0.7rem" fontWeight="black" color="white" letterSpacing="0.05em">{venueInitials(v.name)}</Text>
              </Box>
            ))}
          </Grid>
        </Box>
      ) : hasVenue ? (
        <VStack gap={0} align="stretch">
          <NavItem item={{ id: "all-stadiums", label: "ALL STADIUMS", indent: true, active: false, accent: primary, onClick: () => switcher.onVenueClick(null) }} />
        </VStack>
      ) : null}
    </Box>
  );
});

VenueHubBlock.displayName = "VenueHubBlock";

// ─── SideNav ─────────────────────────────────────────────────────────────────

const SideNav = ({ navState }) => {
  const { stack = [], items = [] } = navState ?? {};
  const navigate = useNavigate();

  if (items.length === 0) return null;

  const teamEntity = stack[0]?.id === "team" ? stack[0] : null;

  return (
    <Box
      as="aside"
      position="fixed"
      left={0}
      top="var(--app-header-height, 64px)"
      bottom={0}
      w={{ base: 0, md: "var(--sidebar-w)" }}
      containerType="inline-size"
      bg="bg.secondary"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      overflowY="auto"
      zIndex={20}
      display={{ base: "none", md: "flex" }}
      flexDirection="column"
      css={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { bg: "whiteAlpha.200", borderRadius: "2px" },
      }}
    >
      <HubHeaderBlock stack={stack} />

      <VStack gap={0} align="stretch" px={2} flex="1 0 auto">
        {items.map((item) => {
          if (item.type === "teamHubSwitcher") {
            return <TeamHubBlock key={item.id} team={item.team ?? teamEntity} switcher={item} />;
          }
          if (item.type === "venueHubSwitcher") {
            return <VenueHubBlock key={item.id} switcher={item} />;
          }
          if (item.type === "game" && item.gameData) {
            return (
              <Box key={item.id} pl={4}>
                <SideNavGameButton
                  gameData={item.gameData}
                  isActive={item.active}
                  onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
                />
              </Box>
            );
          }
          return (
            <NavItem
              key={item.id}
              item={item}
            />
          );
        })}
      </VStack>

      {/* Light / Night — pinned to the bottom of the sidebar, under the items. */}
      {THEME_SWITCH_ENABLED && (
        <Box position="sticky" bottom={0} px={2} py={2.5} bg="bg.secondary" borderTop="1px solid" borderColor="line">
          <ThemeSwitch />
        </Box>
      )}
    </Box>
  );
};

export default SideNav;
