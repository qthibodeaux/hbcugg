import { Box, Text, Flex } from "@chakra-ui/react";

// Grambling State colors
const PRIMARY = "#000000"; // Black
const SECONDARY = "#FDB913"; // Gold

export const GSUIdentitySplitCard = () => (
  <Flex
    direction="column"
    w="full"
    h="full"
    borderRadius="md"
    overflow="hidden"
    border="1px solid"
    borderColor="whiteAlpha.100"
    boxShadow="md"
    fontFamily="heading"
    fontWeight={900}
    fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
    letterSpacing="0.08em"
    textTransform="uppercase"
    lineHeight={1}
  >
    {/* Top half: Black bg, Gold text */}
    <Box
      flex={1}
      bg={PRIMARY}
      color={SECONDARY}
      display="flex"
      alignItems="flex-end"
      justifyContent="center"
      pb={0}
    >
      <Text
        lineHeight={1}
        mb={-1.5}
      >
        GSU
      </Text>
    </Box>
    {/* Bottom half: Gold bg, Black text */}
    <Box
      flex={1}
      bg={SECONDARY}
      color={PRIMARY}
      display="flex"
      alignItems="flex-start"
      justifyContent="center"
      pt={0}
    >
      <Text
        lineHeight={1}
        mt={0}
        style={{
          position: "relative",
          bottom: "18px",
        }}
      >
        Tigers
      </Text>
    </Box>
  </Flex>
);
