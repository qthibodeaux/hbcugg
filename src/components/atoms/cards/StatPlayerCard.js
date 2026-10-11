import { Box, Text, Flex, Badge } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

/**
 * StatPlayerCard - Player card for stats view with PAR-based coloring
 * @param {Object} props
 * @param {Object} props.player - Player data
 * @param {Function} props.navigate - Navigation function
 */
const StatPlayerCard = ({ player, navigate }) => {
  const parColor =
    player.par > 10 ? "green.400" : player.par > 4 ? "brand.400" : "text.muted";
  
  const handleClick = () => {
    const playerKey = encodeURIComponent(`${player.name_display}__${player.team}`);
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
      <Flex justify="space-between" align="flex-start" mb={2}>
        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
            {player.name_display}
          </Text>
          <Flex align="center" gap={2} fontSize="xs" color="text.secondary">
            <Text>{player.position}</Text>
            <Text>·</Text>
            <Text>{player.team}</Text>
          </Flex>
        </Box>
        <Box textAlign="right" flexShrink={0}>
          <Text fontSize="lg" fontWeight="black" color={parColor}>
            {player.par?.toFixed(1)}
          </Text>
          <Text fontSize="9px" color="text.muted">PAR</Text>
        </Box>
      </Flex>
      
      <Flex align="center" justify="space-between">
        <Flex gap={1} flexWrap="wrap">
          {player.transfer_tier && player.transfer_tier !== "HS" && (
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
        </Flex>
        <Flex align="center" gap={1} color="brand.400" fontSize="xs">
          <Text textTransform="uppercase">View</Text>
          <ArrowRight size={10} />
        </Flex>
      </Flex>
    </Box>
  );
};

export default StatPlayerCard;
