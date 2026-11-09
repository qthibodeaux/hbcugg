import { useNavigate } from "react-router-dom";
import { Panel, CardHead, Kicker, Portrait } from "./CardPrimitives";
import { Layers, Map, Sparkles } from "lucide-react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { teamOf, hrefFor } from "./cardPresentation";

export const PositionBoardsCard = ({ boards = [] }) => {
  const navigate = useNavigate();
  const live = boards.filter((b) => (b.leaders ?? []).length);
  if (!live.length) return null;
  const accent = "#38B2AC";

  return (
    <Panel>
      <CardHead icon={Layers} label="Position Power Boards" accent={accent} right={<Kicker>{live.length} rooms</Kicker>} />

      <Box
        flex={1}
        minH={0}
        display="grid"
        gridTemplateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }}
        gap={2}
      >
        {live.slice(0, 8).map((board) => {
          const leader = board.leaders[0];
          const team = teamOf(leader?.player?.school_id);
          return (
            <Flex
              key={board.board_id}
              direction="column"
              gap={1}
              p={2}
              borderRadius="md"
              bg="whiteAlpha.50"
              cursor="pointer"
              minW={0}
              onClick={() => navigate(hrefFor(leader?.player))}
              _hover={{ bg: "whiteAlpha.100" }}
              style={{ transition: "background 0.15s" }}
            >
              <Kicker color={accent} fontSize="7.5px">{board.label}</Kicker>
              <Flex align="center" gap={1.5} minW={0}>
                <Portrait src={leader?.player?.image_url} size="26px" ring={`${accent}66`} alt={leader?.player?.full_name} />
                <Box minW={0}>
                  <Text fontSize="10px" fontWeight="900" color="white" lineClamp={1}>
                    {leader?.player?.last_name ?? leader?.player?.full_name}
                  </Text>
                  <Kicker fontSize="7px">{team?.shortName}</Kicker>
                </Box>
              </Flex>
            </Flex>
          );
        })}
      </Box>
    </Panel>
  );
};

export const ConferenceMapCard = ({ groups = [] }) => {
  if (!groups.length) return null;
  const accent = "#4299E1";
  const max = Math.max(...groups.map((g) => Number(g.summary?.total_players) || 0), 1);

  return (
    <Panel>
      <CardHead icon={Map} label="Conference Talent Map" accent={accent} />

      <Flex direction="column" gap={3} flex={1} justify="center">
        {groups.map((group) => {
          const total = Number(group.summary?.total_players) || 0;
          const withStats = Number(group.summary?.players_with_stats) || 0;
          return (
            <Box key={group.group_id}>
              <Flex align="baseline" justify="space-between" gap={2} mb={1}>
                <Kicker color="whiteAlpha.800">{group.label}</Kicker>
                <Text fontSize="12px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                  {total}
                </Text>
              </Flex>
              {/* Producing players nested inside the roster total — one bar
                  carries both numbers instead of two competing bars. */}
              <Box position="relative" h="7px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
                <Box position="absolute" inset={0} borderRadius="full" bg="whiteAlpha.200" style={{ width: `${(total / max) * 100}%` }} />
                <Box position="absolute" left={0} top={0} bottom={0} borderRadius="full" bg={accent} style={{ width: `${(withStats / max) * 100}%` }} />
              </Box>
              <Kicker mt={1} fontSize="7.5px">
                {withStats} producing · top room {group.summary?.top_position_group ?? "—"}
              </Kicker>
            </Box>
          );
        })}
      </Flex>
    </Panel>
  );
};

export const ArchetypeCard = ({ archetypes = [] }) => {
  const navigate = useNavigate();
  if (!archetypes.length) return null;
  const accent = "#38B2AC";
  const max = Math.max(...archetypes.map((a) => Number(a.count) || 0), 1);

  return (
    <Panel>
      <CardHead icon={Sparkles} label="Archetype Explorer" accent={accent} right={<Kicker>{archetypes.length} roles</Kicker>} />

      <Flex direction="column" gap={2.5} flex={1} justify="center">
        {archetypes.map((archetype) => {
          const leader = archetype.leaders?.[0];
          return (
            <Box
              key={archetype.archetype_id}
              cursor={leader ? "pointer" : "default"}
              onClick={() => leader && navigate(hrefFor(leader.player))}
              borderRadius="md"
              px={1.5}
              py={1}
              _hover={leader ? { bg: "whiteAlpha.100" } : undefined}
              style={{ transition: "background 0.15s" }}
            >
              <Flex align="center" gap={2} mb={1} minW={0}>
                {leader?.player?.image_url && (
                  <Portrait src={leader.player.image_url} size="22px" ring={`${accent}66`} alt={leader.player.full_name} />
                )}
                <Kicker color="whiteAlpha.800" flex={1}>{archetype.label}</Kicker>
                <Text fontSize="12px" fontWeight="900" fontStyle="italic" color="white" fontVariantNumeric="tabular-nums">
                  {archetype.count}
                </Text>
              </Flex>
              <Box h="4px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
                <Box h="100%" borderRadius="full" bg={accent} style={{ width: `${Math.max((Number(archetype.count) / max) * 100, 3)}%` }} />
              </Box>
            </Box>
          );
        })}
      </Flex>
    </Panel>
  );
};
