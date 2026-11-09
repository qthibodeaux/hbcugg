import { Box, Flex, Image, Badge, Text, Grid } from "@chakra-ui/react";

// Phone layout for the existing MEAC/SWAC Challenge almanac banner.

export const MobileMeacSwacChallengeBanner = () => (
  <Box
    overflow="hidden"
    borderRadius="8px"
    border="1px solid"
    borderColor="gray.200"
    bg="gray.50"
    boxShadow="0 10px 40px rgba(0,0,0,0.08)"
    position="relative"
    p="0.85rem"
  >
    <Flex direction="column" align="center" mb="0.85rem">
      <Image
        src="/assets/meacswachallengelogo.png"
        alt="MEAC/SWAC Challenge"
        h="4.5rem"
        objectFit="contain"
        filter="drop-shadow(0 6px 15px rgba(0,0,0,0.15))"
        mb="0.4rem"
      />
      <Flex gap="0.3rem" mb="0.3rem">
        <Badge variant="solid" bg="gray.800" color="white" px={2} borderRadius="0" fontSize="8px">EST. 2005</Badge>
        <Badge variant="solid" bg="#A855F7" color="white" px={2} borderRadius="0" fontSize="8px">ESPN EVENTS</Badge>
      </Flex>
      <Text fontSize="0.55rem" fontWeight="black" color="#A855F7" letterSpacing="0.3em">
        THE SEASON STARTS HERE
      </Text>
    </Flex>

    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="0.5rem" mb="0.5rem">
      <Box bg="white" border="1px solid" borderColor="gray.100" p="0.6rem" position="relative" overflow="hidden">
        <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="blue.600" />
        <Text fontSize="0.55rem" fontWeight="black" color="blue.700" textTransform="uppercase" mb="0.2rem">
          Series Record
        </Text>
        <Flex align="baseline" gap="0.25rem">
          <Text fontSize="1.4rem" fontWeight="900" color="gray.800">11</Text>
          <Text fontSize="0.6rem" fontWeight="bold" color="blue.500">MEAC</Text>
          <Text fontSize="1.4rem" fontWeight="900" color="gray.300">-</Text>
          <Text fontSize="1.4rem" fontWeight="900" color="gray.800">7</Text>
          <Text fontSize="0.6rem" fontWeight="bold" color="red.500">SWAC</Text>
        </Flex>
        <Box w="full" h="5px" bg="gray.100" borderRadius="full" mt="0.4rem" overflow="hidden">
          <Box w="61%" h="full" bg="blue.600" />
        </Box>
        <Text fontSize="0.5rem" color="blue.600" mt="0.3rem" fontWeight="900">MEAC DOMINANCE: +4</Text>
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.100" p="0.6rem">
        <Text fontSize="0.55rem" fontWeight="black" color="gray.400" textTransform="uppercase" mb="0.3rem">
          Most Active
        </Text>
        {[
          ["SC State", "7 App", "blue"],
          ["Southern", "4 App", "red"],
          ["BCU", "4 App", "blue"],
        ].map(([team, stat, color]) => (
          <Flex key={team} justify="space-between" mb="0.25rem" align="center">
            <Text fontSize="0.6rem" fontWeight="900" color="gray.700">{team}</Text>
            <Badge variant="solid" colorScheme={color} fontSize="7px">{stat}</Badge>
          </Flex>
        ))}
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.100" p="0.6rem">
        <Text fontSize="0.55rem" fontWeight="black" color="red.700" textTransform="uppercase" mb="0.2rem">
          Scoring High
        </Text>
        <Flex align="baseline" gap="0.25rem">
          <Text fontSize="1.6rem" fontWeight="1000" color="#A855F7" lineHeight={1}>63</Text>
          <Text fontSize="0.55rem" fontWeight="black" color="gray.400">PTS</Text>
        </Flex>
        <Text fontSize="0.6rem" fontWeight="bold" color="gray.700" mt="0.2rem">BCU vs PVAMU</Text>
        <Text fontSize="0.5rem" fontWeight="bold" color="gray.400">ORLANDO, 2011</Text>
      </Box>

      <Box bg="white" border="1px solid" borderColor="gray.100" p="0.6rem">
        <Text fontSize="0.55rem" fontWeight="black" color="gray.400" textTransform="uppercase" mb="0.2rem">
          Draft Alumni
        </Text>
        <Text fontSize="1.6rem" fontWeight="1000" color="gray.800" lineHeight={1}>9</Text>
        <Text fontSize="0.55rem" fontWeight="black" color="blue.700">NFL PICKS</Text>
        <Text fontSize="0.5rem" fontWeight="bold" color="gray.500" lineClamp={1}>HARGRAVE · DURANT · ADAMS</Text>
      </Box>
    </Grid>

    <Flex justify="space-between" align="center" bg="white" border="1px solid" borderColor="gray.100" p="0.6rem" mb="0.5rem" gap="0.5rem">
      <Box minW={0}>
        <Text fontSize="0.5rem" fontWeight="black" color="gray.400" textTransform="uppercase">Current Residency</Text>
        <Text fontSize="0.75rem" fontWeight="1000" color="gray.800" lineClamp={1}>CENTER PARC STADIUM</Text>
        <Text fontSize="0.5rem" fontWeight="bold" color="red.600">ATLANTA, GA (2018-PRES)</Text>
      </Box>
      <Box minW={0} textAlign="right">
        <Text fontSize="0.5rem" fontWeight="black" color="gray.400" textTransform="uppercase">Legacy Path</Text>
        <Text fontSize="0.5rem" fontWeight="bold" color="gray.600" lineClamp={2}>ORLANDO · BIRMINGHAM · BATON ROUGE</Text>
      </Box>
    </Flex>

    <Box bg="white" border="1px solid" borderColor="gray.100" p="0.6rem" position="relative" overflow="hidden">
      <Box position="absolute" right={0} top={0} bottom={0} w="3px" bg="red.600" />
      <Text fontSize="0.55rem" fontWeight="black" color="gray.400" textTransform="uppercase" mb="0.4rem">
        Recent Outcomes
      </Text>
      <Flex gap="0.4rem">
        {[
          ["2025", "NC CENTRAL", "31-14", "MEAC"],
          ["2024", "FLORIDA A&M", "24-23", "SWAC"],
          ["2023", "JACKSON ST", "37-7", "SWAC"],
        ].map(([yr, team, score, conf]) => (
          <Box key={yr} flex="1" minW={0} bg={conf === "MEAC" ? "blue.50" : "red.50"} p="0.4rem" borderRadius="4px" borderLeft="2px solid" borderColor={conf === "MEAC" ? "blue.200" : "red.200"}>
            <Flex justify="space-between">
              <Text fontSize="0.5rem" fontWeight="black" color="gray.500">{yr}</Text>
              <Text fontSize="0.45rem" fontWeight="black" color={conf === "MEAC" ? "blue.600" : "red.600"}>{conf}</Text>
            </Flex>
            <Text fontSize="0.5rem" fontWeight="1000" color="gray.800" lineClamp={1}>{team}</Text>
            <Text fontSize="0.55rem" fontWeight="bold" color="gray.600">{score}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  </Box>
);
