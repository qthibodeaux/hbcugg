import { Box, Flex, Text } from "@chakra-ui/react";

// Vertical stepper rail — mixes two ideas instead of a horizontal tab bar:
// a left-edge icon rail (breaks from "tabs" as a concept entirely) and a
// connected progression (steps joined by a line, like the Class Timeline
// stepper already built for Bio) instead of four equal, unordered buttons.
// Reused by both PlayerStatsTab and PlayerAdvancedTab so the two pages read
// as one system rather than two different navigation languages.
const ViewRail = ({ views, active, onChange, primary }) => {
  const activeIndex = views.findIndex((v) => v.key === active);

  return (
    <Flex direction="column" py={6} px={4} borderRight="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
      {views.map((v, i) => {
        const Icon = v.icon;
        const isActive = v.key === active;
        const isPast = i < activeIndex;
        const isLit = isActive || isPast;

        return (
          <Flex key={v.key} direction="column">
            <Box
              as="button"
              type="button"
              onClick={() => onChange(v.key)}
              display="flex"
              alignItems="center"
              gap={2.5}
              bg="transparent"
              border="none"
              cursor="pointer"
              py={1.5}
              _hover={{ opacity: 0.85 }}
            >
              <Flex
                w="30px"
                h="30px"
                align="center"
                justify="center"
                borderRadius="full"
                bg={isLit ? primary : "whiteAlpha.100"}
                border={isActive ? "2px solid" : "none"}
                borderColor="white"
                flexShrink={0}
              >
                {Icon && <Icon size={14} color={isLit ? "white" : "rgba(255,255,255,0.4)"} />}
              </Flex>
              <Text
                fontSize="11px"
                fontWeight={isActive ? "black" : "700"}
                color={isActive ? "white" : "text.muted"}
                textTransform="uppercase"
                letterSpacing="0.02em"
                whiteSpace="nowrap"
              >
                {v.label}
              </Text>
            </Box>
            {i < views.length - 1 && <Box w="2px" h="18px" ml="14px" bg={isPast ? primary : "whiteAlpha.150"} />}
          </Flex>
        );
      })}
    </Flex>
  );
};

export default ViewRail;
