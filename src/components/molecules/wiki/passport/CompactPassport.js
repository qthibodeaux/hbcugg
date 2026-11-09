import { CHAMPIONS, compactTeamName, COMPACT_FACTS } from "./passportModel";
import { Box, Image, Text, Flex, Grid } from "@chakra-ui/react";
import { Watermark } from "./PassportPrimitives";

const CompactChampionBlock = ({ conf }) => {
  const champion = CHAMPIONS[conf.key];
  const championName = compactTeamName(champion.name);

  return (
    <Box
      minW={0}
      h="100%"
      border="1px solid"
      borderColor={`${conf.colors.secondary}66`}
      borderRadius="8px"
      bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.46) 78%)`}
      px="clamp(0.5rem, 1vw, 0.8rem)"
      py="clamp(0.32rem, 0.7vw, 0.55rem)"
      display="flex"
      alignItems="center"
      gap="clamp(0.45rem, 0.9vw, 0.7rem)"
      overflow="hidden"
    >
      <Image src={champion.logo} alt="" boxSize="clamp(1.5rem, 2.8vw, 2.15rem)" objectFit="contain" flexShrink={0} />
      <Box minW={0}>
        <Text fontSize="clamp(0.44rem, 0.85vw, 0.58rem)" color={conf.colors.secondary} fontWeight="black" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1} lineClamp={1}>
          {champion.year} Champion
        </Text>
        <Text mt="1px" fontSize="clamp(0.72rem, 1.35vw, 0.95rem)" color="white" fontWeight="black" lineHeight={1.02} lineClamp={1}>
          {championName}
        </Text>
      </Box>
    </Box>
  );
};

const CompactTitleLeaderCell = ({ conf }) => (
  <Box minW={0} h="100%" border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" bg="rgba(255,255,255,0.045)" overflow="hidden">
    <style>{`
      @keyframes conferenceCompactTitleTicker {
        0%, 24% { transform: translateY(0); }
        25%, 49% { transform: translateY(-25%); }
        50%, 74% { transform: translateY(-50%); }
        75%, 100% { transform: translateY(-75%); }
      }
    `}</style>
    <Box h="100%" overflow="hidden">
      <Box h="400%" style={{ animation: "conferenceCompactTitleTicker 12s steps(1, end) infinite" }}>
        {conf.titles.slice(0, 4).map((team) => (
          <Flex key={team.name} h="25%" align="center" gap="clamp(0.45rem, 0.9vw, 0.7rem)" px="clamp(0.55rem, 1.1vw, 0.85rem)">
            <Image src={team.logo} alt="" boxSize="clamp(1.45rem, 2.8vw, 2.05rem)" objectFit="contain" flexShrink={0} />
            <Box minW={0}>
              <Text fontSize="clamp(0.68rem, 1.25vw, 0.88rem)" fontWeight="black" color="white" lineHeight={1.05} lineClamp={1}>
                {compactTeamName(team.name)}
              </Text>
              <Text fontSize="clamp(0.48rem, 0.9vw, 0.62rem)" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1} lineClamp={1}>
                {team.count} titles
              </Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  </Box>
);

const CompactInfoCell = ({ label, value, icon: Icon, color }) => (
  <Flex
    minW={0}
    minH={0}
    align="center"
    gap="clamp(0.26rem, 0.55vw, 0.42rem)"
    borderRadius="8px"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg="rgba(255,255,255,0.045)"
    px="clamp(0.34rem, 0.72vw, 0.55rem)"
    py="clamp(0.2rem, 0.48vw, 0.34rem)"
    overflow="hidden"
  >
    <Flex
      boxSize="clamp(0.95rem, 1.6vw, 1.2rem)"
      align="center"
      justify="center"
      flexShrink={0}
      borderRadius="6px"
      bg={`${color}1F`}
      border="1px solid"
      borderColor={`${color}66`}
    >
      <Icon size={11} color={color} />
    </Flex>
    <Box minW={0} flex="1">
      <Text fontSize="clamp(0.4rem, 0.78vw, 0.52rem)" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1} lineClamp={1}>
        {label}
      </Text>
      <Text mt="1px" fontSize="clamp(0.62rem, 1.18vw, 0.82rem)" color="white" fontWeight="black" lineHeight={0.98} lineClamp={1}>
        {value}
      </Text>
    </Box>
  </Flex>
);

const CompactWordmark = ({ conf }) => (
  <Box minW={0} minH={0} h="100%" position="relative" overflow="hidden" display="flex" flexDirection="column" justifyContent="center">
    <Text
      maxW="min(100%, 21rem)"
      color={conf.colors.secondary}
      fontSize="clamp(0.55rem, 1vw, 0.68rem)"
      fontWeight="black"
      textTransform="uppercase"
      letterSpacing="0.14em"
      lineHeight={1.05}
      lineClamp={2}
    >
      {conf.name}
    </Text>
    <Text
      mt="clamp(0.24rem, 0.5vw, 0.4rem)"
      fontSize="clamp(1.85rem, 4.65vw, 3.65rem)"
      fontWeight="black"
      color="white"
      textTransform="uppercase"
      letterSpacing="-0.03em"
      lineHeight={0.78}
      lineClamp={1}
      whiteSpace="nowrap"
    >
      {conf.key}
    </Text>
  </Box>
);

export const CompactPassportCard = ({ conf }) => {
  const compactFacts = COMPACT_FACTS[conf.key];

  return (
    <Box
      h="100%"
      w="100%"
      minW={0}
      overflow="hidden"
      position="relative"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg={`linear-gradient(105deg, ${conf.colors.primary}38 0%, rgba(11,11,13,0.98) 48%, rgba(8,8,10,1) 100%)`}
      boxShadow={`inset 0 -3px 0 ${conf.colors.secondary}`}
      p={{ base: 3, lg: 4 }}
    >
      <Watermark conf={conf} compact />
      <Text
        position="absolute"
        right="-2%"
        top="-16%"
        fontSize="clamp(5rem, 11vw, 8.5rem)"
        color="white"
        opacity={0.035}
        fontWeight="black"
        lineHeight={0.8}
        letterSpacing="-0.08em"
        pointerEvents="none"
      >
        {conf.key}
      </Text>

      <Grid h="100%" position="relative" zIndex={1} templateRows="4fr 1fr" gap="clamp(0.5rem, 1.05vw, 0.8rem)" minH={0}>
        <Grid templateColumns="2fr 3fr" gap="clamp(0.6rem, 1.2vw, 0.95rem)" minH={0}>
          <CompactWordmark conf={conf} />
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" templateRows="repeat(3, minmax(0, 1fr))" gap="clamp(0.26rem, 0.55vw, 0.42rem)" minH={0}>
            {compactFacts.map(([label, value, Icon]) => (
              <CompactInfoCell key={label} label={label} value={value} icon={Icon} color={conf.colors.secondary} />
            ))}
          </Grid>
        </Grid>

        <Grid templateColumns="minmax(0, 1fr) minmax(0, 0.92fr)" gap="clamp(0.55rem, 1.2vw, 0.85rem)" minH={0}>
          <CompactTitleLeaderCell conf={conf} />
          <CompactChampionBlock conf={conf} />
        </Grid>
      </Grid>
    </Box>
  );
};
