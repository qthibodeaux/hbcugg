import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { Activity, BarChart3, Trophy } from "lucide-react";

const DEFAULT_IMAGE = "/stadiums/Louis%20Crews%20Stadium.jpg";
const DEFAULT_PLAYER_AVATAR = "/pics/featured_player.jpg";

const GAME = {
  label: "Weekly Brief",
  tag: "Conference",
  status: "Final",
  date: "Sep 27",
  venue: "Baton Rouge, La.",
  away: { shortName: "JSU", name: "Jackson State", score: 38, logo: "/assets/swacjsu.svg", color: "#002147" },
  home: { shortName: "SU", name: "Southern", score: 13, logo: "/assets/swacsu.svg", color: "#69B3E7" },
  lineScore: [
    { period: "1", away: 7, home: 0 },
    { period: "2", away: 10, home: 7 },
    { period: "3", away: 14, home: 3 },
    { period: "4", away: 7, home: 3 },
  ],
  mvp: {
    name: "C. Morgan",
    position: "QB",
    team: "JSU",
    line: "22/31, 284 yds, 3 TD",
    glory: "91",
    note: "Controlled the middle quarters and kept JSU ahead of schedule.",
  },
  metrics: [
    { label: "EPA / Play", away: "0.44", home: "0.81", awayValue: 54, homeValue: 100 },
    { label: "Success Rate", away: "56%", home: "60%", awayValue: 56, homeValue: 60 },
    { label: "Yards / Play", away: "6.5", home: "8.8", awayValue: 74, homeValue: 100 },
    { label: "EPA / Rush", away: "-", home: "-", awayValue: 0, homeValue: 0 },
    { label: "EPA / Pass", away: "-", home: "-", awayValue: 0, homeValue: 0 },
    { label: "Explosive Rate", away: "15%", home: "29%", awayValue: 52, homeValue: 100 },
    { label: "3rd Down", away: "50%", home: "33%", awayValue: 50, homeValue: 33 },
    { label: "Red Zone TD%", away: "67%", home: "100%", awayValue: 67, homeValue: 100 },
    { label: "Stuff Rate", away: "10%", home: "3%", awayValue: 100, homeValue: 30 },
    { label: "Havoc Rate", away: "5%", home: "11%", awayValue: 45, homeValue: 100 },
  ],
  leaders: [
    { label: "Passing Yards", away: "284", awayPlayer: "C. Morgan", awayDetail: "22/31, 3 TD", home: "171", homePlayer: "A. Body", homeDetail: "11/16, 2 TD" },
    { label: "Rushing Yards", away: "106", awayPlayer: "J. Marshall", awayDetail: "14 car, 1 TD", home: "78", homePlayer: "D. Sims", homeDetail: "11 car, 0 TD" },
    { label: "Receiving Yards", away: "137", awayPlayer: "J. Ross", awayDetail: "7 rec, 1 TD", home: "68", homePlayer: "A. Harrell", homeDetail: "3 rec, 0 TD" },
    { label: "Havoc Leader", away: "3", awayPlayer: "C. Bass", awayDetail: "2 TFL, 1 SK, 0 PD", home: "2", homePlayer: "K. Lewis", homeDetail: "1 TFL, 0 SK, 2 PD" },
    { label: "Tackles", away: "8.5", awayPlayer: "J. Wright", awayDetail: "5 solo, 0.5 TFL", home: "4.5", homePlayer: "B. Cage", homeDetail: "3 solo, 3 TFL" },
  ],
};

const Panel = ({ children, bg = "#081726" }) => (
  <Box h="100%" w="100%" borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" bg={bg} overflow="hidden">
    {children}
  </Box>
);

const SectionLabel = ({ children, color = "text.muted" }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const TeamLogo = ({ team, size = "24px" }) => (
  <Image src={team.logo} alt={team.shortName} w={size} h={size} objectFit="contain" flexShrink={0} />
);

const StatusPill = ({ children }) => (
  <Box px={2.5} py={1} borderRadius="full" bg="brand.500">
    <Text fontSize="7px" color="white" fontWeight="black" textTransform="uppercase">
      {children}
    </Text>
  </Box>
);

const LineScoreTable = ({ mode = "dark" }) => {
  const textColor = mode === "paper" ? "#111114" : "white";
  const muted = mode === "paper" ? "rgba(11,11,13,0.52)" : "text.muted";
  const line = mode === "paper" ? "rgba(11,11,13,0.16)" : "whiteAlpha.100";

  return (
    <Box border="1px solid" borderColor={line} borderRadius="md" overflow="hidden">
      <Grid templateColumns="1fr repeat(5, 34px)" px={3} py={2} borderBottom="1px solid" borderColor={line}>
        <SectionLabel color={muted}>Team</SectionLabel>
        {GAME.lineScore.map((q) => (
          <Text key={q.period} fontSize="9px" color={muted} fontWeight="black" textAlign="center">
            {q.period}
          </Text>
        ))}
        <Text fontSize="9px" color="brand.400" fontWeight="black" textAlign="center">T</Text>
      </Grid>
      {[GAME.away, GAME.home].map((team, index) => (
        <Grid key={team.shortName} templateColumns="1fr repeat(5, 34px)" px={3} py={2} alignItems="center" bg={index === 0 ? "blackAlpha.200" : "transparent"}>
          <Text fontSize="sm" color={textColor} fontWeight="black">{team.shortName}</Text>
          {GAME.lineScore.map((q) => (
            <Text key={`${team.shortName}-${q.period}`} fontSize="sm" color={textColor} fontWeight="black" textAlign="center">
              {index === 0 ? q.away : q.home}
            </Text>
          ))}
          <Text fontSize="sm" color={textColor} fontWeight="black" textAlign="center">{team.score}</Text>
        </Grid>
      ))}
    </Box>
  );
};

const MetricRow = ({ item, accent = "#E53E3E" }) => (
  <Box>
    <Flex align="center" justify="space-between" mb="5px">
      <Text fontSize="12px" color="white" fontWeight="black">{item.away}</Text>
      <SectionLabel>{item.label}</SectionLabel>
      <Text fontSize="12px" color="white" fontWeight="black">{item.home}</Text>
    </Flex>
    <Box h="4px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" position="relative">
      <Box position="absolute" left={0} top={0} bottom={0} w={`${item.awayValue}%`} bg={accent} opacity={item.awayValue ? 0.78 : 0} />
      <Box position="absolute" right={0} top={0} bottom={0} w={`${item.homeValue}%`} bg="#69B3E7" opacity={item.homeValue ? 0.72 : 0} />
    </Box>
  </Box>
);

const PlayerAvatar = ({ name, align = "left" }) => (
  <Box
    w="34px"
    h="34px"
    borderRadius="full"
    overflow="hidden"
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg="whiteAlpha.100"
    flexShrink={0}
    justifySelf={align === "right" ? "end" : "start"}
  >
    <Image src={DEFAULT_PLAYER_AVATAR} alt={name} w="100%" h="100%" objectFit="cover" />
  </Box>
);

const LeaderRow = ({ item }) => (
  <Grid templateColumns="minmax(0, 1fr) 82px minmax(0, 1fr)" alignItems="center" py="10px" borderBottom="1px solid" borderColor="whiteAlpha.100" gap={2}>
    <Flex align="center" gap={2} minW={0}>
      <PlayerAvatar name={item.awayPlayer} />
      <Box textAlign="left" minW={0}>
        <Text fontSize="lg" color="brand.400" fontWeight="black" lineHeight={1}>{item.away}</Text>
        <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{item.awayPlayer}</Text>
        <Text fontSize="8px" color="text.muted" fontWeight="black" lineClamp={1}>{item.awayDetail}</Text>
      </Box>
    </Flex>
    <SectionLabel>{item.label}</SectionLabel>
    <Flex align="center" justify="end" gap={2} minW={0}>
      <Box textAlign="right" minW={0}>
        <Text fontSize="lg" color="#69B3E7" fontWeight="black" lineHeight={1}>{item.home}</Text>
        <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{item.homePlayer}</Text>
        <Text fontSize="8px" color="text.muted" fontWeight="black" lineClamp={1}>{item.homeDetail}</Text>
      </Box>
      <PlayerAvatar name={item.homePlayer} align="right" />
    </Flex>
  </Grid>
);

export const WeekCentralBriefFileStack = () => (
  <Panel>
    <Flex h="100%" direction="column">
      <Box h="118px" position="relative" overflow="hidden">
        <Image src={DEFAULT_IMAGE} alt="Default stadium" w="100%" h="100%" objectFit="cover" />
        <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(8,23,38,0.08) 0%, rgba(8,23,38,0.82) 100%)" />
        <Flex position="absolute" left={4} right={4} bottom={3} align="end" justify="space-between">
          <Box>
            <SectionLabel color="whiteAlpha.700">{GAME.label}</SectionLabel>
            <Flex align="center" gap={2} mt={2}>
              <Text fontSize="2xl" color="white" fontWeight="black">{GAME.away.shortName}</Text>
              <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black">AT</Text>
              <Text fontSize="2xl" color="white" fontWeight="black">{GAME.home.shortName}</Text>
            </Flex>
          </Box>
          <StatusPill>{GAME.tag}</StatusPill>
        </Flex>
      </Box>

      <Flex direction="column" gap={4} p={4} overflow="auto">
        <LineScoreTable />

        <Grid templateColumns="72px 1fr" gap={3} alignItems="center">
          <Flex w="72px" h="72px" borderRadius="md" bg="whiteAlpha.100" align="center" justify="center">
            <Trophy size={28} color="#E53E3E" />
          </Flex>
          <Box minW={0}>
            <SectionLabel color="brand.400">MVP</SectionLabel>
            <Text mt={1} fontSize="lg" color="white" fontWeight="black" lineClamp={1}>{GAME.mvp.name}</Text>
            <Text fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase">{GAME.mvp.position} | {GAME.mvp.team} | Glory {GAME.mvp.glory}</Text>
            <Text mt={1} fontSize="11px" color="text.muted" lineClamp={2}>{GAME.mvp.note}</Text>
          </Box>
        </Grid>

        <Box>
          <SectionLabel color="brand.400">Team Metrics</SectionLabel>
          <Flex direction="column" gap="10px" mt={3}>
            {GAME.metrics.map((metric) => <MetricRow key={metric.label} item={metric} />)}
          </Flex>
        </Box>

        <Box>
          <SectionLabel color="brand.400">Game Leaders</SectionLabel>
          <Box mt={2}>
            {GAME.leaders.map((leader) => <LeaderRow key={leader.label} item={leader} />)}
          </Box>
        </Box>
      </Flex>
    </Flex>
  </Panel>
);

export const WeekCentralBriefBroadcast = () => (
  <Panel bg="#111114">
    <Box h="100%" position="relative" overflow="hidden">
      <Image src={DEFAULT_IMAGE} alt="Default stadium" position="absolute" inset={0} w="100%" h="100%" objectFit="cover" opacity={0.22} />
      <Box position="absolute" inset={0} bg="linear-gradient(180deg, rgba(17,17,20,0.42) 0%, #111114 52%)" />
      <Flex h="100%" direction="column" position="relative" p={4} gap={4}>
        <Flex align="start" justify="space-between">
          <Box>
            <SectionLabel color="whiteAlpha.700">Broadcast Recap</SectionLabel>
            <Text mt={2} fontSize="clamp(2.5rem, 5vw, 4rem)" color="white" fontWeight="black" lineHeight={0.85}>
              {GAME.away.score}-{GAME.home.score}
            </Text>
            <Text mt={2} fontSize="10px" color="text.secondary" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
              {GAME.status} | {GAME.venue}
            </Text>
          </Box>
          <StatusPill>{GAME.tag}</StatusPill>
        </Flex>

        <Grid templateColumns="1fr auto 1fr" alignItems="center" gap={3}>
          <Flex align="center" gap={2} minW={0}>
            <TeamLogo team={GAME.away} size="30px" />
            <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>{GAME.away.name}</Text>
          </Flex>
          <Box h="1px" w="24px" bg="whiteAlpha.300" />
          <Flex align="center" gap={2} justify="end" minW={0}>
            <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>{GAME.home.name}</Text>
            <TeamLogo team={GAME.home} size="30px" />
          </Flex>
        </Grid>

        <LineScoreTable />

        <Box borderRadius="md" bg="rgba(229,62,62,0.12)" border="1px solid" borderColor="rgba(229,62,62,0.34)" p={3}>
          <Flex align="center" gap={2}>
            <Trophy size={16} color="#E53E3E" />
            <SectionLabel color="brand.400">Impact Player</SectionLabel>
          </Flex>
          <Text mt={2} fontSize="xl" color="white" fontWeight="black">{GAME.mvp.name}</Text>
          <Text fontSize="11px" color="text.secondary" fontWeight="black">{GAME.mvp.line}</Text>
        </Box>

        <Grid templateColumns="1fr 1fr" gap={3} mt="auto">
          {GAME.leaders.slice(0, 4).map((leader) => (
            <Box key={leader.label} borderTop="1px solid" borderColor="whiteAlpha.100" pt={3}>
              <SectionLabel>{leader.label}</SectionLabel>
              <Flex align="end" justify="space-between" mt={2}>
                <Text fontSize="2xl" color="brand.400" fontWeight="black">{leader.away}</Text>
                <Text fontSize="2xl" color="#69B3E7" fontWeight="black">{leader.home}</Text>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Flex>
    </Box>
  </Panel>
);

export const WeekCentralBriefAnalyst = () => (
  <Panel bg="#0B0B0D">
    <Flex h="100%" direction="column" p={4} gap={4}>
      <Flex align="center" justify="space-between">
        <Box>
          <SectionLabel color="brand.400">Analyst Card</SectionLabel>
          <Flex align="center" gap={2} mt={2}>
            <TeamLogo team={GAME.away} />
            <Text fontSize="xl" color="white" fontWeight="black">{GAME.away.shortName}</Text>
            <Text fontSize="10px" color="text.muted" fontWeight="black">AT</Text>
            <Text fontSize="xl" color="white" fontWeight="black">{GAME.home.shortName}</Text>
            <TeamLogo team={GAME.home} />
          </Flex>
        </Box>
        <Box textAlign="right">
          <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>{GAME.away.score}-{GAME.home.score}</Text>
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">{GAME.status}</Text>
        </Box>
      </Flex>

      <Box h="82px" borderRadius="md" overflow="hidden" position="relative">
        <Image src={DEFAULT_IMAGE} alt="Default stadium" w="100%" h="100%" objectFit="cover" />
        <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(11,11,13,0.8) 0%, rgba(11,11,13,0.2) 100%)" />
        <Text position="absolute" left={3} bottom={3} fontSize="9px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
          {GAME.date} | {GAME.venue}
        </Text>
      </Box>

      <Grid templateColumns="1fr 1fr 1fr" gap={2}>
        <Box borderRadius="md" bg="whiteAlpha.100" p={3}>
          <Activity size={14} color="#E53E3E" />
          <Text mt={2} fontSize="xl" color="white" fontWeight="black">56%</Text>
          <SectionLabel>Success</SectionLabel>
        </Box>
        <Box borderRadius="md" bg="whiteAlpha.100" p={3}>
          <BarChart3 size={14} color="#69B3E7" />
          <Text mt={2} fontSize="xl" color="white" fontWeight="black">6.5</Text>
          <SectionLabel>YPP</SectionLabel>
        </Box>
        <Box borderRadius="md" bg="whiteAlpha.100" p={3}>
          <Trophy size={14} color="#E53E3E" />
          <Text mt={2} fontSize="xl" color="white" fontWeight="black">{GAME.mvp.glory}</Text>
          <SectionLabel>Glory</SectionLabel>
        </Box>
      </Grid>

      <Box>
        <SectionLabel color="brand.400">Team Metrics</SectionLabel>
        <Flex direction="column" gap={3} mt={3}>
          {GAME.metrics.map((metric) => <MetricRow key={metric.label} item={metric} accent="#F56565" />)}
        </Flex>
      </Box>

      <Box mt="auto">
        <SectionLabel color="brand.400">Game Leaders</SectionLabel>
        <Box mt={2}>
          {GAME.leaders.slice(0, 2).map((leader) => <LeaderRow key={leader.label} item={leader} />)}
        </Box>
      </Box>
    </Flex>
  </Panel>
);
