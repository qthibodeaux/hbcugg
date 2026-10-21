import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import { BURNT, GREEN, GREY, TEAM_BY_V5, pct0, shortOf } from "./ddModel";

// Slide 7 — every 4th & 1 or 2, on a half field turned sideways: a lane per
// team, the team's own goal line on the left, the opponent's 20 on the right
// (the red zone is left off — a field goal there is a different decision).
// A dot per play: go (green; filled if it converted, hollow if not), field goal
// (orange), punt (grey). The highlighted plays — punts from a team's own 40 or
// beyond — get a ring at full strength; everything else mutes. The side column
// is the team's conversion rate on 3rd/4th & 2-or-less.

const LO = 20; // opponent's 20
const HI = 100; // own goal line
const xOf = (ytg) => ((HI - ytg) / (HI - LO)) * 100;
const YARD_LINES = [100, 90, 80, 70, 60, 50, 40, 30, 20];
const yardLabel = (ytg) => (ytg === 100 ? "G" : ytg === 50 ? "50" : ytg > 50 ? `${100 - ytg}` : `${ytg}`);
const COLS = "150px minmax(0,1fr) 92px";
const DOT = 22;

const inkOf = (p) => (p.decision === "go" ? GREEN : p.decision === "fg" ? BURNT : GREY);

export const DDFieldMap = ({ slide }) => {
  const teams = [...(slide.teams ?? [])].sort((a, b) => b.short_yardage_conv_pct - a.short_yardage_conv_pct);
  const byTeam = {};
  slide.points.forEach((p) => { (byTeam[p.team_id] = byTeam[p.team_id] ?? []).push(p); });
  const anyHl = slide.points.some((p) => p.highlight);

  return (
    <Flex direction="column" h="100%" minH={0}>
      <Grid templateColumns={COLS} columnGap="14px" alignItems="end" pb="10px" borderBottom="1px solid rgba(255,255,255,0.14)">
        <Box />
        <Flex align="center" gap="18px">
          {[["Go, converted", GREEN, true], ["Go, failed", GREEN, false], ["Field goal", BURNT, true], ["Punt", GREY, true]].map(([label, ink, fill]) => (
            <Flex key={label} align="center" gap="6px">
              <Box w="14px" h="14px" borderRadius="full" bg={fill ? ink : "transparent"} border={`2.5px solid ${ink}`} />
              <Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.75)" textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
            </Flex>
          ))}
        </Flex>
        <Text fontSize="13px" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.08em" textAlign="right">3rd/4th & 1-2</Text>
      </Grid>

      {/* The field: yard lines under every lane. */}
      <Box position="relative" flex={1} minH={0}>
        <Grid position="absolute" inset={0} templateColumns={COLS} columnGap="14px" pointerEvents="none">
          <Box />
          <Box position="relative" bg="rgba(31,122,63,0.10)">
            {YARD_LINES.map((y) => (
              <Box key={y} position="absolute" top={0} bottom={0} borderLeft={y === 50 ? "2px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.12)"} style={{ left: `${xOf(y)}%` }} />
            ))}
          </Box>
        </Grid>
        <Flex direction="column" h="100%" position="relative">
          {teams.map((t) => {
            const plays = [...(byTeam[t.team_id] ?? [])].sort((a, b) => b.yards_to_goal - a.yards_to_goal);
            // Plays on the same yard stack a little up and down instead of hiding each other.
            const seen = {};
            return (
              <Grid key={t.team_id} flex={1} minH="34px" templateColumns={COLS} columnGap="14px" alignItems="center" borderBottom="1px solid rgba(255,255,255,0.05)">
                <Flex align="center" gap="10px" minW={0}>
                  <Image src={TEAM_BY_V5[t.team_id]?.logo} alt="" w="34px" h="34px" objectFit="contain" flexShrink={0} />
                  <Text fontSize="19px" fontWeight="900" color="white" textTransform="uppercase" whiteSpace="nowrap">{shortOf(t.team_id)}</Text>
                </Flex>
                <Box position="relative" h="100%">
                  {plays.map((p, i) => {
                    const k = Math.round(p.yards_to_goal / 2);
                    const n = (seen[k] = (seen[k] ?? -1) + 1);
                    const dy = n === 0 ? 0 : (n % 2 ? -1 : 1) * Math.ceil(n / 2) * 7;
                    const ink = inkOf(p);
                    const fill = p.decision !== "go" || p.converted === true;
                    const dim = anyHl && !p.highlight;
                    return (
                      <Box key={i} position="absolute" top="50%" borderRadius="full" bg={fill ? ink : "#0B0B0D"} border={`2.5px solid ${ink}`}
                        boxShadow={p.highlight ? "0 0 0 3px #0B0B0D, 0 0 0 5px #FFFFFF" : "none"} opacity={dim ? 0.38 : 1} zIndex={p.highlight ? 3 : 1}
                        style={{ width: DOT, height: DOT, left: `${xOf(p.yards_to_goal)}%`, transform: `translate(-50%, calc(-50% + ${dy}px))` }} />
                    );
                  })}
                </Box>
                <Flex direction="column" align="flex-end">
                  <Text fontSize="20px" fontWeight="950" color="white" lineHeight={1} fontVariantNumeric="tabular-nums">{pct0(t.short_yardage_conv_pct)}</Text>
                  <Text fontSize="11px" fontWeight="800" color="rgba(255,255,255,0.5)">of {t.short_yardage_att}</Text>
                </Flex>
              </Grid>
            );
          })}
        </Flex>
      </Box>

      {/* Yard numbers along the bottom. */}
      <Grid templateColumns={COLS} columnGap="14px" pt="8px">
        <Box />
        <Box position="relative" h="18px">
          {YARD_LINES.map((y) => (
            <Text key={y} position="absolute" fontSize="14px" fontWeight="900" color="rgba(255,255,255,0.6)" style={{ left: `${xOf(y)}%`, transform: "translateX(-50%)" }}>{yardLabel(y)}</Text>
          ))}
        </Box>
        <Box />
      </Grid>
    </Flex>
  );
};
