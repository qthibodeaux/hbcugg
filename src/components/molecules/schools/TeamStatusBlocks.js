import { Link } from "react-router-dom";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts";

/**
 * TeamStatusBlocks
 *
 * PHILOSOPHY:
 *   Purpose: 1×1 and 2×2 status cards for the Team Details compact grid.
 *   Grid slots: 1×1 (compact variants) and 2×2 (standard variants)
 *
 * CONTENT TIERS (Responsive Behavior):
 *   Essential (always show): section label, primary data, team identity
 *   Nice-to-have (normal): meta lines, tag pills, watermark numbers
 *   Fluff (drop at mobile): gradient overlays, secondary watermarks
 *
 * TYPOGRAPHY SCALING:
 *   Heading:   clamp(1.1rem, 3vw, 1.6rem)  compact → clamp(1.6rem, 4vw, 2.4rem) standard
 *   Label:     8px (compact) → 10px (standard)
 *   Meta:      9px (compact) → 11px (standard)
 *   Rule:      Never hardcode px for primary layout; use clamp() or responsive arrays
 *
 * COMPONENT SIZING:
 *   Grid/flex:  % widths, fr tracks, clamp(), minmax(0, 1fr)
 *   Padding:    compact p={3} → standard p={{ base: 4, lg: 5 }}
 *   Logos:      clamp(1.25rem, 3.5vw, 1.75rem) compact → clamp(2rem, 5vw, 2.75rem) standard
 *   Rule:       h="full" w="full", no hardcoded root heights
 */

const formatPct = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return `${Math.round(n > 1 ? n : n * 100)}%`;
};

const formatDate = (value) => {
  if (!value) return "Date TBD";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatDateShort = (value) => {
  if (!value) return "Date TBD";
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const teamLabel = (team) => team?.bannerShort || team?.shortName || team?.name || "Team";

const LOGO_SIZES = {
  sm: "clamp(1.25rem, 3.5vw, 1.75rem)",
  md: "clamp(2rem, 5vw, 2.75rem)",
};

const TeamLogoTile = ({ team, label = "TBD", size = "md" }) => {
  const dim = LOGO_SIZES[size] || LOGO_SIZES.md;
  return (
    <Flex
      w={dim}
      h={dim}
      align="center"
      justify="center"
      bg={team?.colors?.primary || "whiteAlpha.100"}
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="6px"
      overflow="hidden"
      flexShrink={0}
    >
      {team?.logo ? (
        <Image src={team.logo} alt="" maxW="85%" maxH="85%" objectFit="contain" />
      ) : (
        <Text fontSize="10px" fontWeight="black" color="text.primary">
          {String(label).slice(0, 3).toUpperCase()}
        </Text>
      )}
    </Flex>
  );
};

const SectionLabel = ({ label, color = "brand.500", textColor = "text.muted" }) => (
  <Flex align="center" gap={2} minW={0}>
    <Box w="7px" h="7px" borderRadius="full" bg={color} flexShrink={0} />
    <Text
      fontSize={{ base: "12px", lg: "15px" }}
      fontWeight="black"
      color={textColor}
      textTransform="uppercase"
      letterSpacing="0.12em"
      lineClamp={1}
    >
      {label}
    </Text>
  </Flex>
);

const TeamRecordCompact = ({ team, record = {} }) => {
  const primary = team?.colors?.primary || "#1A365D";
  const secondary = team?.colors?.secondary || "#F56565";
  const overall = record.overall || record.display || "--";

  return (
    <Flex
      w="full"
      h="full"
      align="center"
      justify="space-between"
      gap={3}
      bg={primary}
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
      p={{ base: 3, lg: 4 }}
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(110deg, ${primary} 0%, rgba(11,11,13,0.84) 100%)`} />
      <Text position="absolute" right="-0.25rem" bottom="-1.1rem" fontSize="4.4rem" fontWeight="black" color="whiteAlpha.100" lineHeight={1}>
        {overall}
      </Text>
      <Box position="relative" minW={0}>
        <SectionLabel label="Season Record" color={secondary} />
        <Text mt={1} fontSize="clamp(2rem, 6vw, 3.5rem)" fontWeight="black" color="white" lineHeight={0.95}>
          {overall}
        </Text>
      </Box>
      {team?.logo && <Image src={team.logo} alt="" h="62%" maxW="28%" objectFit="contain" opacity={0.35} />}
    </Flex>
  );
};

const RECENT_RESULT_COLOR = { W: "#48BB78", L: "#F56565", T: "#A0AEC0" };

// One "Last 5" row: colored W/L/T badge, @ or vs, opponent abbreviation,
// team-first score. Built from toLegacyScheduleGame's shape (result,
// home_away, score_team, score_opp) via useTeamRecentGames.
const RecentGameRow = ({ game }) => {
  const color = RECENT_RESULT_COLOR[game.result] || "#A0AEC0";
  const prefix = game.home_away === "away" ? "@" : "vs";
  const opponent = game.opponent?.abbreviation || game.opponent?.short_name || game.opponent_name || "—";

  return (
    <Flex align="center" gap={1.5} minW={0}>
      <Box px="4px" py="1px" borderRadius="3px" bg={`${color}33`} flexShrink={0}>
        <Text fontSize="12px" fontWeight="black" color={color} lineHeight={1.3}>
          {game.result}
        </Text>
      </Box>
      <Text fontSize="12px" fontWeight="bold" color="whiteAlpha.700" flexShrink={0}>
        {prefix}
      </Text>
      <Text fontSize="12px" fontWeight="black" color="white" lineClamp={1} minW={0}>
        {opponent}
      </Text>
      <Text fontSize="12px" fontWeight="bold" color="whiteAlpha.700" ml="auto" flexShrink={0} whiteSpace="nowrap">
        {game.score_team}-{game.score_opp}
      </Text>
    </Flex>
  );
};

export const TeamRecordBlock = ({ team, record, last5 = [], variant = "standard" }) => {
  if (variant === "compact") return <TeamRecordCompact team={team} record={record} />;

  const primary = team?.colors?.primary || "#1A365D";
  const secondary = team?.colors?.secondary || "#F56565";
  const overall = record?.overall || record?.display || "--";
  const rank = record?.rank || `${team?.conference || "HBCU"} ${team?.division || "football"}`;

  // MEAC plays its conference slate later in the season than SWAC, so a team
  // can have real overall games but zero conference games played yet.
  // Conference record only becomes the headline number once it exists;
  // until then the card just shows the overall record like it always did.
  const confWins = record?.conference_wins;
  const confLosses = record?.conference_losses;
  const hasConferenceRecord = Number(confWins ?? 0) + Number(confLosses ?? 0) > 0;
  const headline = hasConferenceRecord ? `${confWins}-${confLosses}` : overall;
  const subline = hasConferenceRecord ? `${overall} overall` : "Conference play pending";

  return (
    <Box
      w="full"
      h="full"
      bg={primary}
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" inset={0} bg={`linear-gradient(110deg, ${primary} 0%, rgba(11,11,13,0.7) 100%)`} />
      <Text
        position="absolute"
        right="-0.5rem"
        bottom="-1.5rem"
        fontSize="clamp(5rem, 12vw, 8rem)"
        fontWeight="black"
        color="whiteAlpha.100"
        lineHeight={1}
        pointerEvents="none"
      >
        {headline}
      </Text>
      <Flex position="relative" zIndex={1} h="full" p={{ base: 4, lg: 5 }} gap={3}>
        <Flex flex={1} direction="column" justify="space-between" minW={0}>
          <Box minW={0}>
            <SectionLabel label={hasConferenceRecord ? "Conference Record" : "Season Record"} color={secondary} />
            <Text mt={2} fontSize="clamp(2.75rem, 8vw, 4.6rem)" fontWeight="black" color="white" lineHeight={0.9}>
              {headline}
            </Text>
            <Text mt={2} fontSize={{ base: "14px", lg: "18px" }} fontWeight="bold" color="whiteAlpha.800" lineClamp={1}>
              {subline}
            </Text>
          </Box>

          <Box
            w="full"
            px={3}
            py={2}
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            borderRadius="6px"
            minW={0}
          >
            <Text fontSize={{ base: "12px", lg: "15px" }} fontWeight="black" color={secondary} textTransform="uppercase" lineClamp={1}>
              {rank}
            </Text>
          </Box>
        </Flex>

        {last5.length > 0 && (
          <Flex flex={1} direction="column" gap={1.5} minW={0} pl={3} borderLeft="1px solid" borderColor="whiteAlpha.150">
            <Text fontSize={{ base: "11px", lg: "13px" }} fontWeight="black" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.12em">
              Last 5
            </Text>
            <Flex direction="column" gap={1} justify="center" flex={1}>
              {last5.map((game) => (
                <RecentGameRow key={game.game_id || `${game.date}-${game.opponent_id}`} game={game} />
              ))}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

/* ─── Next Game ─── */

// No team-vs-opponent cluster here — this card only ever renders on that
// team's own page, so naming the team again is redundant. Leads with the
// opponent instead, plus a real quick data point (e.g. opponent's own Avg
// PAR) when the opponent resolves to one of our 18 tracked teams; falls
// back to generic date/venue/tag info for external opponents or when the
// stat isn't available for the season being viewed.
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

/* ─── Review / Previous Game ─── */

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

/* ─── Team Stat ─── */

export const TeamStatCard = ({ team, stat }) => {
  const accent = stat?.accent || team?.colors?.secondary || "#F56565";
  const primary = team?.colors?.primary || "#1A1A1D";
  const value = stat?.value ?? "--";
  const label = stat?.label || "Team Stat";
  const sub = stat?.sub || "Pipeline stat pending";

  return (
    <Box w="full" h="full" bg={primary} border="1px solid" borderColor="whiteAlpha.100" overflow="hidden" position="relative" p={{ base: 3, lg: 4 }}>
      <Text
        position="absolute"
        right="-0.35rem"
        bottom="-0.9rem"
        fontSize="clamp(3rem, 8vw, 5rem)"
        fontWeight="black"
        color="whiteAlpha.100"
        lineHeight={1}
        pointerEvents="none"
      >
        {value}
      </Text>
      <Flex position="relative" zIndex={1} h="full" direction="column" justify="space-between" minH={0}>
        <SectionLabel label={label} color={accent} />
        <Box minW={0}>
          <Text fontSize="clamp(2rem, 6vw, 3.2rem)" fontWeight="black" color="text.primary" lineHeight={0.9} lineClamp={1}>
            {value}
          </Text>
          <Text mt={2} fontSize={{ base: "12px", lg: "14px" }} fontWeight="bold" color="whiteAlpha.800" lineHeight={1.25} lineClamp={2}>
            {sub}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

/* ─── Team Production (rotating category carousel) ─── */
//
// A slow carousel over 2-3 category "cards" (Passing Production, Rushing
// Production, Havoc/Pass Defense, Kickoff, Kick Return, etc. — whichever the
// Why Engine picks as notable for this team). Each frame shows that one
// category's 4 metrics as horizontal bars, scaled to that metric's
// conference-best value, with a label + conference-rank line beneath each
// bar. Pure CSS crossfade between frames, same technique as
// StandingsPage.js's ContextRotationCard: every frame is stacked and runs
// the same keyframe, separated only by a negative animation-delay — no
// timer, no state, no effect (AgentDesignBible bars useEffect; a
// setInterval carousel is exactly what that rule exists to prevent).
const PRODUCTION_HOLD_SECONDS = 8;

// Ordinal formatter for conference rank ("3" -> "3rd"). Formatting only —
// the rank itself, and which stat taxonomy backs a metric, are backend
// calls the frontend has no way to derive on its own. Must reject null/
// undefined explicitly before the Number() cast — Number(null) is 0, not
// NaN, so a missing rank was rendering as a false "0th" without this check.
const ordinal = (value) => {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
};

// DEV MOCK — no real profile payload exists yet, so this fills the card
// with plausible-looking numbers purely so the layout can be reviewed.
// Delete once `why_cards.team_production.cards` is real; every value here
// is invented, not derived from any actual game/production data.
const PRODUCTION_FALLBACK = [
  {
    key: "passing",
    label: "Passing Production",
    metrics: [
      { key: "comp_pct", label: "Comp %", value: 61.4, conference_best: 68.2, conference_rank: 3, conference_size: 6 },
      { key: "yds_att", label: "Yds/Att", value: 7.8, conference_best: 9.1, conference_rank: 4, conference_size: 6 },
      { key: "passer_rtg", label: "Rtg", value: 138.2, conference_best: 161.5, conference_rank: 3, conference_size: 6 },
      { key: "td_int", label: "TD:INT", value: 3.0, conference_best: 4.2, conference_rank: 2, conference_size: 6 },
    ],
  },
  {
    key: "rushing",
    label: "Rushing Production",
    metrics: [
      { key: "yds_carry", label: "Yds/Car", value: 4.6, conference_best: 6.2, conference_rank: 4, conference_size: 6 },
      { key: "yds_game", label: "Yds/Gm", value: 142.3, conference_best: 210.8, conference_rank: 5, conference_size: 6 },
      { key: "rush_td", label: "Rush TD", value: 14, conference_best: 22, conference_rank: 3, conference_size: 6 },
      { key: "explosive", label: "10+ Yd", value: 28, conference_best: 41, conference_rank: 4, conference_size: 6 },
    ],
  },
];

const ProductionBarRow = ({ metric, color, variant }) => {
  const value = metric.value ?? null;
  const best = metric.conference_best ?? null;
  // unit_carousel (Team Hub §1) sends rank/total per metric, not a magnitude
  // to scale against — fall back to bar length by ordinal position instead
  // of leaving the bar empty. Ranking position is arguably the more honest
  // comparison across metrics with different units anyway (COMP% vs PASS TD).
  const pct = value != null && best
    ? Math.max(2, Math.min(100, (value / best) * 100))
    : metric.conference_rank && metric.conference_size > 1
      ? Math.max(2, 100 - ((metric.conference_rank - 1) / (metric.conference_size - 1)) * 100)
      : 0;
  const rankLabel = ordinal(metric.conference_rank);
  const rankText = rankLabel && metric.conference_size ? `${rankLabel} / ${metric.conference_size}` : "--";

  return (
    <Flex direction="column" justify="center" gap="2px" minH={0}>
      <Box h={variant === "compact" ? "6px" : "7px"} bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{ name: metric.key, pct }]} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="pct" radius={[99, 99, 99, 99]} isAnimationActive={false}>
              <Cell fill={color} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Flex justify="space-between" align="baseline" gap={2} minW={0}>
        <Text fontSize="12px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.06em" lineClamp={1} minW={0} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {metric.label}
        </Text>
        <Text fontSize="10px" fontWeight="bold" color="whiteAlpha.600" flexShrink={0} whiteSpace="nowrap">
          {rankText}
        </Text>
      </Flex>
    </Flex>
  );
};

export const TeamProductionCard = ({ team, cards = [], variant = "standard" }) => {
  const items = (cards.length ? cards : PRODUCTION_FALLBACK).slice(0, 3);
  const count = items.length;
  const cycle = Math.max(1, count) * PRODUCTION_HOLD_SECONDS;
  const visible = count > 0 ? 100 / count : 100;
  const delayFor = (index) => `-${((count - index) % count) * PRODUCTION_HOLD_SECONDS}s`;
  const accent = team?.colors?.secondary || "#F56565";
  const colors = [accent, "#48BB78", "#63B3ED", "#9F7AEA"];

  return (
    <Box
      className="team-production-rotation"
      w="full"
      h="full"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      overflow="hidden"
      position="relative"
    >
      <style>{`
        @keyframes teamProductionRotateItem {
          0% { opacity: 0; }
          3% { opacity: 1; }
          ${Math.max(4, visible - 3)}% { opacity: 1; }
          ${visible}% { opacity: 0; }
          100% { opacity: 0; }
        }
        .team-production-rotation .tp-item,
        .team-production-rotation .tp-dot {
          animation: teamProductionRotateItem ${cycle}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .team-production-rotation .tp-item,
          .team-production-rotation .tp-dot { animation: none; opacity: 0; }
          .team-production-rotation .tp-item:first-of-type,
          .team-production-rotation .tp-dot:first-of-type { opacity: 1; }
        }
      `}</style>

      {items.map((card, index) => (
        <Flex
          key={card.key || card.label}
          className="tp-item"
          position="absolute"
          inset={0}
          p={{ base: 3, lg: variant === "compact" ? 3 : 4 }}
          pb={6}
          direction="column"
          gap={2}
          style={{ animationDelay: delayFor(index) }}
        >
          <SectionLabel label={card.label} color={accent} />
          <Grid flex={1} templateRows="repeat(4, minmax(0, 1fr))" gap={variant === "compact" ? 2.5 : 3} minH={0}>
            {(card.metrics || []).slice(0, 4).map((metric, metricIndex) => (
              <ProductionBarRow
                key={metric.key || metric.label}
                metric={metric}
                color={colors[metricIndex % colors.length]}
                variant={variant}
              />
            ))}
          </Grid>
        </Flex>
      ))}

      <Flex position="absolute" bottom={2} left={3} gap="5px">
        {items.map((card, index) => (
          <Box key={`track-${card.key || card.label}`} position="relative" w="12px" h="2px" borderRadius="full" bg="whiteAlpha.200">
            <Box className="tp-dot" position="absolute" inset={0} borderRadius="full" bg={accent} style={{ animationDelay: delayFor(index) }} />
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export const buildTeamStatFromRoster = (team, rosterModule) => ({
  label: "Top Stat",
  value: rosterModule?.experience ? formatPct(rosterModule.experience.veteran_pct) : "--",
  sub: rosterModule?.experience
    ? `Veteran share for ${team?.shortName || team?.name || "this roster"}`
    : "Pipeline stat pending",
  accent: team?.colors?.secondary || "#F56565",
});
