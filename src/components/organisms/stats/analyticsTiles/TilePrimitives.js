// Tile typography uses cqmin with rem floors only in mobile contexts.
// Shared context instances and animation events must remain common to every tile.
import { createContext, useContext, useState, useRef } from "react";
import { Text, Box, Image, Flex } from "@chakra-ui/react";

const remFloor = (n) => (n <= 3 ? 0.62 : n <= 5.5 ? 0.78 : +(n * 0.15).toFixed(2));

export const tfs = (n) => `max(${n}cqmin, calc(var(--ta-min, 0) * ${remFloor(n)}rem))`;

export const hfs = (n, fit) => `min(max(${n}cqmin, calc(var(--ta-min, 0) * ${+(n * 0.18).toFixed(2)}rem)), calc(var(${fit ? "--ta-fit-word" : "--ta-fit"}, 100) * 1cqw))`;

export const TileMobile = createContext(false);

export const TileTitle = ({ children }) => {
  const mobile = useContext(TileMobile);
  if (mobile) return null;
  return (
    <Text fontSize={tfs(6.5)} fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={0.9} letterSpacing="-0.03em" lineClamp={1} textAlign="center">
      {children}
    </Text>
  );
};

export const DEFAULT_ROTATE_MS = 5000;

const SLIDE_MS = 650;

export const TileConfig = createContext({ rotateMs: DEFAULT_ROTATE_MS, transition: "slide" });

export const BRAND = "#A855F7";

export const POS = "#68D391";

export const NEG = "#FC8181";

export const TILE_KEYFRAMES = `
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

export const fmtSigned = (v, d = 1) => (Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(d)}` : "—");

const ROTATE_MIN_MS = 5000;

const ROTATE_MAX_MS = 12000;

const jitteredMs = (base, n) => {
  const x = Math.abs(Math.sin((base + 1) * 0.0007 + n * 12.9898) * 43758.5453);
  const t = x - Math.floor(x);
  return Math.round(ROTATE_MIN_MS + t * (ROTATE_MAX_MS - ROTATE_MIN_MS));
};

export const Rotator = ({ count, onTick, baseMs }) => {
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

const markSize = (size) => `max(${size}cqmin, calc(var(--ta-min, 0) * ${+(size * 0.13).toFixed(2)}rem))`;

export const Mark = ({ logo, label, size = 7 }) =>
  logo ? (
    <Image src={logo} alt="" w={markSize(size)} h={markSize(size)} objectFit="contain" flexShrink={0} />
  ) : (
    <Flex w={markSize(size)} h={markSize(size)} align="center" justify="center" borderRadius="sm" bg="whiteAlpha.100" flexShrink={0}>
      <Text fontSize={tfs(size * 0.34)} fontWeight="black" color="whiteAlpha.700" lineClamp={1}>{String(label ?? "?").slice(0, 3).toUpperCase()}</Text>
    </Flex>
  );

export const Micro = ({ children, color = "rgba(255,255,255,0.45)", size = 2.4, ...rest }) => (
  <Text fontSize={tfs(size)} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.25} lineClamp={2} {...rest}>
    {children}
  </Text>
);

export const Hero = ({ children, color = "white", size = 11, ...rest }) => (
  <Text fontSize={tfs(size)} fontWeight="black" color={color} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const Context = ({ children, color = "rgba(255,255,255,0.8)", ...rest }) => {
  const mobile = useContext(TileMobile);
  return (
    <Text fontSize={tfs(3)} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.15} lineClamp={mobile ? 1 : 2} {...rest}>
      {children}
    </Text>
  );
};

export const SlideStage = ({ cycle, children }) => {
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

export const Body = ({ top = null, children, tease, cycle = 0, live = false }) => {
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

export const WideRow = ({ children, gap = "0.7rem", ...rest }) => (
  <Flex align="center" gap={gap} h="100%" w="100%" minW={0} {...rest}>{children}</Flex>
);

export const WideLogo = ({ team, size = "2.6rem", dim = false }) =>
  team?.logo ? (
    <Image src={team.logo} alt="" w={size} h={size} objectFit="contain" flexShrink={0} opacity={dim ? 0.55 : 1} />
  ) : (
    <Flex w={size} h={size} flexShrink={0} align="center" justify="center" bg="whiteAlpha.100">
      <Text fontSize="0.7rem" fontWeight="black" color="whiteAlpha.700">{String(team?.short ?? "?").slice(0, 4).toUpperCase()}</Text>
    </Flex>
  );

export const WideNum = ({ children, color = "white", size = "2rem", ...rest }) => (
  <Text fontSize={size} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" whiteSpace="nowrap" {...rest}>
    {children}
  </Text>
);

export const WideLabel = ({ children, color = "rgba(255,255,255,0.75)", ...rest }) => (
  <Text fontSize="0.72rem" fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.1} lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const WideStat = ({ value, label, color, size }) => (
  <Flex direction="column" gap="0.3rem" minW={0}>
    <WideNum color={color} size={size}>{value}</WideNum>
    {label && <WideLabel>{label}</WideLabel>}
  </Flex>
);

export const Empty = ({ children = "No data" }) => (
  <Flex flex={1} align="center" justify="center">
    <Micro color="rgba(255,255,255,0.3)">{children}</Micro>
  </Flex>
);

export const fmtMetric = (v, unit) => (!Number.isFinite(v) ? "—" : unit === "pct" ? `${(v * 100).toFixed(1)}%` : v.toFixed(2));
