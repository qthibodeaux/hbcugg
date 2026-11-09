import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { useMemo } from "react";
import { buildClassRamp, CLASS_PIPELINE_ORDER, classShortLabel } from "./rosterCardModel";
import { CardShell } from "./RosterCardPrimitives";
import { Flex, Text, Box } from "@chakra-ui/react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";

export const RosterDepthSnapshotCard = ({ model, accent, teamPrimary }) => {
  const { isMobile } = useLayoutDensity();
  const ramp = useMemo(
    () => buildClassRamp(teamPrimary ?? accent, CLASS_PIPELINE_ORDER.length),
    [teamPrimary, accent],
  );

  const rows = useMemo(() => {
    return model.experience.positionExperience
      .filter((item) => item.total > 0)
      .slice(0, 6)
      .map((item) => {
        const row = { group: item.group, total: item.total };
        CLASS_PIPELINE_ORDER.forEach((cls) => {
          const entry = item.breakdown.find((b) => b.class === cls);
          row[classShortLabel(cls)] = entry?.pct ?? 0;
        });
        return row;
      });
  }, [model]);

  return (
    <CardShell title="Experience By Room" accent={accent}>
      <Flex direction="column" h="full" minH={0} gap={2}>
        <Text fontSize="0.55rem" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>
          Class makeup of each position room
        </Text>

        <Box
          h={isMobile ? `${Math.max(rows.length, 1) * 1.7}rem` : "full"}
          minH={`${Math.max(rows.length, 1) * 1.7}rem`}
          w="full"
          flex={isMobile ? undefined : 1}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} layout="vertical" margin={{ top: 2, right: 26, bottom: 2, left: 0 }} barCategoryGap="20%">
              <XAxis type="number" hide domain={[0, 100]} />
              {/* Custom tick renders the room and its headcount together.
                  The total used to be a LabelList on the last stacked
                  segment (GR), so any room with no grad students rendered
                  no total at all — QB and RB were silently blank. */}
              <YAxis
                type="category"
                dataKey="group"
                interval={0}
                width={54}
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload, index }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text x={-40} y={0} dy={4} textAnchor="start" fill="#A1A1AA" fontSize="0.62rem" fontWeight="900">
                      {payload.value}
                    </text>
                    <text x={-6} y={0} dy={4} textAnchor="end" fill="#FFFFFF" fontSize="0.6rem" fontWeight="900">
                      {rows[index]?.total ?? ""}
                    </text>
                  </g>
                )}
              />
              {CLASS_PIPELINE_ORDER.map((cls, index) => (
                <Bar
                  key={classShortLabel(cls)}
                  dataKey={classShortLabel(cls)}
                  stackId="room"
                  fill={ramp[index]}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Legend — without this the stack colors mean nothing to a reader. */}
        <Flex gap="0.6rem" wrap="wrap" flexShrink={0}>
          {CLASS_PIPELINE_ORDER.map((cls, index) => (
            <Flex key={cls} align="center" gap="0.25rem">
              <Box w="0.45rem" h="0.45rem" bg={ramp[index]} flexShrink={0} />
              <Text fontSize="0.55rem" fontWeight="black" color="text.secondary">
                {classShortLabel(cls)}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </CardShell>
  );
};
