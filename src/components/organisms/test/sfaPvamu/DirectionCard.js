import { Box, Text, Grid, Flex } from "@chakra-ui/react";
import { fmtSigned, LANES, epaTint, EPA_MAX } from "./previewModel";

// Historical left/middle/right rush and two-depth pass matrices with defense-aware EPA tinting.

const DirCell = ({ epa, line, tint, empty }) => (
  <Box bg={empty ? "rgba(255,255,255,0.02)" : tint} border="1px solid" borderColor="whiteAlpha.100" borderRadius="sm" px={1} py={1.5} textAlign="center" minW={0}>
    <Text fontSize="13px" color={empty ? "text.muted" : "text.primary"} fontWeight="900" fontVariantNumeric="tabular-nums" lineHeight={1.1}>
      {empty ? "—" : fmtSigned(epa, 1)}
    </Text>
    <Text fontSize="8px" color="text.muted" fontWeight="700" letterSpacing="0.04em" mt={0.5} whiteSpace="nowrap" lineClamp={1}>
      {line}
    </Text>
  </Box>
);

const LaneHead = ({ lead }) => (
  <Grid templateColumns={lead ? "34px repeat(3, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))"} gap={1} mb={1}>
    {lead && <Box />}
    {LANES.map((l) => (
      <Text key={l} fontSize="8px" color="text.muted" fontWeight="800" letterSpacing="0.12em" textTransform="uppercase" textAlign="center">
        {l}
      </Text>
    ))}
  </Grid>
);

export const DirectionCard = ({ title, accent, data, isDefense }) => (
  <Box border="1px solid" borderColor="whiteAlpha.100" bg="rgba(15,15,18,0.96)" borderRadius="md" p={2}>
    <Flex justify="space-between" align="center" mb={2}>
      <Text fontSize="9px" fontWeight="800" color="text.secondary" letterSpacing="0.12em" textTransform="uppercase">
        {title}
      </Text>
      <Box w="8px" h="8px" borderRadius="full" bg={accent} />
    </Flex>

    {/* Rush — one row, EPA over carries · yards */}
    <Flex justify="space-between" align="baseline" mb={1}>
      <Text fontSize="8px" fontWeight="800" color="text.secondary" letterSpacing="0.1em" textTransform="uppercase">Rush</Text>
      <Text fontSize="8px" color="text.muted" fontWeight="700">EPA · car · yds</Text>
    </Flex>
    <LaneHead />
    <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={1} mb={2.5}>
      {data.rush.map((c, i) => (
        <DirCell key={LANES[i]} epa={c.epa} line={`${c.car} car · ${c.yds} yds`} tint={epaTint(c.epa, EPA_MAX.rush, isDefense)} empty={c.car === 0} />
      ))}
    </Grid>

    {/* Pass — Deep and Short rows, EPA over C/A · yards */}
    <Flex justify="space-between" align="baseline" mb={1}>
      <Text fontSize="8px" fontWeight="800" color="text.secondary" letterSpacing="0.1em" textTransform="uppercase">Pass</Text>
      <Text fontSize="8px" color="text.muted" fontWeight="700">EPA · C/A · yds</Text>
    </Flex>
    <LaneHead lead />
    {[["deep", "Deep", "12+"], ["short", "Short", "0–12"]].map(([key, label, range]) => (
      <Grid key={key} templateColumns="34px repeat(3, minmax(0, 1fr))" gap={1} mb={1} alignItems="center">
        <Box>
          <Text fontSize="8px" fontWeight="800" color="text.secondary" letterSpacing="0.08em" textTransform="uppercase" lineHeight={1.1}>{label}</Text>
          <Text fontSize="7px" color="text.muted" fontWeight="700" lineHeight={1.1}>{range}</Text>
        </Box>
        {data[key].map((c, i) => (
          <DirCell key={LANES[i]} epa={c.epa} line={`${c.comp}/${c.att} · ${c.yds} yds`} tint={epaTint(c.epa, EPA_MAX.pass, isDefense)} empty={c.att === 0} />
        ))}
      </Grid>
    ))}
  </Box>
);
