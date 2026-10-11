import { useState } from "react";
import { Box, Text,  Image, Badge, Flex } from "@chakra-ui/react";
import { User, ArrowRight } from "lucide-react";

/**
 * DiscoveryCard - Player discovery card with image and stats
 * @param {Object} props
 * @param {Object} props.player - Player data
 * @param {boolean} props.large - Whether this is a large featured card
 * @param {Function} props.navigate - Navigation function
 */
const DiscoveryCard = ({ player, large = false, navigate }) => {
  const [imgErr, setImgErr] = useState(false);

  const handleClick = () => {
    const playerKey = encodeURIComponent(`${player.name_display || player.full_name}__${player.team || player.team_id}`);
    navigate(`/player/${playerKey}`, { state: { player } });
  };

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius={large ? "2xl" : "lg"}
      overflow="hidden"
      cursor="pointer"
      onClick={handleClick}
      _hover={{ borderColor: "brand.500", transform: "translateY(-2px)" }}
      transition="all 0.2s"
    >
      {/* Image section */}
      <Box position="relative" h={large ? "200px" : "120px"} bg="bg.card">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={player.name_display}
            w="100%" h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={large ? 48 : 32} color="var(--chakra-colors-whiteAlpha-200)" />
          </Flex>
        )}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(to top, rgba(11,11,13,0.9) 0%, transparent 60%)"
        />
        {player.jersey_number && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="10px"
            fontWeight="black"
            px={2} py="1px"
            borderRadius="full"
            textTransform="uppercase"
          >
            #{player.jersey_number}
          </Box>
        )}
      </Box>

      {/* Content section */}
      <Box p={large ? 4 : 3}>
        <Flex justify="space-between" align="flex-start" mb={2}>
          <Box flex={1} minW={0}>
            <Text
              fontSize={large ? "md" : "sm"}
              fontWeight="bold"
              color="text.primary"
              lineClamp={1}
              mb={1}
            >
              {player.name_display || player.full_name}
            </Text>
            <Flex align="center" gap={2} fontSize="xs" color="text.secondary">
              <Text>{player.position || player.position_abbr}</Text>
              <Text>·</Text>
              <Text>{player.team || player.team_id}</Text>
            </Flex>
          </Box>
          <Box textAlign="right" flexShrink={0}>
            <Text
              fontSize={large ? "2xl" : "lg"}
              fontWeight="black"
              color="brand.400"
              lineHeight={1}
            >
              {Math.round(50 + (player.par ?? 0) * 0.8)}
            </Text>
            <Text fontSize="8px" color="text.muted" textTransform="uppercase">
              Glory
            </Text>
          </Box>
        </Flex>

        {/* Bottom section */}
        <Flex align="center" justify="space-between" gap={2}>
          <Flex gap={1} flexWrap="wrap">
            {player.transfer_tier && (
              <Badge
                colorScheme="yellow"
                variant="subtle"
                fontSize="7px"
                px={2} py="1px"
                borderRadius="full"
                textTransform="uppercase"
              >
                {player.transfer_tier}
              </Badge>
            )}
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
          </Flex>
          {large && (
            <Flex align="center" gap={1} color="brand.400" fontSize="xs" fontWeight="bold">
              <Text textTransform="uppercase">View</Text>
              <ArrowRight size={12} />
            </Flex>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default DiscoveryCard;
