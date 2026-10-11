import { Box, Flex, Text, Image } from "@chakra-ui/react";

const MOCK_ROWS = [
  {
    id: "pvamubcu",
    away: {
      name: "Prairie View A&M",
      shortName: "PVAMU",
      logo: "/assets/swacpvamu.svg",
      color: "#4B0082",
      record: "3-2 SWAC",
    },
    home: {
      name: "Bethune-Cookman",
      shortName: "BCU",
      logo: "/assets/swacbcu.svg",
      color: "#6F2633",
      record: "2-3 SWAC",
    },
    awayScore: 17,
    homeScore: 24,
    status: "Final",
    gameName: "SWAC Crossover",
    displayVenue: "Daytona Stadium",
  },
];

function getWinner(row) {
  if (
    row.awayScore == null ||
    row.homeScore == null ||
    row.awayScore === row.homeScore
  )
    return null;
  return row.awayScore > row.homeScore ? "away" : "home";
}

const getActiveColor = (row, highlightColor) => {
  const winner = getWinner(row);
  return (
    highlightColor ??
    (winner === "away"
      ? row.away.color
      : winner === "home"
        ? row.home.color
        : "#E53E3E")
  );
};

const getDisplayData = (row) => ({
  hasScore: row.awayScore != null && row.homeScore != null,
  awayRecord: row.away.record ?? row.awayConferenceRecord ?? "Record TBD",
  homeRecord: row.home.record ?? row.homeConferenceRecord ?? "Record TBD",
  venue: row.displayVenue ?? row.stadium ?? "Site TBD",
});

const getResultLine = (row, venue, hasScore) => {
  const status = String(
    row.status ?? (hasScore ? "Final" : "Preview"),
  ).toUpperCase();
  const place = String(venue ?? "Site TBD").toUpperCase();
  return `${status} | ${place}`;
};

const OUTSIDE_ABBREVIATIONS = {
  Monmouth: "MON",
  "Georgetown University": "GEO",
  "Savannah State University": "SAV",
  Richmond: "RICH",
  "Prairie View A&M": "PVAMU",
};

const STOP_WORDS = new Set(["the", "of", "and", "&", "university", "college"]);

const getCompactLabel = (team) => {
  const candidate = String(team?.bannerShort ?? team?.shortName ?? "").trim();
  const name = String(team?.name ?? candidate ?? "").trim();

  if (candidate && candidate !== name && candidate.length <= 7)
    return candidate.toUpperCase();
  if (OUTSIDE_ABBREVIATIONS[name]) return OUTSIDE_ABBREVIATIONS[name];

  const words = name.split(/\s+/).filter(Boolean);
  const meaningfulWords = words.filter(
    (word) => !STOP_WORDS.has(word.toLowerCase()),
  );

  if (meaningfulWords.length > 1) {
    const acronym = meaningfulWords
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 5) return acronym;
  }

  return (meaningfulWords[0] ?? name ?? "TBD").slice(0, 4).toUpperCase();
};

const getCompactGameTag = (gameName) => {
  const label = String(gameName ?? "Game").trim();
  const lower = label.toLowerCase();
  if (lower.includes("homecoming")) return "Homecoming";
  if (lower.includes("conference")) return "Conference";
  if (lower.includes("non-conf") || lower.includes("non conf"))
    return "Non-conf";
  if (lower.includes("championship")) return "Championship";
  if (lower.includes("celebration")) return "Celebration Bowl";
  return label.length > 18 ? `${label.slice(0, 16).trim()}...` : label;
};

export const WeekCentralGameRowJ = ({
  row,
  mb = 6,
  variant = "standard",
  scale,
  selected = false,
  highlightColor,
  highlightAccent,
}) => {
  const resolvedVariant =
    variant === "compact" || scale === "slate" ? "compact" : "standard";
  if (resolvedVariant === "compact") {
    return (
      <WeekCentralGameRowJCompact
        row={row}
        mb={mb}
        selected={selected}
        highlightColor={highlightColor}
        highlightAccent={highlightAccent}
      />
    );
  }
  return (
    <WeekCentralGameRowJStandard
      row={row}
      mb={mb}
      selected={selected}
      highlightColor={highlightColor}
      highlightAccent={highlightAccent}
    />
  );
};

const WeekCentralGameRowJStandard = ({ row, mb, selected, highlightColor, highlightAccent }) => {
  const winner = getWinner(row);
  const activeColor = getActiveColor(row, highlightColor);
  const activeAccent = highlightAccent ?? activeColor;
  const { hasScore, awayRecord, homeRecord, venue } = getDisplayData(row);
  const borderColor = selected ? activeAccent : "whiteAlpha.100";
  const glow = selected
    ? `0 0 0 1px ${activeAccent}88, 0 18px 42px rgba(0,0,0,0.38)`
    : "0 18px 42px rgba(0,0,0,0.32)";
  const gradient = selected
    ? `linear-gradient(90deg, ${activeColor} 0%, ${activeColor} 100%)`
    : `linear-gradient(90deg, ${row.away.color}24 0%, ${row.away.color}10 14%, #111114 34%, #111114 66%, ${row.home.color}10 86%, ${row.home.color}24 100%)`;

  return (
    <Box
      w="full"
      minH="132px"
      borderRadius="xl"
      overflow="hidden"
      position="relative"
      mb={mb}
      border={selected ? "2px solid" : "1px solid"}
      borderColor={borderColor}
      bg={gradient}
      boxShadow={glow}
    >
      {selected && (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(0,0,0,0.3)"
          zIndex={1}
          pointerEvents="none"
        />
      )}
      <WatermarkLogo team={row.away} side="left" selected={selected} />
      <WatermarkLogo team={row.home} side="right" selected={selected} />

      <Flex
        position="relative"
        zIndex={2}
        w="full"
        minH="132px"
        align="center"
        justify="space-between"
        px={7}
        py={3}
        gap={5}
      >
        <Flex align="center" gap={4} minW={0} flex="1 1 0" overflow="hidden">
          <Logo team={row.away} size="64px" pad="7px" />
          <TeamText
            align="left"
            name={row.away.name}
            record={awayRecord}
            active={winner === "away"}
            maxW="100%"
            fontSize="clamp(19px, 1.8vw, 26px)"
          />
        </Flex>

        {/* Centre column sizes to its content (min 240px) so a long classic
            name or venue is shown in full; both caption lines may wrap once. */}
        <Box textAlign="center" flex="0 1 auto" minW="240px" maxW="46%" px={2}>
          <Text
            color={selected ? activeAccent : "brand.400"}
            fontSize="xs"
            fontWeight="black"
            letterSpacing="0.16em"
            textTransform="uppercase"
            mb={1}
            lineClamp={2}
            lineHeight={1.2}
          >
            {row.gameName}
          </Text>
          <Text
            color="whiteAlpha.900"
            fontSize="5xl"
            fontWeight="extrabold"
            letterSpacing="0.04em"
            lineHeight="0.95"
            whiteSpace="nowrap"
            style={{ textShadow: "0 2px 12px #000b" }}
          >
            {hasScore ? `${row.awayScore} - ${row.homeScore}` : "VS"}
          </Text>
          <Text
            color="whiteAlpha.600"
            fontSize="xs"
            fontWeight="black"
            letterSpacing="0.12em"
            textTransform="uppercase"
            mt={2}
            lineClamp={2}
            lineHeight={1.2}
          >
            {row.status} | {venue}
          </Text>
        </Box>

        <Flex
          align="center"
          gap={4}
          minW={0}
          flex="1 1 0"
          justify="flex-end"
          overflow="hidden"
        >
          <TeamText
            align="right"
            name={row.home.name}
            record={homeRecord}
            active={winner === "home"}
            maxW="100%"
            fontSize="clamp(19px, 1.8vw, 26px)"
          />
          <Logo team={row.home} size="64px" pad="7px" />
        </Flex>
      </Flex>
      {selected && (
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="5px"
          bg={activeAccent}
          zIndex={3}
        />
      )}
    </Box>
  );
};

const WeekCentralGameRowJCompact = ({ row, mb, selected, highlightColor, highlightAccent }) => {
  const winner = getWinner(row);
  const activeColor = getActiveColor(row, highlightColor);
  const activeAccent = highlightAccent ?? activeColor;
  const { hasScore, venue } = getDisplayData(row);
  const borderColor = selected ? activeAccent : "whiteAlpha.100";
  const gradient = selected
    ? `linear-gradient(90deg, ${activeColor} 0%, ${activeColor} 100%)`
    : `linear-gradient(90deg, ${row.away.color}20 0%, #111115 24%, #070708 50%, #111115 76%, ${row.home.color}20 100%)`;
  const gameTag = getCompactGameTag(row.gameName);
  const awayLabel = getCompactLabel(row.away);
  const homeLabel = getCompactLabel(row.home);
  const resultLine = getResultLine(row, venue, hasScore);

  return (
    <Box
      w="full"
      h="72px"
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      mb={mb}
      border={selected ? "2px solid" : "1px solid"}
      borderColor={borderColor}
      bg={gradient}
      boxShadow={
        selected
          ? `0 0 0 1px ${activeAccent}CC, 0 0 24px ${activeAccent}66, 0 16px 32px rgba(0,0,0,0.42)`
          : "0 8px 18px rgba(0,0,0,0.22)"
      }
    >
      {selected && (
        <Box
          position="absolute"
          inset={0}
          bg="rgba(0,0,0,0.34)"
          zIndex={1}
          pointerEvents="none"
        />
      )}
      <WatermarkLogo team={row.away} side="left" selected={selected} compact />
      <WatermarkLogo team={row.home} side="right" selected={selected} compact />
      <Box
        position="relative"
        zIndex={2}
        h="full"
        display="grid"
        alignItems="center"
        gridTemplateColumns="44px minmax(38px, 1fr) minmax(104px, 128px) minmax(38px, 1fr) 44px"
        columnGap={{ base: 1, lg: 2 }}
        px={{ base: 2, lg: 3 }}
        py={2}
      >
        <Logo team={row.away} size="42px" pad="5px" />
        <CompactTeamLabel
          label={awayLabel}
          active={winner === "away"}
          align="left"
        />

        <Flex
          minW={0}
          h="full"
          direction="column"
          align="center"
          justify="center"
          overflow="hidden"
        >
          <Text
            color={selected ? activeAccent : "brand.400"}
            fontSize="8px"
            fontWeight="black"
            letterSpacing="0.16em"
            textTransform="uppercase"
            mb="3px"
            lineClamp={1}
          >
            {gameTag}
          </Text>
          <Text
            color="white"
            fontSize={{ base: "22px", lg: "26px" }}
            fontWeight="black"
            letterSpacing="0.03em"
            lineHeight="0.9"
            whiteSpace="nowrap"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
          >
            {hasScore ? `${row.awayScore} - ${row.homeScore}` : "VS"}
          </Text>
          <Text
            color="rgba(255,255,255,0.58)"
            fontSize="7px"
            fontWeight="black"
            letterSpacing="0.12em"
            textTransform="uppercase"
            mt="4px"
            textAlign="center"
            lineClamp={1}
            maxW="100%"
          >
            {resultLine}
          </Text>
        </Flex>

        <CompactTeamLabel
          label={homeLabel}
          active={winner === "home"}
          align="right"
        />
        <Box justifySelf="end">
          <Logo team={row.home} size="42px" pad="5px" />
        </Box>
      </Box>
      {selected && (
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          h="5px"
          bg={activeAccent}
        />
      )}
    </Box>
  );
};

const CompactTeamLabel = ({ label, active, align }) => (
  <Box minW={0} overflow="hidden" textAlign={align}>
    <Text
      color={active ? "white" : "rgba(255,255,255,0.84)"}
      fontWeight="black"
      fontSize={{ base: "16px", lg: "18px" }}
      lineHeight="1"
      textTransform="uppercase"
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      letterSpacing="0.02em"
      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.82)" }}
    >
      {label}
    </Text>
  </Box>
);

const TeamText = ({
  align,
  name,
  record,
  active,
  maxW,
  fontSize,
  compact = false,
}) => (
  <Box minW={0} maxW={maxW} textAlign={align} overflow="hidden">
    <Text
      color={active ? "white" : "rgba(255,255,255,0.82)"}
      fontWeight="extrabold"
      fontSize={fontSize}
      lineHeight={compact ? "0.92" : "1"}
      textShadow="0 2px 8px #000b"
      lineClamp={2}
      whiteSpace="normal"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {name}
    </Text>
    <Text
      color="rgba(255,255,255,0.56)"
      fontSize={compact ? "10px" : "xs"}
      fontWeight="black"
      letterSpacing="0.12em"
      textTransform="uppercase"
      mt={compact ? 2 : 2}
      lineClamp={1}
    >
      {record}
    </Text>
  </Box>
);

function Logo({ team, size, pad = "6px" }) {
  return team.logo ? (
    <Image
      src={team.logo}
      alt={team.shortName}
      w={size}
      h={size}
      objectFit="contain"
      borderRadius="lg"
      bg="rgba(255,255,255,0.10)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      p={pad}
      flexShrink={0}
    />
  ) : (
    <Flex
      w={size}
      h={size}
      align="center"
      justify="center"
      borderRadius="lg"
      bg="whiteAlpha.200"
      border="1px solid"
      borderColor="whiteAlpha.200"
      flexShrink={0}
    >
      <Text fontSize="lg" color="whiteAlpha.700" fontWeight="black">
        {String(team.shortName ?? team.name ?? "TBD").slice(0, 3)}
      </Text>
    </Flex>
  );
}

const WatermarkLogo = ({ team, side, selected, compact = false }) => {
  if (!team.logo) return null;

  return (
    <Image
      src={team.logo}
      alt={team.shortName}
      position="absolute"
      left={side === "left" ? (compact ? "-30px" : "-24px") : "auto"}
      right={side === "right" ? (compact ? "-30px" : "-24px") : "auto"}
      top={side === "left" ? (compact ? "-32px" : "-16px") : "auto"}
      bottom={side === "right" ? (compact ? "-32px" : "-16px") : "auto"}
      w={compact ? "118px" : "120px"}
      h={compact ? "118px" : "120px"}
      opacity={selected ? 0.075 : 0.04}
      zIndex={1}
      pointerEvents="none"
      style={{ filter: "blur(1px)" }}
    />
  );
};

export const WeekCentralGameRowJ__Lab = () => (
  <Box w="100%" maxW="900px" mx="auto" py={6}>
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mb={2}>
      Team Gradient Cool - Editorial
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowJ key={row.id} row={row} />
    ))}
    <Text color="brand.400" fontWeight="extrabold" fontSize="xl" mt={8} mb={2}>
      Compact Score Capsule
    </Text>
    {MOCK_ROWS.map((row) => (
      <WeekCentralGameRowJ
        key={`${row.id}-compact`}
        row={row}
        variant="compact"
        mb={0}
        selected
      />
    ))}
  </Box>
);
