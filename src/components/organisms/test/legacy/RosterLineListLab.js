import { Badge, Box, Flex, Grid, Image, Spinner, Text } from "@chakra-ui/react";

const formatHeightWeight = (height, weight) => {
  const heightLabel =
    Number.isFinite(height) && height > 0
      ? `${Math.floor(height / 12)}'${height % 12}"`
      : "--";
  const weightLabel = Number.isFinite(weight) && weight > 0 ? `${weight} lb` : "--";
  return `${heightLabel} / ${weightLabel}`;
};

const cellBase = {
  px: 3,
  py: 3,
  fontSize: "sm",
  color: "text.secondary",
};

export const RosterLineListLab = ({ groupedRoster = [], isLoading, teamName }) => {
  if (isLoading) {
    return (
      <Flex py={10} justify="center" align="center">
        <Spinner size="sm" color="brand.500" />
      </Flex>
    );
  }

  const groups = groupedRoster;

  if (!groups.length) {
    return (
      <Box py={10} textAlign="center" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg">
        <Text color="text.muted">No roster rows available for this team.</Text>
      </Box>
    );
  }

  return (
    <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden" bg="bg.secondary">
      <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.100">
        <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="widest">
          {teamName} Roster · {groups.reduce((sum, group) => sum + group.players.length, 0)} Players
        </Text>
      </Box>

      {groups.map((group) => (
        <Box key={group.key} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Box px={4} py={2} bg="whiteAlpha.50" borderBottom="1px solid" borderColor="whiteAlpha.100">
            <Flex align="center" gap={3}>
              <Badge colorPalette="red" variant="subtle">{group.label}</Badge>
              <Text fontSize="xs" color="text.muted">{group.players.length} players</Text>
            </Flex>
          </Box>

          <Grid
            display={{ base: "none", md: "grid" }}
            templateColumns="80px 2.2fr 120px 160px 110px 100px 100px"
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            {["Jersey", "Player", "Position", "Height/Weight", "Class", "Transfer", "Redshirt"].map((label) => (
              <Box key={label} px={3} py={2}>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                  {label}
                </Text>
              </Box>
            ))}
          </Grid>

          {group.players.map((player, index) => (
            <Box
              key={player.person_id}
              borderTop={index === 0 ? "none" : "1px solid"}
              borderColor="whiteAlpha.100"
              bg={index % 2 === 0 ? "transparent" : "whiteAlpha.50"}
            >
              <Grid
                display={{ base: "none", md: "grid" }}
                templateColumns="80px 2.2fr 120px 160px 110px 100px 100px"
                alignItems="center"
              >
                <Box {...cellBase} color="text.primary" fontWeight="bold">#{player.jersey_number ?? "--"}</Box>
                <Box {...cellBase}>
                  <Flex align="center" gap={3}>
                    <Box w="40px" h="40px" borderRadius="md" overflow="hidden" bg="whiteAlpha.200" flexShrink={0}>
                      {player.image_url ? (
                        <Image src={player.image_url} alt={player.full_name} w="100%" h="100%" objectFit="cover" objectPosition="top" />
                      ) : (
                        <Flex w="100%" h="100%" align="center" justify="center">
                          <Text fontSize="10px" color="text.muted">N/A</Text>
                        </Flex>
                      )}
                    </Box>
                    <Box minW={0}>
                      <Text color="text.primary" fontWeight="semibold" lineClamp={1}>{player.full_name}</Text>
                      <Text fontSize="xs" color="text.muted" lineClamp={1}>{player.hometown ?? "--"}</Text>
                    </Box>
                  </Flex>
                </Box>
                <Box {...cellBase}>{player.position_abbr ?? "--"}</Box>
                <Box {...cellBase}>{formatHeightWeight(player.height, player.weight)}</Box>
                <Box {...cellBase}>{player.class_year ?? "--"}</Box>
                <Box {...cellBase}>
                  <Badge colorPalette={player.is_transfer ? "orange" : "gray"} variant="subtle">
                    {player.is_transfer ? "Yes" : "No"}
                  </Badge>
                </Box>
                <Box {...cellBase}>
                  <Badge colorPalette={player.is_redshirt ? "purple" : "gray"} variant="subtle">
                    {player.is_redshirt ? "Yes" : "No"}
                  </Badge>
                </Box>
              </Grid>

              <Box display={{ base: "block", md: "none" }} px={3} py={3}>
                <Flex gap={3}>
                  <Box w="52px" h="52px" borderRadius="md" overflow="hidden" bg="whiteAlpha.200" flexShrink={0}>
                    {player.image_url ? (
                      <Image src={player.image_url} alt={player.full_name} w="100%" h="100%" objectFit="cover" objectPosition="top" />
                    ) : (
                      <Flex w="100%" h="100%" align="center" justify="center">
                        <Text fontSize="10px" color="text.muted">N/A</Text>
                      </Flex>
                    )}
                  </Box>
                  <Box flex={1} minW={0}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="xs" color="text.muted">#{player.jersey_number ?? "--"}</Text>
                      <Flex gap={2}>
                        <Badge colorPalette={player.is_transfer ? "orange" : "gray"} variant="subtle">
                          T: {player.is_transfer ? "Y" : "N"}
                        </Badge>
                        <Badge colorPalette={player.is_redshirt ? "purple" : "gray"} variant="subtle">
                          RS: {player.is_redshirt ? "Y" : "N"}
                        </Badge>
                      </Flex>
                    </Flex>
                    <Text color="text.primary" fontWeight="semibold" lineClamp={1}>{player.full_name}</Text>
                    <Text fontSize="sm" color="text.secondary" mt={1}>
                      {player.position_abbr ?? "--"} · {player.class_year ?? "--"} · {formatHeightWeight(player.height, player.weight)}
                    </Text>
                    <Text fontSize="sm" color="text.muted" lineClamp={1}>{player.hometown ?? "--"}</Text>
                  </Box>
                </Flex>
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};
