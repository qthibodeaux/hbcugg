import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { TIER_COLORS, formatPercent } from "./rosterCardModel";
import { CardShell } from "./RosterCardPrimitives";
import { Flex, SimpleGrid, Box, Text } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell, LabelList } from "recharts";

export const RosterTransferCard = ({ model, accent, palette = [] }) => {
  const { isMobile } = useLayoutDensity();
  const tiers = model.transfers.tierBreakdown;
  const secondary = palette[1] ?? accent;
  // "Unknown" is the pipeline's unclassified bucket — for most teams it's a
  // single player at a meaningless 100% rate, which sorted straight to the
  // top of this list and pushed out a real position group.
  // Desktop shows more groups than mobile: the slot is 2x2 and four rows
  // left most of it empty, so the extra height is filled with real position
  // groups rather than stretched whitespace.
  const positionImpact = model.transfers.positionImpact
    .filter((item) => item.group !== "Unknown")
    .slice(0, isMobile ? 4 : 8)
    // Precomputed label — LabelList's formatter args vary by Recharts
    // version, so the text is built here and read off the row by dataKey.
    .map((item) => ({
      ...item,
      rateLabel: `${Math.round(item.transfer_rate ?? 0)}% (${item.transfer_count ?? 0})`,
    }));
  const tierColor = (item, index) => palette[index % palette.length] ?? TIER_COLORS[item.tier] ?? TIER_COLORS.Unknown;

  return (
    <CardShell title="Portal Profile" accent={accent}>
      <Flex direction="column" h="calc(100% - 24px)" gap={4}>
        <SimpleGrid columns={2} gap={3}>
          <Box>
            <Text fontSize="3xl" color={accent} fontWeight="black" lineHeight="1">
              {formatPercent(model.kpis.transferRate)}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Transfer Rate
            </Text>
          </Box>
          <Box>
            <Text fontSize="3xl" color="text.primary" fontWeight="black" lineHeight="1">
              {model.kpis.transferCount ?? "--"}
            </Text>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Transfers
            </Text>
          </Box>
        </SimpleGrid>

        {/* The tier strip had no legend at all — it read as decorative
            stripes. It's actually where the transfers came from, so it now
            says so and every segment is named. */}
        <Box>
          <Text fontSize="0.55rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb="0.35rem">
            Where transfers came from
          </Text>
          {tiers.length ? (
            <>
              <Flex h="0.625rem" overflow="hidden" bg="whiteAlpha.100">
                {tiers.map((item, index) => (
                  <Box key={item.tier} h="full" bg={tierColor(item, index)} style={{ width: `${item.pct ?? 0}%` }} />
                ))}
              </Flex>
              <Flex mt="0.35rem" gap="0.6rem" wrap="wrap">
                {tiers.map((item, index) => (
                  <Flex key={item.tier} align="center" gap="0.25rem" minW={0}>
                    <Box w="0.45rem" h="0.45rem" bg={tierColor(item, index)} flexShrink={0} />
                    <Text fontSize="0.55rem" fontWeight="black" color="text.secondary" textTransform="uppercase">
                      {item.tier} {item.count}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </>
          ) : (
            <Text fontSize="10px" color="text.muted" fontWeight="bold">
              Transfer source tiers not available for this team yet.
            </Text>
          )}
        </Box>

        {/* Recharts, matching the Class Pipeline treatment: position group
            on the axis, bar scaled 0-100% of that room, rate and headcount
            at the end of the bar. Height is driven by row count in rem so
            it resolves in both the fixed-height desktop slot and the
            auto-height mobile card. */}
        {/* Desktop: this section grows into all the height the KPI row and
            tier strip don't use, so the chart fills the 2x2 slot instead of
            sitting at a fixed row-count height with dead space beneath it.
            Mobile keeps a definite rem height — its card is auto-height, and
            a percentage height won't resolve there. */}
        <Flex direction="column" gap={2} flex={isMobile ? undefined : 1} minH={0}>
          <Text fontSize="0.55rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>
            Share of each position room that transferred in
          </Text>
          {!positionImpact.length ? (
            <Flex flex={1} align="center" justify="center" minH="4rem">
              <Text fontSize="10px" color="text.muted" fontWeight="bold">
                Position-level transfer data not available for this team yet.
              </Text>
            </Flex>
          ) : (
          <Box
            h={isMobile ? `${Math.max(positionImpact.length, 1) * 1.6}rem` : "full"}
            minH={`${Math.max(positionImpact.length, 1) * 1.9}rem`}
            w="full"
            flex={isMobile ? undefined : 1}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={positionImpact}
                layout="vertical"
                margin={{ top: 2, right: 62, bottom: 2, left: 0 }}
                barCategoryGap="16%"
              >
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  ticks={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  height={14}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: "#71717A", fontSize: "0.55rem", fontWeight: 900 }}
                />
                <YAxis
                  type="category"
                  dataKey="group"
                  interval={0}
                  width={32}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#A1A1AA", fontSize: "0.62rem", fontWeight: 900 }}
                />
                <Bar dataKey="transfer_rate" radius={0} isAnimationActive={false}>
                  {positionImpact.map((item, index) => (
                    <Cell key={item.group} fill={index % 2 === 0 ? accent : secondary} />
                  ))}
                  <LabelList
                    dataKey="rateLabel"
                    position="right"
                    style={{ fill: "#FFFFFF", fontSize: "0.58rem", fontWeight: 900 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          )}
        </Flex>
      </Flex>
    </CardShell>
  );
};
