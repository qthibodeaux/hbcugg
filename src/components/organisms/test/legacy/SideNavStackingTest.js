import { useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart2,
  BookOpen,
  Trophy,
  TrendingUp,
  UserCircle,
  ChevronRight,
  Dumbbell,
  Activity,
  GraduationCap,
} from "lucide-react";

// ─── Mock teams — covers short, medium, and long name cases ──────────────────

const MOCK_TEAMS = [
  {
    id: "jsu",
    name: "Jackson State",
    shortName: "JSU",
    conference: "SWAC",
    division: "East",
    primary: "#002147",
    secondary: "#FFFFFF",
    logo: "/assets/jacksonlogo.png",
  },
  {
    id: "famu",
    name: "Florida A&M",
    shortName: "FAMU",
    conference: "SWAC",
    division: "East",
    primary: "#006747",
    secondary: "#F4811F",
    logo: "/assets/famulogo.png",
  },
  {
    id: "pvamu",
    name: "Prairie View A&M",
    shortName: "PVAMU",
    conference: "SWAC",
    division: "West",
    primary: "#4A0082",
    secondary: "#FFC200",
    logo: "/assets/pvlogo.png",
  },
  {
    id: "nccu",
    name: "North Carolina Central",
    shortName: "NCCU",
    conference: "MEAC",
    division: null,
    primary: "#8B0000",
    secondary: "#888B8D",
    logo: "/assets/ncculogo.png",
  },
  {
    id: "scsu",
    name: "South Carolina State",
    shortName: "SCSU",
    conference: "MEAC",
    division: null,
    primary: "#003087",
    secondary: "#F47920",
    logo: "/assets/scsulogo.png",
  },
  {
    id: "alcorn",
    name: "Alcorn State",
    shortName: "Alcorn",
    conference: "SWAC",
    division: "East",
    primary: "#5C068C",
    secondary: "#FFD100",
    logo: "/assets/alclogo.png",
  },
];

const MOCK_PLAYER = { name: "Tyran Davis", subtitle: "WR · #4", initials: "TD" };

// ─── Hub item definitions ─────────────────────────────────────────────────────

const TEAM_HUB_ITEMS = [
  { id: "profile",   label: "Profile",      icon: UserCircle },
  { id: "schedule",  label: "Schedule",     icon: Calendar },
  { id: "roster",    label: "Roster",       icon: Users },
  { id: "coaches",   label: "Coaches",      icon: GraduationCap },
  { id: "wiki",      label: "School Wiki",  icon: BookOpen },
  { id: "standings", label: "Standings",    icon: Trophy },
  { id: "stats",     label: "Stats",        icon: BarChart2 },
];

const ROSTER_HUB_ITEMS = [
  { id: "dash",        label: "Dash",         icon: LayoutDashboard },
  { id: "full-roster", label: "Full Roster",  icon: Users },
  { id: "profile",     label: "Profile",      icon: Activity },
  { id: "stats",       label: "Stats",        icon: BarChart2 },
  { id: "production",  label: "Production",   icon: TrendingUp, soon: true },
];

const PLAYER_HUB_ITEMS = [
  { id: "bio",         label: "Bio & Background", icon: UserCircle },
  { id: "stats",       label: "Stats",            icon: BarChart2 },
  { id: "analytics",   label: "Analytics",        icon: Activity },
  { id: "comparisons", label: "Comparisons",      icon: Dumbbell },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Scale name font down for long team names so it always fits on one line */
const nameFontSize = (name) => {
  const len = name.length;
  if (len <= 8)  return "17px";
  if (len <= 12) return "15px";
  if (len <= 16) return "13px";
  if (len <= 20) return "12px";
  return "11px";
};

/** Build conference label: "SWAC East", "SWAC West", or "MEAC" */
const conferenceLabel = (team) =>
  team.division ? `${team.conference} · ${team.division}` : team.conference;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pinned team identity block — always at the top of the sidebar */
const TeamEntityBlock = ({ team, isClickable, onClick }) => (
  <Box
    as={isClickable ? "button" : "div"}
    w="100%"
    onClick={onClick}
    _hover={isClickable ? { bg: "whiteAlpha.50" } : undefined}
    transition="background 0.15s"
    cursor={isClickable ? "pointer" : "default"}
    overflow="hidden"
  >
    <Flex align="center" gap={3} px={3} pt={3} pb="10px">
      {/* Logo square with primary color bg */}
      <Box
        w="40px"
        h="40px"
        borderRadius="7px"
        bg={team.primary}
        border="1px solid"
        borderColor="whiteAlpha.150"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        overflow="hidden"
        position="relative"
      >
        <Image
          src={team.logo}
          alt={team.shortName}
          w="30px"
          h="30px"
          objectFit="contain"
          fallback={
            <Text fontSize="10px" fontWeight="black" color="white" letterSpacing="tight">
              {team.shortName}
            </Text>
          }
        />
      </Box>

      {/* Name + conference label */}
      <Box textAlign="left" minW={0} flex={1}>
        <Text
          fontSize={nameFontSize(team.name)}
          fontWeight="900"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.03em"
          lineHeight="1.1"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {team.name}
        </Text>
        <Text
          fontSize="9px"
          fontWeight="600"
          color="whiteAlpha.500"
          textTransform="uppercase"
          letterSpacing="0.08em"
          mt="3px"
        >
          {conferenceLabel(team)}
        </Text>
      </Box>
    </Flex>

    {/* Team color stripe — primary left half, secondary right half */}
    <Flex h="3px" w="100%">
      <Box flex={1} bg={team.primary} opacity={0.9} />
      <Box flex={1} bg={team.secondary} opacity={0.9} />
    </Flex>
  </Box>
);

/** Breadcrumb row — appears below the team block as you drill into hubs/players */
const BreadcrumbRow = ({ label, subtitle, initials, image, onClick }) => (
  <Box
    as="button"
    w="100%"
    onClick={onClick}
    _hover={{ bg: "whiteAlpha.50" }}
    transition="background 0.15s"
  >
    <Flex align="center" gap={2} px={3} py="8px">
      {/* Indent connector line */}
      <Box w="12px" flexShrink={0} display="flex" justifyContent="center">
        <Box w="1px" h="18px" bg="whiteAlpha.150" />
      </Box>

      {/* Optional avatar (for player breadcrumb) */}
      {(initials || image) && (
        <Box
          w="22px"
          h="22px"
          borderRadius="full"
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          overflow="hidden"
        >
          {image ? (
            <Image src={image} w="22px" h="22px" objectFit="cover" />
          ) : (
            <Text fontSize="8px" fontWeight="bold" color="whiteAlpha.600">
              {initials}
            </Text>
          )}
        </Box>
      )}

      <Box textAlign="left" minW={0} flex={1}>
        <Text
          fontSize="10px"
          fontWeight="700"
          color="whiteAlpha.700"
          textTransform="uppercase"
          letterSpacing="0.05em"
          whiteSpace="nowrap"
          overflow="hidden"
        >
          {label}
        </Text>
        {subtitle && (
          <Text fontSize="9px" color="whiteAlpha.400" letterSpacing="0.03em">
            {subtitle}
          </Text>
        )}
      </Box>

      <ChevronRight size={10} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
    </Flex>
  </Box>
);

const Divider = () => (
  <Box px={0}>
    <Box h="1px" bg="whiteAlpha.80" />
  </Box>
);

/** Individual nav item */
const NavItem = ({ item, isActive, accent, onClick }) => {
  const Icon = item.icon;
  return (
    <Box
      as="button"
      w="100%"
      onClick={() => !item.soon && onClick?.(item.id)}
      px={3}
      py="9px"
      textAlign="left"
      transition="all 0.12s"
      bg={isActive ? `${accent}28` : "transparent"}
      borderLeft="2px solid"
      borderColor={isActive ? accent : "transparent"}
      _hover={{ bg: isActive ? `${accent}28` : "whiteAlpha.50" }}
      opacity={item.soon ? 0.45 : 1}
      cursor={item.soon ? "not-allowed" : "pointer"}
    >
      <Flex align="center" gap="10px">
        <Box color={isActive ? "white" : "whiteAlpha.700"} flexShrink={0}>
          <Icon size={15} />
        </Box>
        <Text
          fontSize="12px"
          fontWeight={isActive ? "700" : "500"}
          color={isActive ? "white" : "whiteAlpha.900"}
          textTransform="uppercase"
          letterSpacing="0.05em"
          flex={1}
        >
          {item.label}
        </Text>
        {item.soon && (
          <Text fontSize="8px" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="0.08em">
            Soon
          </Text>
        )}
      </Flex>
    </Box>
  );
};

// ─── Full sidebar component ───────────────────────────────────────────────────

export const SideNavStackingDemo = ({
  team,
  context = "team",
  activeItemId,
  onItemClick,
  onTeamClick,
  onRosterClick,
}) => {
  const items =
    context === "team"   ? TEAM_HUB_ITEMS :
    context === "roster" ? ROSTER_HUB_ITEMS :
                           PLAYER_HUB_ITEMS;

  const active = activeItemId ?? items[0]?.id;

  return (
    <Box
      w="255px"
      bg="#0f0f11"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="12px"
      overflow="hidden"
      flexShrink={0}
      display="flex"
      flexDirection="column"
    >
      {/* Team entity — always pinned top */}
      <TeamEntityBlock
        team={team}
        isClickable={context !== "team"}
        onClick={onTeamClick}
      />

      {/* Roster breadcrumb */}
      {(context === "roster" || context === "player") && (
        <>
          <Divider />
          <BreadcrumbRow label="Roster" subtitle="Hub" onClick={onRosterClick} />
        </>
      )}

      {/* Player breadcrumb */}
      {context === "player" && (
        <BreadcrumbRow
          label={MOCK_PLAYER.name}
          subtitle={MOCK_PLAYER.subtitle}
          initials={MOCK_PLAYER.initials}
        />
      )}

      <Divider />

      {/* Hub nav items */}
      <Box flex={1} py={1}>
        {items.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={active === item.id}
            accent={team.primary}
            onClick={onItemClick}
          />
        ))}
      </Box>
    </Box>
  );
};

// ─── Playground ───────────────────────────────────────────────────────────────

export const SideNavStackingPlayground = () => {
  const [selectedTeamId, setSelectedTeamId] = useState("jsu");
  const [context, setContext]     = useState("team");
  const [activeItem, setActiveItem] = useState("profile");

  const team = MOCK_TEAMS.find((t) => t.id === selectedTeamId) ?? MOCK_TEAMS[0];

  const handleItemClick = (id) => {
    if (context === "team" && id === "roster") {
      setContext("roster");
      setActiveItem("dash");
      return;
    }
    setActiveItem(id);
  };

  const handleTeamClick  = () => { setContext("team");   setActiveItem("profile"); };
  const handleRosterClick = () => { setContext("roster"); setActiveItem("dash"); };

  return (
    <Box>
      {/* ── Team selector ── */}
      <Box mb={5}>
        <Text fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
          Team
        </Text>
        <Flex gap={2} flexWrap="wrap">
          {MOCK_TEAMS.map((t) => (
            <Box
              key={t.id}
              as="button"
              px={3}
              py="5px"
              borderRadius="6px"
              fontSize="11px"
              fontWeight="600"
              border="1px solid"
              borderColor={selectedTeamId === t.id ? "whiteAlpha.400" : "whiteAlpha.100"}
              color={selectedTeamId === t.id ? "white" : "whiteAlpha.500"}
              bg={selectedTeamId === t.id ? "whiteAlpha.100" : "transparent"}
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              transition="all 0.12s"
              onClick={() => setSelectedTeamId(t.id)}
            >
              {t.shortName}
            </Box>
          ))}
        </Flex>
      </Box>

      {/* ── Context selector ── */}
      <Box mb={8}>
        <Text fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
          Context
        </Text>
        <Flex gap={2}>
          {[
            { id: "team",   label: "Team Hub" },
            { id: "roster", label: "Roster Hub" },
            { id: "player", label: "Player Page" },
          ].map((opt) => (
            <Box
              key={opt.id}
              as="button"
              px={3}
              py="5px"
              borderRadius="6px"
              fontSize="11px"
              fontWeight="600"
              border="1px solid"
              borderColor={context === opt.id ? "whiteAlpha.400" : "whiteAlpha.100"}
              color={context === opt.id ? "white" : "whiteAlpha.500"}
              bg={context === opt.id ? "whiteAlpha.100" : "transparent"}
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              transition="all 0.12s"
              onClick={() => {
                setContext(opt.id);
                setActiveItem(opt.id === "team" ? "profile" : opt.id === "roster" ? "dash" : "bio");
              }}
            >
              {opt.label}
            </Box>
          ))}
        </Flex>
      </Box>

      {/* ── Three static snapshots + interactive ── */}
      <Flex gap={6} flexWrap="wrap" align="flex-start">
        {[
          { label: "Team Hub",    ctx: "team",   activeId: "profile" },
          { label: "Roster Hub",  ctx: "roster", activeId: "dash" },
          { label: "Player Page", ctx: "player", activeId: "bio" },
        ].map(({ label, ctx, activeId }) => (
          <Box key={ctx}>
            <Text fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
              {label}
            </Text>
            <SideNavStackingDemo team={team} context={ctx} activeItemId={activeId} />
          </Box>
        ))}

        {/* Interactive */}
        <Box>
          <Text fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
            Interactive ↑ click "Roster" to drill in
          </Text>
          <SideNavStackingDemo
            team={team}
            context={context}
            activeItemId={activeItem}
            onItemClick={handleItemClick}
            onTeamClick={handleTeamClick}
            onRosterClick={handleRosterClick}
          />
        </Box>
      </Flex>
    </Box>
  );
};
