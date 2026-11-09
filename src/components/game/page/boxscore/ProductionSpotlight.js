import { Box, Text, Flex, Image, Grid } from "@chakra-ui/react";
import { useState } from "react";
import { getTeamLogoSrc } from "../utils/teamHelpers";
import { splitDisplayName, lookupPlayerProfile, resolveImages } from "../../../../utils/headshots";
import { productionOf, productionIndex, PAR_NEGATIVE } from "../../../../utils/productionScoreModel";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";

// Extracted from ProductionPrimitives; existing behavior is preserved.

export const StatChip = ({ label, value }) => (
  <Box minW={0}>
    <Text fontSize="clamp(0.42rem, 0.55vw, 0.52rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.2} lineClamp={1}>
      {label}
    </Text>
    <Text fontSize="clamp(0.7rem, 0.95vw, 0.88rem)" fontWeight="900" color="white" lineHeight={1.15} lineClamp={1}>
      {value}
    </Text>
  </Box>
);

// The portrait bleeds from the panel's left edge and is darkened away under the
// copy rather than being boxed into an avatar tile — the same construction the
// Summary tab's Notable Performers card uses. Gradient stops are tuned tighter
// here because this band is short and the copy starts much further left.
const PORTRAIT_W = "44%";

const PORTRAIT_SCRIM = "linear-gradient(to right, rgba(20,20,22,0.06) 0%, rgba(20,20,22,0.78) 42%, #141416 94%)";

/**
 * The player spotlight — a full-bleed band, not a card inside a card. The
 * portrait is a background layer bleeding off the panel's left edge and fading
 * out to the right; the name, chips and the group's chart (lane chart, target
 * zones, havoc concept) ride on top of it. Deliberately short: this sits
 * between the team table above and the roster table below, so nothing in it is
 * allowed to set a tall floor.
 */
// Tries each headshot candidate in order; the team mark takes over once they're all
// dead — so a placeholder URL never renders as a broken image.
const CandidatePortrait = ({ srcs, teamId }) => {
  const [attempt, setAttempt] = useState(0);
  const current = srcs[attempt] ?? null;
  if (!current) {
    return (
      <Flex h="full" align="center" justify="flex-start" pl={2}>
        <Image src={getTeamLogoSrc(teamId)} alt="" h="150%" maxW="90%" objectFit="contain" opacity={0.35} />
      </Flex>
    );
  }
  return <Image key={current} src={current} alt="" w="full" h="full" objectFit="cover" objectPosition="center 12%" onError={() => setAttempt((a) => a + 1)} />;
};

export const SpotlightCard = ({
  name,
  playerKey = null,
  accent,
  teamId,
  headshotIndex,
  identity = null,
  productionRows,
  productionComponent = null,
  roleFallback = "—",
  chips = [],
  children,
}) => {
  const [first, last] = splitDisplayName(name);
  // Identity by PERS_ id with the prior-season fallback when the panel passes it;
  // the older name-only index otherwise (Defense still uses that path).
  const rosterRow = identity ? identity.byPerson?.[playerKey] ?? identity.priorByPerson?.[playerKey] ?? null : null;
  const profile = identity
    ? { position: rosterRow?.position ?? rosterRow?.raw_position ?? lookupPlayerProfile(identity.headshots, name, teamId)?.position ?? null, jersey: rosterRow?.jersey_number ?? null }
    : lookupPlayerProfile(headshotIndex, name, teamId);
  const srcs = identity ? resolveImages(identity, { player_key: playerKey, name }, teamId) : (profile?.image ? [profile.image] : []);
  const position = profile?.position || roleFallback;
  const entry = productionOf(productionIndex(productionRows), { key: playerKey, name });
  const production = productionComponent
    ? (typeof entry?.components?.[productionComponent] === "number" ? entry.components[productionComponent] : null)
    : entry?.total ?? null;
  // Phones: the portrait + stats are one block and the chart sits under it, clear of
  // the photo, instead of sharing the row (or stacking on top of the portrait).
  const { isMobile } = useLayoutDensity();

  const card = (
    <Box
      position="relative"
      overflow="hidden"
      minW={0}
      minH="clamp(5.5rem, 8vw, 7rem)"
      borderY="1px solid"
      borderColor="whiteAlpha.100"
    >
      {/* Layer 0 — portrait, bleeding off the left edge */}
      <Box position="absolute" left={0} top={0} bottom={0} w={PORTRAIT_W} zIndex={0} overflow="hidden">
        {/* No live headshot: the school's mark stands in as an oversized watermark
            rather than a two-letter tile. */}
        <CandidatePortrait key={playerKey ?? name} srcs={srcs} teamId={teamId} />
        <Box position="absolute" inset={0} bg={PORTRAIT_SCRIM} pointerEvents="none" />
      </Box>

      {/* Team-colour edge, same marker the Notable Performers card uses */}
      <Box position="absolute" left={0} top={0} bottom={0} w="0.1875rem" bg={accent} zIndex={2} />

      {/* Layer 1 — copy, starting clear of the portrait's brightest part */}
      <Grid
        position="relative"
        zIndex={1}
        templateColumns={{ base: "1fr", lg: "minmax(0, 1.05fr) minmax(0, 1fr)" }}
        gap={3}
        alignItems="center"
        pl={{ base: 3, lg: "13%" }}
        pr={3}
        py={2}
      >
        <Box minW={0}>
          <Flex align="baseline" gap={1.5} minW={0} mb={1.5}>
            {/* Last name only, never cut off — a long one wraps rather than "ARMOND…". */}
            <Text minW={0} fontSize="clamp(0.85rem, 1.15vw, 1.15rem)" fontWeight="950" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={1.05} overflowWrap="anywhere" title={`${first} ${last}`.trim()}>
              {last || first}
            </Text>
            <Text fontSize="clamp(0.45rem, 0.6vw, 0.55rem)" fontWeight="900" color={accent} textTransform="uppercase" letterSpacing="0.12em" flexShrink={0}>
              {position}
            </Text>
            {profile?.jersey != null && (
              <Text fontSize="clamp(0.45rem, 0.6vw, 0.55rem)" fontWeight="800" color="rgba(255,255,255,0.35)" flexShrink={0}>
                #{profile.jersey}
              </Text>
            )}
            {production != null && (
              <Text ml="auto" fontFamily="mono" fontSize="clamp(0.6rem, 0.8vw, 0.75rem)" fontWeight="950" color={production < 0 ? PAR_NEGATIVE : accent} flexShrink={0}>
                {production.toFixed(1)}
              </Text>
            )}
          </Flex>

          <Grid templateColumns="repeat(4, minmax(0, 1fr))" columnGap={2} rowGap={1.5}>
            {chips.map(([label, value]) => (
              <StatChip key={label} label={label} value={value} />
            ))}
          </Grid>
        </Box>

        {/* Whatever chart the group wants. */}
        {!isMobile && <Box minW={0}>{children}</Box>}
      </Grid>
    </Box>
  );

  if (!isMobile || !children) return card;
  return (
    <Box>
      {card}
      <Box px={3} py={2.5} borderBottom="1px solid" borderColor="whiteAlpha.100">{children}</Box>
    </Box>
  );
};
