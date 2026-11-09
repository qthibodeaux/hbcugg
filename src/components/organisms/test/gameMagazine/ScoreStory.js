import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { getTeamLogo, getTeamLabel, getTeam, fmt } from "./magazineModel";
import { useMemo } from "react";

export const ScoreboardBanner = ({ meta, awayTeam, homeTeam }) => {
  const away = meta?.away_team ?? {};
  const home = meta?.home_team ?? {};
  const awayColor = awayTeam?.colors?.primary ?? "#1A365D";
  const homeColor = homeTeam?.colors?.primary ?? "#1A365D";

  return (
    <Box w="full" h="full" position="relative" overflow="hidden" borderRadius="xl">
      <Box position="absolute" inset={0} bg={`linear-gradient(90deg, ${awayColor}44 0%, #0B0B0D 35%, #0B0B0D 65%, ${homeColor}44 100%)`} />
      <Flex position="relative" zIndex={1} h="full" align="center" justify="space-between" px={{ base: 4, lg: 8 }} py={4}>
        {/* Away */}
        <Flex align="center" gap={4} flex={1}>
          <Image src={getTeamLogo(away.id)} alt="" h="clamp(3rem, 6vw, 5rem)" objectFit="contain" />
          <Box>
            <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase">Away</Text>
            <Text fontSize="clamp(1.2rem, 3vw, 2rem)" fontWeight="black" color="white" lineClamp={1}>{getTeamLabel(away.id)}</Text>
          </Box>
          <Text fontSize="clamp(2.5rem, 6vw, 4rem)" fontWeight="black" color="white" ml="auto">{away.score ?? 0}</Text>
        </Flex>

        {/* Center */}
        <Flex direction="column" align="center" px={{ base: 4, lg: 8 }} flexShrink={0}>
          <Text fontSize="xs" color="brand.400" fontWeight="bold" textTransform="uppercase">Final</Text>
          <Text fontSize="xs" color="whiteAlpha.600" mt={1}>{meta?.date}</Text>
          <Text fontSize="10px" color="whiteAlpha.400" textAlign="center" maxW="140px" lineClamp={2}>{meta?.site}</Text>
          {meta?.attendance && <Text fontSize="9px" color="whiteAlpha.400" mt={0.5}>{meta.attendance.toLocaleString()} Attendance</Text>}
        </Flex>

        {/* Home */}
        <Flex align="center" gap={4} flex={1} direction="row-reverse">
          <Image src={getTeamLogo(home.id)} alt="" h="clamp(3rem, 6vw, 5rem)" objectFit="contain" />
          <Box textAlign="right">
            <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase">Home</Text>
            <Text fontSize="clamp(1.2rem, 3vw, 2rem)" fontWeight="black" color="white" lineClamp={1}>{getTeamLabel(home.id)}</Text>
          </Box>
          <Text fontSize="clamp(2.5rem, 6vw, 4rem)" fontWeight="black" color="white" mr="auto">{home.score ?? 0}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export const ScoringTimeline = ({ plays, awayId, homeId }) => {
  const scoring = useMemo(() => {
    return (plays ?? [])
      .filter((p) => p.scoring_event === true)
      .map((p) => ({
        quarter: p.quarter,
        clock: p.clock,
        type: p.scoring_type,
        awayScore: p.score_away_after,
        homeScore: p.score_home_after,
        team: p.offense_team,
        text: p.raw_text?.slice(0, 80) + "...",
      }));
  }, [plays]);

  if (!scoring.length) return <Text color="text.muted" fontSize="sm">No scoring data.</Text>;

  return (
    <Flex direction="column" gap={3}>
      {scoring.map((s, i) => {
        const isAway = s.team === awayId;
        const color = isAway ? getTeam(awayId)?.colors?.primary : getTeam(homeId)?.colors?.primary;
        return (
          <Flex key={i} align="center" gap={3}>
            <Box w="3px" h="full" minH="40px" bg={color} borderRadius="full" />
            <Box flex={1}>
              <Flex align="center" gap={2}>
                <Text fontSize="10px" fontWeight="black" color="text.muted">Q{s.quarter} {s.clock}</Text>
                <Text fontSize="10px" fontWeight="bold" color={color} textTransform="uppercase">{s.type}</Text>
              </Flex>
              <Text fontSize="xs" color="text.primary" lineClamp={1}>{s.text}</Text>
            </Box>
            <Text fontSize="sm" fontWeight="black" color="text.primary">
              {s.awayScore} – {s.homeScore}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};

export const KeyMoments = ({ plays }) => {
  const moments = useMemo(() => {
    return (plays ?? [])
      .filter((p) => p.epa && p.epa.epa != null)
      .sort((a, b) => Math.abs(b.epa.epa) - Math.abs(a.epa.epa))
      .slice(0, 5)
      .map((p) => ({
        quarter: p.quarter,
        clock: p.clock,
        epa: p.epa.epa,
        text: p.raw_text?.slice(0, 100) + "...",
      }));
  }, [plays]);

  if (!moments.length) return <Text color="text.muted" fontSize="sm">No EPA data available.</Text>;

  return (
    <Flex direction="column" gap={3}>
      {moments.map((m, i) => (
        <Box key={i} p={3} bg="whiteAlpha.50" borderRadius="lg">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="10px" fontWeight="black" color="text.muted">Q{m.quarter} {m.clock}</Text>
            <Text fontSize="sm" fontWeight="black" color={m.epa > 0 ? "#48BB78" : "#F56565"}>
              EPA {m.epa > 0 ? "+" : ""}{fmt(m.epa, 2)}
            </Text>
          </Flex>
          <Text fontSize="xs" color="text.primary" lineClamp={2}>{m.text}</Text>
        </Box>
      ))}
    </Flex>
  );
};
