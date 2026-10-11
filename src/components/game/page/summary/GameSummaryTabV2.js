/**
 * GameSummaryTabV2 — Editorial Magazine Game Summary
 *
 * PHILOSOPHY:
 *   This is a data-driven magazine, not a dashboard.
 *   Every card tells a story. Every surface has depth.
 *   Team colors bleed through. Ghost words float behind.
 *   Italic headlines scream. Micro labels whisper.
 *
 * DESIGN VOCABULARY APPLIED:
 *   - schoolbanner: editorial headers with ghost words
 *   - watermark: oversized low-opacity background marks
 *   - team gradient: horizontal/diagonal team-branded strips
 *   - cool: sleek dark sports-interface details
 */

import { useMemo, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Text,
  Image,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { SectionEyebrow } from "../../../atoms/SectionEyebrow";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  // eslint-disable-next-line no-unused-vars
  LineChart,
  Line,
  XAxis,
  YAxis,
  // eslint-disable-next-line no-unused-vars
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  // eslint-disable-next-line no-unused-vars
  ReferenceDot,
  Area,
  ComposedChart,
} from "recharts";
import { GameInfoPassport } from "./GameInfoPassport";
import { ChainsMovedCard, SeriesResultsCard } from "./SeriesCards";
import { useLayoutDensity, LAYOUT_DENSITY } from "../../../../hooks/useLayoutDensity";
import PageShell from "../../../layouts/PageShell";
import teamsData from "../../../../data/teams.json";
import { splitDisplayName, buildIdentityIndex, resolveImages } from "../../../../utils/headshots";
import { teamSackYards } from "../../../../utils/gameHelpers";
import { productionEntries } from "../../../../utils/gameHelpers";
import { barPct, barRange, barSegment } from "../../../../utils/statBars";

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM META
// ═══════════════════════════════════════════════════════════════════════════════
const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  acc[t.id] = t;
  return acc;
}, {});

const getTeam = (id) => (id ? TEAM_META[id] ?? null : null);
const getTeamColor = (id, fallback = "#E53E3E") => {
  if (!id) return fallback;
  return getTeam(id)?.colors?.primary ?? fallback;
};
const getTeamLogoSrc = (id) => {
  if (!id) return "";
  return `/assets/${String(id).replace(/25$/, "")}.svg`;
};
const getTeamLabel = (id) => {
  if (!id) return "—";
  return getTeam(id)?.shortName ?? String(id).toUpperCase();
};
// eslint-disable-next-line no-unused-vars
const getTeamName = (id) => {
  if (!id) return "—";
  return getTeam(id)?.name ?? String(id).toUpperCase();
};
/** Lighten a hex color toward white by `amount` (0-1) — used to show "on defense" (washed out) vs "on offense" (true color). */
const lightenHex = (hex, amount) => {
  const h = String(hex).replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};
/**
 * Lift a team color to a legibility floor for use as TEXT on the dark card surface.
 * Lightness only — hue and saturation survive, unlike `lightenHex`, which mixes toward
 * white and turns a deep maroon pink or a navy grey.
 */
const onDark = (hex, minL = 0.55) => {
  const h = String(hex).replace("#", "");
  if (h.length !== 6) return hex;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (l >= minL) return hex;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let hue = 0;
  if (d !== 0) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  // Achromatic (black/charcoal primaries) has no hue to preserve — go to plain light gray.
  if (sat < 0.12) return "#d4d4d8";
  const c = (1 - Math.abs(2 * minL - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = minL - c / 2;
  const seg = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(hue / 60) % 6];
  return `#${seg.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
};

/** Effectively black or charcoal — no hue worth preserving, too dark to read on this tab. */
const isBlackish = (hex) => {
  const h = String(hex).replace("#", "");
  if (h.length !== 6) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return l < 0.2 && sat < 0.15;
};

/**
 * A team's accent for text and rules on this tab's dark cards.
 *
 * Three schools — Alabama State, UAPB and Grambling — run a black primary, which simply
 * disappears against the card surface. Those, and only those, fall back to their secondary,
 * which is a bright gold in all three cases. Everyone else keeps their real primary
 * untouched: lifting every dark colour to a contrast floor would repaint half the league
 * (FAMU green to a neon mint, AAMU maroon to pure red) to fix three teams.
 */
export const getTeamAccent = (id) => {
  const colors = getTeam(id)?.colors ?? {};
  const primary = colors.primary;
  if (!primary) return "#E53E3E";
  if (isBlackish(primary) && colors.secondary) return colors.secondary;
  return primary;
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
const cleanName = (nameRaw) => {
  const str = String(nameRaw ?? "");
  if (str.includes(",")) {
    const [last, first] = str.split(",");
    return `${first?.trim()} ${last?.trim()}`;
  }
  return str;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED EDITORIAL PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

/** Standard editorial label — the shared SectionEyebrow atom, kept under its
 *  local name so the cards below read unchanged. */
const SectionLabel = SectionEyebrow;

/** Team logo watermark — grayscale, oversized, partially off-canvas */
// eslint-disable-next-line no-unused-vars
const LogoWatermark = ({ teamId, side = "right", size = "17.5rem" }) => (
  <Box
    position="absolute"
    top="50%"
    left={side === "left" ? "-5%" : "auto"}
    right={side === "right" ? "-5%" : "auto"}
    transform="translateY(-50%)"
    opacity={0.1}
    pointerEvents="none"
    zIndex={0}
  >
    <Image
      src={getTeamLogoSrc(teamId)}
      h={size}
      w={size}
      objectFit="contain"
      filter="grayscale(1) brightness(1.5)"
    />
  </Box>
);

/** Card shell — flat ground, no tint. Every card on the tab sits on the same value. */
const EditorialCard = ({ children, position = "relative", overflow = "hidden", ...props }) => (
  <Box
    w="full"
    h="full"
    bg="var(--part-bg, #141416)"
    borderRadius="xl"
    position={position}
    overflow={overflow}
    {...props}
  >
    {children}
  </Box>
);

/** Hairline divider */
// eslint-disable-next-line no-unused-vars
const Hairline = ({ vertical = false, h = "0.0625rem", w = "full", opacity = 0.1 }) => (
  <Box
    h={vertical ? h : h}
    w={vertical ? "0.0625rem" : w}
    bg={`rgba(255,255,255,${opacity})`}
    flexShrink={0}
  />
);

/** Micro label — ultra-small, wide tracking */
const MicroLabel = ({ children, color = "rgba(255,255,255,0.35)" }) => (
  <Text
    fontSize="clamp(0.5rem, 0.6vw, 0.65rem)"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.2em"
    lineHeight={1.2}
  >
    {children}
  </Text>
);

/** Stat value with editorial weight */
// eslint-disable-next-line no-unused-vars
const HeroStat = ({ children, color = "white", size = "clamp(1.2rem, 1.8vw, 2rem)" }) => (
  <Text
    fontWeight="950"
    color={color}
    lineHeight={1}
    letterSpacing="-0.02em"
    style={{ fontSize: size }}
  >
    {children}
  </Text>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════
export const ANIMATION_STYLES = `
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(1.5rem); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes growBar {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 2000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes rotateTick {
    0%, 100% { opacity: 1; }
  }
  @keyframes scoreTick {
    from { opacity: 0; transform: translateY(-0.4em); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .score-tick {
    animation: scoreTick 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  @media (prefers-reduced-motion: reduce) {
    .score-tick { animation: none !important; }
  }
  @keyframes rotateSweep {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  .rotate-sweep {
    transform-origin: left center;
    transform: scaleX(0);
  }
  /* A bar crossing the screen on a loop is exactly what this setting is for — the
     rotation still runs, it just stops advertising how long is left. */
  @media (prefers-reduced-motion: reduce) {
    .rotate-sweep { animation: none !important; opacity: 0; }
  }
  .animate-slide-in {
    animation: slideInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .animate-bar {
    animation: growBar 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
    transform-origin: left center;
    transform: scaleX(0);
  }
  .animate-draw {
    stroke-dasharray: 2000;
    stroke-dashoffset: 2000;
    animation: drawLine 2.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
  }
  .animate-fade {
    animation: fadeIn 0.8s ease-out forwards;
    opacity: 0;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FIELD POSITION MARCH — Play-by-play yard line trace
// ═══════════════════════════════════════════════════════════════════════════════
// X-axis = play sequence (each play is a point)
// Y-axis = yl_abs (absolute yard line, 0-100)
// Line color = possession team
// Vertical jumps = possession changes

/** Real play-by-play field-position data — PVAMU @ JSU, 12/06/2025 (W15pvamujsu.json).
 *  Real offensive snaps only (138 of 239) — excludes drive-start markers, kickoffs-as-events,
 *  and other administrative rows that duplicated the following snap's yard line.
 *  Tuple: [quarter, clock, offenseTeam("h"|"a"), yardlineAbsolute, yardsGained, isScoring, isTurnover]
 *  yardline_absolute is offense-relative in the source data (0 = own goal, 100 = opponent goal),
 *  so "h"/"a" here map to the real home/away teams and get inverted for home in the chart transform below.
 */
const PVAMUJSU_RAW_PLAYS = [
  [1,"14:54","h",33,1,0,0],
  [1,"14:54","h",34,0,0,0],
  [1,"14:54","h",34,-1,0,0],
  [1,"13:32","a",24,1,0,0],
  [1,"13:32","a",25,2,0,0],
  [1,"13:32","a",27,19,0,0],
  [1,"13:32","a",46,3,0,0],
  [1,"13:32","a",49,4,0,0],
  [1,"13:32","a",53,13,0,0],
  [1,"13:32","a",66,2,0,0],
  [1,"13:32","a",68,2,0,0],
  [1,"13:32","a",70,2,0,0],
  [1,"08:02","a",72,-44,0,0],
  [1,"08:02","h",28,-10,0,0],
  [1,"08:02","h",18,2,0,0],
  [1,"08:02","h",20,0,0,0],
  [1,"08:02","h",20,2,0,0],
  [1,"06:06","a",51,20,0,0],
  [1,"06:06","a",71,6,0,0],
  [1,"06:06","a",77,6,0,0],
  [1,"06:06","a",83,10,0,0],
  [1,"06:06","a",93,0,0,0],
  [1,"04:22","a",93,4,1,0],
  [1,"04:22","a",97,-62,1,0],
  [1,"04:15","h",12,2,0,0],
  [1,"04:15","h",14,2,0,0],
  [1,"04:15","h",16,68,0,1],
  [1,"02:45","a",57,5,0,0],
  [1,"02:45","a",62,-6,0,0],
  [1,"02:45","a",56,6,0,0],
  [1,"00:36","h",9,8,0,0],
  [1,"00:36","h",17,8,0,0],
  [2,"15:00","h",25,20,0,0],
  [2,"15:00","h",45,15,0,0],
  [2,"15:00","h",60,4,0,0],
  [2,"15:00","h",64,5,0,0],
  [2,"15:00","h",69,0,0,0],
  [2,"13:05","h",69,1,0,0],
  [2,"13:05","h",70,0,0,0],
  [2,"13:05","h",70,1,0,0],
  [2,"11:20","h",71,26,1,0],
  [2,"11:20","h",97,-62,1,0],
  [2,"11:20","h",35,-15,0,0],
  [2,"11:12","a",36,-2,0,0],
  [2,"11:12","a",34,-10,0,0],
  [2,"11:12","a",24,5,0,0],
  [2,"11:12","a",29,66,0,0],
  [2,"11:12","a",95,-1,0,0],
  [2,"11:12","a",94,-3,0,0],
  [2,"07:27","a",91,0,0,0],
  [2,"07:20","a",91,-56,1,0],
  [2,"07:15","h",42,4,0,0],
  [2,"07:15","h",46,-15,0,0],
  [2,"07:15","h",31,15,0,0],
  [2,"07:15","h",46,-11,0,0],
  [2,"05:05","a",34,0,0,0],
  [2,"05:05","a",34,9,0,0],
  [2,"05:05","a",43,2,0,0],
  [2,"05:05","a",45,0,0,0],
  [2,"05:05","a",45,4,0,0],
  [2,"05:05","a",49,5,0,0],
  [2,"05:05","a",54,1,0,0],
  [2,"02:00","a",55,2,0,0],
  [2,"02:00","a",57,0,0,0],
  [2,"02:00","a",57,-10,0,0],
  [2,"02:00","a",47,3,0,0],
  [2,"00:53","h",12,0,0,0],
  [2,"00:53","h",12,4,0,1],
  [2,"00:25","a",84,3,0,0],
  [2,"00:19","a",87,0,0,0],
  [2,"00:19","a",87,0,0,0],
  [2,"00:07","a",87,-52,1,0],
  [3,"14:54","a",20,11,0,0],
  [3,"14:54","a",31,2,0,0],
  [3,"14:54","a",33,-3,0,0],
  [3,"14:54","a",30,45,0,0],
  [3,"14:54","a",75,0,0,0],
  [3,"14:54","a",75,1,0,0],
  [3,"14:54","a",76,-1,0,0],
  [3,"11:03","a",75,-40,1,0],
  [3,"10:58","h",26,8,0,0],
  [3,"10:58","h",34,-8,0,0],
  [3,"10:58","h",26,4,0,0],
  [3,"09:21","a",36,2,0,0],
  [3,"09:21","a",38,1,0,0],
  [3,"07:54","a",39,6,0,0],
  [3,"07:54","a",45,10,0,1],
  [3,"07:07","h",55,22,0,0],
  [3,"07:07","h",77,7,0,0],
  [3,"07:07","h",84,-1,0,0],
  [3,"07:07","h",83,-5,0,0],
  [3,"05:09","h",78,19,1,0],
  [3,"05:09","h",97,2,0,0],
  [3,"05:09","h",99,-64,1,0],
  [3,"05:02","a",25,0,0,0],
  [3,"05:02","a",25,3,0,0],
  [3,"05:02","a",28,0,0,0],
  [3,"05:02","a",28,16,0,0],
  [3,"05:02","a",44,16,0,0],
  [3,"05:02","a",60,0,0,0],
  [3,"03:21","a",60,37,1,0],
  [3,"03:21","a",97,-62,1,0],
  [3,"03:15","h",21,37,0,0],
  [3,"03:15","h",58,41,0,0],
  [3,"03:15","h",99,-1,0,0],
  [3,"01:37","h",98,-1,1,0],
  [3,"01:37","h",97,-62,1,0],
  [3,"01:37","a",25,0,0,0],
  [3,"01:37","a",25,3,0,0],
  [3,"01:37","a",28,35,0,1],
  [3,"00:53","h",37,11,0,0],
  [3,"00:53","h",48,1,0,0],
  [4,"15:00","h",49,4,0,0],
  [4,"15:00","h",53,0,0,0],
  [4,"13:54","a",4,1,0,0],
  [4,"13:54","a",5,2,0,0],
  [4,"13:54","a",7,23,0,0],
  [4,"13:54","a",30,7,0,0],
  [4,"13:54","a",37,3,0,0],
  [4,"13:54","a",40,13,0,0],
  [4,"13:54","a",53,2,0,0],
  [4,"13:54","a",55,1,0,0],
  [4,"13:54","a",56,15,0,0],
  [4,"08:23","a",71,-3,0,0],
  [4,"08:23","a",68,11,0,0],
  [4,"08:23","a",79,8,0,0],
  [4,"08:23","a",87,5,0,0],
  [4,"08:23","a",92,-1,0,0],
  [4,"08:23","a",91,5,0,0],
  [4,"08:23","a",96,0,0,0],
  [4,"08:23","a",96,-95,0,1],
  [4,"04:18","h",1,2,0,0],
  [4,"04:18","h",3,1,0,0],
  [4,"04:18","h",4,0,0,0],
  [4,"02:44","a",45,0,0,0],
  [4,"02:20","a",45,2,0,0],
  [4,"02:14","a",47,12,0,0],
  [4,"02:00","a",53,-5,0,0]
];

const generateMockPlays = (homeId, awayId) => {
  return PVAMUJSU_RAW_PLAYS.map(([quarter, clock, side, yl_abs, yards, scoring, turnover]) => ({
    base: {
      quarter,
      clock,
      offense_team: side === "h" ? (homeId || "swacjsu") : (awayId || "swacpvamu"),
      yl_abs,
    },
    state_after: { yards_gained: yards, turnover: turnover === 1 },
    scoring_event: scoring === 1,
  }));
};

/** Custom dot renderer for mid-drive big plays only — score/turnover are drive-end markers now */
const EventDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload?.eventType !== "bigplay" || cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4} fill="#fbbf24" stroke="#0a0a0a" strokeWidth="1.5" />;
};

/** Custom marker for how each drive ended: score = spike, turnover = break, other = soft stop */
const DriveEndMarker = (props) => {
  const { cx, cy, possession } = props;
  if (cx == null || cy == null || !possession) return null;
  const { endType, color } = possession;

  if (endType === "score") {
    // Upward spike/arrowhead — the drive "arrived"
    return (
      <polygon
        points={`${cx},${cy - 8} ${cx - 6},${cy + 4} ${cx + 6},${cy + 4}`}
        fill="#22c55e"
        stroke="#0a0a0a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    );
  }

  if (endType === "turnover") {
    // Break/X mark — the drive was "taken away"
    return (
      <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
        <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} />
        <line x1={cx - 5} y1={cy + 5} x2={cx + 5} y2={cy - 5} />
      </g>
    );
  }

  // Soft stop (punt / turnover on downs / end of half) — a muted hollow ring in the team's color
  return <circle cx={cx} cy={cy} r={4} fill="none" stroke={color} strokeWidth="2" opacity={0.6} />;
};

/** Custom tooltip */
const MarchTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const pt = payload[0].payload;
  const team = pt.isHome ? "Home" : "Away";
  const eventLabel =
    pt.eventType === "score" ? "🏈 SCORE" : pt.eventType === "turnover" ? "⚠ TURNOVER" : pt.eventType === "bigplay" ? "💥 BIG PLAY" : null;
  return (
    <Box bg="rgba(10,10,12,0.95)" border="0.0625rem solid rgba(255,255,255,0.1)" borderRadius="md" p={2}>
      <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase">
        {team} — {Math.round(pt.ylAbs)} yd line
      </Text>
      {eventLabel && (
        <Text fontSize="xs" fontWeight="bold" color={pt.eventType === "score" ? "#22c55e" : pt.eventType === "turnover" ? "#ef4444" : "#fbbf24"} mt={0.5}>
          {eventLabel}
        </Text>
      )}
    </Box>
  );
};

// Deferred past launch.0 — not rendered by GameSummaryTabV2 today. Kept whole so it can be
// re-slotted without a rebuild; see AFTER_LAUNCH_0.md §1 "The March".
// eslint-disable-next-line no-unused-vars
const FieldPositionMarch = ({ plays, awayId, homeId }) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  // Washed-out "on defense" variants — dark = driving, light = defending.
  const awayColorDim = lightenHex(awayColor, 0.55);
  const homeColorDim = lightenHex(homeColor, 0.55);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  // Only trust real plays if enough of them actually carry field-position data.
  const validRealPlays = useMemo(
    () => (plays || []).filter((p) => {
      const base = p.base || p;
      return base.quarter != null && base.yl_abs != null;
    }),
    [plays]
  );
  const hasRealData = validRealPlays.length > 5;
  const sourcePlays = hasRealData ? plays : generateMockPlays(homeId, awayId);

  // Build chart data: each play is a point, x = play index, y = yl_abs
  const data = useMemo(() => {
    const sorted = [...sourcePlays]
      .filter((p) => {
        const base = p.base || p;
        return base.quarter != null && base.yl_abs != null;
      })
      .sort((a, b) => {
        const ba = a.base || a;
        const bb = b.base || b;
        const qDiff = (ba.quarter ?? 1) - (bb.quarter ?? 1);
        if (qDiff !== 0) return qDiff;
        const getSecs = (c) => {
          if (!c) return 0;
          const parts = String(c).split(":");
          return Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0);
        };
        return getSecs(ba.clock) - getSecs(bb.clock);
      });

    const points = sorted.map((play, idx) => {
      const base = play.base || play;
      const offense = base.offense_team || "away";
      const isHome = offense === homeId || String(offense).includes(String(homeId).replace(/25$/, "")) || offense === "home";
      // yl_abs is offense-relative in the source data (0 = own goal, 100 = opponent goal).
      // Invert the home team's value so both teams plot on one shared physical field.
      const ylAbs = isHome ? 100 - base.yl_abs : base.yl_abs;
      const stateAfter = play.state_after || {};
      const yardsGained = stateAfter.yards_gained || 0;
      let eventType = play.eventType || null;
      if (!eventType) {
        if (play.scoring_event === true) eventType = "score";
        else if (stateAfter.turnover === true) eventType = "turnover";
        else if (yardsGained >= 20) eventType = "bigplay";
      }
      return {
        playIndex: idx,
        ylAbs,
        isHome,
        color: isHome ? homeColor : awayColor,
        eventType,
        quarter: base.quarter,
        clock: base.clock,
      };
    });

    return points;
  }, [sourcePlays, homeId, homeColor, awayColor]);

  // Group consecutive same-team plays into possession blocks — drives, with the shape data
  // needed to make the line itself communicative: who (color), how hard (weight by net
  // progress), and how it ended (score = spike, turnover = break, other = soft stop).
  const possessions = useMemo(() => {
    const blocks = [];
    let current = null;
    data.forEach((pt) => {
      if (!current || current.isHome !== pt.isHome) {
        if (current) blocks.push(current);
        current = {
          isHome: pt.isHome,
          color: pt.color,
          start: pt.playIndex,
          end: pt.playIndex,
          points: [],
        };
      } else {
        current.end = pt.playIndex;
      }
      current.points.push(pt);
    });
    if (current) blocks.push(current);

    return blocks.map((b) => {
      const netProgress = Math.abs(b.points[b.points.length - 1].ylAbs - b.points[0].ylAbs);
      const lastEvent = b.points[b.points.length - 1].eventType;
      const endType = lastEvent === "score" ? "score" : lastEvent === "turnover" ? "turnover" : "other";
      return {
        ...b,
        netProgress,
        endType,
        strokeWidth: Math.max(2, Math.min(6, 2 + netProgress / 15)),
      };
    });
  }, [data]);

  // Find quarter boundary play indices for reference lines
  const quarterBoundaries = useMemo(() => {
    const boundaries = [];
    let lastQ = null;
    data.forEach((pt, idx) => {
      if (lastQ !== null && pt.quarter !== lastQ) {
        boundaries.push({ q: pt.quarter, idx: idx - 0.5 });
      }
      lastQ = pt.quarter;
    });
    return boundaries;
  }, [data]);

  return (
    <Box
      w="full"
      h="full"
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      className="animate-slide-in"
      style={{
        animationDelay: "0.1s",
        background: "#141416",
      }}
    >
      <Box position="relative" zIndex={1} p={2} h="full" w="full" display="flex" flexDirection="column">
        {/* Header — team legend + event legend + mock badge, all in one row */}
        <Flex align="center" justify="space-between" mb={1} flexWrap="wrap" gap={2} flexShrink={0}>
          <HStack gap={4} flexWrap="wrap">
            {!hasRealData && (
              <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(255,255,255,0.06)">
                <MicroLabel color="rgba(255,255,255,0.3)">Mock Data</MicroLabel>
              </Box>
            )}
            <Flex align="center" gap={2}>
              <Box w="0.75rem" h="0.1875rem" bg={awayColor} borderRadius="full" />
              <MicroLabel color="rgba(255,255,255,0.5)">{awayLabel} →</MicroLabel>
            </Flex>
            <Flex align="center" gap={2}>
              <Box w="0.75rem" h="0.1875rem" bg={homeColor} borderRadius="full" />
              <MicroLabel color="rgba(255,255,255,0.5)">{homeLabel} →</MicroLabel>
            </Flex>
          </HStack>
          <HStack gap={4} flexWrap="wrap">
            <Flex align="center" gap={1.5}>
              <Box w="0.5rem" h="0.5rem" borderRadius="full" bg="#22c55e" border="0.0938rem solid white" />
              <MicroLabel color="rgba(255,255,255,0.3)">Score</MicroLabel>
            </Flex>
            <Flex align="center" gap={1.5}>
              <Box w="0.5rem" h="0.5rem" borderRadius="full" bg="#ef4444" border="0.0938rem solid white" />
              <MicroLabel color="rgba(255,255,255,0.3)">Turnover</MicroLabel>
            </Flex>
            <Flex align="center" gap={1.5}>
              <Box w="0.5rem" h="0.5rem" borderRadius="full" bg="#fbbf24" border="0.0938rem solid white" />
              <MicroLabel color="rgba(255,255,255,0.3)">Big Play (20+)</MicroLabel>
            </Flex>
          </HStack>
        </Flex>

        {/* Recharts Chart — fills whatever vertical space the slot actually gives it. Flat green plotting surface. */}
        <Box w="full" flex="1" minH={0} position="relative" bg="#1B7A3D" borderRadius="md">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 6, bottom: 8, left: 0 }}>
              {/* Territory fill, split per drive — zone color (away bottom / home top) stays fixed,
                  but each drive's shade flips: dark = that team is driving, light = defending.
                  This is the possession signal now, fused directly into the fill. */}
              {possessions.map((p, idx) => (
                <Area
                  key={`away-fill-${idx}`}
                  data={p.points}
                  dataKey="ylAbs"
                  baseValue={0}
                  type="linear"
                  stroke="none"
                  fill={p.isHome ? awayColorDim : awayColor}
                  fillOpacity={0.9}
                  isAnimationActive={false}
                />
              ))}
              {possessions.map((p, idx) => (
                <Area
                  key={`home-fill-${idx}`}
                  data={p.points}
                  dataKey="ylAbs"
                  baseValue={100}
                  type="linear"
                  stroke="none"
                  fill={p.isHome ? homeColor : homeColorDim}
                  fillOpacity={0.9}
                  isAnimationActive={false}
                />
              ))}

              {/* Possession ribbon — solid blocks showing exactly where each drive starts and stops */}
              {possessions.map((p, idx) => (
                <ReferenceArea
                  key={`poss-${idx}`}
                  x1={p.start}
                  x2={p.end}
                  y1={-3}
                  y2={0}
                  fill={p.color}
                  fillOpacity={1}
                  stroke="#0a0a0a"
                  strokeWidth={0.5}
                />
              ))}

              {/* Yard line grid (horizontal reference lines) — only the lines worth labeling */}
              {[0, 25, 50, 75, 100].map((y) => (
                <ReferenceLine
                  key={y}
                  y={y}
                  stroke={y === 50 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}
                  strokeDasharray={y === 50 ? undefined : "4 4"}
                  strokeWidth={y === 50 ? 1.5 : 1}
                  label={{
                    value: y === 0 || y === 100 ? "EZ" : String(y),
                    position: "insideLeft",
                    fill: y === 50 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)",
                    fontSize: 9,
                    fontWeight: "bold",
                    offset: 5,
                  }}
                />
              ))}

              {/* Drive boundaries — a clean vertical line at every possession change */}
              {possessions.slice(1).map((p, idx) => (
                <ReferenceLine
                  key={`bound-${idx}`}
                  x={p.start - 0.5}
                  stroke="#0a0a0a"
                  strokeWidth={1.5}
                />
              ))}

              {/* Quarter dividers (vertical reference lines at play indices) */}
              {quarterBoundaries.map((qb) => (
                <ReferenceLine
                  key={qb.q}
                  x={qb.idx}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                  label={{
                    value: `Q${qb.q}`,
                    position: "insideBottom",
                    fill: "rgba(255,255,255,0.2)",
                    fontSize: 9,
                    fontWeight: "bold",
                    offset: 5,
                  }}
                />
              ))}

              <XAxis
                dataKey="playIndex"
                type="number"
                domain={[0, data.length - 1]}
                hide
              />
              <YAxis
                domain={[-3, 103]}
                hide
              />
              <Tooltip content={<MarchTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }} />

              {/* Boundary line — neutral seam; possession now lives in the fill shade, weight still tracks drive magnitude */}
              {possessions.map((p, idx) => (
                <Line
                  key={`drive-${idx}`}
                  data={p.points}
                  dataKey="ylAbs"
                  xAxisId={0}
                  type="linear"
                  stroke="#0a0a0a"
                  strokeWidth={p.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={800}
                  animationBegin={idx * 60}
                  connectNulls
                />
              ))}

              {/* Drive-end markers — score spikes, turnover breaks, soft stops for punts/downs */}
              <Line
                data={possessions.map((p) => p.points[p.points.length - 1])}
                dataKey="ylAbs"
                type="linear"
                stroke="transparent"
                dot={(dotProps) => {
                  const p = possessions[dotProps.index];
                  return <DriveEndMarker key={`end-${dotProps.index}`} {...dotProps} possession={p} />;
                }}
                activeDot={false}
                isAnimationActive={false}
              />

              {/* Event markers overlay */}
              <Line
                data={data}
                dataKey="ylAbs"
                type="monotone"
                stroke="transparent"
                dot={<EventDot />}
                activeDot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>

      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. GAME INFO — Editorial info panel with hairlines
// ═══════════════════════════════════════════════════════════════════════════════
export const GameInfoCard = ({ meta, awayId, homeId }) => {
  const { density } = useLayoutDensity();
  const cardVariant = density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact";

  return (
    <GameInfoPassport meta={meta} homeId={homeId} variant={cardVariant} />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SCORING SUMMARY — Quarter breakdown with team color accents
// ═══════════════════════════════════════════════════════════════════════════════
// Period label as it prints in a box score: Q1–Q4 stay, "OT1" → "OT", "OT2" → "2OT".
const periodLabel = (label) => {
  const m = /^OT(\d+)$/i.exec(String(label ?? ""));
  if (!m) return String(label ?? "");
  return Number(m[1]) > 1 ? `${m[1]}OT` : "OT";
};

// Reads `score_by_quarter` straight off the game file — `labels[]` carries every period
// played (Q1–Q4 plus OT1, OT2 … when it went long), `away[]` / `home[]` line up with it.
// Finals come from the team blocks; the periods are never summed here.
export const ScoringSummaryCard = ({ scoreByQuarter, awayScore, homeScore, awayId, homeId }) => {
  const { isCompact } = useLayoutDensity();
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayInk = onDark(getTeamAccent(awayId));
  const homeInk = onDark(getTeamAccent(homeId));
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const periods = useMemo(() => {
    const labels = Array.isArray(scoreByQuarter?.labels) ? scoreByQuarter.labels : [];
    return labels.map((label, i) => ({
      key: label,
      label: periodLabel(label),
      away: scoreByQuarter?.away?.[i] ?? null,
      home: scoreByQuarter?.home?.[i] ?? null,
    }));
  }, [scoreByQuarter]);

  const finalAway = awayScore ?? null;
  const finalHome = homeScore ?? null;
  const show = (v) => (v == null ? "—" : v);

  if (isCompact) {
    const cols = periods;
    return (
      <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.2s" }}>
        <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
          <Box flexShrink={0} mb="0.5rem">
            <SectionLabel>Scoring Summary</SectionLabel>
          </Box>

          {/* Compact — one horizontal box-score table, matching the Team Stats tab's visual language:
              dark surface, gray metric labels, only the winning number gets color. */}
          <Box flex="1" minH={0} display="flex" flexDirection="column">
            <Grid templateColumns={`minmax(5rem, 1.4fr) repeat(${cols.length}, 1fr) 1fr`} gap="0.375rem" flexShrink={0} mb="0.375rem" pb="0.375rem" borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.1)">
              <Text fontSize="clamp(0.5rem, 0.55vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em">Team</Text>
              {cols.map((q) => (
                <Text key={q.key} fontSize="clamp(0.5rem, 0.55vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" textAlign="center">
                  {q.label}
                </Text>
              ))}
              <Text fontSize="clamp(0.5rem, 0.55vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" textAlign="center">Total</Text>
            </Grid>

            <Flex flex="1" minH={0} direction="column" justify="space-between">
              {[
                { id: awayId, label: awayLabel, color: awayColor, final: finalAway },
                { id: homeId, label: homeLabel, color: homeColor, final: finalHome },
              ].map((team, ti) => {
                const otherFinal = ti === 0 ? finalHome : finalAway;
                const isWinner = team.final != null && otherFinal != null && team.final >= otherFinal;
                return (
                  <Grid key={team.id} templateColumns={`minmax(5rem, 1.4fr) repeat(${cols.length}, 1fr) 1fr`} gap="0.375rem" flex="1" minH={0} alignItems="center" borderBottom={ti === 0 ? "0.0625rem solid" : "none"} borderColor="rgba(255,255,255,0.06)">
                    <Flex align="center" gap="0.375rem" minW={0}>
                      <Image src={getTeamLogoSrc(team.id)} alt={team.label} boxSize="1rem" objectFit="contain" flexShrink={0} />
                      <Text fontSize="clamp(0.6rem, 0.7vw, 0.75rem)" fontWeight="900" color="rgba(255,255,255,0.75)" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {team.label}
                      </Text>
                    </Flex>
                    {cols.map((q) => (
                      <Text key={q.key} fontSize="clamp(0.7rem, 0.85vw, 0.9rem)" fontWeight="800" color="rgba(255,255,255,0.55)" textAlign="center">
                        {show(q[team.id === awayId ? "away" : "home"])}
                      </Text>
                    ))}
                    <Text fontSize="clamp(0.8rem, 0.95vw, 1rem)" fontWeight="950" color={isWinner ? "#22c55e" : "rgba(255,255,255,0.5)"} textAlign="center">
                      {show(team.final)}
                    </Text>
                  </Grid>
                );
              })}
            </Flex>
          </Box>
        </Box>
      </EditorialCard>
    );
  }

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.2s" }}>
      <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
        <Box flexShrink={0} mb="0.5rem">
          <SectionLabel>Scoring Summary</SectionLabel>
        </Box>

        {/* Same dark surface language as every other card on the tab — team colors are lifted
            to a legibility floor by `onDark` rather than sitting on a white panel. */}
        <Box flex="1" minH={0} borderRadius="md" bg="rgba(255,255,255,0.03)" border="0.0625rem solid" borderColor="rgba(255,255,255,0.06)" p="0.625rem" display="flex" flexDirection="column">
          <Flex align="center" justify="space-between" flexShrink={0} mb="0.5rem" gap="0.5rem">
            <Box flex={1} minW={0}>
              <Flex align="center" gap="0.375rem" mb="0.125rem">
                <Image src={getTeamLogoSrc(awayId)} alt={awayLabel} boxSize="1.125rem" objectFit="contain" flexShrink={0} />
                <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {awayLabel}
                </Text>
              </Flex>
              <Text fontSize="clamp(0.95rem, 1.1vw, 1.15rem)" fontWeight="950" color={awayInk} lineHeight={1}>
                {show(finalAway)}
              </Text>
            </Box>

            <Text fontSize="clamp(0.5rem, 0.6vw, 0.65rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.16em" flexShrink={0}>
              Final
            </Text>

            <Box flex={1} minW={0} textAlign="right">
              <Flex align="center" justify="flex-end" gap="0.375rem" mb="0.125rem">
                <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {homeLabel}
                </Text>
                <Image src={getTeamLogoSrc(homeId)} alt={homeLabel} boxSize="1.125rem" objectFit="contain" flexShrink={0} />
              </Flex>
              <Text fontSize="clamp(0.95rem, 1.1vw, 1.15rem)" fontWeight="950" color={homeInk} lineHeight={1}>
                {show(finalHome)}
              </Text>
            </Box>
          </Flex>

          <Box flex="1" minH={0} borderTop="0.0625rem solid" borderColor="rgba(255,255,255,0.1)" display="flex" flexDirection="column" justifyContent="space-between">
            {/* One row per period played. Rows are flex={1}, so an OT game squeezes five or six
                rows into the same card height instead of growing it — the OT rows carry a
                brighter label so they read as extra time, not a fifth quarter. */}
            {periods.map((q) => {
              const isOT = /OT/i.test(q.key);
              return (
                <Flex key={q.key} flex="1" minH={0} align="center" justify="space-between" px="0.125rem" borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.06)">
                  <Text fontSize="clamp(0.55rem, 0.65vw, 0.7rem)" fontWeight="900" color={isOT ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)"} textTransform="uppercase" letterSpacing="0.16em" minW="1.5rem">
                    {q.label}
                  </Text>

                  <Flex flex={1} align="center" justify="space-between" ml="0.5rem">
                    <Text fontSize="clamp(0.75rem, 0.9vw, 0.95rem)" fontWeight="950" color={awayInk}>
                      {show(q.away)}
                    </Text>
                    <Text fontSize="clamp(0.6rem, 0.7vw, 0.75rem)" fontWeight="800" color="rgba(255,255,255,0.25)">
                      •
                    </Text>
                    <Text fontSize="clamp(0.75rem, 0.9vw, 0.95rem)" fontWeight="950" color={homeInk}>
                      {show(q.home)}
                    </Text>
                  </Flex>
                </Flex>
              );
            })}
            {periods.length === 0 && (
              <Flex flex="1" align="center" justify="center">
                <MicroLabel>No period scoring on file</MicroLabel>
              </Flex>
            )}
          </Box>
        </Box>
      </Box>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TEAM STATS — Animated advantage bars with team color dominance
// ═══════════════════════════════════════════════════════════════════════════════
/** How full a Team Stats bar is, 0–100, on the row's range (see utils/statBars). */
export const statBarPct = (value, stat) => barPct(value, stat.range);
/** The filled part of a Team Stats bar — from zero on a stat that crosses it. */
export const statBarSegment = (value, stat) => barSegment(value, stat.range);

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED BASICS — the top block of Bill Connelly's SP+ advanced box score
// ═══════════════════════════════════════════════════════════════════════════════
// Six columns in a one-column slot, mirroring inspo/abs2.jpg. The first column does
// double duty: it carries the category on a block's header row and the team on the two
// rows under it. Blocks with only four metrics leave the sixth column empty, exactly as
// the source sheet does — the ragged right edge is the reference, not a bug.
//
// Derived here, off `drive_summary` and `play_by_play`, until the backend ships it:
//   • drives, plays, yards, scoring opportunities, average starting field position
//   • the per-drive rates, and points per scoring opportunity
//   • success rate by quarter, by play type, and by down type
//
// A scoring opportunity is a drive reaching the opponent's 40 — `end_yardline_absolute`
// of 60 or better on the 0-100 scale the export uses, where your own goal line is 0 and
// a touchdown drive ends at exactly 100. That reads the drive's FINAL spot, so a drive
// that reached the 35, lost yardage and punted from midfield is missed. The real metric
// counts first downs inside the 40, which needs per-play field position we don't have
// on every drive.
//
// NOT derivable, and left out rather than faked: SP+ prints a National Average row under
// every block, and that row is what makes "6.3 plays per drive" mean anything.
// `league_avg_2025.json` carries only rushing/passing/defence rates — nothing about
// drives, field position or per-quarter success. Filed as a backend ask. Until it lands,
// context comes from contrast: on metrics with a good direction, the better of the two
// values is set in white and the other is dimmed. Metrics where more is not obviously
// better — drive count, play count, plays per drive — are left evenly weighted rather
// than implying that 15 drives beats 13.
//
// UPDATE — the 2026 export ships this card outright. `game.advanced_basics.blocks` on
// every 2026 game file carries the identical shape this card was built around (label +
// metrics[] of {key, label, away, home}), plus a full 5-column Turnovers block —
// Turnovers, Expected TOs, TO Margin, Expected TO Margin, TO Luck (pts) — that we never
// derive client-side (no expected-turnover model to derive it from). Where it exists we
// render it directly and drop the derivation entirely; where it doesn't (every season
// before 2026) we fall back to the block/formula pair below, whose Turnovers block only
// carries the three columns that are actually derivable (Committed, Forced, Margin).

const normTeamId = (id) => String(id ?? "").replace(/25$/, "");

/** Connelly's rule: 50% of the yards needed on 1st down, 70% on 2nd, all of them after. */
const isSuccessfulPlay = (down, distance, gained) => {
  if (down === 1) return gained >= distance * 0.5;
  if (down === 2) return gained >= distance * 0.7;
  return gained >= distance;
};

const fInt = (v) => (v == null ? "—" : String(Math.round(v)));
const f1 = (v) => (v == null ? "—" : v.toFixed(1));
const f2 = (v) => (v == null ? "—" : v.toFixed(2));
const fPct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const fSigned = (v) => (v == null ? "—" : v > 0 ? `+${v}` : String(v));

// One formatter/direction per metric KEY, shared by both render paths — the derived
// blocks below and the real `advanced_basics.blocks` from the 2026 export — so a metric
// prints identically regardless of which one supplied it. `better` picks which of the
// two team values gets set in white: `true` for higher-is-better, `"low"` for the
// handful (turnovers, committed) where fewer is the win. Left unset where there's no
// clear direction — drive count, play count — rather than implying 15 drives beats 13.
const KEY_META = {
  drives: { fmt: fInt },
  plays: { fmt: fInt },
  yards: { fmt: fInt, better: true },
  opps: { fmt: fInt, better: true },
  avgFp: { fmt: f1, better: true },
  toCommitted: { fmt: fInt, better: "low" },
  turnovers: { fmt: fInt, better: "low" },
  toForced: { fmt: fInt, better: true },
  expectedTos: { fmt: f1, better: "low" },
  toMargin: { fmt: fSigned, better: true },
  expectedToMargin: { fmt: fSigned, better: true },
  toLuckPts: { fmt: fSigned, better: true },
  playsPerDrive: { fmt: f1 },
  yardsPerPlay: { fmt: f1, better: true },
  yardsPerDrive: { fmt: f1, better: true },
  oppsPerDrive: { fmt: f2, better: true },
  pointsPerOpp: { fmt: f2, better: true },
  q1: { fmt: fPct, better: true },
  q2: { fmt: fPct, better: true },
  q3: { fmt: fPct, better: true },
  q4: { fmt: fPct, better: true },
  srRush: { fmt: fPct, better: true },
  srPass: { fmt: fPct, better: true },
  srStd: { fmt: fPct, better: true },
  srPassDn: { fmt: fPct, better: true },
  srGame: { fmt: fPct, better: true },
};

// Column heads, keyed on the metric key so BOTH paths through this card use them —
// the export's own `m.label` and the derived fallback below. Those had drifted:
// a game shipping `advanced_basics` printed the backend's wording verbatim
// ("Expected TO Margin", "Points/Opp") while a game without one printed our short
// forms, so the same column was named two different things depending on season.
//
// Two rules, both forced by a ~40px column:
//   • at most two words, so a head is at most two lines
//   • the space goes where the break should go — "Plays/ Dr", not "Plays/Dr",
//     which has nowhere to break and snaps mid-word instead
// The x- prefix is the analytics convention (xG, xEPA): xTOs is expected
// turnovers, xTO Marg the expected margin.
const BASICS_HEADS = {
  drives: "Drv",
  plays: "Plays",
  yards: "Yards",
  opps: "Sc Opps",
  avgFp: "Avg FP",

  turnovers: "TOs",
  toCommitted: "TOs",
  toForced: "Forced",
  expectedTos: "xTOs",
  toMargin: "TO Marg",
  expectedToMargin: "xTO Marg",
  toLuckPts: "TO Luck",

  playsPerDrive: "Play/ Dr",
  yardsPerPlay: "Yd/ Play",
  yardsPerDrive: "Yd/ Dr",
  oppsPerDrive: "Opp/ Dr",
  pointsPerOpp: "Pts/ Opp",

  q1: "Q1",
  q2: "Q2",
  q3: "Q3",
  q4: "Q4",

  srRush: "Rush",
  srPass: "Pass",
  srStd: "Std Dn",
  srPassDn: "Pass Dn",
  srGame: "Game",
};

/** The short head for a column, falling back to whatever the export called it. */
const headFor = (key, label) => BASICS_HEADS[key] ?? label;

// The 2026 export keys each metric by its source field path ("derived.plays_per_drive",
// "advanced_team.success_rate"), not by the short keys KEY_META / BASICS_HEADS use. Without
// this map every cell fell to the integer formatter — 5.3 printed as 5, 0.44 as 0. The
// raw path is kept alongside: it is also the key into `shared/league_avg_{season}.json`.
const KEY_ALIAS = {
  "team_box.drives_offense": "drives",
  "team_box.plays_offense": "plays",
  "team_box.total_yards": "yards",
  "advanced_team.opportunities_40": "opps",
  "team_box.avg_start_field_position": "avgFp",
  "team_box.turnovers_committed": "toCommitted",
  "team_box.turnovers": "turnovers",
  "team_box.turnovers_forced": "toForced",
  "team_box.expected_turnovers": "expectedTos",
  "team_box.turnover_margin": "toMargin",
  "team_box.expected_turnover_margin": "expectedToMargin",
  "team_box.turnover_luck_pts": "toLuckPts",
  "derived.plays_per_drive": "playsPerDrive",
  "derived.yards_per_play": "yardsPerPlay",
  "derived.yards_per_drive": "yardsPerDrive",
  "derived.opps_per_drive": "oppsPerDrive",
  "advanced_team.points_per_opportunity_40": "pointsPerOpp",
  "derived.sr_q1": "q1",
  "derived.sr_q2": "q2",
  "derived.sr_q3": "q3",
  "derived.sr_q4": "q4",
  "splits.rushing.total.success_rate": "srRush",
  "splits.passing.total.success_rate": "srPass",
  "advanced_team.success_rate_standard_down": "srStd",
  "advanced_team.success_rate_passing_down": "srPassDn",
  "advanced_team.success_rate": "srGame",
};
const shortKey = (key) => KEY_ALIAS[key] ?? key;

// Column titles break on spaces, so every multi-word head is written with one — "Sc Opps",
// "Plays/ Dr" — and wraps to a second line instead of clipping in a 40px column. This is
// the FALLBACK block list, used only when a game carries no `advanced_basics` — its
// Turnovers block has three columns because Committed/Forced/Margin are all that's
// derivable; the real export's Turnovers block has five (see the note above).
const BASIC_BLOCKS = [
  {
    label: "Drives",
    metrics: [
      { key: "drives", label: "Drives" },
      { key: "plays", label: "Plays" },
      { key: "yards", label: "Yards" },
      { key: "opps", label: "Sc Opps" },
      { key: "avgFp", label: "Avg FP" },
    ],
  },
  {
    label: "Turnovers",
    metrics: [
      { key: "toCommitted", label: "Committed" },
      { key: "toForced", label: "Forced" },
      { key: "toMargin", label: "Margin" },
    ],
  },
  {
    label: "Per Drive",
    metrics: [
      { key: "playsPerDrive", label: "Plays/ Dr" },
      { key: "yardsPerDrive", label: "Yards/ Dr" },
      { key: "oppsPerDrive", label: "Opps/ Dr" },
      { key: "pointsPerOpp", label: "Pts/ Opp" },
    ],
  },
  {
    label: "SR By Qtr",
    metrics: [
      { key: "q1", label: "Q1" },
      { key: "q2", label: "Q2" },
      { key: "q3", label: "Q3" },
      { key: "q4", label: "Q4" },
    ],
  },
  {
    label: "Success Rt",
    metrics: [
      { key: "srRush", label: "Rush" },
      { key: "srPass", label: "Pass" },
      { key: "srStd", label: "Std Dn" },
      { key: "srPassDn", label: "Pass Dn" },
      { key: "srGame", label: "Game" },
    ],
  },
];

const buildBasics = (drives, plays, teamId, box) => {
  const want = normTeamId(teamId);
  // 2026 drives nest their field position under `start.spot_absolute` / `end.spot_absolute`
  // rather than the flat `start_yardline_absolute` / `end_yardline_absolute` every earlier
  // season uses. That's fine here — every 2026 game ships `advanced_basics` and this
  // derivation path is never reached for one (see AdvancedBasicsCard) — but the flat reads
  // below are only ever correct against the pre-2026 shape.
  const own = (drives ?? []).filter((d) => normTeamId(d.offense_team) === want);
  const n = own.length;
  const sumOf = (field) => own.reduce((s, d) => s + (d[field] || 0), 0);
  const playsTotal = sumOf("plays_total");
  const yards = sumOf("yards_net");
  const points = sumOf("points");
  const opps = own.filter((d) => (d.end_yardline_absolute ?? 0) >= 60).length;

  const bucket = () => ({ att: 0, ok: 0 });
  const quarters = [bucket(), bucket(), bucket(), bucket()];
  const rush = bucket();
  const pass = bucket();
  const std = bucket();
  const passDown = bucket();
  const all = bucket();

  (plays ?? []).forEach((play) => {
    if (normTeamId(play.offense_team) !== want) return;
    const type = play.play_type;
    // A sack is a failed passing play, not an absent one — leaving it out flatters
    // every passing success rate on the card.
    if (type !== "RUSH" && type !== "PASS" && type !== "SACK") return;
    if (!play.down || !play.distance) return;
    const gained = (play.actions ?? []).find((a) => a.type === type)?.net_yards ?? 0;
    const ok = isSuccessfulPlay(play.down, play.distance, gained) ? 1 : 0;
    const bump = (b) => {
      b.att += 1;
      b.ok += ok;
    };
    bump(all);
    if (quarters[play.quarter - 1]) bump(quarters[play.quarter - 1]);
    bump(type === "RUSH" ? rush : pass);
    bump(play.down === 1 || (play.down === 2 && play.distance <= 8) ? std : passDown);
  });

  const rateOf = (b) => (b.att > 0 ? b.ok / b.att : null);

  // Real, straight off team_box — no derivation needed.
  const toCommitted = box?.turnovers_committed ?? null;
  const toForced = box?.turnovers_forced ?? null;
  const toMargin = toCommitted != null && toForced != null ? toForced - toCommitted : null;

  return {
    drives: n,
    toCommitted,
    toForced,
    toMargin,
    plays: playsTotal,
    yards,
    opps,
    avgFp: n > 0 ? sumOf("start_yardline_absolute") / n : null,
    playsPerDrive: n > 0 ? playsTotal / n : null,
    yardsPerDrive: n > 0 ? yards / n : null,
    oppsPerDrive: n > 0 ? opps / n : null,
    pointsPerOpp: opps > 0 ? points / opps : null,
    q1: rateOf(quarters[0]),
    q2: rateOf(quarters[1]),
    q3: rateOf(quarters[2]),
    q4: rateOf(quarters[3]),
    srRush: rateOf(rush),
    srPass: rateOf(pass),
    srStd: rateOf(std),
    srPassDn: rateOf(passDown),
    srGame: rateOf(all),
  };
};

/** The Metrics blocks for both teams — the export's `advanced_basics` when present
 *  (every 2026 game), otherwise the fallback block list derived from drives/plays.
 *  Shared by the desktop card and the mobile one. */
export const useMetricBlocks = ({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg }) => {
  // Real beats derived: when the export ships `advanced_basics.blocks` (every 2026 game),
  // use it directly — same shape this card was designed around, plus the two Turnover
  // columns (Expected TOs, TO Luck) no client formula can produce. Every earlier season
  // falls back to the block list + play-by-play derivation above.
  const isReal = !!advancedBasics?.blocks?.length;

  return useMemo(() => {
    if (isReal) {
      return advancedBasics.blocks.map((b) => ({
        label: b.label,
        metrics: b.metrics.map((m) => {
          const key = shortKey(m.key);
          const entry = leagueAvg?.keys?.[m.key];
          const league = typeof entry?.avg === "number"
            ? { avg: entry.avg, min: typeof entry.min === "number" ? entry.min : null, max: typeof entry.max === "number" ? entry.max : null }
            : null;
          return { key, label: headFor(key, m.label), away: m.away, home: m.home, league };
        }),
      }));
    }
    const away = buildBasics(drives, plays, awayId, teamStats?.[awayId]);
    const home = buildBasics(drives, plays, homeId, teamStats?.[homeId]);
    return BASIC_BLOCKS.map((b) => ({
      label: b.label,
      metrics: b.metrics.map((m) => ({ key: m.key, label: headFor(m.key, m.label), away: away[m.key], home: home[m.key], league: null })),
    }));
  }, [isReal, advancedBasics, drives, plays, awayId, homeId, teamStats, leagueAvg]);
};

/**
 * White for the ahead value, dimmed for the other — but only where a direction exists.
 * `better: "low"` flips the comparison for the metrics (turnovers, committed) where the
 * smaller number is the win.
 */
export const metricInk = (key, value, otherValue) => {
  const better = KEY_META[key]?.better;
  if (!better || value == null || otherValue == null || value === otherValue) {
    return "rgba(255,255,255,0.82)";
  }
  const ahead = better === "low" ? value < otherValue : value > otherValue;
  return ahead ? "white" : "rgba(255,255,255,0.4)";
};

/**
 * Cell shading, after the reference sheet (inspo/abs2.jpg): each value is tinted against
 * the league average — green when it's on the good side, red when it isn't — and the
 * tint deepens with the distance, scaled to the league's own spread (avg→max on the good
 * side, avg→min on the bad). Metrics with no direction (drive count, play count, plays
 * per drive) stay untinted, as does anything without a league entry.
 */
export const metricShade = (key, value, league) => {
  const better = KEY_META[key]?.better;
  if (!better || value == null || !league || league.avg == null) return null;
  const dev = better === "low" ? league.avg - value : value - league.avg;
  const span = dev >= 0
    ? (better === "low" ? league.avg - (league.min ?? league.avg) : (league.max ?? league.avg) - league.avg)
    : (better === "low" ? (league.max ?? league.avg) - league.avg : league.avg - (league.min ?? league.avg));
  const t = span > 0 ? Math.min(1, Math.abs(dev) / span) : 0;
  if (t < 0.04) return null;
  const alpha = 0.1 + 0.42 * t;
  return dev >= 0 ? `rgba(34,197,94,${alpha.toFixed(2)})` : `rgba(239,68,68,${alpha.toFixed(2)})`;
};

/** The formatter for a metric's value. */
export const metricFmt = (key) => KEY_META[key]?.fmt ?? fInt;

// Six tracks. The label column gets a little over one and a half so a logo and an
// abbreviation fit beside each other; the five metric columns share the rest evenly and
// every one is minmax(0, …) so a long value can never widen its own column.
const BASICS_COLS = "minmax(0, 1.65fr) repeat(5, minmax(0, 1fr))";

const AdvancedBasicsCard = ({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg }) => {
  const accent = getTeamAccent(awayId);
  const blocks = useMetricBlocks({ awayId, homeId, drives, plays, teamStats, advancedBasics, leagueAvg });
  const inkFor = metricInk;
  const shadeFor = metricShade;

  const teams = [
    { id: awayId, side: "away" },
    { id: homeId, side: "home" },
  ];

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.3s" }}>
      <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
        {/* Eyebrow — house standard: accent dot, label, hairline. No bar and no italic
            display face; the card's own contents carry the weight. */}
        <Flex align="center" gap="0.5rem" pb="0.5rem" mb="0.625rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Box w="0.375rem" h="0.375rem" bg={accent} borderRadius="full" flexShrink={0} />
          <Text
            fontSize="clamp(0.68rem, 0.85vw, 0.85rem)"
            fontWeight="black"
            color="rgba(255,255,255,0.55)"
            textTransform="uppercase"
            letterSpacing="0.16em"
            lineHeight={1.1}
          >
            Metrics
          </Text>
        </Flex>

        <Flex direction="column" justify="space-between" gap="0.875rem" flex="1" minH={0}>
          {blocks.map((block) => (
            <Box key={block.label} minW={0}>
              <Grid templateColumns={BASICS_COLS} columnGap="0.3rem" alignItems="end" pb="0.3rem" borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.12)">
                <Text fontSize="clamp(0.56rem, 0.72vw, 0.68rem)" fontWeight="950" color="rgba(255,255,255,0.68)" textTransform="uppercase" letterSpacing="0.05em" lineHeight={1.2}>
                  {block.label}
                </Text>
                {block.metrics.map((m) => (
                  <Text key={m.key} textAlign="center" fontSize="clamp(0.48rem, 0.6vw, 0.56rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.2} overflowWrap="normal" wordBreak="keep-all" hyphens="none">
                    {m.label}
                  </Text>
                ))}
              </Grid>

              {teams.map((team) => (
                <Grid key={team.id} templateColumns={BASICS_COLS} columnGap="0.3rem" alignItems="center" pt="0.3rem">
                  <Flex align="center" gap="0.3rem" minW={0}>
                    <Image src={getTeamLogoSrc(team.id)} alt="" w="0.8125rem" h="0.8125rem" objectFit="contain" flexShrink={0} />
                    <Text fontSize="clamp(0.5rem, 0.64vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.75)" lineClamp={1}>
                      {getTeamLabel(team.id)}
                    </Text>
                  </Flex>
                  {block.metrics.map((m) => {
                    const value = m[team.side];
                    const other = m[team.side === "away" ? "home" : "away"];
                    const fmt = KEY_META[m.key]?.fmt ?? fInt;
                    const shade = shadeFor(m.key, value, m.league);
                    return (
                      <Box key={m.key} bg={shade ?? "transparent"} borderRadius="sm" py="0.15rem" px="0.1rem" minW={0}>
                        <Text
                          textAlign="center"
                          fontFamily="mono"
                          fontSize="clamp(0.58rem, 0.78vw, 0.75rem)"
                          fontWeight="900"
                          lineHeight={1.2}
                          color={shade ? "white" : inkFor(m.key, value, other)}
                        >
                          {fmt(value)}
                        </Text>
                      </Box>
                    );
                  })}
                </Grid>
              ))}

              {/* League-average row — the third row every block on the reference sheet
                  carries, and the one that makes "6.3 plays per drive" mean something.
                  Read from `shared/league_avg_{season}.json` by the export's field path
                  (all 21 keys are there for 2026). The reference sheet's row is a national
                  average; that's on the backend ask list. Dashes on the derived path. */}
              <Grid templateColumns={BASICS_COLS} columnGap="0.3rem" alignItems="center" pt="0.3rem">
                <Text fontSize="clamp(0.46rem, 0.58vw, 0.54rem)" fontWeight="700" fontStyle="italic" color="rgba(255,255,255,0.3)" lineClamp={1}>
                  Lg Avg
                </Text>
                {block.metrics.map((m) => (
                  <Text
                    key={m.key}
                    textAlign="center"
                    fontFamily="mono"
                    fontSize="clamp(0.5rem, 0.66vw, 0.62rem)"
                    fontWeight="700"
                    fontStyle="italic"
                    color="rgba(255,255,255,0.38)"
                  >
                    {(KEY_META[m.key]?.fmt ?? fInt)(m.league?.avg ?? null)}
                  </Text>
                ))}
              </Grid>
            </Box>
          ))}
        </Flex>
      </Box>
    </EditorialCard>
  );
};

/** The Team Stats rows for both teams. Shared by the desktop card and the mobile one. */
export const buildTeamStatRows = ({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg = null }) => {
  const aStats = teamStats?.[awayId] ?? {};
  const hStats = teamStats?.[homeId] ?? {};
  const aAdv = advancedTeam?.[awayId] ?? {};
  const hAdv = advancedTeam?.[homeId] ?? {};

  // Sacks are their own category on the export, so `total_yards` above is gross of
  // them. The yardage is on the passing rows; see teamSackYards.
  const aSackYards = teamSackYards(game, awayId);
  const hSackYards = teamSackYards(game, homeId);

  // Yards per play is the only figure here the export doesn't ship outright; everything
  // else is a straight field read. Logged as a backend ask so this division can go away.
  const perPlay = (stats) => {
    const plays = stats.plays_offense || 0;
    return plays ? (stats.total_yards || 0) / plays : 0;
  };

  const pctOf = (v) => (v || 0) * 100;
  // League entry for a row, in the row's own units (rates are shown ×100).
  const lg = (path, k = 1) => {
    const e = leagueAvg?.keys?.[path];
    if (!e || typeof e.avg !== "number") return null;
    const n = (v) => (typeof v === "number" ? v * k : null);
    return { avg: n(e.avg), min: n(e.min), max: n(e.max) };
  };
  const asPct = (v) => `${v.toFixed(0)}%`;
  const signed = (v) => (v > 0 ? "+" : "") + v.toFixed(2);

  // Every row is real. `stuff_rate` is the rate a team's OWN runs got stuffed, so a
  // defence's run-stuff rate is the opponent's figure, not its own.
  const rawStats = [
    { label: "Total Yards", fallbackMax: 600, league: lg("team_box.total_yards"), away: aStats.total_yards || 0, home: hStats.total_yards || 0, format: (v) => v.toLocaleString() },
    { label: "Total EPA", fallbackMax: 10, league: lg("advanced_team.epa_total"), away: aAdv.epa_total ?? 0, home: hAdv.epa_total ?? 0, format: (v) => (v > 0 ? "+" : "") + v.toFixed(1), allowNegative: true },
    { label: "EPA / Play", fallbackMax: 0.5, league: lg("advanced_team.epa_per_play"), away: aAdv.epa_per_play ?? 0, home: hAdv.epa_per_play ?? 0, format: signed, allowNegative: true },
    { label: "Success Rate", fallbackMax: 60, league: lg("advanced_team.success_rate", 100), away: pctOf(aAdv.success_rate), home: pctOf(hAdv.success_rate), format: asPct },
    { label: "Yards / Play", fallbackMax: 8, away: perPlay(aStats), home: perPlay(hStats), format: (v) => v.toFixed(1) },
    { label: "Explosive Rate", fallbackMax: 25, league: lg("advanced_team.explosive_rate_yardage", 100), away: pctOf(aAdv.explosive_rate_yardage), home: pctOf(hAdv.explosive_rate_yardage), format: asPct },
    { label: "3rd Down Rate", fallbackMax: 60, league: lg("team_box.third_down_conversion_rate", 100), away: pctOf(aStats.third_down_conversion_rate), home: pctOf(hStats.third_down_conversion_rate), format: asPct },
    { label: "Havoc Rate", fallbackMax: 30, league: lg("advanced_team.havoc_rate_forced", 100), away: pctOf(aAdv.havoc_rate_forced), home: pctOf(hAdv.havoc_rate_forced), format: asPct },
    { label: "Def Run Stuff", fallbackMax: 40, league: lg("advanced_team.stuff_rate", 100), away: pctOf(hAdv.stuff_rate), home: pctOf(aAdv.stuff_rate), format: asPct },
    { label: "Sack Yards Lost", fallbackMax: 30, league: lg("trenches.pass_protection.sack_yards_lost"), away: aSackYards ?? 0, home: hSackYards ?? 0, format: (v) => String(v), lowerIsBetter: true },
    { label: "Turnovers", fallbackMax: 4, league: lg("team_box.turnovers_committed"), away: aStats.turnovers_committed ?? 0, home: hStats.turnovers_committed ?? 0, format: (v) => String(v), lowerIsBetter: true },
    { label: "Avg Start", fallbackMax: 40, league: lg("team_box.avg_start_field_position"), away: aStats.avg_start_field_position ?? 0, home: hStats.avg_start_field_position ?? 0, format: (v) => v.toFixed(0) },
  ];

  // Bars run 0 (or the negative team's value) to the league max for the row, with a
  // league-average notch; `fallbackMax` stands in where the league file has no entry
  // (yards / play). See utils/statBars.
  const statsConfig = rawStats.map((s) => ({ ...s, range: barRange(s.away, s.home, s.league, s.fallbackMax) }));
  return statsConfig;
};

const TeamStatsComparisonCard = ({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg = null }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);
  // Quieter than it was: the notch has to be findable without competing with the number.
  const notchColor = "rgba(255,255,255,0.55)";

  const statsConfig = buildTeamStatRows({ awayId, homeId, teamStats, advancedTeam, game, leagueAvg });

  // One team's cell: the number, with a hairline meter beneath it. The bar is deliberately
  // quiet — it is a supporting read under the figure, not a competing one, so it sits at a
  // sliver of height and well under full opacity.
  const teamCell = (stat, side, i) => {
    const isAway = side === "away";
    const value = isAway ? stat.away : stat.home;
    const avg = stat.league?.avg ?? null;
    const color = isAway ? awayColor : homeColor;
    const other = isAway ? stat.home : stat.away;
    const tied = value === other;
    const wins = !tied && (stat.lowerIsBetter ? value < other : value > other);
    const seg = statBarSegment(value, stat);
    const avgPct = avg == null ? null : statBarPct(avg, stat);
    const at = (pct) => (isAway ? { right: `${pct}%` } : { left: `${pct}%` });

    return (
      <Box minW={0}>
        <Text
          fontSize="clamp(0.72rem, 0.95vw, 0.95rem)"
          fontWeight="950"
          color={wins ? color : "rgba(255,255,255,0.45)"}
          textAlign={isAway ? "right" : "left"}
          lineHeight={1}
          lineClamp={1}
        >
          {stat.format(value)}
        </Text>
        <Box position="relative" h="0.125rem" w="full" mt="0.25rem">
          <Box position="absolute" inset={0} borderRadius="full" bg="rgba(255,255,255,0.07)" />
          {/* The two sides mirror around the gutter between them: away is anchored to
              its right edge and grows leftward, home anchored left and grows right, so
              the pair reads outward from the centre of the card. */}
          <Box
            position="absolute"
            top={0}
            bottom={0}
            borderRadius="full"
            bg={value < 0 ? "#EF4444" : color}
            opacity={0.7}
            className="animate-bar"
            style={{ width: `${seg.width}%`, animationDelay: `${0.3 + i * 0.05}s`, ...at(seg.from) }}
          />
          {/* Zero line, on a stat that crosses it. */}
          {seg.zero != null && <Box position="absolute" top="-0.125rem" bottom="-0.125rem" w="0.0625rem" bg="rgba(255,255,255,0.3)" style={at(seg.zero)} />}
          {/* League-average notch. */}
          {avgPct != null && <Box
            position="absolute"
            top="-0.09375rem"
            bottom="-0.09375rem"
            w="0.0625rem"
            bg={notchColor}
            zIndex={2}
            style={isAway ? { right: `${avgPct}%` } : { left: `${avgPct}%` }}
          />}
        </Box>
      </Box>
    );
  };

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.25s" }}>
      <Box position="relative" zIndex={1} p="0.875rem" h="full" w="full" display="flex" flexDirection="column">
        {/* Eyebrow — house standard, same as the Metrics card: accent dot, label, hairline. */}
        <Flex align="center" justify="space-between" mb="0.625rem" pb="0.5rem" borderBottom="0.0625rem solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Flex align="center" gap="0.5rem">
            <Box w="0.375rem" h="0.375rem" bg={awayColor} borderRadius="full" flexShrink={0} />
            <Text
              fontSize="clamp(0.68rem, 0.85vw, 0.85rem)"
              fontWeight="black"
              color="rgba(255,255,255,0.55)"
              textTransform="uppercase"
              letterSpacing="0.16em"
              lineHeight={1.1}
            >
              Team Stats
            </Text>
          </Flex>
          <HStack gap="0.75rem">
            <Flex align="center" gap="0.3125rem">
              <Image src={getTeamLogoSrc(awayId)} alt="" h="1rem" w="1rem" objectFit="contain" />
              <MicroLabel color="rgba(255,255,255,0.5)">{awayLabel}</MicroLabel>
            </Flex>
            <Box w="0.0625rem" h="0.625rem" bg="rgba(255,255,255,0.15)" />
            <Flex align="center" gap="0.3125rem">
              <MicroLabel color="rgba(255,255,255,0.5)">{homeLabel}</MicroLabel>
              <Image src={getTeamLogoSrc(homeId)} alt="" h="1rem" w="1rem" objectFit="contain" />
            </Flex>
          </HStack>
        </Flex>

        {/* Label left, the two numbers side by side to its right — a comparison table
            rather than a diverging chart. Eleven rows share the slot's height evenly. */}
        <Flex direction="column" justify="space-between" flex="1" minH={0}>
          {statsConfig.map((stat, i) => (
            <Grid
              key={stat.label}
              templateColumns="minmax(0, 1.75fr) minmax(0, 1fr) minmax(0, 1fr)"
              columnGap="0.5rem"
              alignItems="center"
            >
              <Text
                fontSize="clamp(0.6rem, 0.75vw, 0.78rem)"
                fontWeight="black"
                color="rgba(255,255,255,0.5)"
                textTransform="uppercase"
                letterSpacing="0.1em"
                lineHeight={1.15}
              >
                {stat.label}
              </Text>
              {teamCell(stat, "away", i)}
              {teamCell(stat, "home", i)}
            </Grid>
          ))}
        </Flex>

        {/* Key — the notch and the unfilled remainder are both deliberate, and neither is
            self-explanatory without being named. Each entry draws the real mark. */}
        <Flex flexShrink={0} align="center" justify="center" gap="1.25rem" mt="0.5rem" pt="0.5rem" borderTop="0.0625rem solid" borderColor="rgba(255,255,255,0.08)" flexWrap="wrap" rowGap="0.25rem">
          <Flex align="center" gap="0.375rem">
            <Box w="0.0625rem" h="0.5rem" bg={notchColor} flexShrink={0} />
            <MicroLabel>League Avg</MicroLabel>
          </Flex>
          <Flex align="center" gap="0.375rem">
            <Box position="relative" w="1.75rem" h="0.125rem" borderRadius="full" bg="rgba(255,255,255,0.07)" flexShrink={0} overflow="hidden">
              <Box position="absolute" left={0} top={0} bottom={0} w="58%" borderRadius="full" bg="rgba(255,255,255,0.4)" />
            </Box>
            <MicroLabel>Fill = vs League Max</MicroLabel>
          </Flex>
        </Flex>
      </Box>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED PLAYER-STAT HELPERS — used by both Game Leaders and Notable Performers
// ═══════════════════════════════════════════════════════════════════════════════

/** Tackles, sacks and TFL arrive as halves (5.5) — show the half, drop a bare ".0". */
const statNum = (n) => {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

/** Havoc, defined once so the number reads the same in both cards.
 *  Field names match individual_stats exactly: `tfl`, `forced_fumbles`. */
const havocOf = (s) =>
  (s.tfl || 0) + (s.sacks || 0) + (s.forced_fumbles || 0) + (s.passes_defended || 0) + (s.interceptions || 0);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. GAME LEADERS — Head-to-head with editorial player presentation
// ═══════════════════════════════════════════════════════════════════════════════
// Tries each headshot candidate in order and hands off to `fallback` once they're all
// exhausted — so a dead placeholder URL never reads as a broken image.
const CandidateImage = ({ srcs, fallback, ...imgProps }) => {
  const [attempt, setAttempt] = useState(0);
  const candidates = Array.isArray(srcs) ? srcs : [];
  const current = candidates[attempt] ?? null;
  if (!current) return fallback ?? null;
  return <Image key={current} src={current} onError={() => setAttempt((a) => a + 1)} {...imgProps} />;
};

export const GameLeadersCard = ({ awayId, homeId, teamEntries, identity }) => {
  const { density } = useLayoutDensity();
  const isCompact = density === LAYOUT_DENSITY.COMPACT;

  const byTeam = (tid, key) => {
    const entry = teamEntries.find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? {};
  };

  const topOf = (obj, field) => {
    const entries = Object.values(obj || {});
    if (!entries.length) return null;
    return [...entries].sort((a, b) => {
      const valA = field === "havoc" ? havocOf(a) : (a[field] ?? 0);
      const valB = field === "havoc" ? havocOf(b) : (b[field] ?? 0);
      return valB - valA;
    })[0];
  };

  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);

  const categories = [
    { label: "Passing", key: "passing", sortBy: "yards", format: (p) => `${p.yards || 0} YDS` },
    { label: "Rushing", key: "rushing", sortBy: "yards", format: (p) => `${p.yards || 0} YDS` },
    { label: "Receiving", key: "receiving", sortBy: "yards", format: (p) => `${p.yards || 0} YDS` },
    { label: "Tackles", key: "defense", sortBy: "tackles", format: (p) => `${statNum(p.tackles)} TKL` },
    { label: "Havoc", key: "defense", sortBy: "havoc", format: (p) => `${statNum(havocOf(p))} HVC` },
  ];

  const getLastName = (fullName) => {
    if (!fullName) return "—";
    const cleaned = cleanName(fullName);
    const parts = cleaned.split(" ");
    // Handle Jr., Sr., III etc
    if (parts.length > 2 && /^(JR|SR|III|IV|II)$/i.test(parts[parts.length - 1])) {
      return `${parts[parts.length - 2]} ${parts[parts.length - 1]}`;
    }
    return parts[parts.length - 1];
  };

  // The portrait is a background element, not an avatar: it fills much of its half of the
  // row, anchored to the centre rule, and the frame is the only thing that clips. A scrim
  // fades it out toward the card's outer edge so the name and number — which sit on top of
  // it — stay readable. Athletics-site headshots are framed inconsistently, so the crop is
  // a compromise that has to hold at every frame aspect this card renders at.
  // Percent of the half, capped in rem. The desktop slot runs at half the width it used
  // to: the portrait is a background element behind the name and number, and at 72% it
  // was reading as the subject of the row rather than the setting for it. The compact
  // card keeps its own value — a half there is more than twice as wide, and the rem cap
  // is what stops the portrait swelling into a slab of face.
  const PORTRAIT_W = isCompact ? "min(66%, 11rem)" : "min(36%, 4.5rem)";
  // Bottom-anchored and short of the full row, so the portrait reads as a smaller element
  // sitting in the row rather than a column running the height of the card.
  const PORTRAIT_H = isCompact ? "100%" : "78%";
  // `cover` already scales the photo past the frame and crops it — the frame's aspect does
  // the work, so no transform is needed and the crop holds at any row height. The vertical
  // offset is what keeps a head in shot: 0% put the frame on foreheads once compact rows
  // got tall, 22% lands on head-and-shoulders whatever the aspect turns out to be.
  const PORTRAIT_FOCUS = "center 22%";

  const renderPortrait = (p, color, teamId, side) => {
    const isAway = side === "away";
    const frame = {
      position: "absolute",
      bottom: 0,
      h: PORTRAIT_H,
      w: PORTRAIT_W,
      overflow: "hidden",
      ...(isAway ? { right: 0 } : { left: 0 }),
    };
    if (!p) return <Box {...frame} bg="rgba(255,255,255,0.03)" />;
    const srcs = resolveImages(identity, p, teamId);
    return (
      <Box {...frame} bg={`${color}1a`} borderBottom="0.125rem solid" borderColor={color}>
        <CandidateImage
          key={p.player_key ?? p.name}
          srcs={srcs}
          alt=""
          w="full"
          h="full"
          objectFit="cover"
          objectPosition={PORTRAIT_FOCUS}
          // No live headshot — same logo fallback as Notable Performers, cropped by the
          // identical frame so a missing photo doesn't read as a broken one.
          fallback={
            <Flex w="full" h="full" align="center" justify="center">
              <Image src={getTeamLogoSrc(teamId)} alt="" w="58%" h="58%" objectFit="contain" opacity={0.3} />
            </Flex>
          }
        />
        <Box
          position="absolute"
          inset={0}
          pointerEvents="none"
          bg={
            isAway
              ? "linear-gradient(to right, #141416 0%, rgba(20,20,22,0.52) 40%, rgba(20,20,22,0) 76%)"
              : "linear-gradient(to left, #141416 0%, rgba(20,20,22,0.52) 40%, rgba(20,20,22,0) 76%)"
          }
        />
      </Box>
    );
  };

  return (
    <EditorialCard position="relative" overflow="hidden" h="full">
      <Box position="relative" zIndex={1} px={isCompact ? 3 : 4} pt={isCompact ? 3 : 4} pb={0} h="full" display="flex" flexDirection="column">
        <SectionLabel
          rightContent={
            <HStack spacing={2.5} opacity={0.9}>
              <HStack spacing={1.5}>
                <Image src={getTeamLogoSrc(awayId)} w="1.125rem" h="1.125rem" objectFit="contain" />
                <Text fontSize="0.625rem" fontWeight="900" color="white" letterSpacing="0.05em">{getTeamLabel(awayId)}</Text>
              </HStack>
              <Text fontSize="0.625rem" fontWeight="900" color="whiteAlpha.300">vs</Text>
              <HStack spacing={1.5}>
                <Text fontSize="0.625rem" fontWeight="900" color="white" letterSpacing="0.05em">{getTeamLabel(homeId)}</Text>
                <Image src={getTeamLogoSrc(homeId)} w="1.125rem" h="1.125rem" objectFit="contain" />
              </HStack>
            </HStack>
          }
        >
          Game Leaders
        </SectionLabel>

        {/* No gap and every row flex:1 — the five rows split the remaining height evenly, so
            the portraits form one unbroken strip from just under the header to the card's
            bottom edge. Category labels can't sit between rows any more without breaking that
            strip, so they overlay the seam instead (see below). */}
        <VStack flex="1" minH={0} gap={0} align="stretch" mt={2}>
          {categories.map((cat, i) => {
            const awayPlayer = topOf(byTeam(awayId, cat.key), cat.sortBy);
            const homePlayer = topOf(homeId !== awayId ? byTeam(homeId, cat.key) : {}, cat.sortBy);

            return (
              <Box key={cat.label} flex="1" minH={0} position="relative" display="flex" flexDirection="column">
                {/* Overlaid on the top edge of the portrait strip rather than stacked above
                    the row — a label between rows would put a band of empty card between
                    every pair of faces, which is the spacing this layout is trying to lose.
                    It sits over headroom, not faces, because the crop is anchored to the top. */}
                <Text
                  position="absolute"
                  top={0}
                  left="50%"
                  transform="translateX(-50%)"
                  zIndex={2}
                  px="0.4rem"
                  py="0.1rem"
                  bg="rgba(10,10,12,0.82)"
                  borderBottomRadius="sm"
                  fontSize={isCompact ? "0.4375rem" : "0.5rem"}
                  fontWeight="900"
                  color="rgba(255,255,255,0.55)"
                  textTransform="uppercase"
                  letterSpacing="0.22em"
                  whiteSpace="nowrap"
                  pointerEvents="none"
                >
                  {cat.label}
                </Text>

                {/* gap 0 so each portrait runs right up to the centre rule — the away
                    player's on its right, the home player's on its left — while the name
                    and number sit hard against the card's outer edge, top-aligned. */}
                {/* gap 0 so each portrait runs right up to the centre rule — the away
                    player's on its right, the home player's on its left. The name and number
                    sit above the photo, top-aligned and hard against the card's outer edge. */}
                <Grid flex="1" minH={0} templateColumns="1fr 0.0625rem 1fr" gap={0} alignItems="stretch">
                  {/* Away — portrait behind, text outboard left */}
                  <Box position="relative" minW={0} overflow="hidden">
                    {renderPortrait(awayPlayer, awayColor, awayId, "away")}
                    <Box position="relative" zIndex={1} textAlign="left" pr={2} pt="0.15rem">
                      <Text
                        fontSize={isCompact ? "0.9rem" : "clamp(0.95rem, 1.15vw, 1.25rem)"}
                        fontWeight="900"
                        color="white"
                        lineClamp={1}
                        lineHeight={1.05}
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {awayPlayer ? getLastName(awayPlayer.name) : "—"}
                      </Text>
                      <Text
                        fontSize={isCompact ? "1rem" : "clamp(1.15rem, 1.5vw, 1.6rem)"}
                        fontWeight="950"
                        color={awayColor}
                        lineHeight={1.15}
                        whiteSpace="nowrap"
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {awayPlayer ? cat.format(awayPlayer) : "—"}
                      </Text>
                    </Box>
                  </Box>

                  <Box w="0.0625rem" bg="rgba(255,255,255,0.12)" zIndex={2} />

                  {/* Home — mirrored */}
                  <Box position="relative" minW={0} overflow="hidden">
                    {renderPortrait(homePlayer, homeColor, homeId, "home")}
                    <Box position="relative" zIndex={1} textAlign="right" pl={2} pt="0.15rem">
                      <Text
                        fontSize={isCompact ? "0.9rem" : "clamp(0.95rem, 1.15vw, 1.25rem)"}
                        fontWeight="900"
                        color="white"
                        lineClamp={1}
                        lineHeight={1.05}
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {homePlayer ? getLastName(homePlayer.name) : "—"}
                      </Text>
                      <Text
                        fontSize={isCompact ? "1rem" : "clamp(1.15rem, 1.5vw, 1.6rem)"}
                        fontWeight="950"
                        color={homeColor}
                        lineHeight={1.15}
                        whiteSpace="nowrap"
                        textShadow="0 0.0625rem 0.375rem rgba(0,0,0,0.9)"
                      >
                        {homePlayer ? cat.format(homePlayer) : "—"}
                      </Text>
                    </Box>
                  </Box>
                </Grid>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. NOTABLE PERFORMERS — Editorial player spotlight cards
// ═══════════════════════════════════════════════════════════════════════════════
const AUTO_ROTATE_MS = 4500;

// Which counting-stat lines a performer gets, and in what order, is driven by position —
// a QB leads with his passing line and picks up rushing as the secondary if he carried it.
// Positions come from production_scores and are already a small closed set:
// QB / RB / WR / TE / DL / LB / DB / DEF.
const STAT_CATEGORIES_BY_POSITION = {
  QB: ["passing", "rushing"],
  RB: ["rushing", "receiving"],
  WR: ["receiving", "rushing"],
  TE: ["receiving", "rushing"],
  DEF: ["defense"],
  DB: ["defense"],
  DL: ["defense"],
  LB: ["defense"],
  // Blocking is a backend ask, not a frontend derivation — see BACKEND_PIPELINE_TODO.md.
  // Nothing in any exported game carries an OL player or a blocking stat today, so these
  // read as empty and the card falls back to the mock performer set until the fields ship.
  OL: ["blocking"],
  C: ["blocking"],
  G: ["blocking"],
  T: ["blocking"],
};
const FALLBACK_STAT_CATEGORIES = ["passing", "rushing", "receiving", "defense"];

/**
 * Counting stats per category, as [label, value, keep] triples.
 * `keep` false drops a stat the player didn't register, so a QB who threw no picks
 * doesn't burn a slot on "0 INT" while a defender's fumble recovery still shows.
 * Every field here is present in individual_stats — verified non-zero somewhere across
 * all 145 exported games. There is no OL category and no blocking stat in any of them.
 */
const STAT_CHIP_BUILDERS = {
  passing: (s) => [
    ["C/ATT", `${s.completions ?? 0}/${s.attempts ?? 0}`, true],
    ["Pass Yds", s.yards ?? 0, true],
    ["Pass TD", s.touchdowns ?? 0, (s.touchdowns ?? 0) > 0],
    ["INT", s.interceptions ?? 0, (s.interceptions ?? 0) > 0],
  ],
  rushing: (s) => [
    ["Car", s.attempts ?? 0, true],
    ["Rush Yds", s.yards ?? 0, true],
    ["Rush TD", s.touchdowns ?? 0, (s.touchdowns ?? 0) > 0],
  ],
  receiving: (s) => [
    ["Rec", s.receptions ?? 0, true],
    ["Rec Yds", s.yards ?? 0, true],
    ["Rec TD", s.touchdowns ?? 0, (s.touchdowns ?? 0) > 0],
    ["Tgt", s.targets ?? 0, (s.targets ?? 0) > (s.receptions ?? 0)],
  ],
  blocking: (s) => [
    ["Snaps", s.snaps ?? 0, (s.snaps ?? 0) > 0],
    ["Pancakes", s.pancakes ?? 0, (s.pancakes ?? 0) > 0],
    ["Sacks All", s.sacks_allowed ?? 0, s.sacks_allowed != null],
    ["Press All", s.pressures_allowed ?? 0, s.pressures_allowed != null],
    ["Blown", s.blown_blocks ?? 0, s.blown_blocks != null],
  ],
  defense: (s) => [
    ["Tkl", statNum(s.tackles), true],
    ["Sacks", statNum(s.sacks), (s.sacks ?? 0) > 0],
    ["TFL", statNum(s.tfl), (s.tfl ?? 0) > 0],
    ["INT", s.interceptions ?? 0, (s.interceptions ?? 0) > 0],
    ["PBU", s.passes_defended ?? 0, (s.passes_defended ?? 0) > 0],
    ["FF", s.forced_fumbles ?? 0, (s.forced_fumbles ?? 0) > 0],
    ["FR", s.fumble_recoveries ?? 0, (s.fumble_recoveries ?? 0) > 0],
    ["QBH", s.qb_hurries ?? 0, (s.qb_hurries ?? 0) > 0],
    // `havoc` is on the backend ask list as a first-class field; until it ships this
    // reuses the one shared definition rather than the card inventing a second one.
    ["Havoc", statNum(s.havoc ?? havocOf(s)), (s.havoc ?? havocOf(s)) > 0],
  ],
};

const MAX_STAT_CHIPS = 6;

/**
 * The player's stat block: their position's primary category first, then the secondary
 * one if they had volume there — a QB's rushing line, a back's receiving line, and for
 * a defender the base tackle numbers followed by whatever havoc he actually generated.
 */
const buildStatChips = (playerKey, position, teamId, teamEntries) => {
  if (!playerKey) return [];
  const cats = (teamEntries || []).find(([id]) => id === teamId)?.[1] || {};
  const order = STAT_CATEGORIES_BY_POSITION[String(position ?? "").toUpperCase()] ?? FALLBACK_STAT_CATEGORIES;
  const chips = [];
  order.forEach((cat) => {
    const row = (cats[cat] || []).find((r) => r.player_key === playerKey);
    if (!row) return;
    (STAT_CHIP_BUILDERS[cat]?.(row) || []).forEach(([label, value, keep]) => {
      if (keep && chips.length < MAX_STAT_CHIPS) chips.push({ label, value });
    });
  });
  return chips;
};

// Unwrapping the 2026 object was not enough on its own: that export also renames the
// fields inside each row (`name` → `name_raw`, `production_total` → `production_score.
// total`), so rows came back shaped but empty — every performer sorted on `undefined`
// and rendered without a name. `productionEntries` does the wrapper AND the renames.
const normalizeProductionRows = (teamScores) => productionEntries(teamScores);

// `mobile`: a short card — a narrower portrait (so the photo scales down and the whole
// head fits), last name only, team · position and score on one line.
export const NotablePerformersCard = ({ awayId, homeId, productionScores, teamEntries, identity, mobile = false }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // Bumped on every advance AND every click. Keying the ticker and the progress sweep on
  // it remounts both, which restarts the animation — so selecting a performer by hand
  // gives a full fresh interval instead of inheriting whatever was left of the last one.
  // A counter rather than `index` so clicking the already-active button resets too.
  const [cycle, setCycle] = useState(0);
  const advanceTo = (next) => {
    setIndex(next);
    setCycle((c) => c + 1);
  };

  const mockPerformers = [
    { name: "Peters,Cameron", team: awayId, position: "QB", total: 24.8, chips: [{ label: "C/ATT", value: "19/28" }, { label: "Pass Yds", value: 294 }, { label: "Pass TD", value: 2 }, { label: "Car", value: 6 }, { label: "Rush Yds", value: 41 }] },
    { name: "Lockhart,Jared", team: homeId, position: "DB", total: 21.3, chips: [{ label: "Tkl", value: 7 }, { label: "PBU", value: 3 }, { label: "INT", value: 1 }, { label: "FR", value: 1 }, { label: "Havoc", value: 5 }] },
    { name: "Heckaman,Kheagian", team: awayId, position: "OL", total: 14.6, chips: [{ label: "Snaps", value: 68 }, { label: "Pancakes", value: 6 }, { label: "Sacks All", value: 0 }, { label: "Press All", value: 2 }, { label: "Blown", value: 1 }] },
  ];

  const producers = [
    ...normalizeProductionRows(productionScores?.[awayId]).map((p) => ({ ...p, team: awayId })),
    ...normalizeProductionRows(productionScores?.[homeId]).map((p) => ({ ...p, team: homeId })),
  ];

  const performers = (producers.length
    ? [...producers]
        .sort((a, b) => (b.production_total || 0) - (a.production_total || 0))
        .slice(0, 3)
        .map((p) => ({
          name: p.name,
          team: p.team,
          position: p.position,
          total: p.production_total || 0,
          chips: buildStatChips(p.player_key, p.position, p.team, teamEntries),
          player_key: p.player_key,
        }))
    : mockPerformers
  ).map((p) => {
    const [first, last] = splitDisplayName(p.name);
    return { ...p, first, last, images: resolveImages(identity, p, p.team) };
  });

  const active = performers[Math.min(index, performers.length - 1)];
  const activeColor = active.team === homeId ? homeColor : awayColor;

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.35s" }}>
      {/* Layer 1 — the portrait, full card height, bleeding from the left edge and fading
          out under the copy. Same construction as PlayerSpotlight's Star Impact panel. */}
      <Box position="absolute" left={0} top={0} bottom={0} w={mobile ? "42%" : "64%"} zIndex={0} overflow="hidden">
        <CandidateImage
          key={active.player_key ?? active.name}
          srcs={active.images}
          alt={`${active.first} ${active.last}`}
          w="full" h="full" objectFit="cover" objectPosition="top center"
          fallback={
          <Flex h="full" align="center" justify="center">
            <Image src={getTeamLogoSrc(active.team)} alt="" h="70%" maxW="80%" objectFit="contain" opacity={0.18} />
          </Flex>
          }
        />
        {/* Fade right into the card so the portrait never collides with the copy, plus a
            top scrim so the section label stays readable over a bright headshot. */}
        <Box position="absolute" inset={0} bg={`linear-gradient(to right, rgba(20,20,22,0) ${mobile ? "45%" : "22%"}, var(--part-bg, #141416) ${mobile ? "100%" : "84%"})`} pointerEvents="none" />
        <Box position="absolute" insetX={0} top={0} h="3rem" bg="linear-gradient(to bottom, rgba(20,20,22,0.9), rgba(20,20,22,0))" pointerEvents="none" />
      </Box>

      {/* Team-color edge, matching Star Impact */}
      <Box position="absolute" left={0} top={0} bottom={0} w="0.1875rem" bg={activeColor} zIndex={3} />

      {/* Layer 2 — copy */}
      <Box position="relative" zIndex={2} flex="1" minH={0} p="0.75rem" pb="0.5rem" display="flex" flexDirection="column">
        <Box flexShrink={0}>
          <SectionLabel>Notable Performers</SectionLabel>
        </Box>

        {/* CSS-driven auto-advance timer — no useEffect/setInterval, per AGENTS.md's useEffect ban.
            An invisible looping animation fires onAnimationIteration once per cycle; play/pause is
            purely declarative via animationPlayState. */}
        {performers.length > 1 && (
          <Box
            w={0} h={0} overflow="hidden"
            key={cycle}
            style={{ animation: `rotateTick ${AUTO_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }}
            onAnimationIteration={() => advanceTo((index + 1) % performers.length)}
          />
        )}

        {/* Name and numbers, bottom-anchored in the right half so the face stays visible */}
        <Box flex="1" minH={0} display="flex" flexDirection="column" justifyContent="flex-end" w={mobile ? "56%" : "58%"} ml="auto" minW={0}>
          {mobile ? (
            <>
              <Text fontSize="1.25rem" fontWeight="950" color="white" lineHeight={0.95} textTransform="uppercase" lineClamp={1}>
                {active.last}
              </Text>
              <Text mt="0.2rem" fontSize="0.62rem" fontWeight="900" color="rgba(255,255,255,0.5)" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
                {getTeamLabel(active.team)} <Box as="span" color={activeColor} mx="0.2rem">|</Box> {active.position || "—"}
                <Box as="span" color={activeColor} ml="0.5rem">{active.total.toFixed(1)} PROD</Box>
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="clamp(0.95rem, 1.35vw, 1.5rem)" fontWeight="950" color="white" lineHeight={0.92} textTransform="uppercase" lineClamp={1}>
                {active.first}
              </Text>
              <Text fontSize="clamp(0.95rem, 1.35vw, 1.5rem)" fontWeight="950" color="white" lineHeight={0.92} textTransform="uppercase" lineClamp={1}>
                {active.last}
              </Text>

              <Text mt="0.25rem" fontSize="clamp(0.5rem, 0.6vw, 0.62rem)" fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.16em" lineClamp={1}>
                {getTeamLabel(active.team)} <Box as="span" color={activeColor} mx="0.25rem">|</Box> {active.position || "—"}
              </Text>

              <Text mt="0.25rem" fontSize="clamp(0.58rem, 0.72vw, 0.78rem)" fontWeight="900" color={activeColor} lineClamp={1}>
                {active.total.toFixed(1)} Production Score
              </Text>
            </>
          )}

          {/* Counting stats — three across, capped at two rows. Which stats appear is
              position-driven, so a DB reads tackles/PBU/INT/FR/havoc where a back reads
              carries/yards/TD and his receiving line. */}
          {active.chips.length > 0 && (
            <Grid mt="0.375rem" templateColumns="repeat(3, minmax(0, 1fr))" gap="0.25rem 0.5rem" flexShrink={0}>
              {active.chips.map((chip) => (
                <Box key={chip.label} minW={0}>
                  <Text fontSize={mobile ? "0.85rem" : "clamp(0.66rem, 0.82vw, 0.88rem)"} fontWeight="950" color="white" lineHeight={1.05} lineClamp={1}>
                    {chip.value}
                  </Text>
                  <Text fontSize={mobile ? "0.5rem" : "clamp(0.4rem, 0.48vw, 0.5rem)"} fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" lineClamp={1}>
                    {chip.label}
                  </Text>
                </Box>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Control strip — full-bleed at the card's bottom edge, built like BannerControlStrip
          (own surface, top border, no side inset) rather than sitting inside the body padding. */}
      <Flex
        flexShrink={0} w="full" position="relative" zIndex={3}
        bg="rgba(10,10,12,0.92)" borderTop="0.125rem solid" borderColor="whiteAlpha.200"
        px="0.5rem" py="0.4rem" gap="0.375rem" align="center"
      >
        <Box
          as="button"
          onClick={() => setIsPlaying((p) => !p)}
          w="1.6rem" h="1.6rem" borderRadius="md" bg="rgba(255,255,255,0.08)"
          display="flex" alignItems="center" justifyContent="center"
          color="white" fontSize="0.6rem" cursor="pointer" flexShrink={0}
          _hover={{ bg: "rgba(255,255,255,0.15)" }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </Box>
        {performers.map((p, i) => (
          <Box
            key={i}
            as="button"
            onClick={() => advanceTo(i)}
            position="relative" overflow="hidden"
            flex="1" minW={0} h="1.6rem" px="0.5rem" borderRadius="md"
            bg={i === index ? (p.team === homeId ? homeColor : awayColor) : "rgba(255,255,255,0.08)"}
            color="white" fontSize="0.65rem" fontWeight="800" cursor="pointer"
            whiteSpace="nowrap" textOverflow="ellipsis"
            transition="all 0.2s"
            _hover={{ bg: i === index ? (p.team === homeId ? homeColor : awayColor) : "rgba(255,255,255,0.15)" }}
          >
            {/* Time-to-next-card, on the active button only. Same duration, easing and
                play state as the rotation ticker above, so the two stay locked without
                sharing any state — pausing freezes the sweep along with the rotation.
                scaleX, not width, to keep it off the layout path. */}
            {i === index && performers.length > 1 && (
              <Box
                key={cycle}
                className="rotate-sweep"
                position="absolute" inset={0} zIndex={0} bg="rgba(0,0,0,0.28)" pointerEvents="none"
                style={{ animation: `rotateSweep ${AUTO_ROTATE_MS}ms linear forwards`, animationPlayState: isPlaying ? "running" : "paused" }}
              />
            )}
            <Box as="span" position="relative" zIndex={1} display="block" overflow="hidden" textOverflow="ellipsis">
              {p.last || p.first}
            </Box>
          </Box>
        ))}
      </Flex>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6.5 GAME FACTOIDS — Rotating "quick at-a-glance" story card (compact density only)
// See Game Page Design Doc §5.13 for the full concept and what's still a stopgap.
// ═══════════════════════════════════════════════════════════════════════════════
const resolveFactoidTeam = (rawId, awayId, homeId, awayLabel, homeLabel) => {
  if (!rawId) return null;
  const norm = String(rawId).replace(/25$/, "").toLowerCase();
  if (norm === String(awayId).toLowerCase() || norm.includes(String(awayLabel).toLowerCase())) return "away";
  if (norm === String(homeId).toLowerCase() || norm.includes(String(homeLabel).toLowerCase())) return "home";
  return null;
};

const ordinal = (n) => {
  const v = Number(n);
  if (!v) return null;
  const s = ["th", "st", "nd", "rd"];
  const r = v % 100;
  return `${v}${s[(r - 20) % 10] || s[r] || s[0]}`;
};

const computeGameFactoids = (plays, awayId, homeId, awayLabel, homeLabel) => {
  const factoids = [];

  // 1. Largest single play — scan RUSH/PASS plays for the biggest positive gain, with full context.
  let biggest = null;
  plays.forEach((play) => {
    if (play.play_type !== "RUSH" && play.play_type !== "PASS") return;
    const action = (play.actions || [])[0];
    const yards = action?.net_yards || 0;
    if (yards <= 0) return;
    if (!biggest || yards > biggest.yards) {
      const player = play.play_type === "RUSH" ? action?.rusher : (action?.receiver || action?.passer);
      const side = resolveFactoidTeam(play.offense_team, awayId, homeId, awayLabel, homeLabel);
      biggest = {
        yards,
        player,
        side,
        type: play.play_type,
        quarter: play.quarter,
        down: play.down,
        distance: play.distance,
        isComplete: action?.isComplete,
        isScoring: play.scoring_event === true,
        isTurnover: play.turnover === true,
      };
    }
  });
  if (biggest) {
    const downDistance = biggest.down && biggest.distance != null ? `${ordinal(biggest.down)} & ${biggest.distance}` : null;
    const contextLine = [biggest.quarter ? `Q${biggest.quarter}` : null, downDistance].filter(Boolean).join(" · ");
    const playLabel = biggest.type === "RUSH" ? "Rush" : "Pass";
    const resultTag = biggest.isScoring ? "TOUCHDOWN" : biggest.isTurnover ? "TURNOVER" : null;
    const playerLine = [playLabel, biggest.player ? cleanName(biggest.player) : "Unknown"].join(" — ");
    factoids.push({
      key: "biggest-play",
      label: "Big Play",
      variant: "spotlight",
      title: "Largest Play",
      headline: `${biggest.yards} YDS`,
      contextLine,
      playerLine,
      resultTag,
      side: biggest.side,
    });
  }

  // 2. Explosive play differential — 20+ yard gains on RUSH/PASS, counted per side.
  let awayExplosive = 0;
  let homeExplosive = 0;
  plays.forEach((play) => {
    if (play.play_type !== "RUSH" && play.play_type !== "PASS") return;
    const yards = (play.actions || [])[0]?.net_yards || 0;
    if (yards < 20) return;
    const side = resolveFactoidTeam(play.offense_team, awayId, homeId, awayLabel, homeLabel);
    if (side === "away") awayExplosive += 1;
    else if (side === "home") homeExplosive += 1;
  });
  if (awayExplosive || homeExplosive) {
    factoids.push({
      key: "explosive",
      label: "Explosive",
      variant: "compare",
      title: "Explosive Plays (20+ yds)",
      awayValue: awayExplosive,
      homeValue: homeExplosive,
      lowerIsBetter: false,
    });
  }

  // 3. Penalties/discipline — team attribution is a regex stopgap on raw_text (see design doc P1).
  let awayPenalties = 0;
  let homePenalties = 0;
  let unattributed = 0;
  plays.forEach((play) => {
    if (play.play_type !== "PENALTY") return;
    const match = String(play.raw_text || "").match(/PENALTY\s+(\S+)/i);
    const side = match ? resolveFactoidTeam(match[1], awayId, homeId, awayLabel, homeLabel) : null;
    if (side === "away") awayPenalties += 1;
    else if (side === "home") homePenalties += 1;
    else unattributed += 1;
  });
  const totalPenalties = awayPenalties + homePenalties + unattributed;
  if (totalPenalties > 0) {
    factoids.push({
      key: "penalties",
      label: "Discipline",
      variant: "compare",
      title: "Penalties",
      awayValue: awayPenalties,
      homeValue: homePenalties,
      lowerIsBetter: true,
    });
  }

  return factoids;
};

export const GameFactoidsCard = ({ plays, awayId, homeId }) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const factoids = useMemo(
    () => computeGameFactoids(plays || [], awayId, homeId, awayLabel, homeLabel),
    [plays, awayId, homeId, awayLabel, homeLabel],
  );

  if (!factoids.length) return null;

  const active = factoids[Math.min(index, factoids.length - 1)];
  const activeColor = active.side === "home" ? homeColor : active.side === "away" ? awayColor : "rgba(255,255,255,0.6)";

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.4s" }}>
      <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
        <Box flexShrink={0}>
          <SectionLabel>Game Factoids</SectionLabel>
        </Box>

        {/* Same CSS-driven auto-advance pattern as Notable Performers — no useEffect/setInterval */}
        {factoids.length > 1 && (
          <Box
            w={0} h={0} overflow="hidden"
            style={{ animation: `rotateTick ${AUTO_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }}
            onAnimationIteration={() => setIndex((i) => (i + 1) % factoids.length)}
          />
        )}

        {active.variant === "compare" ? (
          <Flex flex="1" minH={0} direction="column" justify="center">
            <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.16em" mb="0.5rem">
              {active.title}
            </Text>
            <Grid templateColumns="1fr auto 1fr" gap="0.75rem" alignItems="center">
              <Text fontSize="clamp(1.2rem, 1.6vw, 1.6rem)" fontWeight="950" color={(active.awayValue >= active.homeValue) === !active.lowerIsBetter ? awayColor : "rgba(255,255,255,0.35)"} textAlign="left" lineHeight={1}>
                {active.awayValue}
              </Text>
              <MicroLabel>{awayLabel} · {homeLabel}</MicroLabel>
              <Text fontSize="clamp(1.2rem, 1.6vw, 1.6rem)" fontWeight="950" color={(active.homeValue >= active.awayValue) === !active.lowerIsBetter ? homeColor : "rgba(255,255,255,0.35)"} textAlign="right" lineHeight={1}>
                {active.homeValue}
              </Text>
            </Grid>
          </Flex>
        ) : (
          <Flex flex="1" minH={0} direction="column" justify="center">
            <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.16em" mb="0.25rem">
              {active.title}
            </Text>
            <Flex align="baseline" gap="0.5rem" mb="0.25rem">
              <Text fontSize="clamp(1.1rem, 1.5vw, 1.5rem)" fontWeight="950" color={activeColor} lineHeight={1.1} lineClamp={1}>
                {active.headline}
              </Text>
              {active.resultTag && (
                <Text fontSize="clamp(0.55rem, 0.65vw, 0.65rem)" fontWeight="900" color={active.resultTag === "TOUCHDOWN" ? "#22c55e" : "#ef4444"} letterSpacing="0.1em">
                  {active.resultTag}
                </Text>
              )}
            </Flex>
            {active.contextLine && (
              <Text fontSize="clamp(0.65rem, 0.8vw, 0.8rem)" fontWeight="700" color="rgba(255,255,255,0.55)" lineClamp={1}>
                {active.contextLine}
              </Text>
            )}
            <Text fontSize="clamp(0.65rem, 0.8vw, 0.8rem)" fontWeight="700" color="rgba(255,255,255,0.55)" lineClamp={1}>
              {active.playerLine}
            </Text>
          </Flex>
        )}

        <HStack gap="0.375rem" flexShrink={0} mt="0.5rem" align="stretch">
          <Box
            as="button"
            onClick={() => setIsPlaying((p) => !p)}
            w="1.75rem" h="1.75rem" borderRadius="md" bg="rgba(255,255,255,0.08)"
            display="flex" alignItems="center" justifyContent="center"
            color="white" fontSize="0.6rem" cursor="pointer" flexShrink={0}
            _hover={{ bg: "rgba(255,255,255,0.15)" }}
          >
            {isPlaying ? "❚❚" : "▶"}
          </Box>
          {factoids.map((f, i) => (
            <Box
              key={f.key}
              as="button"
              onClick={() => setIndex(i)}
              flex="1" minW={0} h="1.75rem" px="0.5rem" borderRadius="md"
              bg={i === index ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"}
              color="white" fontSize="0.65rem" fontWeight="800" cursor="pointer"
              whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis"
              transition="all 0.2s"
              _hover={{ bg: "rgba(255,255,255,0.15)" }}
            >
              {f.label}
            </Box>
          ))}
        </HStack>
      </Box>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. WIN PROBABILITY — `win_probability` off the game file
// ═══════════════════════════════════════════════════════════════════════════════
// `timeline[]` is one point per play — `{ sequence, quarter, clock, wp_home, score_home,
// score_away }` — with `pregame_home` in front and `final` behind it. Points are spaced by
// play order, not by clock: overtime snaps come through with `quarter: 4` and a clock that
// restarts, so a clock-based x-axis would fold OT back onto the fourth quarter. Quarter
// dividers sit where `quarter` changes in the data.
// Game Flow — two charts in one 1x1: Win Probability (top) and Expected
// Points (bottom). WP reads `win_probability`; EPA reads `epa_timeline`
// ({ [team_id]: []{ play_number, cumulative_epa, … } }, see the fetch
// contract). Neither is derived from play_by_play here — a missing block
// shows its own "not on file" line and the other chart still renders.
const WP_W = 800;
const WP_H = 140;
const EPA_W = 800;
const EPA_H = 200;

export const WinProbabilityCard = ({ winProbability, epaTimeline, awayId, homeId }) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const { wpPoints, dividers, hasData, pregameHome, source } = useMemo(() => {
    const timeline = Array.isArray(winProbability?.timeline) ? winProbability.timeline : [];
    const pre = typeof winProbability?.pregame_home === "number" ? winProbability.pregame_home : null;
    const fin = typeof winProbability?.final?.home === "number" ? winProbability.final.home : null;
    const series = [];
    if (pre != null) series.push({ wp: pre * 100, quarter: null });
    timeline.forEach((pt) => {
      if (typeof pt?.wp_home !== "number") return;
      series.push({ wp: pt.wp_home * 100, quarter: pt.quarter ?? null });
    });
    if (fin != null) series.push({ wp: fin * 100, quarter: null });
    const n = series.length;
    const points = series.map((pt, i) => ({ ...pt, gameProgress: n > 1 ? i / (n - 1) : 0 }));
    const divs = [];
    let lastQ = null;
    points.forEach((pt) => {
      if (pt.quarter == null) return;
      if (lastQ != null && pt.quarter !== lastQ) divs.push({ x: pt.gameProgress, label: `Q${pt.quarter}` });
      lastQ = pt.quarter;
    });
    return { wpPoints: points, dividers: divs, hasData: timeline.length > 0, pregameHome: pre, source: winProbability?.source ?? null };
  }, [winProbability]);

  const wpPath = useMemo(() => {
    if (wpPoints.length === 0) return "";
    return wpPoints.map((p, i) => {
      const x = p.gameProgress * WP_W;
      const y = WP_H - (p.wp / 100) * WP_H;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  }, [wpPoints]);

  // Expected Points — each team's own scrimmage plays on x, running EPA on
  // y. Both series share one y-scale so the gap between the lines is real.
  const epa = useMemo(() => {
    const seriesFor = (teamId) => {
      const rows = Array.isArray(epaTimeline?.[teamId]) ? epaTimeline[teamId] : [];
      return rows
        .filter((r) => typeof r?.cumulative_epa === "number")
        .map((r, i) => ({ x: typeof r.play_number === "number" ? r.play_number : i + 1, y: r.cumulative_epa }));
    };
    const away = seriesFor(awayId);
    const home = seriesFor(homeId);
    const all = [...away, ...home];
    if (all.length === 0) return { hasData: false, paths: { away: "", home: "" }, zeroY: EPA_H / 2, maxX: 0, yMin: 0, yMax: 0, finals: { away: null, home: null } };
    const maxX = Math.max(1, ...all.map((p) => p.x));
    const rawMin = Math.min(0, ...all.map((p) => p.y));
    const rawMax = Math.max(0, ...all.map((p) => p.y));
    const pad = Math.max(1, (rawMax - rawMin) * 0.08);
    const yMin = rawMin - pad;
    const yMax = rawMax + pad;
    const sx = (x) => (x / maxX) * EPA_W;
    const sy = (y) => EPA_H - ((y - yMin) / (yMax - yMin)) * EPA_H;
    const toPath = (pts) => (pts.length ? `M 0 ${sy(0)} ` + pts.map((p) => `L ${sx(p.x)} ${sy(p.y)}`).join(" ") : "");
    return {
      hasData: true,
      paths: { away: toPath(away), home: toPath(home) },
      zeroY: sy(0),
      maxX,
      yMin,
      yMax,
      finals: { away: away[away.length - 1]?.y ?? null, home: home[home.length - 1]?.y ?? null },
    };
  }, [epaTimeline, awayId, homeId]);

  const fmtEpa = (v) => (v == null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}`);
  const axisText = { fontSize: "clamp(0.55rem, 0.65vw, 0.65rem)", fontWeight: "black" };

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.4s" }}>
      <Box position="relative" zIndex={1} p={5} h="full" w="full" display="flex" flexDirection="column">
        <Box flexShrink={0}>
          <SectionLabel
            rightContent={
              <MicroLabel color="rgba(255,255,255,0.25)">
                {pregameHome != null ? `Pregame ${homeLabel} ${Math.round(pregameHome * 100)}%` : source ? String(source) : "—"}
              </MicroLabel>
            }
          >
            Game Flow
          </SectionLabel>
        </Box>

        <Flex direction="column" flex={1} minH={0} justify="space-between" gap={3}>
          {/* ── Win Probability ── */}
          <Box position="relative">
            <Flex align="center" justify="space-between" mb={1}>
              <MicroLabel color="rgba(255,255,255,0.45)">Win Probability</MicroLabel>
            </Flex>
            <svg viewBox={`0 0 ${WP_W} ${WP_H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
              <defs>
                <linearGradient id="wp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={homeColor} stopOpacity="0.3" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0.03)" />
                  <stop offset="100%" stopColor={awayColor} stopOpacity="0.3" />
                </linearGradient>
              </defs>

              <line x1="0" y1={WP_H / 2} x2={WP_W} y2={WP_H / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="4 4" />
              {dividers.map((d) => {
                const x = d.x * WP_W;
                return (
                  <g key={`${d.label}-${x}`}>
                    <line x1={x} y1="0" x2={x} y2={WP_H} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <text x={x + 4} y="12" fill="rgba(255,255,255,0.18)" fontSize="8" fontWeight="bold">{d.label}</text>
                  </g>
                );
              })}

              {hasData && (
                <>
                  <path d={`${wpPath} L ${WP_W} ${WP_H / 2} L 0 ${WP_H / 2} Z`} fill="url(#wp-area)" opacity="0.6" />
                  <path d={wpPath} fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="animate-draw" />
                </>
              )}
              {!hasData && (
                <text x={WP_W / 2} y={WP_H / 2 - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="11" fontWeight="bold" letterSpacing="0.1em">
                  NO WIN PROBABILITY ON FILE
                </text>
              )}
            </svg>

            {/* Vertical axis: the top of the chart is a home win, the bottom an away win. */}
            <Flex justify="space-between" mt={1} px={1}>
              <Text {...axisText} color={awayColor}>{awayLabel} ↓</Text>
              <Text {...axisText} color="rgba(255,255,255,0.25)">50%</Text>
              <Text {...axisText} color={homeColor}>{homeLabel} ↑</Text>
            </Flex>
          </Box>

          {/* ── Expected Points ── */}
          <Box position="relative">
            <Flex align="center" justify="space-between" mb={1}>
              <MicroLabel color="rgba(255,255,255,0.45)">Expected Points · cumulative EPA</MicroLabel>
              {epa.hasData && (
                <Flex gap={3}>
                  <Text {...axisText} color={awayColor}>{awayLabel} {fmtEpa(epa.finals.away)}</Text>
                  <Text {...axisText} color={homeColor}>{homeLabel} {fmtEpa(epa.finals.home)}</Text>
                </Flex>
              )}
            </Flex>
            <svg viewBox={`0 0 ${EPA_W} ${EPA_H}`} width="100%" style={{ overflow: "visible", display: "block" }}>
              <line x1="0" y1={epa.zeroY} x2={EPA_W} y2={epa.zeroY} stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="4 4" />
              {epa.hasData && (
                <>
                  <text x="0" y={epa.zeroY - 4} fill="rgba(255,255,255,0.25)" fontSize="8" fontWeight="bold">0</text>
                  <text x="0" y="10" fill="rgba(255,255,255,0.25)" fontSize="8" fontWeight="bold">{fmtEpa(epa.yMax)}</text>
                  <text x="0" y={EPA_H - 2} fill="rgba(255,255,255,0.25)" fontSize="8" fontWeight="bold">{fmtEpa(epa.yMin)}</text>
                  <path d={epa.paths.away} fill="none" stroke={awayColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
                  <path d={epa.paths.home} fill="none" stroke={homeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
                </>
              )}
              {!epa.hasData && (
                <text x={EPA_W / 2} y={EPA_H / 2 - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="11" fontWeight="bold" letterSpacing="0.1em">
                  NO EPA TIMELINE ON FILE
                </text>
              )}
            </svg>
            <Flex justify="space-between" mt={1} px={1}>
              <Text {...axisText} color="rgba(255,255,255,0.25)">PLAY 1</Text>
              <Text {...axisText} color="rgba(255,255,255,0.25)">SCRIMMAGE PLAY NO.</Text>
              <Text {...axisText} color="rgba(255,255,255,0.25)">{epa.hasData ? `PLAY ${epa.maxX}` : "—"}</Text>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 8. DRIVE SUMMARY — Editorial table with team color rows
// ═══════════════════════════════════════════════════════════════════════════════
// Reads `drive_summary[]` off the game file. Per drive: `offense_team`, `quarter_start`,
// `clock_start`, `start_yardline_absolute`, `quarter_end`, `clock_end`,
// `end_yardline_absolute`, `possession_obtained_by`, `plays_total`, `yards_net`, `result`,
// `points`, `is_overtime`, `epa`, `third_down`/`fourth_down` {attempts, conversions},
// `explosive_plays`, `penalties` {count, yards}, `score_after` {home, away}.
//
// Yardlines are offense-relative (0 = own goal line, 100 = the end zone they're driving
// at). The spot label is composed from that — own side under 50, the defense's side over —
// and the field strip flips home drives so 0 is always the away end zone.
//
// `time_of_possession` is not on the drive yet; the column dashes until it ships.
const OBTAINED_LABEL = {
  kickoff: "Kickoff",
  punt: "Punt",
  interception: "INT",
  fumble_recovery: "Fumble",
  missed_fg: "Missed FG",
  blocked_fg: "Blk FG",
  downs: "Downs",
  blocked_punt: "Blk Punt",
  onside_kick: "Onside",
};

const RESULT_LABEL = {
  BlockedFG: "Blk FG",
  MissedFG: "Missed FG",
  INT_TD: "INT TD",
  FUMB_TD: "FUMB TD",
  EndHalf: "End Half",
  EndGame: "End Game",
};

const spotLabel = (yard, offenseId, defenseId) => {
  if (typeof yard !== "number") return "—";
  if (yard <= 50) return `${getTeamLabel(offenseId)} ${yard}`;
  return `${getTeamLabel(defenseId)} ${100 - yard}`;
};

const conv = (block) => (block ? `${block.conversions ?? 0}-${block.attempts ?? 0}` : "—");

const toDriveRow = (d, awayId, homeId) => {
  const isHome = normTeamId(d.offense_team) === normTeamId(homeId);
  const offenseId = isHome ? homeId : awayId;
  const defenseId = isHome ? awayId : homeId;
  const flip = (y) => (typeof y === "number" ? (isHome ? 100 - y : y) : null);
  return {
    team: isHome ? "home" : "away",
    quarter: d.is_overtime ? "OT" : `Q${d.quarter_start ?? "—"}`,
    startSpot: spotLabel(d.start_yardline_absolute, offenseId, defenseId),
    startTime: d.clock_start ?? "—",
    obtained: OBTAINED_LABEL[d.possession_obtained_by] ?? String(d.possession_obtained_by ?? "—").replace(/_/g, " "),
    endSpot: spotLabel(d.end_yardline_absolute, offenseId, defenseId),
    endTime: d.clock_end ?? "—",
    result: d.result ?? "—",
    resultLabel: RESULT_LABEL[d.result] ?? d.result ?? "—",
    plays: d.plays_total ?? null,
    yards: d.yards_net ?? null,
    top: d.time_of_possession ?? null,
    epa: typeof d.epa === "number" ? d.epa : null,
    thirdDown: conv(d.third_down),
    fourthDown: conv(d.fourth_down),
    explosive: d.explosive_plays ?? null,
    penaltyCount: d.penalties?.count ?? null,
    penaltyYards: d.penalties?.yards ?? null,
    awayScore: d.score_after?.away ?? null,
    homeScore: d.score_after?.home ?? null,
    startYard: flip(d.start_yardline_absolute),
    endYard: flip(d.end_yardline_absolute),
  };
};

// Drive results by how good they were for the offense — the pill's weight follows:
//   best    TD                                    solid green
//   good    FG                                    green tint
//   neutral Punt, End Half, End Game              quiet outline
//   bad     FUMB, INT, Downs, Missed/Blocked FG   red tint
//   worst   INT TD, FUMB TD, Safety, Blk Punt     solid red (the other side scored)
const RESULT_TIER = {
  TD: "best",
  FG: "good",
  Punt: "neutral", EndHalf: "neutral", EndGame: "neutral",
  FUMB: "bad", INT: "bad", Downs: "bad", MissedFG: "bad", BlockedFG: "bad",
  INT_TD: "worst", FUMB_TD: "worst", SAFETY: "worst", "BLK PUNT": "worst",
};
const TIER_STYLE = {
  best: { bg: "#16A34A", border: "#22C55E", color: "#FFFFFF", glow: "0 0 0.6rem rgba(34,197,94,0.45)" },
  good: { bg: "rgba(34,197,94,0.2)", border: "rgba(34,197,94,0.6)", color: "#4ADE80" },
  neutral: { bg: "transparent", border: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.5)" },
  bad: { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.55)", color: "#F87171" },
  worst: { bg: "#DC2626", border: "#EF4444", color: "#FFFFFF", glow: "0 0 0.6rem rgba(239,68,68,0.45)" },
};

export const DriveResultPill = ({ result, label, size = "0.62rem", wrap = false }) => {
  const t = TIER_STYLE[RESULT_TIER[result] ?? "neutral"];
  return (
    <Box px="0.45rem" py="0.15rem" bg={t.bg} border={`1px solid ${t.border}`} borderRadius="md" boxShadow={t.glow ?? "none"} display="inline-block" maxW="full">
      <Text fontSize={size} fontWeight="950" color={t.color} textTransform="uppercase" letterSpacing="0.05em" textAlign="center" lineHeight={wrap ? 1.05 : undefined} whiteSpace={wrap ? "normal" : "nowrap"} lineClamp={wrap ? 2 : 1}>
        {label}
      </Text>
    </Box>
  );
};

export const DriveSummaryTable = ({ driveSummary, awayId, homeId }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const drives = useMemo(
    () => (Array.isArray(driveSummary) ? driveSummary : []).map((d) => toDriveRow(d, awayId, homeId)),
    [driveSummary, awayId, homeId],
  );

  // Grouped header, the way a drive chart reads: where it started, where it ended, what it
  // cost, and how it went. Sized in rem with the field taking the remainder.
  const COLS = "3.75rem 2rem 4rem 2.75rem 4rem 4rem 2.75rem 4.5rem 4rem 3rem 3.25rem 3.5rem 2.5rem 2.75rem 3.75rem minmax(9rem, 1fr)";
  const GROUPS = [
    { label: "", span: 1 },
    { label: "", span: 1 },
    { label: "Drive Started", span: 3 },
    { label: "Drive Ended", span: 3 },
    { label: "Consumed", span: 2 },
    { label: "How It Went", span: 4 },
    { label: "", span: 1 },
    { label: "Field", span: 1 },
  ];
  const HEADERS = ["Team", "Qtr", "Spot", "Time", "Obtained", "Spot", "Time", "Result", "Plays-Yds", "TOP", "EPA", "3rd/4th", "Expl", "Pen", "Score", ""];
  const CENTERED = new Set([1, 3, 6, 8, 9, 10, 11, 12, 13, 14]);

  const cell = (i, children) => (
    <Box key={i} minW={0} textAlign={CENTERED.has(i) ? "center" : "left"}>
      {children}
    </Box>
  );

  return (
    <Box
      w="full"
      position="relative"
      borderRadius="xl"
      overflow="hidden"
      className="animate-slide-in"
      style={{ animationDelay: "0.45s", background: "#141416" }}
    >
      <Box position="relative" zIndex={1}>
        <Box px={5} pt={5}>
          <SectionLabel rightContent={<MicroLabel color="rgba(255,255,255,0.3)">{drives.length} Drives</MicroLabel>}>
            Drive Summary
          </SectionLabel>
        </Box>

        <Box overflowX="auto">
          <Box minW="66rem">
            {drives.length === 0 && (
              <Flex align="center" justify="center" py={8}>
                <MicroLabel>No drive summary on file</MicroLabel>
              </Flex>
            )}
            {/* Group header */}
            <Grid templateColumns={COLS} gap={2} px={4} pt={2.5} pb={1}>
              {GROUPS.map((g, i) => (
                <Box key={i} gridColumn={`span ${g.span}`} textAlign={g.span > 1 ? "center" : "left"} minW={0}>
                  {g.label && (
                    <Text fontSize="clamp(0.42rem, 0.52vw, 0.55rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.18em" lineClamp={1}>
                      {g.label}
                    </Text>
                  )}
                </Box>
              ))}
            </Grid>

            {/* Column header */}
            <Grid templateColumns={COLS} gap={2} px={4} pb={2} borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.08)" bg="rgba(255,255,255,0.02)">
              {HEADERS.map((h, i) =>
                cell(i, h ? <MicroLabel color="rgba(255,255,255,0.25)">{h}</MicroLabel> : null),
              )}
            </Grid>

            {drives.map((d, i) => {
              const isHome = d.team === "home";
              const teamColor = isHome ? homeColor : awayColor;
              const num = (v) => (v > 0 ? `+${v}` : String(v));
              const dash = (v) => (v == null ? "—" : v);

              return (
                <Grid
                  key={i}
                  templateColumns={COLS}
                  gap={2}
                  px={4}
                  py={2}
                  alignItems="center"
                  borderBottom="0.0625rem solid"
                  borderColor="rgba(255,255,255,0.04)"
                  className="animate-fade"
                  style={{ animationDelay: `${0.5 + i * 0.02}s` }}
                  _hover={{ bg: "rgba(255,255,255,0.04)" }}
                  transition="background 0.15s"
                >
                  {cell(0,
                    <Flex align="center" gap={1.5} minW={0}>
                      <Box w="0.4375rem" h="0.4375rem" borderRadius="full" bg={teamColor} flexShrink={0} />
                      <Text fontSize="clamp(0.6rem, 0.75vw, 0.75rem)" fontWeight="black" color="white" lineClamp={1}>
                        {isHome ? homeLabel : awayLabel}
                      </Text>
                    </Flex>,
                  )}
                  {cell(1, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color={d.quarter === "OT" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"} fontWeight="900">{d.quarter}</Text>)}
                  {cell(2, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" color="rgba(255,255,255,0.8)" fontWeight="bold" lineClamp={1}>{d.startSpot}</Text>)}
                  {cell(3, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.5)" fontWeight="bold">{d.startTime}</Text>)}
                  {cell(4, <Text fontSize="clamp(0.52rem, 0.64vw, 0.64rem)" color="rgba(255,255,255,0.45)" fontWeight="800" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1}>{d.obtained}</Text>)}
                  {cell(5, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" color="rgba(255,255,255,0.8)" fontWeight="bold" lineClamp={1}>{d.endSpot}</Text>)}
                  {cell(6, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.5)" fontWeight="bold">{d.endTime}</Text>)}
                  {cell(7, <DriveResultPill result={d.result} label={d.resultLabel} size="clamp(0.48rem, 0.58vw, 0.58rem)" />)}
                  {cell(8, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" color="white" fontWeight="950">{dash(d.plays)}-{dash(d.yards)}</Text>)}
                  {cell(9, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.55)" fontWeight="bold">{dash(d.top)}</Text>)}
                  {cell(10, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" fontWeight="950" color={d.epa == null ? "rgba(255,255,255,0.25)" : d.epa >= 0 ? "#22c55e" : "#ef4444"}>{d.epa == null ? "—" : num(d.epa.toFixed(1))}</Text>)}
                  {cell(11, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" color="rgba(255,255,255,0.7)" fontWeight="800">{d.thirdDown} / {d.fourthDown}</Text>)}
                  {cell(12, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" fontWeight="950" color={d.explosive > 0 ? "#fbbf24" : "rgba(255,255,255,0.25)"}>{dash(d.explosive)}</Text>)}
                  {cell(13, <Text fontSize="clamp(0.55rem, 0.68vw, 0.68rem)" fontWeight="800" color={d.penaltyCount > 0 ? "#ef4444" : "rgba(255,255,255,0.25)"}>{d.penaltyCount > 0 ? `${d.penaltyCount} · ${Math.abs(d.penaltyYards ?? 0)}` : dash(d.penaltyCount)}</Text>)}
                  {cell(14, <Text fontSize="clamp(0.58rem, 0.72vw, 0.72rem)" fontWeight="950" color="rgba(255,255,255,0.75)">{dash(d.awayScore)}-{dash(d.homeScore)}</Text>)}
                  {cell(15,
                    <DriveFieldStrip
                      startYard={d.startYard ?? 0}
                      endYard={d.endYard ?? 0}
                      plays={d.plays ?? 1}
                      team={d.team}
                      awayColor={awayColor}
                      homeColor={homeColor}
                      awayLabel={awayLabel}
                      homeLabel={homeLabel}
                      height="1.4rem"
                      showLabels={false}
                    />,
                  )}
                </Grid>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box position="absolute" bottom={0} left={0} right={0} h="0.125rem" bg="linear-gradient(90deg, transparent, rgba(229,62,62,0.4), transparent)" zIndex={2} />
    </Box>
  );
};

// ── Drive Summary — phones ──────────────────────────────────────────────────
// One card per drive, two rows always showing: everything about the drive (team,
// start, plays-yards, EPA, explosive plays, result, score after it), then the drive on the field. Tap to open
// the rest (start, end, how it was obtained, 3rd/4th, explosives, penalties).
// Drives group by quarter; `wrapGroup(quarter, index, node)` lets the page register
// each group with its jump menu.
const MobileDetail = ({ label, value, color = "rgba(255,255,255,0.85)" }) => (
  <Box minW={0}>
    <Text fontSize="0.55rem" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.12em">{label}</Text>
    <Text fontSize="0.78rem" fontWeight="900" color={color} lineClamp={1}>{value}</Text>
  </Box>
);

const DriveStat = ({ value, label, color = "white" }) => (
  <Box minW={0} textAlign="center">
    <Text fontSize="0.85rem" fontWeight="950" color={color} lineHeight={1.1} whiteSpace="nowrap">{value}</Text>
    <Text fontSize="0.5rem" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em" mt="0.15rem" whiteSpace="nowrap">{label}</Text>
  </Box>
);

export const DriveSummaryMobile = ({ driveSummary, awayId, homeId, wrapGroup = (q, i, node) => node }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  });

  const drives = useMemo(
    () => (Array.isArray(driveSummary) ? driveSummary : []).map((d) => toDriveRow(d, awayId, homeId)),
    [driveSummary, awayId, homeId],
  );
  const groups = useMemo(() => {
    const out = [];
    drives.forEach((d, i) => {
      const last = out[out.length - 1];
      if (last && last.quarter === d.quarter) last.items.push({ d, i });
      else out.push({ quarter: d.quarter, items: [{ d, i }] });
    });
    return out;
  }, [drives]);

  if (drives.length === 0) {
    return <Flex align="center" justify="center" py={8}><MicroLabel>No drive summary on file</MicroLabel></Flex>;
  }

  const dash = (v) => (v == null ? "—" : v);
  const signed = (v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1));

  return (
    <Box w="full">
      {groups.map((g, gi) => <Box key={g.quarter}>{wrapGroup(g.quarter, gi, (
        <Box>
          <Flex align="center" justify="space-between" px="0.75rem" py="0.5rem" bg="rgba(255,255,255,0.03)" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="0.78rem" fontWeight="black" color="white" letterSpacing="0.14em">{g.quarter === "OT" ? "OVERTIME" : `QUARTER ${g.quarter.slice(1)}`}</Text>
            <Text fontSize="0.62rem" fontWeight="900" color="rgba(255,255,255,0.4)" letterSpacing="0.1em">{g.items.length} DRIVES</Text>
          </Flex>
          {g.items.map(({ d, i }) => {
            const isHome = d.team === "home";
            const isOpen = open.has(i);
            return (
              <Box key={i} as="button" type="button" onClick={() => toggle(i)} w="full" textAlign="left" display="block" px="0.75rem" py="0.6rem" borderBottom="1px solid" borderColor="whiteAlpha.100" bg={isOpen ? "rgba(255,255,255,0.03)" : "transparent"}>
                {/* Row 1 — everything about the drive, value over label, as tall as the bar */}
                <Grid templateColumns="minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 0.6fr) minmax(0, 1fr) auto" columnGap="0.35rem" alignItems="center">
                  <Flex align="center" gap="0.4rem" minW={0}>
                    <Image src={getTeamLogoSrc(isHome ? homeId : awayId)} alt={isHome ? homeLabel : awayLabel} w="1.9rem" h="1.9rem" objectFit="contain" flexShrink={0} />
                    <Text fontSize="0.62rem" fontWeight="900" color="rgba(255,255,255,0.5)" letterSpacing="0.04em">{d.startTime}</Text>
                  </Flex>
                  <DriveStat value={`${dash(d.plays)}-${dash(d.yards)}`} label="Plays-Yds" />
                  <DriveStat value={d.epa == null ? "—" : signed(d.epa)} label="EPA" color={d.epa == null ? "rgba(255,255,255,0.3)" : d.epa >= 0 ? "#22c55e" : "#ef4444"} />
                  <DriveStat value={dash(d.explosive)} label="Expl" color={d.explosive > 0 ? "#fbbf24" : "rgba(255,255,255,0.3)"} />
                  <Flex justify="center" minW={0}>
                    <DriveResultPill result={d.result} label={d.resultLabel} size="0.66rem" wrap />
                  </Flex>
                  <Flex align="center" justify="flex-end" gap="0.25rem" minW={0}>
                    {/* Score after the drive — the Scoring Plays scorebug, small */}
                    <Flex flexShrink={0}>
                      <Flex direction="column" align="center" bg="white" color="black" px="0.3rem" py="0.15rem" minW="2.2rem">
                        <Text fontSize="0.5rem" fontWeight="900" letterSpacing="0.06em" lineHeight={1.1}>{awayLabel}</Text>
                        <Text fontSize="1rem" fontWeight="900" lineHeight={1}>{dash(d.awayScore)}</Text>
                      </Flex>
                      <Flex direction="column" align="center" bg={homeColor} color="white" px="0.3rem" py="0.15rem" minW="2.2rem">
                        <Text fontSize="0.5rem" fontWeight="900" letterSpacing="0.06em" lineHeight={1.1}>{homeLabel}</Text>
                        <Text fontSize="1rem" fontWeight="900" lineHeight={1}>{dash(d.homeScore)}</Text>
                      </Flex>
                    </Flex>
                    <Box color="rgba(255,255,255,0.45)" transform={isOpen ? "rotate(180deg)" : "none"} transition="transform 0.15s" display="flex" flexShrink={0}>
                      <ChevronDown size={13} />
                    </Box>
                  </Flex>
                </Grid>

                {/* Row 2 — the drive on the field */}
                <Box mt="0.5rem">
                  <DriveFieldStrip startYard={d.startYard ?? 0} endYard={d.endYard ?? 0} plays={d.plays ?? 1} team={d.team} awayColor={awayColor} homeColor={homeColor} awayLabel={awayLabel} homeLabel={homeLabel} height="1.6rem" showLabels={false} />
                </Box>

                {isOpen && (
                  <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="0.6rem" mt="0.6rem" pt="0.6rem" borderTop="1px solid" borderColor="whiteAlpha.100">
                    <MobileDetail label="Started" value={`${d.startSpot} · ${d.startTime}`} />
                    <MobileDetail label="Obtained" value={d.obtained} />
                    <MobileDetail label="Ended" value={`${d.endSpot} · ${d.endTime}`} />
                    <MobileDetail label="Time of Poss" value={dash(d.top)} />
                    <MobileDetail label="3rd / 4th" value={`${d.thirdDown} / ${d.fourthDown}`} />
                    <MobileDetail label="Penalties" value={d.penaltyCount > 0 ? `${d.penaltyCount} · ${Math.abs(d.penaltyYards ?? 0)} yds` : dash(d.penaltyCount)} color={d.penaltyCount > 0 ? "#ef4444" : undefined} />
                  </Grid>
                )}
              </Box>
            );
          })}
        </Box>
      ))}</Box>)}
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCORING PLAYS — `scoring_plays[]` off the game file
// ═══════════════════════════════════════════════════════════════════════════════
// One row per scoring play: `period`, `clock`, `team_id`, `points`, `play_type`,
// `scoring_type`, `description`, `play_id`, `drive_id`, `score_after`, `players[]`
// ({ role, player_id, name }) and a `drive` block ({ plays, yards,
// start/end_yardline_absolute, quarter_start, clock_start, possession_obtained_by,
// time_of_possession_seconds }).
//
// PATs and two-point tries ship as their own rows. The card reads score-by-score, so a try
// that follows its touchdown (same team, same period and clock) folds into that row: the
// points add up, the try becomes the parenthetical, and the running score is the try's.
//
// The headline is composed from the roles — receiver-first on a pass, rusher-first on a
// run, kicker-first on a kick, returner-first on a return. Yardage isn't a field on the
// row (only inside `description`), so the headline has none until the backend ships it.
//
// OT: scoring rows carry `period: 4` with the clock at 0:00, so overtime is read off the
// drive's `is_overtime` flag via `drive_id`.
const lastName = (raw) => splitDisplayName(raw)[1] || splitDisplayName(raw)[0] || "";
const byRole = (players, role) => (players ?? []).find((p) => p?.role === role)?.name ?? null;

const scoringHeadline = (row) => {
  const players = row.players ?? [];
  const st = String(row.scoring_type ?? "");
  const pt = String(row.play_type ?? "");
  const desc = String(row.description ?? "").toLowerCase();
  const receiver = byRole(players, "receiver");
  const passer = byRole(players, "passer");
  const rusher = byRole(players, "rusher");
  const kicker = byRole(players, "kicker");
  const returner = byRole(players, "returner");

  if (st === "FG") return kicker ? `${lastName(kicker)} Field Goal` : "Field Goal";
  if (st === "SAFETY") return "Safety";
  if (st === "INTERCEPTION_TD") return returner ? `${lastName(returner)} Interception Return` : "Interception Return";
  if (st === "FUMBLE_TD") {
    if (desc.includes("blocked")) return returner ? `${lastName(returner)} Blocked Punt Return` : "Blocked Punt Return";
    return returner ? `${lastName(returner)} Fumble Return` : "Fumble Return";
  }
  if (pt === "PASS" && receiver) return passer ? `${lastName(receiver)} Pass from ${lastName(passer)}` : `${lastName(receiver)} Pass`;
  if (pt === "RUSH" && rusher) return `${lastName(rusher)} Run`;
  if (pt === "KICKOFF" && returner) return `${lastName(returner)} Kickoff Return`;
  if (pt === "PUNT" && returner) return `${lastName(returner)} Punt Return`;
  return st.replace(/_/g, " ");
};

const tryLabel = (row) => {
  const players = row.players ?? [];
  const st = String(row.scoring_type ?? "");
  if (st === "PAT") {
    const kicker = byRole(players, "kicker");
    return kicker ? `(${lastName(kicker)} Kick)` : "(Kick)";
  }
  if (st === "TWO_POINT") {
    const who = byRole(players, "receiver") ?? byRole(players, "rusher");
    return who ? `(${lastName(who)} 2-Pt)` : "(2-Pt Conversion)";
  }
  return null;
};

const scorerOf = (row) => {
  const players = row.players ?? [];
  const pick = (role) => players.find((p) => p?.role === role) ?? null;
  return pick("receiver") ?? pick("rusher") ?? pick("returner") ?? pick("kicker") ?? null;
};

const mmss = (secs) => {
  if (typeof secs !== "number") return null;
  const m = Math.floor(secs / 60);
  const sec = Math.round(secs % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const isTry = (row) => ["PAT", "TWO_POINT"].includes(String(row?.scoring_type ?? ""));

const buildScoringPlays = ({ scoringPlays, driveSummary, awayId, homeId, identity }) => {
  const rows = Array.isArray(scoringPlays) ? scoringPlays : [];
  const otDrives = new Set((Array.isArray(driveSummary) ? driveSummary : []).filter((d) => d?.is_overtime).map((d) => d.drive_id));
  const out = [];

  rows.forEach((row) => {
    const prev = out[out.length - 1];
    const sameMoment = prev && prev.teamId === row.team_id && prev.period === row.period && prev.clock === row.clock;
    if (isTry(row) && prev && sameMoment && prev.type === "TD_LIKE") {
      prev.points += row.points ?? 0;
      prev.extra = tryLabel(row);
      prev.awayScore = row.score_after?.away ?? prev.awayScore;
      prev.homeScore = row.score_after?.home ?? prev.homeScore;
      return;
    }

    const isHome = normTeamId(row.team_id) === normTeamId(homeId);
    const flip = (y) => (typeof y === "number" ? (isHome ? 100 - y : y) : null);
    const scorerRow = scorerOf(row);
    const scorer = scorerRow?.name ?? null;
    const st = String(row.scoring_type ?? "");
    const tdLike = st.endsWith("TD");
    out.push({
      key: row.play_id ?? `${row.period}-${row.clock}-${row.team_id}-${out.length}`,
      teamId: row.team_id,
      team: isHome ? "home" : "away",
      period: row.period,
      quarter: otDrives.has(row.drive_id) ? 5 : (row.period ?? 1),
      clock: row.clock ?? "—",
      type: tdLike ? "TD_LIKE" : st,
      typeLabel: st.replace(/_/g, " "),
      points: row.points ?? 0,
      line: scoringHeadline(row),
      extra: null,
      scorer,
      scorerImages: scorerRow ? resolveImages(identity, { player_key: scorerRow.player_id, name: scorerRow.name }, row.team_id) : [],
      awayScore: row.score_after?.away ?? null,
      homeScore: row.score_after?.home ?? null,
      drivePlays: row.drive?.plays ?? null,
      driveYards: row.drive?.yards ?? null,
      drivePossession: mmss(row.drive?.time_of_possession_seconds),
      driveStartYard: flip(row.drive?.start_yardline_absolute),
      driveEndYard: flip(row.drive?.end_yardline_absolute),
    });
  });

  return out;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 9. SCORING PLAYS TIMELINE — Editorial scoring events
// ═══════════════════════════════════════════════════════════════════════════════
const SCORING_ROTATE_MS = 5200;
/** Past this many scores the per-score strip stops fitting on one line and quarter tabs
 *  take over. Measured against the 2-column slot, where eight already overrun it. */
const MAX_SCORE_BUTTONS = 7;

/** Fixed-orientation field: away end zone left, home end zone right, drive drawn between. */
const FIELD_TURF = "#1F4F2B";
const FIELD_LINE = "rgba(255,255,255,0.16)";

const DriveFieldStrip = ({
  startYard,
  endYard,
  plays,
  team,
  awayColor,
  homeColor,
  awayLabel,
  homeLabel,
  height = "2.75rem",
  showLabels = true,
}) => {
  const from = Math.max(0, Math.min(100, startYard));
  const to = Math.max(0, Math.min(100, endYard));
  const left = Math.min(from, to);
  const width = Math.abs(to - from);
  const goingRight = to > from;
  const teamColor = team === "home" ? homeColor : awayColor;

  // One notch per play, so a twelve-play march and a one-play strike are told apart at a
  // glance. The last segment — the play that ended the drive — is picked out in white.
  const playCount = Math.max(1, Number(plays) || 1);
  const step = (to - from) / playCount;
  const notches = Array.from({ length: playCount - 1 }, (_, i) => from + step * (i + 1));
  const lastFrom = from + step * (playCount - 1);
  const lastLeft = Math.min(lastFrom, to);
  const lastWidth = Math.abs(to - lastFrom);
  const barH = showLabels ? "0.4375rem" : "0.3125rem";

  const endZone = (color, label) => (
    <Flex w="11%" flexShrink={0} align="center" justify="center" bg={color} minW={0}>
      {showLabels && (
        <Text fontSize="clamp(0.4rem, 0.5vw, 0.52rem)" fontWeight="900" color="white" letterSpacing="0.12em" textShadow="0 0.0625rem 0.125rem rgba(0,0,0,0.7)" lineClamp={1}>
          {label}
        </Text>
      )}
    </Flex>
  );

  return (
    <Flex w="full" h={height} borderRadius="sm" overflow="hidden" border="0.0625rem solid" borderColor="rgba(255,255,255,0.12)">
      {endZone(awayColor, awayLabel)}

      <Box flex="1" position="relative" bg={FIELD_TURF} minW={0}>
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((yd) => (
          <Box key={yd} position="absolute" top={0} bottom={0} left={`${yd}%`} w="0.0625rem" bg={yd === 50 ? "rgba(255,255,255,0.3)" : FIELD_LINE} />
        ))}

        <Box position="absolute" top="50%" left={`${left}%`} w={`${width}%`} h={barH} bg={teamColor} borderRadius="full" transform="translateY(-50%)" boxShadow="0 0.0625rem 0.25rem rgba(0,0,0,0.55)" />
        <Box position="absolute" top="50%" left={`${lastLeft}%`} w={`${lastWidth}%`} h={barH} bg="rgba(255,255,255,0.92)" borderRadius="full" transform="translateY(-50%)" />

        {notches.map((pos, i) => (
          <Box key={i} position="absolute" top="50%" left={`${pos}%`} w="0.09375rem" h={showLabels ? "0.8125rem" : "0.5625rem"} bg="rgba(0,0,0,0.55)" transform="translate(-50%, -50%)" />
        ))}

        <Box position="absolute" top="50%" left={`${from}%`} w={showLabels ? "0.625rem" : "0.4375rem"} h={showLabels ? "0.625rem" : "0.4375rem"} borderRadius="full" bg="white" border="0.125rem solid" borderColor={teamColor} transform="translate(-50%, -50%)" />

        {showLabels && (
          <Box position="absolute" top="50%" left={`${to}%`} w="1.125rem" h="1.125rem" borderRadius="full" bg="rgba(255,255,255,0.16)" transform="translate(-50%, -50%)" />
        )}
        <Box
          position="absolute"
          top="50%"
          left={`${to}%`}
          w={0}
          h={0}
          transform="translate(-50%, -50%)"
          borderTop={showLabels ? "0.4375rem solid transparent" : "0.3125rem solid transparent"}
          borderBottom={showLabels ? "0.4375rem solid transparent" : "0.3125rem solid transparent"}
          borderLeft={goingRight ? (showLabels ? "0.5625rem solid white" : "0.375rem solid white") : undefined}
          borderRight={goingRight ? undefined : (showLabels ? "0.5625rem solid white" : "0.375rem solid white")}
        />
      </Box>

      {endZone(homeColor, homeLabel)}
    </Flex>
  );
};

// `mobile`: no headshot or watermark, a smaller scorebug, and the card takes its natural
// height (description + scorebug, drive line + field, score buttons) instead of a slot's.
export const ScoringPlaysCard = ({ scoringPlays, driveSummary, identity, awayId, homeId, mobile = false }) => {
  const awayColor = getTeamAccent(awayId);
  const homeColor = getTeamAccent(homeId);
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  const advanceTo = (next) => {
    setIndex(next);
    setCycle((c) => c + 1);
  };

  const plays = useMemo(
    () => buildScoringPlays({ scoringPlays, driveSummary, awayId, homeId, identity }),
    [scoringPlays, driveSummary, awayId, homeId, identity],
  );

  if (plays.length === 0) {
    return (
      <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.45s" }}>
        <Box position="relative" zIndex={1} p="1rem" h="full" w="full" display="flex" flexDirection="column">
          <SectionLabel>Scoring Plays</SectionLabel>
          <Flex flex="1" align="center" justify="center">
            <MicroLabel>No scoring plays on file</MicroLabel>
          </Flex>
        </Box>
      </EditorialCard>
    );
  }

  const active = plays[Math.min(index, plays.length - 1)];
  const isHome = active.team === "home";
  const teamColor = isHome ? homeColor : awayColor;
  const dash = (v) => (v == null ? "—" : v);

  // Default is one button per score, showing the running score it produced. Quarter tabs
  // are the fallback for the games that would otherwise blow the strip out: more scores
  // than fit on one line, or anything that reached overtime.
  const hasOvertime = plays.some((p) => p.quarter > 4);
  const useQuarterTabs = plays.length > MAX_SCORE_BUTTONS || hasOvertime;
  const quarters = [...new Set(plays.map((p) => p.quarter))].sort((a, b) => a - b);
  const quarterLabel = (q) => (q <= 4 ? `Q${q}` : q === 5 ? "OT" : `${q - 4}OT`);
  const visible = plays
    .map((p, i) => ({ ...p, i }))
    .filter((p) => !useQuarterTabs || p.quarter === active.quarter);

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h={mobile ? "auto" : "full"} borderRadius={mobile ? "0" : "xl"} w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.45s" }}>
      {/* The card changes hands via the ghosted mark alone — no colour wash over the
          surface, which stays the same flat card ground as every other card on the tab.
          The scorer's face carries it when there's a headshot; the team mark stands in
          when there isn't. */}
      {mobile ? null : active.scorerImages.length ? (
        <CandidateImage
          key={active.key}
          srcs={active.scorerImages}
          fallback={<Image src={getTeamLogoSrc(isHome ? homeId : awayId)} alt="" position="absolute" left="-2.5rem" bottom="-3rem" h="115%" objectFit="contain" opacity={0.07} zIndex={0} pointerEvents="none" />}
          alt=""
          position="absolute"
          left="1.5rem"
          top={0}
          h="full"
          objectFit="contain"
          objectPosition="bottom"
          opacity={0.16}
          zIndex={0}
          pointerEvents="none"
          style={{ maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }}
        />
      ) : (
        <Image src={getTeamLogoSrc(isHome ? homeId : awayId)} alt="" position="absolute" left="-2.5rem" bottom="-3rem" h="115%" objectFit="contain" opacity={0.07} zIndex={0} pointerEvents="none" />
      )}

      <Box position="relative" zIndex={1} p={mobile ? "0.75rem" : "1rem"} pb="0.5rem" h={mobile ? "auto" : "full"} w="full" display="flex" flexDirection="column">
        <Flex align="start" justify="space-between" gap={mobile ? "0.6rem" : "1rem"} flexShrink={0}>
          <Box minW={0} flex="1">
            <SectionLabel>Scoring Plays</SectionLabel>

            {/* The play, as a headline */}
            <Text fontSize={mobile ? "1.05rem" : "clamp(1rem, 1.7vw, 1.75rem)"} fontWeight="950" fontStyle="italic" color="white" textTransform="uppercase" lineHeight={1.02} letterSpacing="-0.02em" lineClamp={mobile ? 3 : 2} mt="0.25rem">
              {active.line}
            </Text>
            {active.extra && (
              <Text fontSize="clamp(0.62rem, 0.78vw, 0.8rem)" fontWeight="700" color="rgba(255,255,255,0.55)" mt="0.1875rem" lineClamp={1}>
                {active.extra}
              </Text>
            )}
          </Box>

          {/* Scorebug, lifted from the Magazine Spread lab row, with the points for this
              play sitting to its left rather than under it */}
          <Flex align="center" gap={mobile ? "0.4rem" : "0.75rem"} flexShrink={0}>
            <Box textAlign="right">
              <Text fontSize={mobile ? "1.15rem" : "clamp(1.3rem, 2vw, 2rem)"} fontWeight="950" color={teamColor} lineHeight={1}>
                +{active.points}
              </Text>
              <Text fontSize="clamp(0.44rem, 0.55vw, 0.58rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.14em" whiteSpace="nowrap">
                {active.typeLabel}
              </Text>
            </Box>

            <Flex>
              <Flex direction="column" align="center" bg="white" color="black" px={mobile ? "0.6rem" : "1.5rem"} py={mobile ? "0.35rem" : "0.5rem"} minW={mobile ? "3.4rem" : "6rem"}>
                <Text fontSize="clamp(0.62rem, 0.8vw, 0.82rem)" fontWeight="900" letterSpacing="0.1em">{awayLabel}</Text>
                <Text key={`a${cycle}`} className={!isHome ? "score-tick" : undefined} fontSize={mobile ? "1.6rem" : "clamp(2rem, 3.4vw, 3.5rem)"} fontWeight="900" lineHeight={1}>
                  {dash(active.awayScore)}
                </Text>
              </Flex>
              <Flex direction="column" align="center" bg={homeColor} color="white" px={mobile ? "0.6rem" : "1.5rem"} py={mobile ? "0.35rem" : "0.5rem"} minW={mobile ? "3.4rem" : "6rem"}>
                <Text fontSize="clamp(0.62rem, 0.8vw, 0.82rem)" fontWeight="900" letterSpacing="0.1em">{homeLabel}</Text>
                <Text key={`h${cycle}`} className={isHome ? "score-tick" : undefined} fontSize={mobile ? "1.6rem" : "clamp(2rem, 3.4vw, 3.5rem)"} fontWeight="900" lineHeight={1}>
                  {dash(active.homeScore)}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {/* Drive line sits directly above the field it describes */}
        <Box flex={mobile ? "none" : "1"} minH={0} display="flex" flexDirection="column" justifyContent="flex-end" gap="0.3125rem" mt={mobile ? "0.9rem" : "0.5rem"}>
          <Flex align="baseline" gap="0.5rem" flexWrap="wrap">
            <Text fontSize={mobile ? "0.66rem" : "clamp(0.5rem, 0.62vw, 0.64rem)"} fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.14em">
              {quarterLabel(active.quarter)} · {active.clock}
            </Text>
            {active.drivePlays != null && (
              <Text fontSize={mobile ? "0.66rem" : "clamp(0.5rem, 0.62vw, 0.64rem)"} fontWeight="900" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.14em">
                {active.drivePlays} plays · {dash(active.driveYards)} yds{active.drivePossession ? ` · ${active.drivePossession}` : ""}
              </Text>
            )}
          </Flex>

          <DriveFieldStrip startYard={active.driveStartYard ?? 0} endYard={active.driveEndYard ?? 0} plays={active.drivePlays ?? 1} team={active.team} awayColor={awayColor} homeColor={homeColor} awayLabel={awayLabel} homeLabel={homeLabel} />
        </Box>

        {/* Auto-advance ticker — same CSS-driven pattern as Notable Performers */}
        {plays.length > 1 && (
          <Box
            key={cycle}
            w={0} h={0} overflow="hidden"
            style={{ animation: `rotateTick ${SCORING_ROTATE_MS}ms linear infinite`, animationPlayState: isPlaying ? "running" : "paused" }}
            onAnimationIteration={() => advanceTo((index + 1) % plays.length)}
          />
        )}
      </Box>

      {/* Two-tier control: quarter tabs, then one pip per score inside that quarter */}
      <Flex
        flexShrink={0} w="full" position="relative" zIndex={2}
        bg="rgba(10,10,12,0.92)" borderTop="0.125rem solid" borderColor="whiteAlpha.200"
        px="0.375rem" py="0.3125rem" gap="0.375rem" align="center" overflow="hidden"
      >
        <Box
          as="button"
          onClick={() => setIsPlaying((v) => !v)}
          w="1.25rem" h="1.25rem" borderRadius="md" bg="rgba(255,255,255,0.08)"
          display="flex" alignItems="center" justifyContent="center"
          color="white" fontSize="0.48rem" cursor="pointer" flexShrink={0}
          _hover={{ bg: "rgba(255,255,255,0.15)" }}
        >
          {isPlaying ? "❚❚" : "▶"}
        </Box>

        {useQuarterTabs && (
          <HStack gap="0.25rem" flexShrink={0}>
            {quarters.map((q) => {
              const first = plays.findIndex((pl) => pl.quarter === q);
              const isActive = q === active.quarter;
              return (
                <Box
                  key={q}
                  as="button"
                  onClick={() => advanceTo(first)}
                  h="1.7rem" px="0.5rem" borderRadius="md"
                  bg={isActive ? teamColor : "rgba(255,255,255,0.08)"}
                  color="white" fontSize="0.62rem" fontWeight="900" cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: isActive ? teamColor : "rgba(255,255,255,0.15)" }}
                >
                  {quarterLabel(q)}
                </Box>
              );
            })}
          </HStack>
        )}

        {/* One button per score: the running score it produced, a chevron against whichever
            side moved, and the scoring team's mark. The active one carries the same fill
            sweep the Notable Performers strip uses. */}
        {/* `nowrap` matters more than it looks — a wrapped second row silently grows the
            strip and eats the card's height, so an overrun scrolls instead. */}
        <Box display="flex" flexWrap="nowrap" gap="0.1875rem" overflowX="auto" overflowY="hidden" flex="1" minW={0}>
          {visible.map((p) => {
            const isActive = p.i === index;
            const pTeamColor = p.team === "home" ? homeColor : awayColor;
            const pIsHome = p.team === "home";
            return (
              <Box
                key={p.key}
                as="button"
                onClick={() => advanceTo(p.i)}
                position="relative" overflow="hidden"
                h="1.7rem" px="0.375rem" borderRadius="sm"
                bg={isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}
                borderBottom="0.125rem solid"
                borderBottomColor={isActive ? pTeamColor : "transparent"}
                cursor="pointer" flexShrink={0}
                transition="background 0.2s, border-color 0.2s"
                _hover={{ bg: "rgba(255,255,255,0.16)" }}
              >
                {isActive && (
                  <Box
                    key={cycle}
                    className="rotate-sweep"
                    position="absolute" inset={0} bg={pTeamColor} opacity={0.28} pointerEvents="none"
                    style={{ animation: `rotateSweep ${SCORING_ROTATE_MS}ms linear forwards`, animationPlayState: isPlaying ? "running" : "paused" }}
                  />
                )}
                <Flex position="relative" zIndex={1} align="center" gap="0.25rem" h="full">
                  <Flex align="center" gap="0.0625rem">
                    <Text fontSize="0.62rem" fontWeight="900" color={!pIsHome ? "white" : "rgba(255,255,255,0.45)"} lineHeight={1}>
                      {dash(p.awayScore)}
                    </Text>
                    {!pIsHome && <ChevronUp size={9} color={pTeamColor} strokeWidth={3.5} />}
                    <Text fontSize="0.6rem" fontWeight="900" color="rgba(255,255,255,0.3)" lineHeight={1}>
                      -
                    </Text>
                    <Text fontSize="0.62rem" fontWeight="900" color={pIsHome ? "white" : "rgba(255,255,255,0.45)"} lineHeight={1}>
                      {dash(p.homeScore)}
                    </Text>
                    {pIsHome && <ChevronUp size={9} color={pTeamColor} strokeWidth={3.5} />}
                  </Flex>
                  <Box w="0.0625rem" h="0.8rem" bg="rgba(255,255,255,0.28)" flexShrink={0} />
                  <Image src={getTeamLogoSrc(pIsHome ? homeId : awayId)} alt="" w="0.85rem" h="0.85rem" objectFit="contain" flexShrink={0} />
                </Flex>
              </Box>
            );
          })}
        </Box>

      </Flex>
    </EditorialCard>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SUMMARY TAB — PageShell Grid Layout
// ═══════════════════════════════════════════════════════════════════════════════
// Grid layout:
//   Row 1: The March (4x1) — DEFERRED past launch.0, not rendered
//   Row 2: ScoringSummary (1x1) | TeamStats (2x2)     | MVP (1x1)
//   Row 3: WinProb (1x1)        | TeamStats cont      | GameLeaders (1x2)
//   Row 4: GameInfo (1x1)       | DriveSummary (2x1)  | GameLeaders cont
//
//   Column reading order: left = Scoring Summary / Win Probability / Meta,
//   center = Team Stats / Drive Summary, right = Notable Performers / Game Leaders.
//   Auto-placement does the work — the emit order below is what sets the columns.
//   Row 5: Chains Moved (2x1) | Series Results (2x1)
//   Drive Summary — its own Drives tab since 2026-09-20 (DrivesTab.js); the
//   table still lives in this file and is exported from here.
// ═══════════════════════════════════════════════════════════════════════════════

export const GameSummaryTabV2 = ({
  game,
  awayId,
  homeId,
  meta,
  teamStats,
  advancedTeam,
  teamEntries,
  playerSeasons,
  priorPlayerSeasons = [],
  productionScores,
  drives,
  plays,
  leagueAvg = null,
}) => {
  const { isCompact } = useLayoutDensity();
  const identity = useMemo(() => buildIdentityIndex(playerSeasons, priorPlayerSeasons), [playerSeasons, priorPlayerSeasons]);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      {/* Row 1: The March — pulled from the tab for launch.0 (see AFTER_LAUNCH_0.md §1).
          `FieldPositionMarch` is left intact above; re-add this slot to bring it back. */}

      {isCompact ? (
        <>
          {/* COMPACT ONLY — Team Stats and Game Leaders get full width (they're the densest
              cards here); everything else pairs up 2-and-2 instead of cramming 4 across a row.
              Mobile and standard density are untouched — see the else branch below. */}

          {/* Team Stats — full width, keeps its 2-row height */}
          <PageShell.Slot cols={4} rows={2}>
            <Box w="full" h="full">
              <TeamStatsComparisonCard awayId={awayId} homeId={homeId} teamStats={teamStats} advancedTeam={advancedTeam} game={game} leagueAvg={leagueAvg} />
            </Box>
          </PageShell.Slot>

          {/* Game Info + Scoring Summary — paired */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <GameInfoCard meta={meta} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ScoringSummaryCard scoreByQuarter={game?.score_by_quarter} awayScore={game?.away_team?.score} homeScore={game?.home_team?.score} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Notable Performers + Win Probability — paired */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <NotablePerformersCard awayId={awayId} homeId={homeId} productionScores={productionScores} teamEntries={teamEntries} identity={identity} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <GameFactoidsCard plays={plays} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Game Leaders — full width, keeps its 2-row height */}
          <PageShell.Slot cols={4} rows={2}>
            <Box w="full" h="full">
              <GameLeadersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} />
            </Box>
          </PageShell.Slot>

          {/* Scoring Plays — full width, its own row */}
          <PageShell.Slot cols={4}>
            <Box w="full" h="full">
              <ScoringPlaysCard scoringPlays={game?.scoring_plays} driveSummary={game?.drive_summary} identity={identity} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Series read — two half-width cards, the last row */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ChainsMovedCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <SeriesResultsCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
        </>
      ) : (
        <>
          {/* Row 2 left: Scoring Summary — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <ScoringSummaryCard scoreByQuarter={game?.score_by_quarter} awayScore={game?.away_team?.score} homeScore={game?.home_team?.score} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Row 2-3 center-left: Team Stats — 1x2 */}
          <PageShell.Slot cols={1} rows={2}>
            <Box w="full" h="full">
              <TeamStatsComparisonCard awayId={awayId} homeId={homeId} teamStats={teamStats} advancedTeam={advancedTeam} game={game} leagueAvg={leagueAvg} />
            </Box>
          </PageShell.Slot>

          {/* Row 2-3 center-right: PAR Breakdown — 1x2 */}
          <PageShell.Slot cols={1} rows={2}>
            <Box w="full" h="full">
              <AdvancedBasicsCard awayId={awayId} homeId={homeId} drives={drives} plays={plays} teamStats={teamStats} advancedBasics={game?.advanced_basics} leagueAvg={leagueAvg} />
            </Box>
          </PageShell.Slot>

          {/* Row 2 right: MVP / Notable Performers — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <NotablePerformersCard awayId={awayId} homeId={homeId} productionScores={productionScores} teamEntries={teamEntries} identity={identity} />
            </Box>
          </PageShell.Slot>

          {/* Row 3 left: Game Flow (Win Probability + Expected Points) — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <WinProbabilityCard winProbability={game?.win_probability} epaTimeline={game?.epa_timeline} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Row 3-4 right: Game Leaders — 1x2 */}
          <PageShell.Slot cols={1} rows={2}>
            <Box w="full" h="full">
              <GameLeadersCard awayId={awayId} homeId={homeId} teamEntries={teamEntries} identity={identity} />
            </Box>
          </PageShell.Slot>

          {/* Row 4 left: Game Info / Meta — 1x1 */}
          <PageShell.Slot cols={1}>
            <Box w="full" h="full">
              <GameInfoCard meta={meta} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Row 4 center: Scoring Plays — 2x1 */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ScoringPlaysCard scoringPlays={game?.scoring_plays} driveSummary={game?.drive_summary} identity={identity} awayId={awayId} homeId={homeId} />
            </Box>
          </PageShell.Slot>

          {/* Series read — two half-width cards, the last row */}
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <ChainsMovedCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
          <PageShell.Slot cols={2}>
            <Box w="full" h="full">
              <SeriesResultsCard seriesSummary={game?.series_summary} awayId={awayId} homeId={homeId} accent={getTeamAccent(awayId)} />
            </Box>
          </PageShell.Slot>
        </>
      )}
    </>
  );
};

export default GameSummaryTabV2;
