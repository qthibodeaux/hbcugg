import { useMemo } from "react";
import { buildDefenseData } from "../../../utils/gameBoxScore/defenseModel";
import { useLayoutDensity, LAYOUT_DENSITY } from "../../../hooks/useLayoutDensity";
import { Flex, Text, Box } from "@chakra-ui/react";
import { DefensePanel } from "./qGameBoxScore/DefensePanel";
import { buildPassingData } from "../../../utils/gameBoxScore/passingModel";
import { PassingPanel } from "./qGameBoxScore/PassingPanel";
import { useLeagueAverages, useTeamSeasonAvg, useTeamDefenseAvg } from "../../../hooks/useSWACData";
import { buildRushingData } from "../../../utils/gameBoxScore/rushingModel";
import { RushingPanel } from "./qGameBoxScore/RushingPanel";

// Compatibility entry and lab composition. Production callers import models from utils/gameBoxScore.

const buildAvatarMap = (players) => {
  const map = {};
  if (!Array.isArray(players)) return map;
  players.forEach((p) => {
    if (!p.image_url) return;
    const match = p.image_url.match(/\/([^/]+)\.(png|jpg|jpeg)/i);
    if (!match) return;
    const filename = match[1];
    const withoutNum = filename.replace(/^\d+_/, "");
    const parts = withoutNum.split("_").filter(Boolean);
    if (parts.length < 2) return;
    const lastName = parts[0].toLowerCase();
    const firstName = parts.slice(1).join("").toLowerCase();
    map[`${lastName},${firstName}`] = p.image_url;
  });
  return map;
};

const DefenseModule = ({ game, isCompact: isCompactProp }) => {
  const meta = game?.metadata ?? {};
  const awayId = typeof meta.away_team === "string" ? meta.away_team : meta.away_team?.id;
  const homeId = typeof meta.home_team === "string" ? meta.home_team : meta.home_team?.id;

  const awayDefense = useMemo(() => buildDefenseData(game, awayId), [game, awayId]);
  const homeDefense = useMemo(() => buildDefenseData(game, homeId), [game, homeId]);

  const { density } = useLayoutDensity();
  const isCompact = isCompactProp ?? density !== LAYOUT_DENSITY.STANDARD;

  if (!awayDefense || !homeDefense) {
    return (
      <Flex w="full" h="full" align="center" justify="center" bg="bg.secondary" borderRadius="lg" border="1px solid whiteAlpha.100">
        <Text color="text.muted" fontSize="sm">No defensive data</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      w="full"
      h="full"
      bg="bg.secondary"
      borderRadius="lg"
      overflow="hidden"
      border="1px solid whiteAlpha.100"
    >
      <Box
        flex={1}
        borderRight={{ base: "none", md: "1px solid whiteAlpha.100" }}
        borderBottom={{ base: "1px solid whiteAlpha.100", md: "none" }}
        minH={0}
      >
        <DefensePanel data={awayDefense} isCompact={isCompact} />
      </Box>
      <Box flex={1} minH={0}>
        <DefensePanel data={homeDefense} isCompact={isCompact} />
      </Box>
    </Flex>
  );
};

const QGameBoxScore = ({ game, playerSeasons = [], isCompact: isCompactProp }) => {
  const avatarMap = useMemo(() => buildAvatarMap(playerSeasons), [playerSeasons]);

  const meta = game?.metadata ?? {};
  const awayId = typeof meta.away_team === "string" ? meta.away_team : meta.away_team?.id;
  const homeId = typeof meta.home_team === "string" ? meta.home_team : meta.home_team?.id;

  const awayPassing = useMemo(() => buildPassingData(game, awayId), [game, awayId]);
  const homePassing = useMemo(() => buildPassingData(game, homeId), [game, homeId]);

  const { density } = useLayoutDensity();
  const isCompact = isCompactProp ?? density !== LAYOUT_DENSITY.STANDARD;

  if (!awayPassing || !homePassing) {
    return (
      <Flex w="full" h="full" align="center" justify="center" bg="bg.secondary" borderRadius="lg" border="1px solid whiteAlpha.100">
        <Text color="text.muted" fontSize="sm">No passing data</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      w="full"
      h="full"
      bg="bg.secondary"
      borderRadius="lg"
      overflow="hidden"
      border="1px solid whiteAlpha.100"
    >
      <Box
        flex={1}
        borderRight={{ base: "none", md: "1px solid whiteAlpha.100" }}
        borderBottom={{ base: "1px solid whiteAlpha.100", md: "none" }}
        minH={0}
      >
        <PassingPanel data={awayPassing} avatarMap={avatarMap} isCompact={isCompact} />
      </Box>
      <Box flex={1} minH={0}>
        <PassingPanel data={homePassing} avatarMap={avatarMap} isCompact={isCompact} />
      </Box>
    </Flex>
  );
};

const RushingModule = ({ game, playerSeasons = [], isCompact: isCompactProp }) => {
  const avatarMap = useMemo(() => buildAvatarMap(playerSeasons), [playerSeasons]);

  const meta = game?.metadata ?? {};
  const awayId = typeof meta.away_team === "string" ? meta.away_team : meta.away_team?.id;
  const homeId = typeof meta.home_team === "string" ? meta.home_team : meta.home_team?.id;
  const season = Number(meta.season) || 2025;

  // Fetch league + team season averages for contextual grading
  const { data: leagueAvg } = useLeagueAverages(season);
  const { data: awayOffAvg } = useTeamSeasonAvg(awayId, season);
  const { data: homeOffAvg } = useTeamSeasonAvg(homeId, season);
  const { data: awayDefAvg } = useTeamDefenseAvg(awayId, season);
  const { data: homeDefAvg } = useTeamDefenseAvg(homeId, season);

  const awayRushing = useMemo(
    () => buildRushingData(game, awayId, leagueAvg, awayOffAvg, homeDefAvg),
    [game, awayId, leagueAvg, awayOffAvg, homeDefAvg]
  );
  const homeRushing = useMemo(
    () => buildRushingData(game, homeId, leagueAvg, homeOffAvg, awayDefAvg),
    [game, homeId, leagueAvg, homeOffAvg, awayDefAvg]
  );

  const { density } = useLayoutDensity();
  const isCompact = isCompactProp ?? density !== LAYOUT_DENSITY.STANDARD;

  if (!awayRushing || !homeRushing) {
    return (
      <Flex w="full" h="full" align="center" justify="center" bg="bg.secondary" borderRadius="lg" border="1px solid whiteAlpha.100">
        <Text color="text.muted" fontSize="sm">No rushing data</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      w="full"
      h="full"
      bg="bg.secondary"
      borderRadius="lg"
      overflow="hidden"
      border="1px solid whiteAlpha.100"
    >
      <Box
        flex={1}
        borderRight={{ base: "none", md: "1px solid whiteAlpha.100" }}
        borderBottom={{ base: "1px solid whiteAlpha.100", md: "none" }}
        minH={0}
      >
        <RushingPanel data={awayRushing} avatarMap={avatarMap} isCompact={isCompact} />
      </Box>
      <Box flex={1} minH={0}>
        <RushingPanel data={homeRushing} avatarMap={avatarMap} isCompact={isCompact} />
      </Box>
    </Flex>
  );
};

export { getTeamColor, getTeamSecondary, getTeamName, getTeamDisplayName } from "../../../utils/gameBoxScore/teamIdentity";
export { getLastNameOnly } from "../../../utils/gameBoxScore/statHelpers";
export { buildPassingData } from "../../../utils/gameBoxScore/passingModel";

QGameBoxScore.Passing = QGameBoxScore;
QGameBoxScore.Rushing = RushingModule;
QGameBoxScore.Defense = DefenseModule;
QGameBoxScore.buildAvatarMap = buildAvatarMap;

export default QGameBoxScore;
