import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { POSITION_GROUP_PLURAL, CLASS_PLURAL, CLASS_ORDER } from "./bioBackground/bioBackgroundModel";
import PageShell from "../../layouts/PageShell";
import { Box, Grid, Flex, Text, Image } from "@chakra-ui/react";
import { Column, CardTitle, ComparativeRow, PositionClassGrid, CountChip } from "./bioBackground/BioBackgroundPrimitives";
import { Ruler, GraduationCap, ShieldCheck } from "lucide-react";
import PlayerHomeStateMap from "./PlayerHomeStateMap";

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
