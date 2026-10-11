import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import {
  BriefPerformers,
  BriefTeamStats,
  HeadshotOrInitials,
  buildIdentityIndex,
  buildPerformers,
  buildTeamStatRows,
  resolveImage,
  resolveImages,
} from "./WeekCentralBriefBlocks";
import { CalendarDays, ExternalLink, MapPin, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import teamsData from "../../../data/teams.json";
import { cleanName } from "../../../utils/gameHelpers";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const DEFAULT_IMAGE = "/stadiums/Louis%20Crews%20Stadium.jpg";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const id = team.exportId.replace(/25$/, "");
  acc[id] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");
const teamMeta = (id) => TEAM_BY_ID[normalizeTeamKey(id)] ?? null;
const teamShort = (id, fallback = "TBD") => teamMeta(id)?.bannerShort ?? teamMeta(id)?.shortName ?? fallback;
const teamName = (id, fallback = "TBD") => teamMeta(id)?.name ?? fallback;
const teamLogo = (id) => teamMeta(id)?.logo ?? (id ? `/assets/${normalizeTeamKey(id)}.svg` : null);
const teamColor = (id, fallback = "#69B3E7") => teamMeta(id)?.colors?.primary ?? fallback;
const teamAccent = (id, fallback = "#FFFFFF") => teamMeta(id)?.colors?.accent ?? teamMeta(id)?.colors?.secondary ?? fallback;
const teamSecondary = (id, fallback = "#FFFFFF") => teamMeta(id)?.colors?.secondary ?? teamMeta(id)?.colors?.accent ?? fallback;
const displayValue = (value) => (value == null || Number.isNaN(value) ? "-" : value);
const displayText = (value, fallback = "TBD") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const getLastName = (name) => {
  const value = String(name ?? "").trim();
  if (!value) return "-";
  if (value.includes(",")) return value.split(",")[0].trim();
  const parts = value.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? value;
};

const getScore = (side, scheduleScore) => {
  const parsedScore = side?.score;
  if (Number.isFinite(Number(parsedScore))) return Number(parsedScore);
  if (Number.isFinite(Number(scheduleScore))) return Number(scheduleScore);
  return null;
};

const buildTeams = (selectedGame, parsedGame) => {
  const parsedAway = parsedGame?.metadata?.away_team;
  const parsedHome = parsedGame?.metadata?.home_team;
  const awayId = normalizeTeamKey(parsedAway?.id ?? selectedGame?.awayId);
  const homeId = normalizeTeamKey(parsedHome?.id ?? selectedGame?.homeId);
  const awayFallback = selectedGame?.awayText ?? parsedAway?.name ?? "Away";
  const homeFallback = selectedGame?.homeText ?? parsedHome?.name ?? "Home";

  return {
    away: {
      id: awayId,
      shortName: teamShort(awayId, selectedGame?.awayText ?? awayFallback),
      name: teamName(awayId, awayFallback),
      score: getScore(parsedAway, selectedGame?.awayScore),
      logo: teamLogo(awayId),
      color: teamColor(awayId, "#E53E3E"),
      accent: teamAccent(awayId, "#FFFFFF"),
      secondary: teamSecondary(awayId, "#FFFFFF"),
    },
    home: {
      id: homeId,
      shortName: teamShort(homeId, selectedGame?.homeText ?? homeFallback),
      name: teamName(homeId, homeFallback),
      score: getScore(parsedHome, selectedGame?.homeScore),
      logo: teamLogo(homeId),
      color: teamColor(homeId, "#69B3E7"),
      accent: teamAccent(homeId, "#FFFFFF"),
      secondary: teamSecondary(homeId, "#FFFFFF"),
    },
  };
};

const topOf = (rows = [], field) => {
  const arr = Array.isArray(rows) ? rows : [];
  return [...arr].sort((a, b) => Number(b?.[field] ?? 0) - Number(a?.[field] ?? 0))[0] ?? null;
};
const byTeam = (parsedGame, teamId, group) => {
  const stats = parsedGame?.individual_stats?.[teamId]?.[group];
  return Array.isArray(stats) ? stats : [];
};
const havocScore = (player) =>
  Number(player?.tfl ?? 0) +
  Number(player?.sacks ?? 0) +
  Number(player?.passes_defended ?? 0) +
  Number(player?.interceptions ?? 0) +
  Number(player?.forced_fumbles ?? 0);

const playerCard = (player, statValue, detail, identity, teamId) => player ? ({
  playerKey: player.player_key,
  name: cleanName(player.name),
  position: player.position,
  statValue,
  detail,
  image: resolveImage(identity, player, teamId),
  images: resolveImages(identity, player, teamId),
}) : null;

const LEADER_LABELS = ["Passing Yards", "Rushing Yards", "Receiving Yards", "Havoc Leader", "Tackles"];

const buildLeaders = (parsedGame, awayId, homeId, identity) => {
  if (!parsedGame) return LEADER_LABELS.map((label) => ({ label, away: null, home: null }));

  const awayPasser = topOf(byTeam(parsedGame, awayId, "passing"), "yards");
  const homePasser = topOf(byTeam(parsedGame, homeId, "passing"), "yards");
  const awayRusher = topOf(byTeam(parsedGame, awayId, "rushing"), "yards");
  const homeRusher = topOf(byTeam(parsedGame, homeId, "rushing"), "yards");
  const awayReceiver = topOf(byTeam(parsedGame, awayId, "receiving"), "yards");
  const homeReceiver = topOf(byTeam(parsedGame, homeId, "receiving"), "yards");
  const awayHavoc = [...byTeam(parsedGame, awayId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const homeHavoc = [...byTeam(parsedGame, homeId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const awayTackler = topOf(byTeam(parsedGame, awayId, "defense"), "tackles");
  const homeTackler = topOf(byTeam(parsedGame, homeId, "defense"), "tackles");

  return [
    {
      label: "Passing Yards",
      away: playerCard(awayPasser, displayValue(awayPasser?.yards), `${awayPasser?.completions ?? 0}/${awayPasser?.attempts ?? 0}, ${awayPasser?.touchdowns ?? 0} TD`, identity, awayId),
      home: playerCard(homePasser, displayValue(homePasser?.yards), `${homePasser?.completions ?? 0}/${homePasser?.attempts ?? 0}, ${homePasser?.touchdowns ?? 0} TD`, identity, homeId),
    },
    {
      label: "Rushing Yards",
      away: playerCard(awayRusher, displayValue(awayRusher?.yards), `${awayRusher?.attempts ?? 0} car, ${awayRusher?.touchdowns ?? 0} TD`, identity, awayId),
      home: playerCard(homeRusher, displayValue(homeRusher?.yards), `${homeRusher?.attempts ?? 0} car, ${homeRusher?.touchdowns ?? 0} TD`, identity, homeId),
    },
    {
      label: "Receiving Yards",
      away: playerCard(awayReceiver, displayValue(awayReceiver?.yards), `${awayReceiver?.receptions ?? 0} rec, ${awayReceiver?.touchdowns ?? 0} TD`, identity, awayId),
      home: playerCard(homeReceiver, displayValue(homeReceiver?.yards), `${homeReceiver?.receptions ?? 0} rec, ${homeReceiver?.touchdowns ?? 0} TD`, identity, homeId),
    },
    {
      label: "Havoc Leader",
      away: playerCard(awayHavoc, displayValue(awayHavoc ? havocScore(awayHavoc) : null), `${awayHavoc?.tfl ?? 0} TFL, ${awayHavoc?.sacks ?? 0} SK, ${awayHavoc?.passes_defended ?? 0} PD`, identity, awayId),
      home: playerCard(homeHavoc, displayValue(homeHavoc ? havocScore(homeHavoc) : null), `${homeHavoc?.tfl ?? 0} TFL, ${homeHavoc?.sacks ?? 0} SK, ${homeHavoc?.passes_defended ?? 0} PD`, identity, homeId),
    },
    {
      label: "Tackles",
      away: playerCard(awayTackler, displayValue(awayTackler?.tackles), `${awayTackler?.solo_tackles ?? 0} solo, ${awayTackler?.tfl ?? 0} TFL`, identity, awayId),
      home: playerCard(homeTackler, displayValue(homeTackler?.tackles), `${homeTackler?.solo_tackles ?? 0} solo, ${homeTackler?.tfl ?? 0} TFL`, identity, homeId),
    },
  ];
};

// Line score is the game file's `score_by_quarter` — labels/home/away in
// parallel arrays, OT periods included, `verified_against_final` by the
// backend. No file, no line score; the totals row still renders.
const buildLineScore = (parsedGame) => {
  const sbq = parsedGame?.score_by_quarter;
  if (!sbq || !Array.isArray(sbq.labels)) return [];
  return sbq.labels.map((label, index) => ({
    period: String(label).replace(/^Q/, ""),
    away: sbq.away?.[index] ?? null,
    home: sbq.home?.[index] ?? null,
  }));
};

const buildBriefData = ({ selectedGame, parsedGame, playerSeasons, priorPlayerSeasons, leagueAvg }) => {
  const { away, home } = buildTeams(selectedGame, parsedGame);
  const identity = parsedGame ? buildIdentityIndex(playerSeasons, priorPlayerSeasons) : null;

  return {
    label: selectedGame?.status === "final" ? "Weekly Brief" : "Schedule File",
    tag: selectedGame?.tag ?? "Game",
    away,
    home,
    lineScore: buildLineScore(parsedGame),
    performers: buildPerformers(parsedGame, identity),
    teamStats: buildTeamStatRows(parsedGame, away.id, home.id, leagueAvg),
    leaders: buildLeaders(parsedGame, away.id, home.id, identity),
    hasParsedData: !!parsedGame,
  };
};

const Panel = ({ children, selectedColor = "#E53E3E" }) => (
  <Box
    h="100%"
    w="100%"
    borderRadius="lg"
    border="0"
    bg={selectedColor}
    boxShadow="0 18px 42px rgba(0,0,0,0.42)"
    overflow="hidden"
  >
    {children}
  </Box>
);

const SectionLabel = ({ children, color = "text.muted" }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const StatusPill = ({ children }) => (
  <Box px={2.5} py={1} borderRadius="full" bg="brand.500">
    <Text fontSize="7px" color="white" fontWeight="black" textTransform="uppercase">
      {children}
    </Text>
  </Box>
);

const LineScoreTable = ({ game, selectedAccent }) => {
  const periodCount = game.lineScore.length + 1; // periods + total
  const columns = {
    base: `minmax(42px, 1fr) repeat(${periodCount}, minmax(22px, 28px))`,
    xl: `minmax(76px, 1fr) repeat(${periodCount}, 34px)`,
  };
  return (
  <Box mx={{ base: -3, xl: -4 }} mt={{ base: -3, xl: -4 }} overflow="hidden" bg="rgba(0,0,0,0.22)" flexShrink={0}>
    <Grid
      templateColumns={columns}
      px={{ base: 2, xl: 3 }}
      py={{ base: "6px", xl: 2 }}
      alignItems="center"
      borderBottom="1px solid"
      borderColor={`${selectedAccent}55`}
    >
      <SectionLabel color="rgba(255,255,255,0.62)">Team</SectionLabel>
      {game.lineScore.map((q) => (
        <Text key={q.period} fontSize={{ base: "8px", xl: "9px" }} color="rgba(255,255,255,0.62)" fontWeight="black" textAlign="center">
          {q.period}
        </Text>
      ))}
      <Text fontSize={{ base: "8px", xl: "9px" }} color={selectedAccent} fontWeight="black" textAlign="center">T</Text>
    </Grid>
    {[game.away, game.home].map((team, index) => (
      <Grid
        key={`${team.id}-${index}`}
        templateColumns={columns}
        px={{ base: 2, xl: 3 }}
        py={{ base: "7px", xl: 2 }}
        minH={{ base: "30px", xl: "36px" }}
        alignItems="center"
        bg={index === 0 ? "rgba(0,0,0,0.18)" : "transparent"}
      >
        <Text fontSize={{ base: "12px", xl: "sm" }} color="white" fontWeight="black" lineClamp={1}>{team.shortName}</Text>
        {game.lineScore.map((q) => (
          <Text key={`${team.id}-${q.period}`} fontSize={{ base: "12px", xl: "sm" }} color="rgba(255,255,255,0.58)" fontWeight="black" textAlign="center" lineHeight={1}>
            {displayValue(index === 0 ? q.away : q.home)}
          </Text>
        ))}
        <Text fontSize={{ base: "12px", xl: "sm" }} color="white" fontWeight="black" textAlign="center" lineHeight={1}>{displayValue(team.score)}</Text>
      </Grid>
    ))}
  </Box>
  );
};

const PlayerAvatar = ({ name, src, srcs, color }) => (
  <Box
    w={{ base: "32px", xl: "54px" }}
    h={{ base: "32px", xl: "54px" }}
    borderRadius="md"
    overflow="hidden"
    border="1px solid"
    borderColor={`${color}88`}
    bg="whiteAlpha.100"
    flexShrink={0}
  >
    <HeadshotOrInitials name={name} src={src} srcs={srcs} />
  </Box>
);

const LeaderSide = ({ player, align = "left", color = "brand.400" }) => {
  if (!player) {
    return (
      <Flex align="center" justify={align === "right" ? "end" : "start"} gap={2} minW={0}>
        <Text fontSize="sm" color="text.muted" fontWeight="black">No data</Text>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify={align === "right" ? "end" : "start"} gap={1} minW={0}>
      {align === "left" && <PlayerAvatar name={player.name} srcs={player.images} color={color} />}
      <Box textAlign={align} minW={0}>
        <Text fontSize={{ base: "md", xl: "2xl" }} color={color} fontWeight="black" lineHeight={1}>{player.statValue}</Text>
        <Text fontSize={{ base: "10px", xl: "14px" }} color="white" fontWeight="black" lineClamp={1}>
          <Box as="span" display={{ base: "inline", "xl": "none" }}>{getLastName(player.name)}</Box>
          <Box as="span" display={{ base: "none", "xl": "inline" }}>{player.name}</Box>
        </Text>
        <Text fontSize={{ base: "8px", xl: "11px" }} color="rgba(255,255,255,0.68)" fontWeight="black" lineClamp={1}>{player.detail}</Text>
      </Box>
      {align === "right" && <PlayerAvatar name={player.name} srcs={player.images} color={color} />}
    </Flex>
  );
};

const compactCategory = (label) => label.replace(" Yards", "\nYards").replace(" Leader", "\nLeader");

const LeaderRow = ({ item, awayColor, homeColor }) => (
  <Grid
    templateColumns={{ base: "minmax(0, 1fr) 42px minmax(0, 1fr)", xl: "minmax(0, 1fr) 96px minmax(0, 1fr)" }}
    alignItems="center"
    py={{ base: "8px", xl: "18px" }}
    borderBottom="1px solid"
    borderColor="whiteAlpha.100"
    gap={{ base: "3px", xl: 4 }}
  >
    <LeaderSide player={item.away} color={awayColor} />
    <Text fontSize={{ base: "7px", xl: "10px" }} color="rgba(255,255,255,0.58)" fontWeight="black" textTransform="uppercase" letterSpacing={{ base: "0.05em", xl: "0.12em" }} textAlign="center" whiteSpace="pre-line" lineHeight={1.08}>
      {compactCategory(item.label)}
    </Text>
    <LeaderSide player={item.home} align="right" color={homeColor} />
  </Grid>
);

// Mobile — separate build, not a responsive variant of LeaderRow. Two tiers:
// avatar/label/avatar on top, then a plain 2-column name/stat/detail grid
// below — square avatars per the mobile squared-corner rule, inspired by a
// 3-column reference layout, not copied (that one used circular avatars).
const PlayerAvatarMobile = ({ name, src, color }) => (
  <Box
    w="2.4rem"
    h="2.4rem"
    borderRadius="0"
    overflow="hidden"
    border="1px solid"
    borderColor={`${color}88`}
    bg="whiteAlpha.100"
    flexShrink={0}
  >
    <HeadshotOrInitials name={name} src={src} fontSize="xs" />
  </Box>
);

// Row 1: avatar | category label | avatar. Row 2: a *separate* 2-column grid
// (name/name, stat/stat, detail/detail) that no longer shares a row — or a
// width budget — with the label column, which is what was still squeezing
// names like "Jefferson"/"Campbell" into a mid-word wrap even after the
// stretch fix. Splitting the label out into its own row hands that width
// back to the two name columns.
const LeaderRowMobile = ({ item, awayColor, homeColor }) => (
  <Box py="0.6rem" px="0.75rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Grid templateColumns="minmax(0, 1fr) 3.75rem minmax(0, 1fr)" alignItems="center" gap="0.5rem">
      <Box>
        {item.away && <PlayerAvatarMobile name={item.away.name} src={item.away.image} color={awayColor} />}
      </Box>
      <Text fontSize="0.65rem" color="rgba(255,255,255,0.7)" fontWeight="black" textTransform="uppercase" textAlign="center" lineHeight={1.15}>
        {item.label}
      </Text>
      <Flex justify="flex-end">
        {item.home && <PlayerAvatarMobile name={item.home.name} src={item.home.image} color={homeColor} />}
      </Flex>
    </Grid>

    <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap="0.5rem" mt="0.4rem">
      <Text fontSize="0.7rem" color="white" fontWeight="black" lineClamp={1}>
        {item.away ? `${getLastName(item.away.name)}${item.away.position ? ` | ${item.away.position}` : ""}` : "No data"}
      </Text>
      <Text fontSize="0.7rem" color="white" fontWeight="black" lineClamp={1} textAlign="right">
        {item.home ? `${getLastName(item.home.name)}${item.home.position ? ` | ${item.home.position}` : ""}` : "No data"}
      </Text>

      <Text fontSize="1.1rem" color={awayColor} fontWeight="black" lineHeight={1}>
        {item.away?.statValue ?? "—"}
      </Text>
      <Text fontSize="1.1rem" color={homeColor} fontWeight="black" lineHeight={1} textAlign="right">
        {item.home?.statValue ?? "—"}
      </Text>

      <Text fontSize="0.6rem" color="rgba(255,255,255,0.68)" fontWeight="black" lineClamp={1}>
        {item.away?.detail}
      </Text>
      <Text fontSize="0.6rem" color="rgba(255,255,255,0.68)" fontWeight="black" lineClamp={1} textAlign="right">
        {item.home?.detail}
      </Text>
    </Grid>
  </Box>
);

const formatKickoff = (value) => {
  if (!value) return "Time TBD";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return String(value);
};

const getRecord = (raw, side) => {
  const keys = side === "away"
    ? ["away_record", "away_overall_record", "away_conference_record", "away_conf_record", "team_record"]
    : ["home_record", "home_overall_record", "home_conference_record", "home_conf_record", "opponent_record"];
  const value = keys.map((key) => raw?.[key]).find((item) => String(item ?? "").trim());
  return displayText(value, "Record TBD");
};

const ScheduleInfoRow = ({ icon, label, value }) => (
  <Flex align="center" gap={3} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <Flex align="center" justify="center" w="30px" h="30px" borderRadius="md" bg="rgba(255,255,255,0.10)" color="white">
      {icon}
    </Flex>
    <Box minW={0}>
      <SectionLabel color="rgba(255,255,255,0.56)">{label}</SectionLabel>
      <Text mt={1} fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

const UpcomingTeamBlock = ({ team, record, align = "left" }) => (
  <Flex direction="column" align={align === "right" ? "end" : "start"} minW={0}>
    <Box
      w={{ base: "52px", xl: "74px" }}
      h={{ base: "52px", xl: "74px" }}
      borderRadius="md"
      bg="rgba(0,0,0,0.22)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {team.logo ? (
        <Image src={team.logo} alt={team.shortName} w="80%" h="80%" objectFit="contain" />
      ) : (
        <Text fontSize="9px" color="text.muted" fontWeight="black">
          {team.shortName}
        </Text>
      )}
    </Box>
    <Text mt={3} fontSize={{ base: "2xl", xl: "4xl" }} color="white" fontWeight="black" lineHeight={0.9} textAlign={align}>
      {team.shortName}
    </Text>
    <Text mt={1} fontSize="10px" color="rgba(255,255,255,0.62)" fontWeight="black" textTransform="uppercase" textAlign={align} lineClamp={1}>
      {record}
    </Text>
  </Flex>
);

const UpcomingBrief = ({ selectedGame, selectedColor, selectedAccent }) => {
  const { away, home } = buildTeams(selectedGame, null);
  const raw = selectedGame?.rawGame ?? {};
  const dateLabel = selectedGame?.dateLabel ?? displayText(raw.date);
  const kickoffLabel = formatKickoff(raw.kickoff);
  const venue = displayText(raw.stadium_name ?? raw.stadium ?? selectedGame?.venue, "Venue TBD");
  const city = displayText(raw.venue_city ?? raw.site ?? raw.venue, "Site TBD");
  const gameType = selectedGame?.tag ?? (raw.conference_game ? "Conference" : "Game");
  const awayRecord = getRecord(raw, "away");
  const homeRecord = getRecord(raw, "home");

  /*
   * Future weekly-intelligence layer:
   * once the advanced system is ready, add a one-line matchup context and
   * 2-3 watch points here from real computed data only.
   */
  const scheduleFacts = [
    { label: "Kickoff", value: `${dateLabel} | ${kickoffLabel}`, icon: <CalendarDays size={15} /> },
    { label: "Venue", value: venue, icon: <MapPin size={15} /> },
    { label: "Site", value: city, icon: <MapPin size={15} /> },
    { label: "Game Type", value: gameType, icon: <Trophy size={15} /> },
  ];

  return (
    <Panel selectedColor={selectedColor}>
      <Flex h="100%" direction="column" bg={`linear-gradient(160deg, ${selectedColor} 0%, #151518 48%, #0B0B0D 100%)`}>
        <Box h="118px" position="relative" overflow="hidden">
          <Box position="absolute" inset={0} bg={`linear-gradient(120deg, ${away.color} 0%, #111113 46%, ${home.color} 100%)`} />
          <Box position="absolute" inset={0} bg="rgba(0,0,0,0.28)" />
          <Flex position="absolute" left={4} right={4} bottom={3} align="end" justify="space-between">
            <Box>
              <SectionLabel color="whiteAlpha.700">Schedule Brief</SectionLabel>
              <Text mt={2} fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
                Upcoming Matchup
              </Text>
            </Box>
            <StatusPill>{gameType}</StatusPill>
          </Flex>
        </Box>

        <Flex direction="column" flex="1" minH={0} px={{ base: 3, xl: 4 }} py={{ base: 3, xl: 4 }} overflow="auto">
          <Grid
            templateColumns="minmax(0, 1fr) 42px minmax(0, 1fr)"
            alignItems="center"
            gap={3}
            pb={5}
            borderBottom="1px solid"
            borderColor={`${selectedAccent}55`}
          >
            <UpcomingTeamBlock team={away} record={awayRecord} />
            <Flex direction="column" align="center" gap={2}>
              <Text fontSize="9px" color="rgba(255,255,255,0.56)" fontWeight="black">
                AT
              </Text>
              <Box w="1px" h="42px" bg={`${selectedAccent}88`} />
            </Flex>
            <UpcomingTeamBlock team={home} record={homeRecord} align="right" />
          </Grid>

          <Box mt={2}>
            {scheduleFacts.map((fact) => (
              <ScheduleInfoRow key={fact.label} icon={fact.icon} label={fact.label} value={fact.value} />
            ))}
          </Box>

          <Box mt={4} p={4} borderRadius="md" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(255,255,255,0.06)">
            <SectionLabel color={selectedAccent}>Pregame Status</SectionLabel>
            <Grid mt={3} templateColumns="1fr 1fr" gap={3}>
              <Box>
                <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>Upcoming</Text>
                <Text mt={1} fontSize="9px" color="rgba(255,255,255,0.56)" fontWeight="black" textTransform="uppercase">
                  Game status
                </Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>{raw.has_game_page ? "Ready" : "Pending"}</Text>
                <Text mt={1} fontSize="9px" color="rgba(255,255,255,0.56)" fontWeight="black" textTransform="uppercase">
                  Game center
                </Text>
              </Box>
            </Grid>
          </Box>

          {selectedGame?.route && (
            <Box mt="auto" pt={4}>
              <Box as={Link} to={selectedGame.route} display="inline-flex" alignItems="center" gap={2} px={4} py={2.5} borderRadius="md" bg="white" color="black">
                <Text fontSize="9px" fontWeight="black" textTransform="uppercase">Open Game Center</Text>
                <ExternalLink size={13} />
              </Box>
            </Box>
          )}
        </Flex>
      </Flex>
    </Panel>
  );
};

export const WeekCentralBrief = ({
  selectedGame,
  parsedGame,
  playerSeasons = [],
  priorPlayerSeasons = [],
  leagueAvg = null,
  isLoading = false,
  selectedColor = "#E53E3E",
  selectedAccent = "#FFFFFF",
}) => {
  const { isMobile } = useLayoutDensity();

  if (selectedGame?.status !== "final") {
    return (
      <UpcomingBrief
        selectedGame={selectedGame}
        selectedColor={selectedColor}
        selectedAccent={selectedAccent}
      />
    );
  }

  const game = buildBriefData({ selectedGame, parsedGame, playerSeasons, priorPlayerSeasons, leagueAvg });
  const awayColor = game.away.accent ?? game.away.secondary ?? game.away.color;
  const homeColor = game.home.accent ?? game.home.secondary ?? game.home.color;

  return (
    <Panel selectedColor={selectedColor}>
      <Flex
        h="100%"
        direction="column"
        bg={selectedColor}
      >
        <Box h="7.375rem" position="relative" overflow="hidden">
          <Image src={DEFAULT_IMAGE} alt="Default stadium" w="100%" h="100%" objectFit="cover" transform={isMobile ? "scale(1.35)" : "none"} />
          <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(8,23,38,0.08) 0%, rgba(8,23,38,0.82) 100%)" />
          <Flex position="absolute" inset={0} direction="column" align="center" justify="center" gap="0.35rem" px="1rem" textAlign="center">
            <SectionLabel color="whiteAlpha.700">{game.label}</SectionLabel>
            <Flex align="center" gap="0.5rem">
              <Text fontSize="xl" color="white" fontWeight="black">{game.away.shortName}</Text>
              <Text fontSize="0.625rem" color="whiteAlpha.600" fontWeight="black">AT</Text>
              <Text fontSize="xl" color="white" fontWeight="black">{game.home.shortName}</Text>
            </Flex>
            <StatusPill>{game.tag}</StatusPill>
          </Flex>
        </Box>

        <Flex direction="column" gap={{ base: 3, xl: 4 }} px={{ base: 3, xl: 4 }} py={{ base: 3, xl: 4 }} overflow="auto">
          {isLoading && (
            <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Loading game file...
            </Text>
          )}

          {game.lineScore.length > 0 && <LineScoreTable game={game} selectedAccent={selectedAccent} />}

          <BriefPerformers
            performers={game.performers}
            homeId={game.home.id}
            awayColor={awayColor}
            homeColor={homeColor}
            accent={selectedAccent}
          />

          <BriefTeamStats
            rows={game.teamStats}
            awayId={game.away.id}
            homeId={game.home.id}
            awayColor={awayColor}
            homeColor={homeColor}
            accent={selectedAccent}
          />

          <Box>
            <SectionLabel color={selectedAccent}>Game Leaders</SectionLabel>
            <Box
              mt={{ base: 2, xl: 3 }}
              bg="rgba(0,0,0,0.18)"
              borderTop="1px solid"
              borderBottom="1px solid"
              borderColor="rgba(255,255,255,0.14)"
              mx={isMobile ? -3 : 0}
            >
              {game.leaders.map((leader) => (
                isMobile
                  ? <LeaderRowMobile key={leader.label} item={leader} awayColor={awayColor} homeColor={homeColor} />
                  : <LeaderRow key={leader.label} item={leader} awayColor={awayColor} homeColor={homeColor} />
              ))}
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Panel>
  );
};
