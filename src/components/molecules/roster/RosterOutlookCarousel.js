import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useState, useMemo } from "react";
import { POSITION_GROUPS, TICK_KEYFRAMES, MOBILE_COLUMNS, SQUARE_W } from "./outlook/outlookModel";
import { Box, Flex, Text, Grid } from "@chakra-ui/react";
import { Play, Pause } from "lucide-react";
import { PlayerRowMobile, PlayerRowStandard, PlayerRowCompact } from "./outlook/OutlookPlayerRows";

export const RosterOutlookCarousel = ({ team, players, year }) => {
  const { isMobile } = useLayoutDensity();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isPaused = isHovering || isManuallyPaused;
  const group = POSITION_GROUPS[activeIndex];

  const groupPlayers = useMemo(() => {
    if (!players || !group) return [];
    return players
      .filter((p) => p.position_group === group.key)
      .sort((a, b) => (b.experience_score ?? 0) - (a.experience_score ?? 0));
  }, [players, group]);

  const teamColors = team?.colors || {};
  const primary = teamColors?.primary || "#E53E3E";
  const secondary = teamColors?.secondary || "#F56565";

  return (
    <Box
      w="full"
      h="full"
      bg="bg.secondary"
      border={isMobile ? "none" : "1px solid"}
      borderColor="whiteAlpha.100"
      borderRadius={0}
      overflow="hidden"
      position="relative"
      px={{ base: 3, lg: 4 }}
      py={2}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* CSS-driven timer — pausable via animationPlayState */}
      <style>{`
        @keyframes ${TICK_KEYFRAMES} {
          from { opacity: 0; }
          to { opacity: 0; }
        }
      `}</style>
      <Box
        position="absolute"
        opacity={0}
        pointerEvents="none"
        w="1px"
        h="1px"
        style={{
          animation: `${TICK_KEYFRAMES} 6s infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
        onAnimationIteration={() => setActiveIndex((prev) => (prev + 1) % POSITION_GROUPS.length)}
      />

      {/* Team-colored left bar is desktop-only */}
      {!isMobile && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={primary} />}
      <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${primary}11 0%, transparent 50%)`} pointerEvents="none" />

      <Flex position="relative" zIndex={1} h="full" direction="column" minH={0}>
        {/* Combined indicator strip — pause/play, dots flanking the active position-group label */}
        <Flex align="center" justify="center" gap={2} mb={2} minW={0}>
          <Box
            as="button"
            type="button"
            onClick={() => setIsManuallyPaused((value) => !value)}
            w="18px"
            h="18px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={primary}
            color="white"
            borderRadius="sm"
            cursor="pointer"
            border="none"
            title={isPaused ? "Resume rotation" : "Pause rotation"}
          >
            {isPaused ? <Play size={9} /> : <Pause size={9} />}
          </Box>

          <Flex align="center" gap={1.5} flexShrink={0}>
            {POSITION_GROUPS.slice(0, activeIndex).map((pg, idx) => (
              <Box
                key={pg.key}
                as="button"
                w="6px"
                h="6px"
                borderRadius="full"
                bg="whiteAlpha.300"
                onClick={() => setActiveIndex(idx)}
                cursor="pointer"
                border="none"
                p={0}
              />
            ))}
          </Flex>

          <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="black" color="text.primary" textTransform="uppercase" lineClamp={1} textAlign="center">
            {group?.label}
          </Text>

          <Flex align="center" gap={1.5} flexShrink={0}>
            {POSITION_GROUPS.slice(activeIndex).map((pg, i) => {
              const idx = activeIndex + i;
              return (
                <Box
                  key={pg.key}
                  as="button"
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={idx === activeIndex ? secondary : "whiteAlpha.300"}
                  onClick={() => setActiveIndex(idx)}
                  cursor="pointer"
                  border="none"
                  p={0}
                />
              );
            })}
          </Flex>
        </Flex>

        {/* Mobile header — name + year boxes only */}
        {isMobile && (
          <Grid
            templateColumns={MOBILE_COLUMNS}
            alignItems="center"
            gap={2}
            py={1}
            borderBottom="1px solid"
            borderColor="whiteAlpha.200"
            mb={1}
          >
            <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase">Player</Text>
            <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">HT</Text>
            <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">WT</Text>
            <Flex align="center" gap={0}>
              {[0, 1, 2, 3, 4].map((offset) => (
                <Text key={offset} fontSize="7px" fontWeight="black" color="text.muted" w={SQUARE_W} textAlign="center">
                  {String(year + offset).slice(-2)}
                </Text>
              ))}
            </Flex>
          </Grid>
        )}

        {/* Standard header — hidden on compact */}
        <Grid
          display={isMobile ? "none" : { base: "none", lg: "grid" }}
          templateColumns="2.5rem 1fr 3.5rem 4rem 3rem 6rem auto"
          alignItems="center"
          gap={3}
          py={1}
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          mb={1}
        >
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">#</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">Player</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">HT</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase">WT</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">Score</Text>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="right">Prev</Text>
          <Flex align="center" gap={1}>
            {[0, 1, 2, 3, 4].map((offset) => (
              <Text key={offset} fontSize="9px" fontWeight="black" color="text.muted" w={SQUARE_W} textAlign="center">
                {String(year + offset).slice(-2)}
              </Text>
            ))}
          </Flex>
        </Grid>

        {/* Compact header — hidden on normal */}
        <Grid
          display={isMobile ? "none" : { base: "grid", lg: "none" }}
          templateColumns="2rem 1fr 2.5rem 4rem auto"
          alignItems="center"
          gap={2}
          py={1}
          borderBottom="1px solid"
          borderColor="whiteAlpha.200"
          mb={1}
        >
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">#</Text>
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase">Player</Text>
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="center">Score</Text>
          <Text fontSize="8px" fontWeight="black" color="text.muted" textTransform="uppercase" textAlign="right">Prev</Text>
          <Flex align="center" gap={1}>
            {[0, 1, 2, 3, 4].map((offset) => (
              <Text key={offset} fontSize="7px" fontWeight="black" color="text.muted" w={SQUARE_W} textAlign="center">
                {String(year + offset).slice(-2)}
              </Text>
            ))}
          </Flex>
        </Grid>

        {/* Table rows */}
        <Box flex={1} overflow="auto" minH={0} pr={2}>
          {groupPlayers.length === 0 ? (
            <Text fontSize="xs" color="text.muted" py={4} textAlign="center">
              No {group?.label} data
            </Text>
          ) : (
            groupPlayers.map((player) => (
              <Box key={player.id || player.jersey_number || Math.random()}>
                {isMobile ? (
                  <PlayerRowMobile player={player} teamColors={teamColors} />
                ) : (
                  <>
                    <Box display={{ base: "none", lg: "block" }}>
                      <PlayerRowStandard player={player} teamColors={teamColors} team={team} />
                    </Box>
                    <Box display={{ base: "block", lg: "none" }}>
                      <PlayerRowCompact player={player} teamColors={teamColors} team={team} />
                    </Box>
                  </>
                )}
              </Box>
            ))
          )}
        </Box>
      </Flex>
    </Box>
  );
};
