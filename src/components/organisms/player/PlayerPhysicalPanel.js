import { Box, Flex, Text, Grid } from "@chakra-ui/react";

const PlayerPhysicalPanel = ({
  player,
  classFull,
  height,
  weight,
  hometown,
  teamMeta,
  formatHeight,
}) => (
  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} pb={12}>
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={6}
    >
      <Flex align="center" gap={2} mb={6}>
        <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          Physical Profile
        </Text>
      </Flex>
      <Flex direction="column" gap={5}>
        {[
          { label: "Height", value: formatHeight(height) },
          { label: "Weight", value: weight ? `${weight} LBS` : "—" },
          { label: "Hometown", value: hometown ?? "—" },
          { label: "Class", value: classFull[player.class_year] ?? player.class_year ?? "—" },
          { label: "Conference", value: teamMeta.conference ?? "—" },
          { label: "School", value: teamMeta.shortName ?? player.team ?? "—" },
        ].map(({ label, value }) => (
          <Flex
            key={label}
            justify="space-between"
            align="baseline"
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
            pb={3}
          >
            <Text
              fontSize="xs"
              color="text.muted"
              textTransform="uppercase"
              letterSpacing="0.1em"
            >
              {label}
            </Text>
            <Text fontSize="md" fontWeight="bold" color="white">
              {value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </Box>

    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      p={6}
    >
      <Flex align="center" gap={2} mb={6}>
        <Box w="3px" h="16px" bg="brand.500" borderRadius="full" />
        <Text
          fontSize="xs"
          fontWeight="bold"
          color="white"
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          Background
        </Text>
      </Flex>
      <Flex direction="column" gap={3}>
        {player.is_transfer && (
          <Box
            bg="yellow.900"
            border="1px solid"
            borderColor="yellow.700"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              color="yellow.300"
              fontWeight="bold"
              textTransform="uppercase"
              mb={1}
            >
              Transfer Player
            </Text>
            <Text fontSize="sm" color="white">
              {player.transfer_tier} Transfer
            </Text>
          </Box>
        )}
        {player.is_redshirt && (
          <Box
            bg="orange.900"
            border="1px solid"
            borderColor="orange.700"
            borderRadius="lg"
            p={4}
          >
            <Text
              fontSize="xs"
              color="orange.300"
              fontWeight="bold"
              textTransform="uppercase"
              mb={1}
            >
              Redshirt Season
            </Text>
            <Text fontSize="sm" color="white">
              Currently serving redshirt year.
            </Text>
          </Box>
        )}
        <Box bg="bg.card" borderRadius="lg" p={4}>
          <Text
            fontSize="xs"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.1em"
            mb={2}
          >
            2025 Status
          </Text>
          <Flex align="center" gap={2}>
            <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
            <Text fontSize="sm" color="white">
              Active Roster
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  </Grid>
);

export default PlayerPhysicalPanel;
