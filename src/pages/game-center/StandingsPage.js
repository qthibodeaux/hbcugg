import { useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../../components/layouts/PageShell";
import { BannerStandings } from "../../components/organisms/test/BannerPages";
import teamsData from "../../data/teams.json";
import { gameCenterPaths, fetchJson } from "../../utils/gameCenterPayloads";
import { GAME_CENTER_DEFAULT_SEASON } from "../../components/molecules/game/SeasonSelector";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { useFootballCurrentContext } from "../../hooks/useFootballCurrentContext";
import { ExportCardButton } from "../../components/organisms/stats/ExportCardButton";

const DEFAULT_SEASON = GAME_CENTER_DEFAULT_SEASON;

const ACCENT = {
  "swac-east": "#F4811F",
  "swac-west": "#FDB913",
  meac: "#0077C8",
};

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = team;
  acc[team.exportId] = team;
  return acc;
}, {});

const GROUP_DEFS = [
  { id: "swac-east", label: "SWAC East", conference: "SWAC", division: "East" },
  { id: "swac-west", label: "SWAC West", conference: "SWAC", division: "West" },
  { id: "meac", label: "MEAC", conference: "MEAC", division: null },
];

const SWAC_EAST = new Set(["swacaamu", "swacasu", "swacbcu", "swacfamu", "swacjsu", "swacmvsu"]);
const SWAC_WEST = new Set(["swacalc", "swacgsu", "swacpvamu", "swacsu", "swactsu", "swacuapb"]);

const logo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;
const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

const TeamLogo = ({ team, size = "1.625rem" }) => (
  <Image src={logo(team)} alt={teamLabel(team)} w={size} h={size} objectFit="contain" />
);

const recordText = (wins, losses) => `${wins}-${losses}`;

const getGroupId = (team) => {
  if (!team) return null;
  const id = team.exportId.replace(/25$/, "");
  if (team.conference === "MEAC") return "meac";
  if (SWAC_EAST.has(id)) return "swac-east";
  if (SWAC_WEST.has(id)) return "swac-west";
  return null;
};

const gameKey = (game) => {
  const ids = [game.team_id, game.opponent_id].filter(Boolean).sort().join("-");
  return game.parsed_game_id ?? game.parsed_game_stem ?? `${game.date}-${ids}`;
};

const buildBaseRows = (games) => {
  const map = new Map();

  teamsData.teams.forEach((team) => {
    const id = team.exportId.replace(/25$/, "");
    map.set(id, {
      id,
      w: 0,
      l: 0,
      cw: 0,
      cl: 0,
      pf: 0,
      pa: 0,
      hw: 0,
      hl: 0,
      form: [],
      confOpp: [],
    });
  });

  [...games]
    .filter((game) => game.result)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)) || Number(a.game_index ?? 0) - Number(b.game_index ?? 0))
    .forEach((game) => {
      const row = map.get(game.team_id);
      if (!row) return;

      const won = game.result === "W";
      if (won) row.w += 1;
      else row.l += 1;

      if (game.conf_game) {
        if (won) row.cw += 1;
        else row.cl += 1;
        if (game.opponent_id) row.confOpp.push({ opponentId: game.opponent_id, result: game.result, diff: Number(game.score_team ?? 0) - Number(game.score_opp ?? 0) });
      }

      if (game.home_away === "home") {
        if (won) row.hw += 1;
        else row.hl += 1;
      }

      row.pf += Number(game.score_team ?? 0);
      row.pa += Number(game.score_opp ?? 0);
      row.form.push(won ? "W" : "L");
    });

  return [...map.values()].map((row) => {
    const gp = row.w + row.l;
    const cgp = row.cw + row.cl;
    const last = row.form[row.form.length - 1];
    let streakCount = 0;
    for (let i = row.form.length - 1; i >= 0; i -= 1) {
      if (row.form[i] !== last) break;
      streakCount += 1;
    }

    return {
      ...row,
      gp,
      cgp,
      pct: gp ? row.w / gp : 0,
      cpct: cgp ? row.cw / cgp : 0,
      diff: row.pf - row.pa,
      last5: row.form.slice(-5).join("").padStart(5, "-"),
      streak: last ? `${last}${streakCount}` : "-",
    };
  });
};

const headToHeadCompare = (a, b) => {
  const aGames = a.confOpp.filter((game) => game.opponentId === b.id);
  const bGames = b.confOpp.filter((game) => game.opponentId === a.id);
  const aWins = aGames.filter((game) => game.result === "W").length + bGames.filter((game) => game.result === "L").length;
  const bWins = aGames.filter((game) => game.result === "L").length + bGames.filter((game) => game.result === "W").length;

  if (aWins !== bWins) return bWins - aWins;

  const aDiff = aGames.reduce((sum, game) => sum + game.diff, 0) - bGames.reduce((sum, game) => sum + game.diff, 0);
  if (aDiff !== 0) return bDiffSort(aDiff);

  return 0;
};

const bDiffSort = (aDiff) => (aDiff > 0 ? -1 : 1);

const standingsCompare = (a, b) =>
  b.cpct - a.cpct ||
  headToHeadCompare(a, b) ||
  b.pct - a.pct ||
  b.diff - a.diff ||
  TEAM_BY_ID[a.id]?.name?.localeCompare(TEAM_BY_ID[b.id]?.name ?? "") ||
  0;

const groupRows = (rows, games) => {
  const groups = GROUP_DEFS.reduce((acc, def) => {
    acc[def.id] = { ...def, accent: ACCENT[def.id], rows: [], completedGames: 0, remainingGames: 0, scenarioCount: 1 };
    return acc;
  }, {});

  rows.forEach((row) => {
    const groupId = getGroupId(TEAM_BY_ID[row.id]);
    if (groupId) groups[groupId].rows.push(row);
  });

  Object.values(groups).forEach((group) => {
    group.rows.sort(standingsCompare);
  });

  const seenCompleted = new Set();
  const seenRemaining = new Set();
  games.forEach((game) => {
    if (!game.conf_game || !game.opponent_id) return;
    const team = TEAM_BY_ID[game.team_id];
    const groupId = getGroupId(team);
    const group = groups[groupId];
    if (!group) return;

    const key = gameKey(game);
    if (game.result) {
      if (!seenCompleted.has(`${groupId}-${key}`)) {
        group.completedGames += 1;
        seenCompleted.add(`${groupId}-${key}`);
      }
    } else if (!seenRemaining.has(`${groupId}-${key}`)) {
      group.remainingGames += 1;
      seenRemaining.add(`${groupId}-${key}`);
    }
  });

  Object.values(groups).forEach((group) => {
    group.scenarioCount = Math.max(1, 2 ** Math.min(group.remainingGames, 12));
    group.finishMatrix = buildCompletedFinishMatrix(group.rows);
  });

  return groups;
};

const buildCompletedFinishMatrix = (rows) =>
  rows.map((row, rowIndex) => ({
    teamId: row.id,
    values: rows.map((_, colIndex) => (colIndex === rowIndex ? 100 : 0)),
    counts: rows.map((_, colIndex) => (colIndex === rowIndex ? 1 : 0)),
  }));

// `form` is a 5-char W/L string (e.g. "WWLWL"), left-padded with "-" for
// teams with fewer than 5 games played — both data paths already produce
// this (modelFromStandingsRace reads the export's real `last5` field,
// buildBaseRows derives it from `games` locally), it just wasn't wired
// through to the boxes yet.
const FORM_BOX_COLOR = { W: "#22C55E", L: "#B91C1C", "-": "#27272A" };

const FormBoxes = ({ form = "-----" }) => (
  <Flex gap="0.25rem" justify="end">
    {form.split("").map((result, index) => (
      <Box key={index} w="1.25rem" h="2.25rem" borderRadius="0.25rem" bg={FORM_BOX_COLOR[result] ?? FORM_BOX_COLOR["-"]} />
    ))}
  </Flex>
);

const heatColor = (value) => {
  if (value >= 40) return "linear-gradient(135deg, #0F8F55 0%, #32C77A 100%)";
  if (value >= 25) return "linear-gradient(135deg, #2FA96B 0%, #8AD7AF 100%)";
  if (value >= 12) return "linear-gradient(135deg, #DCEFE5 0%, #94CFAF 100%)";
  if (value > 0) return "linear-gradient(135deg, #DFA19A 0%, #B8473F 100%)";
  return "linear-gradient(135deg, #7B211F 0%, #C6554B 100%)";
};

// Each row's background IS the team's logo — enlarged past its own frame
// (scale > 1 inside an overflow:hidden box) rather than a small contained
// icon, same treatment as the school directory's "logoBig" bleed. Team name
// sits directly on top of the art, not beside it in a separate column.
const DivisionStandingsRow = ({ row, index, accent }) => {
  const team = TEAM_BY_ID[row.id];
  const isLeader = index === 0;

  return (
    <Box position="relative" overflow="hidden" borderRadius="0.75rem" flex={1} minH={0} bg="#0B0B0D">
      <Box position="absolute" inset={0} overflow="hidden">
        <Image
          src={logo(team)}
          alt=""
          w="100%"
          h="100%"
          objectFit="contain"
          style={{ transform: "scale(1.65)" }}
        />
      </Box>
      <Box position="absolute" inset={0} bg="linear-gradient(100deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0.15) 100%)" />

      <Flex position="relative" zIndex={1} h="100%" align="center" justify="space-between" px="1rem" py="0.25rem" gap="0.75rem">
        <Box minW={0}>
          <Flex align="baseline" gap="0.6rem">
            <Text fontSize="1.25rem" fontWeight="black" fontStyle="italic" color={isLeader ? accent : "whiteAlpha.500"} flexShrink={0} lineHeight={1}>
              {index + 1}
            </Text>
            <Text
              fontSize="clamp(1rem, 2vw, 1.6rem)"
              fontWeight="black"
              fontStyle="italic"
              color="white"
              textTransform="uppercase"
              letterSpacing="-0.01em"
              lineHeight={1}
              lineClamp={1}
              minW={0}
            >
              {team?.name ?? teamLabel(team)}
            </Text>
          </Flex>
          <Text fontSize="0.65rem" color="whiteAlpha.750" fontWeight="black" textTransform="uppercase" letterSpacing="0.06em" mt="0.2rem" ml="1.9rem">
            {recordText(row.w, row.l)} Overall · {row.diff > 0 ? "+" : ""}{row.diff} Diff
          </Text>
        </Box>

        <Flex align="center" gap="1rem" flexShrink={0}>
          <Box textAlign="center">
            <Text fontSize="clamp(1.1rem, 2vw, 1.75rem)" fontWeight="black" color="white" lineHeight={1}>
              {recordText(row.cw, row.cl)}
            </Text>
            <Text fontSize="0.55rem" color="whiteAlpha.700" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
              Conf
            </Text>
          </Box>
          <FormBoxes form={row.last5} />
        </Flex>
      </Flex>
    </Box>
  );
};

const exportName = (kind, group) => `${kind}-${String(group.label ?? group.id).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;

const DivisionStandingsCard = ({ group }) => {
  const cardRef = useRef(null);
  if (!group?.rows?.length) return null;
  const leader = group.rows[0];
  const leaderTeam = TEAM_BY_ID[leader.id];

  return (
    <Box ref={cardRef} h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" position="relative">
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${leaderTeam.colors.primary}33 0%, transparent 54%)`} />
      <Flex position="relative" direction="column" h="100%" p="1rem" gap="0.5rem">
        <Flex align="center" justify="space-between" flexShrink={0}>
          <Box>
            <Text fontSize="0.625rem" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Division Table
            </Text>
            <Text fontSize="1.25rem" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
              {group.label}
            </Text>
          </Box>
          <Flex align="center" gap="0.5rem">
            <ExportCardButton compact target={cardRef} filename={exportName("division-table", group)} />
            <TeamLogo team={leaderTeam} size="2.125rem" />
            <Box textAlign="right">
              <Text fontSize="0.7rem" color="text.muted" fontWeight="black" textTransform="uppercase">
                Leader
              </Text>
              <Text fontSize="1.25rem" color="white" fontWeight="black" lineHeight={1}>
                {teamLabel(leaderTeam)}
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Flex direction="column" flex={1} minH={0} gap="0.4rem">
          {group.rows.map((row, index) => (
            <DivisionStandingsRow key={row.id} row={row} index={index} accent={group.accent} />
          ))}
        </Flex>
      </Flex>
    </Box>
  );
};

// --- Context rotation -------------------------------------------------------
//
// Slot 1 of the KPI row cycles through several race facts rather than holding
// one. Backend supplies 3-4 of them (see Standings Design Doc section 5); the
// card just plays them.
//
// The crossfade is pure CSS. Every item is stacked and runs the SAME keyframe,
// separated only by a negative animation-delay, so there is no timer, no state,
// and no effect - AgentDesignBible bars useEffect, and a setInterval carousel
// is exactly the thing it bars.
//
// Delay math: an item is visible while its own animation time sits in
// [0, HOLD). A delay of -X shifts animation time to (t + X), so item i needs
// X = ((N - i) % N) * HOLD to come up at wall time i * HOLD.
const ROTATION_HOLD_SECONDS = 6;

const ContextRotationCard = ({ items = [], accent = "brand.400" }) => {
  const count = items.length;
  const cycle = Math.max(1, count) * ROTATION_HOLD_SECONDS;
  const visible = count > 0 ? 100 / count : 100;
  const delayFor = (index) => `-${((count - index) % count) * ROTATION_HOLD_SECONDS}s`;

  if (count === 0) {
    return (
      <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4} overflow="hidden">
        <Text fontSize="10px" color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Race Context
        </Text>
        <Flex h="calc(100% - 20px)" align="center">
          <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
            No games played yet
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      className="ctx-rotation"
      position="relative"
      h="100%"
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      <style>{`
        @keyframes ctxRotateItem {
          0% { opacity: 0; }
          3% { opacity: 1; }
          ${Math.max(4, visible - 3)}% { opacity: 1; }
          ${visible}% { opacity: 0; }
          100% { opacity: 0; }
        }
        .ctx-rotation .ctx-item,
        .ctx-rotation .ctx-dot {
          animation: ctxRotateItem ${cycle}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ctx-rotation .ctx-item,
          .ctx-rotation .ctx-dot { animation: none; opacity: 0; }
          .ctx-rotation .ctx-item:first-of-type,
          .ctx-rotation .ctx-dot:first-of-type { opacity: 1; }
        }
      `}</style>

      {items.map((item, index) => (
        <Flex
          key={item.label}
          className="ctx-item"
          position="absolute"
          inset={0}
          px={4}
          pt={4}
          pb={7}
          direction="column"
          justify="center"
          gap={1}
          style={{ animationDelay: delayFor(index) }}
        >
          <Text fontSize="10px" color={item.accent || accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
            {item.label}
          </Text>
          <Text
            fontSize="clamp(2rem, 3.4vw, 3rem)"
            fontFamily="mono"
            color="white"
            fontWeight="950"
            lineHeight={0.9}
            letterSpacing="-0.04em"
            lineClamp={1}
          >
            {item.value}
          </Text>
          <Text fontSize="xs" color="text.secondary" fontWeight="bold" lineClamp={2}>
            {item.sub}
          </Text>
        </Flex>
      ))}

      <Flex position="absolute" bottom={3} left={4} gap="6px">
        {items.map((item, index) => (
          <Box key={`track-${item.label}`} position="relative" w="16px" h="2px" borderRadius="full" bg="whiteAlpha.200">
            <Box
              className="ctx-dot"
              position="absolute"
              inset={0}
              borderRadius="full"
              bg={accent}
              style={{ animationDelay: delayFor(index) }}
            />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

// --- Division leader --------------------------------------------------------
// Was a bare team abbreviation over the words "Current leader" - which the
// standings table directly below already says, in more detail. Now it leads
// with the number that makes someone the leader.
const DivisionLeaderCard = ({ group }) => {
  const leader = group?.rows?.[0];
  const team = leader ? TEAM_BY_ID[leader.id] : null;
  const accent = group?.accent ?? "brand.400";
  const primary = team?.colors?.primary ?? "#1A1A1D";

  return (
    <Box
      position="relative"
      h="100%"
      w="full"
      bg={team ? `linear-gradient(145deg, ${primary}59 0%, rgba(255,255,255,0.02) 68%)` : "bg.secondary"}
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      overflow="hidden"
    >
      {team && (
        <Image
          src={logo(team)}
          alt=""
          position="absolute"
          right="-26px"
          bottom="-26px"
          w="118px"
          h="118px"
          objectFit="contain"
          opacity={0.14}
          pointerEvents="none"
          style={{ filter: "grayscale(1) contrast(1.15)" }}
        />
      )}

      <Flex position="relative" zIndex={1} h="100%" direction="column" justify="center" gap={1}>
        <Text fontSize="10px" color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
          {group?.label ?? "Division"}
        </Text>

        {team ? (
          <>
            <Text
              fontSize="clamp(2rem, 3.4vw, 3rem)"
              fontFamily="mono"
              color="white"
              fontWeight="950"
              lineHeight={0.9}
              letterSpacing="-0.04em"
            >
              {recordText(leader.cw, leader.cl)}
            </Text>
            <Flex align="center" gap={1.5} mt={0.5}>
              <TeamLogo team={team} size="1.1rem" />
              <Text fontSize="xs" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {teamLabel(team)}
              </Text>
            </Flex>
            <Text fontSize="10px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>
              {recordText(leader.w, leader.l)} overall
            </Text>
          </>
        ) : (
          <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
            No games played yet
          </Text>
        )}
      </Flex>
    </Box>
  );
};

// ─── Power Rankings metric ───────────────────────────────────────────────────
//
// The card's identity is permanent; the number behind it is not. Combined EPA
// is the target ranking - see Standings Design Doc section 4. Until the backend
// ships it, the board ranks by point differential: real, directly computed
// (pf - pa), and labeled as itself.
//
// This replaced a composite the frontend invented outright -
//   glory = cpct * 55 + pct * 25 + clamp(diff / 10, -10, 20)
// - whose weights had no source and which rendered under a "Glory Rankings"
// heading as though it were a league metric. Swapping to EPA is a change to
// this one object and nothing else.
const POWER_METRIC = {
  key: "diff",
  label: "By Point Diff",
  format: (value) => `${value > 0 ? "+" : ""}${Math.round(value)}`,
};

const PowerRankingsCard = ({ rows }) => (
  <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" p={4}>
    <Flex align="end" justify="space-between" mb={4}>
      <Box>
        <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Top 6
        </Text>
        <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          Power Rankings
        </Text>
      </Box>
      <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
        {POWER_METRIC.label}
      </Text>
    </Flex>

    {rows.length === 0 ? (
      <Flex h="calc(100% - 50px)" align="center" justify="center" px={4}>
        <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" textAlign="center">
          No games played yet
        </Text>
      </Flex>
    ) : (
    <Flex direction="column" h="calc(100% - 50px)" justify="space-evenly">
      {rows.slice(0, 6).map((row, index) => {
        const team = TEAM_BY_ID[row.id];
        return (
          <Grid key={row.id} templateColumns="28px 32px 1fr 56px" gap={2} alignItems="center">
            <Text fontSize="xs" color={index === 0 ? "brand.400" : "text.muted"} fontWeight="black">
              {index + 1}
            </Text>
            <TeamLogo team={team} size="1.625rem" />
            <Box minW={0}>
              <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                {teamLabel(team)}
              </Text>
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {recordText(row.cw, row.cl)} conf
              </Text>
            </Box>
            <Text fontSize="lg" color="white" fontWeight="black" textAlign="right">
              {POWER_METRIC.format(row[POWER_METRIC.key] ?? 0)}
            </Text>
          </Grid>
        );
      })}
    </Flex>
    )}
  </Box>
);

const MatrixControl = ({ active, disabled = false, children, onClick }) => (
  <Box as="button" px={3} py={1.5} borderRadius="full" bg={active ? "brand.500" : "whiteAlpha.100"} opacity={disabled ? 0.35 : 1} cursor={disabled ? "default" : "pointer"} onClick={disabled ? undefined : onClick}>
    <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase">
      {children}
    </Text>
  </Box>
);

const DivisionFinishMatrix = ({ group }) => {
  const cardRef = useRef(null);
  return (
  <Box ref={cardRef} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
    <style>{`
      @media (min-width: 641px) and (max-width: 900px) {
        .finish-matrix-team-name { display: none !important; }
        .finish-matrix-grid {
          grid-template-columns: 58px repeat(6, minmax(58px, 1fr)) !important;
          min-width: 430px !important;
        }
      }
    `}</style>
    <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Box>
        <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Finish Matrix
        </Text>
        <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          {group.label}
        </Text>
      </Box>
      <ExportCardButton target={cardRef} filename={exportName("finish-matrix", group)} />
    </Flex>
    <Flex px={5} py={3} gap={5} bg="blackAlpha.300" borderBottom="1px solid" borderColor="whiteAlpha.100" wrap="wrap">
      <Text fontSize="sm" color="text.secondary"><Text as="span" color="white" fontWeight="black">Teams:</Text> {group.rows.length}</Text>
      <Text fontSize="sm" color="text.secondary"><Text as="span" color="white" fontWeight="black">Completed Games:</Text> {group.completedGames}</Text>
      <Text fontSize="sm" color="text.secondary"><Text as="span" color="white" fontWeight="black">Remaining Games:</Text> {group.remainingGames}</Text>
    </Flex>

    <Box overflowX="auto">
      <Grid className="finish-matrix-grid" templateColumns={`190px repeat(${group.rows.length}, minmax(78px, 1fr))`} minW={`${190 + group.rows.length * 78}px`}>
        <Box px={4} py={3} bg="blackAlpha.300" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Team</Text>
        </Box>
        {group.rows.map((_, index) => (
          <Box key={index} px={3} py={3} bg="blackAlpha.300" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="9px" color={index === 0 ? group.accent : "text.muted"} fontWeight="black" textAlign="center" textTransform="uppercase">
              Finish {index + 1}
            </Text>
          </Box>
        ))}

        {group.finishMatrix.map((matrixRow) => {
          const row = group.rows.find((item) => item.id === matrixRow.teamId);
          const team = TEAM_BY_ID[matrixRow.teamId];
          return (
            <Box key={matrixRow.teamId} display="contents">
              <Flex align="center" gap={2} minW={0} px={4} py={3} bg="blackAlpha.200" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <TeamLogo team={team} size="1.5rem" />
                <Box className="finish-matrix-team-name" minW={0}>
                  <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                    {teamLabel(team)}
                  </Text>
                  <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
                    {recordText(row?.cw ?? 0, row?.cl ?? 0)} - {row?.last5 ?? "-----"}
                  </Text>
                </Box>
              </Flex>
              {matrixRow.values.map((value, index) => (
                <Flex key={`${matrixRow.teamId}-${index}`} align="center" justify="center" minH="54px" bg={heatColor(value)} borderBottom="1px solid" borderLeft="1px solid" borderColor="rgba(255,255,255,0.08)">
                  <Text fontSize="sm" color={value >= 12 ? "#06110B" : "white"} fontWeight="black">
                    {value > 0 ? `${value}%` : "-"}
                  </Text>
                </Flex>
              ))}
            </Box>
          );
        })}
      </Grid>
    </Box>
  </Box>
);
};

const DivisionFinishProbability = ({ groups }) => {
  const [conference, setConference] = useState("ALL");
  const [swacScope, setSwacScope] = useState("ALL");

  const visibleGroups = GROUP_DEFS.map((def) => groups[def.id]).filter((group) => {
    if (!group) return false;
    if (conference === "ALL") return true;
    if (conference === "MEAC") return group.id === "meac";
    if (swacScope === "ALL") return group.id === "swac-east" || group.id === "swac-west";
    return group.id === `swac-${swacScope.toLowerCase()}`;
  });

  return (
    <Flex direction="column" gap={4}>
      <Flex align="end" justify="space-between" gap={4} wrap="wrap">
        <Box>
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" mb={1}>
            Scenario Sheet
          </Text>
          <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            Division Finish Probability
          </Text>
        </Box>
        <Flex gap={2} align="center" wrap="wrap" justify="end">
          {["ALL", "MEAC", "SWAC"].map((item) => (
            <MatrixControl key={item} active={conference === item} onClick={() => { setConference(item); if (item !== "SWAC") setSwacScope("ALL"); }}>
              {item}
            </MatrixControl>
          ))}
          <Flex gap={1} pl={2} borderLeft="1px solid" borderColor="whiteAlpha.200">
            {["ALL", "WEST", "EAST"].map((item) => (
              <MatrixControl key={item} active={conference === "SWAC" && swacScope === item} disabled={conference !== "SWAC"} onClick={() => setSwacScope(item)}>
                {item}
              </MatrixControl>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Grid templateColumns="1fr" gap={4}>
        {visibleGroups.map((group) => (
          <DivisionFinishMatrix key={group.id} group={group} />
        ))}
      </Grid>
    </Flex>
  );
};

// --- Context rotation items -------------------------------------------------
//
// Backend should ship these as `context_cards[]` - see Standings Design Doc
// section 5. Derived here in the meantime, from fields the live export
// actually carries. Anything that cannot be computed honestly is dropped
// rather than filled with a placeholder, so the rotation only ever plays real
// facts and simply gets shorter when there is less to say.
//
// Deliberately NOT included: a "hottest team" streak card. `streak` and
// `last5` fall through to "-" in the live path because the export has neither
// - see modelFromStandingsRace. It goes in the moment the backend ships them.
//
// This replaced a set that restated the standings tables directly below it,
// plus a "Live Paths" figure computed as 2 ** remainingGames - a fabricated
// combinatorial number presented as a scenario count.
const buildContextItems = (groups) => {
  const orderedGroups = GROUP_DEFS.map((def) => groups[def.id]).filter(Boolean);
  const played = orderedGroups.reduce((sum, group) => sum + (group.completedGames ?? 0), 0);
  const remaining = orderedGroups.reduce((sum, group) => sum + (group.remainingGames ?? 0), 0);
  const allRows = orderedGroups.flatMap((group) => group.rows ?? []);
  const items = [];

  // Closest race - the gap between first and second in whichever division is
  // tightest. Needs at least two teams with a game played to mean anything.
  const contested = orderedGroups.filter((group) => (group.rows?.length ?? 0) > 1 && (group.completedGames ?? 0) > 0);
  if (contested.length > 0) {
    const closest = [...contested].sort((a, b) => {
      const aGap = (a.rows[0]?.cw ?? 0) - (a.rows[1]?.cw ?? 0);
      const bGap = (b.rows[0]?.cw ?? 0) - (b.rows[1]?.cw ?? 0);
      return aGap - bGap;
    })[0];
    const gap = (closest.rows[0]?.cw ?? 0) - (closest.rows[1]?.cw ?? 0);
    items.push({
      label: "Closest Race",
      value: gap === 0 ? "TIED" : String(gap),
      sub: gap === 0 ? `${closest.label} is level at the top` : `${gap === 1 ? "game" : "games"} separate the top two in ${closest.label}`,
      accent: closest.accent,
    });
  }

  // Unbeaten in conference play - interesting early, self-retiring later.
  const unbeaten = allRows.filter((row) => (row.cl ?? 0) === 0 && (row.cw ?? 0) > 0);
  if (unbeaten.length > 0) {
    items.push({
      label: "Unbeaten",
      value: String(unbeaten.length),
      sub: unbeaten.length === 1
        ? `${teamLabel(TEAM_BY_ID[unbeaten[0].id])} is perfect in conference play`
        : "teams still perfect in conference play",
      accent: "#F4811F",
    });
  }

  if (played > 0) {
    items.push({
      label: "Conference Games",
      value: String(played),
      sub: "played across all three divisions",
      accent: "brand.400",
    });
  }

  if (remaining > 0) {
    items.push({
      label: "Still To Play",
      value: String(remaining),
      sub: "conference games left on the slate",
      accent: "#F56565",
    });
  }

  return items;
};

const rankByPowerMetric = (rows) =>
  rows
    // A board where every team sits at 0 is noise, not a ranking. Before any
    // game is played there is nothing to rank, and the card says so.
    .filter((row) => (row.w ?? 0) + (row.l ?? 0) > 0)
    .sort((a, b) => (b[POWER_METRIC.key] ?? 0) - (a[POWER_METRIC.key] ?? 0) || standingsCompare(a, b));

const getStandingsRows = (groupPayload) => {
  if (Array.isArray(groupPayload)) return groupPayload;
  if (Array.isArray(groupPayload?.standings)) return groupPayload.standings;
  if (Array.isArray(groupPayload?.rows)) return groupPayload.rows;
  return [];
};

const mapFinishMatrix = (groupPayload, sourceRows) => {
  const matrixRows = Array.isArray(groupPayload?.finish_matrix) ? groupPayload.finish_matrix : [];
  const usableMatrixRows = matrixRows.filter((row) => TEAM_BY_ID[row.team_id]);

  if (!usableMatrixRows.length) {
    return sourceRows.map((row, index) => ({
      teamId: row.team_id,
      values: sourceRows.map((_, slot) => (slot === index ? 100 : 0)),
      counts: sourceRows.map((_, slot) => (slot === index ? 1 : 0)),
    }));
  }

  // Rows read top-down by the chance to finish first; ties fall to the next slot.
  const byFinish = (a, b) => {
    for (let i = 0; i < Math.max(a.values.length, b.values.length); i += 1) {
      const d = Number(b.values[i] ?? 0) - Number(a.values[i] ?? 0);
      if (d !== 0) return d;
    }
    return 0;
  };

  return usableMatrixRows.map((row) => {
    const values = Array.isArray(row.values)
      ? row.values
      : sourceRows.map((_, slot) => (slot === Number(row.current_rank ?? 0) - 1 ? 100 : 0));
    const counts = Array.isArray(row.counts)
      ? row.counts
      : values.map((value) => (value > 0 ? 1 : 0));

    return {
      teamId: row.team_id,
      values,
      counts,
    };
  }).sort(byFinish);
};

const modelFromStandingsRace = (payload) => {
  const groups = GROUP_DEFS.reduce((acc, def) => {
    const groupPayload = payload?.groups?.[def.id.replace("-", "_")];
    const sourceRows = getStandingsRows(groupPayload).filter((row) => TEAM_BY_ID[row.team_id]);

    acc[def.id] = {
      ...def,
      accent: ACCENT[def.id],
      completedGames: Number(groupPayload?.completed_games ?? sourceRows.reduce((sum, row) => sum + Number(row.conf_wins ?? 0) + Number(row.conf_losses ?? 0), 0)),
      remainingGames: Number(groupPayload?.remaining_games ?? 0),
      scenarioCount: Number(groupPayload?.scenario_count ?? 1),
      finishMatrix: mapFinishMatrix(groupPayload, sourceRows),
      rows: sourceRows.map((row) => ({
        id: row.team_id,
        w: Number(row.wins ?? 0),
        l: Number(row.losses ?? 0),
        cw: Number(row.conf_wins ?? 0),
        cl: Number(row.conf_losses ?? 0),
        pct: Number(row.win_pct ?? 0),
        cpct: Number(row.conf_win_pct ?? 0),
        diff: Number(row.point_diff ?? row.points_for ?? 0) - Number(row.points_against ?? 0),
        // row.last5/recent_form/form: whichever field name the backend ships first.
        // None exist in the export today — this always falls through to dashes
        // until the backend adds one. See BACKEND_PIPELINE_TODO.md.
        last5: row.last5 ?? row.recent_form ?? row.form ?? "-----",
        // tiebreaker_status ("resolved_by_available_rules" etc.) is an internal
        // pipeline note, not a W/L streak — never show it as one.
        streak: row.streak ?? "-",
        rank: row.rank,
        record: row.record,
        conferenceRecord: row.conference_record,
        tiebreakerStatus: row.tiebreaker_status,
        confOpp: [],
        form: [],
      })),
    };
    return acc;
  }, {});
  const rows = Object.values(groups).flatMap((group) => group.rows);
  return {
    games: [],
    rows,
    groups,
    contextItems: buildContextItems(groups),
    powerRows: rankByPowerMetric(rows),
  };
};

const DivisionLeaderCardMobile = ({ def, group }) => {
  const leaderTeam = TEAM_BY_ID[group?.rows?.[0]?.id];
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" p="0.75rem" display="flex" flexDirection="column" alignItems="center" gap="0.5rem">
      <Text fontSize="0.6rem" fontWeight="black" color={ACCENT[def.id]} textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
        {def.label}
      </Text>
      <TeamLogo team={leaderTeam} size="3rem" />
    </Box>
  );
};

// Readable colloquial names for the roster's 18 teams, mobile-only — matches
// the curated `team.short_name` the standings_race export already carries
// (e.g. "SC State", "NC Central", "Grambling") rather than the plain 3-4
// letter acronym teams.json's shortName/bannerShort give everywhere else.
// Desktop keeps its existing labels untouched.
const MOBILE_TEAM_SHORT_NAME = {
  swacasu: "Bama State",
  swacjsu: "J-State",
  swacbcu: "B-CU",
  swacfamu: "Florida A&M",
  swacaamu: "Alabama A&M",
  swacmvsu: "Valley",
  swacpvamu: "Prairie View",
  swactsu: "Texas So.",
  swacgsu: "Grambling",
  swacalc: "Alcorn",
  swacuapb: "UAPB",
  swacsu: "Southern",
  meacscsu: "SC State",
  meacdsu: "Del State",
  meacnccu: "NC Central",
  meachu: "Howard",
  meacmsu: "Morgan",
  meacnsu: "Norfolk",
};

const mobileTeamLabel = (team) => MOBILE_TEAM_SHORT_NAME[team?.exportId?.replace(/25$/, "")] ?? teamLabel(team);

// Flat row — no per-row card, just a hairline divider. Logo ghosted large
// and left-aligned behind the name (same technique as WeekCentralGameRowMobile's
// TeamGhostRow) instead of the desktop row's full-bleed background image, so
// padding lives on the row content instead of a wrapping box on top of the
// section's own wrapping box. Each row also carries a faint wash of the
// team's own color behind the logo, and the leader row gets an accent-colored
// edge so it reads as #1 at a glance instead of just a colored rank digit.
const DivisionStandingsRowMobile = ({ row, index, accent }) => {
  const team = TEAM_BY_ID[row.id];
  const isLeader = index === 0;

  return (
    <Box
      position="relative"
      overflow="hidden"
      px="0.6rem"
      py="0.45rem"
      borderBottom="1px solid"
      borderColor="whiteAlpha.150"
      borderLeft={isLeader ? "0.1875rem solid" : "0.1875rem solid transparent"}
      borderLeftColor={isLeader ? accent : "transparent"}
      bg={`linear-gradient(90deg, ${team?.colors?.primary ?? "#27272A"}26 0%, transparent 65%)`}
    >
      {team?.logo && (
        <Image
          src={team.logo}
          alt=""
          position="absolute"
          left="-0.75rem"
          top="50%"
          transform="translateY(-50%)"
          w="4rem"
          h="4rem"
          objectFit="contain"
          opacity={0.26}
          pointerEvents="none"
        />
      )}
      <Flex position="relative" zIndex={1} align="center" justify="space-between" gap="0.5rem">
        <Flex align="baseline" gap="0.5rem" minW={0}>
          <Text fontSize="0.85rem" fontWeight="black" fontStyle="italic" color={isLeader ? accent : "whiteAlpha.500"} flexShrink={0} lineHeight={1}>
            {index + 1}
          </Text>
          <Box minW={0}>
            <Text fontSize="1rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1} lineClamp={1}>
              {mobileTeamLabel(team)}
            </Text>
            <Text fontSize="0.55rem" color="whiteAlpha.650" fontWeight="black" textTransform="uppercase" letterSpacing="0.04em" mt="0.15rem">
              {recordText(row.w, row.l)} · {row.diff > 0 ? "+" : ""}{row.diff}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap="0.5rem" flexShrink={0}>
          <Text fontSize="1rem" fontWeight="black" color="white" lineHeight={1}>
            {recordText(row.cw, row.cl)}
          </Text>
          <FormBoxes form={row.last5} />
        </Flex>
      </Flex>
    </Box>
  );
};

// No outer card — just a flush header line (division + leader) followed by
// the flat row list. The desktop DivisionStandingsCard's bordered/radius'd
// wrapper is skipped entirely here rather than reused, since that's the
// second layer of padding this was built to remove.
const DivisionTableMobile = ({ def, group }) => {
  if (!group?.rows?.length) return null;
  const leaderTeam = TEAM_BY_ID[group.rows[0].id];

  return (
    <Box>
      <Flex align="center" justify="space-between" px="0.6rem" py="0.5rem" borderBottom="1px solid" borderColor="whiteAlpha.150">
        <Box>
          <Text fontSize="0.55rem" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Division Table
          </Text>
          <Text fontSize="1.1rem" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            {group.label}
          </Text>
        </Box>
        <Flex align="center" gap="0.4rem">
          <TeamLogo team={leaderTeam} size="1.75rem" />
          <Box textAlign="right">
            <Text fontSize="0.55rem" color="text.muted" fontWeight="black" textTransform="uppercase">
              Leader
            </Text>
            <Text fontSize="1rem" color="white" fontWeight="black" lineHeight={1}>
              {mobileTeamLabel(leaderTeam)}
            </Text>
          </Box>
        </Flex>
      </Flex>

      {group.rows.map((row, index) => (
        <DivisionStandingsRowMobile key={row.id} row={row} index={index} accent={group.accent} />
      ))}
    </Box>
  );
};

// True 7x7 square grid for a 6-team division — corner cell + 6 finish-number
// columns across, header row + 6 team rows down. Left column drops the
// name/record text the desktop matrix carries and shows just the logo, so
// every cell (identifier column included) can be a uniform square.
const DivisionFinishMatrixMobile = ({ group }) => {
  if (!group?.rows?.length) return null;
  const teamCount = group.rows.length;

  return (
    <Box mt="0.75rem">
      <Grid templateColumns={`repeat(${teamCount + 1}, minmax(0, 1fr))`}>
        <Box aspectRatio="1" bg="blackAlpha.300" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100" />
        {group.rows.map((_, index) => (
          <Flex key={`finish-${index}`} aspectRatio="1" align="center" justify="center" bg="blackAlpha.300" borderLeft="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="0.7rem" color={index === 0 ? group.accent : "text.muted"} fontWeight="black">
              {index + 1}
            </Text>
          </Flex>
        ))}

        {group.finishMatrix.map((matrixRow) => {
          const team = TEAM_BY_ID[matrixRow.teamId];
          return (
            <Box key={matrixRow.teamId} display="contents">
              <Flex align="center" justify="center" aspectRatio="1" bg="blackAlpha.200" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <TeamLogo team={team} size="1.5rem" />
              </Flex>
              {matrixRow.values.map((value, index) => (
                <Flex key={`${matrixRow.teamId}-${index}`} aspectRatio="1" align="center" justify="center" bg={heatColor(value)} borderLeft="1px solid" borderBottom="1px solid" borderColor="rgba(255,255,255,0.08)">
                  <Text fontSize="0.65rem" color={value >= 12 ? "#06110B" : "white"} fontWeight="black">
                    {value > 0 ? `${value}%` : "-"}
                  </Text>
                </Flex>
              ))}
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

// Mobile — separate render tree, not PageShell (same architecture as every
// other converted Game Center page). Division control from the banner now
// actually filters here: "All" stacks every division's table+matrix, a
// specific division shows just that one. Power Rankings is still the same
// desktop card, stacked full-width and unstyled for mobile so far.
const StandingsMobile = ({ season, setSeason, division, setDivision, model, isLoading, isError }) => {
  const visibleGroupDefs = division === "all" ? GROUP_DEFS : GROUP_DEFS.filter((def) => def.id === division);

  return (
  <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
    <BannerStandings season={season} setSeason={setSeason} division={division} setDivision={setDivision} />

    <Flex direction="column" gap="0.75rem" p="0.75rem">
      {isLoading && <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>}
      {isError && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={8} textAlign="center">
          <Text color="text.muted">Unable to load standings data.</Text>
        </Box>
      )}

      {!isLoading && !isError && (<>
        <Box h="7.5rem">
          <ContextRotationCard items={model.contextItems} />
        </Box>

        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="0.75rem">
          {GROUP_DEFS.map((def) => (
            <DivisionLeaderCardMobile key={def.id} def={def} group={model.groups[def.id]} />
          ))}
        </Grid>

        {visibleGroupDefs.map((def) => (
          <Box key={def.id}>
            <DivisionTableMobile def={def} group={model.groups[def.id]} />
            <DivisionFinishMatrixMobile group={model.groups[def.id]} />
          </Box>
        ))}

        <Box h="24rem">
          <PowerRankingsCard rows={model.powerRows} />
        </Box>
      </>)}
    </Flex>
  </Box>
  );
};

const StandingsPage = () => {
  // Open on the live season, not a hardcoded year - same fix as Conference
  // Slate (2026-08-25). The selector sets an override; until it does, current
  // context decides which season's standings the page lands on.
  const { currentSeason, isLoading: isCurrentContextLoading } = useFootballCurrentContext();
  const [seasonOverride, setSeasonOverride] = useState(null);
  const season = seasonOverride ?? currentSeason ?? DEFAULT_SEASON;
  const setSeason = (value) => setSeasonOverride(Number(value));
  const [division, setDivision] = useState("all");
  const { isMobile } = useLayoutDensity();

  const { data, isLoading: isDataLoading, isError } = useQuery({
    queryKey: ["standings", season],
    queryFn: () => fetchJson(gameCenterPaths.standingsRace(season)),
    staleTime: Infinity,
  });
  const isLoading = isDataLoading || isCurrentContextLoading;

  const model = useMemo(() => {
    if (data?.groups) return modelFromStandingsRace(data);
    const games = data?.games ?? [];
    const rows = buildBaseRows(games);
    const groups = groupRows(rows, games);
    return {
      games,
      rows,
      groups,
      contextItems: buildContextItems(groups),
      powerRows: rankByPowerMetric(rows),
    };
  }, [data]);

  if (isMobile) {
    return (
      <StandingsMobile
        season={season}
        setSeason={setSeason}
        division={division}
        setDivision={setDivision}
        model={model}
        isLoading={isLoading}
        isError={isError}
      />
    );
  }

  const listContent = (
    <Box>
      {isLoading && <Flex justify="center" py={20}><Spinner color="brand.500" size="lg" /></Flex>}
      {isError && (
        <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={8} textAlign="center">
          <Text color="text.muted">Unable to load standings data.</Text>
        </Box>
      )}
      {!isLoading && !isError && <DivisionFinishProbability groups={model.groups} />}
    </Box>
  );

  return (
    <PageShell listContent={listContent}>
      <PageShell.Slot cols={4}>
        <BannerStandings season={season} setSeason={setSeason} division={division} setDivision={setDivision} />
      </PageShell.Slot>

      <PageShell.Slot cols={1}>
        <ContextRotationCard items={model.contextItems} />
      </PageShell.Slot>

      {GROUP_DEFS.map((def) => (
        <PageShell.Slot key={`leader-${def.id}`} cols={1}>
          <DivisionLeaderCard group={model.groups[def.id]} />
        </PageShell.Slot>
      ))}

      {GROUP_DEFS.map((def) => (
        <PageShell.Slot key={def.id} cols={2} rows={2}>
          {isLoading ? (
            <Flex h="100%" align="center" justify="center" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl">
              <Spinner color="brand.500" />
            </Flex>
          ) : (
            <DivisionStandingsCard group={model.groups[def.id]} />
          )}
        </PageShell.Slot>
      ))}

      <PageShell.Slot cols={2} rows={2}>
        <PowerRankingsCard rows={model.powerRows} />
      </PageShell.Slot>
    </PageShell>
  );
};

export default StandingsPage;
