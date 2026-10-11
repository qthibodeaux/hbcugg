import React, { Fragment } from "react";
import { Box, Flex, Grid, Image, SimpleGrid, Text } from "@chakra-ui/react";
import {
  BookOpen,
  CalendarDays,
  MapPin,
  Radio,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import teamsData from "../../../data/teams.json";
import PageShell from "../../layouts/PageShell";

const TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));

const SWAC = {
  key: "SWAC",
  name: "Southwestern Athletic Conference",
  colors: {
    primary: "#6F2633",
    secondary: "#A2AAAD",
    ink: "#0B0B0D",
    text: "#FFFFFF",
  },
  founded: "1920",
  hq: "Birmingham, AL",
  members: "12 football members",
  structure: "East and West divisions",
  championPath: "Division winners meet in the SWAC Championship Game",
  celebrationRecord: "4 Celebration Bowl wins",
  keyCities: ["Birmingham", "Jackson", "Baton Rouge", "Tallahassee", "Houston", "New Orleans"],
  traditions: ["Bayou Classic", "Magic City Classic", "State Fair Classic", "Florida Classic", "Battle of the Bands"],
  identity: "Deep South, Gulf Coast, Texas, stadium energy, classics, bands, and high-visibility rivalry weekends.",
  gameStyle: "Atmosphere-heavy football with explosive skill talent, big-play Saturdays, and rivalry volatility.",
  media: ["SWAC Digital Network", "ESPN windows", "Classic game broadcasts", "Championship on national TV"],
  timeline: [
    ["1920", "Founded by Texas HBCU athletic leaders"],
    ["1999", "Championship Game era begins"],
    ["2015", "Celebration Bowl era begins"],
    ["2021", "FAMU and Bethune-Cookman join"],
    ["2025", "Prairie View A&M wins the SWAC title"],
  ],
};

const MEAC = {
  key: "MEAC",
  name: "Mid-Eastern Athletic Conference",
  colors: {
    primary: "#4B0082",
    secondary: "#FFD100",
    ink: "#0B0B0D",
    text: "#FFFFFF",
  },
  founded: "1969",
  hq: "Norfolk, VA",
  members: "6 football members",
  structure: "Regular-season champion pathway",
  championPath: "League champion advances to the Celebration Bowl",
  celebrationRecord: "6 Celebration Bowl wins",
  keyCities: ["Norfolk", "Washington", "Dover", "Baltimore", "Durham", "Orangeburg"],
  traditions: ["MEAC/SWAC Challenge", "Truth and Service Classic", "Aggie-Eagle legacy", "Homecoming corridor"],
  identity: "East Coast and Mid-Atlantic HBCU corridor with civic history, academic legacy, and postseason pride.",
  gameStyle: "Physical, compact, field-position football with a long defensive and special teams tradition.",
  media: ["ESPN events", "Celebration Bowl on ABC", "MEAC/SWAC Challenge", "Institutional media networks"],
  timeline: [
    ["1969", "Conference founded"],
    ["1970s", "Eastern HBCU football identity solidifies"],
    ["2015", "Celebration Bowl era begins"],
    ["2021", "Realignment reshapes football membership"],
    ["2025", "South Carolina State wins the Celebration Bowl"],
  ],
};

const COMPARISON_ROWS = [
  ["Founded", SWAC.founded, MEAC.founded],
  ["Headquarters", SWAC.hq, MEAC.hq],
  ["Football members", "12", "6"],
  ["Football structure", "East / West divisions", "Single-table league champion"],
  ["Title route", "SWAC Championship Game", "Regular-season champion"],
  ["Bowl route", "SWAC champion to Atlanta", "MEAC champion to Atlanta"],
  ["Geography", "Deep South, Gulf, Texas", "East Coast, Mid-Atlantic, Carolinas"],
  ["Signature media", "SWAC Digital Network / ESPN", "ESPN events / ABC bowl window"],
];

const CELEBRATION_RESULTS = [
  ["2015", "MEAC", "NC A&T over Alcorn State"],
  ["2016", "SWAC", "Grambling State over NC Central"],
  ["2017", "MEAC", "NC A&T over Grambling State"],
  ["2018", "MEAC", "NC A&T over Alcorn State"],
  ["2019", "MEAC", "NC A&T over Alcorn State"],
  ["2021", "MEAC", "South Carolina State over Jackson State"],
  ["2022", "MEAC", "NC Central over Jackson State"],
  ["2023", "SWAC", "Florida A&M over Howard"],
  ["2024", "SWAC", "Jackson State over South Carolina State"],
  ["2025", "MEAC", "South Carolina State over Prairie View A&M"],
];

const RIVALRIES = [
  ["Bayou Classic", "Grambling State vs Southern", "New Orleans spectacle and one of HBCU football's defining stages."],
  ["Magic City Classic", "Alabama A&M vs Alabama State", "Birmingham rivalry weekend with massive FCS attendance gravity."],
  ["Florida Classic", "Florida A&M vs Bethune-Cookman", "Florida HBCU rivalry carried from MEAC history into the SWAC era."],
  ["State Fair Classic", "Grambling State vs Prairie View A&M", "Dallas classic embedded in the State Fair of Texas weekend."],
  ["MEAC/SWAC Challenge", "Conference showcase", "Opening-stage bridge between the two FCS HBCU conferences."],
  ["Truth and Service Classic", "Howard vs Morgan State", "Modern D.C. platform around Howard's institutional and football identity."],
];

const LEGACY_STATS = [
  ["18", "Current football programs"],
  ["2", "FCS HBCU conferences"],
  ["10", "Celebration Bowls played"],
  ["150+", "Years of HBCU football history"],
  ["1000+", "NFL alumni lineage"],
  ["47 of 48", "SWAC FCS attendance-leading seasons"],
];

const MEMBERSHIP = {
  swacEast: ["Alabama A&M", "Alabama State", "Bethune-Cookman", "Florida A&M", "Jackson State", "Mississippi Valley State"],
  swacWest: ["Alcorn State", "Grambling State", "Prairie View A&M", "Southern", "Texas Southern", "Arkansas-Pine Bluff"],
  meacFootball: ["Delaware State", "Howard", "Morgan State", "North Carolina Central", "Norfolk State", "South Carolina State"],
  meacNonFootball: ["Coppin State", "Maryland Eastern Shore"],
  formerContext: ["Florida A&M", "Bethune-Cookman", "North Carolina A&T", "Hampton"],
};

const Card = ({ children, accent = "#E53E3E", bg, ...props }) => (
  <Box
    h="full"
    w="full"
    minW={0}
    overflow="hidden"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={bg ?? "rgba(20,20,22,0.96)"}
    position="relative"
    _before={{
      content: '""',
      position: "absolute",
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: "3px",
      bg: accent,
      opacity: 0.9,
    }}
    {...props}
  >
    {children}
  </Box>
);

const Eyebrow = ({ children, color = "brand.500" }) => (
  <Text fontSize="8px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const Title = ({ children, size = "xl" }) => (
  <Text fontSize={size} color="white" fontWeight="black" lineHeight={0.95} textTransform="uppercase">
    {children}
  </Text>
);

const Stat = ({ label, value, color = "white" }) => (
  <Box minW={0}>
    <Text fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
      {label}
    </Text>
    <Text fontSize="sm" color={color} fontWeight="black" lineClamp={2}>
      {value}
    </Text>
  </Box>
);

const Chip = ({ children, color = "whiteAlpha.300" }) => (
  <Box
    px={2}
    py={1}
    borderRadius="999px"
    border="1px solid"
    borderColor={color}
    bg="rgba(255,255,255,0.04)"
    minW={0}
  >
    <Text fontSize="9px" color="text.secondary" fontWeight="bold" lineClamp={1}>
      {children}
    </Text>
  </Box>
);

const ConferenceWikiBanner = () => (
  <Card
    accent="#FFD100"
    bg="linear-gradient(100deg, rgba(111,38,51,0.7) 0%, rgba(11,11,13,0.96) 38%, rgba(75,0,130,0.72) 100%)"
  >
    <Box position="absolute" inset={0} pointerEvents="none">
      <Text position="absolute" left="2%" bottom="-28px" fontSize="130px" fontWeight="black" color="white" opacity={0.04}>
        SWAC
      </Text>
      <Text position="absolute" right="2%" top="-34px" fontSize="130px" fontWeight="black" color="white" opacity={0.04}>
        MEAC
      </Text>
    </Box>
    <Flex h="100%" align="center" justify="space-between" gap={8} px={{ base: 5, lg: 9 }} position="relative">
      <Box maxW="720px">
        <Eyebrow color="#FFD100">Conference Archive / FCS HBCU Football</Eyebrow>
        <Text
          mt={2}
          fontSize="clamp(2.3rem, 6vw, 5.8rem)"
          color="white"
          fontWeight="black"
          fontStyle="italic"
          lineHeight={0.78}
          textTransform="uppercase"
        >
          Conference Wiki
        </Text>
        <Text mt={4} maxW="720px" fontSize="sm" color="text.secondary" lineHeight={1.55}>
          The reference hub for the SWAC and MEAC: alignment, cities, rivalries, classics, championships,
          media, game identity, and the shared HBCU football stage.
        </Text>
      </Box>
      <SimpleGrid columns={2} gap={3} minW={{ base: "240px", lg: "360px" }}>
        {LEGACY_STATS.slice(0, 4).map(([value, label]) => (
          <Box key={label} border="1px solid" borderColor="whiteAlpha.100" bg="rgba(0,0,0,0.25)" borderRadius="8px" p={3}>
            <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>
              {value}
            </Text>
            <Text mt={1} fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Flex>
  </Card>
);

const SchoolJumpCard = ({ team }) => {
  const navigate = useNavigate();
  return (
    <Box
      as="button"
      onClick={() => navigate(`/teams/${team.id}/wiki`)}
      h="100%"
      minW={0}
      borderRadius="7px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderBottom="2px solid"
      borderBottomColor={team.colors.primary}
      bg={`linear-gradient(135deg, ${team.colors.primary}22 0%, rgba(11,11,13,0.95) 62%)`}
      position="relative"
      overflow="hidden"
      textAlign="left"
      px={3}
      display="flex"
      alignItems="center"
      gap={2}
      _hover={{ borderColor: team.colors.primary, transform: "translateY(-1px)" }}
      transition="all 0.18s ease"
    >
      <Image src={team.logo} boxSize="28px" objectFit="contain" flexShrink={0} />
      <Box minW={0}>
        <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" lineClamp={1}>
          {team.shortName ?? team.name}
        </Text>
        <Text fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase" lineClamp={1}>
          {team.conference} / {team.mascot}
        </Text>
      </Box>
      <Text position="absolute" right="-8px" bottom="-10px" fontSize="42px" color="white" opacity={0.04} fontWeight="black">
        {team.shortName}
      </Text>
    </Box>
  );
};

const SchoolJumpDirectory = () => (
  <Card accent="#E53E3E">
    <Flex h="100%" gap={3} p={3}>
      <Box w={{ base: "150px", lg: "210px" }} flexShrink={0} display="flex" flexDirection="column" justifyContent="center">
        <Eyebrow>School Wiki Jump</Eyebrow>
        <Title size="lg">Choose A Program</Title>
        <Text mt={2} fontSize="xs" color="text.secondary" lineHeight={1.45}>
          The conference page is long by design. Jump straight into any school wiki from here.
        </Text>
      </Box>
      <Grid flex={1} templateColumns="repeat(6, minmax(0, 1fr))" templateRows="repeat(3, minmax(0, 1fr))" gap={1.5} minW={0}>
        {TEAMS.map((team) => (
          <SchoolJumpCard key={team.id} team={team} />
        ))}
      </Grid>
    </Flex>
  </Card>
);

const ConferencePanel = ({ conf }) => (
  <Card
    accent={conf.colors.primary}
    bg={`linear-gradient(135deg, ${conf.colors.primary}3b 0%, rgba(20,20,22,0.98) 48%, rgba(11,11,13,0.98) 100%)`}
  >
    <Text position="absolute" right="-18px" bottom="-22px" fontSize="120px" color="white" opacity={0.035} fontWeight="black">
      {conf.key}
    </Text>
    <Box h="100%" p={5} position="relative" display="flex" flexDirection="column">
      <Eyebrow color={conf.colors.secondary}>{conf.name}</Eyebrow>
      <Flex align="end" justify="space-between" gap={4} mt={1}>
        <Title size="4xl">{conf.key}</Title>
        <Shield size={34} color={conf.colors.secondary} />
      </Flex>
      <Text mt={3} fontSize="sm" color="text.secondary" lineHeight={1.55}>
        {conf.identity}
      </Text>
      <SimpleGrid columns={2} gap={4} mt={5}>
        <Stat label="Founded" value={conf.founded} color={conf.colors.secondary} />
        <Stat label="Headquarters" value={conf.hq} />
        <Stat label="Members" value={conf.members} />
        <Stat label="Structure" value={conf.structure} />
        <Stat label="Title path" value={conf.championPath} />
        <Stat label="Celebration Bowl" value={conf.celebrationRecord} color={conf.colors.secondary} />
      </SimpleGrid>
      <Box mt="auto" pt={4}>
        <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" mb={2}>
          Key Cities
        </Text>
        <Flex gap={1.5} flexWrap="wrap">
          {conf.keyCities.map((city) => (
            <Chip key={city} color={`${conf.colors.secondary}99`}>
              {city}
            </Chip>
          ))}
        </Flex>
      </Box>
    </Box>
  </Card>
);

const ComparisonMatrix = () => (
  <Card accent="#A2AAAD">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Conference Comparison</Eyebrow>
          <Title size="lg">Same Fields, Different Systems</Title>
        </Box>
        <BookOpen size={24} color="#A1A1AA" />
      </Flex>
      <Grid templateColumns="1fr 1.3fr 1.3fr" gap={0} flex={1} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" overflow="hidden">
        <HeaderCell>Field</HeaderCell>
        <HeaderCell color={SWAC.colors.primary}>SWAC</HeaderCell>
        <HeaderCell color={MEAC.colors.secondary}>MEAC</HeaderCell>
        {COMPARISON_ROWS.map(([field, swac, meac]) => (
          <>
            <MatrixCell key={`${field}-field`} muted>{field}</MatrixCell>
            <MatrixCell key={`${field}-swac`}>{swac}</MatrixCell>
            <MatrixCell key={`${field}-meac`}>{meac}</MatrixCell>
          </>
        ))}
      </Grid>
    </Box>
  </Card>
);

const HeaderCell = ({ children, color = "white" }) => (
  <Box bg="rgba(255,255,255,0.06)" px={3} py={2} borderBottom="1px solid" borderRight="1px solid" borderColor="whiteAlpha.100">
    <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
      {children}
    </Text>
  </Box>
);

const MatrixCell = ({ children, muted = false }) => (
  <Box px={3} py={2} borderBottom="1px solid" borderRight="1px solid" borderColor="whiteAlpha.100" minW={0}>
    <Text fontSize="10px" color={muted ? "text.muted" : "text.secondary"} fontWeight={muted ? "black" : "bold"} lineClamp={2}>
      {children}
    </Text>
  </Box>
);

const TimelinePanel = ({ conf }) => (
  <Card accent={conf.colors.primary}>
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow color={conf.colors.secondary}>{conf.key} Timeline</Eyebrow>
          <Title size="lg">Era Markers</Title>
        </Box>
        <CalendarDays size={22} color={conf.colors.secondary} />
      </Flex>
      <Flex direction="column" gap={2} flex={1} justify="space-between">
        {conf.timeline.map(([year, text]) => (
          <Flex key={`${conf.key}-${year}`} gap={3} align="flex-start">
            <Box w="54px" flexShrink={0}>
              <Text fontSize="lg" color={conf.colors.secondary} fontWeight="black" lineHeight={1}>
                {year}
              </Text>
            </Box>
            <Box borderLeft="2px solid" borderColor={`${conf.colors.primary}99`} pl={3} minW={0}>
              <Text fontSize="xs" color="text.secondary" fontWeight="bold" lineHeight={1.35}>
                {text}
              </Text>
            </Box>
          </Flex>
        ))}
      </Flex>
    </Box>
  </Card>
);

const ChampionshipBridge = () => (
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
      <Text fontSize="sm" color="text.secondary" lineHeight={1.5} maxW="760px">
        The SWAC champion and MEAC champion meet in Atlanta in the Celebration Bowl, the modern
        centerpiece of the HBCU national championship conversation.
      </Text>
      <SimpleGrid columns={3} gap={3} mt={4}>
        <Stat label="Series record" value="MEAC 6, SWAC 4" color="#FFD100" />
        <Stat label="2025 result" value="South Carolina State over Prairie View A&M" />
        <Stat label="Selection model" value="SWAC title winner vs MEAC regular-season champion" />
      </SimpleGrid>
    </Box>
  </Card>
);

const CelebrationTable = () => (
  <Card accent="#FFD100">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Eyebrow color="#FFD100">Celebration Bowl Results</Eyebrow>
      <Title size="lg">SWAC vs MEAC Record</Title>
      <Grid mt={3} templateColumns="64px 70px 1fr" gap={0} flex={1} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" overflow="hidden">
        <HeaderCell>Year</HeaderCell>
        <HeaderCell>Winner</HeaderCell>
        <HeaderCell>Game</HeaderCell>
        {CELEBRATION_RESULTS.map(([year, winner, game]) => (
          <>
            <MatrixCell key={`${year}-year`} muted>{year}</MatrixCell>
            <MatrixCell key={`${year}-winner`}>{winner}</MatrixCell>
            <MatrixCell key={`${year}-game`}>{game}</MatrixCell>
          </>
        ))}
      </Grid>
    </Box>
  </Card>
);

const MembershipPanel = () => (
  <Card accent="#E53E3E">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Membership And Alignment</Eyebrow>
          <Title size="lg">Football Members Plus Context</Title>
        </Box>
        <Users size={24} color="#E53E3E" />
      </Flex>
      <SimpleGrid columns={4} gap={3} flex={1}>
        <MemberGroup title="SWAC East" items={MEMBERSHIP.swacEast} color={SWAC.colors.primary} />
        <MemberGroup title="SWAC West" items={MEMBERSHIP.swacWest} color={SWAC.colors.secondary} />
        <MemberGroup title="MEAC Football" items={MEMBERSHIP.meacFootball} color={MEAC.colors.primary} />
        <MemberGroup title="Non-Football / Former Context" items={[...MEMBERSHIP.meacNonFootball, ...MEMBERSHIP.formerContext]} color={MEAC.colors.secondary} />
      </SimpleGrid>
    </Box>
  </Card>
);

const MemberGroup = ({ title, items, color }) => (
  <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={3} minW={0}>
    <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.1em" mb={2} lineClamp={1}>
      {title}
    </Text>
    <Flex direction="column" gap={1.5}>
      {items.map((item) => (
        <Text key={`${title}-${item}`} fontSize="10px" color="text.secondary" fontWeight="bold" lineClamp={1}>
          {item}
        </Text>
      ))}
    </Flex>
  </Box>
);

const RivalryGrid = () => (
  <Card accent="#F56565">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Eyebrow>Rivalries, Classics, And Showcases</Eyebrow>
      <Title size="lg">The Calendar Has Its Own Wiki</Title>
      <SimpleGrid columns={3} gap={3} mt={3} flex={1}>
        {RIVALRIES.map(([name, teams, note]) => (
          <Box key={name} border="1px solid" borderColor="whiteAlpha.100" bg="rgba(255,255,255,0.035)" borderRadius="8px" p={3}>
            <Text fontSize="xs" color="white" fontWeight="black" lineClamp={1}>
              {name}
            </Text>
            <Text mt={1} fontSize="9px" color="brand.400" fontWeight="black" textTransform="uppercase" lineClamp={1}>
              {teams}
            </Text>
            <Text mt={2} fontSize="10px" color="text.secondary" lineHeight={1.4} lineClamp={3}>
              {note}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

const CulturePanel = ({ conf }) => (
  <Card accent={conf.colors.primary}>
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between">
        <Box>
          <Eyebrow color={conf.colors.secondary}>{conf.key} Culture</Eyebrow>
          <Title size="lg">Traditions, Style, Media</Title>
        </Box>
        <Radio size={22} color={conf.colors.secondary} />
      </Flex>
      <Text mt={3} fontSize="xs" color="text.secondary" lineHeight={1.5}>
        {conf.gameStyle}
      </Text>
      <Box mt={4}>
        <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.13em" mb={2}>
          Traditions
        </Text>
        <Flex gap={1.5} flexWrap="wrap">
          {conf.traditions.map((item) => <Chip key={item} color={`${conf.colors.secondary}99`}>{item}</Chip>)}
        </Flex>
      </Box>
      <Box mt="auto" pt={4}>
        <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.13em" mb={2}>
          Media And Visibility
        </Text>
        <Flex direction="column" gap={1.5}>
          {conf.media.map((item) => (
            <Flex key={item} gap={2} align="center">
              <Radio size={11} color={conf.colors.secondary} />
              <Text fontSize="10px" color="text.secondary" fontWeight="bold" lineClamp={1}>{item}</Text>
            </Flex>
          ))}
        </Flex>
      </Box>
    </Box>
  </Card>
);

const LegacyPanel = () => (
  <Card
    accent="#FFFFFF"
    bg="linear-gradient(110deg, rgba(111,38,51,0.22) 0%, rgba(20,20,22,0.98) 50%, rgba(75,0,130,0.24) 100%)"
  >
    <Box p={5} h="100%" display="flex" alignItems="center" gap={6}>
      <Box flex="1.1" minW={0}>
        <Eyebrow color="#FFD100">Combined Excellence</Eyebrow>
        <Title size="3xl">One FCS HBCU Stage</Title>
        <Text mt={3} fontSize="sm" color="text.secondary" lineHeight={1.6}>
          The shared story is bigger than standings: NFL Draft picks, Pro Bowlers, coaches, bands,
          classics, alumni travel, civil rights lineage, and institutions that made football part of
          American cultural history.
        </Text>
      </Box>
      <SimpleGrid columns={3} gap={3} flex="1" minW={0}>
        {LEGACY_STATS.map(([value, label]) => (
          <Box key={label} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={3} bg="rgba(0,0,0,0.22)">
            <Text fontSize="2xl" color="white" fontWeight="black" lineHeight={1}>
              {value}
            </Text>
            <Text mt={1} fontSize="8px" color="text.muted" fontWeight="bold" textTransform="uppercase" letterSpacing="0.1em">
              {label}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  </Card>
);

const TeamDirectoryBottom = () => (
  <Card accent="#71717A">
    <Box p={4} h="100%" display="flex" flexDirection="column">
      <Flex align="center" justify="space-between" mb={3}>
        <Box>
          <Eyebrow>Member Team Directory</Eyebrow>
          <Title size="lg">At The Bottom, Where It Belongs</Title>
        </Box>
        <MapPin size={24} color="#A1A1AA" />
      </Flex>
      <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap={2} flex={1}>
        {TEAMS.map((team) => (
          <Box key={`bottom-${team.id}`} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" p={2} bg="rgba(255,255,255,0.035)" minW={0}>
            <Flex align="center" gap={2}>
              <Image src={team.logo} boxSize="22px" objectFit="contain" flexShrink={0} />
              <Box minW={0}>
                <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{team.name}</Text>
                <Text fontSize="8px" color="text.muted" fontWeight="bold" lineClamp={1}>{team.conference} / {team.division || "MEAC"}</Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Box>
  </Card>
);

export const ConferenceWikiPageLabA = () => (
  <PageShell>
    <PageShell.Slot cols={4} rows={2}>
      <ConferenceWikiBanner />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <SchoolJumpDirectory />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <ConferencePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <ConferencePanel conf={MEAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <ComparisonMatrix />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TimelinePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={2}>
      <ChampionshipBridge />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <TimelinePanel conf={MEAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <CelebrationTable />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={3}>
      <MembershipPanel />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={2}>
      <RivalryGrid />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <CulturePanel conf={SWAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={2} rows={2}>
      <LegacyPanel />
    </PageShell.Slot>
    <PageShell.Slot cols={1} rows={2}>
      <CulturePanel conf={MEAC} />
    </PageShell.Slot>
    <PageShell.Slot cols={4} rows={1}>
      <TeamDirectoryBottom />
    </PageShell.Slot>
  </PageShell>
);
