import { Box, Text, Flex } from "@chakra-ui/react";

/**
 * DriveLog - Game drive log with play-by-play summary
 * @param {Object} props
 * @param {Array} props.drives - Array of drive data
 * @param {string} props.awayId - Away team ID
 * @param {string} props.homeId - Home team ID
 * @param {string} props.awayShort - Away team short name
 * @param {string} props.homeShort - Home team short name
 */
const DriveLog = ({ drives, awayId, homeId, awayShort, homeShort }) => (
  <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
    {/* Header */}
    <Flex px={5} py={3} bg="whiteAlpha.50" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="sm" fontWeight="bold" color="text.primary">Drive Log</Text>
    </Flex>
    
    {/* Drives */}
    {drives.map((drive, i) => {
      const isAway = drive.team === awayId;
      const teamShort = isAway ? awayShort : homeShort;
      const teamColor = isAway ? "brand.400" : "green.400";
      
      return (
        <Box key={i} px={5} py={3} borderBottom={i < drives.length - 1 ? "1px solid" : "none"} borderColor="whiteAlpha.100">
          <Flex justify="space-between" align="center" mb={2}>
            <Flex align="center" gap={2}>
              <Text fontSize="xs" fontWeight="bold" color={teamColor}>
                {teamShort} Drive {drive.drive_number}
              </Text>
              <Text fontSize="9px" color="text.muted">
                {drive.start_period} · {drive.start_time}
              </Text>
            </Flex>
            <Text fontSize="xs" fontWeight="bold" color="text.primary">
              {drive.result === "TD" ? "TOUCHDOWN" : drive.result === "FG" ? "FIELD GOAL" : drive.result}
            </Text>
          </Flex>
          
          <Flex gap={4} fontSize="9px" color="text.secondary">
            <Text>
              {drive.start_yard_line} → {drive.end_yard_line}
            </Text>
            <Text>
              {drive.plays} plays, {drive.yards} yards
            </Text>
            <Text>
              {drive.duration}
            </Text>
          </Flex>
          
          {drive.score && (
            <Text fontSize="xs" color={teamColor} fontWeight="bold" mt={1}>
              {drive.score}
            </Text>
          )}
        </Box>
      );
    })}
  </Box>
);

export default DriveLog;
