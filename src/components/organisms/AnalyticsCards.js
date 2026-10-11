import { Box, Text, Flex, SimpleGrid, Container } from "@chakra-ui/react";
import { TrendingUp, Shield, Target, Star } from "lucide-react";

// Mock data for charts
const OFFENSE_DATA = [65, 72, 78, 85, 82, 88, 94];
const DEFENSE_DATA = [78, 75, 82, 79, 85, 87, 89];

const AnalyticsCards = ({ team }) => {
  if (!team) return null;

  const cards = [
    {
      icon: TrendingUp,
      label: "Offense Efficiency",
      value: "94.2",
      change: "+4.2%",
      changeType: "positive",
      chart: OFFENSE_DATA,
      color: "brand.500",
    },
    {
      icon: Shield,
      label: "Defense Efficiency",
      value: "88.7",
      change: "+2.1%",
      changeType: "positive",
      chart: DEFENSE_DATA,
      color: "blue.500",
    },
    {
      icon: Target,
      label: "Scoring Margin",
      value: "+24.5",
      subtext: "1st in Conf",
      color: "yellow.500",
    },
    {
      icon: Star,
      label: "Recruiting Rank",
      value: "Elite",
      subtext: "#1 HBCU",
      stars: 5,
      color: "purple.500",
    },
  ];

  return (
    <Container maxW="1400px" px={{ base: 4, md: 8 }} py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">
            Team Efficiency
          </Text>
          <Text fontSize="lg" fontWeight="bold" color={team.colors.primary}>
            Analytics
          </Text>
        </Box>
        <Text fontSize="xs" color="text.muted">Season 2025 Performance</Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
        {cards.map((card, idx) => (
          <Box
            key={idx}
            bg="bg.card"
            p={5}
            borderRadius="lg"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _hover={{ borderColor: card.color }}
            transition="all 0.2s"
          >
            <Flex justify="space-between" align="flex-start" mb={4}>
              <Box
                p={2}
                bg={`${card.color}20`}
                borderRadius="md"
                color={card.color}
              >
                <card.icon size={20} />
              </Box>
              {card.change && (
                <Text
                  fontSize="xs"
                  color={card.changeType === "positive" ? "green.500" : "red.500"}
                >
                  {card.change}
                </Text>
              )}
            </Flex>

            <Text fontSize="3xl" fontWeight="black" color="white" mb={1}>
              {card.value}
            </Text>

            <Text fontSize="sm" color="text.muted" mb={3}>
              {card.label}
            </Text>

            {card.chart && (
              <Flex align="flex-end" gap={1} h={10}>
                {card.chart.map((h, i) => (
                  <Box
                    key={i}
                    flex={1}
                    h={`${h}%`}
                    bg={i === card.chart.length - 1 ? card.color : "whiteAlpha.300"}
                    borderRadius="sm"
                  />
                ))}
              </Flex>
            )}

            {card.subtext && (
              <Text fontSize="xs" color={card.color} fontWeight="semibold">
                {card.subtext}
              </Text>
            )}

            {card.stars && (
              <Flex gap={1}>
                {[...Array(card.stars)].map((_, i) => (
                  <Text key={i} fontSize="sm" color="yellow.500">★</Text>
                ))}
              </Flex>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default AnalyticsCards;
