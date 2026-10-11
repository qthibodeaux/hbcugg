import { useState } from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import PageShell from "../../components/layouts/PageShell";
import { BannerStandings } from "../../components/organisms/test/BannerPages";
import teamsData from "../../data/teams.json";

const TEAM_BY_ID = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const standingsGroups = [
  {
    id: "swac-east",
    label: "SWAC East",
    accent: "#F4811F",
    completedGames: 24,
    remainingGames: 0,
    rows: [
      { id: "swacjsu", conf: "7-1", overall: "10-2", left: 0, streak: "W6", diff: 112, form: "WWWWW", finish: [100, 0, 0, 0, 0, 0] },
      { id: "swacasu", conf: "7-1", overall: "9-3", left: 0, streak: "W4", diff: 88, form: "WWWWW", finish: [0, 100, 0, 0, 0, 0] },
      { id: "swacfamu", conf: "4-3", overall: "7-5", left: 0, streak: "L1", diff: 41, form: "WWLWL", finish: [0, 0, 100, 0, 0, 0] },
      { id: "swacbcu", conf: "4-4", overall: "6-6", left: 0, streak: "W1", diff: 16, form: "LWLWW", finish: [0, 0, 0, 100, 0, 0] },
      { id: "swacaamu", conf: "3-5", overall: "5-7", left: 0, streak: "L2", diff: -22, form: "WLLWL", finish: [0, 0, 0, 0, 100, 0] },
      { id: "swacmvsu", conf: "1-7", overall: "2-10", left: 0, streak: "L5", diff: -104, form: "LLLLL", finish: [0, 0, 0, 0, 0, 100] },
    ],
  },
  {
    id: "swac-west",
    label: "SWAC West",
    accent: "#FDB913",
    completedGames: 24,
    remainingGames: 0,
    rows: [
      { id: "swacgsu", conf: "4-3", overall: "7-5", left: 0, streak: "W2", diff: 36, form: "WLWWW", finish: [100, 0, 0, 0, 0, 0] },
      { id: "swacpvamu", conf: "4-3", overall: "7-5", left: 0, streak: "W3", diff: 44, form: "LWWWW", finish: [0, 100, 0, 0, 0, 0] },
      { id: "swactsu", conf: "3-3", overall: "6-5", left: 0, streak: "W1", diff: 18, form: "LWWLW", finish: [0, 0, 100, 0, 0, 0] },
      { id: "swacsu", conf: "3-4", overall: "5-7", left: 0, streak: "L2", diff: -8, form: "WWLLL", finish: [0, 0, 0, 100, 0, 0] },
      { id: "swacalc", conf: "3-4", overall: "5-7", left: 0, streak: "L1", diff: -12, form: "WLWLL", finish: [0, 0, 0, 0, 100, 0] },
      { id: "swacuapb", conf: "2-5", overall: "4-8", left: 0, streak: "L1", diff: -31, form: "LLWWL", finish: [0, 0, 0, 0, 0, 100] },
    ],
  },
  {
    id: "meac",
    label: "MEAC",
    accent: "#0077C8",
    completedGames: 15,
    remainingGames: 0,
    rows: [
      { id: "meacscsu", conf: "5-0", overall: "9-3", left: 0, streak: "W5", diff: 73, form: "WWWWW", finish: [100, 0, 0, 0, 0, 0] },
      { id: "meacdsu", conf: "4-0", overall: "8-4", left: 0, streak: "W4", diff: 64, form: "LWWWW", finish: [0, 100, 0, 0, 0, 0] },
      { id: "meacnccu", conf: "3-2", overall: "7-5", left: 0, streak: "L1", diff: 38, form: "WWWLL", finish: [0, 0, 100, 0, 0, 0] },
      { id: "meachu", conf: "2-3", overall: "5-7", left: 0, streak: "L2", diff: -10, form: "WLWLL", finish: [0, 0, 0, 100, 0, 0] },
      { id: "meacnsu", conf: "1-4", overall: "4-8", left: 0, streak: "W1", diff: -39, form: "LLWLW", finish: [0, 0, 0, 0, 100, 0] },
      { id: "meacmsu", conf: "0-6", overall: "2-10", left: 0, streak: "L6", diff: -126, form: "LLLLL", finish: [0, 0, 0, 0, 0, 100] },
    ],
  },
];

const gloryTopSix = [
  { id: "swacjsu", score: 92.4, tag: "Control" },
  { id: "meacscsu", score: 89.6, tag: "Clean Sheet" },
  { id: "swacasu", score: 87.1, tag: "East Heat" },
  { id: "swacpvamu", score: 83.8, tag: "Late Push" },
  { id: "meacdsu", score: 82.5, tag: "Alive" },
  { id: "swacgsu", score: 80.9, tag: "West Edge" },
];

const featureCards = [
  { label: "Closest Race", value: "SWAC West", sub: "Five teams still carrying paths", accent: "#FDB913" },
  { label: "Best Control", value: "SCSU", sub: "Cleanest MEAC finish profile", accent: "#0077C8" },
  { label: "East Pressure", value: "ASU / JSU", sub: "Split race at the top", accent: "#F4811F" },
  { label: "Live Paths", value: "44", sub: "Open title scenarios tracked", accent: "#F56565" },
];

const getLogo = (team) => team?.logo ?? `/assets/${team?.exportId?.replace(/25$/, "")}.svg`;
const teamLabel = (team) => team?.bannerShort ?? team?.shortName ?? team?.name ?? "TEAM";

const TeamLogo = ({ team, size = "26px" }) => (
  <Image src={getLogo(team)} alt={teamLabel(team)} w={size} h={size} objectFit="contain" />
);

const FormRail = ({ form }) => (
  <Flex gap="3px" justify="end">
    {String(form).split("").map((result, index) => (
      <Box
        key={`${result}-${index}`}
        w="8px"
        h="14px"
        borderRadius="2px"
        bg={result === "W" ? "#48E083" : "#F56565"}
        opacity={result === "W" ? 0.95 : 0.72}
      />
    ))}
  </Flex>
);

const heatColor = (value, accent) => {
  if (value >= 40) return "linear-gradient(135deg, #0F8F55 0%, #32C77A 100%)";
  if (value >= 25) return "linear-gradient(135deg, #2FA96B 0%, #8AD7AF 100%)";
  if (value >= 12) return "linear-gradient(135deg, #DCEFE5 0%, #94CFAF 100%)";
  if (value > 0) return "linear-gradient(135deg, #DFA19A 0%, #B8473F 100%)";
  return "linear-gradient(135deg, #7B211F 0%, #C6554B 100%)";
};

const DivisionStandingsCard = ({ group }) => {
  const leader = group.rows[0];
  const leaderTeam = TEAM_BY_ID[leader.id];

  return (
    <Box
      h="100%"
      w="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${leaderTeam.colors.primary}33 0%, transparent 54%)`} />
      <Flex position="relative" direction="column" h="100%" p={4}>
        <Flex align="center" justify="space-between" mb={4}>
          <Box>
            <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              Division Table
            </Text>
            <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
              {group.label}
            </Text>
          </Box>
          <Flex align="center" gap={2}>
            <TeamLogo team={leaderTeam} size="34px" />
            <Box textAlign="right">
              <Text fontSize="xs" color="text.muted" fontWeight="black" textTransform="uppercase">
                Leader
              </Text>
              <Text fontSize="xl" color="white" fontWeight="black" lineHeight={1}>
                {teamLabel(leaderTeam)}
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Grid templateColumns="28px minmax(0, 1fr) 50px 54px 44px 60px" gap={2} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
          {["#", "Team", "Conf", "All", "Diff", "Last 5"].map((item) => (
            <Text key={item} fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" textAlign={item === "Team" ? "left" : "right"}>
              {item}
            </Text>
          ))}
        </Grid>

        <Flex direction="column" flex={1} justify="space-evenly">
          {group.rows.map((row, index) => {
            const team = TEAM_BY_ID[row.id];
            const isLeader = index === 0;
            return (
              <Grid key={row.id} templateColumns="28px minmax(0, 1fr) 50px 54px 44px 60px" gap={2} alignItems="center">
                <Text fontSize="xs" color={isLeader ? group.accent : "text.muted"} fontWeight="black" textAlign="right">
                  {index + 1}
                </Text>
                <Flex align="center" gap={2} minW={0}>
                  <TeamLogo team={team} size="22px" />
                  <Box minW={0}>
                    <Text fontSize="sm" color="white" fontWeight={isLeader ? "black" : "bold"} lineClamp={1}>
                      {teamLabel(team)}
                    </Text>
                    <Text fontSize="8px" color={row.streak.startsWith("W") ? "green.300" : "text.muted"} fontWeight="black">
                      {row.streak}
                    </Text>
                  </Box>
                </Flex>
                <Text fontSize="sm" color="white" fontWeight="black" textAlign="right">
                  {row.conf}
                </Text>
                <Text fontSize="xs" color="text.secondary" fontWeight="bold" textAlign="right">
                  {row.overall}
                </Text>
                <Text fontSize="xs" color={row.diff >= 0 ? "green.300" : "red.300"} fontWeight="black" textAlign="right">
                  {row.diff > 0 ? "+" : ""}{row.diff}
                </Text>
                <FormRail form={row.form} />
              </Grid>
            );
          })}
        </Flex>
      </Flex>
    </Box>
  );
};

const GloryRankingsCard = () => (
  <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden" p={4}>
    <Flex align="end" justify="space-between" mb={4}>
      <Box>
        <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
          Top 6
        </Text>
        <Text fontSize="xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          Glory Rankings
        </Text>
      </Box>
      <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">
        Composite board
      </Text>
    </Flex>

    <Flex direction="column" h="calc(100% - 50px)" justify="space-evenly">
      {gloryTopSix.map((row, index) => {
        const team = TEAM_BY_ID[row.id];
        return (
          <Grid key={row.id} templateColumns="28px 32px 1fr 56px" gap={2} alignItems="center">
            <Text fontSize="xs" color={index === 0 ? "brand.400" : "text.muted"} fontWeight="black">
              {index + 1}
            </Text>
            <TeamLogo team={team} size="26px" />
            <Box minW={0}>
              <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                {teamLabel(team)}
              </Text>
              <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase" lineClamp={1}>
                {row.tag}
              </Text>
            </Box>
            <Text fontSize="lg" color="white" fontWeight="black" textAlign="right">
              {row.score.toFixed(1)}
            </Text>
          </Grid>
        );
      })}
    </Flex>
  </Box>
);

const DivisionFinishMatrix = ({ group }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
    <style>{`
      @media (min-width: 641px) and (max-width: 900px) {
        .finish-matrix-team-name {
          display: none !important;
        }

        .finish-matrix-grid {
          grid-template-columns: 58px repeat(6, minmax(58px, 1fr)) !important;
          min-width: 430px !important;
        }
      }
    `}</style>
    <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Box>
        <Text fontSize="10px" color={group.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">
          Finish Matrix
        </Text>
        <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
          {group.label}
        </Text>
      </Box>
      <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">
        6 teams x 6 finish slots
      </Text>
    </Flex>
    <Flex px={5} py={3} gap={5} bg="blackAlpha.300" borderBottom="1px solid" borderColor="whiteAlpha.100" wrap="wrap">
      <Text fontSize="sm" color="text.secondary">
        <Text as="span" color="white" fontWeight="black">Teams:</Text> {group.rows.length}
      </Text>
      <Text fontSize="sm" color="text.secondary">
        <Text as="span" color="white" fontWeight="black">Completed Games:</Text> {group.completedGames}
      </Text>
      <Text fontSize="sm" color="text.secondary">
        <Text as="span" color="white" fontWeight="black">Remaining Games:</Text> {group.remainingGames}
      </Text>
    </Flex>

    <Box overflowX="auto">
      <Grid className="finish-matrix-grid" templateColumns="190px repeat(6, minmax(78px, 1fr))" minW="700px">
        <Box px={4} py={3} bg="blackAlpha.300" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase">Team</Text>
        </Box>
        {[1, 2, 3, 4, 5, 6].map((slot) => (
          <Box key={slot} px={3} py={3} bg="blackAlpha.300" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="9px" color={slot === 1 ? group.accent : "text.muted"} fontWeight="black" textAlign="center" textTransform="uppercase">
              Finish {slot}
            </Text>
          </Box>
        ))}

        {group.rows.map((row) => {
          const team = TEAM_BY_ID[row.id];
          return (
            <Box key={row.id} display="contents">
              <Flex align="center" gap={2} minW={0} px={4} py={3} bg="blackAlpha.200" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100">
                <TeamLogo team={team} size="24px" />
                <Box className="finish-matrix-team-name" minW={0}>
                  <Text fontSize="sm" color="white" fontWeight="black" lineClamp={1}>
                    {teamLabel(team)}
                  </Text>
                  <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">
                    {row.conf} - {row.form}
                  </Text>
                </Box>
              </Flex>
              {row.finish.map((value, index) => (
                <Flex
                  key={`${row.id}-${index}`}
                  align="center"
                  justify="center"
                  minH="54px"
                  bg={heatColor(value, group.accent)}
                  borderBottom="1px solid"
                  borderLeft="1px solid"
                  borderColor="rgba(255,255,255,0.08)"
                >
                  <Text fontSize="sm" color={value >= 12 ? "#06110B" : "white"} fontWeight="black">
                  {value > 0 ? `${value}%` : "-"}
                </Text>
              </Flex>
            ))}
            </Box>
          );
        })}
      </Grid>
    </Box>
  </Box>
);

const MatrixControl = ({ active, disabled = false, children, onClick }) => (
  <Box
    as="button"
    px={3}
    py={1.5}
    borderRadius="full"
    bg={active ? "brand.500" : "whiteAlpha.100"}
    opacity={disabled ? 0.35 : 1}
    cursor={disabled ? "default" : "pointer"}
    onClick={disabled ? undefined : onClick}
  >
    <Text fontSize="9px" color="white" fontWeight="black" textTransform="uppercase">
      {children}
    </Text>
  </Box>
);

const RaceProbabilityMatrix = () => {
  const [conference, setConference] = useState("ALL");
  const [swacScope, setSwacScope] = useState("ALL");

  const visibleGroups = standingsGroups.filter((group) => {
    if (conference === "ALL") return true;
    if (conference === "MEAC") return group.id === "meac";
    if (swacScope === "ALL") return group.id === "swac-east" || group.id === "swac-west";
    return group.id === `swac-${swacScope.toLowerCase()}`;
  });

  return (
    <Flex direction="column" gap={4}>
      <Flex align="end" justify="space-between" gap={4} wrap="wrap">
        <Box>
          <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em" mb={1}>
            Scenario Sheet
          </Text>
          <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={1}>
            Division Finish Probability
          </Text>
        </Box>
        <Flex gap={2} align="center" wrap="wrap" justify="end">
          {["ALL", "MEAC", "SWAC"].map((item) => (
            <MatrixControl
              key={item}
              active={conference === item}
              onClick={() => {
                setConference(item);
                if (item !== "SWAC") setSwacScope("ALL");
              }}
            >
              {item}
            </MatrixControl>
          ))}
          <Flex gap={1} pl={2} borderLeft="1px solid" borderColor="whiteAlpha.200">
            {["ALL", "WEST", "EAST"].map((item) => (
              <MatrixControl
                key={item}
                active={conference === "SWAC" && swacScope === item}
                disabled={conference !== "SWAC"}
                onClick={() => setSwacScope(item)}
              >
                {item}
              </MatrixControl>
            ))}
          </Flex>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr", xl: "repeat(1, minmax(0, 1fr))" }} gap={4}>
        {visibleGroups.map((group) => (
          <DivisionFinishMatrix key={group.id} group={group} />
        ))}
      </Grid>
    </Flex>
  );
};

const StandingsExperimentPage = () => (
  <PageShell listContent={<RaceProbabilityMatrix />}>
    <PageShell.Slot cols={4}>
      <BannerStandings />
    </PageShell.Slot>

    {featureCards.map((card) => (
      <PageShell.Slot key={card.label} cols={1}>
        <Box h="100%" w="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={4} overflow="hidden">
          <Flex h="100%" direction="column" justify="space-between">
            <Text fontSize="10px" color={card.accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">
              {card.label}
            </Text>
            <Box>
              <Text fontSize="2xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.95}>
                {card.value}
              </Text>
              <Text fontSize="xs" color="text.secondary" fontWeight="bold" mt={2}>
                {card.sub}
              </Text>
            </Box>
          </Flex>
        </Box>
      </PageShell.Slot>
    ))}

    {standingsGroups.map((group) => (
      <PageShell.Slot key={group.id} cols={2} rows={2}>
        <DivisionStandingsCard group={group} />
      </PageShell.Slot>
    ))}

    <PageShell.Slot cols={2} rows={2}>
      <GloryRankingsCard />
    </PageShell.Slot>
  </PageShell>
);

export default StandingsExperimentPage;
