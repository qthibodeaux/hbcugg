import { getTeamColor, getTeamLabel } from "../../../../utils/gameSummary/teamIdentity";
import { useMemo } from "react";
import { EditorialCard, SectionLabel, MicroLabel } from "./SummaryPrimitives";
import { Box, Flex, Text } from "@chakra-ui/react";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

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
