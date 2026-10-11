import { useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Trophy, Flame, TrendingUp, Crown } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useMountEffect from "../../../hooks/useMountEffect";
import teamsData from "../../../data/teams.json";
import { TEAM_BY_ID } from "../../../utils/teamScheduleModel";

// Opponent strings arrive as "vs Prairie View" / "@ Texas Southern" — full
// names that blow past the headline's width. Resolve the name half to the
// team's abbreviation, keeping the vs/@ prefix.
const OPPONENT_ABBREV = (() => {
  const map = new Map();
  const put = (name, short) => {
    if (name && short) map.set(String(name).toLowerCase().replace(/[^a-z&]/g, ""), short);
  };
  teamsData.teams.forEach((team) => {
    put(team.name, team.shortName);
    put(team.bannerName, team.shortName);
  });
  return map;
})();

const abbreviateOpponent = (value) => {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(vs|@)\s+(.*)$/i);
  const prefix = match ? match[1] : "";
  const name = (match ? match[2] : raw).trim();
  const key = name.toLowerCase().replace(/[^a-z&]/g, "");

  let short = OPPONENT_ABBREV.get(key);
  if (!short) {
    // Mock/pipeline names are sometimes shortened ("Grambling" vs
    // "Grambling State", "Prairie View" vs "Prairie View A&M").
    for (const [candidate, abbrev] of OPPONENT_ABBREV) {
      if (candidate.startsWith(key) || key.startsWith(candidate)) {
        short = abbrev;
        break;
      }
    }
  }

  return `${prefix ? `${prefix} ` : ""}${short ?? name}`;
};

// ═══════════════════════════════════════════════════════════════
// GAME SPOTLIGHT — game readout + season bar chart, synced to the same
// rotating "active game" via useGameSpotlight, plus the position-specific
// production chart (rendered separately by the caller via PlayerProductionMap
// + gameOverride). Split into three independent pieces — GameReadout,
// SeasonBarChart, and the shared hook — so they can sit as three separate
// grid columns instead of one combined block.
//
// `games` is mock data shaped to match the real per-game box-score schema
// (public/data/1-game center/games/{year}/*.json → individual_stats[team]
// .defense[player]: tackles, tfl, sacks, qb_hurries, passes_defended,
// forced_fumbles) so swapping in real per-player game logs later is a
// drop-in, not a redesign.
// ═══════════════════════════════════════════════════════════════

const TICK_HOLD = 6000;
const TICK_FADE = 400;

const BADGE_CONFIG = {
  career: { icon: Trophy, label: "CAREER BEST", color: "#F6AD55" },
  season: { icon: Flame, label: "SEASON BEST", color: "#E53E3E" },
  recent: { icon: TrendingUp, label: "RECENT", color: "#68D391" },
  homecoming: { icon: Crown, label: "HOMECOMING", color: "#B794F4" },
};

// highlightPlay is mock, but shaped to match play_by_play entries in
// public/data/1-game center/games/{year}/*.json (raw_text description + a
// signed epa value) — negative EPA is a good outcome for the defense.
export const MOCK_SEASON_GAMES = [
  { week: "Week 1", vs: "vs Alcorn State", result: "W 24-17", par: 8.2, stats: { tackles: 6, solo_tackles: 4, assisted_tackles: 2, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "Open-field TFL on 3rd & 2, forced punt", epa: -1.4, wpa: 0.04 } },
  { week: "Week 2", vs: "@ Texas Southern", result: "L 14-21", par: 5.1, stats: { tackles: 4, solo_tackles: 3, assisted_tackles: 1, sacks: 0, tfl: 0, qb_hurries: 0, passes_defended: 0, forced_fumbles: 0 }, highlightPlay: { description: "Missed tackle allowed 22-yd gain", epa: 1.1, wpa: -0.03 } },
  { week: "Week 3", vs: "vs Grambling", result: "W 31-10", par: 14.6, stats: { tackles: 8, solo_tackles: 6, assisted_tackles: 2, sacks: 0, tfl: 1, qb_hurries: 1, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "PBU on 3rd & 9 in the red zone", epa: -1.9, wpa: 0.05 } },
  { week: "Week 4", vs: "vs Prairie View", result: "W 35-14", par: 22.4, tier: "season", note: "Season-high tackle total, SWAC POTW", stats: { tackles: 11, solo_tackles: 8, assisted_tackles: 3, sacks: 0.5, tfl: 1.5, qb_hurries: 1, passes_defended: 2, forced_fumbles: 0 }, highlightPlay: { description: "Sack + forced fumble, recovered by defense", epa: -3.2, wpa: 0.11 } },
  { week: "Week 5", vs: "vs Florida A&M", result: "W 21-10", par: 12.9, tier: "recent", note: "First forced fumble of the season", stats: { tackles: 7, solo_tackles: 5, assisted_tackles: 2, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 0, forced_fumbles: 1 }, highlightPlay: { description: "Forced fumble on kickoff return", epa: -2.6, wpa: 0.09 } },
  { week: "Week 6", vs: "@ Alabama A&M", result: "L 17-24", par: 3.4, stats: { tackles: 3, solo_tackles: 2, assisted_tackles: 1, sacks: 0, tfl: 0, qb_hurries: 0, passes_defended: 0, forced_fumbles: 0 }, highlightPlay: { description: "Blown coverage on go-ball TD", epa: 4.8, wpa: -0.14 } },
  { week: "Week 7", vs: "vs Southern", result: "W 28-21", par: 16.8, tier: "homecoming", note: "Homecoming shutdown performance", stats: { tackles: 9, solo_tackles: 7, assisted_tackles: 2, sacks: 1, tfl: 1, qb_hurries: 1, passes_defended: 0, forced_fumbles: 0 }, highlightPlay: { description: "Sack on 4th & 3 to end the drive", epa: -2.9, wpa: 0.1 } },
  { week: "Week 8", vs: "vs Jackson State", result: "W 28-21", par: 24.7, tier: "career", note: "Career-high tackle total", stats: { tackles: 13, solo_tackles: 10, assisted_tackles: 3, sacks: 1, tfl: 2, qb_hurries: 1, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "TFL + PBU on back-to-back snaps", epa: -2.1, wpa: 0.07 } },
  { week: "Week 9", vs: "@ Mississippi Valley", result: "W 42-7", par: 19.3, stats: { tackles: 10, solo_tackles: 8, assisted_tackles: 2, sacks: 0, tfl: 1, qb_hurries: 0, passes_defended: 2, forced_fumbles: 0 }, highlightPlay: { description: "Pick-six on a tipped pass", epa: 5.6, wpa: 0.18 } },
  { week: "Week 10", vs: "@ Alabama State", result: "L 17-24", par: 9.5, stats: { tackles: 5, solo_tackles: 4, assisted_tackles: 1, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "TFL on 4th-down goal-line stand", epa: -3.5, wpa: 0.12 } },
  { week: "Week 11", vs: "vs Bethune-Cookman", result: "W 30-20", par: 17.2, stats: { tackles: 8, solo_tackles: 6, assisted_tackles: 2, sacks: 0, tfl: 1, qb_hurries: 1, passes_defended: 0, forced_fumbles: 1 }, highlightPlay: { description: "Forced fumble, recovered inside the 10", epa: -3.0, wpa: 0.1 } },
  { week: "Week 12", vs: "@ Norfolk State", result: "W 26-13", par: 11.4, stats: { tackles: 6, solo_tackles: 5, assisted_tackles: 1, sacks: 0, tfl: 0.5, qb_hurries: 0, passes_defended: 1, forced_fumbles: 0 }, highlightPlay: { description: "PBU to force a turnover on downs", epa: -1.7, wpa: 0.06 } },
];

export const useGameSpotlight = (games) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  // `games` swaps from MOCK_SEASON_GAMES (mounted before a real profile
  // document loads) to the real, usually-shorter array once it arrives.
  // useMountEffect only runs once, so the modulo below must read the
  // current array via a ref rather than close over the length games had
  // at mount — otherwise it keeps cycling against the old length forever.
  const gamesRef = useRef(games);
  gamesRef.current = games;

  useMountEffect(() => {
    if (!gamesRef.current.length) return undefined;
    let current = 0;
    let fadeTimer;
    let holdTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          const len = gamesRef.current.length || 1;
          current = (current + 1) % len;
          setIndex(current);
          cycle();
        }, TICK_FADE);
      }, TICK_HOLD);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { index, setIndex, visible };
};

// ═══════════════════════════════════════════════════════════════
// GAME READOUT — badge + date/opponent + result + a real labeled stat
// grid (read live off game.stats, not a pre-baked string) for the active
// game.
// ═══════════════════════════════════════════════════════════════

const formatStatNum = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// Always TKL + TFL, then whichever third field is most notable for that
// game — mirrors real box-score priority (a sack/forced-fumble is a bigger
// deal than a routine pass breakup).
const buildStatFields = (stats = {}) => {
  const fields = [
    { label: "TKL", value: formatStatNum(stats.tackles ?? 0) },
    { label: "TFL", value: formatStatNum(stats.tfl ?? 0) },
  ];
  if (stats.sacks) fields.push({ label: "SCK", value: formatStatNum(stats.sacks) });
  else if (stats.forced_fumbles) fields.push({ label: "FF", value: formatStatNum(stats.forced_fumbles) });
  else fields.push({ label: "PD", value: formatStatNum(stats.passes_defended ?? 0) });
  return fields;
};

// stat_line[] has no per-entry category — a QB's passing line and his
// rushing line arrive as one flat array. Split on label rather than wait on
// a backend grouping field: anything in this set is a secondary production
// type and gets its own row instead of crowding the primary line.
const SECONDARY_STAT_LABELS = new Set(["RUSH", "REC", "KR", "PR"]);

const StatRow = ({ fields, primary, secondary }) => (
  <Flex gap="2px" bg="whiteAlpha.100" borderRadius="sm" overflow="hidden">
    {fields.map((field) => (
      <Flex key={field.label} direction="column" align="center" flex="1" bg={`${primary}14`} py="0.28rem">
        <Text fontSize="clamp(1rem, 2.3vw, 1.5rem)" fontWeight="950" color={secondary} lineHeight={1}>
          {field.value}
        </Text>
        <Text fontSize="0.42rem" fontWeight="800" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.06em" mt="1px">
          {field.label}
        </Text>
      </Flex>
    ))}
  </Flex>
);

export const GameReadout = ({ game, visible, primary, secondary }) => {
  const badge = game?.tier ? BADGE_CONFIG[game.tier] : null;
  const Icon = badge?.icon;
  const isWin = game.result?.startsWith("W");
  const resultColor = isWin ? "#68D391" : "#F56565";
  const [resultLetter, score] = game.result.split(" ");
  // Real games carry stat_line[] ([{label,value}], position-agnostic) —
  // use it directly rather than buildStatFields, which only knows the
  // defensive keys the original mock data happened to use.
  const statFields = game.statFields ?? buildStatFields(game.stats);
  const primaryStatFields = statFields.filter((f) => !SECONDARY_STAT_LABELS.has(f.label));
  const secondaryStatFields = statFields.filter((f) => SECONDARY_STAT_LABELS.has(f.label));

  return (
    <Flex
      direction="column"
      h="full"
      p="clamp(0.6rem, 1vw, 0.9rem)"
      justify="flex-start"
      position="relative"
      overflow="hidden"
      bg={`linear-gradient(165deg, ${primary}1A 0%, transparent 60%)`}
    >
      <Flex align="center" gap="0.35rem" mb="0.5rem">
        <Box w="3px" h="12px" bg={primary} borderRadius="sm" />
        <Text fontSize="0.62rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
          Game Spotlight
        </Text>
      </Flex>

      <Box style={{ opacity: visible ? 1 : 0, transition: `opacity ${TICK_FADE}ms ease` }}>
        {badge && (
          <Flex align="center" gap="0.3rem" w="fit-content" px="0.5rem" py="0.2rem" borderRadius="sm" bg={`${badge.color}22`} border={`1px solid ${badge.color}44`} mb="0.45rem">
            <Icon size={13} color={badge.color} />
            <Text fontSize="0.56rem" fontWeight="900" color={badge.color} textTransform="uppercase" letterSpacing="0.08em">
              {badge.label}
            </Text>
          </Flex>
        )}

        <Text fontSize="clamp(1.1rem, 1.9vw, 1.5rem)" fontWeight="950" textTransform="uppercase" lineHeight={1.15}>
          <Box as="span" color="white">{game.week} </Box>
          <Box as="span" color={secondary}>{abbreviateOpponent(game.vs)}</Box>
        </Text>

        <Flex align="center" gap="0.45rem" mt="0.4rem">
          <Flex align="center" justify="center" w="1.5rem" h="1.5rem" borderRadius="sm" bg={`${resultColor}26`} border={`1px solid ${resultColor}`} flexShrink={0}>
            <Text fontSize="0.7rem" fontWeight="950" color={resultColor}>{resultLetter}</Text>
          </Flex>
          <Text fontSize="0.85rem" fontWeight="900" color="white">{score}</Text>
        </Flex>

        {/* Labeled stat grid — real fields, not a flat string. Secondary
            production (rushing, receiving, returns) gets its own row
            instead of crowding into the primary line. */}
        {/* Trimmed from a 1.3-1.9rem value / 0.4rem padding: the stat row
            was eating enough height that Top Play below it was cut off. */}
        <Flex direction="column" gap="2px" mt="0.5rem">
          <StatRow fields={primaryStatFields} primary={primary} secondary={secondary} />
          {secondaryStatFields.length > 0 && (
            <StatRow fields={secondaryStatFields} primary={primary} secondary={secondary} />
          )}
        </Flex>

        {game.note && (
          <Text fontSize="0.56rem" color={primary} fontWeight="800" mt="0.35rem" textTransform="uppercase" letterSpacing="0.04em">
            {game.note}
          </Text>
        )}

        {game.highlightPlay && (
          <Box mt="0.4rem" pt="0.35rem" borderTop={`1px solid ${primary}33`}>
            <Flex align="center" gap="0.4rem" mb="0.25rem">
              <Text fontSize="0.62rem" color={primary} fontWeight="900" textTransform="uppercase" letterSpacing="0.06em">
                Top Play
              </Text>
              <Text fontSize="0.62rem" fontWeight="900" color={game.highlightPlay.epa < 0 ? "#68D391" : "#F56565"}>
                {game.highlightPlay.epa > 0 ? "+" : ""}
                {game.highlightPlay.epa.toFixed(1)} EPA
              </Text>
            </Flex>
            <Text fontSize="0.78rem" color="white" fontWeight="700" lineHeight={1.3}>
              {game.highlightPlay.description}
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
};

// ═══════════════════════════════════════════════════════════════
// SEASON BAR CHART — one bar per game, active game in primary color.
// Recharts-backed (first conversion off the hand-rolled div/SVG bar
// pattern used elsewhere in this file) — gets a real hover tooltip and
// drops the manual axis-math in favor of YAxis ticks/XAxis tick renderers.
// ═══════════════════════════════════════════════════════════════

const BarTooltip = ({ active, payload, primary }) => {
  if (!active || !payload?.length) return null;
  const g = payload[0].payload;
  return (
    <Box bg="rgba(10,10,14,0.95)" border="1px solid" borderColor={`${primary}66`} borderRadius="sm" px="0.55rem" py="0.4rem">
      <Text fontSize="0.58rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.04em">
        {g.week} · {abbreviateOpponent(g.vs)}
      </Text>
      <Text fontSize="0.72rem" fontWeight="950" fontFamily="mono" color={primary}>
        {g.par.toFixed(1)} PAR
      </Text>
    </Box>
  );
};

// Custom XAxis tick — recharts clones this element per tick, injecting
// x/y/payload/index — used to highlight the active game's week label the
// same way the old hand-rolled label row did. Draws the opponent's logo
// when `games[index]` carries a resolvable opponentId (real profile-doc
// games only — MOCK_SEASON_GAMES has no opponentId, so this falls back to
// the plain week number for every player without a document).
const WeekTick = ({ x, y, payload, index, activeIndex, primary, games }) => {
  const logo = TEAM_BY_ID[games?.[index]?.opponentId]?.logo;
  if (logo) {
    return (
      <g opacity={index === activeIndex ? 1 : 0.4}>
        <image href={logo} x={x - 7} y={y - 1} width={14} height={14} preserveAspectRatio="xMidYMid meet" />
      </g>
    );
  }
  return (
    <text x={x} y={y + 9} textAnchor="middle" fontSize={8} fontWeight={700} fill={index === activeIndex ? primary : "rgba(255,255,255,0.35)"}>
      {String(payload.value).replace(/^Week\s*/i, "")}
    </text>
  );
};

const YTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={3} textAnchor="end" fontSize={8} fontWeight={700} fill="rgba(255,255,255,0.45)">
    {payload.value.toFixed(0)}
  </text>
);

export const SeasonBarChart = ({ games, activeIndex, primary, secondary, onSelect }) => {
  const maxPar = Math.max(...games.map((g) => g.par), 1);
  const activeGame = games[activeIndex];
  const midPar = maxPar / 2;

  return (
    <Flex direction="column" h="full" p="clamp(0.6rem, 1vw, 0.9rem)" position="relative" overflow="hidden">
      <Flex align="center" justify="space-between" mb="0.35rem" flexShrink={0}>
        <Flex align="center" gap="0.3rem">
          <Box w="3px" h="10px" bg={primary} borderRadius="sm" />
          <Text fontSize="0.62rem" fontWeight="900" color="white" textTransform="uppercase" letterSpacing="0.06em">
            PAR by Game
          </Text>
        </Flex>
        <Text fontSize="0.62rem" fontWeight="900" color={primary}>
          {activeGame.par.toFixed(1)} PAR
        </Text>
      </Flex>

      <Box flex={1} minH={0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={games} margin={{ top: 4, right: 2, bottom: 0, left: 0 }} barCategoryGap="25%">
            <XAxis
              dataKey="week"
              axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
              tickLine={false}
              interval={0}
              height={18}
              tick={<WeekTick activeIndex={activeIndex} primary={primary} games={games} />}
            />
            <YAxis
              domain={[0, maxPar]}
              ticks={[0, midPar, maxPar]}
              axisLine={false}
              tickLine={false}
              width={22}
              tick={<YTick />}
            />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.06)" }} content={<BarTooltip primary={primary} />} />
            <Bar dataKey="par" radius={[2, 2, 0, 0]} onClick={(_, i) => onSelect(i)} activeBar={false} isAnimationActive={false}>
              {games.map((g, i) => (
                <Cell key={`${g.week}-${i}`} fill={i === activeIndex ? primary : `${secondary}55`} style={{ cursor: "pointer" }} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Flex>
  );
};
