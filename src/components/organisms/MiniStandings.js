import { Box, Text, Flex } from "@chakra-ui/react";

const MiniStandings = ({ team }) => {
  if (!team) return null;

  // Determine which standings to show based on team conference
  const isSWAC = team.conference === "SWAC";
  
  const swacEastStandings = [
    { rank: 1, team: "Jackson State", record: "9-1", isCurrent: team.id === "jackson-state" },
    { rank: 2, team: "Florida A&M", record: "8-2", isCurrent: team.id === "florida-am" },
    { rank: 3, team: "Alabama State", record: "7-3", isCurrent: team.id === "alabama-state" },
    { rank: 4, team: "Alabama A&M", record: "6-4", isCurrent: team.id === "alabama-am" },
    { rank: 5, team: "Bethune-Cookman", record: "5-5", isCurrent: team.id === "bethune-cookman" },
  ];

  const meacStandings = [
    { rank: 1, team: "N.C. Central", record: "8-2", isCurrent: team.id === "nccu" },
    { rank: 2, team: "Howard", record: "7-3", isCurrent: team.id === "howard" },
    { rank: 3, team: "Norfolk State", record: "6-4", isCurrent: team.id === "norfolk-state" },
    { rank: 4, team: "Morgan State", record: "5-5", isCurrent: team.id === "morgan-state" },
    { rank: 5, team: "Delaware State", record: "4-6", isCurrent: team.id === "delaware-state" },
  ];

  const standings = isSWAC ? swacEastStandings : meacStandings;
  const title = isSWAC ? "SWAC East Standings" : "MEAC Standings";

  return (
    <Box bg="bg.card" p={5} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100" h="full">
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          <Text fontSize="sm" fontWeight="bold" color="text.primary">{title}</Text>
        </Box>
        <Text fontSize="xs" color="text.muted">Week 11</Text>
      </Flex>

      <Box spaceY={2}>
        {standings.map((s, idx) => (
          <Flex
            key={idx}
            justify="space-between"
            align="center"
            py={1}
            px={2}
            bg={s.isCurrent ? `${team.colors.primary}20` : "transparent"}
            borderRadius="md"
            borderLeft={s.isCurrent ? "3px solid" : "none"}
            borderColor={s.isCurrent ? team.colors.primary : "transparent"}
          >
            <Flex gap={3} align="center">
              <Text fontSize="sm" color={s.isCurrent ? team.colors.primary : "text.muted"} w={4} fontWeight={s.isCurrent ? "bold" : "normal"}>
                {s.rank}
              </Text>
              <Box w={6} h={6} bg="whiteAlpha.200" borderRadius="sm" />
              <Text fontSize="sm" color="text.primary" fontWeight={s.isCurrent ? "bold" : "normal"}>
                {s.team}
              </Text>
            </Flex>
            <Text fontSize="sm" color="text.primary" fontWeight="bold">{s.record}</Text>
          </Flex>
        ))}
      </Box>

      <Text fontSize="xs" color={team.colors.primary} mt={4} textAlign="center" cursor="pointer" _hover={{ textDecoration: "underline" }}>
        View Full Bracket →
      </Text>
    </Box>
  );
};

export default MiniStandings;
