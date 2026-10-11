import React, { useState } from "react";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import useMountEffect from "../../../hooks/useMountEffect";

/**
 * COMPONENT LAB — Team KPI Strip Variant A
 * 
 * Design:   Magazine-style data strip. High-density, balanced, 
 *           adhering to 4x1 PageShell standards.
 */

const KPI_TICKER_ITEMS = [
  "AVG PAR 74.2 / +2.1 VS 2024",
  "TEAM — #1 PAR RANKING",
  "NEXT: VS GRAMBLING STATE (SAT 3:00 PM)",
  "ROSTER: 104 ACTIVE PLAYERS",
];

const useTicker = (items) => {
  const [index, setIndex] = useState(0);
  useMountEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  });
  return items[index];
};

export const TeamKPIStripA = ({ team, stats }) => {
  const tickerLine = useTicker(KPI_TICKER_ITEMS);
  const primaryColor = team?.colors?.primary || "#002147"; // Default JSU Blue
  // eslint-disable-next-line no-unused-vars
  const secondaryColor = team?.colors?.secondary || "#FFFFFF";

  const data = stats || {
    par: "74.2",
    parChange: "+2.1 this season",
    rosterSize: "104",
    transfers: "12%",
    veterans: "64%"
  };

  return (
    <Box
      w="full"
      h="100%"
      minH="120px"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Editorial Ticker Header */}
      <Box 
        bg={primaryColor} 
        px={6} 
        py={2} 
        borderBottom="1px solid" 
        borderColor="whiteAlpha.200"
      >
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={3}>
            <Box w="8px" h="8px" bg="brand.500" borderRadius="full" />
            <Text 
              fontSize="10px" 
              fontWeight="black" 
              color="white" 
              textTransform="uppercase" 
              letterSpacing="0.2em"
            >
              Live Program Intelligence / {team?.name || "Jackson State"}
            </Text>
          </Flex>
          <Text 
            fontSize="10px" 
            fontWeight="bold" 
            color="whiteAlpha.700" 
            textTransform="uppercase"
            fontStyle="italic"
          >
            {tickerLine}
          </Text>
        </Flex>
      </Box>

      {/* Main KPI Grid */}
      <Flex flex={1} align="stretch">
        {/* PAR Metric - The Lead */}
        <Flex 
          flex={1.2} 
          direction="column" 
          justify="center" 
          pl={8} 
          pr={4}
          borderRight="1px solid" 
          borderColor="whiteAlpha.100"
          bg={`linear-gradient(90deg, ${primaryColor}22 0%, transparent 100%)`}
        >
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={1}>
            Average Power Rating
          </Text>
          <Flex align="baseline" gap={3}>
            <Text fontSize="4xl" fontWeight="black" color="text.primary" lineHeight="0.8">
              {data.par}
            </Text>
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {data.parChange}
            </Text>
          </Flex>
        </Flex>

        {/* Secondary Metrics Grid */}
        <Grid 
          flex={3} 
          templateColumns="repeat(3, 1fr)" 
          h="full"
        >
          {[
            { label: "Roster Population", value: data.rosterSize, sub: "Players", color: "text.secondary" },
            { label: "Transfer Activity", value: data.transfers, sub: "Active", color: "brand.400" },
            { label: "Veteran Presence", value: data.veterans, sub: "Upperclass", color: "brand.400" }
          ].map((item, idx) => (
            <Flex 
              key={idx}
              direction="column" 
              justify="center" 
              px={8}
              borderRight={idx === 2 ? "none" : "1px solid"}
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={1.5}>
                {item.label}
              </Text>
              <Flex align="baseline" gap={2}>
                <Text fontSize="2xl" fontWeight="black" color="text.primary" lineHeight="1">
                  {item.value}
                </Text>
                <Text fontSize="10px" fontWeight="bold" color={item.color} textTransform="uppercase">
                  {item.sub}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Grid>
      </Flex>
    </Box>
  );
};
