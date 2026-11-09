import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { getTeamColor, onDark, getTeamAccent, getTeamLabel, getTeamLogoSrc } from "../../../../utils/gameSummary/teamIdentity";
import { useMemo } from "react";
import { EditorialCard, SectionLabel, MicroLabel } from "./SummaryPrimitives";
import { Box, Grid, Text, Flex, Image } from "@chakra-ui/react";

// Extracted from GameSummaryTabV2. Existing data and presentation behavior is preserved.

const periodLabel = (label) => {
  const m = /^OT(\d+)$/i.exec(String(label ?? ""));
  if (!m) return String(label ?? "");
  return Number(m[1]) > 1 ? `${m[1]}OT` : "OT";
};

export const ScoringSummaryCard = ({ scoreByQuarter, awayScore, homeScore, awayId, homeId }) => {
  const { isCompact } = useLayoutDensity();
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayInk = onDark(getTeamAccent(awayId));
  const homeInk = onDark(getTeamAccent(homeId));
  const awayLabel = getTeamLabel(awayId);
  const homeLabel = getTeamLabel(homeId);

  const periods = useMemo(() => {
    const labels = Array.isArray(scoreByQuarter?.labels) ? scoreByQuarter.labels : [];
    return labels.map((label, i) => ({
      key: label,
      label: periodLabel(label),
      away: scoreByQuarter?.away?.[i] ?? null,
      home: scoreByQuarter?.home?.[i] ?? null,
    }));
  }, [scoreByQuarter]);

  const finalAway = awayScore ?? null;
  const finalHome = homeScore ?? null;
  const show = (v) => (v == null ? "—" : v);

  if (isCompact) {
    const cols = periods;
    return (
      <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.2s" }}>
        <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
          <Box flexShrink={0} mb="0.5rem">
            <SectionLabel>Scoring Summary</SectionLabel>
          </Box>

          {/* Compact — one horizontal box-score table, matching the Team Stats tab's visual language:
              dark surface, gray metric labels, only the winning number gets color. */}
          <Box flex="1" minH={0} display="flex" flexDirection="column">
            <Grid templateColumns={`minmax(5rem, 1.4fr) repeat(${cols.length}, 1fr) 1fr`} gap="0.375rem" flexShrink={0} mb="0.375rem" pb="0.375rem" borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.1)">
              <Text fontSize="clamp(0.5rem, 0.55vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em">Team</Text>
              {cols.map((q) => (
                <Text key={q.key} fontSize="clamp(0.5rem, 0.55vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" textAlign="center">
                  {q.label}
                </Text>
              ))}
              <Text fontSize="clamp(0.5rem, 0.55vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.1em" textAlign="center">Total</Text>
            </Grid>

            <Flex flex="1" minH={0} direction="column" justify="space-between">
              {[
                { id: awayId, label: awayLabel, color: awayColor, final: finalAway },
                { id: homeId, label: homeLabel, color: homeColor, final: finalHome },
              ].map((team, ti) => {
                const otherFinal = ti === 0 ? finalHome : finalAway;
                const isWinner = team.final != null && otherFinal != null && team.final >= otherFinal;
                return (
                  <Grid key={team.id} templateColumns={`minmax(5rem, 1.4fr) repeat(${cols.length}, 1fr) 1fr`} gap="0.375rem" flex="1" minH={0} alignItems="center" borderBottom={ti === 0 ? "0.0625rem solid" : "none"} borderColor="rgba(255,255,255,0.06)">
                    <Flex align="center" gap="0.375rem" minW={0}>
                      <Image src={getTeamLogoSrc(team.id)} alt={team.label} boxSize="1rem" objectFit="contain" flexShrink={0} />
                      <Text fontSize="clamp(0.6rem, 0.7vw, 0.75rem)" fontWeight="900" color="rgba(255,255,255,0.75)" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                        {team.label}
                      </Text>
                    </Flex>
                    {cols.map((q) => (
                      <Text key={q.key} fontSize="clamp(0.7rem, 0.85vw, 0.9rem)" fontWeight="800" color="rgba(255,255,255,0.55)" textAlign="center">
                        {show(q[team.id === awayId ? "away" : "home"])}
                      </Text>
                    ))}
                    <Text fontSize="clamp(0.8rem, 0.95vw, 1rem)" fontWeight="950" color={isWinner ? "#22c55e" : "rgba(255,255,255,0.5)"} textAlign="center">
                      {show(team.final)}
                    </Text>
                  </Grid>
                );
              })}
            </Flex>
          </Box>
        </Box>
      </EditorialCard>
    );
  }

  return (
    <EditorialCard position="relative" overflow="hidden" className="animate-slide-in" h="full" w="full" display="flex" flexDirection="column" style={{ animationDelay: "0.2s" }}>
      <Box position="relative" zIndex={1} p="0.75rem" h="full" w="full" display="flex" flexDirection="column">
        <Box flexShrink={0} mb="0.5rem">
          <SectionLabel>Scoring Summary</SectionLabel>
        </Box>

        {/* Same dark surface language as every other card on the tab — team colors are lifted
            to a legibility floor by `onDark` rather than sitting on a white panel. */}
        <Box flex="1" minH={0} borderRadius="md" bg="rgba(255,255,255,0.03)" border="0.0625rem solid" borderColor="rgba(255,255,255,0.06)" p="0.625rem" display="flex" flexDirection="column">
          <Flex align="center" justify="space-between" flexShrink={0} mb="0.5rem" gap="0.5rem">
            <Box flex={1} minW={0}>
              <Flex align="center" gap="0.375rem" mb="0.125rem">
                <Image src={getTeamLogoSrc(awayId)} alt={awayLabel} boxSize="1.125rem" objectFit="contain" flexShrink={0} />
                <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {awayLabel}
                </Text>
              </Flex>
              <Text fontSize="clamp(0.95rem, 1.1vw, 1.15rem)" fontWeight="950" color={awayInk} lineHeight={1}>
                {show(finalAway)}
              </Text>
            </Box>

            <Text fontSize="clamp(0.5rem, 0.6vw, 0.65rem)" fontWeight="900" color="rgba(255,255,255,0.35)" textTransform="uppercase" letterSpacing="0.16em" flexShrink={0}>
              Final
            </Text>

            <Box flex={1} minW={0} textAlign="right">
              <Flex align="center" justify="flex-end" gap="0.375rem" mb="0.125rem">
                <Text fontSize="clamp(0.5rem, 0.6vw, 0.6rem)" fontWeight="900" color="rgba(255,255,255,0.55)" textTransform="uppercase" letterSpacing="0.16em" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                  {homeLabel}
                </Text>
                <Image src={getTeamLogoSrc(homeId)} alt={homeLabel} boxSize="1.125rem" objectFit="contain" flexShrink={0} />
              </Flex>
              <Text fontSize="clamp(0.95rem, 1.1vw, 1.15rem)" fontWeight="950" color={homeInk} lineHeight={1}>
                {show(finalHome)}
              </Text>
            </Box>
          </Flex>

          <Box flex="1" minH={0} borderTop="0.0625rem solid" borderColor="rgba(255,255,255,0.1)" display="flex" flexDirection="column" justifyContent="space-between">
            {/* One row per period played. Rows are flex={1}, so an OT game squeezes five or six
                rows into the same card height instead of growing it — the OT rows carry a
                brighter label so they read as extra time, not a fifth quarter. */}
            {periods.map((q) => {
              const isOT = /OT/i.test(q.key);
              return (
                <Flex key={q.key} flex="1" minH={0} align="center" justify="space-between" px="0.125rem" borderBottom="0.0625rem solid" borderColor="rgba(255,255,255,0.06)">
                  <Text fontSize="clamp(0.55rem, 0.65vw, 0.7rem)" fontWeight="900" color={isOT ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)"} textTransform="uppercase" letterSpacing="0.16em" minW="1.5rem">
                    {q.label}
                  </Text>

                  <Flex flex={1} align="center" justify="space-between" ml="0.5rem">
                    <Text fontSize="clamp(0.75rem, 0.9vw, 0.95rem)" fontWeight="950" color={awayInk}>
                      {show(q.away)}
                    </Text>
                    <Text fontSize="clamp(0.6rem, 0.7vw, 0.75rem)" fontWeight="800" color="rgba(255,255,255,0.25)">
                      •
                    </Text>
                    <Text fontSize="clamp(0.75rem, 0.9vw, 0.95rem)" fontWeight="950" color={homeInk}>
                      {show(q.home)}
                    </Text>
                  </Flex>
                </Flex>
              );
            })}
            {periods.length === 0 && (
              <Flex flex="1" align="center" justify="center">
                <MicroLabel>No period scoring on file</MicroLabel>
              </Flex>
            )}
          </Box>
        </Box>
      </Box>
    </EditorialCard>
  );
};
