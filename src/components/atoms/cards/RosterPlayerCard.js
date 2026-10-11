import { useState } from "react";
import { Box, Text, Flex, Image, Badge } from "@chakra-ui/react";
import { User, ArrowRight } from "lucide-react";

/**
 * RosterPlayerCard - Player card for roster view with image
 * @param {Object} props
 * @param {Object} props.player - Player data
 * @param {Function} props.navigate - Navigation function
 */
const RosterPlayerCard = ({ player, navigate }) => {
  const [imgErr, setImgErr] = useState(false);

  const handleClick = () => {
    const playerKey = encodeURIComponent(`${player.full_name}__${player.team_id}`);
    navigate(`/player/${playerKey}`, { state: { player } });
  };

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      p={4}
      cursor="pointer"
      onClick={handleClick}
      _hover={{ borderColor: "whiteAlpha.300", bg: "whiteAlpha.50" }}
      transition="all 0.2s"
    >
      <Flex gap={3}>
        {/* Player image */}
        <Box
          w="12" h="12"
          borderRadius="lg"
          bg="bg.card"
          flexShrink={0}
          position="relative"
          overflow="hidden"
        >
          {player.image_url && !imgErr ? (
            <Image
              src={player.image_url}
              alt={player.full_name}
              w="100%" h="100%"
              objectFit="cover"
              objectPosition="top"
              onError={() => setImgErr(true)}
            />
          ) : (
            <Flex align="center" justify="center" h="100%">
              <User size={20} color="var(--chakra-colors-whiteAlpha-200)" />
            </Flex>
          )}
          {player.jersey_number && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              py={1}
              bg="blackAlpha.800"
              textAlign="center"
            >
              <Text fontSize="8px" fontWeight="black" color="white">#{player.jersey_number}</Text>
            </Box>
          )}
        </Box>

        {/* Player info */}
        <Box flex={1} minW={0}>
          <Flex justify="space-between" align="flex-start" mb={2}>
            <Box flex={1} minW={0}>
              <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
                {player.full_name}
              </Text>
              <Flex align="center" gap={2} fontSize="xs" color="text.secondary">
                <Text>{player.position_abbr}</Text>
                <Text>·</Text>
                <Text>{player.height ? `${Math.floor(player.height / 12)}'${player.height % 12}"` : "—"}</Text>
                <Text>·</Text>
                <Text>{player.weight ? `${player.weight}lbs` : "—"}</Text>
              </Flex>
            </Box>
            <Flex align="center" gap={1} color="brand.400" fontSize="xs">
              <Text textTransform="uppercase">View</Text>
              <ArrowRight size={10} />
            </Flex>
          </Flex>
          
          {/* Bottom info */}
          <Flex align="center" justify="space-between">
            <Flex gap={1} flexWrap="wrap">
              {player.class_year && (
                <Badge
                  bg="whiteAlpha.100"
                  color="text.secondary"
                  fontSize="7px"
                  px={2} py="1px"
                  borderRadius="full"
                  textTransform="uppercase"
                >
                  {player.class_year}
                </Badge>
              )}
              {player.hometown && (
                <Badge
                  bg="whiteAlpha.50"
                  color="text.muted"
                  fontSize="7px"
                  px={2} py="1px"
                  borderRadius="full"
                >
                  {player.hometown}
                </Badge>
              )}
            </Flex>
            {player.par && (
              <Box textAlign="right">
                <Text fontSize="sm" fontWeight="black" color="brand.400">
                  {player.par.toFixed(1)}
                </Text>
                <Text fontSize="7px" color="text.muted">PAR</Text>
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default RosterPlayerCard;
