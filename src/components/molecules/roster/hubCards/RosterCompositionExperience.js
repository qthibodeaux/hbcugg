import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { useMemo } from "react";
import { CardShell, BarRow } from "./RosterCardPrimitives";
import { Box, Text, Grid, GridItem, Flex, SimpleGrid } from "@chakra-ui/react";
import { formatPercent, CLASS_PIPELINE_ORDER, classShortLabel, CLASS_COLORS } from "./rosterCardModel";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell, LabelList } from "recharts";

const RosterCompositionCompact = ({ model, accent }) => {
  const { isMobile } = useLayoutDensity();
  const rows = useMemo(() => {
    return (model.composition.positionDistribution || [])
      .filter((item) => item.count > 0 && item.group !== "Unknown")
      // `group` already ships as a position code ("DL", "DB", "WR", "OL") —
      // the old acronym transform (split on spaces, take first letters) was
      // written for multi-word names and reduced every code to a single
      // letter, so DL and DB both rendered as "D". Use the code as-is.
      .map(item => ({ ...item, label: String(item.group).toUpperCase() }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [model]);

  const total = model.kpis.totalPlayers || "--";

  return (
    <CardShell title="Biggest Position Groups" accent={accent}>
      <Box position="relative" h="full" overflow="hidden">
        {/* Background Watermark */}
        <Text 
          position="absolute" 
          right="-0.75rem" 
          bottom="-1.5rem" 
          fontSize="5.5rem" 
          fontWeight="black" 
          color="whiteAlpha.50" 
          lineHeight={1}
          pointerEvents="none"
          zIndex={0}
        >
          {total}
        </Text>

        <Grid templateColumns="repeat(2, 1fr)" gap={2} mt={1} position="relative" zIndex={1}>
          {rows.map((group) => (
            <GridItem key={group.group} bg="whiteAlpha.50" p={2} borderRadius={isMobile ? 0 : "md"} borderLeft="2px solid" borderColor={accent}>
              <Flex justify="space-between" align="baseline">
                <Text fontSize="10px" fontWeight="bold" color="text.muted">{group.label}</Text>
                <Text fontSize="16px" fontWeight="black" color="text.primary">{group.count}</Text>
              </Flex>
            </GridItem>
          ))}
        </Grid>

        <Text mt={2} fontSize="9px" fontWeight="bold" color="text.muted" position="relative" zIndex={1}>
          Four deepest position groups by player count
        </Text>
      </Box>
    </CardShell>
  );
};

export const RosterCompositionCard = ({ model, accent, variant = "standard" }) => {
  if (variant === "compact") return <RosterCompositionCompact model={model} accent={accent} />;

  const rows = model.composition.positionDistribution.filter((item) => item.count > 0).slice(0, 7);

  return (
    <CardShell title="Roster Build" accent={accent}>
      <Flex direction="column" gap={2}>
        {rows.map((item) => (
          <BarRow
            key={item.group}
            label={item.group}
            value={item.count}
            pct={item.pct}
            color={accent}
            valueLabel={`${item.count} - ${formatPercent(item.pct)}`}
          />
        ))}
      </Flex>
    </CardShell>
  );
};

const RosterExperienceCompact = ({ model, accent, palette = [] }) => {
  const { isMobile } = useLayoutDensity();
  const secondary = palette[1] ?? accent;

  const classes = useMemo(() => {
    const byClass = new Map(
      (model.composition.classDistribution || []).map((item) => [item.class, item.count ?? 0]),
    );
    // Always all five rows, even at zero — a missing class should read as an
    // empty bar, not a silently shorter chart.
    return CLASS_PIPELINE_ORDER.map((cls) => ({
      key: cls,
      shortLabel: classShortLabel(cls),
      count: byClass.get(cls) ?? 0,
    }));
  }, [model]);

  // Max is the roster total, so every bar is read against the same whole and
  // bar lengths are comparable across teams.
  const rosterTotal = Math.max(
    Number(model.kpis.totalPlayers) || 0,
    classes.reduce((sum, item) => sum + item.count, 0),
    1,
  );

  return (
    <CardShell title="Class Pipeline" accent={accent}>
      {/* Desktop's slot has a real resolved height, so h="full" fills it.
          The mobile card is auto-height, and a percentage height does NOT
          resolve against min-height — ResponsiveContainer measured 0 and
          rendered nothing (sized frame, no bars). Mobile therefore gets a
          definite rem height instead of relying on a floor. */}
      <Box
        h={isMobile ? `${CLASS_PIPELINE_ORDER.length * 1.6}rem` : "full"}
        w="full"
        pb="0.5rem"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={classes}
            layout="vertical"
            margin={{ top: 2, right: 30, bottom: 2, left: 0 }}
            barCategoryGap="14%"
          >
            <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
            {/* Ticks only at 0 and the roster total, so the right-hand
                gridline is explicitly labelled as the full roster — the bars
                are read against that whole, not against each other. */}
            <XAxis
              type="number"
              domain={[0, rosterTotal]}
              ticks={[0, rosterTotal]}
              axisLine={false}
              tickLine={false}
              height={14}
              tick={{ fill: "#71717A", fontSize: "0.58rem", fontWeight: 900 }}
            />
            <YAxis
              type="category"
              dataKey="shortLabel"
              // interval={0} forces all five labels — Recharts auto-skips
              // ticks it thinks will collide, which was blanking every other
              // class label (FR, _, JR, _, GR).
              interval={0}
              // Recharts sizes axes in SVG user units, so this prop has to
              // stay numeric — everything else here is rem.
              width={30}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: "0.68rem", fontWeight: 900 }}
            />
            <Bar dataKey="count" radius={0} isAnimationActive={false}>
              {classes.map((item, index) => (
                <Cell key={item.key} fill={index % 2 === 0 ? accent : secondary} />
              ))}
              <LabelList
                dataKey="count"
                position="right"
                style={{ fill: "#FFFFFF", fontSize: "0.68rem", fontWeight: 900 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </CardShell>
  );
};

export const RosterExperienceCard = ({ model, accent, palette = [], variant = "standard" }) => {
  if (variant === "compact") return <RosterExperienceCompact model={model} accent={accent} palette={palette} />;

  const classes = model.composition.classDistribution.filter((item) => item.count > 0);
  const classColor = (item, index) => palette[index % palette.length] ?? CLASS_COLORS[item.class] ?? CLASS_COLORS.Unknown;

  return (
    <CardShell title="Class Balance" accent={accent}>
      <Flex direction="column" h="calc(100% - 24px)" justify="space-between" gap={4}>
        <Box>
          <Flex h="14px" borderRadius="sm" overflow="hidden" bg="whiteAlpha.100" mb={4}>
            {classes.map((item, index) => (
              <Box
                key={item.class}
                h="full"
                bg={classColor(item, index)}
                style={{ width: `${item.pct ?? 0}%` }}
              />
            ))}
          </Flex>
          <SimpleGrid columns={2} gap={2}>
            {classes.map((item, index) => (
              <Flex key={item.class} align="center" justify="space-between" gap={2}>
                <Flex align="center" gap={2} minW={0}>
                  <Box w="7px" h="7px" borderRadius="full" bg={classColor(item, index)} />
                  <Text fontSize="10px" color="text.secondary" fontWeight="bold" lineClamp={1}>
                    {item.label ?? item.class}
                  </Text>
                </Flex>
                <Text fontSize="10px" color="text.primary" fontWeight="black">
                  {item.count}
                </Text>
              </Flex>
            ))}
          </SimpleGrid>
        </Box>

        <SimpleGrid columns={2} gap={3}>
          <Box>
            <Text fontSize="2xl" color={accent} fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.upperclassPct)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Upperclass
            </Text>
          </Box>
          <Box>
            <Text fontSize="2xl" color="text.primary" fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.veteranPct)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Senior + Grad
            </Text>
          </Box>
        </SimpleGrid>
      </Flex>
    </CardShell>
  );
};
