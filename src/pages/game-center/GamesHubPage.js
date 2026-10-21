import { useRef, useState } from "react";
import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import GamesHubBanner from "../../components/molecules/game/GamesHubBanner";
import { GAME_CENTER_SEASONS } from "../../components/molecules/game/SeasonSelector";
import teamsData from "../../data/teams.json";
import { useGamesHubData } from "../../hooks/useGamesHubData";
import { getGameWeek } from "../../utils/gamesHubModel";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";

// ─────────────────────────────────────────────────────────────────────────────
// GAMES HUB — the season as one grid, not a feed.
//
// Every game the season contains, played or not, in the order they were played,
// six to eight across. No narrative layer, no featured cards, no ranking: the
// component's only job is to show the shape and the count of a season at once.
//
// Each grid cell is two rows on a tinted ground:
//
//   • the week row — the week's label, printed only on the first game of that
//     week and left empty (but the same height) on every game after it, so the
//     tiles below stay aligned across a row
//   • the game tile — the standard dark card, sitting on that ground. A fixed
//     five-row stack, the same five rows on every card:
//         1  date            (+ kickoff time, on a game not yet played)
//         2  away team
//         3  home team
//         4  game name       Bayou Classic / Homecoming — no export carries one
//                            yet, so the row holds its height and stays empty
//         5  location
//
// The CELL is what carries the week's colour; the card on top of it never
// changes. A week therefore reads as a run of same-tinted cells, and nothing
// about the game card has to bend around it — games still run continuously
// across rows and a week can begin mid-row.
//
// Two tile states, not two components: a played game carries scores on its team
// rows and marks the winner; an upcoming one carries no score at all, puts the
// kickoff time up on the date row, and wears a dashed edge.
// ─────────────────────────────────────────────────────────────────────────────

// Two grounds, alternating week by week — dark grey, then black. Each carries
// the card colour that goes with it: the card is always a step LIGHTER than the
// cell it sits in, so the game reads as raised out of its week rather than
// outlined against it. Ink is the week label's, which sits on the ground itself.
const WEEK_TINTS = [
  { bg: "#26262A", card: "#33333A", ink: "rgba(255,255,255,0.55)" },
  { bg: "#000000", card: "#141416", ink: "rgba(255,255,255,0.45)" },
];

// Spring games and the odd unscheduled row belong to no week, and sit between
// the two grounds rather than quietly joining one of them.
const NO_WEEK_TINT = { bg: "#131317", card: "#1F1F24", ink: "rgba(255,255,255,0.4)" };

const tintForWeek = (week) => (Number.isFinite(week) ? WEEK_TINTS[week % WEEK_TINTS.length] : NO_WEEK_TINT);

// Fixed row heights. The rows are identical on every card by construction, which
// is what keeps the grid regular where a venue wraps to two lines or a game has
// no event name.
const ROW_H = {
  week: "1rem",
  date: "0.875rem",
  team: "1.25rem",
  event: "0.75rem",
  venue: "1.875rem", // two lines of 9px at 1.2, plus the 4px gap under the rule
};

// Only the 18 have logos. An outside opponent still gets a guessed asset path
// from the team resolver, so it is checked against the 18 first, and any logo
// that fails to load falls back too.
const LEAGUE_IDS = new Set(teamsData.teams.map((t) => t.exportId.replace(/25$/, "")));

const TeamLogo = ({ team, size }) => {
  const [broken, setBroken] = useState(false);
  const isLeague = LEAGUE_IDS.has(team?.teamId) || LEAGUE_IDS.has(team?.id);
  return (
    <Box w={size} h={size} flexShrink={0} display="flex" alignItems="center" justifyContent="center">
      {team?.logo && isLeague && !broken ? (
        <Image src={team.logo} alt="" w="full" h="full" objectFit="contain" onError={() => setBroken(true)} />
      ) : (
        // Outside opponents ship a name but no logo. A neutral dot holds the
        // column so names stay aligned down the grid.
        <Box w="0.375rem" h="0.375rem" borderRadius="full" bg="whiteAlpha.300" />
      )}
    </Box>
  );
};

const TeamRow = ({ team, score, isWinner, showScore, mobile = false }) => (
  <Flex align="center" gap={mobile ? 1 : 1.5} minW={0} h={ROW_H.team}>
    <TeamLogo team={team} size={mobile ? "0.8rem" : "0.875rem"} />
    <Text
      flex="1"
      minW={0}
      fontSize={mobile ? "10px" : "11px"}
      fontWeight={isWinner ? "black" : "bold"}
      color={isWinner ? "white" : "text.secondary"}
      textTransform="uppercase"
      letterSpacing="0.03em"
      lineClamp={1}
    >
      {team?.shortName ?? team?.name ?? "TBD"}
    </Text>
    {showScore && (
      <Text
        flexShrink={0}
        fontFamily="mono"
        fontSize="13px"
        fontWeight="black"
        color={isWinner ? "white" : "text.muted"}
      >
        {score ?? "—"}
      </Text>
    )}
  </Flex>
);

const GameTile = ({ game, cardBg, mobile = false, shine = null }) => {
  const { homeTeam = {}, awayTeam = {} } = game;
  const played = Boolean(game.isFinal);
  const winnerIs = (team) => played && game.winnerTeamId && team?.teamId === game.winnerTeamId;
  // fmtTime hands back "TBA" for a missing kickoff; that is noise on a tile this
  // small, so only a real time earns the slot.
  const kickoff = game.kickoffTime && game.kickoffTime !== "TBA" ? game.kickoffTime : null;

  return (
      <Flex
        className={shine ? "game-card gh-shine" : "game-card"}
        style={shine ? { "--gh-shine": shine.color, "--gh-delay": `${shine.delay}ms` } : undefined}
        direction="column"
        flex="1"
        px={mobile ? 1 : 2}
        py={mobile ? 1 : 1.5}
        gap={0.5}
        borderRadius="sm"
        bg={cardBg}
        // A game still to be played wears a dashed edge. The card's ground never
        // changes — the week's colour lives on the cell behind it.
        border="1px"
        borderStyle={played ? "solid" : "dashed"}
        borderColor="whiteAlpha.200"
        transition="border-color 0.15s ease"
      >
        {/* 1 — date, with kickoff riding along on a game not yet played */}
        <Flex align="baseline" justify="space-between" gap={1} h={ROW_H.date} minW={0}>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {game.dateLabel ?? "TBD"}
          </Text>
          {!played && kickoff && (
            <Text fontSize="9px" fontWeight="bold" color="text.muted" letterSpacing="0.04em" flexShrink={0} lineClamp={1}>
              {kickoff}
            </Text>
          )}
        </Flex>

        {/* 2, 3 — away over home */}
        <TeamRow team={awayTeam} score={game.awayScore} isWinner={winnerIs(awayTeam)} showScore={played} mobile={mobile} />
        <TeamRow team={homeTeam} score={game.homeScore} isWinner={winnerIs(homeTeam)} showScore={played} mobile={mobile} />

        {/* 4 — game name. Empty on every game today; the row keeps its height so
            the grid stays regular the day it starts filling in. */}
        <Text h={ROW_H.event} fontSize="9px" fontWeight="black" color="text.secondary" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
          {game.eventName ?? ""}
        </Text>

        {/* 5 — location, under a hairline separating the matchup from where it
            happened. A Box line, not a Divider (AgentDesignBible). */}
        <Box h="1px" bg="whiteAlpha.100" />
        <Text h={ROW_H.venue} pt={1} fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.03em" lineHeight="1.2" lineClamp={2}>
          {game.venue ? String(game.venue).toUpperCase() : "TBD"}
        </Text>
      </Flex>
  );
};

/**
 * One cell: the week's tinted ground, carrying a week row and the game card.
 * The label prints only where the week turns over — everywhere else that row is
 * empty at the same height, which is what keeps the cards aligned across a row.
 */
const GameCell = ({ game, tint, weekLabel, mobile = false, cellRef = undefined, shine = null }) => (
  <Flex
    ref={cellRef}
    style={{ scrollMarginTop: "calc(var(--app-header-height) + 0.75rem)" }}
    as={game.route ? Link : "div"}
    to={game.route ?? undefined}
    direction="column"
    h="full"
    minW={0}
    bg={tint.bg}
    px={mobile ? "2px" : 1}
    pb={mobile ? "2px" : 1}
    textDecoration="none"
    cursor={game.route ? "pointer" : "default"}
    // The whole tinted block is the target, week row included — a tile is small
    // enough that hunting for the exact card edge is work. Games with no page
    // yet (every 2026 row, and 116 of 188 in 2025) simply are not links.
    _hover={game.route ? { "& .game-card": { borderColor: "whiteAlpha.500" } } : undefined}
  >
    <Flex align="center" h={ROW_H.week} px={1} flexShrink={0}>
      {weekLabel && (
        <Text fontSize="9px" fontWeight="black" color={tint.ink} textTransform="uppercase" letterSpacing="0.16em" lineClamp={1}>
          {weekLabel}
        </Text>
      )}
    </Flex>
    <GameTile game={game} cardBg={tint.card} mobile={mobile} shine={shine} />
  </Flex>
);

/**
 * Walk the season in play order, handing each game its week's ground and giving
 * only the first game of a week a label to print.
 */
const withWeeks = (games) => {
  let current;
  return games.map((game) => {
    const week = getGameWeek(game);
    const key = Number.isFinite(week) ? week : null;
    const isFirst = key !== current;
    current = key;
    return {
      game,
      tint: tintForWeek(week),
      weekLabel: isFirst && key !== null ? `Week ${week}` : null,
    };
  });
};

// A one-time shine on load: the last week played (purple) and the week after
// it (gold) light their card edges once, rippling left to right, then settle
// back. CSS only — it runs when a card mounts and never repeats on its own.
const SHINE_CSS = `
  @keyframes ghShine {
    0%   { box-shadow: 0 0 0 0 transparent; border-color: rgba(255,255,255,0.2); }
    25%  { box-shadow: 0 0 0 2px var(--gh-shine), 0 0 18px var(--gh-shine); border-color: var(--gh-shine); }
    100% { box-shadow: 0 0 0 0 transparent; border-color: rgba(255,255,255,0.2); }
  }
  .gh-shine { animation: ghShine 1.6s ease-out both; animation-delay: var(--gh-delay, 0ms); }
  @media (prefers-reduced-motion: reduce) { .gh-shine { animation: none; } }
`;
const SHINE = { recent: "#A855F7", upcoming: "#F6C344" };

// The last week that has a final: the page opens there.
const lastPlayedWeek = (games) =>
  games.reduce((max, g) => {
    const w = getGameWeek(g);
    return g.isFinal && Number.isFinite(w) && (max == null || w > max) ? w : max;
  }, null);

const GamesGrid = ({ games, mobile = false, jumpRef = undefined }) => {
  const target = lastPlayedWeek(games);
  // The week after the last one played that actually has games.
  const next = games.map(getGameWeek).filter((w) => Number.isFinite(w) && (target == null || w > target)).sort((a, b) => a - b)[0] ?? null;
  const order = {};
  const shineFor = (game) => {
    const w = getGameWeek(game);
    const kind = w === target ? "recent" : w === next ? "upcoming" : null;
    if (!kind) return null;
    const i = (order[kind] = (order[kind] ?? -1) + 1);
    return { color: SHINE[kind], delay: (kind === "upcoming" ? 450 : 0) + i * 55 };
  };
  return (
  <Box bg="bg.secondary" border={mobile ? "none" : "1px solid"} borderColor="whiteAlpha.100" borderRadius={mobile ? "0" : "xl"} overflow="hidden">
    <style>{SHINE_CSS}</style>
    {games.length === 0 ? (
      <Flex justify="center" align="center" minH="120px" m={2} border="1px dashed" borderColor="whiteAlpha.200" borderRadius="lg">
        <Text color="text.muted" fontWeight="bold">No games match the current filters.</Text>
      </Flex>
    ) : (
      // Six to eight across by breakpoint. Every track is `minmax(0, 1fr)` — the
      // old `minmax(180px, 1fr)` set a 1,440px floor on eight columns, wider than
      // the container, so the last columns were clipped rather than shown.
      <Grid
        // Phones: four across, flush.
        templateColumns={mobile ? "repeat(4, minmax(0, 1fr))" : {
          base: "repeat(2, minmax(0, 1fr))",
          sm: "repeat(3, minmax(0, 1fr))",
          md: "repeat(6, minmax(0, 1fr))",
          lg: "repeat(7, minmax(0, 1fr))",
          xl: "repeat(8, minmax(0, 1fr))",
        }}
        gap={0}
        alignItems="stretch"
      >
        {withWeeks(games).map(({ game, tint, weekLabel }) => (
          <GameCell
            key={game.id}
            game={game}
            tint={tint}
            weekLabel={weekLabel}
            mobile={mobile}
            cellRef={weekLabel && getGameWeek(game) === target ? jumpRef : undefined}
            shine={shineFor(game)}
          />
        ))}
      </Grid>
    )}
  </Box>
  );
};

const GamesHubPage = () => {
  const {
    season,
    setSeason,
    weekFilter,
    setWeekFilter,
    teamFilter,
    setTeamFilter,
    conferenceFilter,
    setConferenceFilter,
    statusFilter,
    setStatusFilter,
    availableWeeks,
    filteredGames,
    isLoading,
  } = useGamesHubData();

  const { isMobile } = useLayoutDensity();

  // On load, and on each season switch, scroll to the last week played. A ref
  // callback on that week's first cell does it the moment the cell mounts —
  // no effect; `jumped` keeps it to once per season so filtering never yanks
  // the page.
  const jumped = useRef(null);
  const jumpRef = (el) => {
    if (!el || jumped.current === season) return;
    jumped.current = season;
    requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  };

  const banner = (
    <GamesHubBanner
      seasons={GAME_CENTER_SEASONS}
      teams={teamsData.teams}
      season={season}
      week={weekFilter}
      teamId={teamFilter}
      conference={conferenceFilter}
      status={statusFilter}
      weeks={availableWeeks}
      onSeasonChange={(value) => setSeason(value)}
      onWeekChange={setWeekFilter}
      onConferenceChange={setConferenceFilter}
      onTeamChange={setTeamFilter}
      onStatusChange={setStatusFilter}
    />
  );

  // Phones: own tree, not PageShell — banner edge to edge, then the grid flush.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        {banner}
        {isLoading ? (
          <Flex align="center" justify="center" minH="200px">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        ) : (
          <GamesGrid games={filteredGames} mobile jumpRef={jumpRef} />
        )}
      </Box>
    );
  }

  // The grid rides in PageShell's list region rather than a Slot: the shell's
  // grid tracks are a fixed `clamp(200px, 24vw, 320px)` each, so a slot clips at
  // its row span instead of growing with its contents. A whole season is however
  // many rows it is, and the page scrolls.
  return (
    <PageShell
      listContent={
        isLoading ? (
          <Flex align="center" justify="center" minH="200px">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        ) : (
          <GamesGrid games={filteredGames} jumpRef={jumpRef} />
        )
      }
    >
      <PageShell.Slot cols={4}>{banner}</PageShell.Slot>
    </PageShell>
  );
};

export default GamesHubPage;
