import { useState, useMemo } from "react";
import {
  Box,
  Text,
  Flex,
  Grid,
  Image,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import {
  User,
  TrendingUp,
  Calendar,
  Award,
  ArrowRightLeft,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import {
  usePlayerStatsEnriched,
  useAllPlayers,
  useAllPlayersByYear,
  usePlayerAnalytics,
  usePlayersHub,
} from "../../hooks/useSWACData";
import teamsData from "../../data/teams.json";
import FilterChip from "../../components/atoms/interactive/FilterChip";
import SearchInput from "../../components/atoms/interactive/SearchInput";
import PlayersBanner from "../../components/organisms/PlayersBanner";
import {
  SpotlightHeroCard,
  BreakoutCard,
  TransferImpactCard,
  GloryLeadersCard,
  HiddenGemsCard,
  PhysicalOutliersCard,
  PositionBoardsCard,
  ConferenceMapCard,
  ArchetypeCard,
} from "../../components/organisms/player/PlayersHubCards";

const PAGE_SIZE = 96;
const POSITION_GROUPS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "ST"];
const CLASS_YEARS = ["Fr.", "So.", "Jr.", "Sr.", "Gr."];
const YEARS = ["2021", "2022", "2023", "2024", "2025"];

const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = {
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    conference: t.conference.toLowerCase(),
    division: t.division,
    colors: t.colors,
    logo: t.logo,
  };
  const v5 = t.exportId.replace(/25$/, "");
  acc[v5] = {
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    conference: t.conference.toLowerCase(),
    division: t.division,
    colors: t.colors,
    logo: t.logo,
  };
  return acc;
}, {});

// Transfer tier colors and labels
const TIER_COLORS = {
  FBS: "blue.400",
  FCS: "purple.400",
  JUCO: "orange.400",
  HS: "green.400",
};

const TIER_ORDER = ["FBS", "FCS", "JUCO", "HS"];

const TIER_LABELS = {
  FBS: "FBS",
  FCS: "FCS",
  JUCO: "JUCO",
  HS: "High School",
};

const POSITION_ORDER = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "DB", "ST"];

const POSITION_LABELS = {
  QB: "Quarterback",
  RB: "Running Back",
  WR: "Wide Receiver",
  TE: "Tight End",
  OL: "Offensive Line",
  DL: "Defensive Line",
  LB: "Linebacker",
  DB: "Defensive Back",
  ST: "Special Teams",
};

const makePlayerKey = (player) =>
  encodeURIComponent(
    `${player.name_display || player.full_name}__${player.team || player.team_id}`,
  );

const LabSection = () => (
  <Box
    mb={10}
    p={{ base: 6, md: 10 }}
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(135deg, rgba(11,11,13,0.9) 0%, rgba(229,62,62,0.04) 100%)"
    position="relative"
    overflow="hidden"
  >
    <Box
      position="absolute"
      top="-40px"
      right="-40px"
      w="200px"
      h="200px"
      borderRadius="full"
      bg="brand.500"
      opacity={0.03}
      pointerEvents="none"
    />
    <Text
      fontSize={{ base: "2xl", md: "4xl" }}
      fontWeight="black"
      color="white"
      textTransform="uppercase"
      letterSpacing="-0.01em"
      mb={2}
    >
      The Lab:{" "}
      <Text as="span" color="brand.400" fontStyle="italic">
        VS Protocol
      </Text>
    </Text>
    <Text fontSize="sm" color="text.secondary" mb={6} maxW="540px">
      Compare player-to-player or roster-to-roster. Our engine calculates
      matchup advantages, fatigue probability, and clutch performance indices
      using 10 years of HBCU historical data.
    </Text>
    <Flex gap={3} flexWrap="wrap">
      <Box
        as="button"
        px={6}
        py="11px"
        bg="transparent"
        border="2px solid"
        borderColor="white"
        color="white"
        borderRadius="md"
        fontSize="sm"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.06em"
        _hover={{ bg: "whiteAlpha.100" }}
        transition="all 0.15s"
      >
        Launch Player VS Player
      </Box>
      <Box
        as="button"
        px={6}
        py="11px"
        bg="transparent"
        border="1px solid"
        borderColor="whiteAlpha.300"
        color="text.secondary"
        borderRadius="md"
        fontSize="sm"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.06em"
        _hover={{ bg: "whiteAlpha.50", color: "white" }}
        transition="all 0.15s"
      >
        Team Comparison
      </Box>
    </Flex>
  </Box>
);

const StatPlayerCard = ({ player, navigate }) => {
  const teamMeta = TEAM_BY_EXPORT[player.team] ?? {};
  const parColor =
    player.par > 10 ? "green.400" : player.par > 4 ? "brand.400" : "text.muted";
  const [imgErr, setImgErr] = useState(false);

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() =>
        navigate(`/player/${makePlayerKey(player)}`, { state: { player } })
      }
      _hover={{ borderColor: "brand.500", transform: "translateY(-1px)" }}
      transition="all 0.15s"
    >
      <Box bg="whiteAlpha.50" h="120px" overflow="hidden" position="relative">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={player.name_display}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={28} color="var(--chakra-colors-whiteAlpha-200)" />
          </Flex>
        )}
        {player.jersey_number != null && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            #{player.jersey_number}
          </Box>
        )}
        {player.par != null && (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="blackAlpha.800"
            color={parColor}
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            {player.par.toFixed(1)} PAR
          </Box>
        )}
      </Box>
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="text.primary"
          lineHeight="short"
          mb={1}
          lineClamp={1}
        >
          {player.name_display}
        </Text>
        <Flex gap={2} align="center" mb={1} flexWrap="wrap">
          {player.position && (
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {player.position}
            </Text>
          )}
          {player.class_year && (
            <Text fontSize="xs" color="text.muted">
              {player.class_year}
              {player.is_redshirt ? " RS" : ""}
            </Text>
          )}
          {player.is_transfer && player.transfer_tier && (
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="yellow.400"
              textTransform="uppercase"
            >
              {player.transfer_tier}
            </Text>
          )}
        </Flex>
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="text.muted">
            {teamMeta.shortName ?? player.team}
          </Text>
          {player.games_played != null && (
            <Text fontSize="xs" color="text.muted">
              {player.games_played}G
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

const RosterPlayerCard = ({ player, navigate }) => {
  const [imgErr, setImgErr] = useState(false);
  const teamMeta = TEAM_BY_EXPORT[player.team_id] ?? {};
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() =>
        navigate(
          `/player/${makePlayerKey({ ...player, name_display: player.full_name, team: player.team_id })}`,
          {
            state: {
              player: {
                ...player,
                name_display: player.full_name,
                team: player.team_id,
                position: player.position_abbr,
              },
            },
          },
        )
      }
      _hover={{ borderColor: "brand.500", transform: "translateY(-1px)" }}
      transition="all 0.15s"
    >
      <Box bg="whiteAlpha.50" h="120px" overflow="hidden" position="relative">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={player.full_name}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={28} color="var(--chakra-colors-whiteAlpha-200)" />
          </Flex>
        )}
        {player.jersey_number != null && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            #{player.jersey_number}
          </Box>
        )}
      </Box>
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="text.primary"
          lineHeight="short"
          mb={1}
          lineClamp={1}
        >
          {player.full_name}
        </Text>
        <Flex gap={2} mb={1}>
          {player.position_abbr && (
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {player.position_abbr}
            </Text>
          )}
          {player.class_year && (
            <Text fontSize="xs" color="text.muted">
              {player.class_year}
            </Text>
          )}
        </Flex>
        <Text fontSize="xs" color="text.muted">
          {teamMeta.shortName ?? player.team_id}
        </Text>
      </Box>
    </Box>
  );
};

const HistoricalPlayerCard = ({ player }) => {
  const teamMeta = TEAM_BY_EXPORT[player._teamId] ?? {};
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box bg="whiteAlpha.50" h="80px" overflow="hidden" position="relative">
        <Flex align="center" justify="center" h="100%">
          <User size={22} color="var(--chakra-colors-whiteAlpha-200)" />
        </Flex>
        {(player.jersey_number != null || player.number != null) && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            #{player.jersey_number ?? player.number}
          </Box>
        )}
      </Box>
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="text.primary"
          lineHeight="short"
          mb={1}
          lineClamp={1}
        >
          {player.name ?? player.full_name ?? "—"}
        </Text>
        <Flex gap={2} mb={1} flexWrap="wrap">
          {(player.position || player.position_abbr) && (
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {player.position ?? player.position_abbr}
            </Text>
          )}
          {(player.class_year || player.year_in_school) && (
            <Text fontSize="xs" color="text.muted">
              {player.class_year ?? player.year_in_school}
            </Text>
          )}
        </Flex>
        <Text fontSize="xs" color="text.muted">
          {teamMeta.shortName ?? player._teamId}
        </Text>
      </Box>
    </Box>
  );
};

const LeaderboardRow = ({ player, rank, accent = "#E53E3E", navigate }) => {
  const teamMeta = TEAM_BY_EXPORT[player.team] ?? {};
  const tierColor = TIER_COLORS[player.transfer_tier] ?? "gray";
  const parBarWidth = `${Math.min(100, (player.par / 200) * 100)}%`;
  const isTop3 = rank <= 3;

  return (
    <Box
      bg={
        isTop3
          ? `linear-gradient(135deg, ${accent}18 0%, transparent 70%)`
          : "blackAlpha.300"
      }
      border="1px solid"
      borderColor={isTop3 ? accent + "55" : "whiteAlpha.100"}
      borderRadius="lg"
      p={3}
      position="relative"
      overflow="hidden"
      cursor="pointer"
      onClick={() =>
        navigate &&
        navigate(`/player/${makePlayerKey(player)}`, { state: { player } })
      }
      _hover={{ borderColor: isTop3 ? accent + "99" : "whiteAlpha.300" }}
      transition="border-color 0.15s"
    >
      <Flex align="center" gap={3}>
        <Box
          w="32px"
          h="32px"
          borderRadius="md"
          bg={isTop3 ? accent : "whiteAlpha.100"}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Text
            fontSize="sm"
            fontWeight="black"
            color={isTop3 ? "white" : "text.muted"}
          >
            {rank}
          </Text>
        </Box>
        <Box flex={1} minW={0}>
          <Flex align="center" gap={2} mb={1} flexWrap="wrap">
            <Text fontSize="sm" fontWeight="bold" color="white" lineClamp={1}>
              {player.name_display}
            </Text>
            {player.transfer_tier && (
              <Badge
                colorScheme={tierColor}
                variant="subtle"
                fontSize="8px"
                textTransform="uppercase"
              >
                {player.transfer_tier}
              </Badge>
            )}
          </Flex>
          <Flex gap={2} align="center">
            <Text fontSize="xs" color="brand.400" fontWeight="bold">
              {player.position}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {player.class_year ?? "—"}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {teamMeta.shortName ?? player.team}
            </Text>
            {player.games_played && (
              <Text fontSize="xs" color="text.muted">
                {player.games_played}G
              </Text>
            )}
          </Flex>
          <Box mt={2}>
            <Box
              h="4px"
              borderRadius="full"
              bg="whiteAlpha.100"
              overflow="hidden"
            >
              <Box
                h="100%"
                w={parBarWidth}
                bg={`var(--chakra-colors-${tierColor}-400)`}
                transition="width 0.4s ease"
              />
            </Box>
          </Box>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text
            fontSize="lg"
            fontWeight="black"
            color={isTop3 ? accent : "white"}
            lineHeight={1}
          >
            {player.par.toFixed(1)}
          </Text>
          <Text
            fontSize="8px"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            PAR
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

const LeaderboardsView = ({ leaderboards, isLoading, navigate }) => {
  const [activePos, setActivePos] = useState("QB");

  if (isLoading)
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );

  const positions = Object.keys(leaderboards).filter((k) =>
    POSITION_ORDER.includes(k),
  );
  const players = leaderboards[activePos] ?? [];

  return (
    <Box>
      <Box
        mb={6}
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="linear-gradient(135deg, rgba(229,62,62,0.08) 0%, transparent 60%)"
      >
        <Text
          fontSize="xs"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.14em"
          mb={1}
        >
          2025 Season
        </Text>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={1}
        >
          Position Leaderboards
        </Text>
        <Text mt={2} fontSize="sm" color="text.muted">
          Top performers ranked by PAR — production per game weighted by
          difficulty.
        </Text>
      </Box>
      <Flex gap={2} mb={6} flexWrap="wrap">
        {positions.map((pos) => (
          <Box
            key={pos}
            as="button"
            onClick={() => setActivePos(pos)}
            px={4}
            py={2}
            borderRadius="md"
            bg={activePos === pos ? "brand.500" : "blackAlpha.300"}
            border="1px solid"
            borderColor={activePos === pos ? "brand.500" : "whiteAlpha.200"}
            color={activePos === pos ? "white" : "text.muted"}
            fontSize="sm"
            fontWeight="bold"
            _hover={{ color: "white" }}
            transition="all 0.15s"
          >
            {POSITION_LABELS[pos] ?? pos}
          </Box>
        ))}
      </Flex>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
        {players.map((player, idx) => (
          <LeaderboardRow
            key={player.player_key ?? idx}
            player={player}
            rank={idx + 1}
            navigate={navigate}
          />
        ))}
      </Grid>
    </Box>
  );
};

const TransfersView = ({ transferAnalytics, isLoading, navigate }) => {
  if (isLoading)
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  if (!transferAnalytics) return null;

  const {
    by_tier,
    top_10_transfers_by_par,
    transfer_count,
    total_players,
    avg_par_transfers,
    avg_par_non_transfers,
  } = transferAnalytics;
  const transferRate = ((transfer_count / total_players) * 100).toFixed(0);
  const maxAvgPar = Math.max(
    ...Object.values(by_tier).map((t) => t.avg_par ?? 0),
  );

  return (
    <Box>
      <Box
        mb={6}
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="linear-gradient(135deg, rgba(66,153,225,0.08) 0%, transparent 60%)"
      >
        <Text
          fontSize="xs"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.14em"
          mb={1}
        >
          2025 Season
        </Text>
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={1}
        >
          Transfer Analytics
        </Text>
        <Text mt={2} fontSize="sm" color="text.muted">
          Movement intel for the 2025 HBCU class — tier breakdown, PAR impact,
          and top performers.
        </Text>
      </Box>
      <Grid
        templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }}
        gap={3}
        mb={6}
      >
        {[
          {
            label: "Transfer Rate",
            value: `${transferRate}%`,
            sub: `${transfer_count} of ${total_players} players`,
            color: "brand.400",
          },
          {
            label: "Avg PAR (Transfers)",
            value: avg_par_transfers.toFixed(1),
            sub: `vs ${avg_par_non_transfers.toFixed(1)} non-transfer`,
            color: "green.400",
          },
          {
            label: "Top Tier (PAR)",
            value: "FCS",
            sub: `${by_tier.FCS?.avg_par?.toFixed(1)} avg PAR`,
            color: "yellow.400",
          },
          {
            label: "HS Recruits",
            value: by_tier.HS?.count ?? 0,
            sub: `${by_tier.HS?.avg_par?.toFixed(1)} avg PAR`,
            color: "purple.400",
          },
        ].map(({ label, value, sub, color }) => (
          <Box
            key={label}
            bg="blackAlpha.300"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="lg"
            p={3}
          >
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              {label}
            </Text>
            <Text fontSize="2xl" fontWeight="black" color={color}>
              {value}
            </Text>
            <Text fontSize="9px" color="text.muted" mt={1}>
              {sub}
            </Text>
          </Box>
        ))}
      </Grid>
      <Box
        mb={6}
        bg="blackAlpha.300"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={4}
      >
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="white"
          mb={4}
          textTransform="uppercase"
          letterSpacing="0.05em"
        >
          Performance by Origin
        </Text>
        <Flex direction="column" gap={3}>
          {TIER_ORDER.filter((t) => by_tier[t]?.count > 0).map((tier) => {
            const d = by_tier[tier];
            const width = `${Math.min(100, ((d.avg_par ?? 0) / (maxAvgPar || 1)) * 100)}%`;
            const color = TIER_COLORS[tier] ?? "gray";
            return (
              <Box key={tier}>
                <Flex justify="space-between" mb={1}>
                  <Flex align="center" gap={2}>
                    <Badge colorScheme={color} variant="subtle" fontSize="9px">
                      {tier}
                    </Badge>
                    <Text fontSize="xs" color="text.muted">
                      {TIER_LABELS[tier]}
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      · {d.count} players
                    </Text>
                  </Flex>
                  <Text fontSize="sm" fontWeight="bold" color="white">
                    {d.avg_par?.toFixed(1) ?? "—"} PAR
                  </Text>
                </Flex>
                <Box
                  h="6px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  overflow="hidden"
                >
                  <Box
                    h="100%"
                    w={width}
                    bg={`var(--chakra-colors-${color}-400)`}
                    transition="width 0.4s ease"
                  />
                </Box>
              </Box>
            );
          })}
        </Flex>
      </Box>
      <Box>
        <Flex align="center" gap={3} mb={4}>
          <Box w="4px" h="24px" bg="brand.500" borderRadius="full" />
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="white"
            textTransform="uppercase"
          >
            Top Transfers — 2025
          </Text>
        </Flex>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
          {top_10_transfers_by_par.map((player, idx) => (
            <LeaderboardRow
              key={player.player_key ?? idx}
              player={player}
              rank={idx + 1}
              navigate={navigate}
            />
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const PlayersPage = () => {
  const navigate = useNavigate();

  const { players: statPlayers, isLoading: statsLoading } =
    usePlayerStatsEnriched();
  const { players: rosterPlayers, isLoading: rosterLoading } = useAllPlayers();
  const {
    leaderboards,
    transferAnalytics,
    isLoading: analyticsLoading,
  } = usePlayerAnalytics();
  const { hub: playersHub, isLoading: playersHubLoading } = usePlayersHub(2025);

  const [view, setView] = useState("stats");
  const [year, setYear] = useState("2025");
  const [conf, setConf] = useState("all");
  const [pos, setPos] = useState("all");
  const [cls, setCls] = useState("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { players: histPlayers, isLoading: histLoading } =
    useAllPlayersByYear(year);

  const isLoading =
    statsLoading ||
    rosterLoading ||
    (view === "history" && histLoading) ||
    ((view === "leaderboards" || view === "transfers") && analyticsLoading);

  const setFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (view === "stats") {
      let list = statPlayers;
      if (conf !== "all")
        list = list.filter((p) => TEAM_BY_EXPORT[p.team]?.conference === conf);
      if (pos !== "all") list = list.filter((p) => p.position_group === pos);
      if (cls !== "all") list = list.filter((p) => p.class_year === cls);
      if (search)
        list = list.filter(
          (p) =>
            (p.name_display ?? "").toLowerCase().includes(searchLower) ||
            (p.position ?? "").toLowerCase().includes(searchLower) ||
            (TEAM_BY_EXPORT[p.team]?.shortName ?? "")
              .toLowerCase()
              .includes(searchLower),
        );
      return [...list].sort((a, b) => (b.par ?? 0) - (a.par ?? 0));
    }
    if (view === "roster") {
      let list = rosterPlayers;
      if (conf !== "all")
        list = list.filter(
          (p) => TEAM_BY_EXPORT[p.team_id]?.conference === conf,
        );
      if (pos !== "all") list = list.filter((p) => p.position_group === pos);
      if (cls !== "all") list = list.filter((p) => p.class_year === cls);
      if (search)
        list = list.filter(
          (p) =>
            (p.full_name ?? "").toLowerCase().includes(searchLower) ||
            (p.position_abbr ?? "").toLowerCase().includes(searchLower) ||
            (TEAM_BY_EXPORT[p.team_id]?.shortName ?? "")
              .toLowerCase()
              .includes(searchLower),
        );
      return list;
    }
    let list = histPlayers;
    if (conf !== "all")
      list = list.filter((p) => TEAM_BY_EXPORT[p._teamId]?.conference === conf);
    if (pos !== "all")
      list = list.filter((p) => (p.position ?? p.position_abbr) === pos);
    if (cls !== "all")
      list = list.filter((p) => (p.class_year ?? p.year_in_school) === cls);
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, statPlayers, rosterPlayers, histPlayers, conf, pos, cls, search]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const listContent = (
    <>
        {/* Search + filters */}
        <Box pt={6}>
          <Flex gap={3} align="center" maxW="680px" flexWrap="wrap">
            <SearchInput
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="SEARCH ATHLETE BY NAME, POSITION, OR SCHOOL..."
            />
            <Box
              as="button"
              px={5}
              py={3}
              bg="brand.500"
              color="white"
              borderRadius="md"
              fontSize="11px"
              fontWeight="bold"
              letterSpacing="0.08em"
              textTransform="uppercase"
              _hover={{ bg: "brand.600" }}
              transition="all 0.15s"
              whiteSpace="nowrap"
              display="flex"
              alignItems="center"
              gap={2}
            >
              Comparison Tool <Zap size={12} />
            </Box>
          </Flex>
        </Box>

        {/* The discovery boards that used to live here now render as real
            PageShell slots above (see the return) — this section is the
            searchable database only. */}

        {/* Divider */}
        <Box borderTop="1px solid" borderColor="whiteAlpha.100" mb={8} pt={8}>
          <Flex align="center" gap={3} mb={6}>
            <Box w="4px" h="20px" bg="brand.500" borderRadius="full" />
            <Text
              fontSize="sm"
              fontWeight="black"
              color="white"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              Player Database
            </Text>
          </Flex>
        </Box>

        {/* View toggle */}
        <Flex
          gap={1}
          mb={6}
          bg="bg.secondary"
          borderRadius="lg"
          p={1}
          display="inline-flex"
          flexWrap="wrap"
        >
          {[
            {
              id: "stats",
              label: (
                <Flex align="center" gap={1}>
                  <TrendingUp size={11} /> Production
                </Flex>
              ),
            },
            {
              id: "leaderboards",
              label: (
                <Flex align="center" gap={1}>
                  <Award size={11} /> Leaderboards
                </Flex>
              ),
            },
            {
              id: "transfers",
              label: (
                <Flex align="center" gap={1}>
                  <ArrowRightLeft size={11} /> Transfers
                </Flex>
              ),
            },
            { id: "roster", label: "Full Roster" },
            {
              id: "history",
              label: (
                <Flex align="center" gap={1}>
                  <Calendar size={11} /> By Year
                </Flex>
              ),
            },
          ].map(({ id, label }) => (
            <Box
              key={id}
              as="button"
              onClick={() => {
                setView(id);
                setPage(1);
              }}
              px={4}
              py={2}
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              bg={view === id ? "brand.500" : "transparent"}
              color={view === id ? "white" : "text.muted"}
              _hover={{ color: view === id ? "white" : "text.primary" }}
              transition="all 0.15s"
            >
              {label}
            </Box>
          ))}
        </Flex>

        {/* Year selector */}
        {view === "history" && (
          <Flex
            gap={1}
            mb={6}
            bg="bg.secondary"
            borderRadius="lg"
            p={1}
            display="inline-flex"
          >
            {YEARS.map((y) => (
              <Box
                key={y}
                as="button"
                onClick={() => {
                  setYear(y);
                  setPage(1);
                }}
                px={4}
                py="6px"
                borderRadius="md"
                fontSize="sm"
                fontWeight={year === y ? "bold" : "medium"}
                bg={year === y ? "brand.500" : "transparent"}
                color={year === y ? "white" : "text.muted"}
                _hover={{ color: year === y ? "white" : "text.primary" }}
                transition="all 0.15s"
              >
                {y}
              </Box>
            ))}
          </Flex>
        )}

        {/* Filters */}
        {(view === "stats" || view === "roster" || view === "history") && (
          <Box mb={6}>
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
              mb={2}
            >
              Conference
            </Text>
            <Flex gap={2} mb={4} flexWrap="wrap">
              {["all", "swac", "meac"].map((c) => (
                <FilterChip
                  key={c}
                  active={conf === c}
                  onClick={() => setFilter(setConf)(c)}
                >
                  {c === "all" ? "All" : c.toUpperCase()}
                </FilterChip>
              ))}
            </Flex>
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
              mb={2}
            >
              Position
            </Text>
            <Flex gap={2} mb={4} flexWrap="wrap">
              <FilterChip
                active={pos === "all"}
                onClick={() => setFilter(setPos)("all")}
              >
                All
              </FilterChip>
              {POSITION_GROUPS.map((p) => (
                <FilterChip
                  key={p}
                  active={pos === p}
                  onClick={() => setFilter(setPos)(p)}
                >
                  {p}
                </FilterChip>
              ))}
            </Flex>
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="widest"
              mb={2}
            >
              Class
            </Text>
            <Flex gap={2} flexWrap="wrap">
              <FilterChip
                active={cls === "all"}
                onClick={() => setFilter(setCls)("all")}
              >
                All
              </FilterChip>
              {CLASS_YEARS.map((c) => (
                <FilterChip
                  key={c}
                  active={cls === c}
                  onClick={() => setFilter(setCls)(c)}
                >
                  {c}
                </FilterChip>
              ))}
            </Flex>
          </Box>
        )}

        {!isLoading &&
          (view === "stats" || view === "roster" || view === "history") && (
            <Text fontSize="xs" color="text.muted" mb={4}>
              {filtered.length.toLocaleString()} players
            </Text>
          )}

        {isLoading && (
          <Flex justify="center" py={16}>
            <Spinner color="brand.500" size="lg" />
          </Flex>
        )}

        {!isLoading && view === "leaderboards" && (
          <LeaderboardsView
            leaderboards={leaderboards}
            isLoading={analyticsLoading}
            navigate={navigate}
          />
        )}
        {!isLoading && view === "transfers" && (
          <TransfersView
            transferAnalytics={transferAnalytics}
            isLoading={analyticsLoading}
            navigate={navigate}
          />
        )}

        {!isLoading &&
          (view === "stats" || view === "roster" || view === "history") && (
            <>
              <Grid
                templateColumns={
                  view === "history"
                    ? {
                        base: "repeat(2,1fr)",
                        sm: "repeat(3,1fr)",
                        md: "repeat(5,1fr)",
                        lg: "repeat(7,1fr)",
                      }
                    : {
                        base: "repeat(2,1fr)",
                        sm: "repeat(3,1fr)",
                        md: "repeat(4,1fr)",
                        lg: "repeat(6,1fr)",
                      }
                }
                gap={3}
              >
                {paginated.map((p, i) => {
                  if (view === "stats")
                    return (
                      <StatPlayerCard
                        key={p.player_key ?? i}
                        player={p}
                        navigate={navigate}
                      />
                    );
                  if (view === "roster")
                    return (
                      <RosterPlayerCard
                        key={p.id ?? i}
                        player={p}
                        navigate={navigate}
                      />
                    );
                  return (
                    <HistoricalPlayerCard key={p.person_id ?? i} player={p} />
                  );
                })}
              </Grid>

              {hasMore && (
                <Flex justify="center" mt={8} pb={12}>
                  <Box
                    as="button"
                    onClick={() => setPage((n) => n + 1)}
                    px={6}
                    py={3}
                    bg="whiteAlpha.100"
                    color="text.secondary"
                    borderRadius="lg"
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ bg: "whiteAlpha.200", color: "text.primary" }}
                    transition="all 0.15s"
                  >
                    Load more · {filtered.length - paginated.length} remaining
                  </Box>
                </Flex>
              )}
            </>
          )}
    </>
  );

  // ── Discovery boards, as real grid slots ──────────────────────────────────
  // Sizes are assigned per board rather than uniformly: the spotlight leads at
  // 2x2, the two vertical rank boards take 1x2, the position wall needs 2x2 to
  // fit eight rooms, and the single-subject cards sit at 1x1. Each is gated on
  // its own data so a board never claims a slot it can't fill.
  const hub = playersHubLoading ? null : playersHub;
  const boardSlots = hub
    ? [
        hub.spotlight?.primary && {
          key: "spotlight",
          cols: 2,
          rows: 2,
          node: <SpotlightHeroCard spotlight={hub.spotlight} />,
        },
        hub.breakout_radar?.length && {
          key: "breakout",
          cols: 1,
          rows: 2,
          node: <BreakoutCard entries={hub.breakout_radar} />,
        },
        hub.transfer_impact?.length && {
          key: "transfer",
          cols: 1,
          rows: 2,
          node: (
            <TransferImpactCard
              entries={hub.transfer_impact}
              transfersCount={hub.summary?.transfers_count}
            />
          ),
        },
        hub.glory_leaders?.overall?.length && {
          key: "glory",
          cols: 2,
          rows: 1,
          node: <GloryLeadersCard entries={hub.glory_leaders.overall} />,
        },
        hub.hidden_gems?.length && {
          key: "gems",
          cols: 1,
          rows: 1,
          node: <HiddenGemsCard entries={hub.hidden_gems} />,
        },
        hub.physical_outliers?.length && {
          key: "outliers",
          cols: 1,
          rows: 1,
          node: <PhysicalOutliersCard entries={hub.physical_outliers} />,
        },
        hub.position_boards?.length && {
          key: "positions",
          cols: 2,
          rows: 2,
          node: <PositionBoardsCard boards={hub.position_boards} />,
        },
        hub.conference_talent_map?.length && {
          key: "conference",
          cols: 1,
          rows: 2,
          node: <ConferenceMapCard groups={hub.conference_talent_map} />,
        },
        hub.archetypes?.length && {
          key: "archetypes",
          cols: 1,
          rows: 2,
          node: <ArchetypeCard archetypes={hub.archetypes} />,
        },
      ].filter(Boolean)
    : [];

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        <PlayersBanner />
      </PageShell.Slot>

      {boardSlots.map(({ key, cols, rows, node }) => (
        <PageShell.Slot key={key} cols={cols} rows={rows}>
          {node}
        </PageShell.Slot>
      ))}

      <PageShell.Slot cols={4}>
        <LabSection />
      </PageShell.Slot>
    </PageShell>
  );
};

export default PlayersPage;
