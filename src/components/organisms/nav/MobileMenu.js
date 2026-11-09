import { useNavigate, useLocation, Link } from "react-router-dom";
import { useRouteSideNav } from "../../../hooks/useRouteSideNav";
import { useGameCenterFaces } from "./mobileMenu/useGameCenterFaces";
import { useSchoolsFaces } from "./mobileMenu/useSchoolsFaces";
import { useAnalyticsFaces } from "./mobileMenu/useAnalyticsFaces";
import { usePageSnapshot } from "./mobileMenu/usePageSnapshot";
import { DrawerRoot, Portal, DrawerBackdrop, DrawerPositioner, DrawerContent, Flex, Text, Box, IconButton, DrawerBody, Image } from "@chakra-ui/react";
import { Z_BACKDROP, Z_CONTENT, TEAMS, abbr, BRAND } from "./mobileMenu/menuPresentation";
import { TileStyles } from "../../molecules/home/LiveTile";
import { X, Twitter, Instagram, Youtube, Facebook } from "lucide-react";
import { SectionLabel, Band } from "./mobileMenu/MenuPrimitives";

// ── Menu ─────────────────────────────────────────────────────────────────────

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { stack, items } = useRouteSideNav(navigate);

  const gameFaces = useGameCenterFaces();
  const schoolFaces = useSchoolsFaces();
  const analytics = useAnalyticsFaces();

  const close = () => onClose();

  // "You are here" — the breadcrumb and the Here panel on the current band.
  const { pathname } = useLocation();
  const game = items.find((i) => i.type === "game");
  const team = stack[0]?.id === "team" ? stack[0] : null;
  const switcher = items.find((i) => i.type === "teamHubSwitcher");
  // Team tabs carry paths, not an active flag: the longest path that matches
  // the URL is the one you are on (exact tabs only match themselves).
  const teamTabs = (() => {
    const tabs = (switcher?.tabs ?? []).filter((t) => t.label);
    const hit = (t) => {
      const p = t.activePath ?? t.path;
      return t.exact ? pathname === p : pathname === p || pathname.startsWith(`${p}/`) || pathname.startsWith(p);
    };
    const best = tabs.filter(hit).sort((x, y) => (y.activePath ?? y.path).length - (x.activePath ?? x.path).length)[0];
    return tabs.map((t) => ({ ...t, active: t === best }));
  })();
  const activeItems = items.filter((i) => i.active && i.type !== "teamHubSwitcher" && i.type !== "game");
  const pageLabel = teamTabs.find((t) => t.active)?.label ?? (activeItems.length ? activeItems[activeItems.length - 1].label : "Hub");
  const inGames = pathname.startsWith("/game-center") || pathname.startsWith("/game/");
  const inSchools = pathname.startsWith("/schools") || pathname.startsWith("/teams") || pathname.startsWith("/rosters") || pathname.startsWith("/player");
  const inStats = pathname.startsWith("/stats") || pathname.startsWith("/team-analytics") || pathname.startsWith("/player-analytics");

  const crumbFor = (on, section) => {
    if (!on) return null;
    if (section === "Game Center" && game) return game.label;
    if (section === "Schools" && team) return `${team.shortName ?? team.label} · ${pageLabel}`;
    return pageLabel;
  };
  const snapshot = usePageSnapshot({ pathname, isOpen, team });
  const hereFor = (on) => (on ? snapshot : null);

  return (
    <DrawerRoot open={isOpen} onOpenChange={(e) => !e.open && close()} placement="start" modal preventScroll trapFocus={false}>
      <Portal>
        <DrawerBackdrop bg="blackAlpha.900" zIndex={Z_BACKDROP} />
        <DrawerPositioner zIndex={Z_CONTENT}>
          <DrawerContent bg="bg.primary" maxW="100%" w="100%" h="100dvh" borderRadius={0}>
            <TileStyles />
            {/* Top bar — sits where the header sits */}
            <Flex h="var(--app-header-height, 64px)" flexShrink={0} align="center" justify="space-between" px={4} borderBottom="1px solid" borderColor="whiteAlpha.200">
              <Link to="/" onClick={close}>
                <Text fontSize="2xl" fontWeight="black" color="text.primary" letterSpacing="tight">
                  HBCU<Box as="span" color="brand.500">GG</Box>
                </Text>
              </Link>
              <IconButton aria-label="Close menu" onClick={close} variant="ghost" color="white" size="lg" borderRadius="none" _hover={{ bg: "whiteAlpha.100" }}>
                <X size={26} />
              </IconButton>
            </Flex>

            <DrawerBody p={0} overflowY="auto">
              <SectionLabel>Sections</SectionLabel>
              <Flex direction="column" gap={3}>
                <Band title="Game Center" href="/game-center" faces={gameFaces} crumb={crumbFor(inGames, "Game Center")} here={hereFor(inGames)} onNavigate={close} rotateMs={6500} />
                <Band title="Schools" href="/schools" faces={schoolFaces} crumb={crumbFor(inSchools, "Schools")} here={hereFor(inSchools)} onNavigate={close} rotateMs={7500} />
                <Band title="Analytics" href="/stats" faces={analytics.map((a) => a.node)} hrefs={analytics.map((a) => a.href)} crumb={crumbFor(inStats, "Analytics")} here={hereFor(inStats)} onNavigate={close} rotateMs={7000} />
              </Flex>

              {/* The 18 — 6 across, 3 down, flush */}
              <SectionLabel>Teams</SectionLabel>
              <Box display="grid" gridTemplateColumns="repeat(6, minmax(0, 1fr))">
                {TEAMS.map((t) => (
                  <Flex
                    key={t.id}
                    as={Link}
                    to={`/teams/${t.id}`}
                    onClick={close}
                    direction="column"
                    align="center"
                    justify="center"
                    gap={1}
                    aspectRatio="1"
                    bg={`${t.colors.primary}30`}
                    borderRight="1px solid"
                    borderBottom="1px solid"
                    borderColor={`${t.colors.primary}55`}
                    _hover={{ bg: `${t.colors.primary}55`, textDecoration: "none" }}
                  >
                    <Image src={t.logo} alt="" w="58%" h="58%" objectFit="contain" />
                    <Text fontSize="0.62rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>{abbr(t)}</Text>
                  </Flex>
                ))}
              </Box>

              {/* Sign-off */}
              <Box px={4} pt={10} pb={4} textAlign="center">
                {["HBCU", "GRIDIRON", "GLORY"].map((w, i) => (
                  <Text key={w} fontSize="clamp(2.1rem, 12vw, 3.4rem)" fontWeight="black" fontStyle="italic" lineHeight={0.85} letterSpacing="-0.04em" color={i === 2 ? BRAND : "white"}>
                    {w}
                  </Text>
                ))}
              </Box>
              <Flex gap={8} px={4} pt={2} pb={10} justify="center" color="whiteAlpha.600">
                <Twitter size={24} />
                <Instagram size={24} />
                <Youtube size={24} />
                <Facebook size={24} />
              </Flex>
            </DrawerBody>
          </DrawerContent>
        </DrawerPositioner>
      </Portal>
    </DrawerRoot>
  );
};

export default MobileMenu;
