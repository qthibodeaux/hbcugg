import { Box, Flex, Image, Text } from "@chakra-ui/react";
import teamsData from "../../../data/teams.json";

const teamByV5Id = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (row) => row?.team ?? teamByV5Id[row?.teamId] ?? teamByV5Id[row?.id];
const getTeamLogo = (team) => team?.logo ?? (team?.exportId ? `/assets/${team.exportId.replace(/25$/, "")}.svg` : null);
const getTeamLabel = (team, fallback = "TEAM") => team?.bannerShort ?? team?.shortName ?? team?.name ?? fallback;
const getDisplayRecord = (row, metric = "conference") => {
  if (metric === "overall") return row?.record ?? `${row?.wins ?? 0}-${row?.losses ?? 0}`;
  return row?.confRecord ?? `${row?.confWins ?? row?.cw ?? 0}-${row?.confLosses ?? row?.cl ?? 0}`;
};

// Compact mobile standings card — separate build from TopThreeStandingsCard.
// The desktop card's clamp() floor still assumes a ~300px+ slot; a mobile
// half-column (~160px) made long names (e.g. "Prairie View A&M") wrap and
// overflow the card. Every label here is forced to one line with minW=0 so
// it truncates instead of pushing past the edge.
export const TopThreeStandingsCardMobile = ({ title, rows = [], metric = "conference" }) => {
  const top = rows[0];
  const topTeam = getTeam(top);
  const chaseRows = rows.slice(1, 3);

  if (!top || !topTeam) return null;

  const accent = topTeam?.colors?.primary ?? "#E53E3E";
  const topLogo = getTeamLogo(topTeam);

  return (
    <Box borderRadius="0" border="1px solid" borderColor="whiteAlpha.100" bg="#111114" overflow="hidden" p="0.55rem">
      <Text fontSize="0.5rem" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
        {title} Leader
      </Text>

      <Flex align="center" gap="0.4rem" mt="0.3rem" minW={0}>
        {topLogo && <Image src={topLogo} w="1.6rem" h="1.6rem" objectFit="contain" flexShrink={0} />}
        <Text flex="1" minW={0} fontSize="0.9rem" fontWeight="black" color="white" textTransform="uppercase" lineClamp={1} lineHeight={1.05}>
          {getTeamLabel(topTeam, top.shortName)}
        </Text>
        <Text fontSize="0.65rem" fontWeight="black" color={accent} flexShrink={0}>
          {getDisplayRecord(top, metric)}
        </Text>
      </Flex>

      <Flex direction="column" gap="0.3rem" mt="0.45rem">
        {chaseRows.map((row, index) => {
          const team = getTeam(row);
          const logo = getTeamLogo(team);
          return (
            <Flex key={`${title}-${row.teamId}-${index}`} align="center" gap="0.35rem" minW={0}>
              <Text fontSize="0.6rem" fontWeight="black" color="text.muted" flexShrink={0} w="0.7rem">
                {index + 2}
              </Text>
              {logo && <Image src={logo} w="1.1rem" h="1.1rem" objectFit="contain" flexShrink={0} />}
              <Text flex="1" minW={0} fontSize="0.7rem" fontWeight="black" color="text.secondary" textTransform="uppercase" lineClamp={1}>
                {getTeamLabel(team, row.shortName)}
              </Text>
              <Text fontSize="0.7rem" fontWeight="black" color="white" flexShrink={0}>
                {getDisplayRecord(row, metric)}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
