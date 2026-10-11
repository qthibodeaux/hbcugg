import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

const GAMES = [
  {
    id: "jsu-famu",
    away: { name: "Jackson State", shortName: "JSU", logo: "/assets/swacjsu.svg", color: "#002147", secondary: "#FFFFFF", score: 31 },
    home: { name: "Florida A&M", shortName: "FAMU", logo: "/assets/swacfamu.svg", color: "#006747", secondary: "#F4811F", score: 28 },
    status: "Final",
    hook: "The closing drive changed the whole room.",
  },
  {
    id: "nccu-odu",
    away: { name: "North Carolina Central", shortName: "NCCU", logo: "/assets/meacnccu.svg", color: "#8A1538", secondary: "#A89968", score: 6 },
    home: { name: "Old Dominion", shortName: "ODU", logo: null, color: "#17233F", secondary: "#A8B3C8", score: 54 },
    status: "Final",
    hook: "Schedule-only file with the HBCU side still carrying the story.",
  },
  {
    id: "scsu-pvamu",
    away: { name: "South Carolina State", shortName: "SCSU", logo: "/assets/meacscsu.svg", color: "#900027", secondary: "#002B54", score: 38 },
    home: { name: "Prairie View A&M", shortName: "PVAMU", logo: "/assets/swacpvamu.svg", color: "#4B0082", secondary: "#FFB81C", score: 41 },
    status: "Bowl",
    hook: "A postseason scoreboard that should feel bigger than a row.",
  },
];

const getWinner = (game) => {
  if (game.away.score == null || game.home.score == null || game.away.score === game.home.score) return null;
  return game.away.score > game.home.score ? "away" : "home";
};

const score = (value) => (value == null ? "--" : value);

const TeamMark = ({ team, size = "42px", subtle = false }) => (
  <Flex w={size} h={size} align="center" justify="center" flexShrink={0} opacity={subtle ? 0.62 : 1}>
    {team.logo ? (
      <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" />
    ) : (
      <Flex w="100%" h="100%" borderRadius="full" bg="whiteAlpha.100" align="center" justify="center">
        <Text fontSize="8px" color="text.muted" fontWeight="black">
          {team.shortName}
        </Text>
      </Flex>
    )}
  </Flex>
);

const Frame = ({ title, children }) => (
  <Box h="100%" w="100%" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" bg="#08080A" overflow="hidden">
    <Flex h="44px" align="center" px={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="lg" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
        {title}
      </Text>
    </Flex>
    <Flex h="calc(100% - 44px)" direction="column" gap={2.5} p={2.5} overflow="hidden">
      {children}
    </Flex>
  </Box>
);

const ScoreEclipseRow = ({ game }) => {
  const winner = getWinner(game);
  const winningTeam = winner === "away" ? game.away : winner === "home" ? game.home : game.home;
  const losingTeam = winner === "away" ? game.home : game.away;

  return (
    <Box
      minH="118px"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      bg={`radial-gradient(circle at 50% 50%, ${winningTeam.color} 0%, ${winningTeam.color} 21%, #09090B 22%, #09090B 100%)`}
      border="1px solid"
      borderColor="rgba(255,255,255,0.14)"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(100deg, ${game.away.color}66 0%, transparent 42%, transparent 58%, ${game.home.color}66 100%)`} />
      <Text position="absolute" left="12px" bottom="-10px" fontSize="74px" color="white" opacity={0.035} fontWeight="black" lineHeight={1}>
        {winningTeam.shortName}
      </Text>
      <Grid position="relative" h="100%" templateColumns="minmax(0, 1fr) 168px minmax(0, 1fr)" alignItems="center" px={{ base: 3, lg: 5 }} gap={2}>
        <Flex direction="column" minW={0}>
          <Text fontSize="8px" color="rgba(255,255,255,0.44)" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Away
          </Text>
          <Text fontSize="clamp(1.05rem, 2vw, 1.85rem)" color={winner === "away" ? "white" : "rgba(255,255,255,0.48)"} fontWeight="black" textTransform="uppercase" lineHeight={0.92} lineClamp={2}>
            {game.away.name}
          </Text>
        </Flex>
        <Flex direction="column" align="center" justify="center" minW={0}>
          <Text fontSize="8px" color={winningTeam.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            {game.status}
          </Text>
          <Flex align="baseline" gap={2} mt={1}>
            <Text fontSize="clamp(2.8rem, 6vw, 4.8rem)" color={winner === "away" ? "white" : "rgba(255,255,255,0.46)"} fontWeight="black" lineHeight={0.8}>
              {score(game.away.score)}
            </Text>
            <Text fontSize="16px" color="rgba(255,255,255,0.32)" fontWeight="black">
              /
            </Text>
            <Text fontSize="clamp(2.8rem, 6vw, 4.8rem)" color={winner === "home" ? "white" : "rgba(255,255,255,0.46)"} fontWeight="black" lineHeight={0.8}>
              {score(game.home.score)}
            </Text>
          </Flex>
          <Text mt={1} fontSize="8px" color="rgba(255,255,255,0.38)" fontWeight="black" textTransform="uppercase" lineClamp={1}>
            {winningTeam.shortName} over {losingTeam.shortName}
          </Text>
        </Flex>
        <Flex direction="column" align="end" textAlign="right" minW={0}>
          <Text fontSize="8px" color="rgba(255,255,255,0.44)" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
            Home
          </Text>
          <Text fontSize="clamp(1.05rem, 2vw, 1.85rem)" color={winner === "home" ? "white" : "rgba(255,255,255,0.48)"} fontWeight="black" textTransform="uppercase" lineHeight={0.92} lineClamp={2}>
            {game.home.name}
          </Text>
        </Flex>
      </Grid>
    </Box>
  );
};

const WinnerTakeoverRow = ({ game }) => {
  const winner = getWinner(game);
  const winningTeam = winner === "away" ? game.away : winner === "home" ? game.home : game.home;

  return (
    <Box minH="124px" borderRadius="xl" overflow="hidden" position="relative" bg={winningTeam.color} border="1px solid" borderColor="rgba(255,255,255,0.16)">
      {winningTeam.logo && (
        <Image src={winningTeam.logo} alt="" position="absolute" right="-28px" top="-34px" w="190px" h="190px" objectFit="contain" opacity={0.13} />
      )}
      <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.76) 100%)" />
      <Grid position="relative" h="100%" templateColumns="minmax(0, 1.35fr) minmax(120px, 0.55fr)" alignItems="center" px={{ base: 3, lg: 5 }} gap={4}>
        <Box minW={0}>
          <Text fontSize="8px" color={winningTeam.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Winner takeover
          </Text>
          <Text mt={1} fontSize="clamp(1.4rem, 3.2vw, 3rem)" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.84} lineClamp={2}>
            {winningTeam.name}
          </Text>
          <Flex mt={3} align="center" gap={2} minW={0}>
            <Text fontSize="10px" color="rgba(255,255,255,0.62)" fontWeight="black" textTransform="uppercase" lineClamp={1}>
              {game.away.name}
            </Text>
            <Text fontSize="10px" color="rgba(255,255,255,0.34)" fontWeight="black">
              at
            </Text>
            <Text fontSize="10px" color="rgba(255,255,255,0.62)" fontWeight="black" textTransform="uppercase" lineClamp={1}>
              {game.home.name}
            </Text>
          </Flex>
          <Text mt={1} fontSize="9px" color="rgba(255,255,255,0.38)" fontWeight="bold" lineClamp={1}>
            {game.hook}
          </Text>
        </Box>
        <Flex align="center" justify="end" gap={2}>
          <Flex direction="column" align="center">
            <Text fontSize="9px" color={winner === "away" ? "white" : "rgba(255,255,255,0.42)"} fontWeight="black">
              {game.away.shortName}
            </Text>
            <Text fontSize="clamp(2.5rem, 5vw, 4.2rem)" color={winner === "away" ? "white" : "rgba(255,255,255,0.42)"} fontWeight="black" lineHeight={0.82}>
              {score(game.away.score)}
            </Text>
          </Flex>
          <Box h="62px" w="1px" bg="rgba(255,255,255,0.22)" />
          <Flex direction="column" align="center">
            <Text fontSize="9px" color={winner === "home" ? "white" : "rgba(255,255,255,0.42)"} fontWeight="black">
              {game.home.shortName}
            </Text>
            <Text fontSize="clamp(2.5rem, 5vw, 4.2rem)" color={winner === "home" ? "white" : "rgba(255,255,255,0.42)"} fontWeight="black" lineHeight={0.82}>
              {score(game.home.score)}
            </Text>
          </Flex>
        </Flex>
      </Grid>
    </Box>
  );
};

const MarqueeRow = ({ game }) => {
  const winner = getWinner(game);

  return (
    <Box minH="118px" borderRadius="xl" overflow="hidden" bg="#F2EBDD" color="#101014" border="1px solid" borderColor="rgba(255,255,255,0.14)" position="relative">
      <Grid position="absolute" inset={0} templateColumns="repeat(14, 1fr)" opacity={0.08}>
        {Array.from({ length: 14 }).map((_, index) => (
          <Box key={index} borderRight="1px solid #101014" />
        ))}
      </Grid>
      <Box position="absolute" left="0" top="0" bottom="0" w="10px" bg={game.away.color} />
      <Box position="absolute" right="0" top="0" bottom="0" w="10px" bg={game.home.color} />
      <Grid position="relative" h="100%" templateColumns="74px minmax(0, 1fr) 132px" alignItems="center" gap={3} px={{ base: 3, lg: 5 }} py={3}>
        <Flex direction="column" align="center" gap={1}>
          <TeamMark team={game.away} size="34px" subtle={winner === "home"} />
          <TeamMark team={game.home} size="34px" subtle={winner === "away"} />
        </Flex>
        <Box minW={0}>
          <Text fontSize="8px" color="#A32525" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Now showing
          </Text>
          <Text mt={1} fontSize="clamp(1.2rem, 2.8vw, 2.45rem)" color="#101014" fontWeight="black" textTransform="uppercase" lineHeight={0.88} lineClamp={2}>
            {game.away.name} at {game.home.name}
          </Text>
          <Text mt={2} fontSize="10px" color="rgba(16,16,20,0.58)" fontWeight="black" textTransform="uppercase" lineClamp={1}>
            {game.status} feature - {game.hook}
          </Text>
        </Box>
        <Flex direction="column" align="end">
          <Text fontSize="8px" color="rgba(16,16,20,0.5)" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
            Score
          </Text>
          <Flex align="baseline" gap={1}>
            <Text fontSize="clamp(2.5rem, 5vw, 4rem)" color={winner === "away" ? "#101014" : "rgba(16,16,20,0.36)"} fontWeight="black" lineHeight={0.82}>
              {score(game.away.score)}
            </Text>
            <Text fontSize="14px" color="rgba(16,16,20,0.36)" fontWeight="black">
              -
            </Text>
            <Text fontSize="clamp(2.5rem, 5vw, 4rem)" color={winner === "home" ? "#101014" : "rgba(16,16,20,0.36)"} fontWeight="black" lineHeight={0.82}>
              {score(game.home.score)}
            </Text>
          </Flex>
        </Flex>
      </Grid>
    </Box>
  );
};

export const WeekCentralMagicScoreEclipse = () => (
  <Frame title="Magic Row - Score Eclipse">
    {GAMES.map((game) => <ScoreEclipseRow key={game.id} game={game} />)}
  </Frame>
);

export const WeekCentralMagicWinnerTakeover = () => (
  <Frame title="Magic Row - Winner Takeover">
    {GAMES.map((game) => <WinnerTakeoverRow key={game.id} game={game} />)}
  </Frame>
);

export const WeekCentralMagicMarquee = () => (
  <Frame title="Magic Row - Marquee Sheet">
    {GAMES.map((game) => <MarqueeRow key={game.id} game={game} />)}
  </Frame>
);
