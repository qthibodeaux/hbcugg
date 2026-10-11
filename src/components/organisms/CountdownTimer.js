import { Box, Text, Flex } from "@chakra-ui/react";
import { Clock } from "lucide-react";

const CountdownTimer = ({ team }) => {
  if (!team) return null;

  // Mock countdown - in real version this would calculate from game time
  const timeLeft = {
    days: 3,
    hours: 14,
    minutes: 32,
  };

  const opponent = {
    name: "Florida A&M",
    shortName: "FAMU",
    record: "8-2",
    rank: "#8",
  };

  return (
    <Box bg="bg.card" p={6} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
      <Flex align="center" gap={2} mb={4}>
        <Clock size={18} color={team.colors.primary} />
        <Text fontSize="sm" fontWeight="bold" color="text.primary">Next Game Countdown</Text>
      </Flex>

      {/* Opponent Preview */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="xs" color="text.muted">VS</Text>
          <Text fontSize="xl" fontWeight="black" color="white">{opponent.name}</Text>
          <Text fontSize="sm" color={team.colors.primary}>{opponent.rank} • {opponent.record}</Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xs" color="text.muted">Sat, Nov 16</Text>
          <Text fontSize="lg" fontWeight="bold" color="white">7:00 PM ET</Text>
          <Text fontSize="xs" color="text.muted">Bragg Memorial Stadium</Text>
        </Box>
      </Flex>

      {/* Timer */}
      <Flex justify="center" gap={4}>
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Mins" },
        ].map((unit, idx) => (
          <Box key={idx} textAlign="center">
            <Box
              bg="bg.secondary"
              px={4}
              py={3}
              borderRadius="lg"
              minW="70px"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="3xl" fontWeight="black" color={team.colors.primary}>
                {String(unit.value).padStart(2, "0")}
              </Text>
            </Box>
            <Text fontSize="xs" color="text.muted" mt={1}>{unit.label}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default CountdownTimer;
