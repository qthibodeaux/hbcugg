import { TEAM_BY_EXPORT, makePlayerKey } from "../../../utils/playersHubPresentation";
import { useState } from "react";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { User } from "lucide-react";

// Existing player-hub presentation, extracted without changing behavior.

export const StatPlayerCard = ({ player, navigate }) => {
  const teamMeta = TEAM_BY_EXPORT[player.team] ?? {};
  const parColor =
    player.par > 10 ? "green.400" : player.par > 4 ? "brand.400" : "text.muted";
  const [imgErr, setImgErr] = useState(false);

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() =>
        navigate(`/player/${makePlayerKey(player)}`, { state: { player } })
      }
      _hover={{ borderColor: "brand.500", transform: "translateY(-1px)" }}
      transition="all 0.15s"
    >
      <Box bg="whiteAlpha.50" h="120px" overflow="hidden" position="relative">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={player.name_display}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={28} color="var(--chakra-colors-whiteAlpha-200)" />
          </Flex>
        )}
        {player.jersey_number != null && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            #{player.jersey_number}
          </Box>
        )}
        {player.par != null && (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="blackAlpha.800"
            color={parColor}
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            {player.par.toFixed(1)} PAR
          </Box>
        )}
      </Box>
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="text.primary"
          lineHeight="short"
          mb={1}
          lineClamp={1}
        >
          {player.name_display}
        </Text>
        <Flex gap={2} align="center" mb={1} flexWrap="wrap">
          {player.position && (
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {player.position}
            </Text>
          )}
          {player.class_year && (
            <Text fontSize="xs" color="text.muted">
              {player.class_year}
              {player.is_redshirt ? " RS" : ""}
            </Text>
          )}
          {player.is_transfer && player.transfer_tier && (
            <Text
              fontSize="9px"
              fontWeight="bold"
              color="yellow.400"
              textTransform="uppercase"
            >
              {player.transfer_tier}
            </Text>
          )}
        </Flex>
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="text.muted">
            {teamMeta.shortName ?? player.team}
          </Text>
          {player.games_played != null && (
            <Text fontSize="xs" color="text.muted">
              {player.games_played}G
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export const RosterPlayerCard = ({ player, navigate }) => {
  const [imgErr, setImgErr] = useState(false);
  const teamMeta = TEAM_BY_EXPORT[player.team_id] ?? {};
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() =>
        navigate(
          `/player/${makePlayerKey({ ...player, name_display: player.full_name, team: player.team_id })}`,
          {
            state: {
              player: {
                ...player,
                name_display: player.full_name,
                team: player.team_id,
                position: player.position_abbr,
              },
            },
          },
        )
      }
      _hover={{ borderColor: "brand.500", transform: "translateY(-1px)" }}
      transition="all 0.15s"
    >
      <Box bg="whiteAlpha.50" h="120px" overflow="hidden" position="relative">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={player.full_name}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={28} color="var(--chakra-colors-whiteAlpha-200)" />
          </Flex>
        )}
        {player.jersey_number != null && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            #{player.jersey_number}
          </Box>
        )}
      </Box>
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="text.primary"
          lineHeight="short"
          mb={1}
          lineClamp={1}
        >
          {player.full_name}
        </Text>
        <Flex gap={2} mb={1}>
          {player.position_abbr && (
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {player.position_abbr}
            </Text>
          )}
          {player.class_year && (
            <Text fontSize="xs" color="text.muted">
              {player.class_year}
            </Text>
          )}
        </Flex>
        <Text fontSize="xs" color="text.muted">
          {teamMeta.shortName ?? player.team_id}
        </Text>
      </Box>
    </Box>
  );
};

export const HistoricalPlayerCard = ({ player }) => {
  const teamMeta = TEAM_BY_EXPORT[player._teamId] ?? {};
  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      overflow="hidden"
    >
      <Box bg="whiteAlpha.50" h="80px" overflow="hidden" position="relative">
        <Flex align="center" justify="center" h="100%">
          <User size={22} color="var(--chakra-colors-whiteAlpha-200)" />
        </Flex>
        {(player.jersey_number != null || player.number != null) && (
          <Box
            position="absolute"
            bottom={2}
            left={2}
            bg="blackAlpha.800"
            color="white"
            fontSize="xs"
            fontWeight="black"
            px={2}
            py="1px"
            borderRadius="md"
          >
            #{player.jersey_number ?? player.number}
          </Box>
        )}
      </Box>
      <Box p={3}>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="text.primary"
          lineHeight="short"
          mb={1}
          lineClamp={1}
        >
          {player.name ?? player.full_name ?? "—"}
        </Text>
        <Flex gap={2} mb={1} flexWrap="wrap">
          {(player.position || player.position_abbr) && (
            <Text fontSize="xs" fontWeight="bold" color="brand.400">
              {player.position ?? player.position_abbr}
            </Text>
          )}
          {(player.class_year || player.year_in_school) && (
            <Text fontSize="xs" color="text.muted">
              {player.class_year ?? player.year_in_school}
            </Text>
          )}
        </Flex>
        <Text fontSize="xs" color="text.muted">
          {teamMeta.shortName ?? player._teamId}
        </Text>
      </Box>
    </Box>
  );
};
