import { Flex, Text, VStack, Grid, Box } from "@chakra-ui/react";
import { fmtPct, fmt1, displayName } from "./productionData";

const MiniStat = ({ label, value, color = "text.primary" }) => (
  <Flex direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" py="4px" minW={0}>
    <Text fontSize="clamp(10px, 0.88vw, 13px)" color={color} fontWeight="950" lineHeight={1}>{value}</Text>
    <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{label}</Text>
  </Flex>
);

export const FieldGoalBody = ({ data, accent }) => (
  <VStack align="stretch" gap="5px">
    <Grid templateColumns="repeat(4, 1fr)" gap="4px">
      <MiniStat label="FG" value={`${data.made}/${data.attempts}`} color={accent} />
      <MiniStat label="FG%" value={fmtPct(data.pct)} color="#68D391" />
      <MiniStat label="Long" value={data.long || "—"} color="#63B3ED" />
      <MiniStat label="PAT" value={`${data.patMade}/${data.patAttempts}`} color={data.patBlocked ? "#E53E3E" : "text.primary"} />
    </Grid>
    <Grid templateColumns="repeat(4, 1fr)" gap="3px">
      {data.ranges.map((range) => (
        <Box key={range.label} bg={range.att ? "rgba(104,211,145,0.13)" : "rgba(255,255,255,0.025)"} border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" py="4px" textAlign="center">
          <Text fontSize="6px" color="text.muted" fontWeight="900">{range.label}</Text>
          <Text fontSize="9px" color="text.primary" fontWeight="950" mt="2px">{range.made}/{range.att}</Text>
        </Box>
      ))}
    </Grid>
  </VStack>
);

export const KickoffBody = ({ data, accent }) => (
  <VStack align="stretch" gap="5px">
    <Grid templateColumns="repeat(4, 1fr)" gap="4px">
      <MiniStat label="KO" value={data.attempts} color={accent} />
      <MiniStat label="TB" value={fmtPct(data.touchbackRate)} color="#63B3ED" />
      <MiniStat label="Start Allwd" value={fmt1(data.avgStartAllowed)} color="#F6AD55" />
      <MiniStat label="ESPA" value={fmt1(data.espa)} color={data.espa >= 0 ? "#68D391" : "#E53E3E"} />
    </Grid>
    <Grid templateColumns="repeat(3, 1fr)" gap="4px">
      <MiniStat label="Ret Rate" value={fmtPct(data.returnRateAllowed)} color="#F6AD55" />
      <MiniStat label="Ret Avg" value={fmt1(data.avgReturnAllowed)} color="#63B3ED" />
      <MiniStat label="Expl" value={data.explosivesAllowed} color={data.explosivesAllowed ? "#E53E3E" : "#68D391"} />
    </Grid>
  </VStack>
);

export const PuntBody = ({ data, accent }) => (
  <VStack align="stretch" gap="5px">
    <Grid templateColumns="repeat(4, 1fr)" gap="4px">
      <MiniStat label="Punts" value={data.attempts} color={accent} />
      <MiniStat label="Gross" value={fmt1(data.gross)} color="#63B3ED" />
      <MiniStat label="I20" value={fmtPct(data.inside20)} color="#68D391" />
      <MiniStat label="NYOE" value={fmt1(data.nyoe)} color={data.nyoe >= 0 ? "#68D391" : "#E53E3E"} />
    </Grid>
    <Grid templateColumns="repeat(3, 1fr)" gap="4px">
      <MiniStat label="Ret Rate" value={fmtPct(data.returnRateAllowed)} color="#F6AD55" />
      <MiniStat label="Ret Avg" value={fmt1(data.avgReturnAllowed)} color="#63B3ED" />
      <MiniStat label="Blocks" value={data.blocks} color={data.blocks ? "#68D391" : "text.primary"} />
    </Grid>
  </VStack>
);

export const ContributorList = ({ contributors, accent }) => (
  <VStack align="stretch" gap="4px" minH={0} borderLeft="1px solid rgba(255,255,255,0.08)" pl="6px">
    <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">contributors</Text>
    {contributors.map((player) => (
      <Grid key={`${player.name}-${player.role}`} templateColumns="28px minmax(0, 1fr)" gap="5px" alignItems="center" minW={0}>
        <Flex w="24px" h="20px" align="center" justify="center" bg={`${accent}22`} border={`1px solid ${accent}66`} borderRadius="sm">
          <Text fontSize="6px" color={accent} fontWeight="950">{player.role}</Text>
        </Flex>
        <Box minW={0}>
          <Text fontSize="8px" color="text.primary" fontWeight="900" truncate>{displayName(player.name)}</Text>
          <Text fontSize="6px" color="text.muted" fontWeight="800" truncate>{player.line}</Text>
        </Box>
      </Grid>
    ))}
  </VStack>
);
