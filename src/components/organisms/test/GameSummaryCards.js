import { useMemo, useState } from "react";
import { Box, Flex, Grid, Text, Image, VStack } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";


// ─── Team Meta Lookup ────────────────────────────────────────────────────────
const TEAM_META = teamsData.teams.reduce((acc, t) => {
  acc[t.exportId] = t;
  acc[t.exportId.replace(/25$/, "")] = t;
  acc[t.id] = t;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? null;
const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id)?.colors?.primary ?? fallback;
const getTeamLogoSrc = (id) => `/assets/${id?.replace(/25$/, "")}.svg`;
const getTeamLabel = (id) => getTeam(id)?.shortName ?? id?.toUpperCase() ?? "—";

// ─── Formatting Helpers ──────────────────────────────────────────────────────
const fmtPct = (val) => (val != null ? `${Math.round(val * 100)}%` : "0%");

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GAME OVERVIEW HERO CARD
// ═══════════════════════════════════════════════════════════════════════════════
export const GameOverviewHeroCard = ({ awayId, homeId, meta }) => {
  const away = getTeam(awayId);
  const home = getTeam(homeId);

  const awayScore = meta.away_team?.score ?? 0;
  const homeScore = meta.home_team?.score ?? 0;
  const isAwayWinner = awayScore > homeScore;
  const isHomeWinner = homeScore > awayScore;

  const primaryAway = away?.colors?.primary ?? "#4A90D9";
  const primaryHome = home?.colors?.primary ?? "#E53E3E";

  const winBorderColor = isAwayWinner ? primaryAway : isHomeWinner ? primaryHome : "transparent";

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderLeft={winBorderColor !== "transparent" ? `5px solid ${winBorderColor}` : "1px solid"}
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      p={4}
      mb={3}
    >
      {/* Ambient team-colored background glow */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(90deg, ${primaryAway}20 0%, transparent 50%, ${primaryHome}20 100%)`}
        pointerEvents="none"
      />

      <Flex direction="column" align="center" justify="center" position="relative" zIndex={1} gap={2}>
        <Text fontSize="9px" color="text.muted" fontWeight="900" textTransform="uppercase" letterSpacing="0.16em">
          Game Summary · {meta.date}
        </Text>

        <Grid templateColumns="1.2fr auto 1.2fr" gap={3} w="full" alignItems="center">
          {/* Away Team Info */}
          <Flex align="center" gap={3} justify="end">
            <Box textAlign="right">
              <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase">
                Away
              </Text>
              <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1.1}>
                {getTeamLabel(awayId)}
              </Text>
              <Text fontSize="9px" color="text.muted" fontWeight="bold">
                {away?.mascot}
              </Text>
            </Box>
            <Image src={getTeamLogoSrc(awayId)} alt="" h="46px" w="46px" objectFit="contain" />
          </Flex>

          {/* Core Score Tension */}
          <Flex align="center" gap={4} justify="center" minW="100px">
            <Text fontSize="3xl" fontWeight="950" color={isAwayWinner ? "brand.400" : "text.secondary"}>
              {awayScore}
            </Text>
            <Text fontSize="xs" fontWeight="900" color="text.muted" px={1.5} py="2px" bg="whiteAlpha.100" borderRadius="md">
              FINAL
            </Text>
            <Text fontSize="3xl" fontWeight="950" color={isHomeWinner ? "brand.400" : "text.secondary"}>
              {homeScore}
            </Text>
          </Flex>

          {/* Home Team Info */}
          <Flex align="center" gap={3}>
            <Image src={getTeamLogoSrc(homeId)} alt="" h="46px" w="46px" objectFit="contain" />
            <Box textAlign="left">
              <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase">
                Home
              </Text>
              <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1.1}>
                {getTeamLabel(homeId)}
              </Text>
              <Text fontSize="9px" color="text.muted" fontWeight="bold">
                {home?.mascot}
              </Text>
            </Box>
          </Flex>
        </Grid>

        <Text fontSize="9.5px" color="text.muted" fontWeight="bold" textAlign="center" mt={1}>
          📍 {meta.site}
        </Text>
      </Flex>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. IMPACT LEADERS CARD
// ═══════════════════════════════════════════════════════════════════════════════
const getInitials = (name) => {
  const parts = String(name ?? "").split(",");
  return (parts[1]?.trim()[0] || "") + (parts[0]?.trim()[0] || "");
};

const getDisplayName = (name) => {
  const str = String(name ?? "");
  if (str.includes(",")) {
    const parts = str.split(",");
    return `${parts[1]?.trim()} ${parts[0]?.trim()}`;
  }
  return str;
};

export const ImpactLeadersCard = ({ awayId, homeId, teamEntries, imageMap }) => {
  const byTeam = (tid, key) => {
    const entry = teamEntries.find(([id]) => id === tid);
    return entry?.[1]?.[key] ?? [];
  };

  const topOf = (arr, field) => [...arr].sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0))[0];

  const LeaderRow = ({ category, awayPlayer, homePlayer, field }) => {
    const renderAvatar = (p, color) => {
      if (!p) return <Box w="28px" h="28px" borderRadius="lg" bg="whiteAlpha.100" flexShrink={0} />;
      const imgUrl = imageMap[p.player_key];
      return (
        <Box w="28px" h="28px" borderRadius="lg" overflow="hidden" bg={color} border="1.5px solid whiteAlpha.200" flexShrink={0}>
          {imgUrl ? (
            <Image src={imgUrl} w="full" h="full" objectFit="cover" />
          ) : (
            <Flex w="full" h="full" align="center" justify="center">
              <Text fontSize="9px" fontWeight="950" color="white">{getInitials(p.name)}</Text>
            </Flex>
          )}
        </Box>
      );
    };

    const getStatString = (p, cat) => {
      if (!p) return "—";
      if (cat === "Passing") return `${p.yards} YDS, ${p.touchdowns} TD`;
      if (cat === "Rushing") return `${p.yards} YDS, ${p.attempts} CAR`;
      if (cat === "Receiving") return `${p.yards} YDS, ${p.receptions} REC`;
      return `${p.tackles || 0} TKL`;
    };

    return (
      <Box py={2} borderBottom="1px solid" borderColor="whiteAlpha.50" w="full">
        <Text fontSize="7.5px" fontWeight="900" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" textAlign="center" mb={1}>
          {category}
        </Text>
        <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
          {/* Away Leader */}
          <Flex align="center" gap={2} justify="end" minW={0}>
            <Box textAlign="right" minW={0}>
              <Text fontSize="10.5px" fontWeight="900" color="text.primary" truncate>
                {getDisplayName(awayPlayer?.name)}
              </Text>
              <Text fontSize="9px" fontWeight="bold" color="brand.400">
                {getStatString(awayPlayer, category)}
              </Text>
            </Box>
            {renderAvatar(awayPlayer, getTeamColor(awayId))}
          </Flex>

          <Box w="1px" h="24px" bg="whiteAlpha.100" />

          {/* Home Leader */}
          <Flex align="center" gap={2} minW={0}>
            {renderAvatar(homePlayer, getTeamColor(homeId))}
            <Box textAlign="left" minW={0}>
              <Text fontSize="10.5px" fontWeight="900" color="text.primary" truncate>
                {getDisplayName(homePlayer?.name)}
              </Text>
              <Text fontSize="9px" fontWeight="bold" color="brand.400">
                {getStatString(homePlayer, category)}
              </Text>
            </Box>
          </Flex>
        </Grid>
      </Box>
    );
  };

  const categories = [
    { label: "Passing", key: "passing", sortBy: "yards" },
    { label: "Rushing", key: "rushing", sortBy: "yards" },
    { label: "Receiving", key: "receiving", sortBy: "yards" },
    { label: "Tackles", key: "defense", sortBy: "tackles" },
  ];

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      mb={3}
    >
      <Flex align="center" gap={1.5} mb={3} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
        <Box w="4px" h="12px" bg="brand.500" borderRadius="xs" />
        <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
          Impact Leaders
        </Text>
      </Flex>

      <VStack gap={1} w="full">
        {categories.map((cat) => {
          const awayL = topOf(byTeam(awayId, cat.key), cat.sortBy);
          const homeL = topOf(byTeam(homeId, cat.key), cat.sortBy);
          return (
            <LeaderRow
              key={cat.label}
              category={cat.label}
              awayPlayer={awayL}
              homePlayer={homeL}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. BROADCAST COMPARISON CARD
// ═══════════════════════════════════════════════════════════════════════════════
export const BroadcastComparisonCard = ({ awayId, homeId, teamBox, advancedTeam }) => {
  const aBox = teamBox[awayId] ?? {};
  const hBox = teamBox[homeId] ?? {};
  const aAdv = advancedTeam[awayId] ?? {};
  const hAdv = advancedTeam[homeId] ?? {};

  const StatMetricRow = ({ label, awayVal, homeVal, formatVal, lowerIsBetter = false }) => {
    const displayAway = formatVal ? formatVal(awayVal) : awayVal;
    const displayHome = formatVal ? formatVal(homeVal) : homeVal;

    const total = (Number(awayVal) || 0) + (Number(homeVal) || 0);
    const awayPct = total > 0 ? (Number(awayVal) / total) * 100 : 50;

    const awayWins =
      awayVal != null && homeVal != null
        ? lowerIsBetter
          ? Number(awayVal) <= Number(homeVal)
          : Number(awayVal) >= Number(homeVal)
        : null;

    return (
      <Box py="6px" borderBottom="1px solid" borderColor="whiteAlpha.50" w="full">
        <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center" mb={1}>
          <Text fontSize="12px" fontWeight="950" color={awayWins === true ? "brand.400" : "text.secondary"}>
            {displayAway}
          </Text>
          <Text fontSize="8.5px" color="text.muted" fontWeight="900" textTransform="uppercase" letterSpacing="0.06em" textAlign="center" minW="100px">
            {label}
          </Text>
          <Text fontSize="12px" fontWeight="950" color={awayWins === false ? "brand.400" : "text.secondary"} textAlign="right">
            {displayHome}
          </Text>
        </Grid>
        <Flex h="3.5px" borderRadius="full" overflow="hidden" bg="whiteAlpha.100">
          <Box flex={`0 0 ${awayPct}%`} bg={awayWins !== false ? getTeamColor(awayId) : "whiteAlpha.300"} />
          <Box flex={`0 0 ${100 - awayPct}%`} bg={awayWins === false ? getTeamColor(homeId) : "whiteAlpha.300"} />
        </Flex>
      </Box>
    );
  };

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      mb={3}
    >
      <Flex align="center" gap={1.5} mb={3} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
        <Box w="4px" h="12px" bg="brand.500" borderRadius="xs" />
        <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
          Team Broadcast Board
        </Text>
      </Flex>

      <VStack gap={0} w="full">
        <StatMetricRow label="Total Yards" awayVal={aBox.total_yards} homeVal={hBox.total_yards} />
        <StatMetricRow label="EPA per Play" awayVal={aAdv.epa_per_play} homeVal={hAdv.epa_per_play} formatVal={(v) => (v != null ? v.toFixed(3) : "0.000")} />
        <StatMetricRow label="Success Rate" awayVal={aAdv.success_rate} homeVal={hAdv.success_rate} formatVal={fmtPct} />
        <StatMetricRow label="Explosive Rate" awayVal={aAdv.explosive_rate_yardage} homeVal={hAdv.explosive_rate_yardage} formatVal={fmtPct} />
        <StatMetricRow label="Turnovers Committed" awayVal={aBox.turnovers_committed} homeVal={hBox.turnovers_committed} lowerIsBetter={true} />
        <StatMetricRow label="Red Zone TD%" awayVal={aAdv.red_zone_td_rate} homeVal={hAdv.red_zone_td_rate} formatVal={fmtPct} />
      </VStack>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MOMENTUM TIMELINE CENTER
// ═══════════════════════════════════════════════════════════════════════════════
export const MomentumTimelineCenter = ({ plays, drives, awayId, homeId }) => {
  const [selectedPlayPoint, setSelectedPlayPoint] = useState(null);

  // Compile momentum cumulative points
  const { chartPoints, maxAbsEpa, scoringPlays } = useMemo(() => {
    let current = 0;
    const points = [];
    const scores = [];

    // Filter and sort play by play chronologically
    const sortedPlays = [...plays]
      .filter((p) => p.quarter != null)
      .sort((a, b) => {
        const qDiff = (a.quarter ?? 1) - (b.quarter ?? 1);
        if (qDiff !== 0) return qDiff;
        const getSecs = (cStr) => {
          if (!cStr) return 0;
          const parts = String(cStr).split(":");
          return Number(parts[0] ?? 0) * 60 + Number(parts[1] ?? 0);
        };
        return getSecs(b.clock) - getSecs(a.clock);
      });

    sortedPlays.forEach((play, index) => {
      const epa = Number(play.epa) || 0;
      const isHome = play.offense_team === homeId || String(play.offense_team).toLowerCase().includes(homeId.toLowerCase().replace(/25$/, ""));

      // Standard home is positive, away is negative
      current += isHome ? epa : -epa;

      const ptObj = {
        index,
        cumulativeEpa: current,
        play,
      };

      points.push(ptObj);
      if (play.scoring_event === true) {
        scores.push(ptObj);
      }
    });

    const epaValList = points.map((p) => Math.abs(p.cumulativeEpa));
    const maxVal = Math.max(5, ...epaValList);

    return { chartPoints: points, maxAbsEpa: maxVal, scoringPlays: scores };
  }, [plays, homeId]);

  // Dimension helpers for custom responsive SVG
  const svgWidth = 600;
  const svgHeight = 160;

  const pointsString = useMemo(() => {
    if (chartPoints.length === 0) return "";
    return chartPoints
      .map((pt) => {
        const x = (pt.index / chartPoints.length) * svgWidth;
        const y = svgHeight / 2 - (pt.cumulativeEpa / maxAbsEpa) * (svgHeight / 2 * 0.85);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [chartPoints, maxAbsEpa]);

  const scoringEventsList = useMemo(() => {
    return [...plays]
      .filter((p) => p.scoring_event === true)
      .sort((a, b) => (a.quarter ?? 1) - (b.quarter ?? 1));
  }, [plays]);

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      mb={3}
    >
      <Flex align="center" justify="space-between" mb={3} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
        <Flex align="center" gap={1.5}>
          <Box w="4px" h="12px" bg="brand.500" borderRadius="xs" />
          <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
            Momentum Tracker & scoring play timelines
          </Text>
        </Flex>
        <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
          Play-by-play net cumulative EPA
        </Text>
      </Flex>

      {/* Custom Interactive SVG Line Graph */}
      {chartPoints.length > 0 ? (
        <Box position="relative" w="full" bg="blackAlpha.300" borderRadius="lg" border="1px solid rgba(255,255,255,0.06)" p={2} overflow="hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ overflow: "visible" }}>
            {/* Center neutral baseline */}
            <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Quarter demarcators */}
            {[1.5, 2.5, 3.5].map((q) => {
              const xPos = (svgWidth / 4) * (q - 0.5);
              return (
                <g key={q}>
                  <line x1={xPos} y1="0" x2={xPos} y2={svgHeight} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <text x={xPos + 4} y="12" fill="rgba(255,255,255,0.2)" fontSize="7" fontWeight="bold">Q{Math.ceil(q)}</text>
                </g>
              );
            })}

            {/* Momentum Line */}
            <polyline
              fill="none"
              stroke="linear-gradient(90deg, #E53E3E 0%, #4A90D9 100%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
              style={{ stroke: "url(#line-grad)" }}
            />

            {/* Definitions for gradient fills */}
            <defs>
              <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={getTeamColor(awayId)} />
                <stop offset="100%" stopColor={getTeamColor(homeId)} />
              </linearGradient>
            </defs>

            {/* Clickable scoring points */}
            {scoringPlays.map((pt) => {
              const x = (pt.index / chartPoints.length) * svgWidth;
              const y = svgHeight / 2 - (pt.cumulativeEpa / maxAbsEpa) * (svgHeight / 2 * 0.85);
              const color = getTeamColor(pt.play.offense_team);
              const isActive = selectedPlayPoint?.index === pt.index;

              return (
                <circle
                  key={pt.index}
                  cx={x}
                  cy={y}
                  r={isActive ? "7.5" : "5"}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth={isActive ? "2.5" : "1.5"}
                  cursor="pointer"
                  style={{ transition: "all 0.2s" }}
                  onClick={() => setSelectedPlayPoint(pt)}
                />
              );
            })}
          </svg>

          {/* Floater overlay detail card */}
          {selectedPlayPoint && (
            <Box
              position="absolute"
              bottom="4px"
              left="4px"
              right="4px"
              bg="bg.card"
              border="1px solid"
              borderColor="whiteAlpha.200"
              borderRadius="md"
              p={2}
              zIndex={5}
            >
              <Flex justify="space-between" align="center" mb={1}>
                <Flex align="center" gap={1.5}>
                  <Box w="8px" h="8px" borderRadius="full" bg={getTeamColor(selectedPlayPoint.play.offense_team)} />
                  <Text fontSize="9px" fontWeight="black" color="white" textTransform="uppercase">
                    Q{selectedPlayPoint.play.quarter} · {selectedPlayPoint.play.clock} · {getTeamLabel(selectedPlayPoint.play.offense_team)} Scoring Event
                  </Text>
                </Flex>
                <Text
                  fontSize="8px"
                  fontWeight="black"
                  color="text.muted"
                  cursor="pointer"
                  _hover={{ color: "white" }}
                  onClick={() => setSelectedPlayPoint(null)}
                >
                  CLOSE ✕
                </Text>
              </Flex>
              <Text fontSize="10.5px" color="text.primary" fontWeight="bold" lineClamp={2}>
                {selectedPlayPoint.play.raw_text}
              </Text>
              <Flex gap={3} mt={1}>
                <Text fontSize="9px" color="brand.400" fontWeight="bold">
                  EPA: {selectedPlayPoint.play.epa > 0 ? "+" : ""}{(selectedPlayPoint.play.epa ?? 0).toFixed(2)}
                </Text>
                {selectedPlayPoint.play.wpa != null && (
                  <Text fontSize="9px" color="#3182CE" fontWeight="bold">
                    WPA: {(selectedPlayPoint.play.wpa * 100).toFixed(1)}%
                  </Text>
                )}
              </Flex>
            </Box>
          )}
        </Box>
      ) : (
        <Flex justify="center" py={12} bg="blackAlpha.300" borderRadius="lg">
          <Text color="text.muted" fontSize="xs">Unable to calculate momentum timeline</Text>
        </Flex>
      )}

      {/* Grid List of Scoring Plays */}
      <Box mt={3} maxH="175px" overflowY="auto" border="1px solid rgba(255,255,255,0.06)" borderRadius="lg">
        {scoringEventsList.length > 0 ? (
          scoringEventsList.map((p, index) => {
            const isHome = p.offense_team === homeId;
            const primaryColor = isHome ? getTeamColor(homeId) : getTeamColor(awayId);
            return (
              <Grid
                key={index}
                templateColumns="48px auto 1fr"
                gap={3}
                p={2.5}
                borderBottom={index < scoringEventsList.length - 1 ? "1px solid" : "none"}
                borderColor="whiteAlpha.50"
                alignItems="start"
                _hover={{ bg: "whiteAlpha.50" }}
              >
                <Text fontSize="9px" color="text.muted" fontWeight="bold" mt="1.5px" lineHeight={1.3}>
                  Q{p.quarter} {"\n"} {p.clock}
                </Text>
                <Box
                  px={1.5}
                  py={0.5}
                  bg={`${primaryColor}22`}
                  border={`1px solid ${primaryColor}44`}
                  borderRadius="md"
                  flexShrink={0}
                >
                  <Text fontSize="8.5px" fontWeight="950" color="white" textTransform="uppercase">
                    {p.scoring_type ?? "TD"}
                  </Text>
                </Box>
                <Box minW={0}>
                  <Text fontSize="11px" color="text.primary" fontWeight="bold" lineClamp={3}>
                    {p.raw_text}
                  </Text>
                  <Flex align="center" gap={3} mt={0.5}>
                    <Text fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase">
                      Offense: {getTeamLabel(p.offense_team)}
                    </Text>
                    {p.score_away_after != null && (
                      <Text fontSize="8.5px" color="brand.400" fontWeight="black">
                        Score: {p.score_away_after} – {p.score_home_after}
                      </Text>
                    )}
                  </Flex>
                </Box>
              </Grid>
            );
          })
        ) : (
          <Flex justify="center" py={8}>
            <Text color="text.muted" fontSize="xs">No scoring plays logged</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DIVISION STANDINGS SNAPSHOT
// ═══════════════════════════════════════════════════════════════════════════════
export const DivisionContextCard = ({ awayId, homeId }) => {
  // Real standings context from 2025 season
  const mockStandings = {
    swacpvamu: { rank: 1, div: "SWAC West", conf: "7-1", all: "10-3", next: "OFFSEASON" },
    swacjsu: { rank: 2, div: "SWAC East", conf: "7-1", all: "7-2", next: "OFFSEASON" },
    swactsu: { rank: 3, div: "SWAC West", conf: "5-3", all: "6-5", next: "OFFSEASON" },
    swacfamu: { rank: 4, div: "SWAC East", conf: "4-4", all: "5-8", next: "OFFSEASON" },
    swacasu: { rank: 1, div: "SWAC East", conf: "9-1", all: "10-3", next: "OFFSEASON" },
  };

  const renderContextRow = (tid) => {
    // eslint-disable-next-line no-unused-vars
    const team = getTeam(tid);
    const context = mockStandings[tid] || { rank: "—", div: "SWAC", conf: "—", all: "—", next: "—" };
    return (
      <Flex key={tid} justify="space-between" align="center" py={2} borderBottom="1px solid" borderColor="whiteAlpha.50">
        <Flex align="center" gap={2}>
          <Image src={getTeamLogoSrc(tid)} alt="" h="22px" w="22px" objectFit="contain" />
          <Box>
            <Text fontSize="11px" color="white" fontWeight="black">
              {getTeamLabel(tid)}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold">
              {context.div}
            </Text>
          </Box>
        </Flex>

        <Flex gap={3} align="center" textAlign="right">
          <Box>
            <Text fontSize="11px" color="white" fontWeight="black">
              {context.conf} CONF
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold">
              {context.all} ALL
            </Text>
          </Box>
          <Box px={1.5} py="2px" bg="whiteAlpha.100" borderRadius="sm">
            <Text fontSize="9px" fontWeight="950" color="brand.400">
              #{context.rank}
            </Text>
          </Box>
        </Flex>
      </Flex>
    );
  };

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      mb={3}
    >
      <Flex align="center" gap={1.5} mb={2} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
        <Box w="4px" h="12px" bg="brand.500" borderRadius="xs" />
        <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
          Standings Snapshot
        </Text>
      </Flex>

      <VStack gap={0} w="full" align="stretch">
        {renderContextRow(awayId)}
        {renderContextRow(homeId)}
      </VStack>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. HIDDEN EDGES CARD
// ═══════════════════════════════════════════════════════════════════════════════
export const HiddenEdgesCard = ({ awayId, homeId, advancedTeam }) => {
  const aAdv = advancedTeam[awayId] ?? {};
  const hAdv = advancedTeam[homeId] ?? {};

  // Default values
  const awayStart = aAdv.avg_start_field_position || 28.5;
  const homeStart = hAdv.avg_start_field_position || 26.2;
  const awayLuck = aAdv.turnover_luck || -1.2;
  const homeLuck = hAdv.turnover_luck || 0.8;
  const awaySt = aAdv.special_teams_hidden_yards || 0;
  const homeSt = hAdv.special_teams_hidden_yards || 0;

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      mb={3}
    >
      <Flex align="center" gap={1.5} mb={3} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
        <Box w="4px" h="12px" bg="brand.500" borderRadius="xs" />
        <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
          Hidden Edges & Margins
        </Text>
      </Flex>

      <VStack gap={3} w="full" align="stretch">
        {/* Field Position Football Graphic */}
        <Box>
          <Text fontSize="8.5px" color="text.muted" fontWeight="900" textTransform="uppercase" letterSpacing="0.06em" mb={1.5}>
            Average Starting Field Position
          </Text>
          <Box position="relative" h="38px" bg="linear-gradient(90deg, #1b4d1b 0%, #0d2a0d 100%)" borderRadius="md" border="1px solid rgba(255,255,255,0.1)">
            {/* Yard lines */}
            <Box position="absolute" left="20%" top="0" bottom="0" w="1px" bg="whiteAlpha.100" />
            <Box position="absolute" left="30%" top="0" bottom="0" w="1px" bg="whiteAlpha.200" />
            <Box position="absolute" left="40%" top="0" bottom="0" w="1px" bg="whiteAlpha.100" />
            <Box position="absolute" left="50%" top="0" bottom="0" w="1.5px" bg="whiteAlpha.300" />
            <Box position="absolute" left="60%" top="0" bottom="0" w="1px" bg="whiteAlpha.100" />
            <Box position="absolute" left="70%" top="0" bottom="0" w="1px" bg="whiteAlpha.200" />
            <Box position="absolute" left="80%" top="0" bottom="0" w="1px" bg="whiteAlpha.100" />

            {/* Away Position Indicator */}
            <Flex
              position="absolute"
              left={`${awayStart}%`}
              top="5%"
              direction="column"
              align="center"
              transform="translateX(-50%)"
              zIndex={2}
            >
              <Box w="14px" h="14px" bg={getTeamColor(awayId)} border="1px solid white" borderRadius="full" display="flex" align="center" justify="center">
                <Text fontSize="7px" fontWeight="950" color="white">{getTeamLabel(awayId)[0]}</Text>
              </Box>
              <Text fontSize="8px" fontWeight="black" color="white" mt="1px">Own {Math.round(awayStart)}</Text>
            </Flex>

            {/* Home Position Indicator */}
            <Flex
              position="absolute"
              left={`${homeStart}%`}
              bottom="5%"
              direction="column"
              align="center"
              transform="translateX(-50%)"
              zIndex={2}
            >
              <Text fontSize="8px" fontWeight="black" color="white" mb="1px">Own {Math.round(homeStart)}</Text>
              <Box w="14px" h="14px" bg={getTeamColor(homeId)} border="1px solid white" borderRadius="full" display="flex" align="center" justify="center">
                <Text fontSize="7px" fontWeight="950" color="white">{getTeamLabel(homeId)[0]}</Text>
              </Box>
            </Flex>
          </Box>
        </Box>

        {/* Turnover Luck Indicators */}
        <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
          <Box>
            <Text fontSize="11px" fontWeight="black" color={awayLuck >= 0 ? "green.300" : "red.300"}>
              {awayLuck > 0 ? "+" : ""}{awayLuck.toFixed(2)}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold">Turnover Luck Index</Text>
          </Box>
          <Box w="1px" h="20px" bg="whiteAlpha.100" />
          <Box textAlign="right">
            <Text fontSize="11px" fontWeight="black" color={homeLuck >= 0 ? "green.300" : "red.300"}>
              {homeLuck > 0 ? "+" : ""}{homeLuck.toFixed(2)}
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold">Turnover Luck Index</Text>
          </Box>
        </Grid>

        {/* Special Teams swing */}
        <Grid templateColumns="1fr auto 1fr" gap={2} alignItems="center">
          <Box>
            <Text fontSize="11px" fontWeight="black" color={awaySt >= 0 ? "green.300" : "red.300"}>
              {awaySt > 0 ? "+" : ""}{awaySt} yds
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold">ST Hidden Yards</Text>
          </Box>
          <Box w="1px" h="20px" bg="whiteAlpha.100" />
          <Box textAlign="right">
            <Text fontSize="11px" fontWeight="black" color={homeSt >= 0 ? "green.300" : "red.300"}>
              {homeSt > 0 ? "+" : ""}{homeSt} yds
            </Text>
            <Text fontSize="8px" color="text.muted" fontWeight="bold">ST Hidden Yards</Text>
          </Box>
        </Grid>
      </VStack>
    </Box>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CLUTCH PERFORMANCE CARD
// ═══════════════════════════════════════════════════════════════════════════════
export const ClutchPerformanceCard = ({ awayId, homeId, advancedTeam, teamBox }) => {
  const aBox = teamBox[awayId] ?? {};
  const hBox = teamBox[homeId] ?? {};
  const aAdv = advancedTeam[awayId] ?? {};
  const hAdv = advancedTeam[homeId] ?? {};

  // Third Down Conversion Rates
  const away3rd = aBox.third_down_conversion_rate || 0.4;
  const home3rd = hBox.third_down_conversion_rate || 0.45;

  // Red Zone conversions
  const awayRz = aAdv.red_zone_td_rate || 0.55;
  const homeRz = hAdv.red_zone_td_rate || 0.6;

  // Late game / 2-minute conversions
  const away2m = aAdv.success_rate_two_minute || 0.35;
  const home2m = hAdv.success_rate_two_minute || 0.4;

  const GaugeRow = ({ label, awayVal, homeVal }) => {
    return (
      <Box py={2} borderBottom="1px solid" borderColor="whiteAlpha.50" w="full">
        <Text fontSize="8px" color="text.muted" fontWeight="900" textTransform="uppercase" letterSpacing="0.06em" mb={1}>
          {label}
        </Text>
        <Grid templateColumns="42px 1fr 42px" gap={3} alignItems="center">
          <Text fontSize="10.5px" fontWeight="black" color="white">
            {fmtPct(awayVal)}
          </Text>
          <Flex h="6px" borderRadius="full" overflow="hidden" bg="whiteAlpha.100" gap="1px">
            <Box flex={`0 0 ${awayVal * 100}%`} bg={getTeamColor(awayId)} />
            <Box flex={1} />
            <Box flex={`0 0 ${homeVal * 100}%`} bg={getTeamColor(homeId)} />
          </Flex>
          <Text fontSize="10.5px" fontWeight="black" color="white" textAlign="right">
            {fmtPct(homeVal)}
          </Text>
        </Grid>
      </Box>
    );
  };

  return (
    <Box
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={4}
      mb={3}
    >
      <Flex align="center" gap={1.5} mb={3} borderBottom="1px solid" borderColor="whiteAlpha.100" pb={2}>
        <Box w="4px" h="12px" bg="brand.500" borderRadius="xs" />
        <Text fontSize="xs" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em">
          Clutch Conversions
        </Text>
      </Flex>

      <VStack gap={0} w="full">
        <GaugeRow label="3rd Down Conversions" awayVal={away3rd} homeVal={home3rd} />
        <GaugeRow label="Red Zone TD Effectiveness" awayVal={awayRz} homeVal={homeRz} />
        <GaugeRow label="2-Minute Drill Success Rate" awayVal={away2m} homeVal={home2m} />
      </VStack>
    </Box>
  );
};
