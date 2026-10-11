import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

const GAMES = [
  {
    id: "jsu-famu",
    away: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147", score: 31 },
    home: { name: "Florida A&M", shortName: "FAMU", logo: "/assets/swacfamu.svg", color: "#006747", score: 28 },
    label: "Final",
  },
  {
    id: "nccu-odu",
    away: { name: "North Carolina Central", shortName: "NCCU", logo: "/assets/meacnccu.svg", color: "#8A1538", score: 6 },
    home: { name: "Old Dominion", shortName: "ODU", logo: null, color: "#182A48", score: 54 },
    label: "Final",
  },
  {
    id: "scsu-pvamu",
    away: { name: "South Carolina State", shortName: "SCSU", logo: "/assets/meacscsu.svg", color: "#900027", score: 38 },
    home: { name: "Prairie View A&M", shortName: "PVAMU", logo: "/assets/swacpvamu.svg", color: "#4B0082", score: 41 },
    label: "Bowl",
  },
];

const score = (value) => (value == null ? "--" : value);

const winnerSide = (game) => {
  if (game.away.score == null || game.home.score == null || game.away.score === game.home.score) return null;
  return game.away.score > game.home.score ? "away" : "home";
};

const Watermark = ({ team, side = "right", opacity = 0.09 }) => {
  if (!team.logo) return null;
  return (
    <Image
      src={team.logo}
      alt=""
      position="absolute"
      top="-18px"
      right={side === "right" ? "-22px" : "auto"}
      left={side === "left" ? "-22px" : "auto"}
      w="132px"
      h="132px"
      objectFit="contain"
      opacity={opacity}
      pointerEvents="none"
      filter="grayscale(0.2)"
    />
  );
};

const LabFrame = ({ title, children }) => (
  <Box h="100%" w="100%" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" bg="#070708" overflow="hidden">
    <Flex h="46px" align="center" px={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
        {title}
      </Text>
    </Flex>
    <Flex h="calc(100% - 46px)" direction="column" gap={2.5} p={2.5} overflow="hidden">
      {children}
    </Flex>
  </Box>
);

const TeamLogo = ({ team }) => (
  <Flex w="34px" h="34px" align="center" justify="center" flexShrink={0}>
    {team.logo ? (
      <Image src={team.logo} alt={team.shortName} w="34px" h="34px" objectFit="contain" />
    ) : (
      <Flex w="34px" h="34px" borderRadius="full" bg="whiteAlpha.100" align="center" justify="center">
        <Text fontSize="8px" color="text.muted" fontWeight="black">
          {team.shortName}
        </Text>
      </Flex>
    )}
  </Flex>
);

const TicketStubRow = ({ game }) => {
  const winner = winnerSide(game);
  const winningTeam = winner === "away" ? game.away : winner === "home" ? game.home : game.away;

  return (
    <Grid
      templateColumns="minmax(0, 1fr) 108px"
      minH="102px"
      border="1px solid"
      borderColor="rgba(255,255,255,0.16)"
      borderRadius="10px"
      overflow="hidden"
      bg={`linear-gradient(120deg, ${winningTeam.color}88 0%, #0B0B0D 54%, #F4F0E8 54%, #F4F0E8 100%)`}
      position="relative"
    >
      <Watermark team={winningTeam} side="left" opacity={0.11} />
      <Box position="absolute" top="0" bottom="0" right="107px" w="1px" bg="rgba(17,17,19,0.35)" />
      <Box position="absolute" top="12px" bottom="12px" right="101px" borderLeft="2px dashed rgba(17,17,19,0.42)" />
      <Flex position="relative" direction="column" justify="center" px={{ base: 3, lg: 5 }} minW={0}>
        <Text fontSize="8px" color="rgba(255,255,255,0.58)" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
          Admit One - {game.label}
        </Text>
        <Flex align="baseline" gap={2} minW={0} mt={2}>
          <Text fontSize="clamp(1.25rem, 2.7vw, 2.25rem)" color={winner === "away" ? "white" : "rgba(255,255,255,0.58)"} fontWeight="black" textTransform="uppercase" lineHeight={0.9} lineClamp={1}>
            {game.away.name}
          </Text>
          <Text fontSize="10px" color="rgba(255,255,255,0.38)" fontWeight="black">
            at
          </Text>
          <Text fontSize="clamp(1.25rem, 2.7vw, 2.25rem)" color={winner === "home" ? "white" : "rgba(255,255,255,0.58)"} fontWeight="black" textTransform="uppercase" lineHeight={0.9} lineClamp={1}>
            {game.home.name}
          </Text>
        </Flex>
      </Flex>
      <Flex direction="column" justify="center" align="center" color="#111113">
        <Text fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Score
        </Text>
        <Text fontSize="3xl" fontWeight="black" lineHeight={0.9}>
          {score(game.away.score)}
        </Text>
        <Text fontSize="3xl" fontWeight="black" lineHeight={0.9}>
          {score(game.home.score)}
        </Text>
      </Flex>
    </Grid>
  );
};

const FilmSlateRow = ({ game }) => {
  const winner = winnerSide(game);

  return (
    <Box minH="104px" borderRadius="md" overflow="hidden" position="relative" bg="#EFEAE0" color="#0B0B0D">
      <Grid position="absolute" inset={0} templateColumns="repeat(18, 1fr)" opacity={0.14}>
        {Array.from({ length: 18 }).map((_, index) => (
          <Box key={index} borderRight="1px solid #111113" />
        ))}
      </Grid>
      <Grid position="relative" templateColumns="minmax(0, 1fr) 118px minmax(0, 1fr)" h="100%" alignItems="stretch">
        <Flex direction="column" justify="center" px={{ base: 3, lg: 4 }} minW={0} bg={`${game.away.color}18`}>
          <Flex align="center" gap={2} minW={0}>
            <TeamLogo team={game.away} />
            <Text fontSize="clamp(1rem, 2.2vw, 1.85rem)" color={winner === "away" ? "#0B0B0D" : "rgba(11,11,13,0.58)"} fontWeight="black" textTransform="uppercase" lineHeight={0.92} lineClamp={2}>
              {game.away.name}
            </Text>
          </Flex>
        </Flex>
        <Flex direction="column" align="center" justify="center" bg="#0B0B0D" color="white">
          <Text fontSize="8px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            {game.label}
          </Text>
          <Flex align="baseline" gap={2} mt={1}>
            <Text fontSize="3xl" fontWeight="black" lineHeight={0.85}>
              {score(game.away.score)}
            </Text>
            <Text fontSize="10px" color="text.muted" fontWeight="black">
              -
            </Text>
            <Text fontSize="3xl" fontWeight="black" lineHeight={0.85}>
              {score(game.home.score)}
            </Text>
          </Flex>
          <Text mt={1} fontSize="7px" color="text.muted" fontWeight="black" textTransform="uppercase">
            Week central cut
          </Text>
        </Flex>
        <Flex direction="column" justify="center" align="end" px={{ base: 3, lg: 4 }} minW={0} bg={`${game.home.color}18`}>
          <Flex align="center" justify="end" gap={2} minW={0}>
            <Text fontSize="clamp(1rem, 2.2vw, 1.85rem)" color={winner === "home" ? "#0B0B0D" : "rgba(11,11,13,0.58)"} fontWeight="black" textTransform="uppercase" lineHeight={0.92} textAlign="right" lineClamp={2}>
              {game.home.name}
            </Text>
            <TeamLogo team={game.home} />
          </Flex>
        </Flex>
      </Grid>
    </Box>
  );
};

const StadiumLightRow = ({ game }) => {
  const winner = winnerSide(game);
  const winningTeam = winner === "away" ? game.away : winner === "home" ? game.home : game.home;

  return (
    <Box
      minH="106px"
      borderRadius="md"
      border="1px solid"
      borderColor="rgba(255,255,255,0.18)"
      overflow="hidden"
      bg={`radial-gradient(circle at 50% -20%, rgba(255,255,255,0.38) 0%, transparent 24%), linear-gradient(100deg, ${game.away.color}66 0%, #070708 38%, #070708 62%, ${game.home.color}66 100%)`}
      position="relative"
    >
      <Watermark team={winningTeam} opacity={0.1} />
      <Box position="absolute" inset={0} opacity={0.17} bg="repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 18px)" />
      <Grid position="relative" h="100%" templateColumns="minmax(0, 1fr) 132px minmax(0, 1fr)" alignItems="center" px={{ base: 3, lg: 5 }} gap={3}>
        <Box minW={0}>
          <Text fontSize="8px" color="rgba(255,255,255,0.45)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Away
          </Text>
          <Text fontSize="clamp(1.05rem, 2.25vw, 2rem)" color={winner === "away" ? "white" : "rgba(255,255,255,0.54)"} fontWeight="black" textTransform="uppercase" lineHeight={0.92} lineClamp={2}>
            {game.away.name}
          </Text>
        </Box>
        <Flex direction="column" align="center" justify="center" borderLeft="1px solid rgba(255,255,255,0.14)" borderRight="1px solid rgba(255,255,255,0.14)">
          <Text fontSize="8px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Scoreboard
          </Text>
          <Flex align="baseline" gap={2} mt={1}>
            <Text fontSize="4xl" color={winner === "away" ? "white" : "text.muted"} fontWeight="black" lineHeight={0.85}>
              {score(game.away.score)}
            </Text>
            <Text fontSize="4xl" color={winner === "home" ? "white" : "text.muted"} fontWeight="black" lineHeight={0.85}>
              {score(game.home.score)}
            </Text>
          </Flex>
        </Flex>
        <Box minW={0} textAlign="right">
          <Text fontSize="8px" color="rgba(255,255,255,0.45)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Home
          </Text>
          <Text fontSize="clamp(1.05rem, 2.25vw, 2rem)" color={winner === "home" ? "white" : "rgba(255,255,255,0.54)"} fontWeight="black" textTransform="uppercase" lineHeight={0.92} lineClamp={2}>
            {game.home.name}
          </Text>
        </Box>
      </Grid>
    </Box>
  );
};

export const WeekCentralCreativeTicketStub = () => (
  <LabFrame title="Creative Row - Ticket Stub">
    {GAMES.map((game) => <TicketStubRow key={game.id} game={game} />)}
  </LabFrame>
);

export const WeekCentralCreativeFilmSlate = () => (
  <LabFrame title="Creative Row - Film Slate">
    {GAMES.map((game) => <FilmSlateRow key={game.id} game={game} />)}
  </LabFrame>
);

export const WeekCentralCreativeStadiumLight = () => (
  <LabFrame title="Creative Row - Stadium Light">
    {GAMES.map((game) => <StadiumLightRow key={game.id} game={game} />)}
  </LabFrame>
);
