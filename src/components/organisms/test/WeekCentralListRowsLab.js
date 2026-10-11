import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { CalendarDays, MapPin, Trophy } from "lucide-react";

const TEAMS = {
  alcorn: { name: "Alcorn State", shortName: "ASU", logo: "/assets/swacalc.svg", color: "#5C068C" },
  aamu: { name: "Alabama A&M", shortName: "AAMU", logo: "/assets/swacaamu.svg", color: "#660000" },
  nccu: { name: "North Carolina Central", shortName: "NCCU", logo: "/assets/meacnccu.svg", color: "#8A1538" },
  odu: { name: "Old Dominion", shortName: "ODU", logo: null, color: "#27272A" },
  scsu: { name: "South Carolina State", shortName: "SCSU", logo: "/assets/meacscsu.svg", color: "#900027" },
  pvamu: { name: "Prairie View A&M", shortName: "PVAMU", logo: "/assets/swacpvamu.svg", color: "#4B0082" },
  famu: { name: "Florida A&M", shortName: "FAMU", logo: "/assets/swacfamu.svg", color: "#006747" },
  fau: { name: "Florida Atlantic", shortName: "FAU", logo: null, color: "#27272A" },
};

const ROWS = [
  {
    id: "alcaamu",
    away: TEAMS.alcorn,
    home: TEAMS.aamu,
    awayScore: 21,
    homeScore: 41,
    status: "Final",
    date: "Sep 6",
    day: "Sat",
    gameName: "Louis Crews Classic",
    venue: "Huntsville, AL",
    tag: "HBCU Non-conf",
    parsed: true,
    bothHBCU: true,
  },
  {
    id: "nccuodu",
    away: TEAMS.nccu,
    home: TEAMS.odu,
    awayScore: 6,
    homeScore: 54,
    status: "Final",
    date: "Sep 6",
    day: "Sat",
    gameName: "Road Test",
    venue: "Norfolk, VA",
    tag: "Non-conf",
    parsed: false,
    bothHBCU: false,
  },
  {
    id: "scsupvamu",
    away: TEAMS.scsu,
    home: TEAMS.pvamu,
    awayScore: null,
    homeScore: null,
    status: "Preview",
    date: "Dec 13",
    day: "Sat",
    gameName: "Celebration Bowl",
    venue: "Mercedes-Benz Stadium",
    tag: "Bowl",
    parsed: true,
    bothHBCU: true,
  },
  {
    id: "famufau",
    away: TEAMS.famu,
    home: TEAMS.fau,
    awayScore: 14,
    homeScore: 56,
    status: "Final",
    date: "Sep 13",
    day: "Sat",
    gameName: "Out-of-conference file",
    venue: "Boca Raton, FL",
    tag: "Non-conf",
    parsed: false,
    bothHBCU: false,
  },
];

const winner = (row) => {
  if (row.awayScore == null || row.homeScore == null || row.awayScore === row.homeScore) return null;
  return row.awayScore > row.homeScore ? "away" : "home";
};

const score = (value) => (value == null ? "--" : value);

const Logo = ({ team, size = "34px" }) => (
  <Flex w={size} h={size} align="center" justify="center" flexShrink={0}>
    {team.logo ? (
      <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" />
    ) : (
      <Flex w="100%" h="100%" align="center" justify="center" borderRadius="full" bg="whiteAlpha.100">
        <Text fontSize="8px" color="text.muted" fontWeight="black">
          {team.shortName.slice(0, 3)}
        </Text>
      </Flex>
    )}
  </Flex>
);

const Shell = ({ title, children }) => (
  <Box h="100%" w="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">
    <Flex h="48px" align="center" px={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
        {title}
      </Text>
    </Flex>
    <Flex direction="column" gap={2} p={2.5} h="calc(100% - 48px)" overflow="hidden">
      {children}
    </Flex>
  </Box>
);

const MetaPill = ({ children, active }) => (
  <Box px={2} py={0.5} borderRadius="full" bg={active ? "brand.500" : "whiteAlpha.100"} flexShrink={0}>
    <Text fontSize="7px" color="white" fontWeight="black" textTransform="uppercase" whiteSpace="nowrap">
      {children}
    </Text>
  </Box>
);

const TeamBlock = ({ team, scoreValue, align = "start", won }) => (
  <Box minW={0} textAlign={align === "end" ? "right" : "left"}>
    <Text
      fontSize="clamp(1rem, 1.7vw, 1.6rem)"
      color={won ? "white" : "text.secondary"}
      fontWeight="black"
      textTransform="uppercase"
      lineHeight={0.95}
      lineClamp={2}
    >
      {team.name}
    </Text>
    <Text mt={1} fontSize="2xl" color={won ? "white" : "text.muted"} fontWeight="black" lineHeight={0.9}>
      {score(scoreValue)}
    </Text>
  </Box>
);

const RowA = ({ row }) => {
  const win = winner(row);
  return (
    <Grid
      templateColumns="minmax(0, 1fr) minmax(138px, 0.82fr) minmax(0, 1fr)"
      gap={3}
      alignItems="center"
      minH="96px"
      px={3}
      py={2.5}
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      bg={`linear-gradient(90deg, ${row.away.color}22 0%, rgba(255,255,255,0.035) 22%, rgba(255,255,255,0.035) 78%, ${row.home.color}22 100%)`}
    >
      <TeamBlock team={row.away} scoreValue={row.awayScore} won={win === "away" || win == null} />
      <Flex direction="column" align="center" gap={1.5} minW={0}>
        <Flex align="center" gap={1.5}>
          <MetaPill active={row.tag === "Bowl"}>{row.tag}</MetaPill>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
            {row.status}
          </Text>
        </Flex>
        <Text fontSize="xs" color="white" fontWeight="black" textTransform="uppercase" textAlign="center" lineClamp={1}>
          {row.gameName}
        </Text>
        <Text fontSize="9px" color="text.muted" fontWeight="bold" textAlign="center" lineClamp={1}>
          {row.day} | {row.date} | {row.venue}
        </Text>
      </Flex>
      <TeamBlock team={row.home} scoreValue={row.homeScore} align="end" won={win === "home" || win == null} />
    </Grid>
  );
};

const RowB = ({ row }) => {
  const win = winner(row);
  const accent = row.bothHBCU ? row.away.color : row.away.color;
  return (
    <Grid
      templateColumns="minmax(0, 1fr) 82px"
      gap={3}
      alignItems="stretch"
      minH="106px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      bg={`linear-gradient(135deg, ${accent}22 0%, rgba(255,255,255,0.035) 48%, rgba(11,11,13,0.94) 100%)`}
      overflow="hidden"
    >
      <Box px={3.5} py={3} minW={0}>
        <Flex align="center" gap={2} mb={2}>
          <Text fontSize="8px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            {row.day} {row.date}
          </Text>
          <Box h="1px" flex={1} bg="whiteAlpha.100" />
          <MetaPill>{row.tag}</MetaPill>
        </Flex>
        <Text fontSize="clamp(1.05rem, 2.1vw, 1.8rem)" color={win === "away" || win == null ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineHeight={0.95} lineClamp={1}>
          {row.away.name}
        </Text>
        <Text fontSize="9px" color="text.muted" fontWeight="black" my={0.5}>
          at
        </Text>
        <Text fontSize="clamp(1.05rem, 2.1vw, 1.8rem)" color={win === "home" || win == null ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineHeight={0.95} lineClamp={1}>
          {row.home.name}
        </Text>
        <Text mt={2} fontSize="10px" color="text.muted" fontWeight="bold" lineClamp={1}>
          {row.gameName} | {row.venue} | {row.parsed ? "game file available" : "schedule-only panel"}
        </Text>
      </Box>
      <Flex direction="column" align="end" justify="center" px={3} bg="blackAlpha.300">
        <Text fontSize="3xl" color={win === "away" || win == null ? "white" : "text.muted"} fontWeight="black" lineHeight={0.82}>
          {score(row.awayScore)}
        </Text>
        <Text fontSize="3xl" color={win === "home" || win == null ? "white" : "text.muted"} fontWeight="black" lineHeight={0.82}>
          {score(row.homeScore)}
        </Text>
        <Text mt={1.5} fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
          {row.status}
        </Text>
      </Flex>
    </Grid>
  );
};

const RowC = ({ row }) => {
  const win = winner(row);
  return (
    <Grid
      templateColumns="46px minmax(0, 1fr) minmax(124px, 0.72fr) minmax(0, 1fr) 46px"
      gap={2.5}
      alignItems="center"
      minH="100px"
      px={3}
      py={2.5}
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      bg="rgba(255,255,255,0.035)"
    >
      <Logo team={row.away} size="38px" />
      <Text fontSize="clamp(0.95rem, 1.55vw, 1.35rem)" color={win === "away" || win == null ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineHeight={0.98} lineClamp={2}>
        {row.away.name}
      </Text>
      <Flex direction="column" align="center" minW={0}>
        <Flex align="center" gap={2}>
          <Text fontSize="2xl" color={win === "away" || win == null ? "white" : "text.muted"} fontWeight="black" lineHeight={1}>
            {score(row.awayScore)}
          </Text>
          <Text fontSize="8px" color="text.muted" fontWeight="black">
            AT
          </Text>
          <Text fontSize="2xl" color={win === "home" || win == null ? "white" : "text.muted"} fontWeight="black" lineHeight={1}>
            {score(row.homeScore)}
          </Text>
        </Flex>
        <Flex mt={1.5} align="center" gap={1.5} minW={0}>
          <Trophy size={11} color="#E53E3E" />
          <Text fontSize="9px" color="text.secondary" fontWeight="black" textTransform="uppercase" lineClamp={1}>
            {row.gameName}
          </Text>
        </Flex>
        <Flex mt={1} align="center" gap={1.5} minW={0}>
          <MapPin size={10} color="rgba(255,255,255,0.34)" />
          <Text fontSize="8px" color="text.muted" fontWeight="bold" lineClamp={1}>
            {row.venue}
          </Text>
        </Flex>
      </Flex>
      <Text fontSize="clamp(0.95rem, 1.55vw, 1.35rem)" color={win === "home" || win == null ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineHeight={0.98} textAlign="right" lineClamp={2}>
        {row.home.name}
      </Text>
      <Logo team={row.home} size="38px" />
    </Grid>
  );
};

const RowD = ({ row }) => {
  const win = winner(row);
  return (
    <Grid
      templateColumns="minmax(0, 1fr) 90px minmax(0, 1fr)"
      gap={2}
      alignItems="stretch"
      minH="112px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      overflow="hidden"
      bg="rgba(255,255,255,0.035)"
    >
      {[["away", row.away, row.awayScore], ["home", row.home, row.homeScore]].map(([side, team, value]) => (
        <Flex key={side} direction="column" justify="space-between" px={3} py={3} minW={0} bg={`${team.color}18`}>
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
            {side}
          </Text>
          <Text fontSize="clamp(1rem, 1.65vw, 1.45rem)" color={win === side || win == null ? "white" : "text.secondary"} fontWeight="black" textTransform="uppercase" lineHeight={0.96} lineClamp={2}>
            {team.name}
          </Text>
          <Text fontSize="2xl" color={win === side || win == null ? "white" : "text.muted"} fontWeight="black" lineHeight={0.9}>
            {score(value)}
          </Text>
        </Flex>
      ))}
      <Flex direction="column" align="center" justify="center" px={2} bg="blackAlpha.400" gridColumn={2} gridRow={1}>
        <CalendarDays size={13} color="#E53E3E" />
        <Text mt={1} fontSize="9px" color="white" fontWeight="black" textTransform="uppercase">
          {row.date}
        </Text>
        <Text mt={1} fontSize="7px" color="text.muted" fontWeight="black" textTransform="uppercase" textAlign="center" lineClamp={2}>
          {row.gameName}
        </Text>
        <MetaPill active={row.tag === "Bowl"}>{row.tag}</MetaPill>
      </Flex>
    </Grid>
  );
};

export const WeekCentralListRowsA = () => (
  <Shell title="Week 2 - Balanced Three Zone">
    {ROWS.map((row) => <RowA key={row.id} row={row} />)}
  </Shell>
);

export const WeekCentralListRowsB = () => (
  <Shell title="Week 2 - Editorial Nameplate">
    {ROWS.map((row) => <RowB key={row.id} row={row} />)}
  </Shell>
);

export const WeekCentralListRowsC = () => (
  <Shell title="Week 2 - Logo Bookends">
    {ROWS.map((row) => <RowC key={row.id} row={row} />)}
  </Shell>
);

export const WeekCentralListRowsD = () => (
  <Shell title="Week 2 - Split Team Panels">
    {ROWS.map((row) => <RowD key={row.id} row={row} />)}
  </Shell>
);
