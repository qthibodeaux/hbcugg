import { createContext, useContext, useMemo, useRef, useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ArrowRight, BarChart3, BookOpen, CalendarDays, ChevronDown, Grid3x3, Map, Shield, Swords, TrendingUp } from "lucide-react";
import { BottomSheet } from "../BottomSheet";
import { TEAM_ANALYTICS_TABS } from "../../../pages/analytics/teamAnalyticsTabs";
import { availablePresets, scatterSeries } from "../../../pages/analytics/scatterPresets";
import { MATCHUP_FIELDS, matchupTable } from "../../../pages/analytics/matchupMetrics";
import { glossaryEntry } from "../../../pages/analytics/metricGlossary";
import { readableTeamColor } from "../../../utils/teamColor";

// Tile type: sized to the tile (cqmin), with a rem floor that only the mobile
// rows switch on (--ta-min: 1). At ~125px a row, small captions in pure cqmin
// fall to 3-5px; the floor keeps every line readable and still scales with the
// reader's font setting. Desktop sets nothing, so its sizes are unchanged.
const remFloor = (n) => (n <= 3 ? 0.62 : n <= 5.5 ? 0.78 : +(n * 0.15).toFixed(2));
const tfs = (n) => `max(${n}cqmin, calc(var(--ta-min, 0) * ${remFloor(n)}rem))`;
// The one number a tile sells: a bigger rem floor on mobile, capped to the
// tile's width (--ta-fit, in cqw of the row) so it never clips. Desktop: no cap.
const hfs = (n, fit) => `min(max(${n}cqmin, calc(var(--ta-min, 0) * ${+(n * 0.18).toFixed(2)}rem)), calc(var(${fit ? "--ta-fit-word" : "--ta-fit"}, 100) * 1cqw))`;

// Mobile tiles carry the number and its label only: no tile titles, no axis
// captions, no formulas, no "Open tab" line.
const TileMobile = createContext(false);
const TileTitle = ({ children }) => {
  const mobile = useContext(TileMobile);
  if (mobile) return null;
  return (
    <Text fontSize={tfs(6.5)} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" lineClamp={1} textAlign="center">
      {children}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEAM ANALYTICS TILE STRIP — the tab row as a 4x1 of live tiles.
//
// Eight equal-width portrait tiles fill the slot; each is the tab button AND
// the statistical verdict that tab exists to deliver, off the same hub /
// week-review data the tab reads. Not a thumbnail of the tab's chart — the
// one number a fan would click for:
//
//   Week        the winner's net success rate next to the score — did we really get
//               beat that bad? (negative edge = no, you didn't)
//   Profile     the team's best unit and worst unit, by league percentile
//   Board       #1 and its gap to #2
//   Map         the quadrant — teams above the league on both levers
//   Matchup     the rating edge and the one lever that decides it
//   Rating Lab  the top lever's r² — how much of winning it explains
//   Trends      rank movement since the first season on file
//   Glossary    a term and its correlation with wins
//
// Every tile follows one vertical template: live readout on top (hero
// verdict → context → tease), and the tab itself as a big labelled bar at
// the bottom — that bar is what says "this is the tab", and the arrow on it
// is the call to open it. The strip is a size container, so everything is
// in cqmin (= the row unit). No px.
//
// Rotation is the CSS-driven pattern from Notable Performers: an invisible
// looping animation fires onAnimationIteration once a cycle, and the slide
// change plays as a live-tile transition (SlideStage). No useEffect, no
// setInterval, no progress bar.
// ─────────────────────────────────────────────────────────────────────────────

// Each tile rotates on its own cadence (see TILE_PARTS) so the strip never
// flips in lockstep. A rotation is a real transition between two slides —
// the outgoing readout leaves while the incoming one arrives — in the
// Windows live-tile vocabulary: slide, push, flip, cube, peek, fade. No
// hover motion anywhere on the strip.
const DEFAULT_ROTATE_MS = 5000;
const SLIDE_MS = 650;
const TileConfig = createContext({ rotateMs: DEFAULT_ROTATE_MS, transition: "slide" });
const BRAND = "#A855F7";
const POS = "#68D391";
const NEG = "#FC8181";

const TILE_KEYFRAMES = `
  @keyframes taTileTick { 0%, 100% { opacity: 1; } }
  @keyframes taTilePulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.7); } }
  @keyframes taTileMount { from { opacity: 0; transform: translateY(1.2em); } to { opacity: 1; transform: none; } }
  @keyframes taTileBreathe { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.22); } }

  /* Inner-element arrivals used inside a slide (the Week bar). */
  @keyframes taTileGrowUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
  @keyframes taTileDrop { from { opacity: 0; transform: translateY(-0.6em); } to { opacity: 1; transform: translateY(0); } }
  @keyframes taTileRise { from { opacity: 0; transform: translateY(0.6em); } to { opacity: 1; transform: translateY(0); } }
  @keyframes taTilePop { from { opacity: 0; transform: scale(0.6); } 60% { transform: scale(1.08); } to { opacity: 1; transform: scale(1); } }
  .ta-tile-grow-up { transform-origin: bottom center; animation: taTileGrowUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
  @keyframes taTileGrowRight { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .ta-tile-grow-right { transform-origin: left center; animation: taTileGrowRight 0.55s cubic-bezier(0.16, 1, 0.3, 1) both, taTileBreathe 3.2s ease-in-out infinite; }
  .ta-tile-grow-down { transform-origin: top center; animation: taTileGrowUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .ta-tile-drop { animation: taTileDrop 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .ta-tile-rise { animation: taTileRise 0.5s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both; }
  .ta-tile-pop { animation: taTilePop 0.5s 0.25s cubic-bezier(0.16, 1, 0.3, 1) both; }

  /* ── Slide transitions: each has an -out (leaving) and an -in (arriving) ── */
  /* slide — Windows' default: the tile scrolls up to the next item. */
  @keyframes taSlideOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
  @keyframes taSlideIn  { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  /* push — horizontal: old pushed off left, new pushed in from the right. */
  @keyframes taPushOut  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
  @keyframes taPushIn   { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  /* flip — the tile turns over on its horizontal axis; new face on the back. */
  @keyframes taFlipOut  { from { transform: rotateX(0); opacity: 1; } 50%, to { transform: rotateX(90deg); opacity: 0; } }
  @keyframes taFlipIn   { from, 50% { transform: rotateX(-90deg); opacity: 0; } to { transform: rotateX(0); opacity: 1; } }
  /* cube — the tile rotates on its vertical axis like a face of a cube. */
  @keyframes taCubeOut  { from { transform: translateX(0) rotateY(0); opacity: 1; } to { transform: translateX(-60%) rotateY(-90deg); opacity: 0; } }
  @keyframes taCubeIn   { from { transform: translateX(60%) rotateY(90deg); opacity: 0; } to { transform: translateX(0) rotateY(0); opacity: 1; } }
  /* peek — the new item rises up over the old, which stays put underneath. */
  @keyframes taPeekOut  { from, to { transform: none; opacity: 1; } }
  @keyframes taPeekIn   { from { transform: translateY(100%); } to { transform: translateY(0); } }
  /* fade — crossfade. */
  @keyframes taFadeOut  { from { opacity: 1; } to { opacity: 0; } }
  @keyframes taFadeIn   { from { opacity: 0; } to { opacity: 1; } }
  /* zoom — old sinks back, new lands from in front. */
  @keyframes taZoomOut  { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
  @keyframes taZoomIn   { from { transform: scale(1.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }

  .ta-slide-stage { position: relative; perspective: 80cqmin; }
  .ta-slide-layer { backface-visibility: hidden; transform-origin: center center; }
  .ta-slide-prev { position: absolute; inset: 0; pointer-events: none; }
  .ta-x-slide-out { animation: taSlideOut ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .ta-x-slide-in  { animation: taSlideIn ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .ta-x-push-out  { animation: taPushOut ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .ta-x-push-in   { animation: taPushIn ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .ta-x-flip-out  { transform-origin: center center; animation: taFlipOut ${SLIDE_MS}ms ease-in both; }
  .ta-x-flip-in   { transform-origin: center center; animation: taFlipIn ${SLIDE_MS}ms ease-out both; }
  .ta-x-cube-out  { transform-origin: right center; animation: taCubeOut ${SLIDE_MS}ms ease-in-out both; }
  .ta-x-cube-in   { transform-origin: left center; animation: taCubeIn ${SLIDE_MS}ms ease-in-out both; }
  .ta-x-peek-out  { animation: taPeekOut ${SLIDE_MS}ms linear both; }
  .ta-x-peek-in   { animation: taPeekIn ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .ta-x-fade-out  { animation: taFadeOut ${SLIDE_MS}ms ease both; }
  .ta-x-fade-in   { animation: taFadeIn ${SLIDE_MS}ms ease both; }
  .ta-x-zoom-out  { animation: taZoomOut ${SLIDE_MS}ms ease-in both; }
  .ta-x-zoom-in   { animation: taZoomIn ${SLIDE_MS}ms ease-out both; }

  /* Page-load stagger: tiles arrive left to right. */
  .ta-tile-mount { animation: taTileMount 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--ta-mount-delay, 0ms); }
  .ta-tile-breathe { animation: taTileBreathe 3.2s ease-in-out infinite; }
  .ta-tile-tick { animation: taTileTick var(--ta-rotate, ${DEFAULT_ROTATE_MS}ms) linear infinite; }
  .ta-tile-pulse { animation: taTilePulse 1.6s ease-in-out infinite; }
  .ta-tile-val { animation: taFadeIn 260ms ease both; }
  @media (prefers-reduced-motion: reduce) {
    [class*="ta-x-"], .ta-tile-grow-right, .ta-tile-pulse, .ta-tile-val, .ta-tile-grow-up, .ta-tile-grow-down, .ta-tile-drop, .ta-tile-rise, .ta-tile-pop, .ta-tile-mount, .ta-tile-breathe { animation: none !important; }
    .ta-slide-prev { display: none; }
  }
`;

const fmtSigned = (v, d = 1) => (Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(d)}` : "—");

// Never the same clock twice: every cycle picks a fresh interval in the
// 5–12s band, seeded off the tile's own base so the eight tiles stay out of
// phase with each other as well as with themselves. The animation restarts
// (key) with the new duration after each tick.
const ROTATE_MIN_MS = 5000;
const ROTATE_MAX_MS = 12000;
const jitteredMs = (base, n) => {
  const x = Math.abs(Math.sin((base + 1) * 0.0007 + n * 12.9898) * 43758.5453);
  const t = x - Math.floor(x);
  return Math.round(ROTATE_MIN_MS + t * (ROTATE_MAX_MS - ROTATE_MIN_MS));
};

const Rotator = ({ count, onTick, baseMs }) => {
  const ctx = useContext(TileConfig);
  const rotateMs = baseMs ?? ctx.rotateMs;
  const [n, setN] = useState(0);
  if (count <= 1) return null;
  return (
    <Box
      key={n}
      className="ta-tile-tick"
      w={0}
      h={0}
      overflow="hidden"
      style={{ "--ta-rotate": `${jitteredMs(rotateMs, n)}ms` }}
      onAnimationIteration={() => { setN((v) => v + 1); onTick(); }}
    />
  );
};

// Logo size: cqmin, with the same mobile-only rem floor as the type.
const markSize = (size) => `max(${size}cqmin, calc(var(--ta-min, 0) * ${+(size * 0.13).toFixed(2)}rem))`;

const Mark = ({ logo, label, size = 7 }) =>
  logo ? (
    <Image src={logo} alt="" w={markSize(size)} h={markSize(size)} objectFit="contain" flexShrink={0} />
  ) : (
    <Flex w={markSize(size)} h={markSize(size)} align="center" justify="center" borderRadius="sm" bg="whiteAlpha.100" flexShrink={0}>
      <Text fontSize={tfs(size * 0.34)} fontWeight="black" color="whiteAlpha.700" lineClamp={1}>{String(label ?? "?").slice(0, 3).toUpperCase()}</Text>
    </Flex>
  );

// ── Template atoms ───────────────────────────────────────────────────────────

const Micro = ({ children, color = "rgba(255,255,255,0.45)", size = 2.4, ...rest }) => (
  <Text fontSize={tfs(size)} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.25} lineClamp={2} {...rest}>
    {children}
  </Text>
);

const Hero = ({ children, color = "white", size = 11, ...rest }) => (
  <Text fontSize={tfs(size)} fontWeight="black" color={color} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);

const Context = ({ children, color = "rgba(255,255,255,0.8)", ...rest }) => {
  const mobile = useContext(TileMobile);
  return (
    <Text fontSize={tfs(3)} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.15} lineClamp={mobile ? 1 : 2} {...rest}>
      {children}
    </Text>
  );
};

// The tab bar is rendered by the strip; the body owns the live readout.
// `cycle` changes each rotation and drives the slide transition; `live`
// shows the pulse dot so a rotating tile reads as rotating.
// The slide stage. Holds the outgoing slide as a snapshot for one transition
// so it can animate out underneath / over the incoming one — a real
// transition between two states, not a remount. Snapshot is derived state
// (set during render on cycle change), and dropped when its exit animation
// ends; no effects.
const SlideStage = ({ cycle, children }) => {
  const { transition } = useContext(TileConfig);
  const latest = useRef(children);
  const [stage, setStage] = useState({ cycle, prev: null, prevCycle: null });
  if (stage.cycle !== cycle) {
    setStage({ cycle, prev: latest.current, prevCycle: stage.cycle });
  }
  latest.current = children;
  const animate = stage.prev != null;
  return (
    <Box className="ta-slide-stage" minW={0} flex={1} minH={0} display="flex" flexDirection="column" overflow={transition === "flip" || transition === "cube" ? "visible" : "hidden"}>
      <Flex key={`in-${cycle}`} className={`ta-slide-layer ${animate ? `ta-x-${transition}-in` : ""}`} minW={0} flex={1} minH={0} direction="column" justify="center" position="relative" zIndex={transition === "peek" ? 2 : 1}>
        {children}
      </Flex>
      {animate && (
        <Flex
          key={`out-${stage.prevCycle}`}
          className={`ta-slide-layer ta-slide-prev ta-x-${transition}-out`}
          direction="column"
          justify="center"
          zIndex={transition === "peek" ? 1 : 2}
          onAnimationEnd={() => setStage((st) => ({ ...st, prev: null, prevCycle: null }))}
        >
          {stage.prev}
        </Flex>
      )}
    </Box>
  );
};

const Body = ({ top = null, children, tease, cycle = 0, live = false }) => {
  const mobile = useContext(TileMobile);
  // Mobile bar: the slide owns the whole wide face; no title, no tease.
  if (mobile) {
    return (
      <Flex h="100%" w="100%" minW={0} position="relative">
        {top}
        <SlideStage cycle={cycle}>{children}</SlideStage>
        {live && <Box className="ta-tile-pulse" position="absolute" top="0.1rem" right="0.1rem" w="0.4rem" h="0.4rem" borderRadius="full" bg={BRAND} />}
      </Flex>
    );
  }
  return (
    <Flex direction="column" flex={1} minH={0} justify="space-between" gap="2cqmin">
      <Flex align="flex-start" justify="space-between" gap="1cqmin" minW={0}>
        <Box minW={0} flex={1}>{top}</Box>
        {live && <Box className="ta-tile-pulse" w="1.6cqmin" h="1.6cqmin" borderRadius="full" bg={BRAND} flexShrink={0} mt="0.6cqmin" />}
      </Flex>
      <SlideStage cycle={cycle}>{children}</SlideStage>
      {tease && <Box minW={0}>{tease}</Box>}
    </Flex>
  );
};

// ── Wide faces (mobile bar) ──────────────────────────────────────────────────
// The desktop tile stacks top to bottom in a tall card; the mobile bar is a
// short, wide strip, so each face reads left to right: logo → number → label.
// Sized in rem: the bar is a fixed 4.5rem tall.
const WideRow = ({ children, gap = "0.7rem", ...rest }) => (
  <Flex align="center" gap={gap} h="100%" w="100%" minW={0} {...rest}>{children}</Flex>
);

const WideLogo = ({ team, size = "2.6rem", dim = false }) =>
  team?.logo ? (
    <Image src={team.logo} alt="" w={size} h={size} objectFit="contain" flexShrink={0} opacity={dim ? 0.55 : 1} />
  ) : (
    <Flex w={size} h={size} flexShrink={0} align="center" justify="center" bg="whiteAlpha.100">
      <Text fontSize="0.7rem" fontWeight="black" color="whiteAlpha.700">{String(team?.short ?? "?").slice(0, 4).toUpperCase()}</Text>
    </Flex>
  );

const WideNum = ({ children, color = "white", size = "2rem", ...rest }) => (
  <Text fontSize={size} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" whiteSpace="nowrap" {...rest}>
    {children}
  </Text>
);

const WideLabel = ({ children, color = "rgba(255,255,255,0.75)", ...rest }) => (
  <Text fontSize="0.72rem" fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.1} lineClamp={1} {...rest}>
    {children}
  </Text>
);

// Number over its label — the readout every face ends on.
const WideStat = ({ value, label, color, size }) => (
  <Flex direction="column" gap="0.3rem" minW={0}>
    <WideNum color={color} size={size}>{value}</WideNum>
    {label && <WideLabel>{label}</WideLabel>}
  </Flex>
);

const Empty = ({ children = "No data" }) => (
  <Flex flex={1} align="center" justify="center">
    <Micro color="rgba(255,255,255,0.3)">{children}</Micro>
  </Flex>
);

// ── Week Review — did we really get beat that bad? ───────────────────────────
// Always the most recent week that has games (the backend's default week
// when it has games, else the last played week). The readout is a standard
// bar, one game at a time: winner's logo, an axis, a bar dropping from the
// axis in the winner's colour with the winner's net success rate on it, the loser's
// logo under. The bar does not mirror the chart's direction — it is the
// same shape every game; the number's colour carries the sign. Rotates
// through the week's most contrarian games (up to three, however many
// there are).

const WeekBar = ({ winner, loser, edge, cycle }) => {
  const mobile = useContext(TileMobile);
  const color = winner?.primary && winner.primary !== "#000000" ? winner.primary : BRAND;
  const numberColor = Number.isFinite(edge) ? (edge >= 0 ? POS : NEG) : "rgba(255,255,255,0.6)";
  // Wide: the bar turns on its side — winner, the edge on a bar of the
  // winner's colour, the loser trailing behind.
  if (mobile) {
    return (
      <WideRow gap="0.55rem">
        <Box key={`w-${cycle}`} className="ta-tile-drop"><WideLogo team={winner} size="2.5rem" /></Box>
        <Flex
          key={`bar-${cycle}`}
          className="ta-tile-grow-right"
          flex={1}
          minW={0}
          h="2.6rem"
          bg={color}
          align="center"
          justify="center"
          boxShadow={`0 0 1rem ${color}55`}
        >
          <WideNum key={`n-${cycle}`} className="ta-tile-pop" color={numberColor} size="1.7rem" textShadow="0 0 0.5rem rgba(0,0,0,0.9)">
            {fmtSigned(edge, 3)}
          </WideNum>
        </Flex>
        <Box key={`l-${cycle}`} className="ta-tile-rise"><WideLogo team={loser} size="1.6rem" dim /></Box>
      </WideRow>
    );
  }
  return (
    <Flex direction="column" align="center" h={mobile ? "100%" : "40cqmin"} w="100%">
      <Box key={`w-${cycle}`} className="ta-tile-drop" flexShrink={0}>
        <Mark logo={winner?.logo} label={winner?.short} size={9} />
      </Box>
      <Box h="0.5cqmin" w="100%" bg="rgba(255,255,255,0.6)" borderRadius="full" mt="1.2cqmin" flexShrink={0} />
      <Flex
        key={`bar-${cycle}`}
        className="ta-tile-grow-down ta-tile-breathe"
        flex={1}
        minH={0}
        w="62%"
        bg={color}
        borderBottomRadius="1cqmin"
        align="center"
        justify="center"
        boxShadow={`0 0 3cqmin ${color}55`}
      >
        <Text
          key={`n-${cycle}`}
          className="ta-tile-pop"
          fontSize={hfs(8)}
          fontWeight="black"
          color={numberColor}
          lineHeight={1}
          letterSpacing="-0.04em"
          fontVariantNumeric="tabular-nums"
          textShadow="0 0 1.2cqmin rgba(0,0,0,0.9), 0 0.3cqmin 0.8cqmin rgba(0,0,0,0.8)"
        >
          {fmtSigned(edge, 3)}
        </Text>
      </Flex>
      <Box key={`l-${cycle}`} className="ta-tile-rise" mt="1.5cqmin" flexShrink={0}>
        <Mark logo={loser?.logo} label={loser?.short} size={6} />
      </Box>
    </Flex>
  );
};

const WeekBody = ({ review }) => {
  const games = useMemo(() => {
    const weeks = Array.isArray(review?.weeks) ? review.weeks : [];
    const played = weeks.filter((w) => w.played && w.games?.length);
    const preferred = review?.defaultWeek ?? review?.default_week;
    const week = played.find((w) => w.week === preferred) ?? played[played.length - 1] ?? null;
    if (!week) return { week: null, list: [] };
    const list = week.games
      .map((g) => ({ ...g, edge: Number.isFinite(g.winner_edge) ? g.winner_edge : null }))
      .filter((g) => g.winner_id)
      .sort((a, b) => (a.edge ?? Infinity) - (b.edge ?? Infinity))
      .slice(0, 3);
    return { week, list };
  }, [review]);
  const [i, setI] = useState(0);
  const g = games.list[i % Math.max(1, games.list.length)];
  if (!g) return <Empty>No games yet</Empty>;

  const winner = g.winner_id === g.home?.id ? g.home : g.away;
  const loser = winner === g.home ? g.away : g.home;

  return (
    <Body
      cycle={i}
      live={games.list.length > 1}
      top={
        <>
          <Rotator count={games.list.length} onTick={() => setI((v) => (v + 1) % games.list.length)} />
          <TileTitle>{games.week.label}</TileTitle>
        </>
      }
    >
      <WeekBar winner={winner} loser={loser} edge={g.edge} cycle={i} />
    </Body>
  );
};

// ── Team Profile — six stats, six leaders ────────────────────────────────────
// One stat per slide, shown for the team that leads the league in it: the
// number huge (the sell), the label under it, the leader's logo big and
// offset behind. Record carries no label — the score line is its own label.
//
// All real: record and team rating off the hub, the efficiency stats off the
// backend's advanced block (offense side).

const adv = (r, k) => {
  const v = r?.advanced?.offense?.[k];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
};

const PROFILE_STATS = [
  { id: "record", label: null, value: (r) => r.record?.pct, text: (r) => r.record?.record ?? "—" },
  { id: "adj_epa", label: "Adj EPA / Play", value: (r) => adv(r, "adj_epa_per_play"), text: (r) => fmtSigned(adv(r, "adj_epa_per_play"), 2) },
  { id: "epa", label: "EPA / Play", value: (r) => adv(r, "epa_per_play"), text: (r) => fmtSigned(adv(r, "epa_per_play"), 2) },
  { id: "expl", label: "Explosive Rate", value: (r) => adv(r, "explosive_rate"), text: (r) => (adv(r, "explosive_rate") != null ? `${Math.round(adv(r, "explosive_rate") * 100)}%` : "—") },
  { id: "sr", label: "Success Rate", value: (r) => adv(r, "success_rate"), text: (r) => (adv(r, "success_rate") != null ? `${Math.round(adv(r, "success_rate") * 100)}%` : "—") },
  { id: "rating", label: "Team Rating", value: (r) => r.rating, text: (r) => r.rating_display ?? fmtSigned(r.rating, 3) },
];

const ProfileBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  const slides = useMemo(() => {
    const rows = Object.values(hub.teams ?? {})
      .map((t) => ({ team: t, row: t.seasons?.[season] ?? null }))
      .filter((x) => x.row);
    return PROFILE_STATS.map((stat) => {
      const leader = rows
        .filter((x) => Number.isFinite(stat.value(x.row)))
        .sort((a, b) => stat.value(b.row) - stat.value(a.row))[0];
      return leader ? { stat, team: leader.team, row: leader.row } : null;
    }).filter(Boolean);
  }, [hub.teams, season]);
  const [i, setI] = useState(0);
  if (!slides.length) return <Empty>No season on file</Empty>;
  const { stat, team, row } = slides[i % slides.length];
  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={
        <>
          <Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />
          <TileTitle>Leader</TileTitle>

        </>
      }
    >
      {mobile ? (
        <WideRow><WideLogo team={team.identity} size="2.9rem" /><WideStat value={stat.text(row)} label={stat.label} size="2.1rem" /></WideRow>
      ) : (
      <Box position="relative" flex={1} minH="36cqmin" minW={0}>
        <Flex position="absolute" inset={0} align="center" justify="center" opacity={0.2} pointerEvents="none">
          <Mark logo={team.identity.logo} label={team.identity.short} size={46} />
        </Flex>
        <Flex position="relative" direction="column" align="center" justify="center" h="100%" minW={0} textAlign="center">
          <Text fontSize={hfs(stat.id === "record" ? 16 : 14)} fontWeight="black" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1} textShadow="0 0 2cqmin rgba(0,0,0,0.8)">
            {stat.text(row)}
          </Text>
          {stat.label && <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{stat.label}</Context>}
        </Flex>
      </Box>
      )}
    </Body>
  );
};

// ── Board — #1 and the gap ───────────────────────────────────────────────────

// Leader Board: who's best at X. One slide per Board column — the composite
// rating and the five strongest win levers — showing the league leader's
// actual value huge, the stat name under it, and the rank after. The team's
// logo sits big behind. Same template as Team Profile.
const fmtMetric = (v, unit) => (!Number.isFinite(v) ? "—" : unit === "pct" ? `${(v * 100).toFixed(1)}%` : v.toFixed(2));

const BoardBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  const slides = useMemo(() => {
    const rows = Object.values(hub.teams ?? {})
      .map((t) => ({ t, s: t.seasons?.[season] }))
      .filter((x) => x.s);
    const columns = [
      { key: "rating", label: "Team Rating", value: (x) => x.s.rating, text: (x) => x.s.rating_display ?? fmtSigned(x.s.rating, 3), good: true },
      ...(hub.levers ?? []).slice(0, 5).map((l) => ({
        key: l.field,
        label: l.short,
        value: (x) => x.s.metrics?.[l.field],
        text: (x) => fmtMetric(x.s.metrics?.[l.field], l.unit),
        good: l.good,
      })),
    ];
    return columns
      .map((c) => {
        const leader = rows
          .filter((x) => Number.isFinite(c.value(x)))
          .sort((a, b) => (c.good ? c.value(b) - c.value(a) : c.value(a) - c.value(b)))[0];
        return leader ? { column: c, ...leader } : null;
      })
      .filter(Boolean);
  }, [hub.teams, hub.levers, season]);
  const [i, setI] = useState(0);
  if (!slides.length) return <Empty>No season on file</Empty>;
  const { column, t, s: row } = slides[i % slides.length];
  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={
        <>
          <Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />
          <TileTitle>Rankings</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow><WideLogo team={t.identity} size="2.9rem" /><WideStat value={column.text({ t, s: row })} label={`#1 · ${column.label}`} size="2.1rem" /></WideRow>
      ) : (
      <Box position="relative" flex={1} minH="36cqmin" minW={0}>
        <Flex position="absolute" inset={0} align="center" justify="center" opacity={0.2} pointerEvents="none">
          <Mark logo={t.identity.logo} label={t.identity.short} size={46} />
        </Flex>
        <Flex position="relative" direction="column" align="center" justify="center" h="100%" minW={0} textAlign="center">
          <Text fontSize={hfs(14)} fontWeight="black" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1} textShadow="0 0 2cqmin rgba(0,0,0,0.8)">
            {column.text({ t, s: row })}
          </Text>
          <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{column.label}</Context>
          {!mobile && <Text fontSize={tfs(5)} fontWeight="black" fontStyle="italic" color={BRAND} lineHeight={1} mt="1cqmin" fontVariantNumeric="tabular-nums">#1</Text>}
        </Flex>
      </Box>
      )}
    </Body>
  );
};

// ── Scatter — the preset charts ──────────────────────────────────────────────
// One preset per slide: all 18 teams as plain dots, the league average as a
// crosshair, and the chart's biggest outlier swapped for its logo — the dot
// worth asking about. Axes are labelled on the plot; the chart's name sits
// under it. The presets are shared with the tab (scatterPresets.js), so the
// tile is a preview of a chart the tab can actually draw.

const ScatterPlot = ({ points, avgX, avgY, preset }) => {
  const PAD = 12;
  const span = (vals) => {
    const lo = Math.min(...vals), hi = Math.max(...vals);
    const m = (hi - lo) * 0.16 || 0.01;
    return [lo - m, hi + m];
  };
  const [x0, x1] = span(points.map((p) => p.x));
  const [y0, y1] = span(points.map((p) => p.y));
  // Same flips as the Scatter tab, so better reads right / up here too.
  const fx = (t) => (preset?.flip?.x ? 1 - t : t);
  const fy = (t) => (preset?.flip?.y ? 1 - t : t);
  const px = (v) => PAD + fx((v - x0) / (x1 - x0)) * (100 - PAD * 2);
  const py = (v) => 100 - PAD - fy((v - y0) / (y1 - y0)) * (100 - PAD * 2);
  // The dot furthest from the league average, in normalised units — the one
  // the chart is really about.
  const outlier = points.reduce((best, p) => {
    const d = ((p.x - avgX) / (x1 - x0)) ** 2 + ((p.y - avgY) / (y1 - y0)) ** 2;
    return best == null || d > best.d ? { p, d } : best;
  }, null)?.p;

  return (
    <Box w="100%" flex={1} minH={0}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" width="100%" height="100%" style={{ display: "block" }}>
        {/* crosshair = league average */}
        <line x1={px(avgX)} y1={PAD * 0.4} x2={px(avgX)} y2={100 - PAD * 0.6} stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <line x1={PAD * 0.4} y1={py(avgY)} x2={100 - PAD * 0.4} y2={py(avgY)} stroke="rgba(255,255,255,0.16)" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        {points.map((p) =>
          p === outlier ? null : (
            <circle key={p.id} cx={px(p.x)} cy={py(p.y)} r="2.6" fill="#3F3F46" />
          ),
        )}
        {outlier && (
          <g>
            <circle cx={px(outlier.x)} cy={py(outlier.y)} r="11" fill="rgba(10,10,12,0.75)" stroke={outlier.color ?? BRAND} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            {outlier.logo ? (
              <image href={outlier.logo} x={px(outlier.x) - 8} y={py(outlier.y) - 8} width="16" height="16" preserveAspectRatio="xMidYMid meet" />
            ) : (
              <text x={px(outlier.x)} y={py(outlier.y) + 2.5} textAnchor="middle" fill="white" fontSize="7" fontWeight="900">{outlier.short}</text>
            )}
          </g>
        )}
      </svg>
    </Box>
  );
};

const MapBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  const [i, setI] = useState(0);
  const presets = useMemo(() => availablePresets(hub, season), [hub, season]);
  const preset = presets[i % Math.max(presets.length, 1)];
  const chart = useMemo(() => (preset ? scatterSeries(hub, season, preset.x, preset.y, preset.id) : { points: [] }), [hub, season, preset]);
  if (!chart.points.length) return <Empty>No season on file</Empty>;
  return (
    <Body
      cycle={i}
      live={presets.length > 1}
      top={
        <>
          <Rotator count={presets.length} onTick={() => setI((v) => (v + 1) % presets.length)} />
          <TileTitle>Charts</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow gap="0.6rem">
          <Box w="4rem" h="3.9rem" flexShrink={0} display="flex"><ScatterPlot {...chart} /></Box>
          <WideLabel color="white" fontSize="0.85rem" lineClamp={2}>{preset.label}</WideLabel>
        </WideRow>
      ) : (
      <Flex direction="column" flex={1} minH={0} minW={0} gap="1cqmin">
        {!mobile && <Micro size={2.1} textAlign="center">↑ {chart.y.label}</Micro>}
        <ScatterPlot {...chart} />
        {!mobile && <Micro size={2.1} textAlign="center">{chart.x.label} →</Micro>}
        {!mobile && <Context mt="0.8cqmin" textAlign="center">{preset.label}</Context>}
      </Flex>
      )}
    </Body>
  );
};

// ── Matchup — three bands, three clocks ──────────────────────────────────────
// Not one rotating readout but three stacked ones: a team, the stat that
// separates them, the other team. Each band keeps its own clock and its own
// transition, so the tile is never doing one thing — it reads like a split
// flap board settling one row at a time.
//
// The middle band owns the STAT: that is what its clock rotates and what its
// flip animates. The number itself is derived live from whichever two teams
// are showing right now, so a team band flipping underneath can never leave a
// stale number behind — the digits just cross-fade in place.
//
// The pool is four teams drawn at random on load, and the bottom band skips
// whoever is on top so the tile never faces a team against itself.
//
// The four stats are the backend's advanced block (matchupMetrics.js).

const MATCHUP_TILE_STATS = [
  { key: "net_epa", label: "EPA / Play" },
  { key: "o_success", label: "Success Rate" },
  { key: "net_epa_drive", label: "EPA / Drive" },
  { key: "net_fp", label: "Field Position" },
];
const MATCHUP_POOL_SIZE = 4;

const fmtDiff = (v, unit) => {
  if (!Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  const mag = Math.abs(v);
  if (unit === "pct") return `${sign}${(mag * 100).toFixed(1)}%`;
  if (unit === "num1" || unit === "fp") return `${sign}${mag.toFixed(1)}`;
  return `${sign}${mag.toFixed(2)}`;
};

// One band: its own clock, its own transition, its own slide stage.
const Band = ({ transition, baseMs, count, onTick, cycle, flex = 1, divider = false, wide = false, children }) => (
  <TileConfig.Provider value={{ rotateMs: baseMs, transition }}>
    <Flex
      direction="column" flex={flex} minH={0} minW={0} position="relative"
      {...(divider ? (wide ? { borderLeft: "1px solid" } : { borderTop: "1px solid" }) : {})} borderColor="whiteAlpha.200"
    >
      <Rotator count={count} onTick={onTick} baseMs={baseMs} />
      <SlideStage cycle={cycle}>{children}</SlideStage>
    </Flex>
  </TileConfig.Provider>
);

// A team band: oversize ghost logo bled off one corner, standard logo in front.
const TeamFace = ({ team, side }) => (
  <Flex position="relative" flex={1} minH={0} align="center" justify="center" overflow="hidden">
    <Box
      position="absolute" opacity={0.16} pointerEvents="none"
      {...(side === "top" ? { left: "-9cqmin", top: "-7cqmin" } : { right: "-9cqmin", bottom: "-7cqmin" })}
    >
      <Mark logo={team.identity.logo} label={team.identity.short} size={30} />
    </Box>
    <Box position="relative">
      <Mark logo={team.identity.logo} label={team.identity.short} size={11} />
    </Box>
  </Flex>
);

const MatchupBody = ({ hub, season }) => {
  const mobile = useContext(TileMobile);
  // Random on load: a fresh four every time the strip mounts.
  const pool = useMemo(() => {
    const rows = Object.values(hub.teams ?? {}).filter((t) => t.seasons?.[season]);
    for (let i = rows.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [rows[i], rows[j]] = [rows[j], rows[i]];
    }
    return rows.slice(0, MATCHUP_POOL_SIZE);
  }, [hub.teams, season]);
  const tape = useMemo(() => matchupTable(hub, season), [hub, season]);

  const [top, setTop] = useState(0);
  const [bottom, setBottom] = useState(1);
  const [stat, setStat] = useState(0);

  if (pool.length < 2) return <Empty>No season on file</Empty>;

  const n = pool.length;
  const a = pool[top % n];
  // The bottom band runs its own clock but never lands on the team up top.
  const b = pool[bottom % n === top % n ? (bottom + 1) % n : bottom % n];
  const st = MATCHUP_TILE_STATS[stat % MATCHUP_TILE_STATS.length];

  const unit = MATCHUP_FIELDS[st.key]?.unit;
  const va = tape.values[a.identity.id]?.[st.key];
  const vb = tape.values[b.identity.id]?.[st.key];
  const diff = Number.isFinite(va) && Number.isFinite(vb) ? va - vb : undefined;
  // Raw sign, from the top team's point of view; colour says who is better.
  const better = MATCHUP_FIELDS[st.key]?.high ? diff > 0 : diff < 0;
  const tone = !Number.isFinite(diff) || diff === 0 ? "rgba(255,255,255,0.75)" : better ? POS : NEG;

  // Wide: the three bands sit side by side — team, the gap, team.
  if (mobile) {
    return (
      <Flex flex={1} minH={0} minW={0} h="100%">
        <Band wide transition="push" baseMs={6000} count={n} cycle={top} flex={0.8} onTick={() => setTop((v) => (v + 1) % n)}>
          <Flex flex={1} align="center" justify="center"><WideLogo team={a.identity} size="2.5rem" /></Flex>
        </Band>
        <Band wide divider transition="flip" baseMs={9000} flex={1.4} count={MATCHUP_TILE_STATS.length} cycle={stat} onTick={() => setStat((v) => (v + 1) % MATCHUP_TILE_STATS.length)}>
          <Flex direction="column" flex={1} align="center" justify="center" gap="0.3rem" minW={0} px="0.3rem">
            <WideNum key={`${a.identity.id}-${b.identity.id}-${st.key}`} className="ta-tile-val" color={tone} size="1.7rem">{fmtDiff(diff, unit)}</WideNum>
            <WideLabel textAlign="center">{st.label}</WideLabel>
          </Flex>
        </Band>
        <Band wide divider transition="cube" baseMs={7500} count={n} cycle={bottom} flex={0.8} onTick={() => setBottom((v) => (v + 1) % n)}>
          <Flex flex={1} align="center" justify="center"><WideLogo team={b.identity} size="2.5rem" /></Flex>
        </Band>
      </Flex>
    );
  }

  return (
    <Flex direction="column" flex={1} minH={0} minW={0}>
      <Band transition="push" baseMs={6000} count={n} cycle={top} onTick={() => setTop((v) => (v + 1) % n)}>
        <TeamFace team={a} side="top" />
      </Band>

      <Band
        transition="flip" baseMs={9000} flex={1.15} divider
        count={MATCHUP_TILE_STATS.length} cycle={stat}
        onTick={() => setStat((v) => (v + 1) % MATCHUP_TILE_STATS.length)}
      >
        <Flex direction="column" flex={1} minH={0} align="center" justify="center" textAlign="center" px="1cqmin">
          <Text
            key={`${a.identity.id}-${b.identity.id}-${st.key}`}
            className="ta-tile-val"
            fontSize={hfs(10.5)} fontWeight="black" fontStyle="italic" color={tone}
            lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1}
          >
            {fmtDiff(diff, unit)}
          </Text>
          <Context mt="1cqmin" color="rgba(255,255,255,0.7)" textAlign="center">{st.label}{mobile ? "" : " diff"}</Context>
        </Flex>
      </Band>

      <Band transition="cube" baseMs={7500} divider count={n} cycle={bottom} onTick={() => setBottom((v) => (v + 1) % n)}>
        <TeamFace team={b} side="bottom" />
      </Band>
    </Flex>
  );
};

// ── Rating Lab — what wins games ─────────────────────────────────────────────
// Same template as Leader Board minus the team: a big rotating number and the
// stat under it. The number is the metric's correlation with winning, so the
// tile is the tab's whole premise at a glance — green pulls wins, red costs
// them. No logo behind it; this slide is about the league, not a team.

const LabBody = ({ hub }) => {
  const mobile = useContext(TileMobile);
  const levers = useMemo(
    () => (hub.levers ?? []).filter((l) => l.abs >= 0.25).slice(0, 6),
    [hub.levers],
  );
  const [i, setI] = useState(0);
  if (!levers.length) return <Empty>No levers on file</Empty>;
  const lever = levers[i % levers.length];
  return (
    <Body
      cycle={i}
      live={levers.length > 1}
      top={
        <>
          <Rotator count={levers.length} onTick={() => setI((v) => (v + 1) % levers.length)} />
          <TileTitle>What Wins</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow gap="0.8rem">
          <WideNum color={lever.r >= 0 ? POS : NEG} size="2.2rem">{fmtSigned(lever.r, 2)}</WideNum>
          <Flex direction="column" gap="0.4rem" flex={1} minW={0}>
            <WideLabel color="white">{lever.short ?? lever.label}</WideLabel>
            <Box h="0.4rem" bg="whiteAlpha.100">
              <Box h="100%" w={`${Math.min(1, Math.abs(lever.r)) * 100}%`} bg={lever.r >= 0 ? POS : NEG} />
            </Box>
          </Flex>
        </WideRow>
      ) : (
      <Flex direction="column" align="center" justify="center" flex={1} minH="36cqmin" minW={0} textAlign="center">
        <Text
          fontSize={hfs(14)} fontWeight="black" fontStyle="italic" color={lever.r >= 0 ? POS : NEG}
          lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1}
        >
          {fmtSigned(lever.r, 2)}
        </Text>
        <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{mobile ? lever.short ?? lever.label : lever.label ?? lever.short}</Context>
      </Flex>
      )}
    </Body>
  );
};

// ── Trends — a team, a stat, the line ────────────────────────────────────────
// Four slides drawn fresh on every load: four random teams paired with four
// random stats, each showing that team's line across every season we hold.
// The line is real — the hub carries six seasons of every one of these — so
// the shape is the team's actual arc, not decoration.

const TREND_TILE_STATS = [
  { key: "rating", label: "Team Rating", unit: "num", signed: true },
  { key: "o_rushing.successRate", label: "Rush Success", unit: "pct" },
  { key: "o_rushing.opportunityRate", label: "Opportunity Rate", unit: "pct" },
  { key: "o_passing.ypa", label: "Yards / Attempt", unit: "num" },
  { key: "o_passing.explosiveRate", label: "Explosive Rate", unit: "pct" },
  { key: "d_rushing.successRate", label: "Rush Success Allowed", unit: "pct" },
  { key: "d_passing.completionRate", label: "Completion Allowed", unit: "pct" },
  { key: "d_passing.pressureRate", label: "Pressure Rate", unit: "pct" },
];
const TREND_TILE_SLIDES = 4;

const readTrend = (row, key) => (key === "rating" ? row?.rating : row?.metrics?.[key]);

// A shuffled draw of n, without repeats.
const drawSome = (list, n) => {
  const pool = [...list];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
};

const Sparkline = ({ points, color }) => {
  if (points.length < 2) return null;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = hi - lo || 1;
  const xy = points.map((v, i) => [(i / (points.length - 1)) * 100, 26 - ((v - lo) / span) * 22]);
  const line = xy.map(([x, y]) => `${x},${y}`).join(" ");
  const last = xy[xy.length - 1];
  return (
    <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {xy.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" fill={color} opacity={0.55} vectorEffect="non-scaling-stroke" />
      ))}
      <circle cx={last[0]} cy={last[1]} r="2.1" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const TrendsBody = ({ hub }) => {
  const mobile = useContext(TileMobile);
  // Random on load: four team-and-stat pairings, each with a full line.
  const slides = useMemo(() => {
    const seasons = (hub.seasons ?? []).slice().sort((a, b) => a - b);
    const teams = Object.values(hub.teams ?? {});
    return drawSome(teams, TREND_TILE_SLIDES)
      .map((team, i) => {
        const stat = drawSome(TREND_TILE_STATS, TREND_TILE_SLIDES)[i % TREND_TILE_SLIDES];
        const points = seasons
          .map((y) => readTrend(team.seasons?.[y], stat.key))
          .filter((v) => Number.isFinite(v));
        return points.length >= 2 ? { team, stat, points } : null;
      })
      .filter(Boolean);
  }, [hub.teams, hub.seasons]);

  const [i, setI] = useState(0);
  if (!slides.length) return <Empty>Not enough seasons</Empty>;
  const { team, stat, points } = slides[i % slides.length];
  const latest = points[points.length - 1];
  // Black primaries vanish as a line on a dark tile; swap to the secondary.
  const color = readableTeamColor(team.identity, "#141416", BRAND);

  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={
        <>
          <Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />
          <TileTitle>Trends</TileTitle>
        </>
      }
    >
      {mobile ? (
        <WideRow gap="0.6rem"><WideLogo team={team.identity} size="2.3rem" /><WideStat value={stat.signed ? fmtSigned(latest, 2) : fmtMetric(latest, stat.unit)} label={stat.label} size="1.7rem" /><Box flex={1} minW="3rem" h="2.4rem"><Sparkline points={points} color={color} /></Box></WideRow>
      ) : (
      <Box position="relative" flex={1} minH="36cqmin" minW={0}>
        <Flex position="absolute" inset={0} align="center" justify="center" opacity={0.2} pointerEvents="none">
          <Mark logo={team.identity.logo} label={team.identity.short} size={46} />
        </Flex>
        <Flex position="relative" direction="column" align="center" justify="center" h="100%" minW={0} textAlign="center">
          <Text fontSize={hfs(13)} fontWeight="black" fontStyle="italic" color="white" lineHeight={0.9} letterSpacing="-0.05em" fontVariantNumeric="tabular-nums" lineClamp={1} textShadow="0 0 2cqmin rgba(0,0,0,0.8)">
            {stat.signed ? fmtSigned(latest, 2) : fmtMetric(latest, stat.unit)}
          </Text>
          <Context mt="1cqmin" color="rgba(255,255,255,0.8)" textAlign="center">{stat.label}</Context>
          <Box w="100%" h="10cqmin" mt="1.6cqmin" px="1cqmin">
            <Sparkline points={points} color={color} />
          </Box>
        </Flex>
      </Box>
      )}
    </Body>
  );
};

// ── Glossary — the six ideas the rest of the hub is built on ─────────────────
// The other seven tiles sell a number you absorb in half a second. This one is
// asking you to learn something, so it gets a beat of its own: each term runs
// as TWO slides — the word, then the arithmetic — and each face owns the whole
// tile rather than splitting it.
//
// That split is the whole point. `cqmin` here resolves against the strip's
// short side, so body copy set at the 2.4cqmin the other tiles use lands near
// 6px and is decoration, not text. Giving the formula its own slide buys it
// 6cqmin and makes it readable. Wording and math both come from the glossary
// object the tab and every tooltip read, so there is one definition on the site.

const TILE_TERMS = [
  "Expected Points Added",
  "Success Rate",
  "Havoc Rate",
  "OL Line Yards",
  "Highlight Yards",
  "Stuffed Run",
];

const MathLine = ({ children, size }) => (
  <Text fontSize={tfs(size)} fontWeight="bold" color="rgba(255,255,255,0.9)" lineHeight={1.25} textAlign="center">
    {children}
  </Text>
);

// A ratio is drawn as one: numerator over a rule over denominator. Anything
// that is not a ratio is a single condition line, set larger.
const Formula = ({ math }) => {
  if (!math) return null;
  if (math.expr) return <MathLine size={6.4}>{math.expr}</MathLine>;
  return (
    <Box>
      <MathLine size={5.6}>{math.num}</MathLine>
      <Box h="1px" bg="rgba(255,255,255,0.45)" my="1.6cqmin" />
      <MathLine size={5.6}>{math.den}</MathLine>
    </Box>
  );
};

const GlossaryBody = () => {
  // Two slides per term — the word, then its math. A term with no math on file
  // simply does not get a second slide. Mobile shows the word only.
  const mobile = useContext(TileMobile);
  const slides = useMemo(
    () =>
      TILE_TERMS.map(glossaryEntry)
        .filter(Boolean)
        .flatMap((t) => (t.math && !mobile ? [{ t, math: false }, { t, math: true }] : [{ t, math: false }])),
    [mobile],
  );
  const [i, setI] = useState(0);
  const slide = slides[i % Math.max(1, slides.length)];
  if (!slide) return <Empty>No glossary</Empty>;
  const { t, math } = slide;
  return (
    <Body
      cycle={i}
      live={slides.length > 1}
      top={<Rotator count={slides.length} onTick={() => setI((v) => (v + 1) % slides.length)} />}
      // On a math slide the footer names the term the formula belongs to, so a
      // glance that lands mid-pair is not looking at an orphan fraction.
      tease={
        mobile ? null : math ? (
          <Micro size={2.8} color="rgba(255,255,255,0.6)">{t.term}</Micro>
        ) : (
          <Micro size={2.2}>{t.family}{t.source === "gop" ? " · GOP" : ""}</Micro>
        )
      }
    >
      {mobile ? (
        <WideRow>
          <WideNum size="1.35rem" textTransform="uppercase" whiteSpace="normal" lineClamp={2} letterSpacing="-0.02em" lineHeight={0.95}>{t.term}</WideNum>
        </WideRow>
      ) : math ? (
        <Formula math={t.math} />
      ) : (
        <Hero size={9.6} fontSize={hfs(9.6, true)} fontStyle="italic" textTransform="uppercase" lineClamp={4} lineHeight={0.9}>
          {t.term}
        </Hero>
      )}
    </Body>
  );
};

// ── Strip ────────────────────────────────────────────────────────────────────

// Ids and labels are the shared list (page validation + sidebar sub-items
// read the same one); the strip only adds each tab's icon and live body.
// `rotateMs` is the tile's base clock (5–12s band); Rotator re-draws a fresh
// interval off it every cycle, so no two flips are ever the same distance
// apart. `transition` is how it moves from one slide
// to the next (the .ta-x-* set in TILE_KEYFRAMES): slide · push · flip ·
// cube · peek · fade · zoom.
const TILE_PARTS = {
  week: { icon: CalendarDays, Body: WeekBody, rotateMs: 7000, transition: "slide" },
  profile: { icon: Shield, Body: ProfileBody, rotateMs: 9000, transition: "flip" },
  board: { icon: BarChart3, Body: BoardBody, rotateMs: 5500, transition: "push" },
  map: { icon: Map, Body: MapBody, rotateMs: 10000, transition: "fade" },
  matchup: { icon: Swords, Body: MatchupBody, rotateMs: 9000, transition: "flip" },
  lab: { icon: Grid3x3, Body: LabBody, rotateMs: 6500, transition: "peek" },
  trends: { icon: TrendingUp, Body: TrendsBody, rotateMs: 8000, transition: "slide" },
  glossary: { icon: BookOpen, Body: GlossaryBody, rotateMs: 12000, transition: "zoom" },
};
const TILES = TEAM_ANALYTICS_TABS.map((t) => ({ ...t, ...TILE_PARTS[t.id] }));

// `rows`: 1 on desktop (8 across); 2 on mobile (4 across, 2 down). Each row is
// its own size container, so cqmin is one tile row's height either way and the
// tiles keep the proportions they were drawn at.
export const TeamAnalyticsTileStrip = ({ tab, onSelect, hub, review, season, teamId, teamA, teamB, rows = 1 }) => {
  const perRow = Math.ceil(TILES.length / rows);
  const chunks = Array.from({ length: rows }, (_, r) => TILES.slice(r * perRow, (r + 1) * perRow).map((t, i) => [t, r * perRow + i]));
  return (
    <Flex direction="column" h="100%" w="100%" gap={rows > 1 ? "1px" : 0} bg={rows > 1 ? "whiteAlpha.100" : undefined}>
      <style>{TILE_KEYFRAMES}</style>
      {chunks.map((chunk, r) => (
        // --ta-fit: a 6-character number fills a quarter-width tile; --ta-fit-word: an 8-letter word does.
        <Box key={r} flex={1} minH={0} w="100%" containerType="size" style={rows > 1 ? { "--ta-min": 1, "--ta-fit": 6.4, "--ta-fit-word": 4.4 } : undefined}>
          {/* Mobile: square tiles butting together, a 1px hairline between. */}
          <Grid templateColumns={`repeat(${perRow}, minmax(0, 1fr))`} gap={rows > 1 ? "1px" : "1.5cqmin"} h="100%" w="100%">
            {chunk.map(([tile, index]) => renderTile(tile, index, { tab, onSelect, hub, review, season, teamId, teamA, teamB, flush: rows > 1 }))}
          </Grid>
        </Box>
      ))}
    </Flex>
  );
};

const renderTile = ({ id, label, icon: Icon, Body: TileBody, rotateMs, transition }, index, { tab, onSelect, hub, review, season, teamId, teamA, teamB, flush = false }) => {
        const active = tab === id;
        return (
          <Flex
            key={id}
            as="button"
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={active}
            className="group ta-tile-mount"
            style={{ "--ta-rotate": `${rotateMs || DEFAULT_ROTATE_MS}ms`, "--ta-mount-delay": `${index * 70}ms` }}
            direction="column"
            minW={0}
            minH={0}
            h="100%"
            p={0}
            gap={0}
            textAlign="left"
            borderRadius={flush ? 0 : "lg"}
            border={flush ? "none" : "1px solid"}
            borderColor={active ? BRAND : "whiteAlpha.100"}
            bg={active ? `linear-gradient(180deg, ${BRAND}33 0%, rgba(20,20,22,0.96) 55%, #141416 100%)` : "#141416"}
            boxShadow={active ? `inset 0 0 0 1px ${BRAND}66, 0 12px 30px rgba(0,0,0,0.35)` : "none"}
            position="relative"
            overflow="hidden"
            transition="border-color 0.15s, background 0.15s"
          >
            <Box position="absolute" right="-4cqmin" top="-2cqmin" w="20cqmin" h="20cqmin" opacity={active ? 0.12 : 0.05} pointerEvents="none" color={active ? BRAND : "white"}>
              <Icon size="100%" strokeWidth={1.5} />
            </Box>

            <Flex direction="column" flex={1} minH={0} position="relative" zIndex={1} p="3cqmin" pb="2cqmin">
              <TileMobile.Provider value={flush}>
                <TileConfig.Provider value={{ rotateMs: rotateMs || DEFAULT_ROTATE_MS, transition: transition ?? "slide" }}>
                  <TileBody hub={hub} review={review} season={season} teamId={teamId} teamA={teamA} teamB={teamB} />
                </TileConfig.Provider>
              </TileMobile.Provider>
            </Flex>

            {/* The tab IS the tile's footer: edge to edge, square corners,
                no inset. Icon, big label with its "Viewing / Open tab"
                caption stacked under it, and the arrow that says "open it".
                Active = solid brand; idle = dark bar that lifts on hover. */}
            <Flex
              align="center"
              gap="2cqmin"
              flexShrink={0}
              position="relative"
              zIndex={1}
              w="100%"
              px="3cqmin"
              py="3.75cqmin"
              borderTop="1px solid"
              borderColor={active ? "transparent" : "whiteAlpha.100"}
              bg={active ? BRAND : "rgba(255,255,255,0.06)"}
              color="white"
              transition="background 0.15s"
            >
              <Box w="6cqmin" h="6cqmin" flexShrink={0} color={active ? "white" : BRAND}><Icon size="100%" strokeWidth={2.5} /></Box>
              <Flex direction="column" gap="1.2cqmin" flex={1} minW={0}>
                <Text fontSize={tfs(5.2)} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em" lineHeight={0.95} lineClamp={2}>
                  {label}
                </Text>
                {!flush && (
                  <Text fontSize={tfs(2.4)} fontWeight="black" color={active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"} textTransform="uppercase" letterSpacing="0.16em" lineHeight={1}>
                    {active ? "Viewing" : "Open tab"}
                  </Text>
                )}
              </Flex>
              {!flush && (
                <Box w="5cqmin" h="5cqmin" flexShrink={0} opacity={active ? 1 : 0.7}>
                  <ArrowRight size="100%" strokeWidth={2.8} />
                </Box>
              )}
            </Flex>
          </Flex>
        );
};

// ── Mobile: one bar + bottom sheet ───────────────────────────────────────────
// The active tab's live face on the left, its name and a chevron on the right.
// Tapping anywhere opens the sheet of all eight tabs. The face is its own size
// container; --ta-fit / --ta-fit-word cap the big number and the glossary word
// to the face's width.
const BAR_FACE_VARS = { "--ta-min": 1, "--ta-fit": 26, "--ta-fit-word": 13 };

export const TeamAnalyticsTabBar = ({ tab, onSelect, hub, review, season, teamId, teamA, teamB }) => {
  const [open, setOpen] = useState(false);
  const tile = TILES.find((t) => t.id === tab) ?? TILES[0];
  const { icon: Icon, Body: TileBody } = tile;
  return (
    <>
      <style>{TILE_KEYFRAMES}</style>
      <Flex as="button" type="button" onClick={() => setOpen(true)} w="100%" h="100%" textAlign="left" bg="#141416" overflow="hidden">
        <Box flex={1} minW={0} h="100%" containerType="size" position="relative" style={BAR_FACE_VARS}>
          <Flex key={tile.id} direction="column" h="100%" px="0.75rem" py="0.35rem" className="ta-tile-mount">
            <TileMobile.Provider value>
              <TileConfig.Provider value={{ rotateMs: tile.rotateMs || DEFAULT_ROTATE_MS, transition: tile.transition ?? "slide" }}>
                <TileBody hub={hub} review={review} season={season} teamId={teamId} teamA={teamA} teamB={teamB} />
              </TileConfig.Provider>
            </TileMobile.Provider>
          </Flex>
        </Box>

        <Flex align="center" justify="space-between" gap="0.5rem" w="8.5rem" flexShrink={0} h="100%" px="0.75rem" bg={`linear-gradient(160deg, ${BRAND} 0%, #6B21A8 100%)`} position="relative" overflow="hidden">
          <Box position="absolute" right="-0.8rem" top="50%" w="4.5rem" h="4.5rem" opacity={0.18} pointerEvents="none" color="white" style={{ transform: "translateY(-50%)" }}>
            <Icon size="100%" strokeWidth={1.5} />
          </Box>
          <Text position="relative" fontSize="1.05rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={0.95} lineClamp={2}>
            {tile.label}
          </Text>
          <Flex position="relative" w="2rem" h="2rem" flexShrink={0} align="center" justify="center" bg="blackAlpha.400">
            <ChevronDown size="1.3rem" color="white" strokeWidth={3} />
          </Flex>
        </Flex>
      </Flex>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Team Analytics">
        <Flex direction="column">
          {TILES.map(({ id, label, icon: RowIcon }) => {
            const active = id === tab;
            return (
              <Flex
                key={id}
                as="button"
                type="button"
                onClick={() => { onSelect(id); setOpen(false); }}
                align="center"
                gap="0.85rem"
                w="100%"
                px="1rem"
                py="0.95rem"
                textAlign="left"
                bg={active ? `${BRAND}33` : "transparent"}
                borderLeft="4px solid"
                borderColor={active ? BRAND : "transparent"}
                borderBottom="1px solid"
                borderBottomColor="whiteAlpha.100"
              >
                <Box w="1.3rem" h="1.3rem" flexShrink={0} color={active ? "white" : BRAND}><RowIcon size="100%" strokeWidth={2.5} /></Box>
                <Text flex={1} fontSize="1rem" fontWeight="black" color={active ? "white" : "whiteAlpha.800"} textTransform="uppercase" letterSpacing="0.04em">
                  {label}
                </Text>
                {active && <Box w="0.5rem" h="0.5rem" borderRadius="full" bg={BRAND} />}
              </Flex>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};

export default TeamAnalyticsTileStrip;
