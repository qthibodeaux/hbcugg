import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { ChevronDown, ChevronUp, GraduationCap, Minus, Ruler, ShieldCheck } from "lucide-react";
import PageShell from "../../layouts/PageShell";
import PlayerHomeStateMap from "./PlayerHomeStateMap";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";

const CLASS_ORDER = [
  { year: 1, label: "Freshman" },
  { year: 2, label: "Sophomore" },
  { year: 3, label: "Junior" },
  { year: 4, label: "Senior" },
  { year: 5, label: "Graduate" },
];

const CLASS_PLURAL = { 1: "Freshmen", 2: "Sophomores", 3: "Juniors", 4: "Seniors", 5: "Graduates" };

const POSITION_GROUP_PLURAL = {
  QB: "Quarterbacks", RB: "Running Backs", WR: "Wide Receivers", TE: "Tight Ends",
  OL: "Offensive Linemen", DL: "Defensive Linemen", LB: "Linebackers", DB: "Defensive Backs", ST: "Special Teamers",
};

const CardTitle = ({ icon: Icon, primary, children }) => (
  <Flex align="center" gap={2} mb={4}>
    <Box w="3px" h="16px" bg={primary ?? "brand.500"} borderRadius="full" />
    {Icon && <Icon size={13} color="var(--chakra-colors-text-muted)" />}
    <Text fontSize="xs" fontWeight="bold" color="white" textTransform="uppercase" letterSpacing="0.1em">
      {children}
    </Text>
  </Flex>
);

// Red → orange → green by percentile, same semantic scale as the reference
// stat-tile design this was modeled on — the number itself carries the
// quality signal instead of sitting flat white next to a separate badge.
const tierColor = (pct) => {
  if (pct == null) return "#E2E8F0";
  if (pct >= 80) return "#48BB78";
  if (pct >= 60) return "#9AE6B4";
  if (pct >= 40) return "#ECC94B";
  if (pct >= 20) return "#ED8936";
  return "#F56565";
};

// One internal column of the unified 4x2 shell — border-right divider
// instead of its own card bg/border/radius, so the four sections read as one
// component (like the banners above), not four separate floating cards.
const Column = ({ children, last = false, p = 6, ...rest }) => (
  <Box
    h="full"
    p={p}
    position="relative"
    overflow="hidden"
    borderRight={last ? "none" : "1px solid"}
    borderColor="whiteAlpha.100"
    {...rest}
  >
    {children}
  </Box>
);

// Percentile bar with a marker pin, MockDraftable-style — shows WHERE on the
// distribution the player sits, alongside the text delta which shows the GAP
// in real units. Fill/marker are tier-colored now, matching the value above.
const PercentileBar = ({ pct }) => {
  if (pct == null) return null;
  const color = tierColor(pct);
  return (
    <Box position="relative" h="6px" bg="whiteAlpha.100" borderRadius="full" mt={2.5}>
      <Box position="absolute" left={0} top={0} bottom={0} w={`${pct}%`} bg={color} opacity={0.75} borderRadius="full" />
      <Box
        position="absolute"
        left={`${pct}%`}
        top="50%"
        transform="translate(-50%, -50%)"
        w="10px"
        h="10px"
        borderRadius="full"
        bg={color}
        border="2px solid"
        borderColor="#0B0B0D"
      />
    </Box>
  );
};

// Rebuilt 2026-08-30. Was three stacked lines stating the same comparison
// four ways — position average, value, "+4 lbs vs avg", "42th pct", and the
// bar. Now two lines: label + value + a chevron delta, with the bar carrying
// the percentile. Also dropped fontFamily="mono" throughout this file
// (nothing else on these pages uses it, which is why the type read as
// foreign) and fixed the hardcoded "th" suffix that rendered 42nd as "42th".
const ordinalSuffix = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  const mod100 = num % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  return { 1: "st", 2: "nd", 3: "rd" }[num % 10] ?? "th";
};

const ComparativeRow = ({ label, value, delta, deltaUnit, pct }) => {
  const hasDelta = Number.isFinite(delta);
  const isEven = hasDelta && delta === 0;
  const deltaColor = isEven ? "text.muted" : delta > 0 ? "green.300" : "orange.300";
  const DeltaIcon = isEven ? Minus : delta > 0 ? ChevronUp : ChevronDown;

  return (
    <Box>
      <Flex align="baseline" justify="space-between" gap={2} minW={0}>
        <Text fontSize="10px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.04em" whiteSpace="nowrap">
          {label}
        </Text>
        {pct != null && (
          <Text fontSize="10px" fontWeight="700" color="text.muted" whiteSpace="nowrap">
            {pct}
            {ordinalSuffix(pct)}
          </Text>
        )}
      </Flex>

      <Flex align="baseline" gap={2} mt={0.5} minW={0}>
        <Text fontSize="xl" fontWeight="black" color={tierColor(pct)} lineHeight={1} whiteSpace="nowrap">
          {value}
        </Text>
        {hasDelta && (
          <Flex align="center" gap="1px" color={deltaColor} flexShrink={0}>
            <DeltaIcon size={13} />
            <Text fontSize="11px" fontWeight="900" whiteSpace="nowrap">
              {isEven ? "avg" : `${Math.abs(delta)}${deltaUnit ?? ""}`}
            </Text>
          </Flex>
        )}
      </Flex>

      <PercentileBar pct={pct} />
    </Box>
  );
};

const CountChip = ({ value, label }) => (
  <Flex align="baseline" gap={1.5} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="full" px={3} py={1.5}>
    <Text fontSize="sm" fontWeight="black" color="white">
      1 of {value}
    </Text>
    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.04em">
      {label}
    </Text>
  </Flex>
);

// Position-group teammates broken out by class year — replaces the old
// "Game Experience" row, which leaned on an opaque, unverifiable score.
// This is just a real headcount per class, with the player's own class cell
// flipped to the team colors so it reads at a glance.
const CLASS_ABBR = { 1: "FR", 2: "SO", 3: "JR", 4: "SR", 5: "GR" };

const PositionClassGrid = ({ positionLabel, counts, classYear, primary, secondary }) => (
  <Box>
    <Text fontSize="11px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.02em" mb={2}>
      {positionLabel} on Roster
    </Text>
    <Flex border="1px solid" borderColor={primary} borderRadius="md" overflow="hidden">
      {CLASS_ORDER.map((c, i) => {
        const isCurrent = classYear === c.year;
        return (
          <Flex
            key={c.year}
            flex={1}
            direction="column"
            align="center"
            justify="center"
            gap="2px"
            py={3}
            bg={isCurrent ? primary : "transparent"}
            borderLeft={i > 0 ? "1px solid" : "none"}
            borderColor={primary}
          >
            <Text fontSize="xl" fontWeight="black" color={isCurrent ? secondary : "white"} lineHeight={1}>
              {counts?.[c.year] ?? 0}
            </Text>
            <Text fontSize="9px" fontWeight="800" color={isCurrent ? secondary : "text.muted"} textTransform="uppercase">
              {CLASS_ABBR[c.year]}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  </Box>
);

const PlayerBioBackgroundPanel = ({
  player,
  height,
  weight,
  homeCity,
  homeState,
  isInState,
  highSchool,
  previousSchool,
  classYear: classYearProp,
  heightPercentile,
  weightPercentile,
  heightAvg,
  weightAvg,
  positionTeamCount,
  classTeamCount,
  transferTeamCount,
  inStateTeamCount,
  homeStateTeamCount,
  rosterTeamCount,
  positionClassCounts,
  teamMeta,
  formatHeight,
}) => {
  const { isMobile } = useLayoutDensity();
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";
  const classYear = Number(classYearProp);
  const heightDelta = Number.isFinite(height) && Number.isFinite(heightAvg) ? Math.round(height - heightAvg) : null;
  const weightDelta = Number.isFinite(weight) && Number.isFinite(weightAvg) ? Math.round(weight - weightAvg) : null;

  // Half a phone viewport is too narrow for the desktop p={6}.
  const columnPad = isMobile ? "0.85rem" : 6;

  const teamChips = [
    { value: positionTeamCount, label: POSITION_GROUP_PLURAL[player.position_group] ?? "Same Position" },
    { value: classTeamCount, label: CLASS_PLURAL[classYear] ?? "Same Class" },
  ];
  if (player.is_transfer) teamChips.push({ value: transferTeamCount, label: "Transfers" });
  if (isInState) teamChips.push({ value: inStateTeamCount, label: "In-State Players" });

  return (
    <PageShell.Slot cols={4} rows={2}>
      {/* One shell, four internal columns divided by borders — matches the
          banner components above instead of reading as 4 separate cards. */}
      {/* Mobile wraps the four columns into 2x2 — at a quarter of a phone
          viewport each, every label broke onto its own letter-per-line
          ("TRAN / SFER / PLAY / ER"). */}
      <Box
        bg="bg.secondary"
        border={isMobile ? "none" : "1px solid"}
        borderColor="whiteAlpha.100"
        borderRadius={isMobile ? 0 : "xl"}
        h="full"
        overflow="hidden"
      >
        <Grid
          templateColumns={isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, 1fr)"}
          h="full"
          // Columns only carry right-hand dividers, which leaves the two
          // mobile rows running together — add a bottom rule. Padding is set
          // per-column (not here) so the map column can still run edge to
          // edge; the desktop p={6} is too wide for a half-width column.
          css={isMobile
            ? { "& > *": { borderBottom: "1px solid rgba(255,255,255,0.08)" } }
            : undefined}
        >
          {/* Comparatives — real values against the position-group average,
              not a bare percentile. Value, position avg, delta, percentile
              bar — the pattern to keep expanding. */}
          <Column p={columnPad}>
            <CardTitle icon={Ruler} primary={primary}>Comparatives</CardTitle>
            <Flex direction="column" gap={4}>
              <ComparativeRow
                label="Height"
                value={formatHeight(height)}
                delta={heightDelta}
                deltaUnit={'"'}
                pct={heightPercentile}
              />
              <ComparativeRow
                label="Weight"
                value={weight ? `${weight} lbs` : "-"}
                delta={weightDelta}
                deltaUnit=" lbs"
                pct={weightPercentile}
              />
            </Flex>

            <Box mt={5}>
              <PositionClassGrid
                positionLabel={POSITION_GROUP_PLURAL[player.position_group] ?? "Players"}
                counts={positionClassCounts}
                classYear={classYear}
                primary={primary}
                secondary={secondary}
              />
            </Box>

            <Box mt={5} pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={2.5}>
                On This Team
              </Text>
              <Flex wrap="wrap" gap={2}>
                {teamChips.map((chip) => (
                  <CountChip key={chip.label} value={chip.value} label={chip.label} />
                ))}
              </Flex>
            </Box>
          </Column>

          {/* Home state — geographic + in/out-of-state status together, since
              real per-player distance-in-miles data doesn't exist in the
              pipeline (checked: 0 of 1946 players have it). */}
          <Column p={0}>
            <PlayerHomeStateMap
              stateAbbr={homeState}
              cityLabel={homeCity}
              schoolState={teamMeta?.state}
              primary={primary}
              secondary={secondary}
              isInState={isInState}
              homeStateTeamCount={homeStateTeamCount}
              rosterTeamCount={rosterTeamCount}
            />
            {/* Desktop keeps the floating badge; on mobile the map component
                renders it as its own row instead of overlaying the map. */}
            {!isMobile && isInState != null && (
              <Box position="absolute" top="0.6rem" right="0.6rem" px={3} py={1} borderRadius="full" bg={isInState ? "green.900" : "whiteAlpha.200"} border="1px solid" borderColor={isInState ? "green.700" : "whiteAlpha.300"}>
                <Text fontSize="10px" fontWeight="bold" color={isInState ? "green.300" : "white"} textTransform="uppercase" letterSpacing="0.06em">
                  {isInState ? "In-State" : "Out-of-State"}
                </Text>
              </Box>
            )}
          </Column>

          {/* Class timeline — full words, spaced out to use the full column
              height instead of clustering at the top. */}
          <Column p={columnPad}>
            <CardTitle icon={GraduationCap} primary={primary}>Class Timeline</CardTitle>
            <Flex direction="column" justify="space-evenly" h="calc(100% - 32px)">
              {CLASS_ORDER.map((c, i) => {
                const isCurrent = classYear === c.year;
                const isPast = classYear > c.year;
                return (
                  <Flex key={c.year} gap={4} align="center">
                    <Flex direction="column" align="center" alignSelf="stretch" flexShrink={0}>
                      <Box
                        w="16px"
                        h="16px"
                        borderRadius="full"
                        bg={isCurrent || isPast ? primary : "whiteAlpha.200"}
                        border={isCurrent ? "3px solid" : "none"}
                        borderColor={secondary}
                        flexShrink={0}
                      />
                      {i < CLASS_ORDER.length - 1 && <Box w="2px" flex={1} bg={isPast ? primary : "whiteAlpha.150"} />}
                    </Flex>
                    <Text fontSize="md" fontWeight={isCurrent ? "bold" : "medium"} color={isCurrent ? "white" : "text.muted"}>
                      {c.label}
                      {isCurrent && (
                        <Text as="span" fontSize="10px" color={primary} fontWeight="black" ml={2} textTransform="uppercase">
                          Now
                        </Text>
                      )}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          </Column>

          {/* Background — transfer/redshirt/high-school story. Carries the
              jersey watermark + team logo wash since it's the one column
              about the player's own narrative, not a comparison. */}
          <Column last p={columnPad}>
            <Text position="absolute" right="0.5rem" bottom="-1.2rem" fontSize="8rem" fontWeight="black" color={primary} opacity={0.14} lineHeight={0.8} zIndex={0}>
              {player.jersey_number ?? ""}
            </Text>
            {teamMeta?.logo && (
              <Image
                src={teamMeta.logo}
                alt=""
                position="absolute"
                right="-38px"
                top="50%"
                transform="translateY(-50%)"
                w={{ base: "220px", xl: "300px" }}
                h={{ base: "220px", xl: "300px" }}
                objectFit="contain"
                opacity={0.18}
                pointerEvents="none"
              />
            )}
            <Box position="relative" zIndex={1}>
              <CardTitle icon={ShieldCheck} primary={primary}>Background</CardTitle>
              <Flex direction="column" gap={3}>
                {player.is_transfer && (
                  <Box bg="yellow.900" border="1px solid" borderColor="yellow.700" borderRadius="lg" p={3}>
                    <Text fontSize="10px" color="yellow.300" fontWeight="bold" textTransform="uppercase" mb={1}>
                      Transfer Player
                    </Text>
                    <Text fontSize="sm" color="white">
                      {previousSchool ? `From ${previousSchool}` : `${player.transfer_tier ?? ""} Transfer`}
                    </Text>
                  </Box>
                )}
                {player.is_redshirt && (
                  <Box bg="orange.900" border="1px solid" borderColor="orange.700" borderRadius="lg" p={3}>
                    <Text fontSize="10px" color="orange.300" fontWeight="bold" textTransform="uppercase" mb={1}>
                      Redshirt Season
                    </Text>
                    <Text fontSize="sm" color="white">
                      Currently serving redshirt year.
                    </Text>
                  </Box>
                )}
                {highSchool && (
                  <Box>
                    <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" mb={1}>
                      High School
                    </Text>
                    <Text fontSize="sm" color="white" fontWeight="semibold">
                      {highSchool}
                    </Text>
                  </Box>
                )}
                {!player.is_transfer && !player.is_redshirt && !highSchool && (
                  <Text fontSize="sm" color="text.muted">
                    No transfer, redshirt, or high school history on file.
                  </Text>
                )}
              </Flex>
            </Box>
          </Column>
        </Grid>
      </Box>
    </PageShell.Slot>
  );
};

export default PlayerBioBackgroundPanel;
