import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import teamsData from "../../data/teams.json";
import {
  PageShellDesktop,
  SidebarTabs,
} from "../../components/layouts/dashboard";
import {
  Banner4x1,
  DesktopBoard4x,
  Slot1x1,
  Slot1x3,
  Slot4x1,
} from "../../components/molecules/layouts";
import {
  RecordSplitCard,
  ScheduleHeadlineCard,
  TeamFormCard,
  TopThreeStandingsCard,
  UpcomingStretchCard,
} from "../../components/molecules/game/GameCenterLabCards";
import GameCardStyleLab from "../../components/molecules/game/GameCardStyleLab";

const LAB_SEASON = 2025;
const RAIL_GAME_COUNT = 6;

const fetcher = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

const getWeekFromStem = (stem) => {
  const match = String(stem ?? "").match(/^W(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getStageLabelFromWeek = (week) => {
  if (week === 15) return "Celebration Bowl";
  if (week === 14) return "SWAC Championship Game";
  if (Number.isFinite(week) && week > 0) return `Week ${week}`;
  return "Week --";
};

const getTeamTicker = (team) =>
  String(team?.shortName ?? team?.name ?? "TEAM")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "TEAM";

const getRailHeading = (cards) => {
  const firstResult = cards.find((card) => card.mode === "result");
  if (!firstResult) return "Week Results";
  return `${firstResult.stageLabel ?? "Week"} Results`;
};

const normalizeName = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/#/g, "")
    .replace(/&/g, " and ")
    .replace(/university|college|state\.?/g, " ")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  acc[team.exportId] = enriched;
  acc[team.exportId.replace(/25$/, "")] = enriched;
  return acc;
}, {});

const TEAM_BY_NAME = teamsData.teams.reduce((acc, team) => {
  const enriched = {
    ...team,
    primary: team?.colors?.primary,
    secondary: team?.colors?.secondary,
  };
  [team.name, team.shortName, team.mascot, `${team.name} ${team.mascot}`]
    .map(normalizeName)
    .filter(Boolean)
    .forEach((alias) => {
      acc[alias] = enriched;
    });
  return acc;
}, {});

const SIDEBAR_TABS = [
  { id: "hub", label: "HUB", to: "/game-center" },
  { id: "games", label: "Games", to: "/game-center" },
  { id: "week", label: "Week Central", to: `/game-center/week/${LAB_SEASON}/12` },
  { id: "team", label: "Team Schedules", to: `/game-center/team/swacmjsu/${LAB_SEASON}` },
  { id: "season", label: "Conference Slate", to: `/game-center/conferenceslate/${LAB_SEASON}` },
  { id: "standings", label: "Standings", to: `/game-center/standings/${LAB_SEASON}` },
];

const DASHGRAPH_DEFS = [
  { id: "swac-west-top3", type: "standings", title: "SWAC West Top 3" },
  { id: "swac-east-top3", type: "standings", title: "SWAC East Top 3" },
  { id: "meac-top3", type: "standings", title: "MEAC Top 3" },
  { id: "game-of-week", type: "headline", title: "Game of the Week" },
  { id: "look-ahead", type: "headline", title: "Look Ahead" },
  { id: "upcoming-stretch", type: "stretch", title: "Upcoming Stretch" },
  { id: "team-form", type: "form", title: "Team Form" },
  { id: "home-heroes", type: "split", title: "Home Town Heroes" },
  { id: "road-world", type: "split", title: "Us vs The World" },
];

const ScheduleRailResultItem = ({ game }) => {
  const clickTo = game?.mode === "result" && game?.gameId ? `/game/${encodeURIComponent(game.gameId)}` : null;
  const homeByQ = game?.homeByQ ?? ["-", "-", "-", "-"];
  const awayByQ = game?.awayByQ ?? ["-", "-", "-", "-"];

  // Define a shared grid template so headers and rows align perfectly
  // 1fr for team info, then 5 fixed-width columns for scores
  const gridTemplate = "1fr repeat(5, 30px)"; 

  const ScoreRow = ({ team, quarters, total, isHome }) => (
    <Grid templateColumns={gridTemplate} alignItems="center" py={1}>
      {/* Team Info Column */}
      <Flex align="center" gap={2} minW={0}>
        <Box w="22px" h="22px" borderRadius="4px" bg="whiteAlpha.100" flexShrink={0} display="flex" align="center" justify="center">
          {team?.logo && <Image src={team.logo} w="16px" h="16px" objectFit="contain" />}
        </Box>
        <Text fontSize="md" color="white" fontWeight="900" textTransform="uppercase">{getTeamTicker(team)}</Text>
      </Flex>

      {/* Score Columns */}
      {quarters.map((score, i) => (
        <Text key={i} fontSize="sm" color="whiteAlpha.700" fontWeight="bold" textAlign="center">
          {score}
        </Text>
      ))}
      <Text fontSize="md" color="white" fontWeight="900" textAlign="center">
        {total}
      </Text>
    </Grid>
  );

  return (
    <Box
      as={clickTo ? RouterLink : "div"}
      to={clickTo || undefined}
      w="100%"
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      _hover={clickTo ? { bg: "whiteAlpha.050" } : undefined}
    >
      {/* Header Row */}
      <Grid templateColumns={gridTemplate} mb={1} alignItems="center">
        <Text fontSize="9px" color="white" bg="whiteAlpha.300" w="fit-content" px={1.5} py={0.5} borderRadius="sm" fontWeight="black">
          FINAL
        </Text>
        {["1", "2", "3", "4", "T"].map((h) => (
          <Text key={h} fontSize="10px" color="whiteAlpha.500" fontWeight="bold" textAlign="center">{h}</Text>
        ))}
      </Grid>

      {/* Team Rows */}
      <ScoreRow team={game.home} quarters={homeByQ} total={game?.homeScore ?? "--"} isHome />
      <ScoreRow team={game.away} quarters={awayByQ} total={game?.awayScore ?? "--"} />
      
      {game?.stageLabel && (
        <Text mt={1} fontSize="9px" color="whiteAlpha.400" textTransform="uppercase" fontWeight="bold">
          {game.stageLabel}
        </Text>
      )}
    </Box>
  );
};

const ScheduleRailList = ({ cards = [] }) => (
  <Box p={0} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200" bg="blackAlpha.350" h="100%" overflow="hidden">
    <Box px={4} pt={4} pb={2}>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
        {getRailHeading(cards)}
      </Text>
    </Box>
    <Box px={4} pb={3}>
      {cards.map((game) => (
        <ScheduleRailResultItem key={game.id} game={game} />
      ))}
    </Box>
  </Box>
);

const GameCenterLayoutLabPage = () => {
  const { data } = useQuery({
    queryKey: ["game-center-layout-lab", LAB_SEASON],
    queryFn: () => fetcher(`/data/1-game center/schedules/by_year/${LAB_SEASON}.json`),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const games = useMemo(() => data?.games ?? [], [data?.games]);

  const { featuredGames, scheduleRailCards, quickCards } = useMemo(() => {
    const parsed = [...games].sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));

    const completed = [...parsed.filter((game) => game.result)].reverse();
    const upcoming = parsed.filter((game) => !game.result);

    const celebrationBowl = completed.find((game) => getWeekFromStem(game.parsed_game_stem) === 15) ?? null;
    const swacChampionship = completed.find((game) => getWeekFromStem(game.parsed_game_stem) === 14) ?? null;
    const prioritized = [celebrationBowl, swacChampionship].filter(Boolean);
    const usedGameIndexes = new Set(prioritized.map((game) => game.game_index));
    const latestTwo = completed.filter((game) => !usedGameIndexes.has(game.game_index)).slice(0, 2);

    const featured = [...prioritized, ...latestTwo].slice(0, 4).map((game, index) => {
      const week = getWeekFromStem(game.parsed_game_stem);
      return {
        id: `featured-${index}`,
        variant: "broadcast",
        home: TEAM_BY_EXPORT[game.team_id] ?? {
          shortName: game.team_id,
          name: game.team_id,
          primary: "#1A1A1D",
        },
        away: TEAM_BY_NAME[normalizeName(game.opponent_name)] ?? {
          shortName: game.opponent_name,
          name: game.opponent_name,
          primary: "#27272A",
        },
        homeScore: Number(game.score_team ?? 0),
        awayScore: Number(game.score_opp ?? 0),
        stageLabel: getStageLabelFromWeek(week),
        dateLabel: game.date ?? "TBD",
        mvp: index === 0 ? "QB 312 total yds" : index === 1 ? "RB 148 rush yds" : "Captain 11 tackles",
      };
    });

    const recordByTeamId = parsed.reduce((acc, game) => {
      const teamId = String(game.team_id ?? "");
      if (!teamId || !game.result) return acc;
      if (!acc[teamId]) acc[teamId] = { w: 0, l: 0 };
      if (game.result === "W") acc[teamId].w += 1;
      if (game.result === "L") acc[teamId].l += 1;
      return acc;
    }, {});

    const resultCards = completed.slice(0, RAIL_GAME_COUNT).map((game, index) => {
      const week = getWeekFromStem(game.parsed_game_stem) ?? game.game_index;
      const awayTeam =
        (game.opponent_id ? TEAM_BY_EXPORT[game.opponent_id] : null) ??
        TEAM_BY_NAME[normalizeName(game.opponent_name)] ??
        { shortName: game.opponent_name, name: game.opponent_name, primary: "#27272A" };
      const awayKey = String(game.opponent_id ?? awayTeam?.exportId?.replace(/25$/, "") ?? "");

      return {
        id: `rail-result-${index}`,
        mode: "result",
        gameId: game.parsed_game_stem ?? game.parsed_game_id ?? null,
        home: {
          ...(TEAM_BY_EXPORT[game.team_id] ?? null),
          record: recordByTeamId[game.team_id] ? `${recordByTeamId[game.team_id].w}-${recordByTeamId[game.team_id].l}` : "--",
        },
        away: {
          ...awayTeam,
          record: recordByTeamId[awayKey] ? `${recordByTeamId[awayKey].w}-${recordByTeamId[awayKey].l}` : "--",
        },
        homeScore: Number(game.score_team ?? 0),
        awayScore: Number(game.score_opp ?? 0),
        homeByQ: [7, 3, 10, 7],
        awayByQ: [3, 7, 7, 6],
        stageLabel: getStageLabelFromWeek(week),
        gameName: week === 15 ? "Celebration Bowl" : week === 14 ? "SWAC Championship Game" : "Conference Matchup",
        location: "Neutral Site",
      };
    });

    const teamMetaById = teamsData.teams.reduce((acc, team) => {
      acc[team.exportId.replace(/25$/, "")] = team;
      return acc;
    }, {});

    const teamRows = Object.entries(recordByTeamId)
      .map(([teamId, rec]) => ({
        teamId,
        shortName: TEAM_BY_EXPORT[teamId]?.shortName ?? teamMetaById[teamId]?.shortName ?? teamId,
        conference: teamMetaById[teamId]?.conference,
        division: teamMetaById[teamId]?.division,
        wins: rec.w,
        losses: rec.l,
        record: `${rec.w}-${rec.l}`,
      }))
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    const topBy = (conference, division = null) =>
      teamRows
        .filter((row) => row.conference === conference)
        .filter((row) => (division ? row.division === division : true))
        .slice(0, 3);

    const upcomingForTeam = (teamId) =>
      parsed
        .filter((game) => game.team_id === teamId && !game.result)
        .slice(0, 3)
        .map((game) => game.opponent_name ?? "TBD");

    const recentForTeam = (teamId) =>
      parsed
        .filter((game) => game.team_id === teamId && !!game.result)
        .slice(-5)
        .reverse();

    const jsuRecent = recentForTeam("swacjsu");
    const jsuHomeRecent = jsuRecent.filter((g) => g.home_away === "home").slice(0, 3);
    const jsuRoadRecent = jsuRecent.filter((g) => g.home_away === "away").slice(0, 3);

    const quick = {
      swacWestTop3: topBy("SWAC", "West"),
      swacEastTop3: topBy("SWAC", "East"),
      meacTop3: topBy("MEAC"),
      gameOfWeek: {
        awayShort: getTeamTicker(TEAM_BY_NAME[normalizeName(upcoming[0]?.opponent_name)] ?? { shortName: upcoming[0]?.opponent_name }),
        homeShort: getTeamTicker(TEAM_BY_EXPORT[upcoming[0]?.team_id]),
        stageLabel: getStageLabelFromWeek(getWeekFromStem(upcoming[0]?.parsed_game_stem) ?? upcoming[0]?.game_index),
        dateLabel: upcoming[0]?.date ?? "TBD",
      },
      lookAhead: {
        awayShort: getTeamTicker(TEAM_BY_NAME[normalizeName(upcoming[1]?.opponent_name)] ?? { shortName: upcoming[1]?.opponent_name }),
        homeShort: getTeamTicker(TEAM_BY_EXPORT[upcoming[1]?.team_id]),
        stageLabel: getStageLabelFromWeek(getWeekFromStem(upcoming[1]?.parsed_game_stem) ?? upcoming[1]?.game_index),
        dateLabel: upcoming[1]?.date ?? "TBD",
      },
      upcomingStretch: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        games: upcomingForTeam("swacjsu"),
        summary: "2 of next 3 are versus projected top Glory-5 opponents.",
      },
      teamForm: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        results: jsuRecent.map((g) => ({
          result: g.result,
          margin: Number(g.score_team ?? 0) - Number(g.score_opp ?? 0),
        })),
      },
      homeHeroes: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        record: `${jsuHomeRecent.filter((g) => g.result === "W").length}-${jsuHomeRecent.filter((g) => g.result === "L").length}`,
        detail: "Recent home stand with consistent closing drives in Q4.",
      },
      roadWorld: {
        team: TEAM_BY_EXPORT.swacjsu?.shortName ?? "JSU",
        record: `${jsuRoadRecent.filter((g) => g.result === "W").length}-${jsuRoadRecent.filter((g) => g.result === "L").length}`,
        detail: "Road slate resilience and win conversion outside home turf.",
      },
    };

    return {
      featuredGames: featured,
      scheduleRailCards: resultCards,
      quickCards: quick,
    };
  }, [games]);

  return (
    <PageShellDesktop
      sidebar={<SidebarTabs sectionLabel="Game Center" tabs={SIDEBAR_TABS} />}
      contentMaxW="1200px"
    >
      <Box mb={4}>
        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
          Visual Map
        </Text>
        <Text fontSize="sm" color="text.secondary" mt={1}>
          Approved direction: 4 completed-result cards up top, 1x3 schedule rail on the left, and the remaining hub modules to the right.
        </Text>
      </Box>

      <DesktopBoard4x autoRows="minmax(200px, auto)" gap={5}>
        <Slot4x1>
          <Banner4x1
            kicker="Game Center Lab"
            headline="Game Center Tactical Board"
            description="Desktop reference layout using the current accepted card language: recent finals, a stacked 1x3 schedule rail, and remaining intelligence modules."
            meta="Banner is fixed 4x1"
          />
        </Slot4x1>

        {Array.from({ length: 4 }).map((_, index) => {
          const game = featuredGames[index] ?? null;
          return (
            <Slot1x1 key={`game-${index + 1}`}>
              {game ? <GameCardStyleLab card={game} variant="broadcast" /> : null}
            </Slot1x1>
          );
        })}

        <Slot1x3>
          <ScheduleRailList cards={scheduleRailCards} />
        </Slot1x3>

        {DASHGRAPH_DEFS.map((card) => (
          <Slot1x1 key={card.id}>
            {card.id === "swac-west-top3" ? (
              <TopThreeStandingsCard title={card.title} rows={quickCards.swacWestTop3} />
            ) : card.id === "swac-east-top3" ? (
              <TopThreeStandingsCard title={card.title} rows={quickCards.swacEastTop3} />
            ) : card.id === "meac-top3" ? (
              <TopThreeStandingsCard title={card.title} rows={quickCards.meacTop3} />
            ) : card.id === "game-of-week" ? (
              <ScheduleHeadlineCard title={card.title} game={quickCards.gameOfWeek} footer="92.4 Glory Excitement Rating" />
            ) : card.id === "look-ahead" ? (
              <ScheduleHeadlineCard title={card.title} game={quickCards.lookAhead} footer="Glory Ranked 2 vs 5" />
            ) : card.id === "upcoming-stretch" ? (
              <UpcomingStretchCard team={quickCards.upcomingStretch.team} games={quickCards.upcomingStretch.games} summary={quickCards.upcomingStretch.summary} />
            ) : card.id === "team-form" ? (
              <TeamFormCard team={quickCards.teamForm.team} results={quickCards.teamForm.results} />
            ) : card.id === "home-heroes" ? (
              <RecordSplitCard title={card.title} team={quickCards.homeHeroes.team} record={quickCards.homeHeroes.record} detail={quickCards.homeHeroes.detail} />
            ) : (
              <RecordSplitCard title={card.title} team={quickCards.roadWorld.team} record={quickCards.roadWorld.record} detail={quickCards.roadWorld.detail} />
            )}
          </Slot1x1>
        ))}
      </DesktopBoard4x>
    </PageShellDesktop>
  );
};

export default GameCenterLayoutLabPage;
