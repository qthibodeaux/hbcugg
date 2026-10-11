import { useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import teamsData from "../../../data/teams.json";
import { gameCenterPaths, fetchJson } from "../../../utils/gameCenterPayloads";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

// Axis fallback. The payload's `axes` block is authoritative once the backend
// ships it - see Conference Slate Design Doc section 3. Unlike game results, a
// stale division roster degrades gracefully rather than showing false data, so
// these stand in until then.
const FALLBACK_AXES = {
  meac: ["meacdsu", "meachu", "meacmsu", "meacnccu", "meacnsu", "meacscsu"],
  swac_east: ["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"],
  swac_west: ["swacalc", "swacgsu", "swacpvamu", "swacsu", "swactsu", "swacuapb"],
};

const compactLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";
const logo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;
const fmtDate = (date) => {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "TBD" : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const Logo = ({ team, size = "26px" }) => (
  <Image src={logo(team)} alt={compactLabel(team)} w={size} h={size} objectFit="contain" />
);

const CompactGameContent = ({ awayTeam, homeTeam, game, winner, isComplete }) => (
  <>
    <Flex align="center" gap={1.5}>
      <Logo team={awayTeam} size="18px" />
      <Text fontSize="8px" color="text.muted" fontWeight="black">@</Text>
      <Logo team={homeTeam} size="18px" />
    </Flex>
    <Text fontSize="9px" color={winner ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineClamp={1}>
      {isComplete ? `${game.awayScore}-${game.homeScore}` : fmtDate(game.date)}
    </Text>
  </>
);

const getAxis = (axes, key) => axes?.[key]?.team_ids ?? FALLBACK_AXES[key];

const getTeamsForView = (conference, swacScope, axes) => {
  if (conference === "MEAC") return getAxis(axes, "meac");
  if (swacScope === "WEST") return getAxis(axes, "swac_west");
  if (swacScope === "EAST") return getAxis(axes, "swac_east");
  return [...getAxis(axes, "swac_east"), ...getAxis(axes, "swac_west")];
};

const buildLookup = (games) =>
  games.reduce((acc, game) => {
    acc[[game.away, game.home].sort().join("|")] = game;
    return acc;
  }, {});

const isFinalGame = (game) =>
  game?.status === "final" &&
  Number.isFinite(Number(game.awayScore)) &&
  Number.isFinite(Number(game.homeScore));

const SlateCell = ({ rowTeamId, colTeamId, game, compact = false }) => {
  const rowTeam = TEAM_BY_ID[rowTeamId];

  if (rowTeamId === colTeamId) {
    return (
      <Flex
        className="slate-cell"
        h={compact ? "62px" : "96px"}
        align="center"
        justify="center"
        bg={`linear-gradient(135deg, ${rowTeam.colors.primary} 0%, ${rowTeam.colors.primary}D9 52%, rgba(8,8,10,0.92) 100%)`}
        border="1px solid rgba(255,255,255,0.08)"
        position="relative"
        overflow="hidden"
      >
        <Image
          src={logo(rowTeam)}
          alt=""
          position="absolute"
          right={compact ? "-22px" : "-34px"}
          bottom={compact ? "-22px" : "-34px"}
          w={compact ? "84px" : "132px"}
          h={compact ? "84px" : "132px"}
          objectFit="contain"
          opacity={compact ? 0.08 : 0.14}
          pointerEvents="none"
          style={{ filter: "grayscale(1) contrast(1.15)" }}
        />
        <Box position="absolute" inset={0} bg="linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 42%)" pointerEvents="none" />
        <Box position="relative" zIndex={1}>
          <Logo team={rowTeam} size={compact ? "32px" : "44px"} />
        </Box>
      </Flex>
    );
  }

  if (!game) {
    return <Box className="slate-cell" h={compact ? "62px" : "96px"} bg="#020203" border="1px solid rgba(255,255,255,0.06)" />;
  }

  const awayTeam = TEAM_BY_ID[game.away];
  const homeTeam = TEAM_BY_ID[game.home];
  const isComplete = isFinalGame(game);
  const winner = isComplete ? (Number(game.awayScore) > Number(game.homeScore) ? awayTeam : homeTeam) : null;
  const awayWon = winner?.exportId === awayTeam.exportId;
  const homeWon = winner?.exportId === homeTeam.exportId;
  const content = (
    <Flex
      className="slate-cell"
      h={compact ? "62px" : "96px"}
      direction="column"
      align="center"
      justify="center"
      gap={compact ? 1 : 1.5}
      px={compact ? 1 : 0}
      position="relative"
      overflow="hidden"
      border="1px solid rgba(255,255,255,0.09)"
      bg={winner ? `linear-gradient(135deg, ${winner.colors.primary}B8 0%, ${winner.colors.primary}66 40%, rgba(14,14,17,0.96) 100%)` : "linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(12,12,15,0.98) 54%, rgba(2,2,3,0.98) 100%)"}
      _hover={game.stem ? { filter: "brightness(1.14)" } : undefined}
    >
      {winner && (
        <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={winner.colors.secondary === "#FFFFFF" ? "white" : winner.colors.secondary} />
      )}
      {compact ? (
        <CompactGameContent awayTeam={awayTeam} homeTeam={homeTeam} game={game} winner={winner} isComplete={isComplete} />
      ) : (
        <>
          <Flex className="slate-compact-content" direction="column" align="center" justify="center" gap={1} display="none">
            <CompactGameContent awayTeam={awayTeam} homeTeam={homeTeam} game={game} winner={winner} isComplete={isComplete} />
          </Flex>
          {isComplete ? (
            <Flex className="slate-wide-content" direction="column" gap={2.5} w="100%" px={{ base: 2, xl: 3 }}>
              {[
                { team: awayTeam, score: game.awayScore, won: awayWon },
                { team: homeTeam, score: game.homeScore, won: homeWon },
              ].map((row) => (
                <Flex key={row.team.exportId} align="center" justify="space-between" gap={3} minW={0}>
                  <Flex align="center" gap={1.5} minW={0}>
                    <Text
                      fontSize={{ base: "15px", xl: "18px" }}
                      color={row.won ? "white" : "text.secondary"}
                      fontWeight={row.won ? "black" : "bold"}
                      textTransform="uppercase"
                      lineHeight={1}
                      lineClamp={1}
                    >
                      {compactLabel(row.team)}
                    </Text>
                  </Flex>
                  <Flex align="center" gap={1.5} flexShrink={0}>
                    {row.won && (
                      <Text fontSize={{ base: "9px", xl: "10px" }} color={row.team.colors.secondary === "#FFFFFF" ? "white" : row.team.colors.secondary} fontWeight="black">
                        W
                      </Text>
                    )}
                    <Text fontSize={{ base: "22px", xl: "27px" }} color={row.won ? "white" : "text.secondary"} fontWeight="black" lineHeight={0.88}>
                      {row.score}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Flex className="slate-wide-content" direction="column" h="100%" w="100%" justify="center" px={{ base: 2, xl: 3 }} pt={2} pb="22px" position="relative">
              <Flex direction="column" gap={1.5} minW={0}>
                {[awayTeam, homeTeam].map((team, index) => (
                  <Text
                    key={`${team.exportId}-${index}`}
                    fontSize={{ base: "16px", xl: "19px" }}
                    color={index === 0 ? "text.secondary" : "white"}
                    fontWeight="black"
                    textTransform="uppercase"
                    lineHeight={1}
                    lineClamp={1}
                  >
                    {compactLabel(team)}
                  </Text>
                ))}
              </Flex>
              <Text
                position="absolute"
                left={0}
                right={0}
                bottom={0}
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="rgba(255,255,255,0.12)"
                fontSize={{ base: "10px", xl: "11px" }}
                color="white"
                fontWeight="black"
                textTransform="uppercase"
                lineClamp={1}
              >
                {fmtDate(game.date)}
              </Text>
            </Flex>
          )}
        </>
      )}
    </Flex>
  );

  return game.stem ? (
    <Box as={Link} to={`/game/${game.stem}`} display="block">
      {content}
    </Box>
  ) : content;
};

const toMatrixMatchup = (matchup) => {
  const [displayAwayScore, displayHomeScore] = String(matchup.score_display ?? "").split("-").map((value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  });
  const away = matchup.away_team_id ?? matchup.team_a_id;
  const home = matchup.home_team_id ?? matchup.team_b_id;
  const awayScore = Number.isFinite(Number(matchup.away_score)) ? Number(matchup.away_score) : displayAwayScore;
  const homeScore = Number.isFinite(Number(matchup.home_score)) ? Number(matchup.home_score) : displayHomeScore;
  const status = matchup.status ?? (matchup.result || matchup.winner_team_id ? "final" : "scheduled");

  return {
    id: matchup.game_path_id ?? `${away}-${home}-${matchup.date}`,
    status,
    date: matchup.date,
    away,
    home,
    awayScore,
    homeScore,
    stem: matchup.game_path_id,
  };
};

export const ConferenceSlateMatrixA = ({ season = 2025 }) => {
  const [conference, setConference] = useState("MEAC");
  const [swacScope, setSwacScope] = useState("WEST");
  const { data, isPending } = useQuery({
    queryKey: ["conference-slate", season],
    queryFn: () => fetchJson(gameCenterPaths.conferenceSlate(season)),
    staleTime: Infinity,
  });
  const teamIds = useMemo(() => getTeamsForView(conference, swacScope, data?.axes), [conference, swacScope, data]);
  const lookup = useMemo(() => buildLookup(data?.matchups?.map(toMatrixMatchup) ?? []), [data]);
  const compact = conference === "SWAC" && swacScope === "ALL";
  const columnWidth = compact ? "74px" : "minmax(128px, 1fr)";
  const gridTemplate = `72px repeat(${teamIds.length}, ${columnWidth})`;
  const rowHeight = compact ? "62px" : "96px";

  return (
    <Box
      className="conference-slate-shell"
      h="100%"
      w="full"
      bg="bg.primary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      <style>{`
        @media (min-width: 641px) and (max-width: 900px) {
          .conference-slate-shell .slate-all-control {
            display: none !important;
          }

          .conference-slate-shell .conference-slate-grid {
            grid-template-columns: 72px repeat(var(--slate-team-count), 74px) !important;
            min-width: var(--slate-compact-min-width) !important;
            grid-auto-rows: 62px !important;
          }

          .conference-slate-shell .slate-cell,
          .conference-slate-shell .slate-axis-cell {
            height: 62px !important;
          }

          .conference-slate-shell .slate-compact-content {
            display: flex !important;
          }

          .conference-slate-shell .slate-wide-content {
            display: none !important;
          }
        }
      `}</style>
      <Flex h="100%" direction="column">
        <Flex align="center" justify="space-between" gap={4} px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Box>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
              Conference Slate
            </Text>
            <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
              {season} Matrix
            </Text>
          </Box>
          <Flex gap={2} align="center" wrap="wrap" justify="end">
            {["MEAC", "SWAC"].map((item) => (
              <Box
                key={item}
                as="button"
                px={3}
                py={1.5}
                borderRadius="full"
                bg={conference === item ? "brand.500" : "whiteAlpha.100"}
                onClick={() => {
                  setConference(item);
                  if (item === "SWAC" && swacScope === "ALL") setSwacScope("WEST");
                }}
              >
                <Text fontSize="9px" color="white" fontWeight="black">{item}</Text>
              </Box>
            ))}
            <Flex gap={1} pl={2} borderLeft="1px solid" borderColor="whiteAlpha.200">
              {["ALL", "WEST", "EAST"].map((item) => (
                <Box
                  key={item}
                  className={item === "ALL" ? "slate-all-control" : undefined}
                  as="button"
                  px={2.5}
                  py={1.5}
                  borderRadius="full"
                  bg={conference === "SWAC" && swacScope === item ? "whiteAlpha.300" : "transparent"}
                  opacity={conference === "SWAC" ? 1 : 0.36}
                  cursor={conference === "SWAC" ? "pointer" : "default"}
                  onClick={() => conference === "SWAC" && setSwacScope(item)}
                >
                  <Text fontSize="9px" color={conference === "SWAC" && swacScope === item ? "white" : "text.muted"} fontWeight="black">{item}</Text>
                </Box>
              ))}
            </Flex>
          </Flex>
        </Flex>

        <Box flex={1} overflow="auto" p={4}>
          {/* The axes are the payload, so an empty grid is indistinguishable from a
              conference with no games. Hold the frame and spin instead. */}
          {isPending ? (
            <Flex h="100%" minH="12rem" align="center" justify="center">
              <Spinner color="brand.500" size="lg" />
            </Flex>
          ) : (
            <Grid
              className="conference-slate-grid"
              templateColumns={gridTemplate}
              minW={compact ? `${72 + teamIds.length * 74}px` : "100%"}
              autoRows={rowHeight}
              style={{ "--slate-team-count": teamIds.length, "--slate-compact-min-width": `${72 + teamIds.length * 74}px` }}
            >
              <Box position="sticky" left={0} top={0} zIndex={4} bg="bg.primary" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100" />
              {teamIds.map((id) => {
                const team = TEAM_BY_ID[id];
                return (
                  <Flex key={`top-${id}`} className="slate-axis-cell" position="sticky" top={0} zIndex={3} align="center" justify="center" bg="bg.primary" borderBottom="1px solid" borderColor="whiteAlpha.100">
                    <Logo team={team} size="34px" />
                  </Flex>
                );
              })}
              {teamIds.map((rowId) => {
                const rowTeam = TEAM_BY_ID[rowId];
                return [
                  <Flex key={`left-${rowId}`} className="slate-axis-cell" position="sticky" left={0} zIndex={2} align="center" justify="center" bg="bg.primary" borderRight="1px solid" borderColor="whiteAlpha.100">
                    <Logo team={rowTeam} size="34px" />
                  </Flex>,
                  ...teamIds.map((colId) => (
                    <SlateCell
                      key={`${rowId}-${colId}`}
                      rowTeamId={rowId}
                      colTeamId={colId}
                      game={lookup[[rowId, colId].sort().join("|")]}
                      compact={compact}
                    />
                  )),
                ];
              })}
            </Grid>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

// ─── Mobile — team-centric swipeable cards ─────────────────────────────────
// The desktop matrix is fundamentally N² cells (36 for a 6-team conference) —
// no amount of shrinking makes that legible on a phone. This reframes it as
// N cards, one per team, each showing that team's own row of results as
// compact matchup rows (reusing the same lookup/game data, just read
// row-by-row for one team instead of all at once). Swipe/scroll-snap between
// teams; tap a logo in the strip up top to jump straight to one.

const TeamMatchupRow = ({ rowTeamId, opponentId, game }) => {
  const opponent = TEAM_BY_ID[opponentId];
  const isComplete = isFinalGame(game);
  const teamIsAway = game?.away === rowTeamId;
  const teamScore = game ? (teamIsAway ? game.awayScore : game.homeScore) : null;
  const oppScore = game ? (teamIsAway ? game.homeScore : game.awayScore) : null;
  const won = isComplete && Number(teamScore) > Number(oppScore);
  const lost = isComplete && Number(teamScore) < Number(oppScore);

  const content = (
    <Flex
      align="center"
      justify="space-between"
      px="0.75rem"
      py="0.6rem"
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg={won ? `${opponent.colors.primary}26` : "transparent"}
    >
      <Flex align="center" gap="0.5rem" minW={0}>
        <Image src={logo(opponent)} alt="" w="1.6rem" h="1.6rem" objectFit="contain" flexShrink={0} />
        <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
          {compactLabel(opponent)}
        </Text>
      </Flex>
      <Flex align="center" gap="0.4rem" flexShrink={0}>
        {isComplete && (
          <Text fontSize="0.65rem" fontWeight="black" color={won ? "#4ADE80" : lost ? "#F87171" : "text.muted"}>
            {won ? "W" : lost ? "L" : "-"}
          </Text>
        )}
        <Text fontSize="1rem" fontWeight="black" color="white">
          {isComplete ? `${teamScore}-${oppScore}` : "TBD"}
        </Text>
      </Flex>
    </Flex>
  );

  return game?.stem ? (
    <Box as={Link} to={`/game/${game.stem}`} display="block">
      {content}
    </Box>
  ) : (
    content
  );
};

const TeamSlateCard = ({ teamId, teamIds, lookup }) => {
  const team = TEAM_BY_ID[teamId];
  const opponents = teamIds.filter((id) => id !== teamId);

  return (
    <Box flex="0 0 100%" minW={0} style={{ scrollSnapAlign: "start" }}>
      <Flex align="center" gap="0.6rem" px="0.75rem" py="0.75rem" bg={`linear-gradient(135deg, ${team.colors.primary} 0%, rgba(10,10,12,0.95) 70%)`}>
        <Image src={logo(team)} alt="" w="2.5rem" h="2.5rem" objectFit="contain" flexShrink={0} />
        <Text fontSize="1.1rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
          {team.name ?? compactLabel(team)}
        </Text>
      </Flex>
      <Box>
        {opponents.map((oppId) => (
          <TeamMatchupRow
            key={oppId}
            rowTeamId={teamId}
            opponentId={oppId}
            game={lookup[[teamId, oppId].sort().join("|")]}
          />
        ))}
      </Box>
    </Box>
  );
};

export const ConferenceSlateMobile = ({ season = 2025 }) => {
  const [conference, setConference] = useState("MEAC");
  const [swacScope, setSwacScope] = useState("WEST");
  const scrollRef = useRef(null);
  const { data, isPending } = useQuery({
    queryKey: ["conference-slate", season],
    queryFn: () => fetchJson(gameCenterPaths.conferenceSlate(season)),
    staleTime: Infinity,
  });
  const teamIds = useMemo(() => getTeamsForView(conference, swacScope, data?.axes), [conference, swacScope, data]);
  const lookup = useMemo(() => buildLookup(data?.matchups?.map(toMatrixMatchup) ?? []), [data]);

  const scrollToTeam = (index) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" px="0.75rem" py="0.6rem" gap="0.5rem" flexWrap="wrap">
        <Box>
          <Text fontSize="0.55rem" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Conference Slate
          </Text>
          <Text fontSize="1.1rem" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            {season} Matrix
          </Text>
        </Box>
        <Flex gap="0.35rem">
          {["MEAC", "SWAC"].map((item) => (
            <Box
              key={item}
              as="button"
              type="button"
              px="0.6rem"
              py="0.3rem"
              borderRadius="0"
              bg={conference === item ? "brand.500" : "whiteAlpha.100"}
              onClick={() => {
                setConference(item);
                if (item === "SWAC" && swacScope === "ALL") setSwacScope("WEST");
              }}
            >
              <Text fontSize="0.6rem" color="white" fontWeight="black">{item}</Text>
            </Box>
          ))}
        </Flex>
      </Flex>

      {conference === "SWAC" && (
        <Flex gap="0.3rem" px="0.75rem" pb="0.5rem">
          {["ALL", "WEST", "EAST"].map((item) => (
            <Box
              key={item}
              as="button"
              type="button"
              px="0.55rem"
              py="0.25rem"
              borderRadius="0"
              border="1px solid"
              borderColor="whiteAlpha.200"
              bg={swacScope === item ? "whiteAlpha.300" : "transparent"}
              onClick={() => setSwacScope(item)}
            >
              <Text fontSize="0.6rem" color={swacScope === item ? "white" : "text.muted"} fontWeight="black">{item}</Text>
            </Box>
          ))}
        </Flex>
      )}

      {/* Both strips below are driven off the payload's axes, so until it lands there is
          nothing to draw — the conference toggles above stay live either way. */}
      {isPending ? (
        <Flex minH="14rem" align="center" justify="center">
          <Spinner color="brand.500" size="lg" />
        </Flex>
      ) : (
        <>
          <Flex gap="0.4rem" px="0.75rem" py="0.5rem" overflowX="auto" borderBottom="1px solid" borderColor="whiteAlpha.100">
            {teamIds.map((id, index) => (
              <Box
                key={id}
                as="button"
                type="button"
                flexShrink={0}
                onClick={() => scrollToTeam(index)}
                p="0.3rem"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <Image src={logo(TEAM_BY_ID[id])} alt="" w="1.6rem" h="1.6rem" objectFit="contain" />
              </Box>
            ))}
          </Flex>

          <Flex ref={scrollRef} overflowX="auto" style={{ scrollSnapType: "x mandatory" }}>
            {teamIds.map((id) => (
              <TeamSlateCard key={id} teamId={id} teamIds={teamIds} lookup={lookup} />
            ))}
          </Flex>
        </>
      )}
    </Box>
  );
};
