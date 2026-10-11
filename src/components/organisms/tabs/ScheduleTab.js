import { useState, useMemo } from "react";
import { Box, Flex, Grid, Text, Image, Spinner } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import teamsData from "../../../data/teams.json";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEASONS = [2021, 2022, 2023, 2024, 2025];
const DEFAULT_SEASON = 2025;
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  return acc;
}, {});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d) => {
  if (!d) return "TBD";
  const dt = new Date(d + "T12:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// eslint-disable-next-line no-unused-vars
const getWeek = (game) => game.week ?? null;

const fileIdFor = (exportId) => {
  const base = exportId?.replace(/25$/, "");
  if (base === "swacjsu") return "swacmjsu";
  return base;
};

// ─── Control bar ──────────────────────────────────────────────────────────────

const ControlBar = ({ view, setView, season, setSeason, stats }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    px={5}
    py={3}
    mb={6}
  >
    <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">

      {/* Record summary */}
      <Flex gap={5} align="center">
        {[
          { label: "Overall",  value: `${stats.w}–${stats.l}` },
          { label: "Conf",     value: `${stats.cw}–${stats.cl}` },
          { label: "Home",     value: `${stats.hw}–${stats.hl}` },
          { label: "Away",     value: `${stats.aw}–${stats.al}` },
        ].map((s) => (
          <Box key={s.label}>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">{s.label}</Text>
            <Text fontSize="md" fontWeight="black" color="white" lineHeight={1.1}>{s.value}</Text>
          </Box>
        ))}
      </Flex>

      {/* View toggle */}
      <Flex gap={1} bg="whiteAlpha.50" borderRadius="lg" p="3px">
        {[{ id: "list", label: "Season" }, { id: "calendar", label: "Calendar" }].map((v) => (
          <Box
            key={v.id}
            as="button"
            px={4}
            py={1}
            borderRadius="md"
            bg={view === v.id ? "whiteAlpha.200" : "transparent"}
            border="1px solid"
            borderColor={view === v.id ? "whiteAlpha.300" : "transparent"}
            onClick={() => setView(v.id)}
            style={{ transition: "all 0.15s" }}
          >
            <Text fontSize="xs" fontWeight={view === v.id ? "black" : "medium"}
              color={view === v.id ? "white" : "text.muted"}>
              {v.label}
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Season picker */}
      <Flex gap={1} align="center">
        <Text fontSize="8px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mr={2}>Season</Text>
        {SEASONS.map((s) => (
          <Box
            key={s}
            as="button"
            px={3}
            py={1}
            borderRadius="md"
            bg={season === s ? "brand.500" : "transparent"}
            border="1px solid"
            borderColor={season === s ? "brand.500" : "whiteAlpha.100"}
            onClick={() => setSeason(s)}
            style={{ transition: "all 0.15s" }}
          >
            <Text fontSize="xs" fontWeight={season === s ? "black" : "normal"}
              color={season === s ? "white" : "text.muted"}>{s}</Text>
          </Box>
        ))}
      </Flex>

    </Flex>
  </Box>
);

// ─── Game row (list view) ─────────────────────────────────────────────────────

const GameRow = ({ game }) => {
  const isComplete = !!game.result;
  const won = game.result === "W";
  const lost = game.result === "L";
  const opponent = TEAM_BY_EXPORT[game.opponent_id];
  const logo = opponent ? `/assets/${opponent.exportId.replace(/25$/, "")}.svg` : null;
  const opponentLabel = opponent?.shortName ?? game.opponent_name ?? "TBD";
  const resultColor = won ? "green.400" : lost ? "red.400" : "text.muted";
  const isCorpus = game.has_parsed_game && game.parsed_game_stem;

  const inner = (
    <Flex
      align="center"
      gap={4}
      px={4}
      py={4}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      _last={{ borderBottom: "none" }}
      _hover={isCorpus ? { bg: "whiteAlpha.50" } : {}}
      style={{ transition: "background 0.15s" }}
    >
      {/* Week + date */}
      <Box flexShrink={0} w="52px" textAlign="center">
        <Box px={2} py={1} bg="whiteAlpha.100" borderRadius="md" mb={1}>
          <Text fontSize="10px" fontWeight="black" color="white">
            W{game.week ?? "—"}
          </Text>
        </Box>
        <Text fontSize="8px" color="text.muted">{fmtDate(game.date)}</Text>
      </Box>

      {/* Opponent */}
      <Flex align="center" gap={3} flex={1} minW={0}>
        {logo ? (
          <Box w="32px" h="32px" flexShrink={0}>
            <Image src={logo} w="32px" h="32px" objectFit="contain"
              onError={(e) => { e.target.style.display = "none"; }} />
          </Box>
        ) : (
          <Box w="32px" h="32px" borderRadius="full" bg="whiteAlpha.100" flexShrink={0}
            display="flex" alignItems="center" justifyContent="center">
            <Text fontSize="8px" fontWeight="black" color="text.muted">
              {opponentLabel.slice(0, 3).toUpperCase()}
            </Text>
          </Box>
        )}
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="bold" color="white" lineClamp={1}>{opponentLabel}</Text>
          <Text fontSize="9px" color="text.muted">
            {game.home_away === "home" ? "HOME" : "AWAY"}
            {game.site ? ` · ${game.site}` : ""}
          </Text>
        </Box>
      </Flex>

      {/* Tags */}
      <Flex gap={1} flexShrink={0}>
        {game.conf_game && (
          <Box px={2} py="2px" borderRadius="sm" bg="whiteAlpha.100">
            <Text fontSize="8px" fontWeight="black" color="text.muted">CONF</Text>
          </Box>
        )}
        {game.game_name && (
          <Box px={2} py="2px" borderRadius="sm" bg="rgba(229,62,62,0.15)">
            <Text fontSize="8px" fontWeight="black" color="brand.400" lineClamp={1} maxW="80px">
              {game.game_name}
            </Text>
          </Box>
        )}
      </Flex>

      {/* Result */}
      <Box flexShrink={0} textAlign="right" w="110px">
        {isComplete ? (
          <>
            <Text fontSize="md" fontWeight="black" color={resultColor}>
              {game.result} {game.score_team}–{game.score_opp}
            </Text>
            {isCorpus && (
              <Text fontSize="8px" color="brand.400" textTransform="uppercase" letterSpacing="0.1em">
                Recap →
              </Text>
            )}
          </>
        ) : (
          <Text fontSize="9px" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
            Upcoming
          </Text>
        )}
      </Box>
    </Flex>
  );

  return isCorpus
    ? <Box as={Link} to={`/game/${game.parsed_game_stem}`} display="block">{inner}</Box>
    : inner;
};

// ─── List view ────────────────────────────────────────────────────────────────

const ListView = ({ games }) => {
  const completed = games.filter((g) => g.result);
  const upcoming  = games.filter((g) => !g.result);

  const Section = ({ label, accent, items }) => (
    <Box mb={6}>
      <Flex align="center" gap={3} mb={3}>
        <Box w="4px" h="18px" bg={accent} borderRadius="full" />
        <Text fontSize="xs" fontWeight="black" color="text.secondary"
          textTransform="uppercase" letterSpacing="0.12em">{label}</Text>
        <Text fontSize="9px" color="text.muted">{items.length} games</Text>
        <Box flex={1} h="1px" bg="whiteAlpha.100" />
      </Flex>
      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
        borderRadius="xl" overflow="hidden">
        {items.map((g, i) => <GameRow key={g.parsed_game_stem || `g-${i}`} game={g} />)}
      </Box>
    </Box>
  );

  if (!games.length) return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" p={12} textAlign="center">
      <Text color="text.muted">No games found for this season.</Text>
    </Box>
  );

  return (
    <>
      {completed.length > 0 && <Section label="Results" accent="brand.500" items={completed} />}
      {upcoming.length > 0  && <Section label="Upcoming" accent="whiteAlpha.300" items={upcoming} />}
    </>
  );
};

// ─── Calendar view ────────────────────────────────────────────────────────────

const CalendarView = ({ games, team }) => {
  const gameMonths = useMemo(() => {
    const months = new Set();
    games.forEach((g) => {
      if (g.date) months.add(g.date.slice(0, 7)); // "YYYY-MM"
    });
    return [...months].sort();
  }, [games]);

  const [monthKey, setMonthKey] = useState(() => gameMonths[0] ?? "2025-08");

  const currentIdx = gameMonths.indexOf(monthKey);
  const [year, month] = monthKey.split("-").map(Number);

  const firstDay  = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();

  const gamesByDate = useMemo(() => {
    const map = {};
    games.forEach((g) => {
      if (g.date?.startsWith(monthKey)) {
        const day = Number(g.date.split("-")[2]);
        map[day] = g;
      }
    });
    return map;
  }, [games, monthKey]);

  // Build calendar cells: nulls for leading empty days, then 1..daysInMonth
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const primary = team?.colors?.primary ?? "#E53E3E";

  return (
    <Box>
      {/* Month nav */}
      <Flex align="center" justify="space-between" mb={4}>
        <Text fontSize="2xl" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="-0.02em">
          {MONTHS[month - 1]}{" "}
          <Box as="span" color="text.muted" fontWeight="normal">{year}</Box>
        </Text>
        <Flex gap={2}>
          <Box
            as="button"
            px={3} py={1} borderRadius="md"
            bg={currentIdx > 0 ? "whiteAlpha.100" : "whiteAlpha.50"}
            border="1px solid" borderColor="whiteAlpha.100"
            onClick={() => currentIdx > 0 && setMonthKey(gameMonths[currentIdx - 1])}
            opacity={currentIdx > 0 ? 1 : 0.3}
            style={{ transition: "all 0.15s" }}
          >
            <ChevronLeft size={14} color="white" />
          </Box>
          <Box
            as="button"
            px={3} py={1} borderRadius="md"
            bg={currentIdx < gameMonths.length - 1 ? "whiteAlpha.100" : "whiteAlpha.50"}
            border="1px solid" borderColor="whiteAlpha.100"
            onClick={() => currentIdx < gameMonths.length - 1 && setMonthKey(gameMonths[currentIdx + 1])}
            opacity={currentIdx < gameMonths.length - 1 ? 1 : 0.3}
            style={{ transition: "all 0.15s" }}
          >
            <ChevronRight size={14} color="white" />
          </Box>
        </Flex>
      </Flex>

      {/* Day headers */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={1}>
        {DAYS.map((d) => (
          <Box key={d} textAlign="center" py={2}>
            <Text fontSize="8px" fontWeight="black" color="text.muted"
              textTransform="uppercase" letterSpacing="0.12em">{d}</Text>
          </Box>
        ))}
      </Grid>

      {/* Calendar grid */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {cells.map((day, i) => {
          const game = day ? gamesByDate[day] : null;
          const isGameDay = !!game;
          const won = game?.result === "W";
          const lost = game?.result === "L";
          const upcoming = isGameDay && !game.result;
          const opponent = game ? (TEAM_BY_EXPORT[game.opponent_id]?.shortName ?? game.opponent_name ?? "TBD") : null;

          return (
            <Box
              key={i}
              minH="80px"
              borderRadius="lg"
              bg={isGameDay ? `${primary}22` : "whiteAlpha.50"}
              border="1px solid"
              borderColor={
                won ? "green.500" :
                lost ? "red.500" :
                upcoming ? `${primary}66` :
                "whiteAlpha.100"
              }
              p={2}
              position="relative"
              overflow="hidden"
            >
              {day && (
                <>
                  <Text fontSize="10px" fontWeight={isGameDay ? "black" : "normal"}
                    color={isGameDay ? "white" : "text.muted"} lineHeight={1}>
                    {day}
                  </Text>

                  {isGameDay && (
                    <Box mt={1}>
                      {/* Game name badge */}
                      {game.game_name && (
                        <Box
                          px={1} py="1px" borderRadius="sm"
                          bg="rgba(229,62,62,0.3)"
                          display="inline-block" mb={1}
                        >
                          <Text fontSize="7px" fontWeight="black" color="brand.400"
                            textTransform="uppercase" lineClamp={1}>
                            {game.game_name}
                          </Text>
                        </Box>
                      )}

                      {/* Opponent */}
                      <Text fontSize="xs" fontWeight="black" color="white" lineClamp={2} lineHeight={1.2}>
                        {game.home_away === "away" ? "@ " : ""}{opponent}
                      </Text>

                      {/* Result or upcoming */}
                      {game.result ? (
                        <Text
                          fontSize="sm"
                          fontWeight="black"
                          color={won ? "green.400" : "red.400"}
                          mt={1}
                        >
                          {game.result} {game.score_team}–{game.score_opp}
                        </Text>
                      ) : (
                        <Text fontSize="8px" color="text.muted" mt={1}
                          textTransform="uppercase" letterSpacing="0.1em">
                          Upcoming
                        </Text>
                      )}
                    </Box>
                  )}
                </>
              )}

              {/* Bye week ghost text — spans full row when no games in week */}
            </Box>
          );
        })}
      </Grid>

      {/* Bye week rows overlay — detect weeks with no game */}
      <ByeWeekOverlay games={games} monthKey={monthKey} firstDay={firstDay} daysInMonth={daysInMonth} />
    </Box>
  );
};

// Detect and label bye weeks
const ByeWeekOverlay = ({ games, monthKey, firstDay, daysInMonth }) => {
  const gameDays = new Set(
    games
      .filter((g) => g.date?.startsWith(monthKey))
      .map((g) => Number(g.date.split("-")[2]))
  );

  // Build week rows: each is [Sun..Sat] day numbers (or null if out of month)
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <>
      {weeks.map((week, wi) => {
        const daysInWeek = week.filter(Boolean);
        if (!daysInWeek.length) return null;
        const hasSaturday = week[6] !== null;
        const satHasGame = hasSaturday && gameDays.has(week[6]);
        if (satHasGame || !hasSaturday) return null;
        // Saturday in month but no game — bye week candidate
        const anyGame = daysInWeek.some((d) => gameDays.has(d));
        if (anyGame) return null;

        return (
          <Box
            key={wi}
            position="absolute"
            // Can't easily overlay — just show as legend below
            display="none"
          />
        );
      })}
    </>
  );
};

// ─── Schedule Hub ─────────────────────────────────────────────────────────────

const ScheduleTab = ({ team }) => {
  const [view, setView]     = useState("list");
  const [season, setSeason] = useState(DEFAULT_SEASON);

  const fileId = fileIdFor(team?.exportId);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["team-schedule", fileId],
    queryFn: async () => {
      const res = await fetch(`/data/1-game center/schedules/by_team/${fileId}.json`);
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    staleTime: Infinity,
    enabled: !!fileId,
  });

  const games = useMemo(() => {
    const all = data?.games ?? [];
    return all
      .filter((g) => Number(g.season) === season)
      .sort((a, b) => String(a.date ?? "").localeCompare(String(b.date ?? "")));
  }, [data, season]);

  // Record stats
  const stats = useMemo(() => {
    const done = games.filter((g) => g.result);
    return {
      w:  done.filter((g) => g.result === "W").length,
      l:  done.filter((g) => g.result === "L").length,
      cw: done.filter((g) => g.conf_game && g.result === "W").length,
      cl: done.filter((g) => g.conf_game && g.result === "L").length,
      hw: done.filter((g) => g.home_away === "home" && g.result === "W").length,
      hl: done.filter((g) => g.home_away === "home" && g.result === "L").length,
      aw: done.filter((g) => g.home_away === "away" && g.result === "W").length,
      al: done.filter((g) => g.home_away === "away" && g.result === "L").length,
    };
  }, [games]);

  if (isLoading) return (
    <Flex justify="center" py={20}>
      <Spinner color="brand.500" size="lg" />
    </Flex>
  );

  if (isError) return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100"
      borderRadius="xl" p={8} textAlign="center">
      <Text color="text.muted">Unable to load schedule.</Text>
    </Box>
  );

  return (
    <Box>
      <ControlBar
        view={view} setView={setView}
        season={season} setSeason={setSeason}
        stats={stats}
      />

      {view === "list"     && <ListView games={games} />}
      {view === "calendar" && <CalendarView games={games} team={team} />}
    </Box>
  );
};

export default ScheduleTab;
