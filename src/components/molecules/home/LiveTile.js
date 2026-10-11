import { createContext, useContext, useRef, useState } from "react";
import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// LIVE TILE — one Windows-8-style tile for the home hero.
//
// Same vocabulary as TeamAnalyticsTileStrip: the tile is a size container (so
// everything inside is cqmin), faces rotate on a CSS-driven timer (an
// invisible looping animation fires onAnimationIteration — no useEffect, no
// setInterval), and each change plays as a real slide/flip/push transition
// with the outgoing face held as a snapshot for one animation.
//
// The tile is a link: the whole surface opens its section, and the footer bar
// names it. Faces are plain React nodes the caller builds.
// ─────────────────────────────────────────────────────────────────────────────

export const TILE_BRAND = "#A855F7";
const SLIDE_MS = 650;
const ROTATE_MIN_MS = 5000;
const ROTATE_MAX_MS = 12000;

const TILE_CSS = `
  @keyframes hlSlideOut { from { transform: translateY(0); opacity: 1; } to { transform: translateY(-100%); opacity: 0; } }
  @keyframes hlSlideIn  { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes hlPushOut  { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
  @keyframes hlPushIn   { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes hlFlipOut  { from { transform: rotateX(0); opacity: 1; } 50%, to { transform: rotateX(90deg); opacity: 0; } }
  @keyframes hlFlipIn   { from, 50% { transform: rotateX(-90deg); opacity: 0; } to { transform: rotateX(0); opacity: 1; } }
  @keyframes hlCubeOut  { from { transform: translateX(0) rotateY(0); opacity: 1; } to { transform: translateX(-60%) rotateY(-90deg); opacity: 0; } }
  @keyframes hlCubeIn   { from { transform: translateX(60%) rotateY(90deg); opacity: 0; } to { transform: translateX(0) rotateY(0); opacity: 1; } }
  @keyframes hlTurnOut  { from { transform: rotateY(0); opacity: 1; } to { transform: rotateY(-80deg); opacity: 0; } }
  @keyframes hlTurnIn   { from { transform: rotateY(80deg); opacity: 0; } to { transform: rotateY(0); opacity: 1; } }
  @keyframes hlPeekOut  { from, to { transform: none; opacity: 1; } }
  @keyframes hlPeekIn   { from { transform: translateY(100%); } to { transform: translateY(0); } }
  @keyframes hlZoomOut  { from { transform: scale(1); opacity: 1; } to { transform: scale(0.8); opacity: 0; } }
  @keyframes hlZoomIn   { from { transform: scale(1.2); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes hlFadeOut  { from { opacity: 1; } to { opacity: 0; } }
  @keyframes hlFadeIn   { from { opacity: 0; } to { opacity: 1; } }
  @keyframes hlTick     { 0%, 100% { opacity: 1; } }
  @keyframes hlPulse    { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.7); } }
  @keyframes hlMount    { from { opacity: 0; transform: translateY(1.2em); } to { opacity: 1; transform: none; } }

  .hl-stage { position: relative; perspective: 80cqmin; }
  .hl-layer { backface-visibility: hidden; transform-origin: center center; }
  .hl-prev  { position: absolute; inset: 0; pointer-events: none; }
  .hl-x-slide-out { animation: hlSlideOut ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .hl-x-slide-in  { animation: hlSlideIn ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .hl-x-push-out  { animation: hlPushOut ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .hl-x-push-in   { animation: hlPushIn ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .hl-x-flip-out  { animation: hlFlipOut ${SLIDE_MS}ms ease-in both; }
  .hl-x-flip-in   { animation: hlFlipIn ${SLIDE_MS}ms ease-out both; }
  .hl-x-cube-out  { transform-origin: right center; animation: hlCubeOut ${SLIDE_MS}ms ease-in-out both; }
  .hl-x-cube-in   { transform-origin: left center; animation: hlCubeIn ${SLIDE_MS}ms ease-in-out both; }
  .hl-x-turn-out  { transform-origin: left center; animation: hlTurnOut ${SLIDE_MS}ms ease-in both; }
  .hl-x-turn-in   { transform-origin: left center; animation: hlTurnIn ${SLIDE_MS}ms ease-out both; }
  .hl-x-peek-out  { animation: hlPeekOut ${SLIDE_MS}ms linear both; }
  .hl-x-peek-in   { animation: hlPeekIn ${SLIDE_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  .hl-x-zoom-out  { animation: hlZoomOut ${SLIDE_MS}ms ease-in both; }
  .hl-x-zoom-in   { animation: hlZoomIn ${SLIDE_MS}ms ease-out both; }
  .hl-x-fade-out  { animation: hlFadeOut ${SLIDE_MS}ms ease both; }
  .hl-x-fade-in   { animation: hlFadeIn ${SLIDE_MS}ms ease both; }
  .hl-tick  { animation: hlTick var(--hl-rotate, 7000ms) linear infinite; }
  .hl-pulse { animation: hlPulse 1.6s ease-in-out infinite; }
  .hl-mount { animation: hlMount 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--hl-mount-delay, 0ms); }
  @media (prefers-reduced-motion: reduce) {
    [class*="hl-x-"], .hl-pulse, .hl-mount { animation: none !important; }
    .hl-prev { display: none; }
  }
`;

// Never the same clock twice: a fresh interval in the 5–12s band each cycle,
// seeded off the tile's base so the four tiles stay out of phase.
const jitteredMs = (base, n) => {
  const x = Math.abs(Math.sin((base + 1) * 0.0007 + n * 12.9898) * 43758.5453);
  return Math.round(ROTATE_MIN_MS + (x - Math.floor(x)) * (ROTATE_MAX_MS - ROTATE_MIN_MS));
};

// "random" picks a different effect each rotation, deterministic off the tile
// seed and rotation count so it never repeats back to back.
const EFFECTS = ["slide", "push", "flip", "cube", "turn", "peek", "zoom", "fade"];
const effectFor = (seed, n) => {
  const pick = (k) => {
    const x = Math.abs(Math.sin((seed + 1) * 0.0013 + k * 7.31) * 43758.5453);
    return Math.floor((x - Math.floor(x)) * EFFECTS.length);
  };
  const now = pick(n);
  return EFFECTS[n > 0 && now === pick(n - 1) ? (now + 1) % EFFECTS.length : now];
};

const Stage = ({ cycle, transition, children }) => {
  const latest = useRef(children);
  const [stage, setStage] = useState({ cycle, prev: null, prevCycle: null });
  if (stage.cycle !== cycle) {
    setStage({ cycle, prev: latest.current, prevCycle: stage.cycle });
  }
  latest.current = children;
  const animate = stage.prev != null;
  return (
    <Box className="hl-stage" minW={0} flex={1} minH={0} display="flex" flexDirection="column" overflow={["flip", "cube", "turn"].includes(transition) ? "visible" : "hidden"}>
      <Flex key={`in-${cycle}`} className={`hl-layer ${animate ? `hl-x-${transition}-in` : ""}`} minW={0} flex={1} minH={0} direction="column" justify="center" position="relative" zIndex={transition === "peek" ? 2 : 1}>
        {children}
      </Flex>
      {animate && (
        <Flex
          key={`out-${stage.prevCycle}`}
          className={`hl-layer hl-prev hl-x-${transition}-out`}
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

// ── Variant ──────────────────────────────────────────────────────────────────
// The parent (HomeHero) picks the variant; faces read it to shorten names.
// "mobile" also scales the shared type atoms up through CSS vars.
const TileVariantContext = createContext("standard");
export const useTileVariant = () => useContext(TileVariantContext);

// Mobile naming: last name only (suffixes kept off).
const SUFFIX = /^(jr\.?|sr\.?|ii|iii|iv|v)$/i;
export const lastName = (full) => {
  const parts = String(full ?? "").trim().split(/\s+/).filter((p) => !SUFFIX.test(p));
  return parts.length ? parts[parts.length - 1] : String(full ?? "");
};

// ── Atoms the face builders share (all cqmin = the tile's shorter side) ──────

export const Micro = ({ children, color = "rgba(255,255,255,0.5)", size = 2.8, ...rest }) => (
  <Text fontSize={`calc(${size}cqmin * var(--hl-boost-micro, 1))`} fontWeight="black" color={color} textTransform="uppercase" letterSpacing="0.14em" lineHeight={1.25} lineClamp={2} {...rest}>
    {children}
  </Text>
);

export const BigNumber = ({ children, color = "white", size = 14, ...rest }) => (
  <Text fontSize={`calc(${size}cqmin * var(--hl-boost-big, 1))`} fontWeight="black" fontStyle="italic" color={color} lineHeight={0.9} letterSpacing="-0.04em" fontVariantNumeric="tabular-nums" lineClamp={1} {...rest}>
    {children}
  </Text>
);

export const Headline = ({ children, color = "white", size = 5, lines = 3, ...rest }) => (
  <Text fontSize={`calc(${size}cqmin * var(--hl-boost-head, 1))`} fontWeight="black" fontStyle="italic" color={color} textTransform="uppercase" letterSpacing="-0.02em" lineHeight={1.02} lineClamp={lines} {...rest}>
    {children}
  </Text>
);

export const Mark = ({ logo, label, size = 10 }) =>
  logo ? (
    <Image src={logo} alt="" w={`${size}cqmin`} h={`${size}cqmin`} objectFit="contain" flexShrink={0} />
  ) : (
    <Flex w={`${size}cqmin`} h={`${size}cqmin`} align="center" justify="center" borderRadius="md" bg="whiteAlpha.100" flexShrink={0}>
      <Text fontSize={`${size * 0.34}cqmin`} fontWeight="black" color="whiteAlpha.700">{String(label ?? "?").slice(0, 3).toUpperCase()}</Text>
    </Flex>
  );

// ── The tile ─────────────────────────────────────────────────────────────────

export const TileStyles = () => <style>{TILE_CSS}</style>;

const LiveTile = ({ href, hrefs, faces, rotateMs = 7000, transition = "slide", mountDelay = 0, accent = TILE_BRAND, variant = "standard", onClick }) => {
  const mobile = variant === "mobile";
  const [n, setN] = useState(0);
  const count = faces.length;
  const cycle = count ? n % count : 0;

  return (
    <Box
      as={Link}
      to={hrefs?.[cycle] ?? href}
      onClick={onClick}
      className="hl-mount"
      style={{
        "--hl-mount-delay": `${mountDelay}ms`,
        "--hl-pad": mobile ? "3cqmin" : "5cqmin",
        ...(mobile ? { "--hl-boost-micro": 1.45, "--hl-boost-head": 1.2, "--hl-boost-big": 1.1 } : null),
      }}
      display="flex"
      flexDirection="column"
      containerType="size"
      minW={0}
      minH={0}
      borderRadius={mobile ? "0" : "xl"}
      border={mobile ? "none" : "1px solid"}
      borderBottom="1px solid"
      borderRight="1px solid"
      borderColor="whiteAlpha.200"
      overflow="hidden"
      position="relative"
      bg="#141416"
      boxShadow={mobile ? "none" : "0 18px 40px rgba(0,0,0,0.35)"}
      transition="border-color 0.15s, transform 0.2s"
      _hover={mobile ? { textDecoration: "none" } : { borderColor: accent, transform: "translateY(-2px)", textDecoration: "none" }}
      _focusVisible={{ outline: "2px solid", outlineColor: accent, outlineOffset: "2px" }}
    >
      {count > 1 && (
        <Box
          key={n}
          className="hl-tick"
          w={0}
          h={0}
          overflow="hidden"
          style={{ "--hl-rotate": `${jitteredMs(rotateMs, n)}ms` }}
          onAnimationIteration={() => setN((v) => v + 1)}
        />
      )}

      <Flex direction="column" flex={1} minH={0} position="relative" zIndex={1} p="var(--hl-pad)">
        {count > 1 && <Box className="hl-pulse" position="absolute" top="4cqmin" right="4cqmin" w="1.8cqmin" h="1.8cqmin" borderRadius="full" bg={accent} />}
        <TileVariantContext.Provider value={variant}>
          <Stage cycle={cycle} transition={transition === "random" ? effectFor(rotateMs, n) : transition}>{faces[cycle]}</Stage>
        </TileVariantContext.Provider>
      </Flex>

    </Box>
  );
};

export default LiveTile;
