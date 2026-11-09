import { MOCK_GLORY_TOP6, getTeam } from "./rankings/rankingData";
import { useNavigate } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { Box, Flex, Text, Image } from "@chakra-ui/react";
import { Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT C — GLORY PODIUM
// Top 3 on a visual podium (1st center/tallest, 2nd left, 3rd right).
// Remaining 3 as a compact list below.
// ─────────────────────────────────────────────────────────────────────────────
export const RankingsPodium = ({ rows = MOCK_GLORY_TOP6, title = "Glory Rankings" }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const [first, second, third, ...rest] = rows;

  // Podium order: 2nd | 1st | 3rd
  const podium = [
    { row: second, rank: 2, h: '64px' },
    { row: first,  rank: 1, h: '88px' },
    { row: third,  rank: 3, h: '48px' },
  ];

  return (
    <Box w="full" h="full" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">

      <Flex px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100" align="center" gap={2}>
        <Zap size={12} color="var(--chakra-colors-brand-500)" />
        {/* Matches the standings card header treatment (StandingsBrandWash):
            sm / black / white / 0.14em tracking. */}
        <Text fontSize="sm" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.14em" flex={1}>
          {title}
        </Text>
      </Flex>

      {/* Podium */}
      <Flex px={5} pt={5} pb={4} align="flex-end" justify="center" gap={3}>
        {podium.map(({ row, rank, h }) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          const secondary = team?.colors?.secondary || '#ffffff';
          return (
            <Flex key={row.shortName} direction="column" align="center" gap={2} flex={1}
              cursor="pointer" role="group"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              {/* Logo above podium */}
              {team && (
                <Image src={team.logo} alt="" boxSize={rank === 1 ? '44px' : '34px'} objectFit="contain"
                  filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                  transition="transform 0.25s" _groupHover={{ transform: 'scale(1.1)' }}
                />
              )}
              <Text fontSize="xs" fontWeight="black" color="white" textTransform="uppercase">{row.shortName}</Text>
              {/* Podium block */}
              <Box
                w="full" h={h} borderRadius="md 4px 0 0" position="relative" overflow="hidden"
                bg={`${primary}CC`} borderBottom="none"
              >
                <Flex position="absolute" inset={0} align="center" justify="center" direction="column" gap={0}>
                  <Text
                    fontSize={rank === 1 ? '3xl' : '2xl'} fontWeight="black" fontStyle="italic"
                    color={secondary} lineHeight={1} letterSpacing="-0.04em"
                    style={{ textShadow: `0 1px 6px rgba(0,0,0,0.4)` }}
                  >
                    {rank === 1 ? '1ST' : rank === 2 ? '2ND' : '3RD'}
                  </Text>
                  <Text fontSize="xs" fontWeight="bold" color={secondary} opacity={0.6} mt="2px">{row.glory}</Text>
                </Flex>
              </Box>
            </Flex>
          );
        })}
      </Flex>

      {/* Remaining 3 — mobile collapses the three full-width rows into one
          3-column strip showing just rank number + logo, since the podium
          above already carries the identity and the stacked rows ate most
          of the card's height on a phone. */}
      {isMobile ? (
        <Flex borderTop="1px solid" borderColor="whiteAlpha.100">
          {rest.map((row, i) => {
            const team = getTeam(row.shortName);
            return (
              <Flex
                key={row.shortName}
                flex={1}
                align="center"
                justify="center"
                gap={2}
                py={3}
                borderLeft={i > 0 ? '1px solid' : 'none'}
                borderColor="whiteAlpha.50"
                cursor="pointer"
                _hover={{ bg: 'whiteAlpha.50' }}
                transition="background 0.15s"
                onClick={() => team && navigate(`/teams/${team.id}`)}
              >
                <Text fontSize="sm" fontWeight="black" color="white" flexShrink={0}>
                  {i + 4}
                </Text>
                {team && <Image src={team.logo} alt={row.name} boxSize="26px" objectFit="contain" flexShrink={0} />}
              </Flex>
            );
          })}
        </Flex>
      ) : (
      <Box borderTop="1px solid" borderColor="whiteAlpha.100">
        {rest.map((row, i) => {
          const team = getTeam(row.shortName);
          const primary = team?.colors?.primary || '#888';
          return (
            <Flex key={row.shortName} px={5} py={3} align="center" gap={3}
              borderBottom={i < rest.length - 1 ? '1px solid' : 'none'} borderColor="whiteAlpha.50"
              cursor="pointer" role="group"
              _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.15s"
              onClick={() => team && navigate(`/teams/${team.id}`)}
            >
              <Text fontSize="md" fontWeight="black" color="white" w="22px" flexShrink={0}>{i + 4}</Text>
              {team && <Image src={team.logo} alt="" boxSize="24px" objectFit="contain" flexShrink={0} />}
              <Text fontSize="sm" fontWeight="black" color="text.primary" textTransform="uppercase"
                letterSpacing="0.02em" flex={1} lineClamp={1} _groupHover={{ color: primary }} transition="color 0.2s">
                {row.name}
              </Text>
              <Text fontSize="md" fontWeight="black" color="white">{row.glory}</Text>
            </Flex>
          );
        })}
      </Box>
      )}
    </Box>
  );
};

export { MOCK_GLORY_TOP6 } from "./rankings/rankingData";

export { RankingsScoreboard, RankingsBarChart } from "./rankings/RankingLists";
