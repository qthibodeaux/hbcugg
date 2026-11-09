import { MEAC, CELEBRATION_TEAM_COLORS, CELEBRATION_LEDGER_GAMES, SWAC } from "../../../../data/wiki_data";
import { Box, Text, Flex, Image, Grid, SimpleGrid, Badge } from "@chakra-ui/react";
import { Card } from "../../../molecules/wiki/ConferenceWikiCard";
import { Eyebrow, Title, Stat, HeaderCell, MatrixCell } from "./WikiPrimitives";
import { Trophy } from "lucide-react";
import { PathDiagram } from "./ConferenceIdentity";
import { CELEBRATION_RESULTS } from "./ConferenceWikiData";
import { Fragment } from "react";

// Existing implementation extracted along responsibility boundaries.

const CelebrationLedgerTile = ({ game, side }) => {
  const winnerColor = game.winner === "MEAC" ? MEAC.colors.secondary : "#A855F7";
  const winnerBg =
    game.winner === "MEAC"
      ? "linear-gradient(135deg, rgba(255,209,0,0.18), rgba(11,11,13,0.96))"
      : "linear-gradient(135deg, rgba(229,62,62,0.2), rgba(11,11,13,0.96))";
  const meacWon = game.winner === "MEAC";
  const teamColor = CELEBRATION_TEAM_COLORS[game.winnerAbbrev] || winnerColor;

  return (
    <Box
      minW={0}
      p={0}
      borderRadius="8px"
      bg={winnerBg}
      border="1px solid"
      borderColor={`${winnerColor}66`}
      borderTop="3px solid"
      borderTopColor={winnerColor}
      boxShadow={`0 0 18px ${winnerColor}14`}
      position="relative"
      overflow="hidden"
    >
      <Text
        position="absolute"
        right="-4px"
        top="18px"
        fontSize="36px"
        color="white"
        fontWeight="black"
        opacity={0.035}
        lineHeight={1}
      >
        {game.winner}
      </Text>
      <Box position="relative" zIndex={1} h="56%" px={{ base: 2, xl: 2.5 }} pt={{ base: 2, xl: 2.5 }}>
        <Flex align="center" justify="center" gap={2} mb={2}>
          <Text fontSize="12px" color={winnerColor} fontWeight="black" lineHeight={1}>
            {game.year}
          </Text>
        </Flex>
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontSize="12px" color={meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.meacAbbrev}
          </Text>
          <Text fontSize="16px" color={meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
            {game.meacScore}
          </Text>
        </Flex>
        <Box h="1px" bg="whiteAlpha.100" my={1.2} />
        <Flex align="center" justify="space-between" gap={2}>
          <Text fontSize="12px" color={!meacWon ? "white" : "text.muted"} fontWeight="black" lineClamp={1}>
            {game.swacAbbrev}
          </Text>
          <Text fontSize="16px" color={!meacWon ? winnerColor : "text.secondary"} fontWeight="black" lineHeight={1}>
            {game.swacScore}
          </Text>
        </Flex>
      </Box>

      <Box position="absolute" left={0} right={0} bottom={0} h="58%" overflow="hidden">
        <Image
          src={game.photo}
          alt=""
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="center center"
          opacity={0.82}
          filter="contrast(1.08) saturate(1.02)"
        />
        <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(9,9,11,0.96) 0%, rgba(9,9,11,0.58) 18%, rgba(9,9,11,0.12) 46%, rgba(9,9,11,0.04) 72%, rgba(0,0,0,0.42) 100%)" />
        <Box position="absolute" inset={0} bg={`linear-gradient(0deg, ${winnerColor}22, transparent 44%)`} />
        <Text
          position="absolute"
          left="50%"
          bottom={0.25}
          transform="translateX(-50%)"
          w="82%"
          fontSize="clamp(1.2rem, 2.1vw, 2.0rem)"
          color={teamColor}
          fontWeight="black"
          textTransform="uppercase"
          letterSpacing="-0.07em"
          lineHeight={0.84}
          textAlign="center"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="clip"
          textShadow="0 2px 8px rgba(0,0,0,0.9)"
          lineClamp={1}
        >
          {game.winnerDisplay}
        </Text>
      </Box>
    </Box>
  );
};

export const CelebrationBowlLedger = () => {
  const leftGames = CELEBRATION_LEDGER_GAMES.slice(0, 5);
  const rightGames = CELEBRATION_LEDGER_GAMES.slice(5);

  return (
    <Card
      accent="#FF4B00"
      bg="radial-gradient(circle at 50% 54%, rgba(255,75,0,0.14), transparent 28%), linear-gradient(90deg, rgba(11,11,13,1), rgba(15,15,18,0.98) 50%, rgba(11,11,13,1))"
    >
      <Box position="absolute" inset={0} pointerEvents="none">
        <Box position="absolute" left="2%" right="2%" top="50%" h="1px" bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)" />
        <Text
          position="absolute"
          left="50%"
          bottom="-22px"
          transform="translateX(-50%)"
          fontSize="clamp(4rem, 11vw, 9rem)"
          color="white"
          fontWeight="black"
          opacity={0.025}
          lineHeight={0.8}
          letterSpacing="-0.07em"
        >
          ATLANTA
        </Text>
      </Box>

      <Grid h="100%" templateColumns="1.4fr 0.8fr 1.4fr" gap={0} p={{ base: 2, xl: 4 }} position="relative">
        <Box minW={0} display="flex" flexDirection="column" mr={{ base: "-8px", xl: "-12px" }} zIndex={2}>
          <SimpleGrid columns={5} gap={{ base: 1, xl: 1.5 }} flex={1} alignItems="stretch">
            {leftGames.map((game) => (
              <CelebrationLedgerTile key={game.year} game={game} side="left" />
            ))}
          </SimpleGrid>
        </Box>

        <Flex direction="column" align="center" justify="center" minW={0} textAlign="center" position="relative" zIndex={1}>
          <Image
            src="/assets/celebrationbowl.png"
            alt="Celebration Bowl"
            w="clamp(180px, 22vw, 320px)"
            h="auto"
            objectFit="contain"
            filter="drop-shadow(0 12px 24px rgba(0,0,0,0.7))"
          />
        </Flex>

        <Box minW={0} display="flex" flexDirection="column" textAlign="right" ml={{ base: "-8px", xl: "-12px" }} zIndex={2}>
          <SimpleGrid columns={5} gap={{ base: 1, xl: 1.5 }} flex={1} alignItems="stretch">
            {rightGames.map((game) => (
              <CelebrationLedgerTile key={game.year} game={game} side="right" />
            ))}
          </SimpleGrid>
        </Box>
      </Grid>
    </Card>
  );
};

export const MeacSwacChallengeBanner = () => (
  <Card bg="white" border="1px solid" borderColor="gray.200" boxShadow="0 10px 40px rgba(0,0,0,0.08)" overflow="hidden">
    <Grid h="100%" templateColumns="2fr 1.5fr 2fr" gap={0} position="relative">
      {/* Background Watermark */}
      <Text
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        fontSize="24rem"
        fontWeight="900"
        color="gray.50"
        zIndex={0}
        pointerEvents="none"
        letterSpacing="-0.05em"
      >
        W0
      </Text>

      {/* LEFT BLOCK: Series History & Dominance */}
      <Box zIndex={1} borderRight="1px solid" borderColor="gray.100" bg="linear-gradient(135deg, rgba(0,63,135,0.03) 0%, transparent 100%)">
        <Grid templateColumns="repeat(2, 1fr)" gap={0} h="100%">
          {/* Detailed Series Meter */}
          <Flex direction="column" justify="center" p={4} borderRight="1px solid" borderColor="gray.100" position="relative">
            <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg="blue.600" />
            <Text fontSize="10px" fontWeight="black" color="blue.700" mb={1} textTransform="uppercase">Series Record</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="3xl" fontWeight="900" color="gray.800">11</Text>
              <Text fontSize="xs" fontWeight="bold" color="blue.500">MEAC</Text>
              <Text fontSize="3xl" fontWeight="900" color="gray.300">-</Text>
              <Text fontSize="3xl" fontWeight="900" color="gray.800">7</Text>
              <Text fontSize="xs" fontWeight="bold" color="red.500">SWAC</Text>
            </Flex>
            <Box w="full" h="6px" bg="gray.100" borderRadius="full" mt={2} overflow="hidden" boxShadow="inset 0 1px 2px rgba(0,0,0,0.1)">
              <Box w="61%" h="full" bg="blue.600" />
            </Box>
            <Text fontSize="9px" color="blue.600" mt={2} fontWeight="900">MEAC DOMINANCE: +4</Text>
          </Flex>

          {/* Participation Density */}
          <Flex direction="column" justify="center" p={4} bg="gray.50/40">
            <Text fontSize="10px" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Most Active</Text>
            {[
              ["SC State", "7 App", "blue"],
              ["Southern", "4 App", "red"],
              ["BCU", "4 App", "blue"]
            ].map(([team, stat, color]) => (
              <Flex key={team} justify="space-between" mb={1} align="center">
                <Text fontSize="10px" fontWeight="900" color="gray.700">{team}</Text>
                <Badge variant="solid" colorScheme={color} fontSize="8px" size="sm">{stat}</Badge>
              </Flex>
            ))}
          </Flex>

          {/* Venue & Location Heritage */}
          <Flex direction="column" justify="center" p={4} borderTop="1px solid" borderColor="gray.100" gridColumn="span 2" bg="white">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="9px" fontWeight="black" color="gray.400" textTransform="uppercase">Current Residency</Text>
                <Text fontSize="sm" fontWeight="1000" color="gray.800">CENTER PARC STADIUM</Text>
                <Text fontSize="9px" fontWeight="bold" color="red.600">ATLANTA, GA (2018-PRES)</Text>
              </Box>
              <Box textAlign="right">
                <Text fontSize="9px" fontWeight="black" color="gray.400" textTransform="uppercase">Legacy Path</Text>
                <Text fontSize="9px" fontWeight="bold" color="gray.600">ORLANDO � BIRMINGHAM � BATON ROUGE</Text>
              </Box>
            </Flex>
          </Flex>
        </Grid>
      </Box>

      {/* CENTER: BRAND CORE */}
      <Flex direction="column" align="center" justify="center" px={4} zIndex={2} bg="white" boxShadow="0 0 40px rgba(0,0,0,0.05)">
        <Box position="relative">
           <Image
            src="/assets/meacswachallengelogo.png"
            alt="MEAC/SWAC Challenge"
            h="115px"
            objectFit="contain"
            filter="drop-shadow(0 6px 15px rgba(0,0,0,0.15))"
            mb={3}
          />
        </Box>
        <Flex gap={1} mb={2}>
          <Badge variant="solid" bg="gray.800" color="white" px={2} borderRadius="0" fontSize="9px">EST. 2005</Badge>
          <Badge variant="solid" bg="#A855F7" color="white" px={2} borderRadius="0" fontSize="9px">ESPN EVENTS</Badge>
        </Flex>
        <Text fontSize="9px" fontWeight="black" color="#A855F7" letterSpacing="0.4em" ml="4px">THE SEASON STARTS HERE</Text>
      </Flex>

      {/* RIGHT BLOCK: Highs, Props & Talent */}
      <Box zIndex={1} borderLeft="1px solid" borderColor="gray.100" bg="linear-gradient(225deg, rgba(229,62,62,0.03) 0%, transparent 100%)">
        <Grid templateColumns="repeat(2, 1fr)" gap={0} h="100%">
          {/* Scoring & Slams */}
          <Flex direction="column" justify="center" p={4} borderRight="1px solid" borderColor="gray.100" position="relative">
            <Text fontSize="10px" fontWeight="black" color="red.700" mb={1} textTransform="uppercase">Scoring High</Text>
            <Flex align="baseline" gap={1}>
              <Text fontSize="4xl" fontWeight="1000" color="#A855F7" lineHeight={1}>63</Text>
              <Text fontSize="10px" fontWeight="black" color="gray.400">PTS</Text>
            </Flex>
            <Text fontSize="9px" fontWeight="bold" color="gray.700" mt={1}>BCU vs PVAMU</Text>
            <Text fontSize="8px" fontWeight="bold" color="gray.400">ORLANDO, 2011</Text>
          </Flex>

          {/* Pro Pedigree */}
          <Flex direction="column" justify="center" p={4} bg="gray.50/40">
            <Text fontSize="10px" fontWeight="black" color="gray.400" mb={1} textTransform="uppercase">Draft Alumni</Text>
            <Text fontSize="4xl" fontWeight="1000" color="gray.800" lineHeight={1}>9</Text>
            <Text fontSize="9px" fontWeight="black" color="blue.700">NFL PICKS</Text>
            <Text fontSize="8px" fontWeight="bold" color="gray.500">HARGRAVE � DURANT � ADAMS</Text>
          </Flex>

          {/* Recent Ledger Strip */}
          <Box p={3} borderTop="1px solid" borderColor="gray.100" gridColumn="span 2" bg="white" position="relative">
            <Box position="absolute" right={0} top={0} bottom={0} w="4px" bg="red.600" />
            <Text fontSize="9px" fontWeight="black" color="gray.400" mb={2} textTransform="uppercase">Recent Outcomes</Text>
            <Flex justify="space-between" gap={2}>
              {[
                ["2025", "NC CENTRAL", "31-14", "MEAC"],
                ["2024", "FLORIDA A&M", "24-23", "SWAC"],
                ["2023", "JACKSON ST", "37-7", "SWAC"]
              ].map(([yr, team, score, conf]) => (
                <Box key={yr} flex={1} bg={conf === "MEAC" ? "blue.50" : "red.50"} p={1.5} borderRadius="sm" borderLeft="2px solid" borderColor={conf === "MEAC" ? "blue.200" : "red.200"}>
                  <Flex justify="space-between">
                    <Text fontSize="8px" fontWeight="black" color="gray.500">{yr}</Text>
                    <Text fontSize="7px" fontWeight="black" color={conf === "MEAC" ? "blue.600" : "red.600"}>{conf}</Text>
                  </Flex>
                  <Text fontSize="8px" fontWeight="1000" color="gray.800" lineClamp={1}>{team}</Text>
                  <Text fontSize="9px" fontWeight="bold" color="gray.600">{score}</Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Grid>
      </Box>
    </Grid>
  </Card>
);

export const CelebrationBowlPanel = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(90deg, rgba(111,38,51,0.34) 0%, rgba(20,20,22,0.98) 42%, rgba(75,0,130,0.34) 100%)"
  >
    <Box p={4} h="100%">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color="#FFD100">Championship Bridge</Eyebrow>
          <Title size="2xl">Celebration Bowl</Title>
        </Box>
        <Trophy size={30} color="#FFD100" />
      </Flex>
      <Flex direction="column" gap={4}>
        <Text fontSize="sm" color="text.secondary" lineHeight={1.5} maxW="760px">
          The SWAC champion and MEAC champion meet in Atlanta in the Celebration Bowl, the modern
          centerpiece of the HBCU national championship conversation.
        </Text>

        <Grid templateColumns="1fr 1fr" gap={6}>
          <Box>
            <Eyebrow color={SWAC.colors.secondary}>SWAC Path</Eyebrow>
            <PathDiagram path={SWAC.championPath} color={SWAC.colors.primary} />
          </Box>
          <Box>
            <Eyebrow color={MEAC.colors.secondary}>MEAC Path</Eyebrow>
            <PathDiagram path={MEAC.championPath} color={MEAC.colors.primary} />
          </Box>
        </Grid>
      </Flex>

      <SimpleGrid columns={3} gap={3} mt={4}>
        <Stat label="Series record" value="MEAC 6, SWAC 4" color="#FFD100" />
        <Stat label="2025 National Champ" value="South Carolina State" color="#FFD100" />
        <Stat label="Selection model" value="SWAC title winner vs MEAC regular-season champion" />
      </SimpleGrid>
    </Box>
  </Card>
);

export const CelebrationTable = () => (
  <Card accent="#FFD100">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Eyebrow color="#FFD100">Celebration Bowl Results</Eyebrow>
      <Title size="lg">SWAC vs MEAC Record</Title>
      <Grid mt={3} templateColumns="64px 70px 1fr" gap={0} flex={1} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" overflow="hidden">
        <HeaderCell>Year</HeaderCell>
        <HeaderCell>Winner</HeaderCell>
        <HeaderCell>Game</HeaderCell>
        {CELEBRATION_RESULTS.map(([year, winner, game]) => (
          <Fragment key={year}>
            <MatrixCell muted>{year}</MatrixCell>
            <MatrixCell>{winner}</MatrixCell>
            <MatrixCell>{game}</MatrixCell>
          </Fragment>
        ))}
      </Grid>
    </Box>
  </Card>
);
