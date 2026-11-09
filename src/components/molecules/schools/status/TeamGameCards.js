import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { SectionLabel, TeamLogoTile } from "./StatusPrimitives";
import { formatDateShort, formatDate, teamLabel } from "./statusModel";
import { Link } from "react-router-dom";

const NextGameCardCompact = ({ team, game, opponentStat, seasonSummary }) => {
  // No game at all (season complete, most common case since only the
  // current in-progress season ever has a real next_game) is a different
  // state from a real opponent — "Schedule Feed Pending" implied broken
  // data for what's actually just an over season, and rendered the
  // opponent's 3-letter placeholder off the word "Schedule" itself.
  if (!game) {
    const accent = team?.colors?.secondary || "#F56565";
    return (
      <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={3}>
        <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${team?.colors?.primary || "#E53E3E"}18 0%, rgba(20,20,22,0.98) 58%)`} />
        <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" gap={2} minH={0}>
          <SectionLabel label="Season Complete" color={accent} />
          {seasonSummary ? (
            <>
              <Text fontSize="lg" fontWeight="black" color="text.primary" lineHeight={1.1} lineClamp={1}>
                {seasonSummary.record} · {seasonSummary.conference_record}
              </Text>
              <Text fontSize="12px" fontWeight="bold" color={accent} textTransform="uppercase" lineClamp={1}>
                {seasonSummary.division_finish}
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="lg" fontWeight="black" color="text.primary" lineHeight={1.1}>
                Season Complete
              </Text>
              <Text fontSize="12px" fontWeight="bold" color="text.muted">
                No games remaining this season
              </Text>
            </>
          )}
        </Flex>
      </Box>
    );
  }

  const opponent = game.opponentTeam || null;
  const accent = team?.colors?.secondary || "#F56565";
  const title = game.opponentName || opponent?.name || "TBD";
  const meta = [formatDateShort(game.date), game.kickoff, game.venue || game.site].filter(Boolean).join(" · ");
  const tag = game.tag || game.gameName || (game.conferenceGame ? "Conference Game" : "Next Game");

  return (
    <Box
      as={game.route ? Link : "div"}
      to={game.route ?? undefined}
      display="block"
      _hover={game.route ? { textDecoration: "none", borderColor: "whiteAlpha.400" } : undefined}
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
      p={3}
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${team?.colors?.primary || "#E53E3E"}22 0%, rgba(20,20,22,0.98) 58%)`} />
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" gap={2} minH={0}>
        <SectionLabel label="Next Game" color={accent} />

        {/* Opponent identity — no "us vs them" cluster, just them */}
        <Flex align="center" gap={2} minW={0}>
          <TeamLogoTile team={opponent} label={title} size="md" />
          <Text fontSize="clamp(1.1rem, 3vw, 1.5rem)" fontWeight="black" color="text.primary" lineHeight={1.05} lineClamp={1} minW={0}>
            {title}
          </Text>
        </Flex>

        {opponentStat ? (
          <Flex align="baseline" gap={1.5} minW={0}>
            <Text fontSize="md" fontWeight="black" color={accent} lineHeight={1}>
              {opponentStat.value}
            </Text>
            <Text fontSize="12px" fontWeight="bold" color="text.muted" textTransform="uppercase" lineClamp={1}>
              {opponentStat.label} · {opponent?.shortName || title}
            </Text>
          </Flex>
        ) : (
          <Text fontSize="12px" fontWeight="bold" color="text.muted" lineClamp={1}>
            {meta || `${team?.stadium || "Venue"} · kickoff TBD`}
          </Text>
        )}

        <Box w="full" px={2} py={1.5} bg={`${team?.colors?.primary || "#E53E3E"}33`} border="1px solid" borderColor={accent} borderRadius="5px">
          <Text fontSize="11px" fontWeight="black" color={accent} textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {tag}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export const NextGameCard = ({ team, game, variant = "standard", opponentStat, seasonSummary }) => {
  if (variant === "compact") return <NextGameCardCompact team={team} game={game} opponentStat={opponentStat} seasonSummary={seasonSummary} />;

  const opponent = game?.opponentTeam || null;
  const accent = team?.colors?.secondary || "#F56565";
  const title = game?.opponentName || opponent?.name || "Schedule Feed Pending";
  const meta = [formatDate(game?.date), game?.kickoff, game?.venue || game?.site].filter(Boolean).join(" · ");
  const tag = game?.tag || game?.gameName || (game?.conferenceGame ? "Conference Game" : "Next Game");

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
      p={{ base: 4, lg: 5 }}
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} />
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${team?.colors?.primary || "#E53E3E"}22 0%, rgba(20,20,22,0.98) 58%)`} />
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" gap={2} minH={0}>
        <SectionLabel label="Next Game" color={accent} />

        {/* Tight matchup cluster — left aligned */}
        <Flex align="center" gap={2} minW={0}>
          <TeamLogoTile team={team} label={teamLabel(team)} />
          <Text fontSize={{ base: "md", lg: "lg" }} fontWeight="black" color="text.primary" lineClamp={1}>
            {teamLabel(team)}
          </Text>
          <Text fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" mx={1}>
            vs
          </Text>
          <TeamLogoTile team={opponent} label={game?.opponentName || "TBD"} />
          <Text fontSize={{ base: "md", lg: "lg" }} fontWeight="black" color="text.primary" lineClamp={1}>
            {opponent?.mascot || game?.opponentShort || "TBD"}
          </Text>
        </Flex>

        {/* Big headline */}
        <Box minW={0}>
          <Text fontSize="clamp(1.4rem, 4vw, 2.2rem)" fontWeight="black" color="text.primary" lineHeight={1.05} lineClamp={1}>
            {title}
          </Text>
        </Box>

        {/* Compact meta */}
        <Text fontSize={{ base: "12px", lg: "14px" }} fontWeight="bold" color="text.muted" lineClamp={1}>
          {meta || `${team?.stadium || "Venue"} · kickoff TBD`}
        </Text>

        {/* Full-bleed tag banner */}
        <Box w="full" px={3} py={2} bg={`${team?.colors?.primary || "#E53E3E"}33`} borderRadius="4px">
          <Text fontSize="12px" fontWeight="black" color={accent} textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
            {tag}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

const ReviewGameCardCompact = ({ team, game }) => {
  const accent = game?.result === "W" ? "#48BB78" : game?.result === "L" ? "#F56565" : team?.colors?.secondary || "#F56565";
  const opponent = game?.opponentTeam || null;

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={3}>
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${accent}1f 0%, rgba(20,20,22,0.98) 58%)`} />
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" gap={2} minH={0}>
        <SectionLabel label="Previous Game" color={accent} />

        {/* Score first — hero element */}
        <Text fontSize="clamp(1.6rem, 4vw, 2.2rem)" fontWeight="black" color={accent} lineHeight={1} textAlign="center" lineClamp={1}>
          {game?.score || "--"}
        </Text>

        {/* Opponent cluster */}
        <Flex align="center" justify="center" gap={1.5} minW={0}>
          <Text fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase">vs</Text>
          <TeamLogoTile team={opponent} label={game?.opponentName || "TBD"} size="sm" />
          <Text fontSize="13px" fontWeight="black" color="text.primary" lineClamp={1}>
            {opponent?.shortName || game?.opponentShort || "TBD"}
          </Text>
        </Flex>

        <Box minW={0}>
          <Text fontSize="md" fontWeight="black" color="text.primary" lineClamp={1} textAlign="center">
            {game?.headline || "Review Package Pending"}
          </Text>
          <Text mt={0.5} fontSize="12px" fontWeight="bold" color="text.muted" lineClamp={1} textAlign="center">
            {formatDateShort(game?.date)}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

export const ReviewGameCard = ({ team, game, variant = "standard" }) => {
  if (variant === "compact") return <ReviewGameCardCompact team={team} game={game} />;

  const accent = game?.result === "W" ? "#48BB78" : game?.result === "L" ? "#F56565" : team?.colors?.secondary || "#F56565";
  const opponent = game?.opponentTeam || null;
  const meta = [formatDate(game?.date), game?.venue || game?.site].filter(Boolean).join(" · ");
  const headline = game?.headline || "Review Package Pending";
  // The tag used to fall back to `headline`, so a game with no distinct tag
  // rendered the same text twice ("SEASON FINALE" as the headline and again
  // in the banner) — and that redundant fifth row overflowed the card's
  // fixed height, clipping the date/venue line above it. Only show the
  // banner when it actually says something the headline doesn't.
  const rawTag = game?.tag || game?.gameName || "";
  const tag = rawTag.trim().toLowerCase() === headline.trim().toLowerCase() ? "" : rawTag;

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={{ base: 4, lg: 5 }}>
      <Box position="absolute" left={0} top={0} bottom={0} w="4px" bg={accent} />
      {/* Was tinted by the W/L accent color (red on a loss, reading as an
          "error" background rather than a result indicator) — now matches
          the neutral team-primary-color wash the other profile cards
          (Next Game, Head Coach) already use. Accent still carries the
          win/loss color everywhere it's meaningful: the left bar, the
          score, and the section label. */}
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${team?.colors?.primary || "#E53E3E"}22 0%, rgba(20,20,22,0.98) 58%)`} />
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" gap={2} minH={0}>
        <SectionLabel label="Previous Game" color={accent} />

        {/* Matchup row — team side and opponent side are mirrored, equal-
            width columns closing in on a centered score, so the row stays
            balanced regardless of how long either team's label is (instead
            of one flex row where a short abbreviation on one side and a
            long name on the other threw the whole thing off-center). */}
        <Grid templateColumns="1fr auto 1fr" alignItems="center" gap={2} minW={0}>
          <Flex align="center" justify="flex-end" gap={2} minW={0}>
            <Text fontSize={{ base: "md", lg: "lg" }} fontWeight="black" color="text.primary" lineClamp={1}>
              {teamLabel(team)}
            </Text>
            <TeamLogoTile team={team} label={teamLabel(team)} />
          </Flex>
          <Text fontSize="clamp(1.2rem, 3.5vw, 2rem)" fontWeight="black" color={accent} lineHeight={1} px={2} flexShrink={0} whiteSpace="nowrap">
            {game?.score || "--"}
          </Text>
          <Flex align="center" justify="flex-start" gap={2} minW={0}>
            <TeamLogoTile team={opponent} label={opponent?.shortName || game?.opponentName || "TBD"} />
            <Text fontSize={{ base: "md", lg: "lg" }} fontWeight="black" color="text.primary" lineClamp={1}>
              {opponent?.shortName || game?.opponentShort || "TBD"}
            </Text>
          </Flex>
        </Grid>

        {/* Headline — was clamp(1.4rem, 4vw, 2.2rem), then clamp(1rem, 2.6vw,
            1.4rem); still read oversized against the rest of the card */}
        <Box minW={0} flexShrink={0}>
          <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="0.04em" lineHeight={1.2} lineClamp={1}>
            {headline}
          </Text>
        </Box>

        {/* Compact meta */}
        <Text fontSize={{ base: "12px", lg: "14px" }} fontWeight="bold" color="text.muted" lineClamp={1} flexShrink={0}>
          {meta || "Date / venue pending"}
        </Text>

        {/* Full-bleed tag banner — omitted when it would just repeat the
            headline (see `tag` above) */}
        {tag && (
          <Box w="full" px={3} py={2} bg={`${accent}33`} borderRadius="4px" flexShrink={0}>
            <Text fontSize="12px" fontWeight="black" color={accent} textTransform="uppercase" letterSpacing="0.08em" lineClamp={1}>
              {tag}
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
};
