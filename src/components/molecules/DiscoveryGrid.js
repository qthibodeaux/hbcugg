import { Box, Grid, Text, Image, Badge, Flex } from "@chakra-ui/react";
import { User, ArrowRight } from "lucide-react";

/**
 * DiscoveryGrid - Player discovery grid layout with featured player and sidebar
 * @param {Object} props
 * @param {Array} props.topPlayers - Array of top players to display
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.navigate - Navigation function
 */
const DiscoveryGrid = ({ topPlayers, isLoading, navigate }) => {
  if (isLoading || topPlayers.length === 0) return null;
  const [featured, ...rest] = topPlayers.slice(0, 4);
  const sidebar = rest.slice(0, 2);

  return (
    <Box mb={10}>
      <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
        {/* Featured player */}
        <Box
          bg="bg.secondary"
          border="1px solid"
          borderColor="whiteAlpha.100"
          borderRadius="xl"
          overflow="hidden"
          cursor="pointer"
          onClick={() =>
            navigate(
              `/player/${encodeURIComponent(`${featured.name_display}__${featured.team}`)}`,
            )
          }
          _hover={{ borderColor: "brand.500", transform: "translateY(-2px)" }}
          transition="all 0.2s"
        >
          <Box position="relative" h="200px" bg="bg.card">
            {featured.image_url ? (
              <Image
                src={featured.image_url}
                alt={featured.name_display}
                w="100%"
                h="100%"
                objectFit="cover"
                objectPosition="top"
              />
            ) : (
              <Flex align="center" justify="center" h="100%">
                <User size={48} color="var(--chakra-colors-whiteAlpha-200)" />
              </Flex>
            )}
            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(to top, rgba(11,11,13,0.9) 0%, transparent 60%)"
            />
            <Box position="absolute" bottom={4} left={4} right={4}>
              <Flex gap={2} mb={2}>
                <Badge
                  bg="brand.500"
                  color="white"
                  fontSize="9px"
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                >
                  FEATURED
                </Badge>
                {featured.transfer_tier && (
                  <Badge colorScheme="yellow" variant="subtle" fontSize="9px">
                    {featured.transfer_tier} Transfer
                  </Badge>
                )}
              </Flex>
              <Text
                fontSize="2xl"
                fontWeight="black"
                color="white"
                textTransform="uppercase"
                lineHeight={0.9}
              >
                {featured.name_display}
              </Text>
              <Text fontSize="sm" color="text.secondary" mt={1}>
                {featured.position} · {featured.team}
              </Text>
            </Box>
          </Box>
          <Box p={4}>
            <Flex justify="space-between" align="center">
              <Box>
                <Text
                  fontSize="xs"
                  color="text.muted"
                  textTransform="uppercase"
                  letterSpacing="0.1em"
                >
                  PAR Score
                </Text>
                <Text fontSize="xl" fontWeight="black" color="brand.400">
                  {featured.par?.toFixed(1)}
                </Text>
              </Box>
              <Flex align="center" gap={1} color="brand.400">
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                  View Profile
                </Text>
                <ArrowRight size={12} />
              </Flex>
            </Flex>
          </Box>
        </Box>

        {/* Sidebar players */}
        <Grid templateColumns="1fr" gap={4}>
          {sidebar.map((player, i) => (
            <Box
              key={player.name_display}
              bg="bg.secondary"
              border="1px solid"
              borderColor="whiteAlpha.100"
              borderRadius="xl"
              p={4}
              cursor="pointer"
              onClick={() =>
                navigate(
                  `/player/${encodeURIComponent(`${player.name_display}__${player.team}`)}`,
                )
              }
              _hover={{ borderColor: "whiteAlpha.300", bg: "whiteAlpha.50" }}
              transition="all 0.2s"
            >
              <Flex align="center" gap={3}>
                <Box
                  w="12"
                  h="12"
                  borderRadius="lg"
                  bg="bg.card"
                  flexShrink={0}
                  position="relative"
                  overflow="hidden"
                >
                  {player.image_url ? (
                    <Image
                      src={player.image_url}
                      alt={player.name_display}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      objectPosition="top"
                    />
                  ) : (
                    <Flex align="center" justify="center" h="100%">
                      <User
                        size={20}
                        color="var(--chakra-colors-whiteAlpha-200)"
                      />
                    </Flex>
                  )}
                </Box>
                <Box flex={1} minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color="text.primary"
                    lineClamp={1}
                  >
                    {player.name_display}
                  </Text>
                  <Text fontSize="xs" color="text.secondary">
                    {player.position} · {player.team}
                  </Text>
                </Box>
                <Box textAlign="right" flexShrink={0}>
                  <Text fontSize="lg" fontWeight="black" color="brand.400">
                    {player.par?.toFixed(1)}
                  </Text>
                  <Text
                    fontSize="8px"
                    color="text.muted"
                    textTransform="uppercase"
                  >
                    PAR
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DiscoveryGrid;
