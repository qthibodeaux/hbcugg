import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronUp, Shield, Trophy } from "lucide-react";
import teamsData from "../../../data/teams.json";

const teamById = teamsData.teams.reduce((acc, team) => {
  const id = team.exportId.replace(/25$/, "");
  acc[id] = team;
  return acc;
}, {});

const groups = {
  west: {
    label: "SWAC West",
    slug: "WEST",
    kicker: "division leader",
    metricLabel: "conference",
    useConferenceRecord: true,
    rows: [
      { teamId: "swacpvamu", record: "10-3", confRecord: "0-0", wins: 10, losses: 3 },
      { teamId: "swacgsu", record: "7-4", confRecord: "4-3", wins: 7, losses: 4 },
      { teamId: "swactsu", record: "4-5", confRecord: "3-3", wins: 4, losses: 5 },
    ],
  },
  east: {
    label: "SWAC East",
    slug: "EAST",
    kicker: "division leader",
    metricLabel: "conference",
    useConferenceRecord: true,
    rows: [
      { teamId: "swacasu", record: "9-2", confRecord: "7-1", wins: 9, losses: 2 },
      { teamId: "swacjsu", record: "9-2", confRecord: "7-1", wins: 9, losses: 2 },
      { teamId: "swacalc", record: "5-6", confRecord: "4-3", wins: 5, losses: 6 },
    ],
  },
  meac: {
    label: "MEAC",
    slug: "MEAC",
    kicker: "conference leader",
    metricLabel: "conference",
    useConferenceRecord: true,
    rows: [
      { teamId: "meacscsu", record: "9-3", confRecord: "5-0", wins: 9, losses: 3 },
      { teamId: "meacdsu", record: "8-3", confRecord: "4-0", wins: 8, losses: 3 },
      { teamId: "meacnccu", record: "7-4", confRecord: "3-2", wins: 7, losses: 4 },
    ],
  },
  meacPreConference: {
    label: "MEAC",
    slug: "MEAC",
    kicker: "overall standings",
    metricLabel: "overall",
    useConferenceRecord: false,
    rows: [
      { teamId: "meacdsu", record: "2-0", confRecord: "0-0", wins: 2, losses: 0 },
      { teamId: "meacscsu", record: "1-1", confRecord: "0-0", wins: 1, losses: 1 },
      { teamId: "meacnccu", record: "1-1", confRecord: "0-0", wins: 1, losses: 1 },
    ],
  },
  meacLowSample: {
    label: "MEAC",
    slug: "MEAC",
    kicker: "early standings",
    metricLabel: "overall",
    useConferenceRecord: false,
    rows: [
      { teamId: "meacnccu", record: "3-1", confRecord: "1-0", wins: 3, losses: 1 },
      { teamId: "meacscsu", record: "3-2", confRecord: "0-0", wins: 3, losses: 2 },
      { teamId: "meacdsu", record: "2-2", confRecord: "0-1", wins: 2, losses: 2 },
    ],
  },
};

const enrich = (row) => ({ ...row, team: teamById[row.teamId] });
const logoFor = (team) => `/assets/${team.exportId.replace(/25$/, "")}.svg`;
const pct = (row) => row.wins / Math.max(1, row.wins + row.losses);
const leader = (group) => enrich(group.rows[0]);
const displayRecord = (row, group) => group.useConferenceRecord ? row.confRecord : row.record;
const compactLabel = (team, fallback = "TEAM") => team?.bannerShort ?? team?.shortName ?? team?.name ?? fallback;

const Card = ({ children, bg = "#111114", color = "#E53E3E" }) => (
  <Box
    h="100%"
    w="100%"
    overflow="hidden"
    position="relative"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    bg={bg}
    style={{ boxShadow: `inset 0 0 60px ${color}18` }}
  >
    {children}
  </Box>
);

const MiniLogo = ({ team, size = "30px", opacity = 1 }) => (
  <Image
    src={logoFor(team)}
    w={size}
    h={size}
    objectFit="contain"
    opacity={opacity}
    flexShrink={0}
  />
);

const Kicker = ({ children, color = "#E53E3E" }) => (
  <Text
    fontSize="8px"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.16em"
  >
    {children}
  </Text>
);

const SmallRow = ({ row, index, tone = "dark" }) => {
  const item = enrich(row);
  const primary = item.team.colors.primary;
  const isLight = tone === "paper";
  return (
    <Flex align="center" gap={2} minW={0}>
      <Text
        w="16px"
        fontSize="10px"
        fontWeight="black"
        color={index === 0 ? primary : isLight ? "#3A332B" : "text.muted"}
      >
        {index + 1}
      </Text>
      <MiniLogo team={item.team} size="22px" />
      <Text
        flex={1}
        minW={0}
        lineClamp={1}
        fontSize="xs"
        fontWeight={index === 0 ? "black" : "bold"}
        color={isLight ? "#15120F" : index === 0 ? "white" : "text.secondary"}
        textTransform="uppercase"
      >
        {item.team.shortName}
      </Text>
      <Text fontSize="xs" fontWeight="black" color={isLight ? "#15120F" : "white"}>
        {item.record}
      </Text>
    </Flex>
  );
};

const NeonLadderCard = ({ group }) => {
  const top = leader(group);
  const color = top.team.colors.primary;
  const secondary = top.team.colors.secondary === "#FFFFFF" ? "#DDE6F2" : top.team.colors.secondary;
  const chaseRows = group.rows.slice(1, 3);
  return (
    <Card color={color}>
      <Box position="absolute" inset={0} bg={`linear-gradient(150deg, ${color}50, transparent 58%)`} />
      <Box position="absolute" right={{ base: "-26px", lg: "-38px" }} top={{ base: "-18px", lg: "-24px" }} opacity={0.12}>
        <MiniLogo team={top.team} size="clamp(92px, 42%, 150px)" />
      </Box>
      <Trophy
        size={17}
        color={color}
        style={{ position: "absolute", top: 12, right: 12, opacity: 0.9 }}
      />
      <Flex
        h="100%"
        direction="column"
        px={{ base: 3, lg: 4 }}
        pt={{ base: 9, lg: 9 }}
        pb={{ base: 3, lg: 4 }}
        position="relative"
        gap={{ base: 2, lg: 2.5 }}
        overflow="hidden"
      >
        <Flex align="center" gap={{ base: 2, lg: 3 }} minH={0} flexShrink={0}>
          <MiniLogo team={top.team} size="clamp(34px, 18%, 54px)" />
          <Box minW={0}>
            <Text fontSize="clamp(7px, 0.8vw, 9px)" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
              {group.label} leader
            </Text>
            <Text fontSize="clamp(1.55rem, 4.4vw, 2.25rem)" fontWeight="black" color="white" lineHeight={0.84} textTransform="uppercase" lineClamp={1} maxW="100%">
              {compactLabel(top.team)}
            </Text>
            <Flex align="center" gap={2} mt={1}>
              <Text fontSize="clamp(10px, 1.05vw, 12px)" color={secondary} fontWeight="black" whiteSpace="nowrap">
                {displayRecord(top, group)}
              </Text>
              <Text fontSize="clamp(7px, 0.8vw, 9px)" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
                {group.metricLabel}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Box h="1px" bg={`linear-gradient(90deg, ${secondary}88, transparent)`} flexShrink={0} />

        <Flex mt="auto" direction="column" gap={{ base: 1.5, lg: 2 }} minH={0}>
          {chaseRows.map((row, index) => {
            const item = enrich(row);
            const rowColor = item.team.colors.primary;
            return (
              <Box key={row.teamId}>
                <Flex align="center" gap={2}>
                  <Text fontSize="clamp(7px, 0.85vw, 9px)" fontWeight="black" w="12px" color="text.muted" flexShrink={0}>
                    {index + 2}
                  </Text>
                  <MiniLogo team={item.team} size="clamp(18px, 9%, 24px)" />
                  <Text flex={1} minW={0} fontSize="clamp(10px, 1.2vw, 14px)" fontWeight="black" color="text.secondary" textTransform="uppercase" lineClamp={1}>
                    {compactLabel(item.team)}
                  </Text>
                  <Text fontSize="clamp(10px, 1.2vw, 14px)" fontWeight="black" color="white" whiteSpace="nowrap">
                    {displayRecord(item, group)}
                  </Text>
                </Flex>
                <Box mt={{ base: 1, lg: 1.5 }} h={{ base: "3px", lg: "4px" }} bg="whiteAlpha.100" overflow="hidden" borderRadius="full">
                  <Box h="100%" w={`${Math.round(pct(row) * 100)}%`} style={{ background: rowColor }} />
                </Box>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Card>
  );
};

const TicketStackCard = ({ group }) => {
  const top = leader(group);
  const color = top.team.colors.primary;
  return (
    <Card bg="#EAE1D1" color={color}>
      <Box position="absolute" inset={3} border="1px dashed rgba(30,24,18,0.28)" borderRadius="lg" />
      <Box position="absolute" right={0} top={0} bottom={0} w="34px" bg={color} opacity={0.92} />
      <Text
        position="absolute"
        right="-28px"
        top="50%"
        transform="translateY(-50%) rotate(90deg)"
        fontSize="10px"
        fontWeight="black"
        color="white"
        letterSpacing="0.2em"
      >
        {group.slug}
      </Text>
      <Flex h="100%" direction="column" px={4} pt={9} pb={4} pr="46px" position="relative">
        <Kicker color={color}>admit one to first place</Kicker>
        <Flex align="center" mt={3} gap={3}>
          <MiniLogo team={top.team} size="48px" />
          <Box minW={0}>
            <Text fontSize="xl" fontWeight="black" color="#15120F" lineHeight={0.95} textTransform="uppercase">
              {top.team.shortName}
            </Text>
            <Text fontSize="10px" color="#5C5146" fontWeight="bold">
              {top.record} overall / {top.confRecord} conf
            </Text>
          </Box>
        </Flex>
        <Flex mt="auto" direction="column" gap={2}>
          {group.rows.map((row, index) => (
            <SmallRow key={row.teamId} row={row} index={index} tone="paper" />
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

const BeltPlateCard = ({ group }) => {
  const top = leader(group);
  const color = top.team.colors.primary;
  return (
    <Card bg="#08080A" color={color}>
      <Box position="absolute" inset={0} bg={`radial-gradient(circle at 50% 30%, ${color}55, transparent 42%)`} />
      <Box position="absolute" left="-26px" top="58px" w="70px" h="74px" borderRadius="full" border="10px solid rgba(255,255,255,0.08)" />
      <Box position="absolute" right="-26px" top="58px" w="70px" h="74px" borderRadius="full" border="10px solid rgba(255,255,255,0.08)" />
      <Flex h="100%" direction="column" align="center" px={4} pt={9} pb={4} position="relative">
        <Kicker color="#F8D66D">{group.label} title plate</Kicker>
        <Box
          mt={3}
          w="118px"
          h="82px"
          borderRadius="50%"
          bg="linear-gradient(135deg, #F8D66D 0%, #7C5B1F 58%, #FFF1A8 100%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="3px solid rgba(255,255,255,0.35)"
        >
          <MiniLogo team={top.team} size="62px" />
        </Box>
        <Text mt={2} fontSize="2xl" fontWeight="black" color="white" lineHeight={0.9}>
          {top.record}
        </Text>
        <Flex w="100%" mt="auto" direction="column" gap={1.5}>
          {group.rows.map((row, index) => {
            const item = enrich(row);
            return (
              <Flex key={row.teamId} align="center" gap={2}>
                <Text fontSize="9px" fontWeight="black" color="#F8D66D">{index + 1}</Text>
                <Text flex={1} fontSize="10px" color="text.secondary" fontWeight="black" lineClamp={1}>
                  {item.team.shortName}
                </Text>
                <Text fontSize="10px" color="white" fontWeight="black">{item.record}</Text>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </Card>
  );
};

const MagazineCoverCard = ({ group }) => {
  const top = leader(group);
  const color = top.team.colors.primary;
  return (
    <Card bg="#0C0C10" color={color}>
      <Box position="absolute" inset={0} bg={`linear-gradient(180deg, ${color}44 0%, rgba(12,12,16,0) 58%)`} />
      <Text
        position="absolute"
        top="34px"
        left="-6px"
        fontSize="58px"
        fontWeight="black"
        lineHeight={0.8}
        color="rgba(255,255,255,0.07)"
      >
        {group.slug}
      </Text>
      <Box position="absolute" right="-18px" bottom="-12px" opacity={0.16}>
        <MiniLogo team={top.team} size="140px" />
      </Box>
      <Flex h="100%" direction="column" px={4} pt={9} pb={4} position="relative">
        <Kicker color={top.team.colors.secondary === "#FFFFFF" ? "#E8E8EA" : top.team.colors.secondary}>
          standings issue
        </Kicker>
        <Text mt={3} fontSize="3xl" color="white" fontWeight="black" lineHeight={0.82} textTransform="uppercase">
          {top.team.shortName}
          <br />
          owns the
          <br />
          cover
        </Text>
        <Grid mt="auto" templateColumns="repeat(3, 1fr)" gap={1.5}>
          {group.rows.map((row, index) => {
            const item = enrich(row);
            return (
              <Box key={row.teamId} bg="rgba(255,255,255,0.08)" border="1px solid rgba(255,255,255,0.08)" px={2} py={1.5}>
                <Text fontSize="8px" color="text.muted" fontWeight="black">0{index + 1}</Text>
                <Text fontSize="10px" color="white" fontWeight="black" lineClamp={1}>{item.team.shortName}</Text>
                <Text fontSize="10px" color="brand.300" fontWeight="black">{item.record}</Text>
              </Box>
            );
          })}
        </Grid>
      </Flex>
    </Card>
  );
};

const RaceTrackCard = ({ group }) => {
  const top = leader(group);
  const color = top.team.colors.primary;
  return (
    <Card bg="#101015" color={color}>
      <Box position="absolute" inset={0} opacity={0.16} backgroundImage="linear-gradient(90deg, #fff 1px, transparent 1px)" backgroundSize="18px 18px" />
      <Flex h="100%" direction="column" px={4} pt={9} pb={4} position="relative">
        <Flex justify="space-between" align="center">
          <Kicker color={color}>division race</Kicker>
          <ChevronUp size={17} color={color} />
        </Flex>
        <Text mt={2} fontSize="lg" fontWeight="black" color="white" textTransform="uppercase">
          {group.label}
        </Text>
        <Flex mt="auto" direction="column" gap={3}>
          {group.rows.map((row, index) => {
            const item = enrich(row);
            const width = Math.max(34, Math.round(pct(row) * 100));
            return (
              <Box key={row.teamId}>
                <Flex align="center" justify="space-between" mb={1}>
                  <Flex align="center" gap={2}>
                    <MiniLogo team={item.team} size="20px" />
                    <Text fontSize="10px" color="white" fontWeight="black">{item.team.shortName}</Text>
                  </Flex>
                  <Text fontSize="10px" color="text.secondary" fontWeight="black">{item.record}</Text>
                </Flex>
                <Box h="18px" bg="blackAlpha.500" border="1px solid rgba(255,255,255,0.12)" overflow="hidden">
                  <Flex
                    h="100%"
                    w={`${width}%`}
                    align="center"
                    justify="flex-end"
                    pr={1.5}
                    style={{ background: `linear-gradient(90deg, ${item.team.colors.primary}, ${item.team.colors.secondary})` }}
                  >
                    <Text fontSize="8px" color="white" fontWeight="black">{index + 1}</Text>
                  </Flex>
                </Box>
              </Box>
            );
          })}
        </Flex>
      </Flex>
    </Card>
  );
};

const NewsCutoutCard = ({ group }) => {
  const top = leader(group);
  const color = top.team.colors.primary;
  return (
    <Card bg="#F4F0E7" color={color}>
      <Box position="absolute" inset={0} opacity={0.2} backgroundImage="linear-gradient(#111 1px, transparent 1px)" backgroundSize="100% 7px" />
      <Flex h="100%" direction="column" px={4} pt={9} pb={4} position="relative">
        <Flex align="center" justify="space-between" borderBottom="2px solid #16120F" pb={1.5}>
          <Text fontSize="13px" fontWeight="black" color="#16120F" textTransform="uppercase">
            Glory Ledger
          </Text>
          <Shield size={16} color="#16120F" />
        </Flex>
        <Text mt={3} fontSize="2xl" color="#16120F" fontWeight="black" lineHeight={0.9} textTransform="uppercase">
          {top.team.shortName} tops {group.slug}
        </Text>
        <Flex mt={3} gap={2} align="center">
          <Box bg={color} p={1.5} transform="rotate(-4deg)">
            <MiniLogo team={top.team} size="42px" />
          </Box>
          <Text fontSize="10px" color="#4A4037" fontWeight="bold" lineHeight={1.2}>
            {top.record} overall, with the top three packed into the weekly standings column.
          </Text>
        </Flex>
        <Flex mt="auto" direction="column" gap={1.5}>
          {group.rows.map((row, index) => (
            <SmallRow key={row.teamId} row={row} index={index} tone="paper" />
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

export const GameCenterStandingsNeonLadderA = () => <NeonLadderCard group={groups.west} />;
export const GameCenterStandingsNeonLadderContextGallery = () => (
  <Grid h="100%" templateColumns={{ base: "1fr", md: "repeat(3, minmax(0, 1fr))" }} gap={3}>
    <NeonLadderCard group={groups.east} />
    <NeonLadderCard group={groups.meacPreConference} />
    <NeonLadderCard group={groups.meacLowSample} />
  </Grid>
);
export const GameCenterStandingsTicketStackB = () => <TicketStackCard group={groups.east} />;
export const GameCenterStandingsBeltPlateC = () => <BeltPlateCard group={groups.meac} />;
export const GameCenterStandingsMagazineCoverD = () => <MagazineCoverCard group={groups.west} />;
export const GameCenterStandingsRaceTrackE = () => <RaceTrackCard group={groups.east} />;
export const GameCenterStandingsNewsCutoutF = () => <NewsCutoutCard group={groups.meac} />;
