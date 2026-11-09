import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { TEAM_BY_ID, standingsGroups } from "../../../../data/standingsExperiment";
import { TeamLogo, teamLabel, heatColor } from "./StandingsPrimitives";
import { useState } from "react";

// Finish matrix and its local conference/division controls. Fixture probabilities are unchanged.

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

export const RaceProbabilityMatrix = () => {
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
