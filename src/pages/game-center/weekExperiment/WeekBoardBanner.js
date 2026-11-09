import { Box, Text, Grid, Flex } from "@chakra-ui/react";
import { SEASONS } from "./experimentModel";

export const WeekBoardBanner = ({ season, setSeason, week, setWeek, weeks, slate }) => (
  <Box
    h="100%"
    w="full"
    position="relative"
    overflow="hidden"
    borderRadius="2xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="linear-gradient(112deg, #E53E3E 0%, #9B1C1C 30%, #151115 62%, #0B0B0D 100%)"
  >
    <Text
      position="absolute"
      bottom="-26px"
      left="0"
      fontSize="clamp(80px, 16vw, 178px)"
      lineHeight={1}
      fontWeight="black"
      fontStyle="italic"
      color="white"
      opacity={0.045}
      textTransform="uppercase"
      letterSpacing="-0.05em"
      pointerEvents="none"
    >
      CENTRAL
    </Text>

    <Grid h="100%" position="relative" templateColumns="1fr 380px">
      <Flex direction="column" justify="center" pl={8} pr={6} minW={0}>
        <Flex align="end" gap={3}>
          <Text
            fontSize="clamp(2.2rem, 5.4vw, 6rem)"
            color="white"
            fontWeight="black"
            fontStyle="italic"
            textTransform="uppercase"
            lineHeight={0.82}
            whiteSpace="nowrap"
          >
            WEEK CENTRAL
          </Text>
          <Box bg="white" px={3} py={1} borderRadius="md" mb="6px" flexShrink={0}>
            <Text fontSize="xl" color="#E53E3E" fontWeight="black" lineHeight={1}>
              {String(week).padStart(2, "0")}
            </Text>
          </Box>
        </Flex>

        <Flex align="center" gap={3} mt={3}>
          <Box h="1px" w="28px" bg="rgba(255,255,255,0.3)" flexShrink={0} />
          <Text fontSize="9px" color="rgba(255,255,255,0.58)" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
            Weekly HBCU scoreboard board
          </Text>
          <Box w="1px" h="10px" bg="rgba(255,255,255,0.2)" flexShrink={0} />
          <Text fontSize="9px" color="rgba(255,255,255,0.32)" fontWeight="black" textTransform="uppercase" letterSpacing="0.15em">
            {slate.length} games on the slate
          </Text>
        </Flex>
      </Flex>

      <Flex direction="column" justify="center" px={6} borderLeft="1px solid" borderColor="whiteAlpha.200">
        <Text fontSize="8px" color="rgba(255,255,255,0.35)" fontWeight="black" textTransform="uppercase" letterSpacing="0.22em" mb={3}>
          Board Controls
        </Text>
        <Flex gap={2} wrap="wrap">
          {SEASONS.map((item) => (
            <Box
              key={item}
              as="button"
              onClick={() => setSeason(item)}
              px={2.5}
              py={1}
              borderRadius="sm"
              border="1px solid"
              borderColor={season === item ? "rgba(255,255,255,0.55)" : "transparent"}
              bg={season === item ? "rgba(255,255,255,0.18)" : "transparent"}
              cursor="pointer"
            >
              <Text fontSize="9px" color={season === item ? "white" : "rgba(255,255,255,0.34)"} fontWeight="black">
                {item}
              </Text>
            </Box>
          ))}
        </Flex>
        <Flex mt={3} gap={1.5} wrap="wrap" maxH="58px" overflow="hidden">
          {weeks.map((item) => (
            <Box
              key={item}
              as="button"
              onClick={() => setWeek(item)}
              px={2}
              py={1}
              borderRadius="sm"
              border="1px solid"
              borderColor={week === item ? "brand.400" : "whiteAlpha.100"}
              bg={week === item ? "rgba(229,62,62,0.22)" : "rgba(255,255,255,0.04)"}
              cursor="pointer"
            >
              <Text fontSize="8px" color={week === item ? "white" : "text.muted"} fontWeight="black">
                W{item}
              </Text>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Grid>
  </Box>
);
