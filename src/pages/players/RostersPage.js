import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Grid, Text, Image, Spinner, useMediaQuery } from "@chakra-ui/react";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import PageShell from "../../components/layouts/PageShell";
import { BannerRostersHub } from "../../components/organisms/test/BannerPages";
import { useAllPlayersByYear, useRosterHub } from "../../hooks/useSWACData";
import teamsData from "../../data/teams.json";
import { useLayoutDensity } from "../../hooks/useLayoutDensity";
import { GAME_CENTER_DEFAULT_SEASON, GAME_CENTER_SEASONS } from "../../components/molecules/game/SeasonSelector";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROW_H = "clamp(160px, 20vw, 260px)";
const TALL_ROW_H = `calc(${ROW_H} * 1.6)`;
const GRID_GAP = "10px";
// Single shared launch.0 year scope — see GAME_CENTER_SEASONS.
const ROSTER_HUB_SEASONS = GAME_CENTER_SEASONS;

const CLASS_COLORS = {
  "Fr.": "#c53030",
  "So.": "#dd6b20",
  "Jr.": "#d69e2e",
  "Sr.": "#2c7a7b",
  "Gr.": "#276749",
};

const TRANSFER_COLORS = {
  P4: "#3182ce",
  G5: "#2c7a7b",
  FCS: "#dd6b20",
  D2: "#d69e2e",
  JUCO: "#c53030",
  HS: "#718096",
  Unknown: "#52525B", // a transfer whose previous school isn't named
};

const CARD_ACCENTS = {
  composition: "#F56565",
  experience: "#38A169",
  physical: "#F56565",
  geographic: "#D69E2E",
  transfers: "#3182CE",
  players: "#FFFFFF",
  portal: "#3182CE",
  local: "#2C7A7B",
  distance: "#D69E2E",
};

const DIVISION_MAP = {
  "SWAC East": [
    "swacaamu",
    "swacasu",
    "swacbcu",
    "swacfamu",
    "swacjsu",
    "swacmvsu",
  ],
  "SWAC West": ["swacpvamu", "swacsu", "swactsu", "swacuapb", "swacgsu", "swacalc"],
  MEAC: ["meacdsu", "meachu", "meacmsu", "meacnccu", "meacnsu", "meacscsu"],
};

const DIVISION_ACCENT = {
  "SWAC East": "#E53E3E",
  "SWAC West": "#ECC94B",
  MEAC: "#4299E1",
};

const SWAC_TEAM_IDS = [...DIVISION_MAP["SWAC East"], ...DIVISION_MAP["SWAC West"]];
const MEAC_TEAM_IDS = DIVISION_MAP.MEAC;
const ALL_TEAM_IDS = teamsData.teams.map((t) => t.exportId.replace(/25$/, ""));

const POS_ORDER = {
  QB: 0,
  RB: 1,
  WR: 2,
  TE: 3,
  OL: 4,
  DL: 5,
  LB: 6,
  DB: 7,
  ST: 8,
};

const PHYSICAL_POSITION_LIST = Object.keys(POS_ORDER).slice(0, 8);

const TEAM_LIST = teamsData.teams
  .map((t) => ({
    id: t.exportId.replace(/25$/, ""),
    label: t.name,
    short: t.shortName,
    primary: t.colors.primary,
    secondary: t.colors.secondary,
    conference: t.conference,
    division: t.division,
    logo: t.logo,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

// Flat team-color fill on selection reads on every school's colors; the old
// gradient-to-black wash looked fine for bright colors but went nearly
// invisible for teams whose primary color is already dark.
const readableTextColor = (hexColor) => {
  const hex = hexColor?.replace("#", "");
  if (!hex || hex.length < 6) return "#FFFFFF";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.58 ? "#070708" : "#FFFFFF";
};

const getTeamCompactLabel = (team) => {
  if (team?.short) return team.short;
  if (!team?.label) return "";
  return team.label
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inchesToFtIn = (inches) => {
  if (!inches) return "—";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

const aggregateDivision = (teamIds, teamsMap) => {
  const modules = teamIds.map((id) => teamsMap[id]).filter(Boolean);
  if (!modules.length) return null;

  const totalPlayers = modules.reduce(
    (s, m) => s + (m.composition?.total_players ?? 0),
    0,
  );

  // class distribution
  const classMap = {};
  modules.forEach((m) => {
    (m.composition?.class_distribution ?? []).forEach((c) => {
      if (!classMap[c.class]) classMap[c.class] = { class: c.class, count: 0 };
      classMap[c.class].count += c.count;
    });
  });
  const classDist = Object.values(classMap).map((c) => ({
    ...c,
    pct: totalPlayers > 0 ? +((c.count / totalPlayers) * 100).toFixed(1) : 0,
  }));

  // experience — weighted avg
  const wAvg = (key, subKey) => {
    let wSum = 0,
      wTot = 0;
    modules.forEach((m) => {
      const w = m.composition?.total_players ?? 0;
      wSum += (m[key]?.[subKey] ?? 0) * w;
      wTot += w;
    });
    return wTot > 0 ? +(wSum / wTot).toFixed(1) : 0;
  };

  // physical
  const physGroups = {};
  modules.forEach((m) => {
    Object.entries(m.physical?.by_position_group ?? {}).forEach(([g, s]) => {
      if (!physGroups[g]) physGroups[g] = { hSum: 0, wSum: 0, cnt: 0 };
      const cnt = s.count ?? 1;
      if (s.height_avg) {
        physGroups[g].hSum += s.height_avg * cnt;
        physGroups[g].cnt += cnt;
      }
      if (s.weight_avg) physGroups[g].wSum += s.weight_avg * cnt;
    });
  });

  // geographic
  const stateMap = {},
    hotMap = {};
  let inStateCnt = 0,
    totalHome = 0,
    distSum = 0,
    distCnt = 0;
  const tierAcc = {};
  modules.forEach((m) => {
    const geo = m.geographic ?? {};
    inStateCnt += geo.in_state_count ?? 0;
    totalHome += geo.total_with_hometown ?? 0;
    if (geo.avg_recruiting_distance_miles) {
      distSum +=
        geo.avg_recruiting_distance_miles * (geo.total_with_hometown ?? 1);
      distCnt += geo.total_with_hometown ?? 1;
    }
    (geo.state_distribution ?? []).forEach((s) => {
      stateMap[s.state] = (stateMap[s.state] ?? 0) + s.count;
    });
    (geo.hotspots ?? []).forEach((h) => {
      hotMap[h.city] = (hotMap[h.city] ?? 0) + h.count;
    });
    Object.entries(geo.distance_tier_breakdown ?? {}).forEach(([k, v]) => {
      tierAcc[k] = (tierAcc[k] ?? 0) + v;
    });
  });

  const stateDist = Object.entries(stateMap)
    .map(([state, count]) => ({
      state,
      count,
      pct: totalHome > 0 ? +((count / totalHome) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const hotspots = Object.entries(hotMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // transfers
  const tierMap = {};
  let xferCount = 0;
  modules.forEach((m) => {
    xferCount += m.transfers?.transfer_count ?? 0;
    (m.transfers?.tier_breakdown ?? []).forEach((t) => {
      tierMap[t.tier] = (tierMap[t.tier] ?? 0) + t.count;
    });
  });
  const tierBreakdown = Object.entries(tierMap)
    .map(([tier, count]) => ({
      tier,
      count,
      pct: xferCount > 0 ? +((count / xferCount) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    composition: { total_players: totalPlayers, class_distribution: classDist },
    experience: {
      upperclass_pct: wAvg("experience", "upperclass_pct"),
      veteran_pct: wAvg("experience", "veteran_pct"),
    },
    physical: {
      overall: {
        height_avg: modules
          .filter((m) => m.physical?.overall?.height_avg)
          .reduce(
            (s, m, _, a) => s + m.physical.overall.height_avg / a.length,
            0,
          ),
        weight_avg: modules
          .filter((m) => m.physical?.overall?.weight_avg)
          .reduce(
            (s, m, _, a) => s + m.physical.overall.weight_avg / a.length,
            0,
          ),
      },
      by_position_group: Object.fromEntries(
        Object.entries(physGroups).map(([g, d]) => [
          g,
          {
            height_avg: d.cnt > 0 ? d.hSum / d.cnt : 0,
            weight_avg: d.cnt > 0 ? d.wSum / d.cnt : 0,
            count: d.cnt,
          },
        ]),
      ),
    },
    geographic: {
      in_state_pct:
        totalHome > 0 ? +((inStateCnt / totalHome) * 100).toFixed(1) : 0,
      avg_recruiting_distance_miles:
        distCnt > 0 ? Math.round(distSum / distCnt) : 0,
      distance_tier_breakdown: tierAcc,
      state_distribution: stateDist,
      hotspots,
    },
    transfers: {
      transfer_count: xferCount,
      transfer_rate:
        totalPlayers > 0 ? +((xferCount / totalPlayers) * 100).toFixed(1) : 0,
      tier_breakdown: tierBreakdown,
    },
  };
};

// ─── Shared Analytics Sub-Components ─────────────────────────────────────────

const SectionCard = ({ kicker, title, children, accent = CARD_ACCENTS.players, h, borderRadius = "lg", flat = false }) => {
  const { isMobile } = useLayoutDensity();
  return (
  <Box
    h={h}
    bg={flat ? "bg.secondary" : `linear-gradient(145deg, ${accent}14 0%, rgba(20,20,22,0.98) 34%, rgba(10,10,12,1) 100%)`}
    border="1px solid"
    borderColor={flat ? "whiteAlpha.100" : `${accent}33`}
    borderRadius={borderRadius}
    overflow="hidden"
    display="flex"
    flexDirection="column"
    position="relative"
    boxShadow={flat ? "0 14px 32px rgba(0,0,0,0.22)" : `inset 3px 0 0 ${accent}, 0 14px 32px rgba(0,0,0,0.22)`}
  >
    {!flat && (
      <Box position="absolute" right="-28px" top="-28px" boxSize="96px" borderRadius="full" bg={`${accent}18`} filter="blur(20px)" pointerEvents="none" />
    )}
    <Box
      px={isMobile ? 2 : { base: 3, lg: 4 }}
      pt={isMobile ? 2 : { base: 3, lg: 4 }}
      pb={2}
      flexShrink={0}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      position="relative"
      zIndex={1}
    >
      {kicker && (
        <Text textStyle="kicker" color="text.muted" lineClamp={1} fontSize={isMobile ? "7px" : undefined} letterSpacing={isMobile ? "0.08em" : undefined}>
          {kicker}
        </Text>
      )}
      <Flex align="center" gap={flat ? "0.5rem" : 0}>
        {flat && (
          <Box w="0.1875rem" h={isMobile ? "0.9rem" : "1.1rem"} bg={accent} borderRadius="full" flexShrink={0} />
        )}
        <Text
          fontSize={isMobile ? "xs" : "lg"}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          letterSpacing={isMobile ? "0" : "0.02em"}
          lineHeight={1.1}
          lineClamp={1}
        >
          {!flat && accent && (
            <Box as="span" color={accent} mr={1}>
              ▸
            </Box>
          )}
          {title}
        </Text>
      </Flex>
    </Box>
    <Box flex={isMobile ? "unset" : 1} overflow={isMobile ? "visible" : "hidden"} px={isMobile ? 2 : { base: 3, lg: 4 }} py={isMobile ? 2 : { base: 2.5, lg: 3 }} position="relative" zIndex={1}>
      {children}
    </Box>
  </Box>
  );
};

const PctBox = ({ label, pct, color }) => (
  <Box
    bg={`${color}1F`}
    border="1px solid"
    borderColor={`${color}44`}
    borderRadius="md"
    px={2}
    py={2}
    textAlign="center"
  >
    <Text fontSize="2xl" fontWeight="black" lineHeight={1} style={{ color }}>
      {pct}%
    </Text>
    <Text fontSize="xs" fontWeight="bold" color="text.muted" mt={1}>
      {label}
    </Text>
  </Box>
);

// Composition + Experience combined into one card — donut + legend on top
// (the pie chart, back after a detour), Upperclass/Veterans boxes appended
// below it.
const ClassPie = ({ data, experience, wide = false }) => {
  const { isMobile } = useLayoutDensity();
  const classes = (data?.class_distribution ?? []).filter((c) => c.class !== "Unknown");
  const segments = classes.map((c) => ({ pct: c.pct, color: CLASS_COLORS[c.class] ?? "#718096" }));
  const upper = experience?.upperclass_pct ?? 0;
  const vet = experience?.veteran_pct ?? 0;

  // Wide — this version only ever runs where a full-width slot is
  // available (League mode). Desktop: donut, legend, and the Upper/Vets
  // pills all in one row. Mobile: still full-width, but not wide enough
  // for all three side by side — donut + legend pair up in a row instead
  // (there's plenty of room for that pairing), pills drop to their own
  // full-width row below rather than wrapping awkwardly.
  if (wide && isMobile) {
    return (
      <Flex direction="column" gap={3}>
        <Flex align="center" gap="1.25rem">
          <DonutChart segments={segments} size="6.5rem" thickness="1.15rem" />
          <Flex direction="column" gap={1.5} flex={1} minW={0}>
            {classes.map((c) => (
              <Flex key={c.class} align="center" justify="space-between" gap={2}>
                <Flex align="center" gap={2}>
                  <Box boxSize="0.7rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
                  <Text fontSize="sm" fontWeight="black" color="white">{c.class}</Text>
                </Flex>
                <Text fontSize="sm" fontWeight="black" color="text.muted">{c.pct}%</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Grid templateColumns="repeat(2, 1fr)" gap={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
          <PctBox label="Upperclass (Jr+Sr+Gr)" pct={upper.toFixed(0)} color="#2c7a7b" />
          <PctBox label="Veterans (Sr+Gr)" pct={vet.toFixed(0)} color="#276749" />
        </Grid>
      </Flex>
    );
  }

  if (wide) {
    return (
      <Flex align="center" gap="2rem" wrap="wrap" py={2}>
        <DonutChart segments={segments} size="9rem" thickness="1.6rem" />
        <Flex direction="column" gap={2} flex="1 1 16rem" minW="14rem">
          {classes.map((c) => (
            <Flex key={c.class} align="center" justify="space-between" gap={3}>
              <Flex align="center" gap={2.5}>
                <Box boxSize="0.85rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
                <Text fontSize="md" fontWeight="black" color="white">{c.class}</Text>
              </Flex>
              <Text fontSize="md" fontWeight="black" color="text.muted">{c.pct}%</Text>
            </Flex>
          ))}
        </Flex>
        <Box w="1px" alignSelf="stretch" bg="whiteAlpha.100" />
        <Flex gap={3} flex="1 1 18rem" minW="14rem">
          <Box flex={1}>
            <PctBox label="Upperclass (Jr+Sr+Gr)" pct={upper.toFixed(0)} color="#2c7a7b" />
          </Box>
          <Box flex={1}>
            <PctBox label="Veterans (Sr+Gr)" pct={vet.toFixed(0)} color="#276749" />
          </Box>
        </Flex>
      </Flex>
    );
  }

  const legend = (
    <Flex direction="column" gap={1} minW={0} w="100%">
      {classes.map((c) => (
        <Flex key={c.class} align="center" justify="space-between" gap={2} minW={0}>
          <Flex align="center" gap={2} minW={0}>
            <Box boxSize="0.6rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
            <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>{c.class}</Text>
          </Flex>
          <Text fontSize="xs" fontWeight="black" color="text.muted" flexShrink={0} whiteSpace="nowrap">
            {c.pct}%
          </Text>
        </Flex>
      ))}
    </Flex>
  );

  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} justify="center" gap={3}>
      <Flex direction="column" align="center" gap={2}>
        {isMobile ? (
          <DonutChart segments={segments} size="4rem" hollow={false} />
        ) : (
          <DonutChart segments={segments} size="clamp(4.5rem, 9vw, 6rem)" thickness="clamp(0.9rem, 1.8vw, 1.2rem)" />
        )}
        {legend}
      </Flex>
      <Grid templateColumns={isMobile ? "1fr" : "repeat(2, 1fr)"} gap={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
        <PctBox label="Upperclass (Jr+Sr+Gr)" pct={upper.toFixed(0)} color="#2c7a7b" />
        <PctBox label="Veterans (Sr+Gr)" pct={vet.toFixed(0)} color="#276749" />
      </Grid>
    </Flex>
  );
};

const PhysicalRows = ({ data, accent = CARD_ACCENTS.physical, twoColumn = false }) => {
  const { isMobile } = useLayoutDensity();
  const useTwoColumn = twoColumn && !isMobile;
  const byGroup = data?.by_position_group ?? {};
  const overall = data?.overall ?? {};
  const groups = Object.entries(byGroup)
    .filter(([g]) => g !== "Unknown")
    .sort((a, b) => (POS_ORDER[a[0]] ?? 9) - (POS_ORDER[b[0]] ?? 9))
    .slice(0, 8);
  const maxW = Math.max(...groups.map(([, s]) => s.weight_avg ?? 0), 1);
  const maxH = Math.max(...groups.map(([, s]) => s.height_avg ?? 0), 1);
  // Bars are scaled between the shortest/lightest and tallest/heaviest
  // position actually shown here, not from zero — every position's height
  // sits within a narrow 70"-78" band, so a 0-anchored scale left every bar
  // looking nearly full with no real spread.
  const minW = Math.min(...groups.map(([, s]) => s.weight_avg ?? Infinity).filter(Number.isFinite));
  const minH = Math.min(...groups.map(([, s]) => s.height_avg ?? Infinity).filter(Number.isFinite));
  const wSpan = maxW - minW || 1;
  const hSpan = maxH - minH || 1;
  const HEIGHT_BAR_COLOR = "#63B3ED";

  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} gap={1}>
      {/* Overall header */}
      <Flex
        gap={isMobile ? 1.5 : 3}
        pb={2}
        mb={1}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        <Box flex={1} textAlign="center" bg={`${accent}1A`} borderRadius="md" py={isMobile ? 1 : 2}>
          <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
            {inchesToFtIn(Math.round(overall.height_avg ?? 0))}
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="text.muted" mt={1}>
            Avg Ht
          </Text>
        </Box>
        <Box flex={1} textAlign="center" bg={`${accent}1A`} borderRadius="md" py={isMobile ? 1 : 2}>
          <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
            {Math.round(overall.weight_avg ?? 0)}lb
          </Text>
          <Text fontSize="xs" fontWeight="bold" color="text.muted" mt={1}>
            Avg Wt
          </Text>
        </Box>
      </Flex>
      {/* By position — 3 lines per position: a label/measurement header
          row, then a height bar, then a weight bar, each scaled between
          the min and max of that metric across these positions (not from
          zero) so the spread actually reads. Same shape on desktop and
          mobile now, just bigger type/bars on desktop. twoColumn splits
          the 8 positions into two balanced columns instead of one long
          stack — only worth it in wide contexts (League mode), so it's
          opt-in per caller rather than tied to isMobile. */}
      <Box
        display={useTwoColumn ? "grid" : "block"}
        gridTemplateColumns={useTwoColumn ? "repeat(2, 1fr)" : undefined}
        columnGap={useTwoColumn ? "2rem" : undefined}
      >
        {groups.map(([group, stats]) => (
          <Box key={group} py={isMobile ? 1.5 : 2} borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Flex justify="space-between" align="baseline" mb={isMobile ? 1 : 1.5}>
              <Text fontSize={isMobile ? "sm" : "md"} fontWeight="black" color="white">
                {group}
              </Text>
              <Text fontSize={isMobile ? "xs" : "sm"} fontWeight="bold" color="text.muted">
                {inchesToFtIn(Math.round(stats.height_avg))} <Box as="span" opacity={0.5}>·</Box> {Math.round(stats.weight_avg ?? 0)}lb
              </Text>
            </Flex>
            <Box bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden" h={isMobile ? "0.4rem" : "0.55rem"} mb={isMobile ? "0.3rem" : "0.4rem"}>
              <Box
                h="100%"
                borderRadius="full"
                bg={`linear-gradient(90deg, ${HEIGHT_BAR_COLOR}, ${HEIGHT_BAR_COLOR}8C)`}
                style={{ width: `${Math.max((((stats.height_avg ?? 0) - minH) / hSpan) * 100, 4)}%` }}
              />
            </Box>
            <Box bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden" h={isMobile ? "0.4rem" : "0.55rem"}>
              <Box
                h="100%"
                borderRadius="full"
                bg={`linear-gradient(90deg, ${accent}, ${accent}8C)`}
                style={{ width: `${Math.max((((stats.weight_avg ?? 0) - minW) / wSpan) * 100, 4)}%` }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Flex>
  );
};

const StateList = ({ data, compact }) => {
  const { isMobile } = useLayoutDensity();
  const states = (data?.state_distribution ?? []).slice(0, compact ? 6 : 10);
  const max = states[0]?.count ?? 1;
  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} gap={1.5}>
      {states.map((s) => (
        <Flex key={s.state} align="center" gap={isMobile ? 1.5 : 2.5} flex={isMobile ? "unset" : 1}>
          <Text fontSize="sm" fontWeight="black" color="white" w={isMobile ? "1.6rem" : "1.875rem"} flexShrink={0} whiteSpace="nowrap">
            {s.state}
          </Text>
          <Box
            flex={1}
            minW={0}
            h={isMobile ? "0.6rem" : "0.7rem"}
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              borderRadius="full"
              bg="linear-gradient(90deg, #3182ce, #3182ce8C)"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.muted"
            w={isMobile ? "1.6rem" : "2.125rem"}
            alignSelf="center"
            textAlign="right"
          >
            {s.count}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

const HotspotList = ({ data, compact }) => {
  const spots = (data?.hotspots ?? []).slice(0, compact ? 6 : 8);
  const max = spots[0]?.count ?? 1;
  return (
    <Flex direction="column" h="100%" gap={1.5}>
      {spots.map((s) => (
        <Flex key={s.city} align="stretch" gap={2.5} flex={1}>
          <Text fontSize="sm" fontWeight="black" color="white" w="9rem" flexShrink={0} lineClamp={1} alignSelf="center">
            {s.city}
          </Text>
          <Box
            flex={1}
            minW={0}
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              borderRadius="full"
              bg="linear-gradient(90deg, #805AD5, #805AD58C)"
              style={{ width: `${(s.count / max) * 100}%` }}
            />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.muted"
            w="1.625rem"
            alignSelf="center"
            textAlign="right"
          >
            {s.count}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

const TierBars = ({ data }) => {
  const { isMobile } = useLayoutDensity();
  const tiers = (data?.tier_breakdown ?? []).filter((t) => t.count > 0);
  return (
    <Flex direction="column" h="auto" gap={isMobile ? 1.5 : 2.5}>
      {tiers.map((t) => (
        <Flex key={t.tier} align="center" gap={isMobile ? 1.5 : 2.5}>
          <Box
            px={isMobile ? 1.5 : 2}
            py="0.15rem"
            borderRadius="sm"
            flexShrink={0}
            style={{ background: `${TRANSFER_COLORS[t.tier] ?? "#718096"}33` }}
          >
            <Text
              fontSize="xs"
              fontWeight="black"
              whiteSpace="nowrap"
              style={{ color: TRANSFER_COLORS[t.tier] ?? "#718096" }}
            >
              {t.tier}
            </Text>
          </Box>
          <Box
            flex={1}
            minW={0}
            h={isMobile ? "0.6rem" : "0.7rem"}
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              h="100%"
              borderRadius="full"
              style={{
                width: `${t.pct}%`,
                background: `linear-gradient(90deg, ${TRANSFER_COLORS[t.tier] ?? "#718096"}, ${TRANSFER_COLORS[t.tier] ?? "#718096"}8C)`,
              }}
            />
          </Box>
          <Text
            fontSize="sm"
            fontWeight="bold"
            color="text.muted"
            w={isMobile ? "1.4rem" : "1.625rem"}
            textAlign="right"
            flexShrink={0}
          >
            {t.count}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

const GeoKpis = ({ data, accent = CARD_ACCENTS.geographic }) => {
  const { isMobile } = useLayoutDensity();
  const tiers = data?.distance_tier_breakdown ?? {};
  const TIER_COLORS = { local: "#3182ce", regional: "#805AD5", national: "#38B2AC" };

  return (
    <Flex direction="column" h={isMobile ? "auto" : "100%"} gap={{ base: 2, lg: 3 }}>
      {isMobile ? (
        <Flex direction="column" gap={1} flexShrink={0}>
          {[
            ["In-State", `${(data?.in_state_pct ?? 0).toFixed(0)}%`],
            ["Avg Dist", `${data?.avg_recruiting_distance_miles ?? 0}mi`],
          ].map(([lbl, val]) => (
            <Box key={lbl} bg={`${accent}1F`} border="1px solid" borderColor={`${accent}44`} borderRadius="md" px={2.5} py={1.5}>
              <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" mb="0.15rem">
                {lbl}
              </Text>
              <Text fontSize="lg" fontWeight="black" color="white" lineHeight={1}>
                {val}
              </Text>
            </Box>
          ))}
        </Flex>
      ) : (
        <Flex gap={3} flexShrink={0}>
          <Box
            flex={1}
            bg={`${accent}1F`}
            border="1px solid"
            borderColor={`${accent}44`}
            borderRadius="md"
            px={{ base: 2, lg: 3 }}
            py={{ base: 1.5, lg: 2 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
              {(data?.in_state_pct ?? 0).toFixed(0)}%
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              In-State
            </Text>
          </Box>
          <Box
            flex={1}
            bg={`${accent}1F`}
            border="1px solid"
            borderColor={`${accent}44`}
            borderRadius="md"
            px={{ base: 2, lg: 3 }}
            py={{ base: 1.5, lg: 2 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
              {data?.avg_recruiting_distance_miles ?? 0}mi
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              Avg Dist
            </Text>
          </Box>
        </Flex>
      )}

      {isMobile ? (
        <Flex direction="column" gap={1} flexShrink={0} pt={1} borderTop="1px solid" borderColor="whiteAlpha.100">
          {[
            ["local", "Local"],
            ["regional", "Regional"],
            ["national", "National"],
          ].map(([k, lbl]) => {
            const color = TIER_COLORS[k];
            return (
              <Box key={k} bg={`${color}1A`} border="1px solid" borderColor={`${color}44`} borderRadius="md" px={2.5} py={1.5}>
                <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" mb="0.15rem">
                  {lbl}
                </Text>
                <Text fontSize="lg" fontWeight="black" color="white" lineHeight={1}>
                  {tiers[k] ?? 0}
                </Text>
              </Box>
            );
          })}
        </Flex>
      ) : (
        <Flex gap={2} flexShrink={0}>
          {[
            ["local", "Local"],
            ["regional", "Regional"],
            ["national", "National"],
          ].map(([k, lbl]) => (
            <Box key={k} flex={1} textAlign="center">
              <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="black" color="white">
                {tiers[k] ?? 0}
              </Text>
              <Text fontSize="xs" fontWeight="bold" color="text.muted">
                {lbl}
              </Text>
            </Box>
          ))}
        </Flex>
      )}

      <Box flex={isMobile ? "unset" : 1} overflow={isMobile ? "visible" : "hidden"} pt={isMobile ? 1 : 0} borderTop={isMobile ? "1px solid" : "none"} borderColor="whiteAlpha.100">
        <StateList data={data} compact />
      </Box>
    </Flex>
  );
};

const TransferKpis = ({ data, accent = CARD_ACCENTS.transfers }) => {
  const { isMobile } = useLayoutDensity();

  return (
    <Flex direction="column" h="auto" gap={{ base: 2, lg: 3 }}>
      {isMobile ? (
        <Flex direction="column" gap={1} flexShrink={0}>
          {[
            ["Transfers", data?.transfer_count ?? 0],
            ["Portal Rate", `${(data?.transfer_rate ?? 0).toFixed(0)}%`],
          ].map(([lbl, val]) => (
            <Box key={lbl} bg={`${accent}1F`} border="1px solid" borderColor={`${accent}44`} borderRadius="md" px={2.5} py={1.5}>
              <Text fontSize="9px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" mb="0.15rem">
                {lbl}
              </Text>
              <Text fontSize="lg" fontWeight="black" color="white" lineHeight={1}>
                {val}
              </Text>
            </Box>
          ))}
        </Flex>
      ) : (
        <Flex gap={3} flexShrink={0}>
          <Box
            flex={1}
            bg={`${accent}1F`}
            border="1px solid"
            borderColor={`${accent}44`}
            borderRadius="md"
            px={{ base: 2, lg: 3 }}
            py={{ base: 1.5, lg: 2 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
              {data?.transfer_count ?? 0}
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              Transfers
            </Text>
          </Box>
          <Box
            flex={1}
            bg={`${accent}1F`}
            border="1px solid"
            borderColor={`${accent}44`}
            borderRadius="md"
            px={{ base: 2, lg: 3 }}
            py={{ base: 1.5, lg: 2 }}
            textAlign="center"
          >
            <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="black" color="white" lineHeight={1}>
              {(data?.transfer_rate ?? 0).toFixed(0)}%
            </Text>
            <Text textStyle="kicker" color="text.muted" mt={1}>
              Portal Rate
            </Text>
          </Box>
        </Flex>
      )}
      <Box flex="unset" overflow="visible" pt={isMobile ? 1 : 0} borderTop={isMobile ? "1px solid" : "none"} borderColor="whiteAlpha.100">
        <TierBars data={data} />
      </Box>
    </Flex>
  );
};

// ─── Mode Switcher ────────────────────────────────────────────────────────────

const MODES = [
  { id: "team", label: "By Team" },
  { id: "divisions", label: "Divisions" },
  { id: "league", label: "League" },
];

// KPI stats + mode switcher merged into one PageShell.Slot citizen (stat tier
// on top, control strip along the bottom of the same card) instead of 4
// separate KPI cards floating above an unrelated switcher row — the same
// two-tier pattern used everywhere else in this app's banners, just applied
// to a desktop dashboard panel instead of a mobile banner.
const KpiControlPanel = ({ kpis, isLoading, mode, setMode, isMobile = false }) => (
  <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius={isMobile ? 0 : "lg"} overflow="hidden" display="flex" flexDirection="column">
    <Grid flex={1} templateColumns={isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)"} minH={0}>
      {kpis.map((kpi, i) => (
        <Box
          key={i}
          position="relative"
          overflow="hidden"
          px={isMobile ? 3 : { base: 4, lg: 5 }}
          py={isMobile ? 1.5 : 0}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          borderLeft={(isMobile ? i % 2 === 0 : i === 0) ? "none" : "1px solid"}
          borderTop={isMobile && i >= 2 ? "1px solid" : "none"}
          borderColor="whiteAlpha.100"
        >
          <Box position="absolute" top={0} left={0} bottom={0} w="4px" bg={kpi?.accent ?? "white"} />
          {isLoading || !kpi ? (
            <Spinner color="brand.500" size="sm" />
          ) : (
            <>
              <Text position="absolute" right="-6%" bottom="-18%" fontSize="clamp(3.2rem, 7vw, 5.2rem)" fontWeight="black" lineHeight={0.8} color="white" opacity={0.025} pointerEvents="none">
                {kpi.value}
              </Text>
              <Text textStyle="kicker" color="rgba(255,255,255,0.62)" mb={1} lineClamp={1}>
                {kpi.label}
              </Text>
              <Text fontSize="clamp(2.1rem, 5vw, 3.2rem)" fontWeight="black" fontStyle="italic" color={kpi.accent ?? "white"} lineHeight={0.9} lineClamp={1}>
                {kpi.value}
              </Text>
              {kpi.sub && (
                <Text fontSize="xs" fontWeight="bold" color="rgba(255,255,255,0.6)" mt={1} lineClamp={1}>
                  {kpi.sub}
                </Text>
              )}
            </>
          )}
        </Box>
      ))}
    </Grid>

    <Flex borderTop="1px solid" borderColor="whiteAlpha.100" bg="rgba(0,0,0,0.22)" flexShrink={0}>
      {MODES.map((m, i) => {
        const active = mode === m.id;
        return (
          <Box
            key={m.id}
            as="button"
            flex={1}
            py={isMobile ? 2 : { base: 3, lg: 3.5 }}
            cursor="pointer"
            bg={active ? "linear-gradient(135deg, #E53E3E, #B91C1C)" : "transparent"}
            borderLeft={i === 0 ? "none" : "1px solid"}
            borderColor="whiteAlpha.100"
            onClick={() => setMode(m.id)}
            style={{ transition: "all 0.15s" }}
            _hover={{ bg: active ? undefined : "whiteAlpha.50" }}
          >
            <Text fontSize={{ base: "xs", lg: "sm" }} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" color={active ? "white" : "text.muted"}>
              {m.label}
            </Text>
          </Box>
        );
      })}
    </Flex>
  </Box>
);

// ─── League Mode ──────────────────────────────────────────────────────────────

const LeagueModeContent = ({ all }) => {
  const { isMobile } = useLayoutDensity();
  const span2 = isMobile ? "1 / -1" : "span 2";
  const span4 = isMobile ? "1 / -1" : "span 4";
  const cardH = isMobile ? "auto" : TALL_ROW_H;
  const radius = isMobile ? 0 : "lg";

  return (
    <Box display="grid" gridTemplateColumns={isMobile ? "1fr" : "repeat(4, 1fr)"} gap={isMobile ? "0.75rem" : GRID_GAP}>
      {/* Row A: Composition + Experience combined — one full-width row, no
          set height, same donut+legend+pills card as Divisions mode's
          Composition card but laid out wide instead of stacked. */}
      <Box gridColumn={span4} h="auto">
        <SectionCard title="Composition & Experience" h="auto" borderRadius={radius} flat>
          <ClassPie data={all.composition} experience={all.experience} wide />
        </SectionCard>
      </Box>

      {/* Row B: Physical — full width. Auto height, not TALL_ROW_H — the
          2-column position layout still needs more room than one guessed
          row-unit multiple gives it. */}
      <Box gridColumn={span4} h="auto">
        <SectionCard
          title="Physical Profile — All 18 Programs"
          h="auto"
          borderRadius={radius}
          flat
        >
          <Box
            display="grid"
            gridTemplateColumns="repeat(4, 1fr)"
            gap={GRID_GAP}
            h="auto"
          >
            <Box gridColumn="span 4" h="auto">
              <PhysicalRows data={all.physical} twoColumn={!isMobile} />
            </Box>
          </Box>
        </SectionCard>
      </Box>

      {/* Row C: Top States (2) + City Hotspots (2) */}
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Top Recruiting States"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <StateList data={all.geographic} />
        </SectionCard>
      </Box>
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Recruiting Hotspots"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <HotspotList data={all.geographic} />
        </SectionCard>
      </Box>

      {/* Row D: Geographic KPIs (2) + Transfer Origin (2) */}
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Geographic Distribution"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <GeoKpis data={all.geographic} />
        </SectionCard>
      </Box>
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Transfer Origin Breakdown"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <TransferKpis data={all.transfers} />
        </SectionCard>
      </Box>

      {/* Row E: Transfer Origin States (2) + Transfer Hotspots (2) */}
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Transfer Origin States"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <StateList data={all.transfers?.transfer_geographic ?? all.transfers} />
        </SectionCard>
      </Box>
      <Box gridColumn={span2} h={cardH}>
        <SectionCard
          title="Where Transfers Come From"
          h={isMobile ? "auto" : "100%"}
          borderRadius={radius}
          flat
        >
          <HotspotList
            data={all.transfers?.transfer_geographic ?? all.transfers}
          />
        </SectionCard>
      </Box>
    </Box>
  );
};

// ─── Divisions Mode ───────────────────────────────────────────────────────────

const DivisionColumn = ({ name, mod, accent, teamIds, navigate, isMobile = false }) => {
  if (!mod)
    return (
      <Box p={4} textAlign="center">
        <Text textStyle="kicker" color="text.muted">
          No data
        </Text>
      </Box>
    );
  const total = mod.composition?.total_players ?? 0;
  const teamEntries = teamIds
    .map((tid) => teamsData.teams.find((t) => t.exportId.replace(/25$/, "") === tid))
    .filter(Boolean);
  // Mobile — alphabetical by school, with the real logo; DIVISION_MAP's own
  // order (standings-ish) is fine for desktop's tighter list but reads
  // arbitrary once each row gets real weight on mobile.
  if (isMobile) {
    teamEntries.sort((a, b) => a.shortName.localeCompare(b.shortName));
  }
  return (
    <Flex direction="column" gap={GRID_GAP} minW={0}>
      {/* Header */}
      <Box
        bg="bg.secondary"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius={isMobile ? 0 : "xl"}
        px={isMobile ? 0 : 4}
        py={3}
      >
        <Box px={isMobile ? 4 : 0}>
          <Flex align="flex-start" gap="0.5rem">
            <Box w="0.1875rem" h="1.1rem" mt="0.2rem" bg={accent} borderRadius="full" flexShrink={0} />
            <Text
              fontSize="lg"
              fontWeight="black"
              color="white"
              textTransform="uppercase"
              letterSpacing="0.05em"
              lineHeight={1.15}
              minH={isMobile ? "2.6rem" : undefined}
            >
              {name}
            </Text>
          </Flex>
          <Text textStyle="kicker" color="text.muted" mt={1}>
            {total} players
          </Text>
        </Box>

        {/* Team roster links — mobile: the 3 divisions stay side by side as
            columns (MEAC / SWAC East / SWAC West), each a compact stack of
            small logo + abbreviation rows since the column itself is too
            narrow for a grid. No horizontal padding here — these span the
            full width of the card instead of inheriting the header's
            inset. Desktop keeps the text row list, still inset. */}
        {isMobile ? (
          <Flex direction="column" gap="0.3rem" mt={3}>
            {teamEntries.map((teamEntry) => (
              <Flex
                key={teamEntry.exportId}
                as="button"
                aria-label={teamEntry.name}
                align="center"
                gap="0.4rem"
                w="100%"
                borderRadius={0}
                bg="rgba(255,255,255,0.05)"
                border="1px solid"
                borderColor="whiteAlpha.100"
                borderBottomWidth="0.2rem"
                borderBottomColor={teamEntry.colors?.primary || accent}
                onClick={() => navigate(`/teams/${teamEntry.id}/roster/full`)}
                px="0.6rem"
                py="0.3rem"
                style={{ transition: "all 0.15s" }}
              >
                <Image src={teamEntry.logo} alt="" boxSize="1.5rem" objectFit="contain" flexShrink={0} />
                <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1}>
                  {teamEntry.shortName}
                </Text>
              </Flex>
            ))}
          </Flex>
        ) : (
          <Flex direction="column" gap={1} mt={3}>
            {teamEntries.map((teamEntry) => (
              <Flex
                key={teamEntry.exportId}
                as="button"
                align="center"
                justify="space-between"
                px={2}
                py={1}
                borderRadius="md"
                bg="whiteAlpha.50"
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={() => navigate(`/teams/${teamEntry.id}/roster/full`)}
                style={{ transition: "all 0.15s" }}
                w="100%"
              >
                <Text fontSize="xs" fontWeight="semibold" color="text.secondary">
                  {teamEntry.shortName}
                </Text>
                <ArrowRight size={10} color="var(--chakra-colors-brand-500)" />
              </Flex>
            ))}
          </Flex>
        )}
      </Box>
      {/* Composition/Physical/Geographic/Transfers are all live on both
          platforms now, all flat/notched, all auto-height — no guessed
          fixed row height, since this whole column already lives in
          listContent (not the PageShell.Slot row-unit grid) rather than
          fighting it with a TALL_ROW_H estimate. */}
      <Box h="auto">
        <SectionCard title="Composition" accent={CARD_ACCENTS.composition} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <ClassPie data={mod.composition} experience={mod.experience} />
        </SectionCard>
      </Box>
      <Box h="auto">
        <SectionCard title="Physical" accent={CARD_ACCENTS.physical} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <PhysicalRows data={mod.physical} />
        </SectionCard>
      </Box>
      <Box h="auto">
        <SectionCard title="Geographic" accent={CARD_ACCENTS.geographic} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <GeoKpis data={mod.geographic} />
        </SectionCard>
      </Box>
      <Box h="auto">
        <SectionCard title="Transfers" accent={CARD_ACCENTS.transfers} h="auto" borderRadius={isMobile ? 0 : "lg"} flat>
          <TransferKpis data={mod.transfers} />
        </SectionCard>
      </Box>
    </Flex>
  );
};

const DivisionsModeContent = ({ teamsMap }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const divMods = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(DIVISION_MAP).map(([name, ids]) => [
          name,
          aggregateDivision(ids, teamsMap),
        ]),
      ),
    [teamsMap],
  );

  return (
    <Box display="grid" gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap={isMobile ? "0.4rem" : GRID_GAP}>
      {Object.entries(DIVISION_MAP).map(([name, ids]) => (
        <DivisionColumn
          key={name}
          name={name}
          mod={divMods[name]}
          accent={DIVISION_ACCENT[name]}
          teamIds={ids}
          navigate={navigate}
          isMobile={isMobile}
        />
      ))}
    </Box>
  );
};

// ─── Team Mode ────────────────────────────────────────────────────────────────

const TeamSelectorSlot = ({ selectedId, onChange }) => {
  // Raised from 1023px — 6 columns of full team names ("Mississippi Valley
  // State", "Arkansas-Pine Bluff") don't actually fit until the viewport is
  // quite wide; anything narrower than that now gets the short label
  // instead of an ellipsis-truncated long one.
  const [isCompact] = useMediaQuery("(max-width: 1440px)");
  const { isMobile } = useLayoutDensity();

  // Mobile — real team logos (grayscale until picked, full color + colored
  // ring on selection) in square edge-to-edge cells, matching the
  // SchoolDirectory/TeamScheduleBannerA tile standard. Desktop/tablet keeps
  // the flat-color text-button treatment.
  if (isMobile) {
    return (
      <Box bg="bg.secondary" overflow="hidden">
        <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="0">
          {TEAM_LIST.map((t) => {
            const active = t.id === selectedId;
            return (
              <Box
                key={t.id}
                as="button"
                aria-label={t.label}
                borderRadius={0}
                cursor="pointer"
                bg={active ? `${t.primary}22` : "rgba(255,255,255,0.03)"}
                border="1px solid"
                borderColor={active ? t.secondary : "rgba(255,255,255,0.1)"}
                borderBottomWidth="0.2rem"
                borderBottomColor={t.primary}
                onClick={() => onChange(t.id)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                aspectRatio="1"
                p="0.4rem"
                style={{ transition: "all 0.15s" }}
              >
                <Image
                  src={t.logo}
                  alt={t.label}
                  w="72%"
                  h="72%"
                  objectFit="contain"
                  filter={active ? "none" : "grayscale(1)"}
                  opacity={active ? 1 : 0.7}
                  style={{ transition: "filter 0.15s, opacity 0.15s" }}
                />
              </Box>
            );
          })}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      h="100%"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      <Grid
        h="100%"
        templateColumns="repeat(6, minmax(0, 1fr))"
        templateRows="repeat(3, 1fr)"
        gap={isCompact ? 1.5 : 2}
        p={isCompact ? 3 : 4}
      >
        {TEAM_LIST.map((t) => {
          const active = t.id === selectedId;
          const label = isCompact ? getTeamCompactLabel(t) : t.label;
          const activeTextColor = readableTextColor(t.primary);
          return (
            <Box
              key={t.id}
              as="button"
              borderRadius="md"
              cursor="pointer"
              bg={active ? t.primary : "rgba(255,255,255,0.05)"}
              border="2px solid"
              borderColor={active ? t.secondary : "rgba(255,255,255,0.08)"}
              boxShadow={active ? `0 10px 22px ${t.primary}44` : "inset 0 -1px 0 rgba(255,255,255,0.04)"}
              onClick={() => onChange(t.id)}
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              px={isCompact ? 1.5 : 2}
              py={1}
              minW={0}
              style={{ transition: "all 0.15s" }}
              _hover={{ borderColor: active ? t.secondary : "whiteAlpha.300", bg: active ? undefined : "rgba(255,255,255,0.08)" }}
            >
              <Text
                fontSize={isCompact ? "sm" : "md"}
                fontWeight="black"
                fontStyle="italic"
                textAlign="center"
                lineHeight={1}
                textTransform="uppercase"
                letterSpacing={isCompact ? "0.01em" : "-0.01em"}
                color={active ? activeTextColor : "#FFFFFF"}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                maxW="100%"
              >
                {label}
              </Text>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

// Just the selector now — the team-name strip and analytics grid used to
// live here too, but they've moved into TeamAnalyticsPanel below so they can
// become their own PageShell.Slot instead of floating in the listContent
// area below the KPI grid (that mismatch was the "violates the pageshell"
// problem). This keeps its own ROW_H — it's a picker grid, not a chart that
// needs room to breathe.
const TeamModeContent = ({ selectedId, setSelectedId }) => (
  <Box h={ROW_H}>
    <TeamSelectorSlot selectedId={selectedId} onChange={setSelectedId} />
  </Box>
);

// Composition's 5 class-year bars and Experience's 2 "rollup" bars used to be
// two separate cards, but Experience's numbers are just sums of Composition's
// own data (Upperclass = Jr+Sr+Gr, Veterans = Sr+Gr) — showing both as full
// bar charts paid for the same underlying numbers twice. Combined into one
// card: a donut for the real distribution, plain callouts for the two
// derived rollups (no second set of bars needed), each compared against the
// SWAC-wide average pulled from the same allLeague data the KPI strip uses.
const DonutChart = ({ segments, size = "9rem", thickness = "1.5rem", hollow = true }) => {
  let cumulative = 0;
  const stops = segments
    .map((seg) => {
      const start = cumulative;
      cumulative += seg.pct;
      return `${seg.color} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <Box position="relative" boxSize={size} flexShrink={0}>
      <Box boxSize="100%" borderRadius="full" style={{ background: `conic-gradient(${stops})` }} />
      {hollow && (
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          boxSize={`calc(${size} - ${thickness} * 2)`}
          borderRadius="full"
          bg="bg.secondary"
          align="center"
          justify="center"
        >
          <Text fontSize="0.6rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.08em">
            Roster
          </Text>
        </Flex>
      )}
    </Box>
  );
};

// Compares against the selected team's own conference average (SWAC or
// MEAC), not a blended all-18-team number mislabeled as one or the other —
// a SWAC team's roster should read against SWAC norms, not get judged
// against MEAC rosters it never plays.
const DeltaTag = ({ value, avgValue, avgLabel }) => {
  const delta = Math.round(value - avgValue);
  if (!Number.isFinite(delta) || delta === 0) {
    return (
      <Text fontSize="sm" fontWeight="bold" color="text.muted" whiteSpace="nowrap">
        Even w/ {avgLabel} avg
      </Text>
    );
  }
  const up = delta > 0;
  return (
    <Flex align="center" gap={1} flexShrink={0}>
      {up ? <TrendingUp size={15} color="#48BB78" /> : <TrendingDown size={15} color="#F56565" />}
      <Text fontSize="sm" fontWeight="black" color={up ? "#48BB78" : "#F56565"} whiteSpace="nowrap">
        {up ? "+" : ""}{delta} vs {avgLabel} avg
      </Text>
    </Flex>
  );
};

// Everything stacks in one vertical column now — donut, then each class row
// as its own two-line block, then the two headline callouts — instead of
// squeezing donut+legend side by side. This card has plenty of unused
// height to spend, so trading width-cramming for more, taller rows is a
// straight win for readability.
const CompositionExperienceCard = ({ mod, conferenceAvg, conferenceLabel, accent, isMobile = false }) => {
  const classes = (mod?.composition?.class_distribution ?? []).filter((c) => c.class !== "Unknown");
  const segments = classes.map((c) => ({ pct: c.pct, color: CLASS_COLORS[c.class] ?? "#718096" }));
  const avgClassByName = Object.fromEntries(
    (conferenceAvg?.composition?.class_distribution ?? []).map((c) => [c.class, c.pct]),
  );

  const upper = mod?.experience?.upperclass_pct ?? 0;
  const vet = mod?.experience?.veteran_pct ?? 0;
  const avgUpper = conferenceAvg?.experience?.upperclass_pct ?? 0;
  const avgVet = conferenceAvg?.experience?.veteran_pct ?? 0;

  return (
    <Box h={isMobile ? "auto" : "100%"} bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius={isMobile ? 0 : "lg"} overflow="hidden" display="flex" flexDirection="column">
      <Flex align="center" gap="0.5rem" px={{ base: 3, lg: 4 }} pt={{ base: 3, lg: 4 }} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Box w="0.1875rem" h="1.1rem" bg={accent} borderRadius="full" flexShrink={0} />
        <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em">
          Composition &amp; Experience
        </Text>
      </Flex>

      <Flex direction="column" flex={isMobile ? "unset" : 1} minH={isMobile ? "auto" : 0} p={{ base: 3, lg: 4 }} gap="1.25rem" align="center" overflowY={isMobile ? "visible" : "auto"}>
        <DonutChart segments={segments} size="9rem" thickness="1.75rem" />

        <Flex direction="column" gap="0.4rem" w="full">
          {classes.map((c) => (
            <Flex key={c.class} align="center" justify="space-between" gap="0.75rem" py="0.3rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
              <Flex align="center" gap="0.6rem" flexShrink={0}>
                <Box boxSize="1rem" borderRadius="sm" bg={CLASS_COLORS[c.class] ?? "#718096"} flexShrink={0} />
                <Text fontSize="lg" fontWeight="black" color="white">{c.class}</Text>
              </Flex>
              <Text fontSize="lg" fontWeight="black" color="text.muted" flexShrink={0}>{c.pct}%</Text>
              <DeltaTag value={c.pct} avgValue={avgClassByName[c.class] ?? 0} avgLabel={conferenceLabel} />
            </Flex>
          ))}
        </Flex>

        <Flex direction="column" gap="0.4rem" w="full">
          <Flex justify="space-between" align="center" gap="0.75rem" py="0.3rem" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="md" fontWeight="bold" color="text.muted">Upperclass (Jr+Sr+Gr)</Text>
            <Flex align="center" gap="0.75rem" flexShrink={0}>
              <Text fontSize="2xl" fontWeight="black" color="white">{upper.toFixed(0)}%</Text>
              <DeltaTag value={upper} avgValue={avgUpper} avgLabel={conferenceLabel} />
            </Flex>
          </Flex>
          <Flex justify="space-between" align="center" gap="0.75rem" py="0.3rem">
            <Text fontSize="md" fontWeight="bold" color="text.muted">Veterans (Sr+Gr)</Text>
            <Flex align="center" gap="0.75rem" flexShrink={0}>
              <Text fontSize="2xl" fontWeight="black" color="white">{vet.toFixed(0)}%</Text>
              <DeltaTag value={vet} avgValue={avgVet} avgLabel={conferenceLabel} />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

// Per-position, per-metric min/max of TEAM AVERAGES across whichever set of
// teams is in scope — defines the colored bar's own bottom/top (lowest-avg
// team to highest-avg team), not the full axis.
const computePositionRange = (teamIds, teamsMap, metricKey) => {
  const stats = {};
  PHYSICAL_POSITION_LIST.forEach((pos) => {
    const values = teamIds
      .map((id) => teamsMap?.[id]?.physical?.by_position_group?.[pos]?.[metricKey])
      .filter((v) => Number.isFinite(v) && v > 0);
    stats[pos] = values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
  });
  return stats;
};

// Per-position min/max of INDIVIDUAL PLAYERS — this defines the full Y-axis
// (shortest/lightest player ever recorded at that position through the
// heaviest/tallest), which is always wider than the team-average spread
// above since no team's whole position group sits at one player's exact
// extreme. Sourced from the separate player-season dataset (individual
// records), not the pre-aggregated roster-hub team averages.
const RANGE_METRIC_PLAYER_FIELD = { height_avg: "height", weight_avg: "weight" };

const computePlayerPositionRange = (players, teamIds, playerField) => {
  const idSet = new Set(teamIds);
  const stats = {};
  PHYSICAL_POSITION_LIST.forEach((pos) => {
    const values = (players ?? [])
      .filter((p) => p.position_group === pos && idSet.has(p.team_id) && Number.isFinite(p[playerField]) && p[playerField] > 0)
      .map((p) => p[playerField]);
    stats[pos] = values.length ? { min: Math.min(...values), max: Math.max(...values) } : null;
  });
  return stats;
};

const RANGE_METRICS = [
  { id: "height_avg", label: "Height" },
  { id: "weight_avg", label: "Weight" },
];

const RANGE_SCOPES = [
  { id: "all", label: "All Teams" },
  { id: "conference", label: "Conference" },
];

// X-axis = position. The Y-axis itself is fixed to the full individual-player
// spread for that position (shortest/lightest player recorded through the
// tallest/heaviest) — that's the axis's bottom and top, period. The colored
// bar is a segment *within* that axis: bottom = the lowest team average,
// top = the highest team average. The marker is this team's own average,
// positioned on the same full-player axis. A metric switch flips the whole
// chart between Height and Weight; a scope toggle narrows both datasets to
// just the team's own conference instead of all 18 programs.
const PositionRangeChart = ({ mod, teamEntry, teamsMap, players, accent }) => {
  const [metric, setMetric] = useState("height_avg");
  const [scope, setScope] = useState("all");
  const { isMobile } = useLayoutDensity();

  const teamIds = scope === "conference"
    ? (teamEntry.conference === "MEAC" ? MEAC_TEAM_IDS : SWAC_TEAM_IDS)
    : ALL_TEAM_IDS;
  const scopeLabel = scope === "conference" ? teamEntry.conference : "League";

  const teamAvgStats = useMemo(
    () => computePositionRange(teamIds, teamsMap, metric),
    [teamIds, teamsMap, metric],
  );
  const playerStats = useMemo(
    () => computePlayerPositionRange(players, teamIds, RANGE_METRIC_PLAYER_FIELD[metric]),
    [players, teamIds, metric],
  );

  const formatValue = metric === "height_avg"
    ? (v) => inchesToFtIn(Math.round(v))
    : (v) => `${Math.round(v)}lb`;

  // Mobile — one row per position (offense QB→OL, then defense DL→DB, same
  // PHYSICAL_POSITION_LIST order as desktop) instead of 8 columns squeezed
  // side by side. The axis rotates 90°: min/max tick labels sit at the ends
  // of a horizontal track instead of top/bottom of a vertical one, same
  // bar-segment/marker math either way.
  if (isMobile) {
    return (
      <Box h="auto" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderLeft="4px solid" borderLeftColor={accent} borderRadius={0} overflow="hidden" display="flex" flexDirection="column">
        <Box px={3} pt={3} pb={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Text textStyle="kicker" color="text.muted">Athletic Profile</Text>
          <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em" mb="0.75rem">
            <Box as="span" color={accent} mr={1}>▸</Box>
            Physical — {scopeLabel} Range
          </Text>
          <Flex direction="column" gap="0.5rem">
            <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
              {RANGE_METRICS.map((m) => (
                <Box key={m.id} as="button" type="button" flex={1} onClick={() => setMetric(m.id)} px="0.75rem" py="0.5rem" borderRadius="sm" bg={metric === m.id ? accent : "transparent"}>
                  <Text fontSize="sm" fontWeight="black" color={metric === m.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase" textAlign="center">
                    {m.label}
                  </Text>
                </Box>
              ))}
            </Flex>
            <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
              {RANGE_SCOPES.map((s) => (
                <Box key={s.id} as="button" type="button" flex={1} onClick={() => setScope(s.id)} px="0.75rem" py="0.5rem" borderRadius="sm" bg={scope === s.id ? accent : "transparent"}>
                  <Text fontSize="sm" fontWeight="black" color={scope === s.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase" textAlign="center">
                    {s.id === "conference" ? teamEntry.conference : s.label}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Flex>
        </Box>

        <Flex direction="column" px={3} py={1}>
          {PHYSICAL_POSITION_LIST.map((pos, idx) => {
            const axis = playerStats[pos];
            const avgRange = teamAvgStats[pos];
            const teamValue = mod?.physical?.by_position_group?.[pos]?.[metric];
            const axisSpan = axis ? (axis.max - axis.min || 1) : 1;
            const barLeftPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.min - axis.min) / axisSpan) * 100)) : null;
            const barRightPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.max - axis.min) / axisSpan) * 100)) : null;
            const teamPct = axis && Number.isFinite(teamValue)
              ? Math.min(100, Math.max(0, ((teamValue - axis.min) / axisSpan) * 100))
              : null;

            return (
              <Flex key={pos} align="center" gap="0.75rem" py="0.75rem" borderTop={idx === 0 ? "none" : "1px solid"} borderColor="whiteAlpha.100">
                <Box w="3.75rem" flexShrink={0}>
                  <Text fontSize="xl" fontWeight="black" color="white" lineHeight={1}>{pos}</Text>
                  {teamValue != null && (
                    <Text fontSize="sm" fontWeight="black" color={accent} mt="0.15rem">{formatValue(teamValue)}</Text>
                  )}
                </Box>

                <Flex direction="column" flex={1} minW={0} gap="0.35rem">
                  <Box position="relative" h="1.5rem" w="100%">
                    <Box position="absolute" top="50%" left={0} right={0} h="0.25rem" transform="translateY(-50%)" bg="whiteAlpha.300" borderRadius="full" />
                    <Box position="absolute" top="50%" left={0} h="1.5rem" w="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translate(-50%, -50%)" />
                    <Box position="absolute" top="50%" right={0} h="1.5rem" w="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translate(50%, -50%)" />
                    {barLeftPct != null && (
                      <Box
                        position="absolute"
                        top="50%"
                        left={`${barLeftPct}%`}
                        width={`${Math.max(barRightPct - barLeftPct, 1.5)}%`}
                        h="100%"
                        transform="translateY(-50%)"
                        bg={`${accent}55`}
                        border="0.0625rem solid"
                        borderColor={`${accent}88`}
                        borderRadius="full"
                      />
                    )}
                    {teamPct != null && (
                      <Box
                        position="absolute"
                        top="50%"
                        left={`${teamPct}%`}
                        transform="translate(-50%, -50%)"
                        boxSize="1.1rem"
                        borderRadius="full"
                        bg="white"
                        border="0.2rem solid"
                        borderColor={accent}
                        boxShadow="0 0 0 0.125rem #0B0B0D, 0 0 0.75rem rgba(0,0,0,0.6)"
                        zIndex={2}
                      />
                    )}
                  </Box>
                  <Flex justify="space-between" gap="0.5rem">
                    <Text fontSize="xs" fontWeight="bold" color="text.muted" lineClamp={1}>{axis ? formatValue(axis.min) : "—"}</Text>
                    <Text fontSize="xs" fontWeight="bold" color="text.muted" lineClamp={1} textAlign="center">
                      {avgRange ? `avg ${formatValue(avgRange.min)}–${formatValue(avgRange.max)}` : ""}
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="text.muted" lineClamp={1}>{axis ? formatValue(axis.max) : "—"}</Text>
                  </Flex>
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      </Box>
    );
  }

  return (
    <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden" display="flex" flexDirection="column">
      <Flex px={{ base: 3, lg: 4 }} pt={{ base: 3, lg: 4 }} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100" align="flex-start" justify="space-between" wrap="wrap" gap={2}>
        <Flex align="center" gap="0.5rem">
          <Box w="0.1875rem" h="1.1rem" bg={accent} borderRadius="full" flexShrink={0} />
          <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.02em">
            Physical — {scopeLabel} Range
          </Text>
        </Flex>

        <Flex gap="0.5rem" wrap="wrap">
          <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
            {RANGE_METRICS.map((m) => (
              <Box
                key={m.id}
                as="button"
                type="button"
                onClick={() => setMetric(m.id)}
                px="0.75rem"
                py="0.35rem"
                borderRadius="sm"
                bg={metric === m.id ? accent : "transparent"}
              >
                <Text fontSize="xs" fontWeight="black" color={metric === m.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase">
                  {m.label}
                </Text>
              </Box>
            ))}
          </Flex>
          <Flex bg="whiteAlpha.50" borderRadius="md" p="0.15rem">
            {RANGE_SCOPES.map((s) => (
              <Box
                key={s.id}
                as="button"
                type="button"
                onClick={() => setScope(s.id)}
                px="0.75rem"
                py="0.35rem"
                borderRadius="sm"
                bg={scope === s.id ? accent : "transparent"}
              >
                <Text fontSize="xs" fontWeight="black" color={scope === s.id ? readableTextColor(accent) : "text.muted"} textTransform="uppercase">
                  {s.id === "conference" ? teamEntry.conference : s.label}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Flex flex={1} minH={0} px={{ base: 3, lg: 4 }} py={{ base: 3, lg: 4 }} align="stretch" justify="space-between" gap="0.5rem">
        {PHYSICAL_POSITION_LIST.map((pos) => {
          const axis = playerStats[pos];
          const avgRange = teamAvgStats[pos];
          const teamValue = mod?.physical?.by_position_group?.[pos]?.[metric];
          const axisSpan = axis ? (axis.max - axis.min || 1) : 1;

          // Bar bottom/top are the team-average min/max positioned as a
          // percentage *within* the full individual-player axis — the bar
          // is a segment of the axis, not the axis itself.
          const barBottomPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.min - axis.min) / axisSpan) * 100)) : null;
          const barTopPct = axis && avgRange ? Math.min(100, Math.max(0, ((avgRange.max - axis.min) / axisSpan) * 100)) : null;
          const teamPct = axis && Number.isFinite(teamValue)
            ? Math.min(100, Math.max(0, ((teamValue - axis.min) / axisSpan) * 100))
            : null;

          return (
            <Flex key={pos} direction="column" align="center" flex={1} minW={0}>
              {/* Top tick label — tallest/heaviest player recorded at this position */}
              <Text fontSize="xl" fontWeight="black" color="white" lineClamp={1} mb="0.4rem">
                {axis ? formatValue(axis.max) : "—"}
              </Text>

              <Box position="relative" flex={1} minH={0} w="100%" maxW="3.25rem">
                {/* Full axis — shortest/lightest to tallest/heaviest player recorded */}
                <Box position="absolute" left="50%" top={0} bottom={0} w="0.25rem" transform="translateX(-50%)" bg="whiteAlpha.300" borderRadius="full" />
                {/* End-cap ticks marking the true top and bottom of the axis */}
                <Box position="absolute" left="50%" top={0} w="1.5rem" h="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translateX(-50%)" />
                <Box position="absolute" left="50%" bottom={0} w="1.5rem" h="0.25rem" bg="whiteAlpha.800" borderRadius="full" transform="translateX(-50%)" />
                {/* Bar segment — lowest team average to highest team average */}
                {barBottomPct != null && (
                  <Box
                    position="absolute"
                    left="50%"
                    bottom={`${barBottomPct}%`}
                    height={`${Math.max(barTopPct - barBottomPct, 1.5)}%`}
                    w="100%"
                    transform="translateX(-50%)"
                    bg={`${accent}55`}
                    border="0.0625rem solid"
                    borderColor={`${accent}88`}
                    borderRadius="full"
                  />
                )}
                {teamPct != null && (
                  <Box
                    position="absolute"
                    left="50%"
                    bottom={`${teamPct}%`}
                    transform="translate(-50%, 50%)"
                    boxSize="1.1rem"
                    borderRadius="full"
                    bg="white"
                    border="0.2rem solid"
                    borderColor={accent}
                    boxShadow="0 0 0 0.125rem #0B0B0D, 0 0 0.75rem rgba(0,0,0,0.6)"
                    zIndex={2}
                  />
                )}
              </Box>

              {/* Bottom tick label — shortest/lightest player recorded */}
              <Text fontSize="xl" fontWeight="black" color="white" lineClamp={1} mt="0.4rem">
                {axis ? formatValue(axis.min) : "—"}
              </Text>

              <Text mt="1rem" fontSize="2xl" fontWeight="black" color="white">{pos}</Text>
              <Text fontSize="sm" fontWeight="bold" color="text.muted" lineClamp={1} mt="0.15rem">
                {avgRange ? `avg ${formatValue(avgRange.min)}–${formatValue(avgRange.max)}` : ""}
              </Text>
              {teamValue != null && (
                <Text fontSize="lg" fontWeight="black" color={accent} lineClamp={1}>
                  {formatValue(teamValue)}
                </Text>
              )}
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

// Team-name header strip + all 5 analytics cards, one PageShell.Slot citizen
// (cols=4 rows=5 — a lot more room than the old TALL_ROW_H hack, since this
// is one big slot, not several individually-sized ones fighting to align).
// Every accent in here comes from the selected team's own colors instead of
// the fixed per-category CARD_ACCENTS, alternating primary/secondary per
// card so it still reads as several distinct cards rather than one flat
// wash, while staying strictly inside that team's palette.
const TeamAnalyticsPanel = ({ mod, teamEntry, teamsMap, players }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const primary = teamEntry.colors?.primary || "#FFFFFF";
  const secondary = teamEntry.colors?.secondary || primary;
  const conferenceLabel = teamEntry.conference === "MEAC" ? "MEAC" : "SWAC";
  const conferenceIds = teamEntry.conference === "MEAC" ? MEAC_TEAM_IDS : SWAC_TEAM_IDS;
  const conferenceAvg = useMemo(
    () => aggregateDivision(conferenceIds, teamsMap ?? {}),
    [conferenceIds, teamsMap],
  );

  const headerStrip = (
    <Flex
      as="button"
      align="center"
      justify="space-between"
      px={5}
      py={4}
      flexShrink={0}
      bg={`linear-gradient(135deg, ${primary}26, rgba(255,255,255,0.035))`}
      borderBottom="1px solid"
      borderColor={`${secondary}44`}
      boxShadow={`inset 4px 0 0 ${secondary}`}
      _hover={{ bg: "whiteAlpha.100" }}
      onClick={() => navigate(`/teams/${teamEntry.id}/roster/full`)}
      style={{ transition: "all 0.15s" }}
      w="100%"
    >
      <Flex align="center" gap={3}>
        <Box w="0.1875rem" h="1.25rem" bg={secondary} borderRadius="full" />
        {/* Mobile uses the short name (bannerName — "NC Central", not the
            abbreviation "NCCU") since the full name wrapped to two lines in
            this cramped strip, and drops the muted "Full Roster" label that
            just repeats the anchor on the right. Desktop keeps both. */}
        <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em">
          {isMobile ? (teamEntry.bannerName ?? teamEntry.name) : teamEntry.name}
        </Text>
        {!isMobile && <Text fontSize="sm" color="text.muted">Roster</Text>}
      </Flex>
      <Flex align="center" gap={2}>
        <Text fontSize="sm" color={secondary} fontWeight="bold">Roster</Text>
        <ArrowRight size={16} color={secondary} />
      </Flex>
    </Flex>
  );

  // Mobile — every card gets its own full-width row instead of sharing a
  // 6-col grid at a third/two-thirds each. Not pinned to a fixed height like
  // a PageShell row unit — each card sizes to its own content and the page
  // just scrolls, since this whole branch already lives outside PageShell.
  if (isMobile) {
    return (
      <Flex direction="column" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
        {headerStrip}
        <Flex direction="column" gap="0.75rem" p="0.75rem">
          <CompositionExperienceCard mod={mod} conferenceAvg={conferenceAvg} conferenceLabel={conferenceLabel} accent={primary} isMobile />
          <PositionRangeChart mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} accent={primary} />
          <Box h="20rem">
            <SectionCard title="Geographic" accent={secondary} h="100%" borderRadius={0} flat>
              <GeoKpis data={mod?.geographic} accent={secondary} />
            </SectionCard>
          </Box>
          <Box h="18rem">
            <SectionCard title="Transfers" accent={primary} h="100%" borderRadius={0} flat>
              <TransferKpis data={mod?.transfers} accent={primary} />
            </SectionCard>
          </Box>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">
      {headerStrip}

      <Box flex={1} minH={0} p={{ base: 2, lg: 3 }}>
        {/* 6 columns instead of 4 just for this grid, so Composition can take
            a genuine 1/3 (span 2) with Physical filling the other 2/3 (span
            4), while Geographic/Transfers stay an even 50/50 (span 3 each). */}
        <Box display="grid" gridTemplateColumns="repeat(6, 1fr)" gridTemplateRows="repeat(2, 1fr)" gap={GRID_GAP} h="100%">
          <Box gridColumn="span 2">
            <CompositionExperienceCard mod={mod} conferenceAvg={conferenceAvg} conferenceLabel={conferenceLabel} accent={primary} />
          </Box>
          <Box gridColumn="span 4">
            <PositionRangeChart mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} accent={primary} />
          </Box>
          <Box gridColumn="span 3">
            <SectionCard title="Geographic" accent={secondary} h="100%" flat>
              <GeoKpis data={mod?.geographic} accent={secondary} />
            </SectionCard>
          </Box>
          <Box gridColumn="span 3">
            <SectionCard title="Transfers" accent={primary} h="100%" flat>
              <TransferKpis data={mod?.transfers} accent={primary} />
            </SectionCard>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
// mode + selectedId used to live inside a separate RosterComparisonComponent
// wrapper, entirely within PageShell's `listContent` area. That's what put
// the switcher and the team-strip+cards visually out of step with the KPI
// grid above them — listContent shares the same outer margins as the Slot
// grid, but not the same rhythm. Both moved up here so the switcher and the
// team panel can be real PageShell.Slot siblings of the KPI card instead.

const RostersPage = ({ defaultMode = "team" }) => {
  // Opens on the current season (2026 ships roster_hub_2026 + player_seasons_2026).
  const [season, setSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [pendingSeason, setPendingSeason] = useState(GAME_CENTER_DEFAULT_SEASON);
  const [mode, setMode] = useState(defaultMode);
  const [selectedId, setSelectedId] = useState(
    () => ALL_TEAM_IDS[Math.floor(Math.random() * ALL_TEAM_IDS.length)],
  );
  const { isMobile } = useLayoutDensity();

  const { hub, allLeague, teams: teamsMap, isLoading: hubLoading } = useRosterHub(season);
  // Individual player-season records for the selected season (falls back to the
  // newest shipped roster when a season has none), so the Physical range chart
  // follows the season selector with everything else.
  const { players } = useAllPlayersByYear(season);

  const programCount = useMemo(() => Object.keys(teamsMap ?? {}).length, [teamsMap]);
  const rosterYear = hub?.year ?? season;

  const kpis = allLeague
    ? [
        {
          label: "Total Players",
          value: (allLeague.composition?.total_players ?? 0).toLocaleString(),
          sub: `${programCount || 18} Programs · ${rosterYear}`,
          accent: "white",
        },
        {
          label: "Portal Rate",
          value: `${(allLeague.transfers?.transfer_rate ?? 0).toFixed(0)}%`,
          sub: `${allLeague.transfers?.transfer_count ?? 0} transfers`,
          accent: "#3182ce",
        },
        {
          label: "In-State Talent",
          value: `${(allLeague.geographic?.in_state_pct ?? 0).toFixed(0)}%`,
          sub: "recruited locally",
          accent: "#2c7a7b",
        },
        {
          label: "Avg Recruit Dist",
          value: `${allLeague.geographic?.avg_recruiting_distance_miles ?? 0}mi`,
          sub: "from hometown",
          accent: "#d69e2e",
        },
      ]
    : Array(4).fill(null);

  const mod = teamsMap?.[selectedId] ?? null;
  const teamEntry = selectedId
    ? teamsData.teams.find((t) => t.exportId.replace(/25$/, "") === selectedId)
    : null;

  const listContent =
    mode === "team" ? null : hubLoading ? (
      <Flex justify="center" py={20}>
        <Spinner color="brand.500" size="xl" thickness="4px" />
      </Flex>
    ) : mode === "league" && allLeague ? (
      <LeagueModeContent all={allLeague} />
    ) : mode === "divisions" ? (
      <DivisionsModeContent teamsMap={teamsMap} />
    ) : null;

  // Mobile — banner is the only thing that's had a real mobile pass so far.
  // Everything below it is the same desktop cards/grids stacked full-width
  // and unstyled for now (KpiControlPanel's 4-col stat grid, the 6-col
  // TeamAnalyticsPanel grid) — flagging that clearly since those grids will
  // read cramped at phone width until they get their own mobile treatment.
  if (isMobile) {
    return (
      <Box minH="100vh" bg="bg.primary" pt="var(--app-header-height)">
        <BannerRostersHub
          season={season}
          pendingSeason={pendingSeason}
          setPendingSeason={setPendingSeason}
          onApplySeason={(year) => setSeason(year ?? pendingSeason)}
          seasons={ROSTER_HUB_SEASONS}
        />
        <Box h="14rem">
          <KpiControlPanel kpis={kpis} isLoading={hubLoading} mode={mode} setMode={setMode} isMobile />
        </Box>

        {/* Logo grid at its own height — six square cells a row, flush under the
            KPI panel and straight into the team panel. */}
        {mode === "team" && <TeamSelectorSlot selectedId={selectedId} onChange={setSelectedId} />}

        {mode === "team" && teamEntry && (
          <TeamAnalyticsPanel mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} />
        )}
        {mode !== "team" && (
          <Box px="0.75rem" pt="0.75rem" pb="0.75rem">
            {listContent}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <PageShell listContent={listContent}>

      {/* Row 1: Banner */}
      <PageShell.Slot cols={4}>
        <BannerRostersHub
          season={season}
          pendingSeason={pendingSeason}
          setPendingSeason={setPendingSeason}
          onApplySeason={(year) => setSeason(year ?? pendingSeason)}
          seasons={ROSTER_HUB_SEASONS}
        />
      </PageShell.Slot>

      {/* Row 2: KPI stats + mode switcher, one panel */}
      <PageShell.Slot cols={4}>
        <KpiControlPanel kpis={kpis} isLoading={hubLoading} mode={mode} setMode={setMode} />
      </PageShell.Slot>

      {/* Row 3+: team picker + team-branded analytics panel — real Slot
          siblings now, not listContent, so they line up with everything
          above them. Only shown in "By Team" mode. */}
      {mode === "team" && (
        <>
          <PageShell.Slot cols={4}>
            <TeamModeContent selectedId={selectedId} setSelectedId={setSelectedId} />
          </PageShell.Slot>
          {teamEntry && (
            <PageShell.Slot cols={4} rows={5}>
              <TeamAnalyticsPanel mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} />
            </PageShell.Slot>
          )}
        </>
      )}

    </PageShell>
  );
};

export default RostersPage;
