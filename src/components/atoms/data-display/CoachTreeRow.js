import { Box, Flex, Text } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import ArcPill from "./ArcPill";

/**
 * CoachTreeRow - Coaching tree entry with position progression
 * @param {Object} props
 * @param {Object} props.coach - Coach data object
 */
const CoachTreeRow = ({ coach }) => {
  const arc = coach.arc?.arc_type ?? "stable";
  const positions = coach.arc?.positions ?? [];
  
  return (
    <Flex
      align="center" gap={3} py={3}
      borderBottom="1px solid" borderColor="whiteAlpha.50"
      _last={{ borderBottom: "none" }}
      flexWrap="wrap"
    >
      <Box flex={1} minW={0}>
        <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>{coach.name}</Text>
        <Flex gap={1} align="center" mt="2px" flexWrap="wrap">
          {positions.slice(0, 4).map((p, i) => (
            <Flex key={i} align="center" gap={1}>
              {i > 0 && <ArrowRight size={9} color="var(--chakra-colors-text-muted)" />}
              <Text fontSize="xs" color="text.secondary">{p}</Text>
            </Flex>
          ))}
          {positions.length > 4 && (
            <Text fontSize="xs" color="text.muted">+{positions.length - 4}</Text>
          )}
        </Flex>
      </Box>
      <ArcPill arc={arc} />
    </Flex>
  );
};

export default CoachTreeRow;
