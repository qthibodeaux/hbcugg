import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { MapPin } from "lucide-react";

const TEAM = {
  shortName: "NSU",
  name: "Norfolk State",
  logo: "/assets/meacnsu.svg",
  primary: "#007A5E",
  secondary: "#FFC72C",
};

const ROWS = [
  {
    id: "w7-outside",
    week: "W7",
    date: "Oct 10",
    opponent: "Wofford",
    opponentShort: "Wof",
    opponentLogo: null,
    location: "AWAY - Spartanburg, SC",
    city: "Spartanburg, SC",
    stadium: "Gibbs Stadium",
    result: "L",
    score: "14-31",
    tag: "NON-CONF",
    isHbcu: false,
  },
  {
    id: "w9-sc-state",
    week: "W9",
    date: "Oct 24",
    opponent: "SCSU",
    opponentName: "South Carolina State",
    opponentShort: "SCSU",
    opponentLogo: "/assets/meacscsu.svg",
    opponentPrimary: "#900027",
    opponentSecondary: "#002B54",
    location: 'HOME - Norfolk, Virginia (William "Dick" Price Stadium)',
    city: "Norfolk, VA",
    stadium: 'William "Dick" Price Stadium',
    result: "L",
    score: "20-51",
    tag: "MEAC",
    gameName: "Conference",
    isHbcu: true,
    hasRecap: true,
  },
  {
    id: "w11-del-state",
    week: "W11",
    date: "Nov 7",
    opponent: "DSU",
    opponentName: "Delaware State",
    opponentShort: "DSU",
    opponentLogo: "/assets/meacdsu.svg",
    opponentPrimary: "#EE3124",
    opponentSecondary: "#0077C8",
    location: "AWAY - Dover, DE",
    city: "Dover, DE",
    stadium: "Alumni Stadium",
    result: "W",
    score: "34-27",
    tag: "MEAC",
    gameName: "Road Conference",
    isHbcu: true,
    hasRecap: true,
  },
];

const WeekCell = ({ row }) => (
  <Box w="58px" flexShrink={0} textAlign="center">
    <Box borderRadius="md" bg="whiteAlpha.100" px={2} py={1}>
      <Text fontSize="xs" color="white" fontWeight="black">{row.week}</Text>
    </Box>
    <Text mt={1} fontSize="8px" color="text.muted">{row.date}</Text>
  </Box>
);

const InitialBadge = ({ label, large = false }) => (
  <Flex
    w={large ? { base: "50px", xl: "76px" } : "38px"}
    h={large ? { base: "50px", xl: "76px" } : "38px"}
    borderRadius="md"
    bg="whiteAlpha.100"
    align="center"
    justify="center"
    flexShrink={0}
  >
    <Text fontSize={large ? { base: "lg", xl: "2xl" } : "10px"} color="text.secondary" fontWeight="black" lineClamp={1}>
      {label}
    </Text>
  </Flex>
);

const LogoBadge = ({ src, label, color, square = false, size = "42px" }) => (
  <Flex
    w={size}
    h={size}
    borderRadius={square ? "md" : "full"}
    bg={`${color ?? "#27272A"}30`}
    border="1px solid"
    borderColor={`${color ?? "#FFFFFF"}88`}
    align="center"
    justify="center"
    flexShrink={0}
    overflow="hidden"
  >
    {src ? (
      <Image src={src} alt={label} w="78%" h="78%" objectFit="contain" />
    ) : (
      <Text fontSize="10px" color="text.muted" fontWeight="black">{label}</Text>
    )}
  </Flex>
);

const ScoreBlock = ({ row, color = "brand.400" }) => (
  <Box textAlign="right" minW="82px">
    <Text fontSize="lg" color={row.result === "W" ? "green.400" : "red.300"} fontWeight="black" lineHeight={1}>
      {row.result} {row.score}
    </Text>
    {row.hasRecap && (
      <Text mt={1} fontSize="8px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
        View Recap ->
      </Text>
    )}
  </Box>
);

const BaselineRow = ({ row }) => (
  <Flex h="76px" align="center" gap={4} px={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
    <WeekCell row={row} />
    <InitialBadge label={row.opponentShort} />
    <Box minW={0} flex={1}>
      <Text fontSize="md" color="white" fontWeight="black" lineClamp={1}>{row.opponentName ?? row.opponent}</Text>
      <Text fontSize="9px" color="text.muted" textTransform="uppercase" lineClamp={1}>{row.location}</Text>
    </Box>
    <Box px={2} py={1} borderRadius="md" bg="whiteAlpha.100">
      <Text fontSize="8px" color="text.muted" fontWeight="black">{row.tag}</Text>
    </Box>
    <ScoreBlock row={row} />
  </Flex>
);

const IdentityRailRow = ({ row }) => {
  const accent = row.opponentSecondary ?? row.opponentPrimary ?? TEAM.secondary;
  const bg = "bg.secondary";

  return (
    <Flex h="82px" align="center" gap={4} px={4} borderBottom="1px solid" borderColor="whiteAlpha.100" bg={bg} position="relative" overflow="hidden">
      {row.isHbcu && <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} />}
      <WeekCell row={row} />
      {row.isHbcu ? (
        <LogoBadge src={row.opponentLogo} label={row.opponentShort} color={accent} square />
      ) : (
        <InitialBadge label={row.opponentShort} />
      )}
      <Box minW={0} flex={1}>
        <Flex align="center" gap={2} minW={0}>
          <Text fontSize="md" color="white" fontWeight="black" lineClamp={1}>{row.opponentName ?? row.opponent}</Text>
          {row.isHbcu && (
            <Box px={2} py="2px" borderRadius="sm" bg={`${accent}22`} border="1px solid" borderColor={`${accent}77`}>
              <Text fontSize="7px" color={accent} fontWeight="black" textTransform="uppercase">{row.tag}</Text>
            </Box>
          )}
        </Flex>
        <Text mt={1} fontSize="9px" color="text.muted" textTransform="uppercase" lineClamp={1}>{row.location}</Text>
      </Box>
      <ScoreBlock row={row} color={accent} />
    </Flex>
  );
};

const MatchupLockupRow = ({ row }) => {
  const accent = row.opponentSecondary ?? row.opponentPrimary ?? TEAM.secondary;

  if (!row.isHbcu) return <BaselineRow row={row} />;

  return (
    <Grid h="92px" templateColumns="58px 150px minmax(0, 1fr) 96px" alignItems="center" gap={4} px={4} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="rgba(20,20,22,0.98)">
      <WeekCell row={row} />
      <Flex align="center" gap={2}>
        <LogoBadge src={TEAM.logo} label={TEAM.shortName} color={TEAM.secondary} square size="40px" />
        <Text fontSize="9px" color="text.muted" fontWeight="black">VS</Text>
        <LogoBadge src={row.opponentLogo} label={row.opponentShort} color={accent} square size="40px" />
      </Flex>
      <Box minW={0}>
        <Text fontSize="10px" color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineClamp={1}>
          {row.gameName}
        </Text>
        <Text mt={1} fontSize="lg" color="white" fontWeight="black" lineClamp={1}>
          {TEAM.shortName} vs {row.opponentShort}
        </Text>
        <Text fontSize="9px" color="text.muted" textTransform="uppercase" lineClamp={1}>{row.location}</Text>
      </Box>
      <ScoreBlock row={row} color={accent} />
    </Grid>
  );
};

const EditorialRecapRow = ({ row }) => {
  const accent = row.opponentSecondary ?? row.opponentPrimary ?? TEAM.secondary;

  if (!row.isHbcu) return <BaselineRow row={row} />;

  return (
    <Box h="96px" position="relative" overflow="hidden" borderBottom="1px solid" borderColor="whiteAlpha.100" bg={row.opponentPrimary}>
      <Box position="absolute" inset={0} bg="rgba(0,0,0,0.42)" />
      <Image src={row.opponentLogo} alt="" position="absolute" right="-18px" top="-22px" w="130px" h="130px" objectFit="contain" opacity={0.14} />
      <Grid position="relative" zIndex={1} h="100%" templateColumns="58px 52px minmax(0, 1fr) 94px" alignItems="center" gap={4} px={4}>
        <WeekCell row={row} />
        <LogoBadge src={row.opponentLogo} label={row.opponentShort} color={accent} square size="48px" />
        <Box minW={0}>
          <Text fontSize="8px" color={accent} fontWeight="black" textTransform="uppercase" letterSpacing="0.14em" lineClamp={1}>
            HBCU Recap Ready
          </Text>
          <Text mt={1} fontSize="xl" color="white" fontWeight="black" lineClamp={1}>{row.opponentName}</Text>
          <Text fontSize="9px" color="rgba(255,255,255,0.68)" textTransform="uppercase" lineClamp={1}>{row.location}</Text>
        </Box>
        <ScoreBlock row={row} color={accent} />
      </Grid>
    </Box>
  );
};

const DenseLedgerRow = ({ row }) => {
  const isHbcu = row.isHbcu;
  const accent = row.opponentSecondary ?? row.opponentPrimary ?? TEAM.secondary;
  const rowBg = "rgba(20,20,22,0.98)";
  const opponentName = row.opponentName ?? row.opponent;

  return (
    <Grid
      minH={{ base: "94px", xl: "112px" }}
      templateColumns={{
        base: "52px 42px minmax(0, 1fr) 78px",
        xl: "72px 64px minmax(0, 2fr) minmax(0, 1.1fr) 92px 98px 104px",
      }}
      alignItems="center"
      gap={{ base: 2, xl: 4 }}
      px={{ base: 2, xl: 4 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
      bg={rowBg}
      position="relative"
      overflow="hidden"
    >
      {isHbcu && <Box position="absolute" left={0} top={0} bottom={0} w={{ base: "4px", xl: "5px" }} bg={accent} />}

      <Box textAlign="center">
        <Box borderRadius="md" bg={isHbcu ? `${accent}24` : "whiteAlpha.100"} border="1px solid" borderColor={isHbcu ? `${accent}88` : "whiteAlpha.100"} px={{ base: 1, xl: 2 }} py={1}>
          <Text fontSize={{ base: "11px", xl: "sm" }} color="white" fontWeight="black">{row.week}</Text>
        </Box>
      </Box>

      <Box textAlign="center">
        <Text fontSize={{ base: "9px", xl: "11px" }} color="white" fontWeight="black">{row.date.split(" ")[0]}</Text>
        <Text fontSize={{ base: "7px", xl: "8px" }} color="text.muted" fontWeight="black" textTransform="uppercase">{row.date.split(" ")[1] ?? "Sat"}</Text>
      </Box>

      <Flex align="center" gap={{ base: 2, xl: 4 }} minW={0}>
        {isHbcu ? (
          <Image
            src={row.opponentLogo}
            alt={row.opponentShort}
            w={{ base: "58px", xl: "82px" }}
            h={{ base: "58px", xl: "82px" }}
            objectFit="contain"
            flexShrink={0}
          />
        ) : (
          <InitialBadge label={row.opponentShort} large />
        )}
        <Box minW={0}>
          <Text fontSize={{ base: "2xl", xl: "3xl" }} color="white" fontWeight="black" lineHeight="0.95" letterSpacing="-0.02em" lineClamp={1}>
            {opponentName}
          </Text>
          <Text mt={{ base: 1, xl: 2 }} fontSize={{ base: "8px", xl: "10px" }} color={isHbcu ? accent : "text.muted"} fontWeight="black" textTransform="uppercase" letterSpacing={{ base: "0.06em", xl: "0.1em" }} lineClamp={1}>
            {row.gameName ?? (isHbcu ? "HBCU Matchup" : "Schedule File")}
          </Text>
          <Flex display={{ base: "flex", xl: "none" }} mt={1} align="center" gap={1} minW={0}>
            <MapPin size={10} color={isHbcu ? accent : "#71717A"} />
            <Text fontSize="8px" color="text.muted" lineClamp={1}>{row.city}</Text>
          </Flex>
        </Box>
      </Flex>

      <Flex display={{ base: "none", xl: "flex" }} align="center" gap={2} minW={0}>
        <MapPin size={13} color={isHbcu ? accent : "#71717A"} />
        <Box minW={0}>
          <Text fontSize="11px" color="whiteAlpha.900" fontWeight="bold" lineClamp={1}>{row.city}</Text>
          <Text fontSize="9px" color="text.muted" lineClamp={1}>{row.stadium}</Text>
        </Box>
      </Flex>

      <Box display={{ base: "none", xl: "block" }} justifySelf="start" px={2} py={1} borderRadius="md" bg={isHbcu ? `${accent}22` : "whiteAlpha.100"} border="1px solid" borderColor={isHbcu ? `${accent}66` : "whiteAlpha.100"}>
        <Text fontSize="8px" color={isHbcu ? accent : "text.muted"} fontWeight="black" textTransform="uppercase">{row.tag}</Text>
      </Box>

      <Box justifySelf="end" borderRadius="md" bg={row.result === "W" ? "rgba(34,197,94,0.16)" : "rgba(248,113,113,0.16)"} border="1px solid" borderColor={row.result === "W" ? "green.400" : "red.300"} px={{ base: 2, xl: 3 }} py={{ base: 2, xl: 2.5 }} minW={{ base: "74px", xl: "88px" }} textAlign="center">
        <Text fontSize={{ base: "sm", xl: "md" }} color={row.result === "W" ? "green.300" : "red.300"} fontWeight="black" lineHeight={1}>{row.result} {row.score}</Text>
        {row.hasRecap && (
          <Text display={{ base: "block", xl: "none" }} mt={1} fontSize="7px" color="text.secondary" fontWeight="black" textTransform="uppercase">
            Recap
          </Text>
        )}
      </Box>

      <Flex display={{ base: "none", xl: "flex" }} justify="end">
        {row.hasRecap ? (
          <Box as="button" type="button" borderRadius="md" bg={accent} px={3} py={2}>
            <Text fontSize="8px" color="black" fontWeight="black" textTransform="uppercase">Recap</Text>
          </Box>
        ) : (
          <Text fontSize="8px" color="text.muted" fontWeight="black" textTransform="uppercase">No Recap</Text>
        )}
      </Flex>
    </Grid>
  );
};

const VariantPanel = ({ title, description, children }) => (
  <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" bg="bg.secondary" overflow="hidden">
    <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.14em">{title}</Text>
      <Text mt={1} fontSize="11px" color="text.muted">{description}</Text>
    </Box>
    {children}
  </Box>
);

export const TeamScheduleRowVariants = () => (
  <Box w="full" h="full" bg="bg.primary" p={4} overflow="auto">
    <Grid templateColumns="1fr" gap={4}>
      <VariantPanel title="A. HBCU Identity Rail" description="Preserves list density; HBCU games get logo, color rail, and recap chip.">
        {ROWS.map((row) => <IdentityRailRow key={`rail-${row.id}`} row={row} />)}
      </VariantPanel>

      <VariantPanel title="B. Full Density Ledger" description="Week pill, date column, large logo/name block, venue line, score pill, type pill, and recap action.">
        {ROWS.map((row) => <DenseLedgerRow key={`dense-${row.id}`} row={row} />)}
      </VariantPanel>

      <VariantPanel title="C. Matchup Lockup" description="Uses both HBCU identities for covered games while keeping non-HBCU rows quiet.">
        {ROWS.map((row) => <MatchupLockupRow key={`lockup-${row.id}`} row={row} />)}
      </VariantPanel>

      <VariantPanel title="D. Editorial Recap Row" description="More magazine-like HBCU rows with strong team color and recap emphasis.">
        {ROWS.map((row) => <EditorialRecapRow key={`editorial-${row.id}`} row={row} />)}
      </VariantPanel>
    </Grid>
  </Box>
);
