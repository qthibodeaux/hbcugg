import React from "react";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BadgeCheck, Building2, MapPin, Shield, Trophy, Users } from "lucide-react";
import { MEAC, SWAC } from "../../../data/wiki_data";

const CHAMPIONS = {
  MEAC: {
    year: "2025",
    name: "South Carolina State",
    logo: "/assets/meacscsu.svg",
    label: "Reigning Champion",
  },
  SWAC: {
    year: "2025",
    name: "Prairie View A&M",
    logo: "/assets/swacpvamu.svg",
    label: "Reigning Champion",
  },
};

const CONFERENCE_FACTS = {
  MEAC: {
    programs: "6",
    bowlWins: "6",
    format: "Single Table",
    titlePath: "Regular Season",
    commissioner: "Sonja Stills",
    postseason: "Celebration Bowl",
  },
  SWAC: {
    programs: "12",
    bowlWins: "4",
    format: "East / West",
    titlePath: "Title Game",
    commissioner: "Dr. McClelland",
    postseason: "Celebration Bowl",
  },
};

const conferences = {
  MEAC: MEAC,
  SWAC: SWAC,
};

const Label = ({ children, color = "text.muted" }) => (
  <Text
    fontSize="9px"
    fontWeight="black"
    color={color}
    textTransform="uppercase"
    letterSpacing="0.16em"
    lineHeight={1.1}
  >
    {children}
  </Text>
);

const Value = ({ children, size = "md", color = "white", lineClamp = 1 }) => {
  const sizes = {
    sm: { fontSize: "xs", lineHeight: 1.1 },
    md: { fontSize: "sm", lineHeight: 1.1 },
    lg: { fontSize: "xl", lineHeight: 0.95 },
    xl: { fontSize: "3xl", lineHeight: 0.9 },
  };

  return (
    <Text fontWeight="black" color={color} lineClamp={lineClamp} {...sizes[size]}>
      {children}
    </Text>
  );
};

const FactCell = ({
  label,
  value,
  icon: Icon,
  color = "#FFD100",
  wide = false,
  valueSize = "md",
  valueLines,
  compact = false,
}) => (
  <Box
    minW={0}
    gridColumn={wide ? "span 2" : "span 1"}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    bg="rgba(255,255,255,0.04)"
    px={compact ? 2.5 : 3}
    py={compact ? 1.5 : 2.5}
    display="flex"
    alignItems="center"
    gap={compact ? 2 : 2.5}
    h="100%"
    overflow="hidden"
  >
    {Icon && (
      <Flex
        w={compact ? "22px" : "30px"}
        h={compact ? "22px" : "30px"}
        align="center"
        justify="center"
        flexShrink={0}
        borderRadius="md"
        bg={`${color}1F`}
        border="1px solid"
        borderColor={`${color}66`}
      >
        <Icon size={compact ? 12 : 15} color={color} />
      </Flex>
    )}
    <Box minW={0}>
      <Label>{label}</Label>
      <Value size={valueSize} lineClamp={valueLines || (wide ? 2 : 1)}>
        {value}
      </Value>
    </Box>
  </Box>
);

const HeroStats = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];
  return (
    <Flex gap={5} align="flex-start" justify="flex-end">
      {[
        ["Programs", facts.programs],
        ["Bowl Wins", facts.bowlWins],
      ].map(([label, value]) => (
        <Box key={label} textAlign="right">
          <Label>{label}</Label>
          <Text fontSize="4xl" color={conf.colors.secondary} fontWeight="black" lineHeight={0.92}>
            {value}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

const ChampionCell = ({ conf, wide = true }) => {
  const champion = CHAMPIONS[conf.key];
  return (
    <Box
      minW={0}
      gridColumn={wide ? "span 2" : "span 1"}
      border="1px solid"
      borderColor={`${conf.colors.secondary}55`}
      borderRadius="lg"
      bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.46) 68%)`}
      px={3}
      py={2.5}
    >
      <Flex align="center" gap={3}>
        <Image src={champion.logo} alt="" boxSize="36px" objectFit="contain" flexShrink={0} />
        <Box minW={0}>
          <Label color={conf.colors.secondary}>
            {champion.year} {champion.label}
          </Label>
          <Value size="lg" color="white" lineClamp={1}>
            {champion.name}
          </Value>
        </Box>
      </Flex>
    </Box>
  );
};

const TitleLedger = ({ conf }) => (
  <Box overflow="hidden" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" bg="rgba(255,255,255,0.035)">
    <style>{`
      @keyframes conferenceTitleTicker {
        0%, 24% { transform: translateY(0); }
        25%, 49% { transform: translateY(-25%); }
        50%, 74% { transform: translateY(-50%); }
        75%, 100% { transform: translateY(-75%); }
      }
    `}</style>
    <Box h="58px" overflow="hidden">
      <Box style={{ animation: "conferenceTitleTicker 12s steps(1, end) infinite" }}>
        {conf.titles.slice(0, 4).map((team) => (
          <Flex key={team.name} h="58px" align="center" gap={3} px={3}>
            <Image src={team.logo} alt="" boxSize="34px" objectFit="contain" flexShrink={0} />
            <Box minW={0}>
              <Text fontSize="sm" fontWeight="black" color="white" lineClamp={1}>
                {team.name}
              </Text>
              <Text fontSize="10px" color="text.muted" fontWeight="bold">
                {team.count} conference titles
              </Text>
            </Box>
          </Flex>
        ))}
      </Box>
    </Box>
  </Box>
);

const TitleLeaderCell = ({ conf }) => (
  <Box
    minW={0}
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="lg"
    bg="rgba(255,255,255,0.04)"
    overflow="hidden"
    h="100%"
  >
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

const PassportChampionCell = ({ conf }) => {
  const champion = CHAMPIONS[conf.key];
  return (
    <Box
      minW={0}
      border="1px solid"
      borderColor={`${conf.colors.secondary}55`}
      borderRadius="lg"
      bg={`linear-gradient(135deg, ${conf.colors.primary}55 0%, rgba(0,0,0,0.42) 78%)`}
      px={3}
      py={1.5}
      display="flex"
      alignItems="center"
      gap={2.5}
      h="100%"
    >
      <Image src={champion.logo} alt="" boxSize="28px" objectFit="contain" flexShrink={0} />
      <Box minW={0}>
        <Label color={conf.colors.secondary}>{champion.year} Champion</Label>
        <Value size="md" lineClamp={1}>
          {champion.name}
        </Value>
      </Box>
    </Box>
  );
};

const EstablishedStamp = ({ conf }) => (
  <Flex
    h="100%"
    minH="92px"
    align="center"
    justify="center"
    direction="column"
    border="1px solid"
    borderColor={`${conf.colors.secondary}55`}
    borderRadius="lg"
    bg={`${conf.colors.secondary}12`}
    position="relative"
    overflow="hidden"
  >
    <Text
      position="absolute"
      top="10px"
      left="-2px"
      transform="rotate(-90deg)"
      transformOrigin="right top"
      fontSize="9px"
      color={conf.colors.secondary}
      fontWeight="black"
      letterSpacing="0.18em"
    >
      EST.
    </Text>
    <Text fontSize="4xl" color="white" fontWeight="black" lineHeight={0.86}>
      {conf.founded}
    </Text>
    <Text mt={1} fontSize="9px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
      Founded
    </Text>
  </Flex>
);

const Watermark = ({ conf, opacity = 0.06 }) => (
  <Image
    src={conf.logo}
    alt=""
    position="absolute"
    right="-5%"
    top="-32%"
    h="180%"
    maxW="62%"
    objectFit="contain"
    opacity={opacity}
    filter="grayscale(1)"
    pointerEvents="none"
  />
);

const SplitShell = ({ children, accent = "#FFD100", bg }) => (
  <Box
    h="100%"
    w="100%"
    overflow="hidden"
    position="relative"
    borderRadius="xl"
    border="1px solid"
    borderColor="whiteAlpha.100"
    bg={bg || "linear-gradient(135deg, rgba(11,11,13,0.99) 0%, rgba(17,17,20,0.98) 100%)"}
    boxShadow={`inset 0 -3px 0 ${accent}`}
  >
    {children}
  </Box>
);

const MiniMasthead = ({ conf }) => (
  <Box minW={0} position="relative" zIndex={2}>
    <Label color={conf.colors.secondary}>{conf.name}</Label>
    <Flex align="center" gap={3} mt={1}>
      <Text
        fontSize="clamp(3.4rem, 7vw, 6.25rem)"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        letterSpacing="0"
        lineHeight={0.78}
      >
        {conf.key}
      </Text>
      <Image
        src={conf.logo}
        alt={`${conf.key} logo`}
        h="40px"
        maxW="92px"
        objectFit="contain"
        filter="drop-shadow(0 8px 18px rgba(0,0,0,0.55))"
      />
    </Flex>
    <Text
      mt={2}
      fontSize="10px"
      color={conf.colors.secondary}
      fontWeight="black"
      fontStyle="italic"
      textTransform="uppercase"
      letterSpacing="0"
      lineClamp={1}
    >
      "{conf.slogan}"
    </Text>
  </Box>
);

const CompactPassport = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];
  return (
    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={2} minW={0}>
      <FactCell label="Est." value={conf.founded} icon={BadgeCheck} color={conf.colors.secondary} />
      <FactCell label="Programs" value={facts.programs} icon={Users} color={conf.colors.secondary} />
      <FactCell label="Bowl Wins" value={facts.bowlWins} icon={Trophy} color={conf.colors.secondary} />
      <FactCell label="Format" value={facts.format} icon={Building2} color={conf.colors.secondary} />
      <FactCell label="Commissioner" value={conf.commissioner} icon={Shield} color={conf.colors.secondary} wide />
      <ChampionCell conf={conf} />
    </Grid>
  );
};

const EightFieldPassport = ({ conf }) => {
  const facts = CONFERENCE_FACTS[conf.key];

  return (
    <Grid
      h="100%"
      templateColumns="repeat(2, minmax(0, 1fr))"
      templateRows="repeat(4, minmax(0, 1fr))"
      gap={2}
      minW={0}
      minH={0}
    >
      <FactCell label="Est." value={conf.founded} icon={BadgeCheck} color={conf.colors.secondary} valueSize="lg" compact />
      <FactCell label="Programs" value={facts.programs} icon={Users} color={conf.colors.secondary} valueSize="lg" compact />
      <FactCell label="HQ" value={conf.hq} icon={MapPin} color={conf.colors.secondary} valueLines={1} compact />
      <FactCell label="Bowl Wins" value={facts.bowlWins} icon={Trophy} color={conf.colors.secondary} valueSize="lg" compact />
      <FactCell label="Commissioner" value={facts.commissioner} icon={Shield} color={conf.colors.secondary} valueLines={1} compact />
      <FactCell label="Format" value={facts.format} icon={Building2} color={conf.colors.secondary} valueLines={1} compact />
      <FactCell label="Title Path" value={facts.titlePath} icon={Trophy} color={conf.colors.secondary} valueLines={1} compact />
      <FactCell label="Postseason" value={facts.postseason} icon={Trophy} color={conf.colors.secondary} valueLines={1} compact />
    </Grid>
  );
};

const HybridMastheadPanel = ({ conf }) => (
  <Box minW={0} h="100%" position="relative" zIndex={2} display="flex" flexDirection="column" justifyContent="center">
    <Label color={conf.colors.secondary}>{conf.name}</Label>
    <Flex align="center" gap={3} mt={1}>
      <Text
        fontSize="clamp(3rem, 6vw, 5.35rem)"
        fontWeight="black"
        color="white"
        textTransform="uppercase"
        letterSpacing="0"
        lineHeight={0.78}
      >
        {conf.key}
      </Text>
      <Image
        src={conf.logo}
        alt={`${conf.key} logo`}
        h="42px"
        maxW="98px"
        objectFit="contain"
        filter="drop-shadow(0 8px 18px rgba(0,0,0,0.55))"
      />
    </Flex>
    <Text
      mt={2}
      fontSize="10px"
      color={conf.colors.secondary}
      fontWeight="black"
      fontStyle="italic"
      textTransform="uppercase"
      letterSpacing="0"
      lineClamp={2}
      maxW="300px"
    >
      "{conf.slogan}"
    </Text>
  </Box>
);

const ConferenceHalf = ({ conf, variant = "passport" }) => {
  if (variant === "stamp") {
    return (
      <Box
        minW={0}
        h="100%"
        position="relative"
        overflow="hidden"
        p={3}
        borderRadius="lg"
        bg={`linear-gradient(135deg, ${conf.colors.primary}33 0%, rgba(255,255,255,0.035) 58%, rgba(0,0,0,0.16) 100%)`}
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Watermark conf={conf} opacity={0.06} />
        <Grid h="100%" templateColumns="minmax(0, 1fr) 130px" gap={3} alignItems="stretch">
          <Flex direction="column" justify="space-between" minW={0}>
            <MiniMasthead conf={conf} />
            <ChampionCell conf={conf} />
          </Flex>
          <Flex direction="column" gap={2}>
            <EstablishedStamp conf={conf} />
            <FactCell label="HQ" value={conf.hq} icon={MapPin} color={conf.colors.secondary} />
          </Flex>
        </Grid>
      </Box>
    );
  }

  if (variant === "ledger") {
    return (
      <Box
        minW={0}
        h="100%"
        position="relative"
        overflow="hidden"
        p={4}
        borderRadius="lg"
        bg={`linear-gradient(135deg, rgba(255,255,255,0.045) 0%, ${conf.colors.primary}26 100%)`}
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Watermark conf={conf} opacity={0.05} />
        <Grid h="100%" templateRows="auto 1fr" gap={3}>
          <Flex align="flex-start" justify="space-between" gap={3}>
            <MiniMasthead conf={conf} />
            <HeroStats conf={conf} />
          </Flex>
          <Grid templateColumns="minmax(0, 1fr) minmax(0, 1fr)" gap={3} alignItems="end">
            <TitleLedger conf={conf} />
            <ChampionCell conf={conf} wide={false} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (variant === "merged") {
    return (
      <Box
        minW={0}
        h="100%"
        position="relative"
        overflow="hidden"
        p={4}
        borderRadius="lg"
        bg={`linear-gradient(135deg, ${conf.colors.primary}33 0%, rgba(255,255,255,0.035) 58%, rgba(0,0,0,0.18) 100%)`}
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Watermark conf={conf} opacity={0.055} />
        <Grid h="100%" templateRows="minmax(0, 1fr) 52px" gap={2.5} minH={0}>
          <Grid templateColumns="minmax(0, 1.5fr) minmax(280px, 1fr)" gap={3} minH={0} alignItems="stretch">
            <HybridMastheadPanel conf={conf} />
            <EightFieldPassport conf={conf} />
          </Grid>
          <Grid templateColumns="minmax(0, 1fr) minmax(0, 0.92fr)" gap={3} minH={0}>
            <TitleLeaderCell conf={conf} />
            <PassportChampionCell conf={conf} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      minW={0}
      h="100%"
      position="relative"
      overflow="hidden"
      p={4}
      borderRadius="lg"
      bg={`linear-gradient(135deg, ${conf.colors.primary}33 0%, rgba(255,255,255,0.035) 62%)`}
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Watermark conf={conf} opacity={0.06} />
      <Grid h="100%" templateColumns="minmax(0, 0.92fr) minmax(300px, 1fr)" gap={4} alignItems="center">
        <MiniMasthead conf={conf} />
        <CompactPassport conf={conf} />
      </Grid>
    </Box>
  );
};

export const ConferenceIdentityPassportA = () => (
  <SplitShell accent="#FFD100">
    <Grid h="100%" templateColumns="repeat(2, minmax(0, 1fr))" gap={3} p={3}>
      <ConferenceHalf conf={conferences.SWAC} />
      <ConferenceHalf conf={conferences.MEAC} />
    </Grid>
  </SplitShell>
);

export const ConferenceIdentityPassportB = () => (
  <SplitShell accent="#E53E3E" bg="linear-gradient(90deg, rgba(111,38,51,0.22) 0%, rgba(11,11,13,0.99) 50%, rgba(75,0,130,0.22) 100%)">
    <Grid h="100%" templateColumns="repeat(2, minmax(0, 1fr))" gap={3} p={3}>
      <ConferenceHalf conf={conferences.SWAC} variant="stamp" />
      <ConferenceHalf conf={conferences.MEAC} variant="stamp" />
    </Grid>
  </SplitShell>
);

export const ConferenceIdentityPassportC = () => (
  <SplitShell accent="#FFFFFF">
    <Grid h="100%" templateColumns="repeat(2, minmax(0, 1fr))" gap={3} p={3}>
      <ConferenceHalf conf={conferences.SWAC} variant="ledger" />
      <ConferenceHalf conf={conferences.MEAC} variant="ledger" />
    </Grid>
  </SplitShell>
);

export const ConferenceIdentityPassportD = () => (
  <SplitShell accent="#FFD100" bg="linear-gradient(90deg, rgba(111,38,51,0.18) 0%, rgba(11,11,13,0.99) 50%, rgba(75,0,130,0.18) 100%)">
    <Grid h="100%" templateColumns="repeat(2, minmax(0, 1fr))" gap={3} p={3}>
      <ConferenceHalf conf={conferences.SWAC} variant="merged" />
      <ConferenceHalf conf={conferences.MEAC} variant="merged" />
    </Grid>
  </SplitShell>
);
