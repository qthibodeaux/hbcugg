import { Badge, Box, Flex, Image, Text } from "@chakra-ui/react";

const TeamChip = ({ team, fallback }) => {
  const label = team?.shortName ?? team?.name ?? fallback ?? "TEAM";

  return (
    <Flex align="center" gap={2} minW={0}>
      <Box
        w="30px"
        h="30px"
        borderRadius="8px"
        bg="whiteAlpha.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        flexShrink={0}
      >
        {team?.logo ? (
          <Image src={team.logo} alt={label} w="22px" h="22px" objectFit="contain" />
        ) : (
          <Text fontSize="10px" fontWeight="black" color="whiteAlpha.800">
            {String(label).slice(0, 3).toUpperCase()}
          </Text>
        )}
      </Box>
      <Text fontSize="sm" color="white" fontWeight="bold" textTransform="uppercase" lineClamp={1}>
        {label}
      </Text>
    </Flex>
  );
};

const ScorePair = ({ homeScore, awayScore, muted = false }) => (
  <Flex gap={3} align="center" minW="58px" justify="flex-end">
    <Text fontSize="lg" fontWeight="black" color={muted ? "whiteAlpha.600" : "white"}>
      {homeScore ?? "--"}
    </Text>
    <Text fontSize="lg" fontWeight="black" color={muted ? "whiteAlpha.600" : "white"}>
      {awayScore ?? "--"}
    </Text>
  </Flex>
);

const winnerPrimary = (card) => {
  const home = Number(card?.homeScore);
  const away = Number(card?.awayScore);
  if (Number.isFinite(home) && Number.isFinite(away)) {
    if (home > away) return card?.home?.primary;
    if (away > home) return card?.away?.primary;
  }
  return card?.home?.primary;
};

const VariantBroadcast = ({ card }) => (
  <Box
    h="100%"
    borderRadius="xl"
    p={4}
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg={`linear-gradient(155deg, ${winnerPrimary(card) ?? "#1a1a1d"} 0%, rgba(8,8,10,0.92) 62%)`}
  >
    <Flex justify="space-between" align="center" mb={3}>
      <Badge bg="whiteAlpha.200" color="white" fontSize="9px" letterSpacing="0.08em">
        FINAL
      </Badge>
      <Text fontSize="10px" color="whiteAlpha.700" textTransform="uppercase">
        {card.stageLabel ?? card.dateLabel}
      </Text>
    </Flex>

    <Flex direction="column" gap={2}>
      <Flex justify="space-between" align="center">
        <TeamChip team={card.home} fallback="HOME" />
        <Text fontSize="2xl" color="white" fontWeight="black">{card.homeScore}</Text>
      </Flex>
      <Flex justify="space-between" align="center">
        <TeamChip team={card.away} fallback="AWAY" />
        <Text fontSize="2xl" color="white" fontWeight="black">{card.awayScore}</Text>
      </Flex>
    </Flex>

    <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.300">
      <Text fontSize="xs" color="whiteAlpha.900" fontWeight="bold" lineClamp={1}>
        MVP: {card.mvp}
      </Text>
    </Box>
  </Box>
);

const VariantRivalry = ({ card }) => (
  <Box
    h="100%"
    borderRadius="xl"
    p={4}
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg="blackAlpha.500"
    position="relative"
    overflow="hidden"
  >
    <Box position="absolute" top={2} right={-28} transform="rotate(28deg)" bg="brand.500" px={8} py={1}>
      <Text fontSize="9px" color="white" fontWeight="black" letterSpacing="0.12em">UPSET</Text>
    </Box>

    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em" mb={3}>
      Rivalry Heat
    </Text>

    <Flex justify="space-between" align="center" mb={2}>
      <TeamChip team={card.home} fallback="HOME" />
      <Text fontSize="xl" color="brand.300" fontWeight="black">{card.homeScore}</Text>
    </Flex>
    <Flex justify="space-between" align="center" mb={2}>
      <TeamChip team={card.away} fallback="AWAY" />
      <Text fontSize="xl" color="brand.300" fontWeight="black">{card.awayScore}</Text>
    </Flex>

    <Flex mt={3} gap={2} wrap="wrap">
      <Badge bg="whiteAlpha.200" color="white" fontSize="9px">{card.record}</Badge>
      <Badge bg="orange.500" color="black" fontSize="9px">{card.streak}</Badge>
    </Flex>
  </Box>
);

const VariantDataTile = ({ card }) => (
  <Box
    h="100%"
    borderRadius="xl"
    p={4}
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg={`linear-gradient(180deg, rgba(255,255,255,0.03) 0%, ${card.away?.primary ?? "#151519"} 100%)`}
  >
    <Flex justify="space-between" align="center" mb={2}>
      <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
        {card.stageLabel ?? "Upcoming Mock"}
      </Text>
      <ScorePair homeScore={card.homeScore} awayScore={card.awayScore} muted />
    </Flex>

    <Flex direction="column" gap={2}>
      <TeamChip team={card.home} fallback="HOME" />
      <TeamChip team={card.away} fallback="AWAY" />
    </Flex>

    <Box mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.300">
      <Text fontSize="xs" color="text.secondary" lineClamp={1}>{card.fact}</Text>
      <Text fontSize="xs" color="brand.300" fontWeight="bold" mt={1} lineClamp={1}>{card.playerLine}</Text>
    </Box>
  </Box>
);

const VariantMagazine = ({ card }) => (
  <Box
    h="100%"
    borderRadius="xl"
    p={4}
    border="1px solid"
    borderColor="whiteAlpha.200"
    bg="linear-gradient(135deg, rgba(245,101,101,0.14) 0%, rgba(8,8,10,0.95) 65%)"
  >
    <Text fontSize="9px" color="orange.200" textTransform="uppercase" letterSpacing="0.14em" mb={2}>
      {card.stageLabel ?? "Spotlight"}
    </Text>

    <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" lineHeight={1} mb={3}>
      {card.headline}
    </Text>

    <Flex justify="space-between" align="center" mb={2}>
      <TeamChip team={card.home} fallback="HOME" />
      <Text fontSize="xl" color="white" fontWeight="black">{card.homeScore}</Text>
    </Flex>
    <Flex justify="space-between" align="center">
      <TeamChip team={card.away} fallback="AWAY" />
      <Text fontSize="xl" color="white" fontWeight="black">{card.awayScore}</Text>
    </Flex>

    <Text mt={3} fontSize="xs" color="text.secondary" lineClamp={2}>
      {card.fact}
    </Text>
  </Box>
);

const VARIANTS = [VariantBroadcast, VariantRivalry, VariantDataTile, VariantMagazine];
const VARIANT_BY_KEY = {
  broadcast: VariantBroadcast,
  rivalry: VariantRivalry,
  data: VariantDataTile,
  spotlight: VariantMagazine,
};

const GameCardStyleLab = ({ card, variantIndex = 0, variant = null }) => {
  const Variant =
    (variant ? VARIANT_BY_KEY[variant] : null) ??
    VARIANTS[variantIndex % VARIANTS.length] ??
    VariantBroadcast;
  return <Variant card={card} />;
};

export default GameCardStyleLab;
