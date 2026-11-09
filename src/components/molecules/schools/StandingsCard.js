import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, VStack, Image } from "@chakra-ui/react";
import { getTeam } from "./standings/standingsFixtures";

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT C — HEAT BAR
// Point differential bar chart per team. Visual, data-forward.
// Leader gets a pulsing dot. Negative diff shown in red.
// ─────────────────────────────────────────────────────────────────────────────
export const StandingsHeatBar = ({ title, rows, accentColor = 'brand.500' }) => {
  const navigate = useNavigate();
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.diff)));

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">

      <Flex px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" justify="space-between">
        <Text fontSize="10px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.14em">
          {title}
        </Text>
        <Text fontSize="9px" color="text.muted">PTS DIFF</Text>
      </Flex>

      <VStack gap={0} align="stretch" px={3} py={2}>
        {rows.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          const pct = Math.abs(row.diff) / maxAbs;
          const isPos = row.diff >= 0;

          return (
            <Box key={row.shortName} py={2}
              borderBottom={i < rows.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Flex align="center" gap={2} mb={1}>
                {/* Rank + optional pulse dot for leader */}
                <Flex align="center" gap={1} w="22px" flexShrink={0}>
                  <Text fontSize="10px" fontWeight="black" color={i === 0 ? primary : 'whiteAlpha.300'}>{i + 1}</Text>
                  {i === 0 && (
                    <Box w="4px" h="4px" borderRadius="full" bg={primary}
                      sx={{ animation: 'hbPulse 2s infinite' }} />
                  )}
                </Flex>
                {team && <Image src={team.logo} alt="" boxSize="16px" objectFit="contain" flexShrink={0} />}
                <Text fontSize="10px" fontWeight="black" color="text.primary" textTransform="uppercase"
                  flex={1} lineClamp={1} _groupHover={{ color: primary }} transition="color 0.2s">
                  {row.shortName}
                </Text>
                <Text fontSize="10px" fontWeight="bold" color="text.secondary" flexShrink={0}>{row.record}</Text>
                <Text fontSize="9px" fontWeight="black" color={isPos ? 'green.400' : 'red.400'} w="36px" textAlign="right" flexShrink={0}>
                  {isPos ? '+' : ''}{row.diff}
                </Text>
              </Flex>

              {/* Diff bar */}
              <Flex align="center" gap={1} pl={7}>
                <Box flex={1} h="3px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden">
                  <Box
                    h="full" borderRadius="full" transition="width 0.6s ease"
                    w={`${pct * 100}%`}
                    bg={i === 0 ? primary : isPos ? 'green.700' : 'red.800'}
                  />
                </Box>
              </Flex>
            </Box>
          );
        })}
      </VStack>

      <style>{`
        @keyframes hbPulse {
          0%   { opacity:1; transform:scale(1);   }
          50%  { opacity:0.4; transform:scale(1.8); }
          100% { opacity:1; transform:scale(1);   }
        }
      `}</style>
    </Box>
  );
};

export { MOCK_SWAC_WEST, MOCK_SWAC_EAST, MOCK_MEAC } from "./standings/standingsFixtures";

export { StandingsClean, StandingsBrandWash } from "./standings/StandingsLists";
