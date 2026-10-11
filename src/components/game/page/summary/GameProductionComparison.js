import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { cleanName, fmt, productionEntries } from "../../../../utils/gameHelpers";
import { getTeamLabel, getTeamColor, getTeamLogoSrc } from "../utils/teamHelpers";

const PRODUCTION_BUCKETS = [
  { id: "primary", label: "Pass / Rec / Hit", color: "#081722", keys: ["passing_production", "receiving_production", "hit_production"] },
  { id: "secondary", label: "Rush / Hawk", color: "#F6C02D", keys: ["rushing_production", "hawk_production"] },
  { id: "tertiary", label: "Turnover / Scrum", color: "#6B7280", keys: ["turnover_production", "scrum_production"] },
];

const productionBucketsFor = (components = {}) =>
  PRODUCTION_BUCKETS.map((bucket) => ({
    ...bucket,
    value: bucket.keys.reduce((sum, key) => sum + (Number(components[key]) || 0), 0),
  }));

const ProductionLegend = () => (
  <Flex gap={4} wrap="wrap" mt={3}>
    {PRODUCTION_BUCKETS.map((bucket) => (
      <Flex key={bucket.id} align="center" gap={2}>
        <Box w="10px" h="10px" bg={bucket.color} />
        <Text fontSize="9px" color="text.secondary" fontWeight="bold">
          {bucket.label}
        </Text>
      </Flex>
    ))}
  </Flex>
);

const TeamProductionPanel = ({ teamId, productionScores, maxTotal }) => {
  const teamColor = getTeamColor(teamId, "#E53E3E");
  const rows = productionEntries(productionScores)
    .filter((row) => Number(row.production_total) > 0)
    .sort((a, b) => Number(b.production_total ?? 0) - Number(a.production_total ?? 0))
    .slice(0, 12);

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
      minH="420px"
    >
      <Flex align="center" justify="space-between" gap={4} px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={3} minW={0}>
          <Image src={getTeamLogoSrc(teamId)} alt="" h="34px" w="34px" objectFit="contain" />
          <Box minW={0}>
            <Text fontSize="10px" color={teamColor} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Player Production
            </Text>
            <Text fontSize="xl" color="text.primary" fontWeight="black" lineHeight={1} lineClamp={1}>
              {getTeamLabel(teamId)}
            </Text>
          </Box>
        </Flex>
        <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
          Top {rows.length}
        </Text>
      </Flex>

      <Box p={4}>
        <Flex direction="column" gap={2.5}>
          {rows.map((row) => {
            const total = Math.max(0, Number(row.production_total) || 0);
            const buckets = productionBucketsFor(row.components);
            const totalWidth = maxTotal ? Math.max(2, (total / maxTotal) * 100) : 0;

            return (
              <Grid key={row.player_key} templateColumns="145px minmax(0, 1fr) 40px" gap={3} alignItems="center">
                <Box minW={0}>
                  <Text fontSize="11px" color="text.secondary" fontWeight="bold" lineClamp={1}>
                    {cleanName(row.name)}
                  </Text>
                  <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
                    {row.position ?? "ATH"}
                  </Text>
                </Box>

                <Box position="relative" h="14px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  <Flex h="full" w={`${totalWidth}%`} minW={total > 0 ? "4px" : 0}>
                    {buckets
                      .filter((bucket) => bucket.value > 0)
                      .map((bucket) => (
                        <Box
                          key={bucket.id}
                          h="full"
                          bg={bucket.color}
                          style={{ width: `${total ? (bucket.value / total) * 100 : 0}%` }}
                        />
                      ))}
                  </Flex>
                </Box>

                <Text fontSize="11px" color="text.primary" fontWeight="black" textAlign="right">
                  {fmt(total, 1)}
                </Text>
              </Grid>
            );
          })}
        </Flex>
        <ProductionLegend />
      </Box>
    </Box>
  );
};

export const GameProductionComparison = ({ awayId, homeId, productionScores }) => {
  const awayRows = productionEntries(productionScores?.[awayId]);
  const homeRows = productionEntries(productionScores?.[homeId]);
  const maxTotal = Math.max(
    1,
    ...[...awayRows, ...homeRows].map((row) => Number(row.production_total) || 0),
  );

  if (!awayRows.length && !homeRows.length) return null;

  return (
    <Box mt={6}>
      <Flex align="end" justify="space-between" gap={4} mb={3}>
        <Box>
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Production Above Replacement
          </Text>
          <Text fontSize="2xl" color="text.primary" fontWeight="black" lineHeight="1">
            Player Production Score
          </Text>
        </Box>
        <Text fontSize="10px" color="text.muted" fontWeight="bold" textAlign="right" maxW="320px">
          Stacked contribution score by player, split into passing/receiving/hit, rushing/hawk, and turnover/scrum buckets.
        </Text>
      </Flex>
      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        <TeamProductionPanel teamId={awayId} productionScores={productionScores?.[awayId]} maxTotal={maxTotal} />
        <TeamProductionPanel teamId={homeId} productionScores={productionScores?.[homeId]} maxTotal={maxTotal} />
      </Grid>
    </Box>
  );
};
