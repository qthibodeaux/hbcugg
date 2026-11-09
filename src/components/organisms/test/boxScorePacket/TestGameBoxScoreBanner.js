import teamsData from "../../../../data/teams.json";
import { Box, Text, Grid, Flex, Image } from "@chakra-ui/react";

const TEAM_META = teamsData.teams.reduce((acc, team) => {
  acc[team.id] = team;
  acc[team.exportId] = team;
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (id) => TEAM_META[id] ?? {};

const getTeamLabel = (id) => getTeam(id).shortName ?? String(id ?? "TM").toUpperCase();

const getTeamName = (id) => getTeam(id).name ?? getTeamLabel(id);

const getTeamLogo = (id) => getTeam(id).logo ?? `/assets/${String(id ?? "").replace(/25$/, "")}.svg`;

const getTeamColor = (id, fallback = "#E53E3E") => getTeam(id).colors?.primary ?? fallback;

export const BoxScoreBanner = ({ game }) => {
  const meta = game?.metadata ?? {};
  const awayId = typeof meta.away_team === "string" ? meta.away_team : (meta.away_team?.id || meta.away_team?.team_id || "");
  const homeId = typeof meta.home_team === "string" ? meta.home_team : (meta.home_team?.id || meta.home_team?.team_id || "");
  const awayScore = game?.final_score?.away ?? meta.away_points ?? 0;
  const homeScore = game?.final_score?.home ?? meta.home_points ?? 0;
  const winner = awayScore > homeScore ? awayId : homeId;
  const awayColor = getTeamColor(awayId, "#4B0082");
  const homeColor = getTeamColor(homeId, "#002147");

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" bg="#08080A" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}55 0%, #08080A 34%, #08080A 66%, ${homeColor}55 100%)`} />
      <Text position="absolute" left="50%" top="-7%" transform="translateX(-50%)" fontSize="clamp(4.5rem, 13vw, 11rem)" fontWeight="black" lineHeight={0.8} color="whiteAlpha.100" textTransform="uppercase" whiteSpace="nowrap">
        Final
      </Text>
      <Grid position="relative" zIndex={1} templateColumns={{ base: "1fr", lg: "minmax(0,1fr) 190px minmax(0,1fr)" }} alignItems="center" gap={6} px={{ base: 5, lg: 8 }} py={5}>
        <Flex align="center" gap={4} minW={0}>
          <Image src={getTeamLogo(awayId)} alt="" h="clamp(56px, 8vw, 104px)" objectFit="contain" />
          <Box minW={0}>
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Away</Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">{getTeamLabel(awayId)}</Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>{getTeamName(awayId)}</Text>
          </Box>
          <Text fontSize="clamp(3rem, 7vw, 6.2rem)" color="white" fontWeight="black" lineHeight={0.85} ml="auto">{awayScore}</Text>
        </Flex>

        <Flex direction="column" align="center" gap={3}>
          <Box px={3} py={1} bg="brand.500" borderRadius="sm">
            <Text fontSize="10px" color="white" fontWeight="black" textTransform="uppercase" letterSpacing="0.16em">Final</Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black" textTransform="uppercase">{getTeamLabel(winner)} by {Math.abs(awayScore - homeScore)}</Text>
          <Text fontSize="10px" color="whiteAlpha.600" textAlign="center" lineClamp={2}>{meta.date} | {meta.site}</Text>
        </Flex>

        <Flex align="center" gap={4} direction="row-reverse" minW={0}>
          <Image src={getTeamLogo(homeId)} alt="" h="clamp(56px, 8vw, 104px)" objectFit="contain" />
          <Box minW={0} textAlign="right">
            <Text fontSize="10px" color="whiteAlpha.600" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">Home</Text>
            <Text fontSize="clamp(1.8rem, 5vw, 4.2rem)" color="white" fontWeight="black" lineHeight={0.9} textTransform="uppercase" lineClamp={1} whiteSpace="nowrap">{getTeamLabel(homeId)}</Text>
            <Text fontSize="xs" color="whiteAlpha.700" lineClamp={1}>{getTeamName(homeId)}</Text>
          </Box>
          <Text fontSize="clamp(3rem, 7vw, 6.2rem)" color="white" fontWeight="black" lineHeight={0.85} mr="auto">{homeScore}</Text>
        </Flex>
      </Grid>
      <Flex position="relative" zIndex={1} justify="space-between" align="center" gap={4} px={{ base: 5, lg: 8 }} pb={5} wrap="wrap">
        <Flex gap={2} wrap="wrap">
          {["Game Summary", "Box Score", "Play By Play", "Team Stats"].map((tab) => (
            <Box key={tab} px={3} py={2} border="1px solid" borderColor={tab === "Box Score" ? "brand.500" : "whiteAlpha.100"} bg={tab === "Box Score" ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"} borderRadius="sm">
              <Text fontSize="10px" color={tab === "Box Score" ? "white" : "text.muted"} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">{tab}</Text>
            </Box>
          ))}
        </Flex>
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em">
          Attendance {meta.attendance?.toLocaleString?.() ?? "-"} | Kick {meta.kickoff_time ?? "-"}
        </Text>
      </Flex>
    </Box>
  );
};
