import { useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  Grid,
  Image,
} from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

// ═══════════════════════════════════════════════════════════════
// TEAM META LOOKUP
// ═══════════════════════════════════════════════════════════════
const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  acc[team.id] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_BY_ID[id] ?? null;
const getTeamColor = (id) => getTeam(id)?.colors?.primary ?? "#27272A";
const getTeamSecondary = (id) => getTeam(id)?.colors?.secondary ?? "#A1A1AA";
const getTeamLogo = (id) => getTeam(id)?.logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;
const getTeamName = (id) => getTeam(id)?.shortName ?? String(id ?? "TEAM").toUpperCase();

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
const fmtPct = (n) => (n ? `${(n * 100).toFixed(1)}%` : "0%");
// eslint-disable-next-line no-unused-vars
const fmtNum = (n) => (n === Math.floor(n) ? String(n) : n?.toFixed(1) ?? "0");

function getInitials(name) {
  const parts = String(name ?? "").split(",");
  return (parts[1]?.trim()[0] || "") + (parts[0]?.trim()[0] || "");
}
function getFirstName(name) { return String(name ?? "").split(",")[1]?.trim() || ""; }
function getLastName(name) { return String(name ?? "").split(",")[0]?.trim() || ""; }
function getDisplayName(name) { return `${getFirstName(name)} ${getLastName(name)}`; }

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}
function getCellColor(comp, att, primaryColor) {
  if (att === 0) return "transparent";
  const rate = comp / att;
  const rgb = hexToRgb(primaryColor);
  const opacity = 0.15 + rate * 0.65;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}
function getCellTextColor(comp, att) {
  if (att === 0) return "#71717A";
  const rate = comp / att;
  return rate >= 0.5 ? "#FFFFFF" : "#F4F4F5";
}

// ═══════════════════════════════════════════════════════════════
// DATA TRANSFORMERS — derive from real game JSON
// ═══════════════════════════════════════════════════════════════

/**
 * Derive passer/receiver directional grids from play_by_play.
 * Returns: { [playerName]: { deep: { left: {comp,att,yards}, ... }, medium: {...}, short: {...} } }
 */
const derivePassingGrids = (playByPlay) => {
  const grids = {}; // team -> player -> depth -> direction

  (playByPlay ?? []).forEach((play) => {
    if (play.play_type !== "PASS") return;
    const action = play.actions?.[0];
    if (!action || action.type !== "PASS") return;

    const team = play.offense_team;
    const passer = action.passer;
    const receiver = action.receiver;
    const depth = action.passDepth; // short, medium, deep
    const isComplete = action.isComplete;
    const yards = action.net_yards || 0;

    // Parse direction from raw_text: "pass complete short left to..."
    const dirMatch = play.raw_text?.match(/(short|deep|medium)\s+(left|middle|right)/i);
    const direction = dirMatch ? dirMatch[2].toLowerCase() : "middle";

    if (!grids[team]) grids[team] = {};

    // Passer grid
    if (passer) {
      if (!grids[team][passer]) grids[team][passer] = {};
      if (!grids[team][passer][depth]) grids[team][passer][depth] = {};
      if (!grids[team][passer][depth][direction]) grids[team][passer][depth][direction] = { comp: 0, att: 0, yards: 0 };
      grids[team][passer][depth][direction].att += 1;
      if (isComplete) grids[team][passer][depth][direction].comp += 1;
      grids[team][passer][depth][direction].yards += yards;
    }

    // Receiver grid
    if (receiver) {
      if (!grids[team][receiver]) grids[team][receiver] = {};
      if (!grids[team][receiver][depth]) grids[team][receiver][depth] = {};
      if (!grids[team][receiver][depth][direction]) grids[team][receiver][depth][direction] = { comp: 0, att: 0, yards: 0 };
      grids[team][receiver][depth][direction].att += 1;
      if (isComplete) grids[team][receiver][depth][direction].comp += 1;
      grids[team][receiver][depth][direction].yards += yards;
    }
  });

  return grids;
};

/**
 * Build passing data for a team from game.individual_stats
 */
const buildTeamPassingData = (game, teamId) => {
  const stats = game?.individual_stats?.[teamId];
  if (!stats) return null;

  const passing = stats.passing?.filter((p) => p.name !== "TEAM") ?? [];
  const receiving = stats.receiving ?? [];
  const grids = derivePassingGrids(game.play_by_play);
  const teamGrids = grids[teamId] ?? {};

  const passers = passing.map((p) => ({
    key: p.player_key,
    name: p.name,
    attempts: p.attempts ?? 0,
    completions: p.completions ?? 0,
    yards: p.yards ?? 0,
    touchdowns: p.touchdowns ?? 0,
    interceptions: p.interceptions ?? 0,
    sacks_taken: p.sacks_taken ?? 0,
    grid: teamGrids[p.name] ?? {},
  }));

  const receivers = receiving.map((r) => ({
    key: r.player_key,
    name: r.name,
    targets: r.targets ?? 0,
    receptions: r.receptions ?? 0,
    yards: r.yards ?? 0,
    touchdowns: r.touchdowns ?? 0,
    grid: teamGrids[r.name] ?? {},
  }));

  // Team totals from first "TEAM" row or sum
  const teamRow = stats.passing?.find((p) => p.name === "TEAM");
  const teamTotal = {
    attempts: teamRow?.attempts ?? passers.reduce((s, p) => s + p.attempts, 0),
    completions: teamRow?.completions ?? passers.reduce((s, p) => s + p.completions, 0),
    yards: teamRow?.yards ?? passers.reduce((s, p) => s + p.yards, 0),
    touchdowns: teamRow?.touchdowns ?? passers.reduce((s, p) => s + p.touchdowns, 0),
    interceptions: teamRow?.interceptions ?? passers.reduce((s, p) => s + p.interceptions, 0),
    sacks_taken: teamRow?.sacks_taken ?? passers.reduce((s, p) => s + p.sacks_taken, 0),
  };

  // Down splits — derive from play_by_play or use defaults
  const standardDowns = { comp: 0, att: 0, yards: 0, int: 0, success: 0 };
  const passingDowns = { comp: 0, att: 0, yards: 0, int: 0, success: 0 };

  (game.play_by_play ?? []).forEach((play) => {
    if (play.play_type !== "PASS" || play.offense_team !== teamId) return;
    const action = play.actions?.[0];
    if (!action) return;
    const isStd = play.down === 1 || (play.down === 2 && play.distance <= 8);
    const target = isStd ? standardDowns : passingDowns;
    target.att += 1;
    if (action.isComplete) target.comp += 1;
    target.yards += action.net_yards || 0;
  });

  return {
    meta: {
      name: getTeamName(teamId),
      shortName: getTeamName(teamId),
      logo: getTeamLogo(teamId),
      colors: { primary: getTeamColor(teamId), secondary: getTeamSecondary(teamId) },
    },
    passing: teamTotal,
    downSplit: { standard: standardDowns, passing: passingDowns },
    passers,
    receivers,
  };
};

// ═══════════════════════════════════════════════════════════════
// AVATAR LOOKUP — best-effort from player_seasons_2025.json
// ═══════════════════════════════════════════════════════════════
// eslint-disable-next-line no-unused-vars
const buildAvatarLookup = () => {
  // This will be populated async; for now return a sync helper that
  // components can call once data is loaded.
  return {};
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

const PassingStatsTable = ({ team, standard, passing }) => {
  const headers = [
    { key: "comp", label: "CMP" },
    { key: "att", label: "ATT" },
    { key: "yards", label: "YDS" },
    { key: "cmpPct", label: "CMP%" },
    { key: "int", label: "INT" },
    { key: "ypa", label: "YPA" },
  ];

  const teamCmpPct = team.attempts > 0 ? ((team.completions / team.attempts) * 100).toFixed(1) + "%" : "0%";
  const teamYpa = team.attempts > 0 ? (team.yards / team.attempts).toFixed(1) : "0.0";
  const stdCmpPct = standard.att > 0 ? ((standard.comp / standard.att) * 100).toFixed(1) + "%" : "0%";
  const stdYpa = standard.att > 0 ? (standard.yards / standard.att).toFixed(1) : "0.0";
  const passCmpPct = passing.att > 0 ? ((passing.comp / passing.att) * 100).toFixed(1) + "%" : "0%";
  const passYpa = passing.att > 0 ? (passing.yards / passing.att).toFixed(1) : "0.0";

  const rows = [
    { label: "Total", comp: team.completions, att: team.attempts, yards: team.yards, cmpPct: teamCmpPct, int: team.interceptions, ypa: teamYpa, isTotal: true },
    { label: "Standard", comp: standard.comp, att: standard.att, yards: standard.yards, cmpPct: stdCmpPct, int: standard.int, ypa: stdYpa, isTotal: false },
    { label: "Passing", comp: passing.comp, att: passing.att, yards: passing.yards, cmpPct: passCmpPct, int: passing.int, ypa: passYpa, isTotal: false },
  ];

  return (
    <VStack gap={0} align="stretch" w="full">
      <Grid templateColumns="60px repeat(6, 1fr)" gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.200">
        <Box />
        {headers.map((h) => (
          <Flex key={h.key} align="center" justify="center">
            <Text fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.muted" textTransform="uppercase" letterSpacing="0.05em">{h.label}</Text>
          </Flex>
        ))}
      </Grid>
      {rows.map((row, idx) => (
        <Grid key={row.label} templateColumns="60px repeat(6, 1fr)" gap={0} alignItems="center"
          py="2px"
          borderBottom={idx < rows.length - 1 ? "1px solid whiteAlpha.50" : "none"}
          bg={row.isTotal ? "whiteAlpha.80" : "transparent"}
        >
          <Box pl="6px">
            <Text fontSize={row.isTotal ? "clamp(9px, 0.8vw, 11px)" : "clamp(8px, 0.7vw, 10px)"}
              fontWeight={row.isTotal ? "800" : "600"}
              color={row.isTotal ? "text.primary" : "text.secondary"}
              textTransform={row.isTotal ? "uppercase" : "none"}
            >{row.label}</Text>
          </Box>
          {headers.map((h) => (
            <Flex key={h.key} align="center" justify="center">
              <Text fontSize={row.isTotal ? "clamp(10px, 0.9vw, 13px)" : "clamp(9px, 0.8vw, 11px)"}
                fontWeight={row.isTotal ? "800" : "600"}
                color={row.isTotal ? "#E53E3E" : "text.primary"}
              >{row[h.key]}</Text>
            </Flex>
          ))}
        </Grid>
      ))}
    </VStack>
  );
};

const PlayerTable = ({ players, activeKey, onSelect, type }) => {
  const isPasser = type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";
  const headers = isPasser
    ? ["CMP", "ATT", "YDS", "TD", "INT", "CMP%"]
    : ["REC", "TGT", "YDS", "TD", "YPC", "YPT"];

  return (
    <VStack gap={0} align="stretch" w="full">
      <Flex align="center" gap={1} px="4px" py="2px" borderBottom="1px solid whiteAlpha.100">
        <Box w="3px" h="10px" bg={accent} borderRadius="sm" />
        <Text fontSize="clamp(7px, 0.6vw, 9px)" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
          {isPasser ? "Passing" : "Receiving"}
        </Text>
      </Flex>
      <Grid templateColumns={`110px repeat(${headers.length}, 1fr)`} gap={0} alignItems="center" py="2px" borderBottom="1px solid whiteAlpha.50">
        <Box pl="4px">
          <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.muted" textTransform="uppercase">Player</Text>
        </Box>
        {headers.map((h) => (
          <Flex key={h} align="center" justify="center">
            <Text fontSize="clamp(8px, 0.7vw, 10px)" fontWeight="700" color="text.muted" textTransform="uppercase">{h}</Text>
          </Flex>
        ))}
      </Grid>
      {players.map((p) => {
        const isActive = p.key === activeKey;
        const cmpPct = isPasser && p.attempts > 0 ? ((p.completions / p.attempts) * 100).toFixed(1) + "%" : null;
        const ypc = !isPasser && p.receptions > 0 ? (p.yards / p.receptions).toFixed(1) : null;
        const ypt = !isPasser && p.targets > 0 ? (p.yards / p.targets).toFixed(1) : null;

        const cells = isPasser
          ? [p.completions, p.attempts, p.yards, p.touchdowns, p.interceptions, cmpPct]
          : [p.receptions, p.targets, p.yards, p.touchdowns, ypc, ypt];

        return (
          <Grid key={p.key}
            templateColumns={`110px repeat(${headers.length}, 1fr)`}
            gap={0} alignItems="center"
            py="2px" cursor="pointer"
            bg={isActive ? "whiteAlpha.80" : "transparent"}
            borderLeft={isActive ? `2px solid ${accent}` : "2px solid transparent"}
            _hover={{ bg: "whiteAlpha.60" }}
            onClick={() => onSelect({ ...p, _type: type })}
          >
            <Box pl="4px">
              <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={isActive ? "700" : "500"} color="text.primary" truncate>
                {getDisplayName(p.name)}
              </Text>
            </Box>
            {cells.map((v, i) => (
              <Flex key={i} align="center" justify="center">
                <Text fontSize="clamp(10px, 0.85vw, 12px)" fontWeight={isActive ? "700" : "500"} color={isActive ? accent : "text.primary"}>
                  {v ?? "0"}
                </Text>
              </Flex>
            ))}
          </Grid>
        );
      })}
    </VStack>
  );
};

const FieldMapGrid = ({ grid, teamColor }) => {
  const depths = [
    { key: "deep", label: "DEEP", range: ">12" },
    { key: "medium", label: "MED", range: "4-12" },
    { key: "short", label: "SHORT", range: "<4" },
  ];
  const directions = ["left", "middle", "right"];

  return (
    <VStack gap="4px" align="stretch" w="full" h="full" minH={0}>
      <Grid templateColumns="46px minmax(0, 1fr)" gap="8px" alignItems="stretch" flex={1} minH={0}>
        <Grid templateRows="repeat(3, 1fr)" gap="2px">
          {depths.map((d) => (
            <Flex key={d.key} direction="column" align="flex-end" justify="center" pr="2px">
              <Text fontSize="clamp(9px, 0.78vw, 11px)" fontWeight="900" color="text.secondary" textTransform="uppercase" lineHeight={1}>
                {d.label}
              </Text>
              <Text fontSize="clamp(7px, 0.62vw, 9px)" color="text.muted" fontWeight="800" lineHeight={1.1} mt="2px">
                {d.range}
              </Text>
            </Flex>
          ))}
        </Grid>
        <Box position="relative" w="full" h="full" minH={0}>
          <Box position="absolute" inset="0" borderRadius="md" overflow="hidden"
            bg="linear-gradient(180deg, #1a3d1a 0%, #0d260d 100%)"
            border="1px solid rgba(255,255,255,0.15)"
          >
            <Box position="absolute" left="0" right="0" top="33.3%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" left="0" right="0" top="66.6%" h="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="33.3%" w="1px" bg="rgba(255,255,255,0.12)" />
            <Box position="absolute" top="0" bottom="0" left="66.6%" w="1px" bg="rgba(255,255,255,0.12)" />
          </Box>
          <Grid position="absolute" inset="3px" templateColumns="repeat(3, minmax(0, 1fr))" templateRows="repeat(3, minmax(0, 1fr))" gap="2px">
            {depths.map((d) =>
              directions.map((dir) => {
                const cell = grid?.[d.key]?.[dir] ?? { comp: 0, att: 0, yards: 0 };
                const hasData = cell.att > 0;
                const bg = hasData ? getCellColor(cell.comp, cell.att, teamColor) : "rgba(0,0,0,0.35)";
                const textColor = hasData ? getCellTextColor(cell.comp, cell.att) : "text.muted";
                return (
                  <Flex key={`${d.key}-${dir}`} direction="column" align="center" justify="center"
                    bg={bg}
                    borderRadius="sm"
                    border={hasData ? `1px solid ${teamColor}66` : "1px solid rgba(255,255,255,0.06)"}
                    minW={0}
                    minH={0}
                  >
                    <Text fontSize="clamp(9px, 0.78vw, 12px)" fontWeight="800" color={textColor} lineHeight={1}>
                      {cell.comp}/{cell.att}
                    </Text>
                    <Text fontSize="clamp(6px, 0.55vw, 8px)" color={textColor} lineHeight={1} mt="1px" opacity={0.8}>
                      {cell.yards}y
                    </Text>
                  </Flex>
                );
              })
            )}
          </Grid>
        </Box>
      </Grid>
      <Grid templateColumns="46px minmax(0, 1fr)" gap="8px" flexShrink={0}>
        <Box />
        <Grid templateColumns="repeat(3, 1fr)">
          {["Left", "Middle", "Right"].map((d) => (
            <Text key={d} fontSize="clamp(7px, 0.62vw, 9px)" fontWeight="900" color="text.muted" textAlign="center" textTransform="uppercase">
              {d}
            </Text>
          ))}
        </Grid>
      </Grid>
    </VStack>
  );
};

const PlayerSpotlight = ({ player, type, teamColor, imageUrl }) => {
  const isPasser = type === "passer";
  const accent = isPasser ? "#E53E3E" : "#4A90D9";

  const cmpPct = isPasser && player.attempts > 0 ? ((player.completions / player.attempts) * 100).toFixed(1) + "%" : "0%";
  const ypc = !isPasser && player.receptions > 0 ? (player.yards / player.receptions).toFixed(1) : "0.0";
  const ypt = !isPasser && player.targets > 0 ? (player.yards / player.targets).toFixed(1) : "0.0";

  const statLine1 = isPasser
    ? `${player.completions} CMP · ${player.attempts} ATT · ${player.yards} YDS`
    : `${player.receptions} REC · ${player.targets} TGT · ${player.yards} YDS`;

  const statLine2 = isPasser
    ? `${player.touchdowns} TD · ${player.interceptions} INT · ${cmpPct} CMP%`
    : `${player.touchdowns} TD · ${ypc} YPC · ${ypt} YPT`;

  return (
    <VStack gap="8px" align="stretch" w="full" h="full">
      <Grid templateColumns="72px 1fr" border="1px solid rgba(255,255,255,0.13)" borderRadius="sm" overflow="hidden" bg="rgba(255,255,255,0.03)">
        <Flex minH="82px" align="center" justify="center" bg="rgba(255,255,255,0.035)" borderRight="1px solid rgba(255,255,255,0.12)">
          {imageUrl ? (
            <Image src={imageUrl} alt="" w="48px" h="48px" borderRadius="md" objectFit="cover" border="1px solid rgba(255,255,255,0.18)" />
          ) : (
            <Flex w="48px" h="48px" borderRadius="md" bg={teamColor} align="center" justify="center" border="1px solid rgba(255,255,255,0.18)">
              <Text fontSize="16px" fontWeight="900" color="white">{getInitials(player.name)}</Text>
            </Flex>
          )}
        </Flex>
        <Box minW={0} px={3} py="8px">
          <Text fontSize="clamp(15px, 1.28vw, 20px)" fontWeight="900" color="text.primary" truncate>
            {getDisplayName(player.name)}
          </Text>
          <Flex align="center" gap={1.5} mt="3px">
            <Box w="6px" h="6px" borderRadius="full" bg={accent} />
            <Text fontSize="clamp(8px, 0.72vw, 10px)" color="text.muted" fontWeight="800" textTransform="uppercase">
              {isPasser ? "Quarterback" : "Receiver"}
            </Text>
          </Flex>
          <Text fontSize="clamp(9px, 0.78vw, 11px)" color="text.secondary" fontWeight="800" mt="9px">
            {statLine1}
          </Text>
          <Text fontSize="clamp(9px, 0.78vw, 11px)" color="text.secondary" fontWeight="800" mt="2px">
            {statLine2}
          </Text>
        </Box>
      </Grid>
      <Flex flex={1} minH={0} align="stretch">
        <FieldMapGrid grid={player.grid} teamColor={teamColor} />
      </Flex>
    </VStack>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const GameBoxScorePassing = ({ game, teamId, avatarMap = {} }) => {
  const data = useMemo(() => buildTeamPassingData(game, teamId), [game, teamId]);
  const [activePlayer, setActivePlayer] = useState(null);

  if (!data) {
    return (
      <Flex w="full" h="full" align="center" justify="center" bg="bg.secondary" borderRadius="lg" border="1px solid whiteAlpha.100">
        <Text color="text.muted" fontSize="sm">No passing data</Text>
      </Flex>
    );
  }

  // Set default active player on first render
  const effectiveActive = activePlayer ?? { ...data.passers[0], _type: "passer" };

  const getImageUrl = (player) => {
    const key = player?.key?.replace(/^name:/, "");
    return avatarMap[key] || avatarMap[player?.name?.toLowerCase()] || null;
  };

  return (
    <Flex direction="column" w="full" h="full" minH={0}>
      {/* Header */}
      <Flex direction="column"
        bg={`linear-gradient(90deg, ${data.meta.colors.primary}44 0%, transparent 70%)`}
        borderBottom="1px solid whiteAlpha.100"
        px={2}
        py="6px"
        gap="4px"
        flexShrink={0}
      >
        <Flex align="center" gap={2}>
          <Flex w="28px" h="28px" borderRadius="sm" bg={data.meta.colors.primary} align="center" justify="center" flexShrink={0} border="1px solid whiteAlpha.200">
            <Text fontSize="10px" fontWeight="800" color={data.meta.colors.secondary}>{data.meta.shortName}</Text>
          </Flex>
          <Text fontSize="clamp(14px, 1.2vw, 18px)" fontWeight="800" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
            {data.meta.shortName} Passing
          </Text>
        </Flex>
        <PassingStatsTable team={data.passing} standard={data.downSplit.standard} passing={data.downSplit.passing} />
      </Flex>

      {/* Middle: Player Tables + Spotlight */}
      <Flex flex={1} minH={0} overflow="hidden">
        <Box w="55%" borderRight="1px solid whiteAlpha.100" display="flex" flexDirection="row">
          <Flex direction="column" align="center" gap="4px" px="4px" py="4px" borderRight="1px solid whiteAlpha.100" flexShrink={0}>
            <Box w="20px" flex={1} minH="40px" />
            <Box w="20px" flex={1} minH="40px" />
          </Flex>
          <Box flex={1} p="6px" overflow="hidden">
            <PlayerTable
              players={data.passers}
              activeKey={effectiveActive._type === "passer" ? effectiveActive.key : null}
              onSelect={setActivePlayer}
              type="passer"
            />
            <Box mt="4px">
              <PlayerTable
                players={data.receivers}
                activeKey={effectiveActive._type === "receiver" ? effectiveActive.key : null}
                onSelect={setActivePlayer}
                type="receiver"
              />
            </Box>
          </Box>
        </Box>

        <Box w="45%" p="8px" overflow="hidden">
          <PlayerSpotlight
            player={effectiveActive}
            type={effectiveActive._type}
            teamColor={data.meta.colors.primary}
            imageUrl={getImageUrl(effectiveActive)}
          />
        </Box>
      </Flex>
    </Flex>
  );
};
