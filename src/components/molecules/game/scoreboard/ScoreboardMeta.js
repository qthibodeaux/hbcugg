import { Flex, Text, Box } from "@chakra-ui/react";
import { getTeamLabel } from "./scoreboardModel";

// Accepted scoreboard status, venue/tab strip and ticker presentation.

const TickerSegment = ({ label, value, dividerColor, textColor }) => (
  <Flex align="center" gap={{ base: 2, lg: 3 }} flexShrink={0}>
    <Text
      fontSize={{ base: "8.5px", md: "9px" }}
      fontWeight="950"
      color={textColor}
      textTransform="uppercase"
      letterSpacing="0.12em"
      whiteSpace="nowrap"
    >
      {label}
    </Text>
    <Text
      fontSize={{ base: "8.5px", md: "9px" }}
      fontWeight="bold"
      color={textColor}
      opacity={0.88}
      textTransform="uppercase"
      whiteSpace="nowrap"
      fontStyle="italic"
    >
      {value}
    </Text>
    <Box w="1.5px" h="10px" bg={dividerColor} opacity={0.45} borderRadius="full" />
  </Flex>
);

export const ScoreboardStatus = ({ isCompact, winner, margin, meta, venueRows }) => (<Flex direction="column" align="center" justify="center" px={{ base: 2, lg: 6 }} gap={2} flexShrink={0} position="relative">
            <Box position="absolute" left={0} h="40%" w="1px" bg="whiteAlpha.100" />
            <Box position="absolute" right={0} h="40%" w="1px" bg="whiteAlpha.100" />

            <Box px={4} py={1} bg="brand.500" transform="skewX(-10deg)">
              <Text 
                textStyle="pill" 
                color="white" 
                fontSize="10px"
                transform="skewX(10deg)"
                fontWeight="black"
                letterSpacing="0.04em"
              >
                FINAL
              </Text>
            </Box>
            <Text 
              textStyle="cardTitle" 
              color="white" 
              fontSize={isCompact ? "xs" : "sm"}
              whiteSpace="nowrap"
              fontWeight="black"
              textTransform="uppercase"
            >
              {winner ? `${getTeamLabel(winner)} BY ${margin}` : "TIED"}
            </Text>
            {!isCompact && (
              <Text textStyle="editorial" color="whiteAlpha.600" textAlign="center" maxW="150px" fontSize="10px" fontWeight="700">
                {meta.date}
              </Text>
            )}
            {/* Venue stack — one line each, off the game file's `venue` /
                `event` blocks (see the fetch contract Envelope): sponsor,
                stadium, city, then the event line. A line whose field is
                null is omitted, never dashed. The metadata `site` string is
                the older file's only venue field and stands in as the
                stadium line when `venue` is absent. */}
            {!isCompact && venueRows.length > 0 && (
              <Flex direction="column" align="center" gap={0} mt={-1} maxW="180px">
                {venueRows.map((row) => (
                  <Text
                    key={row.key}
                    textStyle="editorial"
                    color={row.key === "event" ? "brand.400" : "whiteAlpha.500"}
                    textAlign="center"
                    fontSize="9px"
                    fontWeight={row.key === "stadium" || row.key === "event" ? "900" : "700"}
                    textTransform={row.key === "event" ? "uppercase" : "none"}
                    letterSpacing={row.key === "event" ? "0.08em" : "normal"}
                    lineHeight={1.3}
                    lineClamp={row.key === "event" ? 2 : 1}
                  >
                    {row.text}
                  </Text>
                ))}
              </Flex>
            )}
          </Flex>);

export const ScoreboardVenue = ({ tabs, isCompact, activeTab, onTabChange, meta }) => (<Flex 
          justify="space-between" 
          align="center" 
          gap={3} 
          px={{ base: 4, lg: 10 }} 
          pb={2} 
          pt={1} 
          borderTop="1px solid" 
          borderColor="whiteAlpha.100" 
          wrap="wrap" 
          flexShrink={0}
        >
          <Flex gap={2} wrap="wrap">
            {tabs.map((tab) => (
              <Box
                key={tab}
                as="button"
                type="button"
                px={{ base: 3, lg: 4 }}
                py={2}
                minW={isCompact ? "60px" : "80px"}
                border="1px solid"
                borderColor={tab === activeTab ? "brand.500" : "whiteAlpha.100"}
                bg={tab === activeTab ? "rgba(229,62,62,0.18)" : "whiteAlpha.50"}
                cursor="pointer"
                onClick={() => onTabChange?.(tab)}
              >
                <Text textStyle="pill" color={tab === activeTab ? "white" : "text.muted"}>{tab}</Text>
              </Box>
            ))}
          </Flex>
          <Text textStyle="editorial" color="whiteAlpha.600">
            Attendance {meta.attendance?.toLocaleString?.() ?? "-"} | Kick {meta.kickoff_time ?? "-"}
          </Text>
        </Flex>);

export const ScoreboardTicker = ({ tickerLoop }) => (<Box 
          h="20px" 
          bg="brand.500" 
          overflow="hidden" 
          borderTop="1px solid" 
          borderColor="whiteAlpha.200" 
          flexShrink={0}
        >
          <Flex
            h="full"
            align="center"
            gap={8}
            px={4}
            w="max-content"
            style={{ animation: "gameBannerTickerScroll 36s linear infinite" }}
          >
            {tickerLoop.map(([label, value], index) => (
              <TickerSegment
                key={`${label}-${index}`}
                label={label}
                value={value}
                dividerColor="#FFFFFF"
                textColor="#FFFFFF"
              />
            ))}
          </Flex>
        </Box>);
