import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { GameBoxScoreFull } from "./GameBoxScore";
import teamsData from "../../data/teams.json";
import { gameCenterPaths } from "../../utils/gameCenterPayloads";
import { cleanName, fmt, pct } from "../../utils/gameHelpers";

// ─── Team metadata ────────────────────────────────────────────────────────────

const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

const getTeamLabel = (id) => TEAM_META[id]?.shortName ?? id?.toUpperCase() ?? "—";
const getTeamName = (id) => TEAM_META[id]?.name ?? getTeamLabel(id);
const getTeamColor = (id, fallback = "#E53E3E") => TEAM_META[id]?.colors?.primary ?? fallback;
const getTeamLogoSrc = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;

// ─── Data fetchers ────────────────────────────────────────────────────────────

const fetchGame = async (gameId) => {
  const indexRes = await fetch(gameCenterPaths.gamesIndex());
  if (!indexRes.ok) throw new Error("Failed to load game index");
  const gameIndex = await indexRes.json();
  const requested = String(gameId ?? "").trim();
  const requestedUpper = requested.toUpperCase();

  let match = gameIndex.find(
    (e) =>
      String(e.game_stem).toLowerCase() === requested.toLowerCase() ||
      String(e.game_id).toUpperCase() === requestedUpper,
  );

  if (!match && requested.toLowerCase() === "pvamutsu") {
    match =
      gameIndex.find((e) => e.game_stem === "W1pvamutsu") ??
      [...gameIndex]
        .filter((e) => String(e.game_stem).toLowerCase().includes("pvamutsu"))
        .sort((a, b) => Number(b.season) - Number(a.season))[0];
  }

  if (!match) throw new Error("Game data not found");
  const res = await fetch(gameCenterPaths.gameFile(match.season, match.game_stem));
  if (!res.ok) throw new Error("Failed to load game payload");
  return res.json();
};

const fetchPlayerImages = async () => {
  const res = await fetch("/data/2-schools/ALL_2025_teams_frontend_ready_v2.json");
  if (!res.ok) return {};
  const data = await res.json();
  const map = {};
  Object.values(data.teams ?? {}).forEach((team) =>
    (team.roster ?? []).forEach((p) => { if (p.id && p.image_url) map[p.id] = p.image_url; }),
  );
  return map;
};

// ─── Shared panel card ────────────────────────────────────────────────────────

const SectionShell = ({ title, children, minH }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    overflow="hidden"
    minH={minH}
    mb={3}
  >
    {title && (
      <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
        <Text fontSize="xs" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="widest">
          {title}
        </Text>
      </Box>
    )}
    <Box p={4}>{children}</Box>
  </Box>
);

// ─── Banner ───────────────────────────────────────────────────────────────────

const BANNER_SECTIONS = [
  { id: "summary", label: "Game Summary" },
  { id: "boxscore", label: "Box Score" },
  { id: "teamstats", label: "Team Stats" },
  { id: "pbp", label: "Play by Play" },
];

const TeamBlock = ({ teamId, score, isHome }) => {
  const meta = TEAM_META[teamId] ?? {};
  const logoSrc = `/assets/${teamId?.replace(/25$/, "")}.svg`;
  return (
    <Flex
      flex={1}
      direction={isHome ? "row-reverse" : "row"}
      align="center"
      gap={4}
      px={5}
    >
      <Image src={logoSrc} h="52px" w="52px" objectFit="contain" opacity={0.9} flexShrink={0} />
      <Box textAlign={isHome ? "right" : "left"} minW={0}>
        <Text fontSize="10px" color="whiteAlpha.500" textTransform="uppercase" letterSpacing="widest">
          {isHome ? "Home" : "Away"}
        </Text>
        <Text fontSize="md" fontWeight="black" color="white" lineHeight={1.2} lineClamp={1}>
          {meta.shortName ?? teamId?.toUpperCase()}
        </Text>
      </Box>
      <Text
        fontSize="4xl"
        fontWeight="black"
        color="white"
        lineHeight={1}
        flexShrink={0}
        ml={isHome ? 0 : "auto"}
        mr={isHome ? "auto" : 0}
      >
        {score ?? 0}
      </Text>
    </Flex>
  );
};

// eslint-disable-next-line no-unused-vars
const GameBanner = ({ meta, activeSection, onSection }) => {
  const away = meta?.away_team ?? {};
  const home = meta?.home_team ?? {};

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" overflow="hidden">
      <Flex h="full">
        {/* Score side — 75% */}
        <Flex flex={3} align="stretch">
          <TeamBlock teamId={away.id} score={away.score} isHome={false} />
          <Flex
            direction="column"
            align="center"
            justify="center"
            px={5}
            flexShrink={0}
            borderLeft="1px solid"
            borderRight="1px solid"
            borderColor="whiteAlpha.100"
            minW="140px"
          >
            <Text fontSize="xs" color="brand.400" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
              Final
            </Text>
            <Text fontSize="xs" color="whiteAlpha.600" mt={1}>{meta?.date}</Text>
            <Text fontSize="10px" color="whiteAlpha.400" mt={1} textAlign="center" maxW="120px" lineClamp={2}>
              {meta?.site}
            </Text>
          </Flex>
          <TeamBlock teamId={home.id} score={home.score} isHome={true} />
        </Flex>

        {/* Controls — 25% */}
        <Flex
          flex={1}
          direction="column"
          borderLeft="1px solid"
          borderColor="whiteAlpha.100"
          justify="center"
          px={3}
          gap={1}
        >
          {BANNER_SECTIONS.map((s) => {
            const active = activeSection === s.id;
            return (
              <Box
                key={s.id}
                as="button"
                px={3}
                py={2}
                borderRadius="lg"
                bg={active ? "brand.500" : "transparent"}
                border="1px solid"
                borderColor={active ? "brand.500" : "whiteAlpha.100"}
                onClick={() => onSection(s.id)}
                textAlign="left"
                _hover={{ bg: active ? "brand.500" : "whiteAlpha.50" }}
                transition="all 0.15s"
              >
                <Text fontSize="xs" fontWeight={active ? "bold" : "medium"} color={active ? "white" : "whiteAlpha.600"}>
                  {s.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

// ─── Team Metrics ─────────────────────────────────────────────────────────────

const GamePageBanner = ({ meta, activeSection, onSection }) => {
  const away = meta?.away_team ?? {};
  const home = meta?.home_team ?? {};
  const awayColor = getTeamColor(away.id, "#E53E3E");
  const homeColor = getTeamColor(home.id, "#4A90E2");
  const winner = Number(away.score ?? 0) > Number(home.score ?? 0) ? away : home;
  const margin = Math.abs(Number(away.score ?? 0) - Number(home.score ?? 0));

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" bg="#08080A" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}55 0%, #08080A 34%, #08080A 66%, ${homeColor}55 100%)`} />
      <Text
        position="absolute"
        left="50%"
        top="-7%"
        transform="translateX(-50%)"
        fontSize="clamp(4.5rem, 13vw, 11rem)"
        lineHeight={0.8}
        fontWeight="black"
        color="whiteAlpha.100"
        textTransform="uppercase"
        whiteSpace="nowrap"
      >
        Final
      </Text>

      <Grid position="relative" zIndex={1} templateColumns={{ base: "1fr", lg: "minmax(0, 1fr) 190px minmax(0, 1fr)" }} gap={6} alignItems="center" p={{ base: 5, lg: 8 }} pb={{ base: 3, lg: 4 }}>
        <Flex direction="row" align="center" gap={4} minW={0}>
          <Image src={getTeamLogoSrc(away.id)} alt="" h="clamp(56px, 8vw, 104px)" maxW="120px" objectFit="contain" opacity={0.95} />
          <Box textAlign="left" minW={0}>
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Away
            </Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">
              {getTeamLabel(away.id)}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>
              {getTeamName(away.id)}
            </Text>
          </Box>
          <Text fontSize="clamp(3.2rem, 8vw, 7rem)" color="white" fontWeight="black" lineHeight={0.85} ml="auto">
            {away.score ?? 0}
          </Text>
        </Flex>

        <Flex direction="column" align="center" gap={3} minW={{ base: "100%", lg: "190px" }}>
          <Box px={3} py={1} bg="brand.500">
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
              Final
            </Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase" textAlign="center">
            {getTeamLabel(winner.id)} by {margin}
          </Text>
          <Text fontSize="10px" color="whiteAlpha.600" textAlign="center" lineClamp={2}>
            {meta?.date} | {meta?.site}
          </Text>
        </Flex>

        <Flex direction="row-reverse" align="center" gap={4} minW={0}>
          <Image src={getTeamLogoSrc(home.id)} alt="" h="clamp(56px, 8vw, 104px)" maxW="120px" objectFit="contain" opacity={0.95} />
          <Box textAlign="right" minW={0}>
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Home
            </Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">
              {getTeamLabel(home.id)}
            </Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>
              {getTeamName(home.id)}
            </Text>
          </Box>
          <Text fontSize="clamp(3.2rem, 8vw, 7rem)" color="white" fontWeight="black" lineHeight={0.85} mr="auto">
            {home.score ?? 0}
          </Text>
        </Flex>
      </Grid>

      <Flex position="relative" zIndex={1} justify="space-between" align="center" gap={4} px={{ base: 5, lg: 8 }} pb={5} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {BANNER_SECTIONS.map((section) => {
            const active = activeSection === section.id;
            return (
              <Box
                key={section.id}
                as="button"
                px={3}
                py={2}
                border="1px solid"
                borderColor={active ? "brand.500" : "whiteAlpha.100"}
                bg={active ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"}
                onClick={() => onSection(section.id)}
                transition="all 0.15s"
                _hover={{ bg: active ? "rgba(229,62,62,0.24)" : "whiteAlpha.100" }}
              >
                <Text fontSize="10px" fontWeight="black" color={active ? "white" : "text.muted"} textTransform="uppercase" letterSpacing="0.12em">
                  {section.label}
                </Text>
              </Box>
            );
          })}
        </Flex>
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">
          Attendance {meta?.attendance?.toLocaleString?.() ?? "-"} | Kick {meta?.kickoff_time ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
};

const DualStatRow = ({ label, awayVal, homeVal, awayDisplay, homeDisplay, format, dec, lowerIsBetter }) => {
  const f = format ?? ((v) => fmt(v, dec ?? 0));
  const total = (awayVal ?? 0) + (homeVal ?? 0);
  const awayPct = total > 0 ? ((awayVal ?? 0) / total) * 100 : 50;
  const awayWins =
    awayVal != null && homeVal != null
      ? lowerIsBetter ? awayVal <= homeVal : awayVal >= homeVal
      : null;

  return (
    <Box py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">
      <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center" mb={1}>
        <Text fontSize="xs" fontWeight="bold" color={awayWins === true ? "brand.400" : "text.primary"}>
          {awayDisplay ?? f(awayVal)}
        </Text>
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider" textAlign="center" minW="80px">
          {label}
        </Text>
        <Text fontSize="xs" fontWeight="bold" color={awayWins === false ? "brand.400" : "text.primary"} textAlign="right">
          {homeDisplay ?? f(homeVal)}
        </Text>
      </Grid>
      <Flex h="3px" borderRadius="full" overflow="hidden">
        <Box flex={`0 0 ${awayPct}%`} bg={awayWins !== false ? "brand.500" : "whiteAlpha.200"} />
        <Box flex={`0 0 ${100 - awayPct}%`} bg={awayWins === false ? "brand.500" : "whiteAlpha.200"} />
      </Flex>
    </Box>
  );
};

const TeamMetricsPanel = ({ awayId, homeId, teamBox, advancedTeam }) => {
  const aBox = teamBox[awayId] ?? {};
  const hBox = teamBox[homeId] ?? {};
  const aAdv = advancedTeam[awayId] ?? {};
  const hAdv = advancedTeam[homeId] ?? {};

  const rows = [
    { label: "EPA / Play", ak: "epa_per_play", src: "adv", dec: 2 },
    { label: "Success Rate", ak: "success_rate", src: "adv", format: pct },
    { label: "Yards / Play", ak: null, src: "calc", dec: 1 },
    { label: "EPA / Rush", ak: "epa_per_rush", src: "adv", dec: 2 },
    { label: "EPA / Pass", ak: "epa_per_pass", src: "adv", dec: 2 },
    { label: "Explosive Rate", ak: "explosive_rate_yardage", src: "adv", format: pct },
    { label: "3rd Down", ak: "third_down_conversion_rate", src: "box", format: pct },
    { label: "Red Zone TD%", ak: "red_zone_td_rate", src: "adv", format: pct },
    { label: "Stuff Rate", ak: "stuff_rate", src: "adv", format: pct, lowerIsBetter: true },
    { label: "Havoc Rate", ak: "havoc_rate_forced", src: "adv", format: pct },
  ];

  return (
    <SectionShell title="Team Metrics">
      <Grid templateColumns="1fr 1fr" gap={0} mb={2}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {rows.map((row) => {
        let av, hv;
        if (row.src === "calc") {
          av = aBox.plays_offense > 0 ? (aBox.total_yards ?? 0) / aBox.plays_offense : null;
          hv = hBox.plays_offense > 0 ? (hBox.total_yards ?? 0) / hBox.plays_offense : null;
        } else {
          const aData = row.src === "adv" ? aAdv : aBox;
          const hData = row.src === "adv" ? hAdv : hBox;
          av = aData[row.ak];
          hv = hData[row.ak];
        }
        return (
          <DualStatRow
            key={row.label}
            label={row.label}
            awayVal={av}
            homeVal={hv}
            format={row.format}
            dec={row.dec}
            lowerIsBetter={row.lowerIsBetter}
          />
        );
      })}
    </SectionShell>
  );
};

// ─── Game Leaders ─────────────────────────────────────────────────────────────

const PlayerAvatar = ({ playerKey, name, imageMap, size = "40px" }) => {
  const imgUrl = imageMap[playerKey];
  return (
    <Box w={size} h={size} borderRadius="full" overflow="hidden" bg="whiteAlpha.100" flexShrink={0}>
      {imgUrl
        ? <Image src={imgUrl} w="full" h="full" objectFit="cover" />
        : <Flex w="full" h="full" align="center" justify="center">
            <Text fontSize="xs" fontWeight="black" color="text.muted">{name?.[0] ?? "?"}</Text>
          </Flex>
      }
    </Box>
  );
};

const LeaderMatchup = ({ category, away, home, imageMap }) => {
  const side = (player, isHome) => {
    if (!player) {
      return (
        <Flex flex={1} direction={isHome ? "row-reverse" : "row"} align="center" gap={2} minW={0}>
          <Box w="40px" h="40px" borderRadius="full" bg="whiteAlpha.50" flexShrink={0} />
          <Text fontSize="xs" color="text.muted">—</Text>
        </Flex>
      );
    }
    const initial = player.name?.split(" ")[0]?.[0] ?? "";
    return (
      <Flex flex={1} direction={isHome ? "row-reverse" : "row"} align="center" gap={2} minW={0}>
        <PlayerAvatar playerKey={player.playerKey} name={player.name} imageMap={imageMap} />
        <Box minW={0} textAlign={isHome ? "right" : "left"}>
          <Text fontSize="xl" fontWeight="black" color="brand.400" lineHeight={1}>
            {player.statValue}
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary" lineClamp={1}>
            {initial}. {player.name?.split(" ").slice(1).join(" ")}
            <Text as="span" fontSize="9px" color="text.muted" ml={1}>{player.position}</Text>
          </Text>
          <Text fontSize="9px" color="text.muted" lineClamp={1}>{player.statLine}</Text>
        </Box>
      </Flex>
    );
  };

  return (
    <Box py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest" textAlign="center" mb={2}>
        {category}
      </Text>
      <Flex align="center" gap={3}>
        {side(away, false)}
        <Box w="1px" h="40px" bg="whiteAlpha.100" flexShrink={0} />
        {side(home, true)}
      </Flex>
    </Box>
  );
};

const GameLeadersPanel = ({ awayId, homeId, teamEntries, imageMap }) => {
  const byTeam = (tid, key) => {
    const entry = teamEntries.find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? [];
  };

  const topOf = (arr, field) => [...arr].sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0];

  const awayPasser = topOf(byTeam(awayId, "passing"), "yards");
  const homePasser = topOf(byTeam(homeId, "passing"), "yards");

  const awayRusher = topOf(byTeam(awayId, "rushing"), "yards");
  const homeRusher = topOf(byTeam(homeId, "rushing"), "yards");

  const awayReceiver = topOf(byTeam(awayId, "receiving"), "yards");
  const homeReceiver = topOf(byTeam(homeId, "receiving"), "yards");

  const havocScore = (p) =>
    (p.tfl ?? 0) + (p.sacks ?? 0) + (p.passes_defended ?? 0) + (p.interceptions ?? 0) + (p.forced_fumbles ?? 0);
  const awayHavoc = [...byTeam(awayId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];
  const homeHavoc = [...byTeam(homeId, "defense")].sort((a, b) => havocScore(b) - havocScore(a))[0];

  const awayTackler = topOf(byTeam(awayId, "defense"), "tackles");
  const homeTackler = topOf(byTeam(homeId, "defense"), "tackles");

  const passerCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "QB",
    statValue: `${p.yards ?? 0}`, statLine: `${p.completions ?? 0}/${p.attempts ?? 0}, ${p.touchdowns ?? 0} TD, ${p.interceptions ?? 0} INT`,
  } : null;

  const rusherCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "RB",
    statValue: `${p.yards ?? 0}`, statLine: `${p.attempts ?? 0} car, ${p.touchdowns ?? 0} TD`,
  } : null;

  const receiverCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "WR",
    statValue: `${p.yards ?? 0}`, statLine: `${p.receptions ?? 0} rec, ${p.touchdowns ?? 0} TD`,
  } : null;

  const havocCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "DEF",
    statValue: `${havocScore(p)}`, statLine: `${p.tfl ?? 0} TFL, ${p.sacks ?? 0} SK, ${p.passes_defended ?? 0} PD`,
  } : null;

  const tacklerCard = (p) => p ? {
    playerKey: p.player_key, name: cleanName(p.name), position: p.position ?? "DEF",
    statValue: `${p.tackles ?? 0}`, statLine: `${p.solo_tackles ?? 0} solo, ${p.tfl ?? 0} TFL`,
  } : null;

  const matchups = [
    { category: "Passing Yards", away: passerCard(awayPasser), home: passerCard(homePasser) },
    { category: "Rushing Yards", away: rusherCard(awayRusher), home: rusherCard(homeRusher) },
    { category: "Receiving Yards", away: receiverCard(awayReceiver), home: receiverCard(homeReceiver) },
    { category: "Havoc Leader", away: havocCard(awayHavoc), home: havocCard(homeHavoc) },
    { category: "Tackles", away: tacklerCard(awayTackler), home: tacklerCard(homeTackler) },
  ];

  return (
    <SectionShell title="Game Leaders">
      <Grid templateColumns="1fr 1fr" gap={0} mb={1}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {matchups.map((m) => (
        <LeaderMatchup key={m.category} {...m} imageMap={imageMap} />
      ))}
    </SectionShell>
  );
};

// ─── Team Stats ───────────────────────────────────────────────────────────────

const fraction = (conv, att) =>
  att != null ? `${conv ?? 0}/${att}` : "—";

const TeamStatsPanel = ({ awayId, homeId, teamBox }) => {
  const aBox = teamBox[awayId] ?? {};
  const hBox = teamBox[homeId] ?? {};

  const rows = [
    {
      label: "Total Yards",
      av: aBox.total_yards, hv: hBox.total_yards,
    },
    {
      label: "Turnovers",
      av: aBox.turnovers_committed, hv: hBox.turnovers_committed,
      lowerIsBetter: true,
    },
    {
      label: "3rd Down",
      av: aBox.third_down_conversions, hv: hBox.third_down_conversions,
      aDisplay: fraction(aBox.third_down_conversions, aBox.third_down_attempts),
      hDisplay: fraction(hBox.third_down_conversions, hBox.third_down_attempts),
    },
    {
      label: "4th Down",
      av: aBox.fourth_down_go_conversions, hv: hBox.fourth_down_go_conversions,
      aDisplay: fraction(aBox.fourth_down_go_conversions, aBox.fourth_down_goes),
      hDisplay: fraction(hBox.fourth_down_go_conversions, hBox.fourth_down_goes),
    },
  ];

  return (
    <SectionShell title="Team Stats">
      <Grid templateColumns="1fr 1fr" gap={0} mb={2}>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary">{getTeamLabel(awayId)}</Text>
        <Text fontSize="10px" fontWeight="bold" color="text.secondary" textAlign="right">{getTeamLabel(homeId)}</Text>
      </Grid>
      {rows.map((row) => (
        <DualStatRow
          key={row.label}
          label={row.label}
          awayVal={row.av}
          homeVal={row.hv}
          awayDisplay={row.aDisplay}
          homeDisplay={row.hDisplay}
          lowerIsBetter={row.lowerIsBetter}
        />
      ))}
    </SectionShell>
  );
};

// ─── Game Info ────────────────────────────────────────────────────────────────

const GameInfoPanel = ({ meta }) => {
  const rows = [
    { label: "Date", value: meta?.date },
    { label: "Site", value: meta?.site },
    { label: "Season", value: meta?.season },
    { label: "Week", value: meta?.week != null ? `Week ${meta.week}` : null },
    { label: "Attendance", value: meta?.attendance?.toLocaleString() },
  ].filter((r) => r.value);

  return (
    <SectionShell title="Game Info">
      {rows.map((r) => (
        <Flex key={r.label} justify="space-between" py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
          <Text fontSize="xs" color="text.muted">{r.label}</Text>
          <Text fontSize="xs" fontWeight="medium" color="text.primary" textAlign="right" maxW="60%" lineClamp={1}>
            {r.value}
          </Text>
        </Flex>
      ))}
    </SectionShell>
  );
};

// ─── Drives Panel (middle col) ────────────────────────────────────────────────

const RESULT_COLOR = {
  Touchdown: "green.400",
  "Field Goal": "blue.300",
  Punt: "text.muted",
  Turnover: "red.400",
  "Turnover on Downs": "red.400",
  Interception: "red.400",
  Fumble: "red.400",
};

const DriveRow = ({ drive, awayShort, homeShort, awayId }) => {
  const isAway = drive.team === awayId || String(drive.team).toLowerCase() === awayShort.toLowerCase();
  const teamLabel = isAway ? awayShort : homeShort;
  const resultColor = RESULT_COLOR[drive.result] ?? "text.muted";

  return (
    <Grid
      templateColumns="28px 1fr auto auto"
      gap={3}
      py={2.5}
      px={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      alignItems="center"
      _hover={{ bg: "whiteAlpha.50" }}
    >
      <Text fontSize="10px" color="text.muted">Q{drive.quarter}</Text>
      <Box minW={0}>
        <Flex gap={2} align="center">
          <Text fontSize="xs" fontWeight="bold" color="text.primary">{teamLabel}</Text>
          <Text fontSize="10px" color="text.muted">
            {drive.plays} plays · {drive.yards > 0 ? "+" : ""}{drive.yards} yds
          </Text>
        </Flex>
        {drive.score && <Text fontSize="10px" color="brand.400" fontWeight="bold">{drive.score}</Text>}
      </Box>
      <Text fontSize="xs" color={resultColor} fontWeight="medium" textAlign="right" minW="90px" lineClamp={1}>
        {drive.result}
      </Text>
      <Text fontSize="10px" color="text.muted" minW="36px" textAlign="right">{drive.start_time}</Text>
    </Grid>
  );
};

const ScoringPlayRow = ({ play, awayId, awayShort, homeShort }) => {
  const isAway = play.offense_team === awayId;
  const teamLabel = isAway ? awayShort : homeShort;
  const isScoring = play.scoring_event === true;
  const scoreStr =
    play.score_away_after != null
      ? `${awayShort} ${play.score_away_after} – ${play.score_home_after} ${homeShort}`
      : null;

  return (
    <Grid
      templateColumns="44px auto 1fr"
      gap={3}
      py={2.5}
      px={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      alignItems="start"
      _hover={{ bg: "whiteAlpha.50" }}
    >
      <Text fontSize="9px" color="text.muted" mt="2px" lineHeight={1.4}>
        Q{play.quarter}{"\n"}{play.clock}
      </Text>
      <Box
        px={2}
        py={0.5}
        bg={isScoring ? "green.900" : "whiteAlpha.100"}
        borderRadius="md"
        mt="1px"
        flexShrink={0}
      >
        <Text fontSize="9px" fontWeight="bold" color={isScoring ? "green.300" : "text.muted"} lineClamp={1} textTransform="uppercase">
          {play.scoring_type ?? "Key Play"}
        </Text>
      </Box>
      <Box minW={0}>
        <Text fontSize="xs" color="text.primary" lineClamp={3}>{play.raw_text}</Text>
        <Flex gap={3} mt={0.5}>
          {scoreStr && <Text fontSize="10px" color="brand.400" fontWeight="bold">{scoreStr}</Text>}
          <Text fontSize="10px" color="text.muted">{teamLabel}</Text>
        </Flex>
      </Box>
    </Grid>
  );
};

const DrivesPanel = ({ drives, plays, awayId, homeId, awayShort, homeShort }) => {
  const [view, setView] = useState("scoring");

  const keyPlays = (plays ?? []).filter(
    (p) => p.scoring_event === true || Math.abs(p.wpa?.wpa ?? 0) >= 0.05,
  );

  return (
    <SectionShell title={null}>
      <Flex gap={2} mb={4}>
        {[
          { id: "scoring", label: "Important / Scoring Plays" },
          { id: "drives", label: "All Drives" },
        ].map((tab) => {
          const active = view === tab.id;
          return (
            <Box
              key={tab.id}
              as="button"
              px={4}
              py={2}
              borderRadius="lg"
              bg={active ? "brand.500" : "bg.secondary"}
              border="1px solid"
              borderColor={active ? "brand.500" : "whiteAlpha.100"}
              onClick={() => setView(tab.id)}
            >
              <Text fontSize="xs" fontWeight={active ? "bold" : "medium"} color={active ? "white" : "text.muted"}>
                {tab.label}
              </Text>
            </Box>
          );
        })}
      </Flex>

      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
        {view === "scoring" && (
          keyPlays.length > 0
            ? keyPlays.map((p, i) => (
                <ScoringPlayRow key={i} play={p} awayId={awayId} awayShort={awayShort} homeShort={homeShort} />
              ))
            : <Flex justify="center" py={10}><Text color="text.muted" fontSize="sm">No key plays found.</Text></Flex>
        )}
        {view === "drives" && (
          drives.length > 0
            ? drives.map((d, i) => (
                <DriveRow key={i} drive={d} awayId={awayId} awayShort={awayShort} homeShort={homeShort} />
              ))
            : <Flex justify="center" py={10}><Text color="text.muted" fontSize="sm">No drive data.</Text></Flex>
        )}
      </Box>
    </SectionShell>
  );
};

// ─── Right column panels ──────────────────────────────────────────────────────

const GloryMVPPanel = ({ awayId, homeId, productionScores, imageMap }) => {
  const allPlayers = [
    ...(productionScores[awayId] ?? []),
    ...(productionScores[homeId] ?? []),
  ].sort((a, b) => (b.production_total ?? 0) - (a.production_total ?? 0));

  const mvp = allPlayers[0];
  if (!mvp) return <SectionShell title="Glory MVP"><Text color="text.muted" fontSize="sm">No data.</Text></SectionShell>;

  const mvpTeamId = Object.entries(productionScores).find(([, players]) =>
    players.some((p) => p.player_key === mvp.player_key),
  )?.[0];
  const imgUrl = imageMap[mvp.player_key];

  return (
    <SectionShell title="Glory MVP">
      <Flex align="center" gap={4} mb={4}>
        <Box w="56px" h="56px" borderRadius="full" overflow="hidden" bg="whiteAlpha.100" flexShrink={0}>
          {imgUrl
            ? <Image src={imgUrl} w="full" h="full" objectFit="cover" />
            : <Flex w="full" h="full" align="center" justify="center">
                <Text fontSize="xl" fontWeight="black" color="text.muted">{cleanName(mvp.name)?.[0] ?? "?"}</Text>
              </Flex>
          }
        </Box>
        <Box>
          <Text fontSize="sm" fontWeight="black" color="text.primary">{cleanName(mvp.name)}</Text>
          <Text fontSize="xs" color="text.muted">{mvp.position} · {getTeamLabel(mvpTeamId)}</Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.400" lineHeight={1.1} mt={1}>{fmt(mvp.production_total, 1)}</Text>
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="wider">Production Score</Text>
        </Box>
      </Flex>
      {mvp.components && Object.entries(mvp.components).map(([k, v]) => (
        <Flex key={k} justify="space-between" py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
          <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="wider">{k.replace(/_/g, " ")}</Text>
          <Text fontSize="xs" fontWeight="bold" color="text.primary">{fmt(v, 1)}</Text>
        </Flex>
      ))}
    </SectionShell>
  );
};

const PRODUCTION_BUCKETS = [
  {
    id: "primary",
    label: "Pass / Rec / Hit",
    color: "#081722",
    keys: ["passing_production", "receiving_production", "hit_production"],
  },
  {
    id: "secondary",
    label: "Rush / Hawk",
    color: "#F6C02D",
    keys: ["rushing_production", "hawk_production"],
  },
  {
    id: "tertiary",
    label: "Turnover / Scrum",
    color: "#6B7280",
    keys: ["turnover_production", "scrum_production"],
  },
];

const productionEntries = (teamScores) => {
  if (Array.isArray(teamScores)) return teamScores;
  return Object.entries(teamScores ?? {}).map(([playerKey, row]) => ({
    player_key: playerKey,
    name: row.name ?? row.name_raw,
    position: row.position ?? row.position_assumed,
    production_total: row.production_total ?? row.production_score?.total,
    components: row.components ?? row.production_score ?? {},
  }));
};

const productionBucketsFor = (components = {}) =>
  PRODUCTION_BUCKETS.map((bucket) => ({
    ...bucket,
    value: bucket.keys.reduce((sum, key) => sum + (Number(components[key]) || 0), 0),
  }));

const ProductionLegend = () => (
  <Flex gap={4} wrap="wrap" mt={3}>
    {PRODUCTION_BUCKETS.map((bucket) => (
      <Flex key={bucket.id} align="center" gap={2}>
        <Box w="10px" h="10px" bg={bucket.color} />
        <Text fontSize="9px" color="text.secondary" fontWeight="bold">
          {bucket.label}
        </Text>
      </Flex>
    ))}
  </Flex>
);

const TeamProductionPanel = ({ teamId, productionScores, maxTotal }) => {
  const teamColor = getTeamColor(teamId, "#E53E3E");
  const rows = productionEntries(productionScores)
    .filter((row) => Number(row.production_total) > 0)
    .sort((a, b) => Number(b.production_total ?? 0) - Number(a.production_total ?? 0))
    .slice(0, 12);

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
      minH="420px"
    >
      <Flex align="center" justify="space-between" gap={4} px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={3} minW={0}>
          <Image src={getTeamLogoSrc(teamId)} alt="" h="34px" w="34px" objectFit="contain" />
          <Box minW={0}>
            <Text fontSize="10px" color={teamColor} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Player Production
            </Text>
            <Text fontSize="xl" color="text.primary" fontWeight="black" lineHeight={1} lineClamp={1}>
              {getTeamLabel(teamId)}
            </Text>
          </Box>
        </Flex>
        <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
          Top {rows.length}
        </Text>
      </Flex>

      <Box p={4}>
        <Flex direction="column" gap={2.5}>
          {rows.map((row) => {
            const total = Math.max(0, Number(row.production_total) || 0);
            const buckets = productionBucketsFor(row.components);
            const totalWidth = maxTotal ? Math.max(2, (total / maxTotal) * 100) : 0;

            return (
              <Grid key={row.player_key} templateColumns="145px minmax(0, 1fr) 40px" gap={3} alignItems="center">
                <Box minW={0}>
                  <Text fontSize="11px" color="text.secondary" fontWeight="bold" lineClamp={1}>
                    {cleanName(row.name)}
                  </Text>
                  <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
                    {row.position ?? "ATH"}
                  </Text>
                </Box>

                <Box position="relative" h="14px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  <Flex h="full" w={`${totalWidth}%`} minW={total > 0 ? "4px" : 0}>
                    {buckets
                      .filter((bucket) => bucket.value > 0)
                      .map((bucket) => (
                        <Box
                          key={bucket.id}
                          h="full"
                          bg={bucket.color}
                          style={{ width: `${total ? (bucket.value / total) * 100 : 0}%` }}
                        />
                      ))}
                  </Flex>
                </Box>

                <Text fontSize="11px" color="text.primary" fontWeight="black" textAlign="right">
                  {fmt(total, 1)}
                </Text>
              </Grid>
            );
          })}
        </Flex>
        <ProductionLegend />
      </Box>
    </Box>
  );
};

const GameProductionComparison = ({ awayId, homeId, productionScores }) => {
  const awayRows = productionEntries(productionScores?.[awayId]);
  const homeRows = productionEntries(productionScores?.[homeId]);
  const maxTotal = Math.max(
    1,
    ...[...awayRows, ...homeRows].map((row) => Number(row.production_total) || 0),
  );

  if (!awayRows.length && !homeRows.length) return null;

  return (
    <Box mt={6}>
      <Flex align="end" justify="space-between" gap={4} mb={3}>
        <Box>
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Production Above Replacement
          </Text>
          <Text fontSize="2xl" color="text.primary" fontWeight="black" lineHeight="1">
            Player Production Score
          </Text>
        </Box>
        <Text fontSize="10px" color="text.muted" fontWeight="bold" textAlign="right" maxW="320px">
          Stacked contribution score by player, split into passing/receiving/hit, rushing/hawk, and turnover/scrum buckets.
        </Text>
      </Flex>
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        <TeamProductionPanel teamId={awayId} productionScores={productionScores?.[awayId]} maxTotal={maxTotal} />
        <TeamProductionPanel teamId={homeId} productionScores={productionScores?.[homeId]} maxTotal={maxTotal} />
      </Grid>
    </Box>
  );
};

const StubPanel = ({ title }) => (
  <SectionShell title={title}>
    <Flex justify="center" align="center" minH="80px">
      <Text color="text.muted" fontSize="sm">Coming soon</Text>
    </Flex>
  </SectionShell>
);

// ─── Normalize drive data ─────────────────────────────────────────────────────

const normalizeDrives = (drives) =>
  (drives ?? []).map((d, i) => ({
    team: d.offense_team,
    drive_number: i + 1,
    quarter: d.quarter_start,
    start_time: d.clock_start,
    plays: d.plays_total,
    yards: d.yards_net,
    result: d.result,
    score: d.points > 0 ? `+${d.points} pts` : null,
  }));

const QUARTER_FILTERS = [
  { id: "all", label: "All" },
  { id: 1, label: "Q1" },
  { id: 2, label: "Q2" },
  { id: 3, label: "Q3" },
  { id: 4, label: "Q4" },
  { id: 5, label: "OT" },
];

const DRIVE_RESULT_COLORS = {
  TD: "green.300",
  Touchdown: "green.300",
  FG: "blue.300",
  "Field Goal": "blue.300",
  Punt: "text.muted",
  Downs: "orange.300",
  FUMB: "red.300",
  Fumble: "red.300",
  INT: "red.300",
  Interception: "red.300",
  EndHalf: "text.muted",
  EndGame: "text.muted",
};

const toClockSeconds = (clock) => {
  if (!clock || typeof clock !== "string" || !clock.includes(":")) return null;
  const [minutes, seconds] = clock.split(":").map(Number);
  if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
  return minutes * 60 + seconds;
};

const formatTop = (quarterStart, clockStart, quarterEnd, clockEnd) => {
  const start = toClockSeconds(clockStart);
  const end = toClockSeconds(clockEnd);
  if (start == null || end == null || quarterStart == null || quarterEnd == null) return "—";
  const elapsed = ((quarterEnd - quarterStart) * 15 * 60) + (start - end);
  if (elapsed < 0) return "—";
  const minutes = Math.floor(elapsed / 60);
  const seconds = String(elapsed % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const formatRunningScore = (awayShort, homeShort, awayScore, homeScore) => {
  if (awayScore == null || homeScore == null) return "—";
  return `${awayShort} ${awayScore} - ${homeScore} ${homeShort}`;
};

const isMeaningfulPlay = (play) => {
  const raw = String(play?.raw_text ?? "").trim();
  if (!raw) return false;
  const lowered = raw.toLowerCase();
  if (lowered.includes("drive start at")) return false;
  if (lowered.startsWith("end of game")) return false;
  if (/^[a-z .'-]+ at \d{2}:\d{2}$/i.test(raw)) return false;
  if (/^\w.+ \d{1,2}-\d{1,2} \w.+$/i.test(raw)) return false;
  return play?.play_type != null || play?.down != null || play?.no_play === true;
};

const normalizePlayRows = (plays, awayId, homeId) => {
  let lastKnownOffense = null;

  return (plays ?? [])
    .filter(isMeaningfulPlay)
    .map((play) => {
      const offenseTeam = play.offense_team ?? lastKnownOffense;
      if (offenseTeam) lastKnownOffense = offenseTeam;

      return {
        id: play.play_id ?? `${play.sequence}-${play.quarter}-${play.clock}`,
        quarter: play.quarter,
        clock: play.clock ?? "—",
        offenseTeam,
        rawText: play.raw_text,
        score: formatRunningScore(
          getTeamLabel(awayId),
          getTeamLabel(homeId),
          play.score_away_after,
          play.score_home_after,
        ),
      };
    });
};

const buildDriveRows = (drives, plays, awayId, homeId) => {
  const normalizedPlays = plays ?? [];
  let playCursor = 0;

  return (drives ?? []).map((drive, index) => {
    const startIndex = normalizedPlays.findIndex((play, playIndex) => {
      if (playIndex < playCursor) return false;
      return (
        play?.quarter === drive?.quarter_start &&
        play?.clock === drive?.clock_start &&
        play?.offense_team === drive?.offense_team
      );
    });

    let endIndexExclusive = normalizedPlays.length;
    if (index < (drives?.length ?? 0) - 1) {
      const nextDrive = drives[index + 1];
      const nextStart = normalizedPlays.findIndex((play, playIndex) => {
        if (playIndex <= (startIndex >= 0 ? startIndex : playCursor)) return false;
        return (
          play?.quarter === nextDrive?.quarter_start &&
          play?.clock === nextDrive?.clock_start &&
          play?.offense_team === nextDrive?.offense_team
        );
      });
      if (nextStart >= 0) endIndexExclusive = nextStart;
    }

    if (startIndex >= 0) playCursor = startIndex;

    const slice =
      startIndex >= 0
        ? normalizedPlays.slice(startIndex, endIndexExclusive)
        : [];

    const lastScorePlay = [...slice]
      .reverse()
      .find((play) => play?.score_away_after != null && play?.score_home_after != null);

    return {
      id: drive.drive_id ?? `${drive.offense_team}-${index}`,
      quarter: drive.quarter_start,
      startTime: drive.clock_start ?? "—",
      offenseTeam: drive.offense_team,
      result: drive.result ?? "—",
      description: `${drive.plays_total ?? 0} plays, ${drive.yards_net ?? 0} yds, ${formatTop(
        drive.quarter_start,
        drive.clock_start,
        drive.quarter_end,
        drive.clock_end,
      )} TOP`,
      score: formatRunningScore(
        getTeamLabel(awayId),
        getTeamLabel(homeId),
        lastScorePlay?.score_away_after ?? 0,
        lastScorePlay?.score_home_after ?? 0,
      ),
    };
  });
};

const QuarterFilters = ({ activeQuarter, onChange }) => (
  <Flex wrap="wrap" gap={2}>
    {QUARTER_FILTERS.map((filter) => {
      const active = activeQuarter === filter.id;
      return (
        <Box
          key={filter.id}
          as="button"
          px={3}
          py={1.5}
          borderRadius="full"
          border="1px solid"
          borderColor={active ? "brand.500" : "whiteAlpha.100"}
          bg={active ? "brand.500" : "transparent"}
          color={active ? "white" : "text.secondary"}
          onClick={() => onChange(filter.id)}
          _hover={{ bg: active ? "brand.500" : "whiteAlpha.50" }}
          transition="all 0.15s"
        >
          <Text fontSize="10px" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
            {filter.label}
          </Text>
        </Box>
      );
    })}
  </Flex>
);

const TableSection = ({ title, count, collapsed, onToggle, children }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="2xl"
    overflow="hidden"
  >
    <Flex
      align="center"
      justify="space-between"
      px={5}
      py={4}
      borderBottom={collapsed ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      bg="linear-gradient(90deg, rgba(229,62,62,0.08) 0%, transparent 60%)"
    >
      <Box>
        <Text fontSize="10px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="widest">
          Game Log
        </Text>
        <Text fontSize="sm" fontWeight="black" color="text.primary">
          {title}
        </Text>
      </Box>
      <Flex align="center" gap={3}>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="widest">
          {count} rows
        </Text>
        <Box
          as="button"
          onClick={onToggle}
          w="32px"
          h="32px"
          borderRadius="full"
          border="1px solid"
          borderColor="whiteAlpha.100"
          bg="whiteAlpha.50"
          color="text.secondary"
          _hover={{ bg: "whiteAlpha.100", color: "text.primary" }}
          transition="all 0.15s"
        >
          <Flex align="center" justify="center" w="full" h="full">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Flex>
        </Box>
      </Flex>
    </Flex>
    {!collapsed && children}
  </Box>
);

const TeamLogoMark = ({ teamId }) => (
  <Box
    w="24px"
    h="24px"
    borderRadius="full"
    bg="whiteAlpha.50"
    border="1px solid"
    borderColor="whiteAlpha.100"
    overflow="hidden"
    flexShrink={0}
  >
    <Image src={getTeamLogoSrc(teamId)} w="full" h="full" objectFit="contain" />
  </Box>
);

const DrivesTable = ({ rows }) => (
  <Box overflowX="auto">
    <Box minW="860px">
      <Grid templateColumns="88px 72px 90px 120px 1fr 56px" gap={3} px={5} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
        {["Start Time", "Offense", "Result", "Score", "Description", "Qtr"].map((label) => (
          <Text
            key={label}
            fontSize="10px"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            {label}
          </Text>
        ))}
      </Grid>
      {rows.map((row) => (
        <Grid
          key={row.id}
          templateColumns="88px 72px 90px 120px 1fr 56px"
          gap={3}
          px={5}
          py={3}
          borderBottom="1px solid"
          borderColor="whiteAlpha.50"
          alignItems="center"
          _hover={{ bg: "whiteAlpha.50" }}
        >
          <Text fontSize="xs" color="text.secondary">{row.startTime}</Text>
          <TeamLogoMark teamId={row.offenseTeam} />
          <Text fontSize="xs" fontWeight="bold" color={DRIVE_RESULT_COLORS[row.result] ?? "text.secondary"}>
            {row.result}
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="brand.400">{row.score}</Text>
          <Text fontSize="xs" color="text.primary">{row.description}</Text>
          <Text fontSize="10px" color="text.muted">Q{row.quarter}</Text>
        </Grid>
      ))}
    </Box>
  </Box>
);

const PlaysTable = ({ rows }) => (
  <Box overflowX="auto">
    <Box minW="860px">
      <Grid templateColumns="88px 72px 1fr 160px" gap={3} px={5} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
        {["Time", "Offense", "Play Line", "Score"].map((label) => (
          <Text
            key={label}
            fontSize="10px"
            fontWeight="black"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            {label}
          </Text>
        ))}
      </Grid>
      {rows.map((row) => (
        <Grid
          key={row.id}
          templateColumns="88px 72px 1fr 160px"
          gap={3}
          px={5}
          py={3}
          borderBottom="1px solid"
          borderColor="whiteAlpha.50"
          alignItems="start"
          _hover={{ bg: "whiteAlpha.50" }}
        >
          <Box>
            <Text fontSize="xs" color="text.secondary">{row.clock}</Text>
            <Text fontSize="10px" color="text.muted">Q{row.quarter}</Text>
          </Box>
          <TeamLogoMark teamId={row.offenseTeam} />
          <Text fontSize="xs" color="text.primary" lineHeight={1.6}>
            {row.rawText}
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="brand.400">{row.score}</Text>
        </Grid>
      ))}
    </Box>
  </Box>
);

const EmptyTableState = ({ label }) => (
  <Flex justify="center" align="center" py={12}>
    <Text fontSize="sm" color="text.muted">{label}</Text>
  </Flex>
);

const PlayByPlaySection = ({ driveRows, playRows }) => {
  const [quarter, setQuarter] = useState("all");
  const [drivesCollapsed, setDrivesCollapsed] = useState(false);
  const [playsCollapsed, setPlaysCollapsed] = useState(false);

  const filteredDrives = quarter === "all"
    ? driveRows
    : driveRows.filter((row) => row.quarter === quarter);

  const filteredPlays = quarter === "all"
    ? playRows
    : playRows.filter((row) => row.quarter === quarter);

  return (
    <Box>
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap={4}
        mb={6}
      >
        <Box>
          <Text fontSize="10px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="widest">
            Section View
          </Text>
          <Text fontSize="lg" fontWeight="black" color="text.primary">
            Drives And Play Log
          </Text>
          <Text fontSize="sm" color="text.muted" mt={1}>
            Auto-height sections with quarter filters and collapsible detail.
          </Text>
        </Box>
        <QuarterFilters activeQuarter={quarter} onChange={setQuarter} />
      </Flex>

      <Flex direction="column" gap={6}>
        <TableSection
          title="Full Drive Analysis"
          count={filteredDrives.length}
          collapsed={drivesCollapsed}
          onToggle={() => setDrivesCollapsed((value) => !value)}
        >
          {filteredDrives.length > 0 ? <DrivesTable rows={filteredDrives} /> : <EmptyTableState label="No drives for this quarter." />}
        </TableSection>

        <TableSection
          title="Exhaustive Play-By-Play Log"
          count={filteredPlays.length}
          collapsed={playsCollapsed}
          onToggle={() => setPlaysCollapsed((value) => !value)}
        >
          {filteredPlays.length > 0 ? <PlaysTable rows={filteredPlays} /> : <EmptyTableState label="No plays for this quarter." />}
        </TableSection>
      </Flex>
    </Box>
  );
};

// ─── GamePage ─────────────────────────────────────────────────────────────────

const GamePage = () => {
  const { gameId = "pvamutsu" } = useParams();
  const [activeSection, setActiveSection] = useState("summary");

  const { data: game, isLoading, isError } = useQuery({
    queryKey: ["game", gameId],
    queryFn: () => fetchGame(gameId),
  });

  const { data: imageMap = {} } = useQuery({
    queryKey: ["playerImages"],
    queryFn: fetchPlayerImages,
    staleTime: Infinity,
  });

  const meta = game?.metadata ?? {};
  const awayId = meta.away_team?.id;
  const homeId = meta.home_team?.id;
  const awayShort = getTeamLabel(awayId);
  const homeShort = getTeamLabel(homeId);
  const teamBox = game?.team_box ?? {};
  const advancedTeam = game?.advanced_team ?? {};
  const teamEntries = Object.entries(game?.individual_stats ?? {});
  const productionScores = game?.production_scores ?? {};
  const drives = normalizeDrives(game?.drive_summary);
  const plays = game?.play_by_play ?? [];
  const pbpDriveRows = useMemo(
    () => (activeSection === "pbp" ? buildDriveRows(game?.drive_summary, game?.play_by_play ?? [], awayId, homeId) : []),
    [activeSection, awayId, game?.drive_summary, game?.play_by_play, homeId],
  );
  const pbpPlayRows = useMemo(
    () => (activeSection === "pbp" ? normalizePlayRows(game?.play_by_play ?? [], awayId, homeId) : []),
    [activeSection, awayId, game?.play_by_play, homeId],
  );

  const listContent = (
    <>
      <Flex align="center" gap={2} mb={6}>
        <Link to="/game-center">
          <Flex
            align="center"
            gap={2}
            px={3}
            py={2}
            borderRadius="md"
            bg="whiteAlpha.50"
            color="text.secondary"
            fontSize="sm"
            fontWeight="medium"
            _hover={{ bg: "whiteAlpha.100", color: "text.primary" }}
            transition="all 0.15s"
          >
            <ArrowLeft size={16} />
            <Text>Back to Game Center</Text>
          </Flex>
        </Link>
      </Flex>

      {isLoading && (
        <Flex justify="center" py={20}><Spinner color="brand.500" size="xl" /></Flex>
      )}

      {(isError || (!isLoading && !game)) && (
        <Flex justify="center" py={20}><Text color="text.muted">Game data not found.</Text></Flex>
      )}

      {!isLoading && !isError && game && activeSection === "summary" && (
        <Grid templateColumns="1fr 2fr 1fr" gap={6} alignItems="start">
          {/* Left column */}
          <Box>
            <TeamMetricsPanel awayId={awayId} homeId={homeId} teamBox={teamBox} advancedTeam={advancedTeam} />
            <GameLeadersPanel awayId={awayId} homeId={homeId} teamEntries={teamEntries} imageMap={imageMap} />
            <TeamStatsPanel awayId={awayId} homeId={homeId} teamBox={teamBox} />
            <GameInfoPanel meta={meta} />
          </Box>

          {/* Middle column */}
          <Box>
            <DrivesPanel
              drives={drives}
              plays={plays}
              awayId={awayId}
              homeId={homeId}
              awayShort={awayShort}
              homeShort={homeShort}
            />
          </Box>

          {/* Right column */}
          <Box>
            <GloryMVPPanel awayId={awayId} homeId={homeId} productionScores={productionScores} imageMap={imageMap} />
            <StubPanel title="Win Probability" />
            <StubPanel title="EPA Chart" />
            <StubPanel title="Standings" />
          </Box>
        </Grid>
      )}

      {!isLoading && !isError && game && activeSection === "boxscore" && (
        <>
          <GameBoxScoreFull
            game={game}
            awayId={awayId}
            homeId={homeId}
            awayShort={awayShort}
            homeShort={homeShort}
          />
          <GameProductionComparison awayId={awayId} homeId={homeId} productionScores={productionScores} />
        </>
      )}

      {!isLoading && !isError && game && activeSection === "teamstats" && (
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6} alignItems="start">
          <TeamMetricsPanel awayId={awayId} homeId={homeId} teamBox={teamBox} advancedTeam={advancedTeam} />
          <TeamStatsPanel awayId={awayId} homeId={homeId} teamBox={teamBox} />
        </Grid>
      )}

      {!isLoading && !isError && game && activeSection === "pbp" && (
        <PlayByPlaySection driveRows={pbpDriveRows} playRows={pbpPlayRows} />
      )}

      {!isLoading && !isError && game && !["summary", "boxscore", "teamstats", "pbp"].includes(activeSection) && (
        <Flex justify="center" py={20}>
          <Text color="text.muted" fontSize="sm">
            {BANNER_SECTIONS.find((s) => s.id === activeSection)?.label} — coming soon
          </Text>
        </Flex>
      )}
    </>
  );

  return (
    <PageShell listContent={listContent}>
      {game && (
        <PageShell.Slot cols={4}>
          <GamePageBanner meta={meta} activeSection={activeSection} onSection={setActiveSection} />
        </PageShell.Slot>
      )}
    </PageShell>
  );
};

export default GamePage;
