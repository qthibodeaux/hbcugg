import { useState } from "react";
import { BarChart3, Flame, ListFilter, Newspaper, Radio, Trophy } from "lucide-react";
import { Box, Flex, Grid, Image, NativeSelect, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useMountEffect from "../../../hooks/useMountEffect";
import teamsData from "../../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const SEASONS = ["2025", "2024", "2023", "2022", "2021"];
const WEEKS = ["All", "9", "10", "11", "12"];
const TEAM_OPTIONS = [
  { id: "", label: "All Teams" },
  { id: "meacdsu", label: "DSU" },
  { id: "meacnccu", label: "NCCU" },
  { id: "swacalc", label: "Alcorn" },
  { id: "swacsu", label: "SU" },
  { id: "swacjsu", label: "JSU" },
];

const GAMES = [
  {
    id: "W9dunccu",
    week: 9,
    date: "Oct 25",
    label: "Durham road statement",
    away: { ...TEAM_BY_ID.meacdsu, score: 35 },
    home: { ...TEAM_BY_ID.meacnccu, score: 26 },
    note: "DSU turned a conference road trip into the front-page result.",
    linkTo: "/game/W9dunccu",
  },
  {
    id: "W10nsudsu",
    week: 10,
    date: "Oct 30",
    label: "Thursday night pressure",
    away: { ...TEAM_BY_ID.meacnsu, score: 20 },
    home: { ...TEAM_BY_ID.meacdsu, score: 27 },
    note: "A tight MEAC result with the scoreboard doing the storytelling.",
    linkTo: "/game/W10nsudsu",
  },
  {
    id: "W11dsumsu",
    week: 11,
    date: "Nov 7",
    label: "Low-score sweat",
    away: { ...TEAM_BY_ID.meacdsu, score: 14 },
    home: { ...TEAM_BY_ID.meacmsu, score: 12 },
    note: "Two points, four quarters, and a defensive headline.",
    linkTo: "/game/W11dsumsu",
  },
  {
    id: "W11sualc",
    week: 11,
    date: "Nov 8",
    label: "Braves make noise",
    away: { ...TEAM_BY_ID.swacsu, score: 17 },
    home: { ...TEAM_BY_ID.swacalc, score: 35 },
    note: "Alcorn owned the margin and made the card feel loud.",
    linkTo: "/game/W11sualc",
  },
];

const STORY_LINES = [
  "Cover-story games, ranked moments, and scorelines that deserve another look.",
  "Built for recap reading: who landed the headline, who survived, who traveled.",
  "A game archive with editorial weight instead of a plain schedule table.",
];

const useRotatingLine = (lines) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useMountEffect(() => {
    let current = 0;
    let holdTimer;
    let fadeTimer;

    const cycle = () => {
      setVisible(true);
      holdTimer = setTimeout(() => {
        setVisible(false);
        fadeTimer = setTimeout(() => {
          current = (current + 1) % lines.length;
          setIndex(current);
          cycle();
        }, 420);
      }, 3200);
    };

    cycle();
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
    };
  });

  return { line: lines[index], visible };
};

const TeamLogo = ({ team, size = "44px", opacity = 1 }) => (
  <Box w={size} h={size} opacity={opacity} flexShrink={0}>
    {team?.logo ? <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" /> : null}
  </Box>
);

const GhostLogo = ({ team, side = "left", size = "160px", opacity = 0.08 }) => (
  <Box
    position="absolute"
    top={side === "left" ? "-26px" : "auto"}
    bottom={side === "right" ? "-34px" : "auto"}
    left={side === "left" ? "-22px" : "auto"}
    right={side === "right" ? "-22px" : "auto"}
    w={size}
    h={size}
    opacity={opacity}
    pointerEvents="none"
  >
    {team?.logo ? <Image src={team.logo} alt={team.shortName} w="100%" h="100%" objectFit="contain" /> : null}
  </Box>
);

const ControlSelect = ({ icon: Icon, label, value, onChange, children }) => (
  <Box minW={{ base: "100%", md: "118px" }}>
    <Flex align="center" gap={1.5} mb={1}>
      {Icon ? <Icon size={12} color="#A1A1AA" /> : null}
      <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
        {label}
      </Text>
    </Flex>
    <NativeSelect.Root
      h="30px"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      bg="rgba(255,255,255,0.06)"
      overflow="hidden"
    >
      <NativeSelect.Field
        value={value}
        onChange={(event) => onChange(event.target.value)}
        color="white"
        fontSize="11px"
        fontWeight="bold"
        bg="transparent"
        px={2}
      >
        {children}
      </NativeSelect.Field>
      <NativeSelect.Indicator color="whiteAlpha.700" />
    </NativeSelect.Root>
  </Box>
);

const LabControls = ({ compact = false }) => {
  const [season, setSeason] = useState("2025");
  const [week, setWeek] = useState("All");
  const [team, setTeam] = useState("");

  return (
    <Flex direction={compact ? "row" : { base: "column", md: "row" }} gap={2.5} align="end" wrap="wrap">
      <ControlSelect icon={BarChart3} label="Season" value={season} onChange={setSeason}>
        {SEASONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </ControlSelect>
      <ControlSelect icon={Newspaper} label="Week" value={week} onChange={setWeek}>
        {WEEKS.map((item) => (
          <option key={item} value={item}>
            {item === "All" ? "All Weeks" : `Week ${item}`}
          </option>
        ))}
      </ControlSelect>
      <ControlSelect icon={ListFilter} label="Team" value={team} onChange={setTeam}>
        {TEAM_OPTIONS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </ControlSelect>
    </Flex>
  );
};

export const GamesHubBannerMastheadA = () => {
  const { line, visible } = useRotatingLine(STORY_LINES);

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(112deg, #0B0B0D 0%, #191114 44%, #5A1010 72%, #E53E3E 140%)"
    >
      <Text
        position="absolute"
        left="18px"
        bottom="-28px"
        fontSize="clamp(6rem, 15vw, 13rem)"
        lineHeight={0.8}
        fontWeight="black"
        color="white"
        opacity={0.045}
        textTransform="uppercase"
        pointerEvents="none"
      >
        Games
      </Text>

      <Flex h="100%" position="relative" align="stretch">
        <Flex flex={1} direction="column" justify="center" px={{ base: 5, lg: 8 }} minW={0}>
          <Flex align="center" gap={3} mb={3}>
            <Box h="2px" w="48px" bg="brand.500" />
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.2em">
              Game Center Dispatch
            </Text>
          </Flex>
          <Text
            fontSize="clamp(2.6rem, 6vw, 6.2rem)"
            color="white"
            fontWeight="black"
            textTransform="uppercase"
            lineHeight={0.82}
          >
            Games Hub
          </Text>
          <Text
            mt={3}
            color="text.secondary"
            fontSize="clamp(0.72rem, 1.2vw, 0.95rem)"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.08em"
            maxW="720px"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 420ms ease" }}
          >
            {line}
          </Text>
        </Flex>

        <Box w="1px" bg="whiteAlpha.200" my={5} flexShrink={0} />

        <Flex
          w={{ base: "280px", lg: "420px" }}
          flexShrink={0}
          direction="column"
          justify="center"
          px={{ base: 4, lg: 6 }}
          bg="rgba(0,0,0,0.22)"
        >
          <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" mb={3}>
            Direct the Page
          </Text>
          <LabControls />
        </Flex>
      </Flex>
    </Box>
  );
};

export const GamesHubBannerScorestripB = () => {
  const lead = GAMES[0];

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(120deg, ${lead.away.colors.primary}44 0%, #0B0B0D 36%, ${lead.home.colors.primary}55 100%)`}
    >
      <GhostLogo team={lead.away} side="left" size="190px" opacity={0.11} />
      <GhostLogo team={lead.home} side="right" size="190px" opacity={0.11} />

      <Flex h="100%" position="relative" direction="column" px={{ base: 5, lg: 7 }} py={4}>
        <Flex align="start" justify="space-between" gap={5} minH={0}>
          <Box minW={0}>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
              Story Wall
            </Text>
            <Text
              mt={1}
              fontSize="clamp(2.2rem, 5vw, 5.4rem)"
              color="white"
              fontWeight="black"
              textTransform="uppercase"
              lineHeight={0.82}
            >
              Front Page Games
            </Text>
          </Box>

          <Flex align="center" gap={4} flexShrink={0} display={{ base: "none", md: "flex" }}>
            <Flex align="center" gap={2}>
              <TeamLogo team={lead.away} size="44px" />
              <Text fontSize="4xl" color="white" fontWeight="black">
                {lead.away.score}
              </Text>
            </Flex>
            <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Final
            </Text>
            <Flex align="center" gap={2}>
              <Text fontSize="4xl" color="white" fontWeight="black">
                {lead.home.score}
              </Text>
              <TeamLogo team={lead.home} size="44px" />
            </Flex>
          </Flex>
        </Flex>

        <Flex mt="auto" align="end" justify="space-between" gap={4}>
          <Box minW={0}>
            <Text fontSize="11px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
              {lead.away.shortName} at {lead.home.shortName} | {lead.label}
            </Text>
            <Text mt={1} fontSize="xs" color="text.secondary" lineClamp={1}>
              {lead.note}
            </Text>
          </Box>
          <Box flexShrink={0} maxW="470px">
            <LabControls compact />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export const GamesHubCoverStoryTearsheetA = () => {
  const story = GAMES[0];

  return (
    <Box as={Link} to={story.linkTo} display="block" h="100%" w="full">
      <Box
        h="100%"
        w="full"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg={`linear-gradient(135deg, ${story.away.colors.primary}4D 0%, rgba(11,11,13,0.97) 42%, ${story.home.colors.primary}3D 100%)`}
      >
        <GhostLogo team={story.away} side="left" size="210px" opacity={0.12} />
        <GhostLogo team={story.home} side="right" size="220px" opacity={0.12} />
        <Grid h="100%" templateColumns="1.15fr 0.85fr" position="relative">
          <Flex direction="column" px={5} py={5} minW={0}>
            <Flex align="center" gap={2}>
              <Newspaper size={15} color="#F56565" />
              <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                Cover Story
              </Text>
            </Flex>
            <Text
              mt={4}
              fontSize="clamp(2rem, 4vw, 4.6rem)"
              color="white"
              fontWeight="black"
              textTransform="uppercase"
              lineHeight={0.84}
            >
              Hornets Own The Week
            </Text>
            <Text mt={4} fontSize="sm" color="text.secondary" lineHeight={1.5} maxW="520px">
              {story.note} This is the lead story treatment: big headline first, score second, why-it-mattered underneath.
            </Text>
            <Text mt="auto" fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Week {story.week} | {story.date} | Click through to game file
            </Text>
          </Flex>

          <Flex direction="column" justify="center" px={5} py={5} borderLeft="1px solid" borderColor="whiteAlpha.100">
            {[story.away, story.home].map((team) => (
              <Flex key={team.shortName} align="center" justify="space-between" gap={3} py={3}>
                <Flex align="center" gap={3} minW={0}>
                  <TeamLogo team={team} size="48px" />
                  <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                    {team.shortName}
                  </Text>
                </Flex>
                <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.9}>
                  {team.score}
                </Text>
              </Flex>
            ))}
            <Box mt={4} borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
              <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                Why it mattered
              </Text>
              <Text mt={2} fontSize="xs" color="text.secondary">
                Road win, conference pressure, and a result that can anchor the Games Hub instead of reading like a box score.
              </Text>
            </Box>
          </Flex>
        </Grid>
      </Box>
    </Box>
  );
};

const StoryTile = ({ game, kicker, headline, icon: Icon }) => {
  const accent = game.home.colors.primary;

  return (
    <Box as={Link} to={game.linkTo} display="block" h="100%" minH={0}>
      <Box
        h="100%"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg={`linear-gradient(180deg, ${accent}30 0%, rgba(14,14,17,0.98) 38%, #0B0B0D 100%)`}
      >
        <GhostLogo team={game.home} side="right" size="120px" opacity={0.1} />
        <Flex h="100%" direction="column" position="relative" px={4} py={4}>
          <Flex align="center" justify="space-between">
            <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
              {kicker}
            </Text>
            {Icon ? <Icon size={16} color="#F56565" /> : null}
          </Flex>
          <Text mt={3} fontSize="2xl" color="white" fontWeight="black" lineHeight={0.92} textTransform="uppercase">
            {headline}
          </Text>
          <Text mt={3} fontSize="xs" color="text.secondary" lineHeight={1.45}>
            {game.note}
          </Text>
          <Flex mt="auto" align="center" justify="space-between" gap={3}>
            <Flex align="center" gap={1.5}>
              <TeamLogo team={game.away} size="24px" />
              <TeamLogo team={game.home} size="24px" />
            </Flex>
            <Text fontSize="xl" color="white" fontWeight="black">
              {game.away.score}-{game.home.score}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};

export const GamesHubStoryTileRowA = () => (
  <Grid h="100%" w="full" templateColumns="repeat(4, minmax(0, 1fr))" gap={1}>
    <StoryTile game={GAMES[2]} kicker="Wild Finish" headline="Two-Point Drama" icon={Flame} />
    <StoryTile game={GAMES[3]} kicker="Statement Win" headline="Alcorn Hits Loud" icon={Trophy} />
    <StoryTile game={GAMES[0]} kicker="Road Heat" headline="Durham Test Passed" icon={Newspaper} />
    <StoryTile game={GAMES[1]} kicker="Night File" headline="DSU Closes Late" icon={BarChart3} />
  </Grid>
);

export const GamesHubResultsLedgerPressA = () => {
  const maxTotal = Math.max(...GAMES.map((game) => game.away.score + game.home.score));

  return (
    <Box
      h="100%"
      w="full"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(11,11,13,0.98) 42%, rgba(229,62,62,0.14) 100%)"
    >
      <Flex h="100%" direction="column">
        <Flex px={4} py={3} align="center" gap={2} borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Box w="3px" h="16px" bg="brand.500" />
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Results Ledger
          </Text>
          <Text ml="auto" fontSize="9px" color="text.muted" fontWeight="bold">
            Ranked editorial rail
          </Text>
        </Flex>

        <Flex flex={1} direction="column" px={3} py={2}>
          {GAMES.map((game, index) => {
            const total = game.away.score + game.home.score;
            const pct = Math.max(18, Math.round((total / maxTotal) * 100));

            return (
              <Box
                key={game.id}
                as={Link}
                to={game.linkTo}
                flex={1}
                display="flex"
                alignItems="center"
                borderBottom={index === GAMES.length - 1 ? "none" : "1px solid"}
                borderColor="whiteAlpha.100"
                px={2}
                minH={0}
              >
                <Grid templateColumns="34px 1fr 90px" gap={3} alignItems="center" w="full">
                  <Text fontSize="2xl" color="whiteAlpha.300" fontWeight="black" lineHeight={1}>
                    {index + 1}
                  </Text>
                  <Box minW={0}>
                    <Flex align="center" gap={2} minW={0}>
                      <TeamLogo team={game.away} size="22px" />
                      <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                        {game.away.shortName}
                      </Text>
                      <Text fontSize="10px" color="text.muted">@</Text>
                      <TeamLogo team={game.home} size="22px" />
                      <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                        {game.home.shortName}
                      </Text>
                    </Flex>
                    <Box mt={1.5} h="5px" bg="whiteAlpha.100" overflow="hidden" borderRadius="full">
                      <Box h="100%" w={`${pct}%`} bg={`linear-gradient(90deg, ${game.away.colors.primary}, ${game.home.colors.primary})`} />
                    </Box>
                    <Text mt={1} fontSize="9px" color="text.muted" lineClamp={1}>
                      {game.label}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>
                      {game.away.score}-{game.home.score}
                    </Text>
                    <Text mt={1} fontSize="8px" color="brand.400" fontWeight="black" textTransform="uppercase">
                      {total} pts
                    </Text>
                  </Box>
                </Grid>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

export const GamesHubBannerNewsprintC = () => {
  const { line, visible } = useRotatingLine(STORY_LINES);

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="#111113"
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.14}
        bg="repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 5px)"
      />
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(100deg, rgba(245,101,101,0.28) 0%, rgba(11,11,13,0.72) 38%, rgba(255,255,255,0.06) 100%)"
      />
      <Text
        position="absolute"
        right="-18px"
        bottom="-34px"
        fontSize="clamp(5.5rem, 14vw, 12rem)"
        color="white"
        opacity={0.05}
        fontWeight="black"
        textTransform="uppercase"
        lineHeight={0.8}
      >
        Extra
      </Text>

      <Grid position="relative" h="100%" templateColumns={{ base: "1fr", lg: "1fr 390px" }}>
        <Flex direction="column" justify="center" px={{ base: 5, lg: 8 }} py={4} minW={0}>
          <Flex align="center" gap={3} mb={3}>
            <Box px={2} py={1} bg="white" transform="rotate(-2deg)">
              <Text fontSize="9px" color="#111113" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                Saturday Edition
              </Text>
            </Box>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
              Games Hub
            </Text>
          </Flex>
          <Text
            fontSize="clamp(2.7rem, 6vw, 6.5rem)"
            color="white"
            fontWeight="black"
            textTransform="uppercase"
            lineHeight={0.78}
            maxW="760px"
          >
            The Games That Made Noise
          </Text>
          <Text
            mt={3}
            fontSize="clamp(0.75rem, 1.2vw, 0.95rem)"
            color="text.secondary"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="0.08em"
            maxW="760px"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 420ms ease" }}
          >
            {line}
          </Text>
        </Flex>

        <Flex
          direction="column"
          justify="center"
          px={5}
          py={4}
          borderLeft={{ base: "none", lg: "1px solid" }}
          borderColor="whiteAlpha.200"
          bg="rgba(0,0,0,0.25)"
        >
          <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em" mb={3}>
            Page Controls
          </Text>
          <LabControls />
        </Flex>
      </Grid>
    </Box>
  );
};

export const GamesHubBannerSidelineD = () => {
  const lead = GAMES[3];

  return (
    <Box
      h="100%"
      w="full"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(90deg, ${lead.home.colors.primary} 0%, #0B0B0D 38%, #0B0B0D 100%)`}
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="40%" bg="rgba(255,255,255,0.08)" transform="skewX(-12deg) translateX(-55px)" />
      <GhostLogo team={lead.home} side="left" size="230px" opacity={0.16} />
      <GhostLogo team={lead.away} side="right" size="210px" opacity={0.08} />

      <Flex h="100%" position="relative" align="center" px={{ base: 5, lg: 7 }} gap={5}>
        <Flex direction="column" flex={1} minW={0}>
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.2em">
            Field Pass | Filterable Story Board
          </Text>
          <Text mt={2} fontSize="clamp(2.4rem, 5.4vw, 5.8rem)" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.8}>
            Games Hub
          </Text>
          <Flex mt={4} align="center" gap={3}>
            <TeamLogo team={lead.away} size="38px" />
            <Text fontSize="3xl" color="white" fontWeight="black">
              {lead.away.score}
            </Text>
            <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
              Final
            </Text>
            <Text fontSize="3xl" color="white" fontWeight="black">
              {lead.home.score}
            </Text>
            <TeamLogo team={lead.home} size="38px" />
            <Text fontSize="xs" color="text.secondary" fontWeight="bold" lineClamp={1}>
              {lead.label}
            </Text>
          </Flex>
        </Flex>

        <Box w={{ base: "330px", lg: "460px" }} flexShrink={0}>
          <LabControls compact />
        </Box>
      </Flex>
    </Box>
  );
};

export const GamesHubCoverStoryPosterB = () => {
  const story = GAMES[3];

  return (
    <Box as={Link} to={story.linkTo} display="block" h="100%" w="full">
      <Box
        h="100%"
        w="full"
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="#0B0B0D"
      >
        <Box position="absolute" inset={0} bg={`linear-gradient(145deg, ${story.home.colors.primary}66 0%, transparent 44%, ${story.away.colors.primary}55 100%)`} />
        <Box
          position="absolute"
          inset={0}
          opacity={0.12}
          bg="repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 7px)"
        />
        <GhostLogo team={story.home} side="left" size="260px" opacity={0.2} />

        <Flex h="100%" position="relative" direction="column" px={6} py={5}>
          <Flex align="center" justify="space-between">
            <Box px={2} py={1} bg="brand.500">
              <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                Cover Story
              </Text>
            </Box>
            <Text fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase">
              Week {story.week} | {story.date}
            </Text>
          </Flex>

          <Text mt={4} fontSize="clamp(2.4rem, 4.8vw, 5.2rem)" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.78}>
            Braves Put It In Ink
          </Text>

          <Grid mt="auto" templateColumns="1fr 132px" gap={5} alignItems="end">
            <Box>
              <Text fontSize="sm" color="white" fontWeight="bold" lineHeight={1.45}>
                {story.note} The poster variant treats a result like an event cover: louder, simpler, and more collectible.
              </Text>
              <Flex mt={4} align="center" gap={2}>
                <TeamLogo team={story.away} size="30px" />
                <Text fontSize="xs" color="text.secondary" fontWeight="black" textTransform="uppercase">
                  {story.away.shortName}
                </Text>
                <Text fontSize="10px" color="text.muted">@</Text>
                <TeamLogo team={story.home} size="30px" />
                <Text fontSize="xs" color="white" fontWeight="black" textTransform="uppercase">
                  {story.home.shortName}
                </Text>
              </Flex>
            </Box>
            <Box textAlign="right">
              <Text fontSize="5xl" color="white" fontWeight="black" lineHeight={0.82}>
                {story.home.score}
              </Text>
              <Text fontSize="lg" color="text.muted" fontWeight="black">
                to {story.away.score}
              </Text>
            </Box>
          </Grid>
        </Flex>
      </Box>
    </Box>
  );
};

export const GamesHubStoryTilesTabloidB = () => (
  <Grid h="100%" w="full" templateColumns="repeat(4, minmax(0, 1fr))" gap={1}>
    {[
      { game: GAMES[0], kicker: "Road Heat", headline: "DSU Shakes Durham", icon: Radio },
      { game: GAMES[2], kicker: "Defensive Clipping", headline: "14-12 In The Mud", icon: Newspaper },
      { game: GAMES[3], kicker: "Statement", headline: "Alcorn Goes Bold", icon: Trophy },
      { game: GAMES[1], kicker: "Night Desk", headline: "Hornets Finish It", icon: Flame },
    ].map((card, index) => (
      <Box key={card.kicker} transform={index % 2 === 0 ? "rotate(-0.35deg)" : "rotate(0.35deg)"} minH={0}>
        <StoryTile {...card} />
      </Box>
    ))}
  </Grid>
);

export const GamesHubBannerClassicControlsE = () => (
  <Box
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    h="100%"
    w="full"
    bg="linear-gradient(110deg, #E53E3E 0%, #9B1C1C 28%, #1A0505 58%, #0B0B0D 100%)"
  >
    <Text
      position="absolute"
      bottom="-20px"
      left="0"
      fontWeight="black"
      style={{ fontSize: "clamp(80px, 16vw, 180px)" }}
      fontStyle="italic"
      color="white"
      opacity={0.05}
      textTransform="uppercase"
      lineHeight={1}
      letterSpacing="-0.05em"
      pointerEvents="none"
      userSelect="none"
      whiteSpace="nowrap"
    >
      GAMES
    </Text>

    <Flex h="100%" align="stretch">
      <Flex flex={1} align="center" pl={8} pr={6} minW={0}>
        <Box minW={0}>
          <Text
            fontWeight="black"
            fontStyle="italic"
            color="white"
            textTransform="uppercase"
            lineHeight={0.85}
            letterSpacing="-0.04em"
            whiteSpace="nowrap"
            style={{ fontSize: "clamp(2rem, 5.5vw, 6rem)" }}
          >
            GAMES HUB
          </Text>
          <Flex align="center" gap={3} mt={3} minW={0}>
            <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
            <Text
              fontWeight="black"
              color="rgba(255,255,255,0.58)"
              textTransform="uppercase"
              letterSpacing="0.15em"
              whiteSpace="nowrap"
              style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}
            >
              THE SEASON'S BEST GAME STORIES
            </Text>
            <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
            <Text
              fontWeight="black"
              color="rgba(255,255,255,0.32)"
              textTransform="uppercase"
              letterSpacing="0.14em"
              whiteSpace="nowrap"
              style={{ fontSize: "clamp(7px, 0.9vw, 9px)" }}
            >
              RESULTS | MOMENTS | RECAPS
            </Text>
          </Flex>
          <Text mt={3} maxW="720px" color="rgba(255,255,255,0.64)" fontSize="sm" fontWeight="medium" lineClamp={2}>
            A story-first archive for the games that shaped the HBCU football season, from cover-story results to box-score pressure points.
          </Text>
        </Box>
      </Flex>

      <Box w="1px" bg="rgba(255,255,255,0.12)" my={6} flexShrink={0} />

      <Flex direction="column" justify="center" px={6} flexShrink={0} w={{ base: "340px", lg: "420px" }}>
        <Text
          fontSize="8px"
          fontWeight="black"
          color="rgba(255,255,255,0.35)"
          textTransform="uppercase"
          letterSpacing="0.22em"
          mb={3}
        >
          Direct The Page
        </Text>
        <LabControls compact />
      </Flex>
    </Flex>
  </Box>
);

export const GamesHubTicketStubA = () => {
  const game = GAMES[0];
  const total = game.away.score + game.home.score;

  return (
    <Box as={Link} to={game.linkTo} display="block" h="100%" w="full">
      <Grid
        h="100%"
        w="full"
        templateColumns="1fr 92px"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg="#F4F0E8"
        color="#111113"
        boxShadow="0 22px 42px rgba(0,0,0,0.28)"
      >
        <Box position="relative" px={4} py={4} overflow="hidden">
          <Box
            position="absolute"
            inset={0}
            opacity={0.16}
            bg="repeating-linear-gradient(90deg, #111113 0px, #111113 1px, transparent 1px, transparent 9px)"
          />
          <Box position="relative">
            <Flex align="center" justify="space-between">
              <Text fontSize="9px" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
                Admit One Story
              </Text>
              <Text fontSize="9px" fontWeight="black">
                WK {game.week}
              </Text>
            </Flex>
            <Text mt={3} fontSize="2xl" lineHeight={0.9} fontWeight="black" textTransform="uppercase">
              {game.away.shortName} punches a road ticket
            </Text>
            <Flex mt={4} align="center" gap={2}>
              <TeamLogo team={game.away} size="34px" />
              <Text fontSize="4xl" fontWeight="black" lineHeight={1}>
                {game.away.score}
              </Text>
              <Text fontSize="10px" fontWeight="black" textTransform="uppercase">
                at
              </Text>
              <Text fontSize="4xl" fontWeight="black" lineHeight={1}>
                {game.home.score}
              </Text>
              <TeamLogo team={game.home} size="34px" />
            </Flex>
            <Text mt={3} fontSize="xs" fontWeight="bold" lineHeight={1.35}>
              {game.note}
            </Text>
          </Box>
        </Box>

        <Flex
          direction="column"
          align="center"
          justify="space-between"
          py={4}
          borderLeft="2px dashed"
          borderColor="rgba(17,17,19,0.35)"
          bg="#E7DED0"
        >
          <Text
            fontSize="8px"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.14em"
            style={{ writingMode: "vertical-rl" }}
          >
            Games Hub
          </Text>
          <Text fontSize="3xl" fontWeight="black" lineHeight={1}>
            {total}
          </Text>
          <Text fontSize="8px" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
            Total
          </Text>
        </Flex>
      </Grid>
    </Box>
  );
};

export const GamesHubPhotoStripA = () => (
  <Grid h="100%" w="full" templateColumns="repeat(4, minmax(0, 1fr))" gap={1}>
    {[
      { game: GAMES[0], image: "/pics/team_celebration.jpg", title: "Road Noise" },
      { game: GAMES[2], image: "/pics/action_closeup.jpg", title: "The Grind" },
      { game: GAMES[3], image: "/pics/stadium_dusk.jpg", title: "Big Margin" },
      { game: GAMES[1], image: "/pics/sideline_moment.jpg", title: "Night File" },
    ].map((item, index) => (
      <Box key={item.title} as={Link} to={item.game.linkTo} display="block" h="100%">
        <Box
          h="100%"
          position="relative"
          overflow="hidden"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          bgImage={`linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.84) 72%), url(${item.image})`}
          bgSize="cover"
          bgPosition="center"
          transform={index % 2 === 0 ? "rotate(-0.4deg)" : "rotate(0.4deg)"}
        >
          <Box position="absolute" inset={3} border="1px solid rgba(255,255,255,0.18)" borderRadius="lg" />
          <Flex h="100%" direction="column" justify="end" px={4} py={4} position="relative">
            <Flex align="center" gap={2} mb={2}>
              <TeamLogo team={item.game.away} size="24px" />
              <TeamLogo team={item.game.home} size="24px" />
            </Flex>
            <Text fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
              {item.title}
            </Text>
            <Text mt={1} fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
              {item.game.away.shortName} {item.game.away.score}, {item.game.home.shortName} {item.game.home.score}
            </Text>
          </Flex>
        </Box>
      </Box>
    ))}
  </Grid>
);

export const GamesHubBroadcastMatchupA = () => {
  const game = GAMES[3];

  return (
    <Box as={Link} to={game.linkTo} display="block" h="100%" w="full">
      <Box
        h="100%"
        w="full"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
        bg="#08090C"
        position="relative"
      >
        <Grid h="100%" templateColumns="1fr 1fr">
          {[game.away, game.home].map((team, index) => (
            <Flex
              key={team.shortName}
              direction="column"
              justify="space-between"
              px={5}
              py={4}
              position="relative"
              overflow="hidden"
              bg={`linear-gradient(135deg, ${team.colors.primary}88 0%, rgba(8,9,12,0.95) 68%)`}
              borderRight={index === 0 ? "1px solid" : "none"}
              borderColor="whiteAlpha.100"
            >
              <GhostLogo team={team} side={index === 0 ? "left" : "right"} size="185px" opacity={0.16} />
              <Flex align="center" justify="space-between" position="relative">
                <TeamLogo team={team} size="46px" />
                <Text fontSize="6xl" color="white" fontWeight="black" lineHeight={0.8}>
                  {team.score}
                </Text>
              </Flex>
              <Box position="relative">
                <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.88}>
                  {team.shortName}
                </Text>
                <Text mt={1} fontSize="9px" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
                  {index === 0 ? "Visitor" : "Home"}
                </Text>
              </Box>
            </Flex>
          ))}
        </Grid>
        <Flex
          position="absolute"
          left={4}
          right={4}
          bottom={4}
          h="34px"
          align="center"
          px={3}
          bg="rgba(0,0,0,0.78)"
          border="1px solid rgba(255,255,255,0.18)"
          borderRadius="md"
          gap={2}
        >
          <Radio size={14} color="#F56565" />
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
            Final Whistle | {game.label} | {game.note}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export const GamesHubScoreRhythmA = () => {
  const rows = GAMES.map((game) => ({
    ...game,
    total: game.away.score + game.home.score,
    margin: Math.abs(game.away.score - game.home.score),
  }));
  const maxTotal = Math.max(...rows.map((row) => row.total));

  return (
    <Box
      h="100%"
      w="full"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(135deg, #111113 0%, #17191E 48%, #0B0B0D 100%)"
    >
      <Flex h="100%" direction="column" px={4} py={4}>
        <Flex align="center" gap={2} flexShrink={0}>
          <BarChart3 size={16} color="#F56565" />
          <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Score Rhythm
          </Text>
          <Text ml="auto" fontSize="9px" color="text.muted" fontWeight="bold">
            total points / margin
          </Text>
        </Flex>

        <Grid mt={4} flex={1} templateColumns="repeat(4, minmax(0, 1fr))" gap={3} alignItems="end">
          {rows.map((row) => {
            const height = `${Math.max(18, Math.round((row.total / maxTotal) * 100))}%`;
            return (
              <Flex key={row.id} direction="column" h="100%" justify="end" minW={0}>
                <Box position="relative" h="100%" display="flex" alignItems="end">
                  <Box
                    w="100%"
                    h={height}
                    borderRadius="md md 0 0"
                    bg={`linear-gradient(180deg, ${row.home.colors.primary}, ${row.away.colors.primary})`}
                    border="1px solid rgba(255,255,255,0.14)"
                  />
                  <Text position="absolute" bottom="8px" left="0" right="0" textAlign="center" fontSize="2xl" color="white" fontWeight="black">
                    {row.total}
                  </Text>
                </Box>
                <Text mt={2} fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                  {row.away.shortName}/{row.home.shortName}
                </Text>
                <Text fontSize="8px" color="text.muted">
                  margin {row.margin}
                </Text>
              </Flex>
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};
