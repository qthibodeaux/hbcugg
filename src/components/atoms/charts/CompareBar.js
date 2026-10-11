import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * CompareBar - Player vs league comparison bar
 * @param {Object} props
 * @param {string} props.label - Label for the metric
 * @param {number} props.playerVal - Player's value
 * @param {number} props.leagueVal - League average value
 * @param {string} props.color - Color for player bar (default: "#E53E3E")
 */
const CompareBar = ({ label, playerVal, leagueVal, color = "#E53E3E" }) => {
  const max = Math.max(playerVal, leagueVal) * 1.2 || 1;
  const pWidth = `${(playerVal / max) * 100}%`;
  const lWidth = `${(leagueVal / max) * 100}%`;

  return (
    <Box mb={4}>
      <Flex justify="space-between" mb={1}>
        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
        <Flex gap={3}>
          <Text fontSize="xs" fontWeight="bold" color="white">{playerVal}</Text>
          <Text fontSize="xs" color="text.muted">{leagueVal}</Text>
        </Flex>
      </Flex>
      <Box mb={1}>
        <Box h="5px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
          <Box h="100%" w={pWidth} bg={color} transition="width 0.4s ease" />
        </Box>
      </Box>
      <Box>
        <Box h="5px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
          <Box h="100%" w={lWidth} bg="whiteAlpha.200" transition="width 0.4s ease" />
        </Box>
      </Box>
    </Box>
  );
};

export default CompareBar;
