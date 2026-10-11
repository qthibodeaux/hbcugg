import { Box, Flex, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const SidebarTabs = ({ tabs = [], sectionLabel = "Sections" }) => {
  return (
    <Box p={4}>
      <Text
        fontSize="10px"
        color="text.muted"
        textTransform="uppercase"
        letterSpacing="0.12em"
        mb={3}
      >
        {sectionLabel}
      </Text>

      <Box h="1px" bg="whiteAlpha.200" mb={3} />

      <Flex direction="column" gap={1}>
        {tabs.map((tab) => {
          const isLinkTab = Boolean(tab.to) && !tab.disabled;

          if (!isLinkTab) {
            return (
              <Box
                key={tab.id}
                px={3}
                py={2}
                borderRadius="md"
                opacity={0.5}
                bg="whiteAlpha.100"
                borderLeft="2px solid"
                borderColor="whiteAlpha.200"
              >
                <Text
                  fontSize="xs"
                  color="text.secondary"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  fontWeight="bold"
                >
                  {tab.label}
                </Text>
              </Box>
            );
          }

          return (
            <Box
              key={tab.id}
              as={NavLink}
              to={tab.to}
              end={tab.end ?? false}
              px={3}
              py={2.5}
              borderRadius="md"
              borderLeft="2px solid"
              borderColor="transparent"
              _hover={{ bg: "whiteAlpha.100", borderColor: "whiteAlpha.300" }}
              _activeLink={{ bg: "brand.500", color: "white", borderColor: "brand.300" }}
            >
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.08em"
                fontWeight="bold"
              >
                {tab.label}
              </Text>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default SidebarTabs;
