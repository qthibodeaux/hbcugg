import { Text, Box, Flex, Grid } from "@chakra-ui/react";
import { getTeamColor } from "../../../game/page/utils/teamHelpers";
import { memo, useState } from "react";
import { getPlayCategory, getResultBadge, fmtYards, fmtDownDistance, categoryColor, fmtQuarter, fmtClock } from "../../../../utils/playByPlayModel";
import { ChevronDown, ChevronRight } from "lucide-react";

// Extracted from the live PlayByPlayPanel; behavior preserved.

const SectionLabel = ({ children, color = "text.muted" }) => (
  <Text fontSize="9px" color={color} fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
    {children}
  </Text>
);

const ResultBadge = ({ badge }) => {
  if (!badge) return null;
  return (
    <Box px={1.5} py={0.5} borderRadius="sm" bg={badge.bg} border="1px solid" borderColor={`${badge.color}44`}>
      <Text fontSize="8px" color={badge.color} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em">
        {badge.label}
      </Text>
    </Box>
  );
};

const ScoreCell = ({ teamId, score, teamShortFn }) => (
  <Flex direction="column" align="center" justify="center" flex="1" minW={0} bg={getTeamColor(teamId)} px={1} py="2px">
    <Text fontSize="7px" fontWeight="black" color="whiteAlpha.800" textTransform="uppercase" letterSpacing="0.1em" lineHeight={1.1} lineClamp={1}>
      {teamShortFn(teamId)}
    </Text>
    <Text fontSize="12px" fontWeight="black" color="white" lineHeight={1.1} fontFamily="mono">
      {score}
    </Text>
  </Flex>
);

export const PlayRow = memo(({ play, awayId, homeId, driveInfo, teamShortFn, teamLogoFn }) => {
  const [expanded, setExpanded] = useState(false);
  const b = play?.base ?? {};
  const sa = play?.state_after ?? {};
  const adv = play?.play_advanced ?? {};
  const epa = adv?.epa?.epa;
  const wpPost = adv?.wp?.wp_post;

  const offenseId = b.offense_team;
  const category = getPlayCategory(play);
  const badge = getResultBadge(play);
  const yards = fmtYards(sa.yards_gained);
  const downDistance = fmtDownDistance(b.down, b.distance, b.yl_team, b.yl_num, teamShortFn, b.spot_display);
  // The row reads the backend's sentence; the crew text is only the fallback
  // for files without one (and is shown on expand when there is one).
  const line = b.description ?? b.raw;
  const isBigPlay = epa != null && epa > 1.0;
  const isNegative = epa != null && epa < -0.8;
  const leftBorder = categoryColor[category] ?? "#71717A";

  return (
    <Box>
      <Flex
        align="center"
        gap={{ base: 2, xl: 3 }}
        px={{ base: 2, xl: 3 }}
        py={{ base: "10px", xl: "14px" }}
        borderLeft="3px solid"
        borderColor={leftBorder}
        bg={isBigPlay ? "rgba(167,139,250,0.04)" : isNegative ? "rgba(248,113,113,0.03)" : "transparent"}
        _hover={{ bg: "rgba(255,255,255,0.03)" }}
        cursor="pointer"
        onClick={() => setExpanded(!expanded)}
        transition="background 0.15s ease"
      >
        <Box minW="42px" flexShrink={0}>
          <Text fontSize="9px" color="text.muted" fontWeight="black">{fmtQuarter(b.quarter)}</Text>
          <Text fontSize="10px" color="white" fontWeight="black">{fmtClock(b.clock)}</Text>
        </Box>
        {/* D&D — the offense is carried by its own mark behind the down and
            distance rather than by a separate chip column. Two columns became
            one, and whose ball it is now reads at a glance instead of needing
            an abbreviation parsed. */}
        <Box
          position="relative"
          minW="112px"
          h="34px"
          flexShrink={0}
          display={{ base: "none", md: "flex" }}
          alignItems="center"
          overflow="hidden"
        >
          {offenseId && (
            <Box
              as="img"
              src={teamLogoFn(offenseId)}
              alt=""
              position="absolute"
              left="-6px"
              top="50%"
              h="190%"
              transform="translateY(-50%)"
              objectFit="contain"
              opacity={0.22}
              pointerEvents="none"
            />
          )}
          {downDistance && (
            <Box position="relative" minW={0}>
              <Text fontSize="11px" color="white" fontWeight="black" letterSpacing="0.02em" lineHeight={1.15} lineClamp={1}>
                {downDistance.dd}
              </Text>
              {downDistance.spot && (
                <Text fontSize="9px" color="text.muted" fontWeight="black" letterSpacing="0.02em" lineHeight={1.15} lineClamp={1}>
                  {downDistance.spot}
                </Text>
              )}
            </Box>
          )}
        </Box>
        <Box flex={1} minW={0}>
          <Text fontSize={{ base: "12px", xl: "13px" }} color="white" fontWeight="black" lineClamp={{ base: 2, xl: 1 }} lineHeight={1.25}>
            {line}
          </Text>
          {/* Phones hide the down-and-distance column, so it rides under the sentence. */}
          {downDistance && (
            <Text display={{ base: "block", md: "none" }} fontSize="10px" color="text.muted" fontWeight="black" mt="2px" letterSpacing="0.02em">
              {downDistance.short}{downDistance.spot ? ` · ${downDistance.spot}` : ""}
            </Text>
          )}
        </Box>
        <Box flexShrink={0}>
          <ResultBadge badge={badge} />
        </Box>
        {yards && (
          <Box minW="36px" textAlign="right" flexShrink={0}>
            <Text fontSize="11px" color={yards.color} fontWeight="black">{yards.text}</Text>
          </Box>
        )}
        {/* Running score as a two-cell scoreboard, each half in its own team's
            colour, rather than one grey "DSU 0, MSU 0" string. */}
        <Flex minW="96px" flexShrink={0} display={{ base: "none", lg: "flex" }} borderRadius="3px" overflow="hidden">
          <ScoreCell teamId={awayId} score={sa.score_away ?? 0} teamShortFn={teamShortFn} />
          <ScoreCell teamId={homeId} score={sa.score_home ?? 0} teamShortFn={teamShortFn} />
        </Flex>
        <Box minW="48px" textAlign="right" flexShrink={0} display={{ base: "none", xl: "block" }}>
          {epa != null ? (
            <Text fontSize="11px" color={epa >= 0 ? "#4ADE80" : "#F87171"} fontWeight="black">
              {epa > 0 ? "+" : ""}{epa.toFixed(2)}
            </Text>
          ) : (
            <Text fontSize="11px" color="text.muted" fontWeight="black">—</Text>
          )}
        </Box>
        <Box minW="48px" textAlign="right" flexShrink={0} display={{ base: "none", xl: "block" }}>
          {wpPost != null ? (
            <Text fontSize="11px" color="whiteAlpha.700" fontWeight="black">
              {(wpPost * 100).toFixed(1)}%
            </Text>
          ) : (
            <Text fontSize="11px" color="text.muted" fontWeight="black">—</Text>
          )}
        </Box>
        <Box flexShrink={0} color="whiteAlpha.400">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Box>
      </Flex>

      {expanded && (
        <Box px={{ base: 3, xl: 4 }} py={3} bg="rgba(0,0,0,0.22)" borderLeft="3px solid" borderColor={leftBorder}>
          {driveInfo && (
            <Box mb={3} p={2} borderRadius="sm" bg="rgba(255,255,255,0.03)" border="1px solid" borderColor="whiteAlpha.100">
              <Flex align="center" gap={2} wrap="wrap">
                <SectionLabel>Drive Context</SectionLabel>
                <Text fontSize="10px" color="white" fontWeight="black">
                  Drive {driveInfo.id} · {teamShortFn(driveInfo.team)} · {driveInfo.plays} plays · {driveInfo.yards} yards · {driveInfo.result}
                </Text>
                {driveInfo.scoring && (
                  <Box px={1.5} py={0.5} borderRadius="sm" bg="rgba(74,222,128,0.12)">
                    <Text fontSize="8px" color="#4ADE80" fontWeight="black" textTransform="uppercase">Scoring Drive</Text>
                  </Box>
                )}
              </Flex>
            </Box>
          )}

          {b.description && b.raw && (
            <Box mb={3}>
              <SectionLabel>Official Play Text</SectionLabel>
              <Text fontSize="10px" color="whiteAlpha.700" fontWeight="bold" mt={1} lineHeight={1.4}>{b.raw}</Text>
            </Box>
          )}

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={{ base: 3, xl: 4 }}>
            <Flex direction="column" gap={2}>
              <SectionLabel>Play Physics</SectionLabel>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Play Type</Text>
                <Text fontSize="10px" color="white" fontWeight="black" textTransform="capitalize">{category}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Yards Gained</Text>
                <Text fontSize="10px" color={yards?.color ?? "whiteAlpha.700"} fontWeight="black">{yards?.text ?? "—"}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Field Position</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {b.yl_team && b.yl_num != null ? `${teamShortFn(b.yl_team)} ${b.yl_num}` : "—"}
                  {play.yl_post_team && play.yl_post_num != null ? ` → ${teamShortFn(play.yl_post_team)} ${play.yl_post_num}` : ""}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Down & Distance</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {b.down ? `${b.down} & ${b.distance}` : "—"}
                  {sa.is_first_down ? " → 1ST DOWN" : ""}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Possession</Text>
                <Text fontSize="10px" color="white" fontWeight="black">{sa.possession_changed ? "CHANGED" : "Retained"}</Text>
              </Flex>
            </Flex>

            <Flex direction="column" gap={2}>
              <SectionLabel>Situational</SectionLabel>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Score (After)</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {teamShortFn(awayId)} {sa.score_away ?? 0} · {teamShortFn(homeId)} {sa.score_home ?? 0}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Win Probability</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {adv?.wp?.wp_pre != null ? `${(adv.wp.wp_pre * 100).toFixed(1)}%` : "—"}
                  {adv?.wp?.wp_post != null ? ` → ${(adv.wp.wp_post * 100).toFixed(1)}%` : ""}
                </Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontSize="10px" color="text.muted" fontWeight="black">Expected Points</Text>
                <Text fontSize="10px" color="white" fontWeight="black">
                  {adv?.epa?.ep_pre != null ? `${adv.epa.ep_pre.toFixed(2)}` : "—"}
                  {adv?.epa?.ep_post != null ? ` → ${adv.epa.ep_post.toFixed(2)}` : ""}
                  {epa != null ? ` (${epa > 0 ? "+" : ""}${epa.toFixed(2)})` : ""}
                </Text>
              </Flex>
              {sa.turnover && (
                <Flex justify="space-between">
                  <Text fontSize="10px" color="text.muted" fontWeight="black">Turnover</Text>
                  <Text fontSize="10px" color="#F87171" fontWeight="black">{sa.turnover_type ?? "Yes"}</Text>
                </Flex>
              )}
              {play?.penalties?.length > 0 && (
                <Flex justify="space-between">
                  <Text fontSize="10px" color="text.muted" fontWeight="black">Penalty</Text>
                  <Text fontSize="10px" color="#FBBF24" fontWeight="black">
                    {play.penalties.map((p) => p.text ?? "Penalty").join("; ")}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Grid>
        </Box>
      )}
    </Box>
  );
});

PlayRow.displayName = "PlayRow";
