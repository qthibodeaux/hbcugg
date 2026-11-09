import { Flex, Text, Box, Grid, VStack } from "@chakra-ui/react";
import { tone, signed, fmt1, fmtPct } from "./ledgerData";

// Special-teams ledger tiles, headers, return rows and range rail.

const ValueTile = ({ label, value, sub, color = "text.primary" }) => (
  <Flex
    direction="column"
    justify="center"
    minW={0}
    bg="rgba(255,255,255,0.04)"
    border="1px solid rgba(255,255,255,0.07)"
    borderRadius="sm"
    px="6px"
    py="5px"
  >
    <Text fontSize="clamp(10px, 0.78vw, 13px)" color={color} fontWeight="950" lineHeight={1}>
      {value}
    </Text>
    <Text fontSize="6px" color="text.primary" fontWeight="900" textTransform="uppercase" mt="3px" truncate>
      {label}
    </Text>
    {sub && (
      <Text fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1px" truncate>
        {sub}
      </Text>
    )}
  </Flex>
);

const TeamHeader = ({ team, extra }) => (
  <Flex align="center" justify="space-between" gap="8px" minH="26px">
    <Flex align="center" gap="7px" minW={0}>
      <Box w="4px" h="19px" bg={team.colors.accent} borderRadius="full" />
      <Box minW={0}>
        <Text fontSize="clamp(12px, 1vw, 17px)" color="text.primary" fontWeight="950" textTransform="uppercase" lineHeight={1} truncate>
          {team.shortName}
        </Text>
        <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>
          special teams ledger
        </Text>
      </Box>
    </Flex>
    {extra}
  </Flex>
);

export const FieldPositionLedger = ({ team, data }) => {
  const longFieldRate = data.longFieldDriveRate;
  const hiddenYards = team.hiddenYards;
  const swing = team.summary.swing;

  return (
    <Box
      bg={`linear-gradient(90deg, ${team.colors.primary}55 0%, rgba(255,255,255,0.025) 74%)`}
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="sm"
      p="6px"
      minH={0}
    >
      <TeamHeader
        team={team}
        extra={
          <Text fontSize="8px" color={tone(swing)} fontWeight="950" textTransform="uppercase">
            {signed(swing)} swing
          </Text>
        }
      />
      <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="4px" mt="6px">
        <ValueTile label="Avg Start" value={fmt1(team.avgStart)} sub="own drives" color="#63B3ED" />
        <ValueTile label="Long Field" value={fmtPct(longFieldRate)} sub="drive rate" color="#F6AD55" />
        <ValueTile label="Hidden Yds" value={signed(hiddenYards)} sub="field position" color={tone(hiddenYards)} />
        <ValueTile label="ST Plays" value={team.summary.plays} sub="tracked" color={team.colors.accent} />
        <ValueTile label="Penalty Cost" value={team.summary.penaltyCost} sub="yards" color="#F6AD55" />
      </Grid>
    </Box>
  );
};

export const StatPill = ({ label, value, color = "text.primary" }) => (
  <Flex align="center" justify="space-between" gap="5px" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" px="6px" py="4px" minW={0}>
    <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" truncate>
      {label}
    </Text>
    <Text fontSize="9px" color={color} fontWeight="950" lineHeight={1} flexShrink={0}>
      {value}
    </Text>
  </Flex>
);

export const ReturnRows = ({ rows, accent }) => (
  <VStack align="stretch" gap="3px" minH={0}>
    {rows.slice(0, 3).map((row) => (
      <Grid key={row.name} templateColumns="minmax(0, 1fr) 28px 34px 28px" gap="4px" alignItems="center">
        <Box minW={0}>
          <Text fontSize="7px" color="text.primary" fontWeight="900" truncate>
            {row.name}
          </Text>
          <Text fontSize="5.5px" color="text.muted" fontWeight="750" truncate>
            {row.note || `${row.long} long`}
          </Text>
        </Box>
        <Text fontSize="8px" color={accent} fontWeight="950" textAlign="right">{row.ret}</Text>
        <Text fontSize="8px" color="text.primary" fontWeight="950" textAlign="right">{row.yards}</Text>
        <Text fontSize="8px" color="#63B3ED" fontWeight="950" textAlign="right">{fmt1(row.avg)}</Text>
      </Grid>
    ))}
  </VStack>
);

export const PhaseBox = ({ title, children, accent }) => (
  <Box bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" p="6px" minH={0} overflow="hidden">
    <Flex align="center" justify="space-between" mb="5px">
      <Text fontSize="8px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.03em">
        {title}
      </Text>
      <Box w="24px" h="3px" bg={accent} borderRadius="full" />
    </Flex>
    {children}
  </Box>
);

export const RangeRail = ({ ranges, accent }) => (
  <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="3px">
    {ranges.map((range) => (
      <Flex key={range.label} direction="column" align="center" justify="center" bg={range.att ? `${accent}22` : "rgba(255,255,255,0.025)"} border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" py="4px" minW={0}>
        <Text fontSize="5.5px" color="text.muted" fontWeight="900">{range.label}</Text>
        <Text fontSize="8px" color="text.primary" fontWeight="950" mt="2px">{range.made}/{range.att}</Text>
      </Flex>
    ))}
  </Grid>
);
