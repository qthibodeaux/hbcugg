import { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { Layers, Map, Radar as RadarIcon, Scale, SlidersHorizontal, TrendingUp, Zap } from "lucide-react";
import PageShell from "../../layouts/PageShell";
import { PlayerProductionMap } from "../test/PlayerProductionMaps";
import {
  buildCalledUponShare,
  buildOpponentAdjusted,
  buildPercentileRadar,
  buildPositionModules,
  buildSituationalSplits,
  buildTrajectory,
} from "./advancedTabMock";
import ViewRail from "./ViewRail";

// Full ADVANCED-tab taxonomy from PLAYER_STATS_ADVANCED_INVENTORY — every
// section gets a slot, including the ❌-unbuilt ones (Called-Upon Share,
// Opponent-Adjusted), so the whole shape of the taxonomy stays visible
// instead of silently disappearing wherever the data isn't ready yet.
// Component Breakdown (§8) and Compare (§10) already live in the Stats tab
// per the doc's own "attach as a toggle to whatever view" note — not
// duplicated here.
const VIEWS = [
  { key: "radar", label: "Radar", icon: RadarIcon },
  { key: "splits", label: "Splits", icon: SlidersHorizontal },
  { key: "calleduponshare", label: "Called-Upon", icon: Zap },
  { key: "opponentadjusted", label: "Opp. Adjusted", icon: Scale },
  { key: "fieldmap", label: "Field Map", icon: Map },
  { key: "modules", label: "Modules", icon: Layers },
  { key: "trajectory", label: "Trajectory", icon: TrendingUp },
];

// Simple SVG polygon radar — pixel dimensions match the viewBox 1:1 (learned
// from the Glory Rating gauge bug earlier this session) so labels placed via
// absolute left/top land exactly on their axis line, no distortion.
const RadarChart = ({ axes, primary, secondary, size = 240 }) => {
  const n = axes.length;
  const center = size / 2;
  const radius = size * 0.34;
  const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pointFor = (i, pct) => {
    const r = (pct / 100) * radius;
    const angle = angleFor(i);
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };
  const gridLevels = [25, 50, 75, 100];
  const polygonPoints = axes.map((a, i) => pointFor(i, a.percentile ?? 0).join(",")).join(" ");

  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} mx="auto">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {gridLevels.map((lvl) => (
          <polygon key={lvl} points={axes.map((_, i) => pointFor(i, lvl).join(",")).join(" ")} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        ))}
        {axes.map((a) => {
          const i = axes.indexOf(a);
          const [x, y] = pointFor(i, 100);
          return <line key={a.label} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}
        <polygon points={polygonPoints} fill={`${primary}33`} stroke={primary} strokeWidth="2" />
        {axes.map((a, i) => {
          const [x, y] = pointFor(i, a.percentile ?? 0);
          return <circle key={a.label} cx={x} cy={y} r="3.5" fill={secondary} stroke={primary} strokeWidth="1.5" />;
        })}
      </svg>
      {axes.map((a, i) => {
        const [x, y] = pointFor(i, 122);
        return (
          <Box key={a.label} position="absolute" left={`${x}px`} top={`${y}px`} transform="translate(-50%, -50%)" textAlign="center">
            <Text fontSize="9px" fontWeight="800" color="text.muted" textTransform="uppercase" whiteSpace="nowrap">
              {a.label}
            </Text>
            <Text fontSize="10px" fontWeight="900" fontFamily="mono" color="white">
              {a.percentile}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

const SituationalCategoryCard = ({ category, primary }) => (
  <Box>
    <Flex align="center" gap={2} mb={2}>
      <Box w="3px" h="14px" bg={primary} borderRadius="full" />
      <Text fontSize="11px" fontWeight="800" color="white" textTransform="uppercase" letterSpacing="0.04em">
        {category.label}
      </Text>
    </Flex>
    <Grid templateColumns="repeat(auto-fit, minmax(90px, 1fr))" gap={2} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={3}>
      {category.fields.map((f) => (
        <Box key={f.key} textAlign="center">
          <Text fontSize="lg" fontWeight="black" fontFamily="mono" color="white" lineHeight={1}>{f.value}</Text>
          <Text fontSize="8px" fontWeight="700" color="text.muted" textTransform="uppercase">{f.label}</Text>
        </Box>
      ))}
    </Grid>
  </Box>
);

// Shared treatment for the doc's ❌-unbuilt sections — same amber "not real
// yet" language already used for redshirt/transfer badges elsewhere in this
// app, so it reads as consistently "this is a known gap," not a bug.
const BlockedPreview = ({ reason, children }) => (
  <Flex direction="column" gap={3}>
    <Box bg="orange.900" border="1px solid" borderColor="orange.700" borderRadius="md" p={3}>
      <Text fontSize="10px" fontWeight="bold" color="orange.300" textTransform="uppercase" mb={1}>
        Not Built Yet
      </Text>
      <Text fontSize="xs" color="white">{reason}</Text>
    </Box>
    {children}
  </Flex>
);

const ModuleCard = ({ module, primary }) => (
  <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={4}>
    <Text fontSize="11px" fontWeight="800" color="white" textTransform="uppercase" letterSpacing="0.03em" mb={2}>
      {module.label}
    </Text>
    {module.ranges ? (
      <Grid templateColumns={`repeat(${module.ranges.length}, 1fr)`} gap={2}>
        {module.ranges.map((r) => (
          <Box key={r.label} textAlign="center">
            <Text fontSize="lg" fontWeight="black" fontFamily="mono" color="white">{r.made}/{r.att}</Text>
            <Text fontSize="9px" color="text.muted" textTransform="uppercase">{r.label}</Text>
          </Box>
        ))}
      </Grid>
    ) : (
      <>
        <Text fontSize="2xl" fontWeight="black" fontFamily="mono" color={primary} lineHeight={1} mb={1}>{module.value}</Text>
        <Text fontSize="10px" color="text.muted">{module.caption}</Text>
      </>
    )}
  </Box>
);

const PlayerAdvancedTab = ({ player, teamMeta }) => {
  const [activeView, setActiveView] = useState("radar");
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";

  const radarAxes = buildPercentileRadar(player);
  const splits = buildSituationalSplits(player);
  const modules = buildPositionModules(player);
  const calledUponShare = buildCalledUponShare();
  const opponentAdjusted = buildOpponentAdjusted(player);
  const trajectory = buildTrajectory(player);

  return (
    <PageShell.Slot cols={4} rows={3}>
      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" h="full" overflow="hidden">
        <Flex h="full">
          <ViewRail views={VIEWS} active={activeView} onChange={setActiveView} primary={primary} />
          <Box flex={1} minW={0} p={6} overflow="auto">
          {activeView === "radar" && (
            <Flex flex={1} align="center" justify="center">
              <RadarChart axes={radarAxes} primary={primary} secondary={secondary} />
            </Flex>
          )}

          {activeView === "splits" && (
            <Flex direction="column" gap={4}>
              {splits.map((category) => (
                <SituationalCategoryCard key={category.key} category={category} primary={primary} />
              ))}
            </Flex>
          )}

          {activeView === "calleduponshare" && (
            <BlockedPreview reason={calledUponShare.reason}>
              <Flex direction="column" gap={2}>
                {calledUponShare.buckets.map((b) => (
                  <Flex key={b.key} justify="space-between" align="center" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={3}>
                    <Text fontSize="11px" fontWeight="800" color="white" textTransform="uppercase" letterSpacing="0.03em">
                      {b.label}
                    </Text>
                    <Flex gap={4}>
                      <Text fontSize="xs" color="text.muted">Share: —</Text>
                      <Text fontSize="xs" color="text.muted">Success: —</Text>
                      <Text fontSize="xs" color="text.muted">n: —</Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </BlockedPreview>
          )}

          {activeView === "opponentadjusted" && (
            <BlockedPreview reason={opponentAdjusted.reason}>
              <Grid templateColumns="repeat(auto-fit, minmax(80px, 1fr))" gap={2}>
                {opponentAdjusted.rows.map((r) => (
                  <Box key={r.week} textAlign="center" bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={2}>
                    <Text fontSize="10px" fontWeight="800" color="text.muted">WK {r.week}</Text>
                    <Text fontSize="sm" fontWeight="black" color="white">—</Text>
                  </Box>
                ))}
              </Grid>
            </BlockedPreview>
          )}

          {activeView === "fieldmap" && (
            <Box flex={1} minH="260px">
              <PlayerProductionMap player={player} primary={primary} secondary={secondary} />
            </Box>
          )}

          {activeView === "modules" && (
            <Flex direction="column" gap={3}>
              {modules.length ? (
                modules.map((m) => <ModuleCard key={m.key} module={m} primary={primary} />)
              ) : (
                <Text fontSize="sm" color="text.muted" textAlign="center" py={8}>
                  No position-specific modules for this position yet.
                </Text>
              )}
            </Flex>
          )}

          {activeView === "trajectory" && (
            <Flex direction="column" gap={3}>
              <Flex gap={3} wrap="wrap">
                <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={3} flex={1} minW="140px">
                  <Text fontSize="10px" color="text.muted" textTransform="uppercase">Transfer</Text>
                  <Text fontSize="md" fontWeight="black" color="white">
                    {trajectory.isTransfer ? (trajectory.transferTier ?? "Yes") : "No"}
                  </Text>
                </Box>
                <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={3} flex={1} minW="140px">
                  <Text fontSize="10px" color="text.muted" textTransform="uppercase">Redshirt</Text>
                  <Text fontSize="md" fontWeight="black" color="white">{trajectory.isRedshirt ? "Yes" : "No"}</Text>
                </Box>
                <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={3} flex={1} minW="140px">
                  <Text fontSize="10px" color="text.muted" textTransform="uppercase">Class Year</Text>
                  <Text fontSize="md" fontWeight="black" color="white">{trajectory.classYear ?? "-"}</Text>
                </Box>
              </Flex>
              <Box bg="orange.900" border="1px solid" borderColor="orange.700" borderRadius="md" p={3}>
                <Text fontSize="10px" fontWeight="bold" color="orange.300" textTransform="uppercase" mb={1}>
                  Role-Change Over Time
                </Text>
                <Text fontSize="xs" color="white">{trajectory.roleChangeStatus}</Text>
              </Box>
              <Box bg="orange.900" border="1px solid" borderColor="orange.700" borderRadius="md" p={3}>
                <Text fontSize="10px" fontWeight="bold" color="orange.300" textTransform="uppercase" mb={1}>
                  Coaching Continuity Overlay
                </Text>
                <Text fontSize="xs" color="white">{trajectory.coachingContinuityStatus}</Text>
              </Box>
            </Flex>
          )}
          </Box>
        </Flex>
      </Box>
    </PageShell.Slot>
  );
};

export default PlayerAdvancedTab;
