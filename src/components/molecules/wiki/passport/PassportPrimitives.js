import { Text, Image, Box, Flex, Grid } from "@chakra-ui/react";
import { CHAMPIONS, CONFERENCE_FACTS } from "./passportModel";
import { BadgeCheck, Users, MapPin, Trophy, Shield } from "lucide-react";

export const Label = ({ children, color = "text.muted", ...props }) => (
  <Text
    fontSize="9px"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.16em"
    lineHeight={1.1}
    lineClamp={1}
    {...props}
  >
    {children}
  </Text>
);

const Value = ({ children, size = "md", lineClamp = 1 }) => {
  const sizes = {
    md: { fontSize: "sm", lineHeight: 1.1 },
    lg: { fontSize: "xl", lineHeight: 0.95 },
  };

  return (
    <Text fontWeight="black" color="white" lineClamp={lineClamp} {...sizes[size]}>
      {children}
    </Text>
  );
};

export const Watermark = ({ conf, compact = false }) => (
  <Image
    src={conf.logo}
    alt=""
    position="absolute"
    right={compact ? "-2%" : "-5%"}
    top={compact ? "-55%" : "-32%"}
    h={compact ? "210%" : "180%"}
    maxW={compact ? "68%" : "62%"}
    objectFit="contain"
    opacity={compact ? 0.055 : 0.055}
    filter="grayscale(1)"
    pointerEvents="none"
  />
);

const FactCell = ({ label, value, icon: Icon, color, valueSize = "md", valueLines = 1 }) => (
  <Box
    minW={0}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="8px"
    bg="rgba(255,255,255,0.04)"
    px={2.5}
    py={1.5}
    display="flex"
    alignItems="center"
    gap={2}
    h="100%"
    overflow="hidden"
  >
    <Flex
      w="22px"
      h="22px"
      align="center"
      justify="center"
      flexShrink={0}
      borderRadius="8px"
      bg={`${color}1F`}
      border="1px solid"
      borderColor={`${color}66`}
    >
      <Icon size={12} color={color} />
    </Flex>
    <Box minW={0}>
      <Label>{label}</Label>
      <Value size={valueSize} lineClamp={valueLines}>
        {value}
      </Value>
    </Box>
  </Box>
);

export const ChampionBlock = ({ conf, compact = false }) => {
  const champion = CHAMPIONS[conf.key];

  return (
    <Box
      minW={0}
      h="100%"
      border="1px solid"
      borderColor={`${conf.colors.secondary}55`}
      borderRadius="8px"
      bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.42) 78%)`}
      px={compact ? "clamp(0.55rem, 1.2vw, 0.9rem)" : 3}
      py={compact ? "clamp(0.35rem, 0.8vw, 0.65rem)" : 1.5}
      display="flex"
      alignItems="center"
      gap={compact ? "clamp(0.45rem, 1vw, 0.75rem)" : 2.5}
      overflow="hidden"
    >
      <Image src={champion.logo} alt="" boxSize={compact ? "clamp(1.55rem, 3.1vw, 2.25rem)" : "28px"} objectFit="contain" flexShrink={0} />
      <Box minW={0}>
        <Label color={conf.colors.secondary}>{champion.year} Champion</Label>
        <Text fontSize={compact ? "clamp(0.74rem, 1.5vw, 0.98rem)" : "sm"} color="white" fontWeight="black" lineHeight={1.02} lineClamp={compact ? 2 : 1}>
          {champion.name}
        </Text>
      </Box>
    </Box>
  );
};

export const TitleLeaderCell = ({ conf }) => (
  <Box minW={0} border="1px solid" borderColor="whiteAlpha.100" borderRadius="8px" bg="rgba(255,255,255,0.04)" overflow="hidden" h="100%">
    <style>{`
      @keyframes conferencePassportTitleTicker {
        0%, 24% { transform: translateY(0); }
        25%, 49% { transform: translateY(-25%); }
        50%, 74% { transform: translateY(-50%); }
        75%, 100% { transform: translateY(-75%); }
      }
    `}</style>
    <Box h="100%" minH="48px" overflow="hidden">
      <Box style={{ animation: "conferencePassportTitleTicker 12s steps(1, end) infinite" }}>
        {conf.titles.slice(0, 4).map((team) => (
          <Flex key={team.name} h="52px" align="center" gap={2.5} px={3}>
            <Image src={team.logo} alt="" boxSize="28px" objectFit="contain" flexShrink={0} />
            <Box minW={0}>
              <Text fontSize="xs" fontWeight="black" color="white" lineClamp={1}>
                {team.name}
              </Text>
              <Text fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
                {team.count} titles
              </Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  </Box>
);

export const EightFieldPassport = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];

  return (
    <Grid h="100%" templateColumns="repeat(2, minmax(0, 1fr))" templateRows="repeat(4, minmax(0, 1fr))" gap={2} minW={0} minH={0}>
      <FactCell label="Est." value={conf.founded} icon={BadgeCheck} color={conf.colors.secondary} valueSize="lg" />
      <FactCell label="Programs" value={facts.programs} icon={Users} color={conf.colors.secondary} valueSize="lg" />
      <FactCell label="HQ" value={conf.hq} icon={MapPin} color={conf.colors.secondary} />
      <FactCell label="Bowl Wins" value={facts.bowlWins} icon={Trophy} color={conf.colors.secondary} valueSize="lg" />
      <FactCell label="Commissioner" value={facts.commissioner} icon={Shield} color={conf.colors.secondary} />
      <FactCell label="Postseason" value={facts.postseason} icon={Trophy} color={conf.colors.secondary} />
    </Grid>
  );
};
