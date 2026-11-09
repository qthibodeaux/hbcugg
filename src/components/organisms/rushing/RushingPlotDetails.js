import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { TEAM_BY_V5, ringOf, shortOf } from "./rushingModel";

const valueText = (axis, v) => (v == null ? "—" : axis?.format === "percent" ? `${Number(v).toFixed(1)}%` : Number(v).toFixed(2));

export const RushingPlotHover = ({ hovered, ax, ay, extras }) => (
  <Box position="absolute" top={3} right={3} zIndex={8} bg="bg.primary" border="1px solid" borderColor="line.strong" borderRadius="md" px={3} py={2} pointerEvents="none">
    <Text fontSize="sm" fontWeight="900" color="text.primary">{hovered.name}</Text>
    <Text fontSize="xs" color="text.secondary" mt={1}>{ax.label}: {valueText(ax, hovered.x)}</Text>
    <Text fontSize="xs" color="text.secondary">{ay.label}: {valueText(ay, hovered.y)}</Text>
    {extras.map(([k, label, fmt]) => (hovered[k] != null ? <Text key={k} fontSize="xs" color="text.secondary">{label}: {fmt(hovered[k])}</Text> : null))}
  </Box>
);

export const RushingOffChart = ({ rows }) => (
  <Flex wrap="wrap" gap={5} mt={3} px={2}>
    {rows.map((o) => {
      const n = parseInt(o.power, 10);
      const team = TEAM_BY_V5[o.team_id];
      return (
        <Flex key={o.team_id} align="center" gap={2}>
          {team?.logo && <Image src={team.logo} alt="" boxSize="1.4rem" objectFit="contain" />}
          <Text fontSize="sm" fontWeight="800" style={{ color: ringOf(team) }}>{shortOf(o.team_id)}</Text>
          <Text fontSize="sm" fontWeight="700" color="text.secondary">· {Math.round(o.stuff_rate)}% stuffed · {n} power run{n === 1 ? "" : "s"}</Text>
        </Flex>
      );
    })}
  </Flex>
);
