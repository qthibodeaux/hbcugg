import { useState } from "react";
import { Box, Text, Flex, Grid, Image, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAllPlayersByYear } from "../../../../hooks/useSWACData";
import { LAYOUT_DENSITY, useLayoutDensity } from "../../../../hooks/useLayoutDensity";

/**
 * Roster player cards
 *
 * PHILOSOPHY:
 *   Purpose: Make player identity the headline while preserving quick roster scan data.
 *   Placement: Scrollable roster list below the team roster PageShell banner.
 *
 * CONTENT TIERS:
 *   Essential: portrait, jersey number, first/last name, position, size, class/status.
 *   Nice-to-have: Glory Score badge, ghost jersey number, team-color photo wash.
 *   Drop first: labels in compact metadata; compact keeps values only.
 *
 * DENSITY CONTRACT:
 *   PlayersTab reads shared app layout density and passes explicit card variants.
 *   PlayerCard does not decide compact vs standard from viewport breakpoints.
 *   Compact: full-width name plate plus one value row.
 *   Standard: two-column name/info plate.
 *
 * REFERENCE:
 *   This is the first reference implementation for shared layout density variants.
 */

const isLightColor = (hex) => {
  const value = String(hex || "").replace("#", "");
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
};

const formatHeightWeight = (player) => {
  const height = Number(player.height);
  const weight = Number(player.weight);
  const h = Number.isFinite(height) && height > 0 ? `${Math.floor(height / 12)}'${height % 12}"` : "--";
  const w = Number.isFinite(weight) && weight > 0 ? `${weight}` : "--";
  return { h, w };
};

const getPosition = (player) => player.position_abbr || player.position || player.position_group || "--";
const getPlayerNumber = (player) => player.jersey_number ?? player.jersey ?? null;
const isPlaceholderName = (value) => /^PERS_\d+$/i.test(String(value || ""));

const toTitleCase = (value) =>
  String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const nameFromImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  const fileName = decodeURIComponent(String(imageUrl).split("/").pop() || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/^\d+[_-]+/, "")
    .replace(/\?.*$/, "");
  const cleaned = toTitleCase(fileName);
  return cleaned || null;
};

const getDisplayName = (player) => {
  const direct = player.name_display || player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ");
  if (direct && !isPlaceholderName(direct)) return direct;
  return nameFromImageUrl(player.image_url) || direct || "Unknown Player";
};

const splitDisplayName = (name) => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: parts[0] || "Unknown", last: "" };
  return {
    first: parts.slice(0, -1).join(" "),
    last: parts[parts.length - 1],
  };
};

const CLASS_YEAR_LABELS = { 1: "FR", 2: "SO", 3: "JR", 4: "SR", 5: "GR" };

const formatClassYear = (classYear) => {
  if (classYear == null || classYear === "") return "--";
  const num = Number(classYear);
  if (Number.isFinite(num) && CLASS_YEAR_LABELS[num]) return CLASS_YEAR_LABELS[num];
  return String(classYear).toUpperCase();
};

const getSideFields = (position, classYear, heightWeight) => [
  ["POS", position],
  ["HT", heightWeight.h],
  ["CLASS", classYear],
  ["WT", heightWeight.w],
];

const shouldPanName = (value) => {
  const text = String(value || "");
  return text.length > 15 || (text.length > 12 && text.includes("-"));
};

const NameRail = ({ children, variant = "standard" }) => {
  const text = String(children || "");
  const shouldPan = shouldPanName(text);
  const compact = variant !== "standard";

  return (
    <Box
      maxW="100%"
      overflow="hidden"
      style={shouldPan ? {
        WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 88%, transparent 100%)",
        maskImage: "linear-gradient(90deg, transparent 0%, #000 10%, #000 88%, transparent 100%)",
      } : undefined}
    >
      <Text
        as="span"
        className={shouldPan ? "roster-name-pan" : undefined}
        display="inline-block"
        pr={shouldPan ? 10 : 0}
        fontSize={compact ? { base: "2xl", md: "3xl" } : { base: "2xl", md: "3xl", xl: shouldPan ? "3xl" : "4xl" }}
        fontWeight="black"
        color="text.primary"
        lineHeight="0.78"
        textTransform="uppercase"
        whiteSpace="nowrap"
        style={shouldPan ? {
          animation: "rosterNamePan 12s ease-in-out infinite",
          willChange: "transform",
        } : undefined}
      >
        {text}
      </Text>
    </Box>
  );
};

const CompactField = ({ label, value, highlight }) => (
  <Box minW={0} title={`${label}: ${value}`}>
    <Text
      fontSize="sm"
      color={highlight ? "inherit" : "text.primary"}
      fontWeight="black"
      lineHeight="1"
      textTransform="uppercase"
      lineClamp={1}
    >
      {value}
    </Text>
  </Box>
);

const StandardPlayerPlate = ({ nameParts, sideFields, secondary }) => (
  <Grid
    templateColumns="minmax(0, 64%) minmax(96px, 36%)"
    gap={2.5}
    h="full"
    minH={{ base: "72px", xl: "80px" }}
  >
    <Flex direction="column" justify="center" minW={0} overflow="hidden">
      <NameRail>{nameParts.first}</NameRail>
      {nameParts.last && <NameRail>{nameParts.last}</NameRail>}
    </Flex>

    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={1.5} alignContent="center" borderLeft="1px solid" borderColor="whiteAlpha.100" pl={2.5}>
      {sideFields.map(([label, value], index) => (
        <Box key={label}>
          <Text fontSize="7px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.1em">
            {label}
          </Text>
          <Text
            mt="1px"
            fontSize={index === 0 ? "md" : "xs"}
            color={index === 0 ? secondary : "text.primary"}
            fontWeight="black"
            lineHeight="1"
            textTransform="uppercase"
            lineClamp={1}
          >
            {value}
          </Text>
        </Box>
      ))}
    </Grid>
  </Grid>
);

const CompactPlayerPlate = ({ nameParts, sideFields, secondary }) => (
  <Flex direction="column" justify="center" gap={2} minH="84px">
    <Box minW={0} overflow="hidden">
      <NameRail variant="compact">{nameParts.first}</NameRail>
      {nameParts.last && <NameRail variant="compact">{nameParts.last}</NameRail>}
    </Box>

    <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={2.5} color={secondary} alignItems="center">
      {sideFields.map(([label, value], index) => (
        <CompactField key={label} label={label} value={value} highlight={index === 0} />
      ))}
    </Grid>
  </Flex>
);

// Mobile — a square photo tile with the last name on a strip beneath it.
// No Glory Score badge: at 4-across it covered a third of the tile, and the
// value is "--" for most players on this page anyway.
const PlayerCardMobile = ({ player, team }) => {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const primary = team?.colors?.primary ?? "#E53E3E";
  const displayName = getDisplayName(player);
  const number = getPlayerNumber(player);
  const position = getPosition(player);
  const lastName = splitDisplayName(displayName).last || displayName;

  return (
    <Box
      bg="bg.secondary"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      onClick={() => navigate(`/player/${encodeURIComponent(`${displayName}__${player.team_id}`)}`, { state: { player } })}
    >
      <Box position="relative" w="full" aspectRatio={1} bg="whiteAlpha.50" overflow="hidden">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={displayName}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Flex align="center" justify="center" h="100%">
            <User size={24} color="var(--chakra-colors-whiteAlpha-300)" />
          </Flex>
        )}
        {/* Number bottom-left, position bottom-right. */}
        {number != null && (
          <Text
            position="absolute"
            left="0.25rem"
            bottom="0.15rem"
            zIndex={2}
            color="white"
            fontSize="0.6rem"
            fontWeight="black"
            textShadow="0 1px 3px rgba(0,0,0,0.8)"
          >
            #{number}
          </Text>
        )}
        {position && position !== "--" && (
          <Text
            position="absolute"
            right="0.25rem"
            bottom="0.15rem"
            zIndex={2}
            color="white"
            fontSize="0.6rem"
            fontWeight="black"
            textTransform="uppercase"
            textShadow="0 1px 3px rgba(0,0,0,0.8)"
          >
            {position}
          </Text>
        )}
      </Box>

      <Box px="0.3rem" py="0.3rem" borderTop="2px solid" borderColor={primary}>
        <Text fontSize="0.62rem" fontWeight="black" color="text.primary" textTransform="uppercase" lineClamp={1} textAlign="center">
          {lastName}
        </Text>
      </Box>
    </Box>
  );
};

const PlayerCard = ({ player, team, variant = "standard" }) => {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const resolvedVariant = variant === "standard" ? "standard" : "compact";
  const primary = team?.colors?.primary ?? "#E53E3E";
  const secondary = team?.colors?.secondary ?? "#FFFFFF";
  const scoreText = isLightColor(secondary) ? "#0B0B0D" : "#FFFFFF";
  const number = getPlayerNumber(player);
  const position = getPosition(player);
  const classYear = formatClassYear(player.class_year);
  const { h, w } = formatHeightWeight(player);
  const glory = Number.isFinite(Number(player.par)) ? Number(player.par).toFixed(0) : "--";
  const displayName = getDisplayName(player);
  const nameParts = splitDisplayName(displayName);
  const sideFields = getSideFields(position, classYear, { h, w });

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="md"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      minH={{ base: "320px", md: "352px", xl: "380px" }}
      _hover={{ borderColor: secondary, transform: "translateY(-2px)" }}
      transition="border-color 0.15s, transform 0.15s"
      onClick={() => navigate(`/player/${encodeURIComponent(`${displayName}__${player.team_id}`)}`, { state: { player } })}
    >
      <Box bg="whiteAlpha.50" h={{ base: "232px", md: "258px", xl: "284px" }} position="relative" overflow="visible">
        <Box position="absolute" inset={0} overflow="hidden">
        {player.image_url && !imgErr ? (
          <Image
            src={player.image_url}
            alt={displayName}
            w="100%" h="100%"
            objectFit="cover"
            objectPosition="top"
            onError={() => setImgErr(true)}
            position="relative"
            zIndex={0}
          />
        ) : (
          <Flex align="center" justify="center" h="100%" position="relative" zIndex={0}>
            <User size={44} color="var(--chakra-colors-whiteAlpha-300)" />
          </Flex>
        )}

        <Box
          position="absolute"
          inset={0}
          zIndex={2}
          pointerEvents="none"
          bg={`linear-gradient(180deg, transparent 68%, ${primary}45 82%, #141416 96%)`}
        />
        </Box>

        {number != null && (
          <Text
            position="absolute"
            left={4}
            bottom={3}
            zIndex={3}
            color="white"
            fontSize="sm"
            fontWeight="black"
            letterSpacing="0.08em"
          >
            #{number}
          </Text>
        )}

        <Box
          position="absolute"
          right={4}
          bottom={0}
          zIndex={4}
          bg={secondary}
          color={scoreText}
          px={4}
          py={2.5}
          minW="90px"
          textAlign="center"
          boxShadow="0 10px 24px rgba(0,0,0,0.35)"
        >
          <Text fontSize="7px" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em">
            Glory Score
          </Text>
          <Text mt={1} fontSize="2xl" fontWeight="black" lineHeight="0.9">
            {glory}
          </Text>
        </Box>
      </Box>

      <Box px={4} pt={3} pb={3} minH={resolvedVariant === "standard" ? { base: "88px", xl: "96px" } : "100px"}>
        {resolvedVariant === "standard" ? (
          <StandardPlayerPlate nameParts={nameParts} sideFields={sideFields} secondary={secondary} />
        ) : (
          <CompactPlayerPlate nameParts={nameParts} sideFields={sideFields} secondary={secondary} />
        )}
      </Box>
    </Box>
  );
};

const PlayersTab = ({ team, year = 2025, players: playersOverride = null, cardVariant = null }) => {
  const { density, isMobile } = useLayoutDensity();
  const { players: allPlayers, isLoading } = useAllPlayersByYear(String(year));

  const v5Id = team?.exportId?.replace(/25$/, "") ?? "";
  const players = playersOverride ?? allPlayers.filter((p) => (p.team_id ?? p._teamId) === v5Id);
  const resolvedCardVariant = cardVariant ?? (density === LAYOUT_DENSITY.STANDARD ? "standard" : "compact");

  if (!playersOverride && isLoading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (!players.length) {
    return (
      <Box py={16} textAlign="center">
        <Text fontSize="sm" color="text.muted">No player data found for this team.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <style>{`
        @keyframes rosterNamePan {
          0%, 30% { transform: translateX(0); }
          64%, 84% { transform: translateX(calc(-100% + 124px)); }
          100% { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .roster-name-pan {
            animation: none !important;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      `}</style>
      <Grid
        // Mobile packs the cards 4-across rather than one full-width card
        // per row, which turned 126 players into an enormous scroll.
        templateColumns={isMobile
          ? "repeat(4, minmax(0, 1fr))"
          : resolvedCardVariant === "standard"
            ? {
                base: "repeat(1,1fr)",
                md: "repeat(3,1fr)",
                lg: "repeat(4,1fr)",
              }
            : {
                base: "repeat(1,1fr)",
                sm: "repeat(3,1fr)",
                lg: "repeat(3,1fr)",
                xl: "repeat(4,1fr)",
              }}
        gap={isMobile ? 1 : 3}
      >
        {players.map((p, i) =>
          isMobile ? (
            <PlayerCardMobile key={p.person_id ?? i} player={p} team={team} />
          ) : (
            <PlayerCard key={p.person_id ?? i} player={p} team={team} variant={resolvedCardVariant} />
          ),
        )}
      </Grid>
    </Box>
  );
};

export default PlayersTab;
