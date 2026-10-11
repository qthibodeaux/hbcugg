import { Badge, Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { User } from "lucide-react";

const PlayerDetailHero = ({
  player,
  imageUrl,
  imgErr,
  setImgErr,
  teamMeta,
  classFull,
  firstName,
  lastName,
  gloryRating,
  parScore,
}) => (
  <Box
    position="relative"
    py={10}
    overflow="hidden"
    _before={{
      content: '""',
      position: "absolute",
      inset: 0,
      bg: "linear-gradient(135deg, rgba(229,62,62,0.05) 0%, transparent 55%)",
      pointerEvents: "none",
    }}
  >
    <Grid
      templateColumns={{ base: "1fr", md: "auto 1fr auto" }}
      gap={{ base: 6, md: 8 }}
      alignItems="center"
    >
      <Box
        w={{ base: "100px", md: "130px" }}
        h={{ base: "130px", md: "170px" }}
        borderRadius="xl"
        overflow="hidden"
        bg="bg.secondary"
        border="2px solid"
        borderColor="whiteAlpha.200"
        flexShrink={0}
        position="relative"
      >
        {imageUrl && !imgErr ? (
          <Image
            src={imageUrl}
            alt={player.name_display}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%" bg="bg.card">
            <User size={40} color="var(--chakra-colors-whiteAlpha-200)" />
          </Flex>
        )}
        {player.jersey_number != null && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            py={1}
            bg="blackAlpha.800"
            textAlign="center"
          >
            <Text fontSize="xs" fontWeight="black" color="white">
              #{player.jersey_number}
            </Text>
          </Box>
        )}
      </Box>

      <Box>
        <Flex gap={2} mb={3} flexWrap="wrap">
          {teamMeta.shortName && (
            <Badge
              bg="brand.500"
              color="white"
              fontSize="9px"
              textTransform="uppercase"
              letterSpacing="0.1em"
              px={2}
              py="3px"
              borderRadius="sm"
            >
              {teamMeta.shortName}
            </Badge>
          )}
          {player.position && (
            <Badge
              bg="whiteAlpha.100"
              color="text.secondary"
              fontSize="9px"
              textTransform="uppercase"
              letterSpacing="0.1em"
              px={2}
              py="3px"
              borderRadius="sm"
            >
              {player.position ?? player.position_abbr}
            </Badge>
          )}
          {player.is_transfer && player.transfer_tier && (
            <Badge
              colorScheme="yellow"
              variant="subtle"
              fontSize="9px"
              px={2}
              py="3px"
              borderRadius="sm"
            >
              {player.transfer_tier} Transfer
            </Badge>
          )}
        </Flex>

        <Box lineHeight={0.9} mb={3}>
          {firstName && (
            <Text
              fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
              fontWeight="black"
              color="white"
              textTransform="uppercase"
              letterSpacing="-0.02em"
              lineHeight={0.95}
            >
              {firstName}
            </Text>
          )}
          <Text
            fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
            fontWeight="black"
            color="white"
            textTransform="uppercase"
            letterSpacing="-0.02em"
            lineHeight={0.95}
          >
            {lastName}
          </Text>
        </Box>

        <Flex gap={3} align="center" flexWrap="wrap">
          {player.class_year && (
            <Text fontSize="sm" color="text.secondary">
              {classFull[player.class_year] ?? player.class_year}
            </Text>
          )}
          {player.jersey_number != null && (
            <Text fontSize="sm" color="text.muted">
              #{player.jersey_number}
            </Text>
          )}
          {teamMeta.conference && (
            <Text fontSize="sm" color="text.muted">
              {teamMeta.conference}
            </Text>
          )}
          {player.is_redshirt && (
            <Text fontSize="xs" color="orange.400" fontWeight="bold">
              REDSHIRT
            </Text>
          )}
        </Flex>
      </Box>

      <Box textAlign={{ base: "left", md: "right" }} flexShrink={0}>
        <Text
          fontSize="10px"
          color="brand.400"
          textTransform="uppercase"
          letterSpacing="0.14em"
          mb={1}
        >
          Glory Rating
        </Text>
        <Text
          fontSize={{ base: "7xl", md: "9xl" }}
          fontWeight="black"
          color="white"
          lineHeight={0.85}
          letterSpacing="-0.04em"
        >
          {gloryRating}
        </Text>
        <Text fontSize="sm" color="text.muted" letterSpacing="0.04em">
          /100
        </Text>
        <Text
          fontSize="9px"
          color="text.muted"
          mt={1}
          textTransform="uppercase"
          letterSpacing="0.1em"
        >
          {parScore.toFixed(1)} PAR Score
        </Text>
      </Box>
    </Grid>
  </Box>
);

export default PlayerDetailHero;
