import { Box } from "@chakra-ui/react";

const PlayerDetailSidebar = ({
  tabs,
  activeTab,
  setActiveTab,
}) => (
  <Box
    position={{ base: "static", md: "sticky" }}
    top={{ base: "auto", md: "84px" }}
  >
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <Box
          key={id}
          as="button"
          onClick={() => setActiveTab(id)}
          w="100%"
          px={4}
          py={4}
          borderLeft="3px solid"
          borderLeftColor={activeTab === id ? "brand.500" : "transparent"}
          bg={activeTab === id ? "whiteAlpha.100" : "transparent"}
          color={activeTab === id ? "white" : "text.secondary"}
          display="flex"
          alignItems="center"
          gap={3}
          textAlign="left"
          textTransform="uppercase"
          letterSpacing="0.08em"
          fontSize="xs"
          fontWeight={activeTab === id ? "bold" : "medium"}
          _hover={{ bg: "whiteAlpha.100", color: "white" }}
          transition="all 0.15s"
        >
          <Icon size={13} />
          {label}
        </Box>
      ))}
    </Box>
  </Box>
);

export default PlayerDetailSidebar;
