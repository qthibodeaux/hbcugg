import { Box, Text } from "@chakra-ui/react";
import { WeekCentralGameRowJ } from "../../molecules/game/weekRow/WeekCentralGameRow";

const MOCK_ROWS = [
  {
    id: "pvamubcu",
    away: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      logo: "/assets/swacpvamu.svg",
      color: "#4B0082",
      record: "3-2 SWAC",
    },
    home: {
      name: "Bethune-Cookman",
      shortName: "BCU",
      logo: "/assets/swacbcu.svg",
      color: "#6F2633",
      record: "2-3 SWAC",
    },
    awayScore: 17,
    homeScore: 24,
    status: "Final",
    gameName: "SWAC Crossover",
    displayVenue: "Daytona Stadium",
  },
];

export const WeekCentralGameRowJ__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mb={2}>
      Team Gradient Cool - Editorial
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowJ key={row.id} row={row} />
    ))}
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mt={8} mb={2}>
      Compact Score Capsule
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowJ
        key={`${row.id}-compact`}
        row={row}
        variant="compact"
        mb={0}
        selected
      />
    ))}
  </Box>
);

export { WeekCentralGameRowJ } from "../../molecules/game/weekRow/WeekCentralGameRow";
