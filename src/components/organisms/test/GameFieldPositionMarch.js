import { Box, Text, Flex, HStack } from "@chakra-ui/react";
import { getTeamColor, getTeamLabel } from "../../../utils/gameSummary/teamIdentity";
import { useMemo } from "react";
import { MicroLabel } from "../../game/page/summary/SummaryPrimitives";
import { ResponsiveContainer, ComposedChart, Area, ReferenceArea, ReferenceLine, XAxis, YAxis, Tooltip, Line } from "recharts";

// Existing implementation extracted from GameSummaryTabV2.
// Retained, deferred experiment; intentionally not registered or loaded by the live page.

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
/** Lighten a hex color toward white by `amount` (0-1) — used to show "on defense" (washed out) vs "on offense" (true color). */
const lightenHex = (hex, amount) => {
  const h = String(hex).replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const mix = (c) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

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
export const FieldPositionMarch = ({ plays, awayId, homeId }) => {
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
