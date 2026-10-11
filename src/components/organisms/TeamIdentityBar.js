import { Box, Text, Flex, Container } from "@chakra-ui/react";
import { MapPin, Building2, PawPrint, Calendar, Users } from "lucide-react";

const TeamIdentityBar = ({ team }) => {
  if (!team) return null;

  const items = [
    { icon: Calendar, label: "Founded", value: "1877" },
    { icon: Building2, label: "Stadium", value: team.stadium },
    { icon: MapPin, label: "Location", value: team.location },
    { icon: PawPrint, label: "Mascot", value: team.mascot },
    { icon: Users, label: "Capacity", value: "60,492" },
  ];

  return (
    <Box bg="bg.card" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Container maxW="1400px" px={{ base: 4, md: 8 }}>
        <Flex 
          justify="space-between" 
          py={4}
          overflowX="auto"
          gap={6}
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {items.map((item, idx) => (
            <Flex key={idx} align="center" gap={3} minW="fit-content">
              <Box
                p={2}
                bg={`${team.colors.primary}20`}
                borderRadius="md"
                color={team.colors.primary}
              >
                <item.icon size={18} />
              </Box>
              <Box>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase">{item.label}</Text>
                <Text fontSize="sm" fontWeight="semibold" color="text.primary">{item.value}</Text>
              </Box>
            </Flex>
          ))}
        </Flex>
      </Container>
    </Box>
  );
};

export default TeamIdentityBar;
