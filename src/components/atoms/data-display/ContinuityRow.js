import { Box, Flex, Text } from "@chakra-ui/react";

/**
 * ContinuityRow - Team continuity display with grade and percentage
 * @param {Object} props
 * @param {string} props.teamId - Team identifier
 * @param {Object} props.data - Continuity data object
 */
const ContinuityRow = ({ teamId, data }) => {
  const name = teamId; // Would normally use TEAM_BY_V5 lookup
  const gradeColor = {}; // Would normally use GRADE_COLORS lookup
  const pct = Math.round(data.continuity_score * 100);
  
  return (
    <Flex
      align="center" gap={3} py={2}
      borderBottom="1px solid" borderColor="whiteAlpha.50"
      _last={{ borderBottom: "none" }}
    >
      <Text fontSize="sm" color="text.secondary" flex={1}>{name}</Text>
      <Box w={24} bg="whiteAlpha.100" borderRadius="full" h="6px" overflow="hidden">
        <Box bg={gradeColor[data.continuity_grade] ?? "text.muted"} h="100%" w={`${pct}%`} borderRadius="full" />
      </Box>
      <Text fontSize="sm" fontWeight="bold" color={gradeColor[data.continuity_grade] ?? "text.muted"} w={6} textAlign="right">{data.continuity_grade}</Text>
      <Text fontSize="xs" color="text.muted" w={8} textAlign="right">{pct}%</Text>
    </Flex>
  );
};

export default ContinuityRow;
