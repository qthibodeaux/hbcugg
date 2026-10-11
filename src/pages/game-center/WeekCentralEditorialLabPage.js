import { useMemo, useState } from "react";
import { Box, Center, Flex, Grid, Image, Separator, Spinner, Text, Avatar, VStack, HStack } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, CalendarDays, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { WeekCentralBrief } from "../../components/molecules/game/WeekCentralBrief";
import { WeekCentralGameRowJ } from "../../components/organisms/test/WeekCentralGameRowJ";
import teamsData from "../../data/teams.json";
import { gameCenterPaths } from "../../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../../components/molecules/game/SeasonSelector";

const DEFAULT_SEASON = GAME_CENTER_DEFAULT_SEASON;
const SEASONS = [2026, 2025, 2024, 2023, 2022, 2021, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
const BRAND_PREVIEW_COLOR = "#E53E3E";
const SPECIAL_GAMES_BY_SEASON = {
  2025: [
    {
      season: 2025,
      team_id: "meacscsu",
      game_index: 16,
      date: "2025-12-13",
      day_of_week: "Saturday",
      week: 16,
      opponent_name: "Prairie View A&M",
      opponent_id: "swacpvamu",
      in_corpus: true,
      home_away: "away",
      site: "Atlanta, Georgia",
      stadium: "Mercedes-Benz Stadium",
      conf_game: false,
      bowl_game: true,
      game_name: "Celebration Bowl",
      result: null,
      score_team: null,
      score_opp: null,
      has_pdf: true,
      has_parsed_game: true,
      parsed_game_stem: "W16scsupvamu",
      parsed_game_id: "SCSUPVAMU13122025",
      parsed_game_path: "92-frontend/1-game center/games/2025/W16scsupvamu.json",
    },
  ],
};

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const id = team.exportId.replace(/25$/, "");
  acc[id] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

const mutedTeamColor = (color) => `color-mix(in srgb, ${color} 54%, #0B0B0D 46%)`;
const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? "TBD";
const teamLogo = (team) => team?.logo ?? (team?.exportId ? `/assets/${team.exportId.replace(/25$/, "")}.svg` : null);

const fetcher = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const normalizeTeamKey = (value) => String(value ?? "").replace(/25$/, "");

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getLaborDay = (season) => {
  const date = new Date(season, 8, 1);
  while (date.getDay() !== 1) date.setDate(date.getDate() + 1);
  return date;
};

const getCalendarWeek = (dateValue, season) => {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const boundary = getLaborDay(season);
  boundary.setDate(boundary.getDate() - 2);
  const diffDays = Math.floor((date - boundary) / 86400000);
  return diffDays < 0 ? 0 : Math.floor(diffDays / 7) + 1;
};

const getGameWeek = (game) => {
  if (game?.week != null) return Number(game.week);
  return getWeekFromStem(game?.parsed_game_stem) ?? getCalendarWeek(game?.date, game?.season);
};

const getWeekLabel = (week, games = []) => {
  if (week === 16) return "Celebration Bowl";
  if (week === 15) return "SWAC Championship";

  const names = games.map((game) => String(game.game_name ?? "").toLowerCase()).join(" ");
  const hasCelebration = names.includes("celebration") || games.some((game) => game.bowl_game && getGameWeek(game) === week);
  const hasChampionship = names.includes("championship") || (week >= 15 && games.some((game) => game.conf_game && game.bowl_game));

  if (hasCelebration) return "Celebration Bowl";
  if (hasChampionship) return "SWAC Championship";
  return week === 0 ? "Week 0" : `Week ${week}`;
};

const getCompactWeekLabel = (week, games = []) => {
  if (week === 16) return "CB";
  if (week === 15) return "SCG";
  const label = getWeekLabel(week, games);
  return label.replace("Week ", "W");
};

const fmtDate = (value) => {
  if (!value) return "TBD";
  const dt = new Date(`${value}T12:00:00`);
  if (Number.isNaN(dt.getTime())) return String(value);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const SHORT_VENUE_BY_NAME = {
  "A.W. Mumford Stadium": "A.W. Mumford",
  "Bragg Memorial Stadium": "Bragg Memorial",
  "Daytona Stadium": "Daytona Stadium",
  "Eddie Robinson Stadium": "Eddie Robinson",
  "Hughes Stadium": "Hughes Stadium",
  "Louis Crews Stadium": "Louis Crews",
  "Mercedes-Benz Stadium": "Mercedes-Benz",
  "Oliver C. Dawson Stadium/Willie Jeffries Field": "Oliver C. Dawson",
  "Rice-Totten Stadium": "Rice-Totten",
  "Shell Energy Stadium": "Shell Energy",
  "Simmons Bank Field": "Simmons Bank",
  "Spinks-Casem Stadium": "Spinks-Casem",
  "Veterans Memorial Stadium": "Veterans Memorial",
  "William H. Greene Stadium": "Greene Stadium",
  "William 'Spong' Stadium": "Spong Stadium",
};

const shortenVenue = (game) => {
  const stadium = String(game?.rawGame?.stadium ?? "").trim();
  const site = String(game?.rawGame?.site ?? "").trim();
  const mapped = SHORT_VENUE_BY_NAME[stadium];
  const value = mapped || (stadium.length <= 22 ? stadium : site) || game?.venue || "Site TBD";
  return value.length > 22 ? `${value.slice(0, 19).trim()}...` : value;
};

const dedupeGames = (games) => {
  const seen = new Map();
  for (const game of games) {
    const stem = game.parsed_game_stem;
    const key = stem || `${[normalizeTeamKey(game.team_id), normalizeTeamKey(game.opponent_id) || game.opponent_name].sort().join("-")}-${game.date}`;
    if (!seen.has(key)) seen.set(key, game);
  }
  return [...seen.values()];
};

const toScalarTeamId = (value) => normalizeTeamKey(value?.team_id ?? value?.id ?? value);

const getSeasonGames = (data, season) => {
  if (Array.isArray(data?.weeks)) {
    return dedupeGames(data.weeks.flatMap((week) => (
      (week.games ?? []).map((game) => ({
        ...game,
        season,
        week: game.week ?? week.week,
        week_label: game.week_label ?? week.label,
        parsed_game_stem: game.parsed_game_stem ?? game.game_path_id,
        parsed_game_id: game.parsed_game_id ?? game.game_id,
        conf_game: game.conf_game ?? game.conference_game,
        bowl_game: game.bowl_game,
        stadium: game.stadium ?? game.stadium_name,
        site: game.site ?? game.venue_city,
      }))
    )));
  }

  return dedupeGames([...(data?.games ?? []), ...(SPECIAL_GAMES_BY_SEASON[season] ?? [])]);
};

const getSide = (id, text) => {
  const team = TEAM_BY_ID[normalizeTeamKey(id)] ?? TEAM_BY_ID[id];
  return {
    id: normalizeTeamKey(id),
    label: team ? teamLabel(team) : text ?? "TBD",
    name: team?.name ?? text ?? "TBD",
    logo: teamLogo(team),
    color: team?.colors?.primary ?? "#27272A",
    secondary: team?.colors?.secondary ?? "#FFFFFF",
    accent: team?.colors?.accent ?? team?.colors?.secondary ?? "#FFFFFF",
  };
};

const isHBCUTeam = (id) => !!(TEAM_BY_ID[normalizeTeamKey(id)] ?? TEAM_BY_ID[id]);

const buildLabGame = (rawGame, weekLabel) => {
  if (rawGame.home_team_id != null || rawGame.away_team_id != null || rawGame.home_score != null || rawGame.away_score != null) {
    const homeId = toScalarTeamId(rawGame.home_team_id);
    const awayId = toScalarTeamId(rawGame.away_team_id);
    const homeScore = rawGame.home_score != null ? Number(rawGame.home_score) : null;
    const awayScore = rawGame.away_score != null ? Number(rawGame.away_score) : null;
    const bothHBCU = isHBCUTeam(homeId) && isHBCUTeam(awayId);
    const isOutsideOpponent = !bothHBCU;
    const isFinal = rawGame.status === "final" && homeScore != null && awayScore != null;
    const stage = rawGame.bowl_game && rawGame.story_label
      ? rawGame.story_label
      : rawGame.bowl_game
        ? "Bowl Game"
        : rawGame.conf_game
          ? "Conference"
          : bothHBCU
            ? "HBCU Non-conf"
            : "Non-conf";
    const gameId = rawGame.parsed_game_stem || rawGame.game_path_id || rawGame.game_id || `${awayId || "away"}-${homeId || "home"}-${rawGame.date}`;

    return {
      id: gameId,
      route: rawGame.route ?? (rawGame.parsed_game_stem ? `/game/${rawGame.parsed_game_stem}` : null),
      status: isFinal ? "final" : "preview",
      tag: stage,
      angle: isOutsideOpponent ? "Schedule note" : isFinal ? "Review file" : "Preview board",
      awayId,
      homeId,
      awayText: !isHBCUTeam(awayId) ? rawGame.away_name ?? rawGame.away_team_name ?? "Away" : null,
      homeText: !isHBCUTeam(homeId) ? rawGame.home_name ?? rawGame.home_team_name ?? "Home" : null,
      awayScore,
      homeScore,
      dateLabel: fmtDate(rawGame.date),
      venue: rawGame.stadium_name ?? rawGame.venue ?? rawGame.venue_city ?? rawGame.story_label ?? "Site TBD",
      note: isOutsideOpponent
        ? "This matchup is part of the season schedule wall, but it does not have an HBCU GridIron Glory recap or preview package yet."
        : isFinal
          ? `${weekLabel} has a completed HBCU matchup with a parsed game file ready for deeper review.`
          : `${weekLabel} preview slot for an HBCU-vs-HBCU matchup on the weekly board.`,
      rawGame,
      bothHBCU,
      isOutsideOpponent,
    };
  }

  const teamId = normalizeTeamKey(rawGame.team_id);
  const opponentId = normalizeTeamKey(rawGame.opponent_id);
  const teamIsHome = rawGame.home_away === "home";
  const homeId = teamIsHome ? teamId : opponentId || null;
  const awayId = teamIsHome ? opponentId || null : teamId;
  const homeText = teamIsHome ? null : rawGame.opponent_name;
  const awayText = teamIsHome ? rawGame.opponent_name : null;
  const hasScore = rawGame.score_team != null && rawGame.score_opp != null;
  const homeScore = hasScore ? Number(teamIsHome ? rawGame.score_team : rawGame.score_opp) : null;
  const awayScore = hasScore ? Number(teamIsHome ? rawGame.score_opp : rawGame.score_team) : null;
  const bothHBCU = isHBCUTeam(teamId) && isHBCUTeam(opponentId);
  const isOutsideOpponent = !bothHBCU;
  const isFinal = !!rawGame.result && hasScore;
  const stage = rawGame.bowl_game && rawGame.game_name ? rawGame.game_name : rawGame.conf_game ? "Conference" : bothHBCU ? "HBCU Non-conf" : "Non-conf";
  const gameId = rawGame.parsed_game_stem || `${teamId}-${opponentId || rawGame.opponent_name}-${rawGame.date}`;

  return {
    id: gameId,
    route: rawGame.parsed_game_stem ? `/game/${rawGame.parsed_game_stem}` : null,
    status: isFinal ? "final" : "preview",
    tag: stage,
    angle: isOutsideOpponent ? "Schedule note" : isFinal ? "Review file" : "Preview board",
    awayId,
    homeId,
    awayText,
    homeText,
    awayScore,
    homeScore,
    dateLabel: fmtDate(rawGame.date),
    venue: rawGame.stadium ?? rawGame.site ?? rawGame.game_name ?? "Site TBD",
    note: isOutsideOpponent
      ? "This matchup is part of the season schedule wall, but it does not have an HBCU GridIron Glory recap or preview package yet."
      : isFinal
        ? `${weekLabel} has a completed HBCU matchup with a parsed game file ready for deeper review.`
        : `${weekLabel} preview slot for an HBCU-vs-HBCU matchup on the weekly board.`,
    rawGame,
    bothHBCU,
    isOutsideOpponent,
  };
};

const getGameWinner = (game) => {
  if (game.status !== "final" || game.awayScore == null || game.homeScore == null) return null;
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);

  if (game.awayScore === game.homeScore) return null;
  return game.awayScore > game.homeScore ? away : home;
};

const toGradientRow = (game) => {
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);
  const raw = game.rawGame ?? {};
  const context = raw.game_name || game.tag || "Weekly Matchup";

  return {
    id: game.id,
    away: {
      name: away.name,
      shortName: away.label,
      logo: away.logo,
      color: away.color,
      record: raw.away_conference_record ?? raw.away_conf_record ?? raw.away_record ?? raw.team_record ?? "Record TBD",
    },
    home: {
      name: home.name,
      shortName: home.label,
      logo: home.logo,
      color: home.color,
      record: raw.home_conference_record ?? raw.home_conf_record ?? raw.home_record ?? raw.opponent_record ?? "Record TBD",
    },
    awayScore: game.awayScore,
    homeScore: game.homeScore,
    status: game.status === "final" ? "Final" : "Preview",
    gameName: context,
    displayVenue: shortenVenue(game),
  };
};

const getSelectedGameTeam = (game) => {
  if (!game || game.status !== "final") return null;

  if (game.isOutsideOpponent) {
    const away = getSide(game.awayId, game.awayText);
    const home = getSide(game.homeId, game.homeText);
    return isHBCUTeam(away.id) ? away : isHBCUTeam(home.id) ? home : null;
  }

  return getGameWinner(game);
};

const getSelectedGameTheme = (game) => {
  const selectedTeam = getSelectedGameTeam(game);
  if (!selectedTeam) {
    return {
      surface: BRAND_PREVIEW_COLOR,
      border: "#FFFFFF",
      accent: "#FFFFFF",
    };
  }

  return {
    surface: selectedTeam.color ?? BRAND_PREVIEW_COLOR,
    border: selectedTeam.secondary ?? selectedTeam.accent ?? "#FFFFFF",
    accent: selectedTeam.accent ?? selectedTeam.secondary ?? "#FFFFFF",
  };
};

// eslint-disable-next-line no-unused-vars
const GameLogo = ({ side }) => (
  <Box w="32px" h="32px" flexShrink={0} display="flex" alignItems="center" justifyContent="center">
    {side.logo ? (
      <Image src={side.logo} alt={side.label} w="32px" h="32px" objectFit="contain" />
    ) : (
      <Box w="30px" h="30px" borderRadius="full" bg="whiteAlpha.100" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="8px" color="text.muted" fontWeight="black">
          {String(side.label).slice(0, 3).toUpperCase()}
        </Text>
      </Box>
    )}
  </Box>
);



const SlateRow = ({ game, selected, onSelect }) => {
  const selectedTheme = getSelectedGameTheme(game);

  return (
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      w="100%"
      textAlign="left"
      border="1px solid"
      borderColor="transparent"
      borderRadius="md"
      bg="transparent"
      cursor="pointer"
      overflow="hidden"
      style={{ transition: "background 0.15s, border-color 0.15s" }}
    >
      <Box display={{ base: "block", xl: "none" }}>
        <WeekCentralGameRowJ row={toGradientRow(game)} mb={0} variant="compact" selected={selected} highlightColor={selectedTheme.surface} highlightAccent={selectedTheme.border} />
      </Box>
      <Box display={{ base: "none", xl: "block" }}>
        <WeekCentralGameRowJ row={toGradientRow(game)} mb={0} variant="standard" selected={selected} highlightColor={selectedTheme.surface} highlightAccent={selectedTheme.border} />
      </Box>
    </Box>
  );
};

// eslint-disable-next-line no-unused-vars
const EditorialPanel = ({ game }) => {
  const away = getSide(game.awayId, game.awayText);
  const home = getSide(game.homeId, game.homeText);
  const winner = getGameWinner(game);
  const panelColor = mutedTeamColor(getSelectedGameTheme(game).surface);
  const isStatic = game.isOutsideOpponent;
  const hbcuSide = isHBCUTeam(away.id) ? away : isHBCUTeam(home.id) ? home : null;
  const featureLogo = isStatic ? hbcuSide?.logo : winner?.logo;

  // v3 Helper for Stat Rows using Separator instead of Divider
  const StatRow = ({ label, awayVal, homeVal, isBold = false }) => (
    <VStack gap={0} align="stretch" w="100%">
      <Grid templateColumns="1fr 1.5fr 1fr" gap={2} alignItems="center" py={1.5}>
        <Text fontSize="xs" fontWeight={isBold ? "black" : "medium"} color="white">{awayVal}</Text>
        <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" textAlign="center">{label}</Text>
        <Text fontSize="xs" fontWeight={isBold ? "black" : "medium"} color="white" textAlign="right">{homeVal}</Text>
      </Grid>
      <Separator borderColor="whiteAlpha.100" />
    </VStack>
  );

  return (
    <Box
      h="100%"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      bg={panelColor}
      position="relative"
      display="flex"
      flexDirection="column"
    >
      {/* Dynamic Background Logo */}
      {featureLogo && (
        <Image 
          src={featureLogo} 
          position="absolute" 
          insetEnd="-40px" 
          top="-20px" 
          w="220px" 
          h="220px" 
          objectFit="contain" 
          opacity={0.05} 
          pointerEvents="none" 
        />
      )}

      {/* Header with New Tag Style */}
      <Flex align="center" justify="space-between" p={5} pb={2} position="relative" zIndex={1}>
        <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="widest">
          {isStatic ? "Schedule File" : "Weekly Brief"}
        </Text>
        <Box px={2} py={1} borderRadius="full" bg={game.tag === "Conference" ? "brand.500" : "whiteAlpha.100"}>
          <Text fontSize="7px" color="white" fontWeight="black" textTransform="uppercase">{game.tag}</Text>
        </Box>
      </Flex>

      {/* Scrollable Content (v3 ScrollArea pattern can be used here) */}
      <Box flex="1" overflowY="auto" px={5} pb={24} css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
        
        {/* Matchup Header */}
        <Box mb={6}>
          <Text fontSize="3.5xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight="0.85">
            {away.label} <Text as="span" fontSize="xs" color="text.muted" mx={1} verticalAlign="middle">at</Text> {home.label}
          </Text>
        </Box>

        {/* 1. Box Score (Updated with Quarter Data) */}
        <Box bg="blackAlpha.400" borderRadius="md" p={4} mb={5} borderWidth="1px" borderColor="whiteAlpha.100">
          <Grid templateColumns="2fr repeat(4, 1fr) 1.5fr" gap={2} textAlign="center" alignItems="center">
            <Text textAlign="left" fontSize="8px" color="text.muted" fontWeight="black">TEAM</Text>
            {['1', '2', '3', '4'].map(q => <Text key={q} fontSize="8px" color="text.muted" fontWeight="black">{q}</Text>)}
            <Text fontSize="8px" color="brand.400" fontWeight="black">TOT</Text>
            
            {/* Away Row */}
            <Text textAlign="left" fontSize="xs" fontWeight="black" color="white">{away.label}</Text>
            {game.boxScore?.awayQuarters?.map((q, i) => <Text key={i} fontSize="xs" color="whiteAlpha.700">{q}</Text>)}
            <Text fontSize="sm" fontWeight="black" color="white">{game.awayScore}</Text>

            {/* Home Row */}
            <Text textAlign="left" fontSize="xs" fontWeight="black" color="white">{home.label}</Text>
            {game.boxScore?.homeQuarters?.map((q, i) => <Text key={i} fontSize="xs" color="whiteAlpha.700">{q}</Text>)}
            <Text fontSize="sm" fontWeight="black" color="white">{game.homeScore}</Text>
          </Grid>
        </Box>

        {/* 2. Player Spotlight (v3 Avatar.Root pattern) */}
        {game.mvp && (
          <Box bg="whiteAlpha.100" borderRadius="md" p={4} mb={5} borderStartWidth="4px" borderStartColor="brand.400">
            <Flex align="center" gap={4}>
              <Avatar.Root size="sm" shape="rounded">
                <Avatar.Image src={game.mvp.image} alt={game.mvp.name} />
                <Avatar.Fallback name={game.mvp.name} />
              </Avatar.Root>
              <Box>
                <Text fontSize="9px" fontWeight="black" color="brand.400" textTransform="uppercase">Impact Leader</Text>
                <Text fontSize="md" fontWeight="black" color="white" lineHeight="1.1">{game.mvp.name}</Text>
                <Text fontSize="9px" color="text.muted" textTransform="uppercase">{game.mvp.position} · {game.mvp.team}</Text>
              </Box>
              <Box ms="auto" textAlign="right">
                <Text fontSize="2xl" fontWeight="black" color="white">{game.mvp.primaryStat}</Text>
                <Text fontSize="8px" color="text.muted" textTransform="uppercase">{game.mvp.statLabel}</Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* 3. Team Metrics (Using Separator) */}
        <VStack gap={3} align="stretch" mb={6}>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest">Team Metrics</Text>
          <Box bg="blackAlpha.300" p={4} borderRadius="md">
            <StatRow label="EPA / Play" awayVal={game.metrics?.awayEpa} homeVal={game.metrics?.homeEpa} isBold />
            <StatRow label="Success Rate" awayVal={game.metrics?.awaySuccess} homeVal={game.metrics?.homeSuccess} />
            <StatRow label="Yards / Play" awayVal={game.metrics?.awayYpp} homeVal={game.metrics?.homeYpp} />
            <StatRow label="Havoc Rate" awayVal={game.metrics?.awayHavoc} homeVal={game.metrics?.homeHavoc} />
          </Box>
        </VStack>

        {/* 4. Game Leaders (Split view) */}
        <VStack gap={4} align="stretch">
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="widest">Game Leaders</Text>
          {game.leaders?.map((leader, i) => (
            <Box key={i} bg="blackAlpha.200" p={3} borderRadius="md" borderWidth="1px" borderColor="whiteAlpha.50">
              <Text fontSize="8px" color="text.muted" textAlign="center" fontWeight="black" mb={3} textTransform="uppercase">{leader.category}</Text>
              <Grid templateColumns="1fr 1fr" gap={6}>
                <HStack gap={3}>
                  <Separator orientation="vertical" h="24px" borderColor="whiteAlpha.400" />
                  <Box>
                    <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>{leader.awayName}</Text>
                    <Text fontSize="9px" color="text.muted">{leader.awayStat}</Text>
                  </Box>
                </HStack>
                <HStack gap={3} justify="end">
                  <Box textAlign="right">
                    <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>{leader.homeName}</Text>
                    <Text fontSize="9px" color="text.muted">{leader.homeStat}</Text>
                  </Box>
                  <Separator orientation="vertical" h="24px" borderColor="brand.400" />
                </HStack>
              </Grid>
            </Box>
          ))}
        </VStack>
      </Box>

      {/* Footer CTA (v3 Style) */}
      <Flex 
        position="absolute" 
        bottom={0} 
        insetInline="0" 
        p={5} 
        bgGradient={`linear(to-t, ${panelColor} 85%, transparent)`}
        align="center" 
        justify="space-between"
        zIndex={2}
      >
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" maxW="60%">
          {game.venue}
        </Text>
        {game.route && !isStatic && (
          <Box asChild>
            <Link to={game.route}>
              <Center px={5} py={2.5} borderRadius="full" bg="white" _hover={{ bg: "whiteAlpha.900" }} cursor="pointer">
                <Text fontSize="9px" color="black" fontWeight="black" textTransform="uppercase">Full Review</Text>
              </Center>
            </Link>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

const IconButton = ({ label, icon, onClick, disabled }) => (
  <Flex
    as="button"
    type="button"
    onClick={onClick}
    disabled={disabled}
    align="center"
    justify="center"
    w="38px"
    h="38px"
    borderRadius="full"
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg="blackAlpha.400"
    color="white"
    opacity={disabled ? 0.34 : 1}
    cursor={disabled ? "not-allowed" : "pointer"}
    aria-label={label}
    title={label}
    _hover={disabled ? {} : { bg: "whiteAlpha.100", borderColor: "whiteAlpha.300" }}
  >
    {icon}
  </Flex>
);

const SelectControl = ({ label, icon, value, onChange, options, minW = "118px" }) => (
  <Flex
    align="center"
    gap={2}
    h="38px"
    px={3}
    borderRadius="full"
    border="1px solid"
    borderColor="whiteAlpha.300"
    bg="rgba(255,255,255,0.12)"
    color="white"
    position="relative"
    minW={minW}
  >
    {icon}
    <Box
      as="select"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      appearance="none"
      bg="transparent"
      border="0"
      outline="0"
      color="white"
      fontSize="9px"
      fontWeight="900"
      textTransform="uppercase"
      cursor="pointer"
      w="100%"
      pr={5}
      style={{ colorScheme: "dark" }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Box>
    <Text position="absolute" right="12px" fontSize="10px" color="whiteAlpha.700" pointerEvents="none">
      v
    </Text>
  </Flex>
);

const TogglePill = ({ active, onClick, children }) => (
  <Flex
    as="button"
    type="button"
    onClick={onClick}
    align="center"
    gap={2}
    h="38px"
    px={3}
    borderRadius="full"
    border="1px solid"
    borderColor={active ? "brand.400" : "whiteAlpha.200"}
    bg={active ? "rgba(229,62,62,0.28)" : "blackAlpha.400"}
    cursor="pointer"
    _hover={{ bg: active ? "rgba(229,62,62,0.34)" : "whiteAlpha.100" }}
  >
    <Filter size={13} />
    <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
      {children}
    </Text>
  </Flex>
);

const WeekCentralEditorialLabPage = () => {
  const [season, setSeason] = useState(DEFAULT_SEASON);
  const [activeWeek, setActiveWeek] = useState(null);
  const [includeNonConference, setIncludeNonConference] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["week-central-editorial-lab", season],
    queryFn: () => fetcher(gameCenterPaths.weekCentral(season)),
    staleTime: Infinity,
    retry: false,
  });

  const { weeks, selectedWeek, weekLabel, slate, selected, totals } = useMemo(() => {
    const games = getSeasonGames(data, season).filter((game) => getGameWeek(game) != null);
    const weeks = [...new Set(games.map(getGameWeek))].sort((a, b) => a - b);
    const defaultWeek = weeks.includes(6) ? 6 : weeks[0] ?? 1;
    const selectedWeek = activeWeek != null && weeks.includes(Number(activeWeek)) ? Number(activeWeek) : defaultWeek;
    const allWeekGames = games.filter((game) => getGameWeek(game) === selectedWeek);
    const weekLabel = getWeekLabel(selectedWeek, allWeekGames);
    const filtered = includeNonConference
      ? allWeekGames
      : allWeekGames.filter((game) => isHBCUTeam(game.team_id) && isHBCUTeam(game.opponent_id));
    const slate = filtered
      .map((game) => buildLabGame(game, weekLabel))
      .sort((a, b) => {
        const priority = Number(a.isOutsideOpponent) - Number(b.isOutsideOpponent);
        if (priority !== 0) return priority;
        return String(a.rawGame.date ?? "").localeCompare(String(b.rawGame.date ?? ""));
      });
    const selected = slate.find((game) => game.id === selectedId) ?? slate[0] ?? null;
    const totals = {
      all: allWeekGames.length,
      visible: slate.length,
      hbcu: slate.filter((game) => game.bothHBCU).length,
      outside: slate.filter((game) => game.isOutsideOpponent).length,
    };

    return { weeks, selectedWeek, weekLabel, slate, selected, totals };
  }, [data, season, activeWeek, includeNonConference, selectedId]);

  const selectedTheme = getSelectedGameTheme(selected);
  const selectedGameStem = selected?.rawGame?.parsed_game_stem ?? null;
  const selectedHasParsedGame = !!selectedGameStem && !!selected?.rawGame?.has_parsed_game;
  const { data: selectedParsedGame, isLoading: isSelectedParsedGameLoading } = useQuery({
    queryKey: ["week-central-brief-game", season, selectedGameStem],
    queryFn: () => fetcher(gameCenterPaths.gameFile(season, selectedGameStem)),
    staleTime: Infinity,
    retry: false,
    enabled: selectedHasParsedGame,
  });

  const seasonGames = getSeasonGames(data, season);
  const weekOptions = weeks.map((week) => {
    const games = seasonGames.filter((game) => getGameWeek(game) === week);
    return { value: String(week), label: getCompactWeekLabel(week, games) };
  });
  const seasonOptions = SEASONS.map((item) => ({ value: String(item), label: String(item) }));
  const currentWeekIndex = weeks.indexOf(selectedWeek);
  const canGoPrev = currentWeekIndex > 0;
  const canGoNext = currentWeekIndex >= 0 && currentWeekIndex < weeks.length - 1;

  if (isLoading) {
    return (
      <PageShell>
        <PageShell.Slot cols={4}>
          <Flex h="100%" align="center" justify="center">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </PageShell.Slot>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageShell.Slot cols={4}>
        <Box h="100%" w="100%" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" bg="linear-gradient(135deg, #E53E3E 0%, #2A090A 52%, #0B0B0D 100%)" overflow="hidden">
          <Flex h="100%" align="center" justify="space-between" px={{ base: 5, lg: 8 }} gap={5}>
            <Box>
              <Text fontSize="10px" color="whiteAlpha.800" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                Game Center
              </Text>
              <Text fontSize={{ base: "3xl", lg: "5xl" }} color="white" fontWeight="black" fontStyle="italic" textTransform="uppercase" lineHeight={0.9}>
                Week Central
              </Text>
              <Text mt={3} fontSize="10px" color="whiteAlpha.700" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
                {season} - {weekLabel} - {totals.visible} visible games - {totals.hbcu} HBCU matchups
              </Text>
            </Box>
            <Flex align="center" gap={2} wrap="wrap" justify="end" maxW="560px">
              <SelectControl
                label="Season"
                icon={<CalendarDays size={13} />}
                value={String(season)}
                onChange={(value) => setSeason(Number(value))}
                options={seasonOptions}
                minW="108px"
              />
              <IconButton label="Previous week" icon={<ChevronLeft size={15} />} disabled={!canGoPrev} onClick={() => canGoPrev && setActiveWeek(weeks[currentWeekIndex - 1])} />
              <SelectControl
                label="Week"
                icon={null}
                value={String(selectedWeek)}
                onChange={(value) => setActiveWeek(Number(value))}
                options={weekOptions}
                minW="108px"
              />
              <IconButton label="Next week" icon={<ChevronRight size={15} />} disabled={!canGoNext} onClick={() => canGoNext && setActiveWeek(weeks[currentWeekIndex + 1])} />
              <TogglePill active={includeNonConference} onClick={() => setIncludeNonConference((value) => !value)}>
                Non-conf {includeNonConference ? "on" : "off"}
              </TogglePill>
            </Flex>
          </Flex>
        </Box>
      </PageShell.Slot>

      <PageShell.Slot cols={4} rows={5}>
        <Grid h="100%" minH={0} w="100%" templateColumns="minmax(0, 1.65fr) minmax(280px, 0.85fr)" gap={3}>
          <Box h="100%" minH={0} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" overflow="hidden" display="flex" flexDirection="column">
            <Flex flexShrink={0} align="center" justify="space-between" px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
                {weekLabel}
              </Text>
            </Flex>
            <Flex direction="column" gap={2} p={3} flex="1 1 auto" minH={0} overflowY="auto" overflowX="hidden">
              {slate.map((game) => (
                <SlateRow key={game.id} game={game} selected={game.id === selected.id} onSelect={() => setSelectedId(game.id)} />
              ))}
              {slate.length === 0 && (
                <Flex h="100%" align="center" justify="center">
                  <Text fontSize="sm" color="text.muted" fontWeight="bold">
                    No games available for this filter.
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>
          {selected ? (
            <WeekCentralBrief
              selectedGame={selected}
              parsedGame={selectedParsedGame}
              isLoading={isSelectedParsedGameLoading}
              selectedColor={selectedTheme.surface}
              selectedAccent={selectedTheme.accent}
            />
          ) : (
            <Flex h="100%" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" bg="bg.secondary" align="center" justify="center">
              <Text fontSize="sm" color="text.muted" fontWeight="bold">
                Select another week or turn non-conference on.
              </Text>
            </Flex>
          )}
        </Grid>
      </PageShell.Slot>
    </PageShell>
  );
};

export default WeekCentralEditorialLabPage;
