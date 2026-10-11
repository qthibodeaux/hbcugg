import { Box, Flex, Text } from "@chakra-ui/react";
import ContentContainer from "../layouts/ContentContainer";

const TABS = [
  { id: "profile",   label: "Profile"   },
  { id: "schedule",  label: "Schedule"  },
  { id: "roster",    label: "Roster"    },
  { id: "coaches",   label: "Coaches"   },
  { id: "wiki",      label: "School Wiki" },
  { id: "standings", label: "Standings" },
  { id: "stats",     label: "Stats"     },
];

const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <Box
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg="bg.primary"
      position="sticky"
      top="var(--app-header-height)"
      zIndex={40}
      overflowX="auto"
      sx={{
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <ContentContainer>
        <Flex gap={1} minW="max-content" px={{ base: 2, md: 0 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Box
                key={tab.id}
                as="button"
                onClick={() => onTabChange(tab.id)}
                px={{ base: 3, md: 4 }}
                py={3}
                position="relative"
                transition="all 0.2s"
                bg={isActive ? "whiteAlpha.50" : "transparent"}
                _hover={{ bg: "whiteAlpha.100" }}
              >
                <Text
                  fontSize="sm"
                  fontWeight={isActive ? "bold" : "medium"}
                  color={isActive ? "brand.500" : "text.secondary"}
                  whiteSpace="nowrap"
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <Box
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    h="2px"
                    bg="brand.500"
                  />
                )}
              </Box>
            );
          })}
        </Flex>
      </ContentContainer>
    </Box>
  );
};

export default TabNavigation;
