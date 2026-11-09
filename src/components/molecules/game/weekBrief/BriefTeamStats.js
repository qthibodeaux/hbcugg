import { Text, Box, Flex, Image, Grid } from "@chakra-ui/react";
import { teamLogo, teamShort } from "./briefBlockModel";

// Week Central team-stat rows, league notches and block-label presentation.

export const BlockLabel = ({ children, color }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const NOTCH_COLOR = "rgba(255,255,255,0.75)";

const StatCell = ({ stat, side, color }) => {
  const isAway = side === "away";
  const value = isAway ? stat.away : stat.home;
  const other = isAway ? stat.home : stat.away;
  const tied = value === other;
  const wins = !tied && value > other;
  const scaleMax = stat.league?.max != null
    ? Math.max(Math.abs(stat.league.max), Math.abs(stat.league.min ?? 0), Math.abs(value), 1e-9)
    : Math.max(Math.abs(stat.away), Math.abs(stat.home), 1e-9);
  const fill = Math.min(100, (Math.abs(value) / scaleMax) * 100);
  const avgPct = stat.league ? Math.min(100, (Math.abs(stat.league.avg) / scaleMax) * 100) : null;

  return (
    <Box minW={0}>
      <Text
        fontSize={{ base: "12px", xl: "sm" }}
        fontWeight="950"
        color={wins ? color : "rgba(255,255,255,0.5)"}
        textAlign={isAway ? "right" : "left"}
        lineHeight={1}
        lineClamp={1}
      >
        {stat.format(value)}
      </Text>
      <Box position="relative" h="0.125rem" w="full" mt="0.3rem">
        <Box position="absolute" inset={0} borderRadius="full" bg="rgba(0,0,0,0.35)" />
        <Box
          position="absolute"
          top={0}
          bottom={0}
          borderRadius="full"
          bg={color}
          opacity={value < 0 ? 0.28 : 0.85}
          style={{ width: `${fill}%`, ...(isAway ? { right: 0 } : { left: 0 }) }}
        />
        {avgPct != null && (
          <Box
            position="absolute"
            top="-0.125rem"
            bottom="-0.125rem"
            w="0.0625rem"
            bg={NOTCH_COLOR}
            zIndex={2}
            style={isAway ? { right: `${avgPct}%` } : { left: `${avgPct}%` }}
          />
        )}
      </Box>
    </Box>
  );
};

export const BriefTeamStats = ({ rows, awayId, homeId, awayColor, homeColor, accent }) => {
  if (!rows.length) return null;
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={2} pb={2} borderBottom="1px solid" borderColor="rgba(255,255,255,0.14)">
        <BlockLabel color={accent}>Team Stats</BlockLabel>
        <Flex align="center" gap={2}>
          <Flex align="center" gap={1}>
            <Image src={teamLogo(awayId)} alt="" h="14px" w="14px" objectFit="contain" />
            <Text fontSize="9px" color="rgba(255,255,255,0.7)" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">{teamShort(awayId)}</Text>
          </Flex>
          <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" />
          <Flex align="center" gap={1}>
            <Text fontSize="9px" color="rgba(255,255,255,0.7)" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">{teamShort(homeId)}</Text>
            <Image src={teamLogo(homeId)} alt="" h="14px" w="14px" objectFit="contain" />
          </Flex>
        </Flex>
      </Flex>
      <Flex direction="column" gap={{ base: "9px", xl: "12px" }}>
        {rows.map((stat) => (
          <Grid key={stat.label} templateColumns="minmax(0, 1.75fr) minmax(0, 1fr) minmax(0, 1fr)" columnGap="0.5rem" alignItems="center">
            <Text fontSize={{ base: "9px", xl: "10px" }} fontWeight="black" color="rgba(255,255,255,0.62)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.15}>
              {stat.label}
            </Text>
            <StatCell stat={stat} side="away" color={awayColor} />
            <StatCell stat={stat} side="home" color={homeColor} />
          </Grid>
        ))}
      </Flex>

      {/* Key — the notch and the unfilled remainder are both deliberate and
          neither is self-explanatory. Only shown when league context loaded. */}
      {rows.some((stat) => stat.league) && (
        <Flex align="center" justify="center" gap={5} mt={3} pt={2} borderTop="1px solid" borderColor="rgba(255,255,255,0.14)" flexWrap="wrap" rowGap={1}>
          <Flex align="center" gap={1.5}>
            <Box w="0.0625rem" h="0.5rem" bg={NOTCH_COLOR} flexShrink={0} />
            <Text fontSize="8px" color="rgba(255,255,255,0.55)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">League Avg</Text>
          </Flex>
          <Flex align="center" gap={1.5}>
            <Box position="relative" w="1.75rem" h="0.125rem" borderRadius="full" bg="rgba(0,0,0,0.35)" flexShrink={0} overflow="hidden">
              <Box position="absolute" left={0} top={0} bottom={0} w="58%" borderRadius="full" bg="rgba(255,255,255,0.5)" />
            </Box>
            <Text fontSize="8px" color="rgba(255,255,255,0.55)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Fill = vs League Max</Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};
