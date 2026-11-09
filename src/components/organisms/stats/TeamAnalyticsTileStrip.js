import { TILES } from "./analyticsTiles/TileRegistry";
import { Flex, Box, Grid, Text } from "@chakra-ui/react";
import { TILE_KEYFRAMES, DEFAULT_ROTATE_MS, BRAND, TileMobile, TileConfig, tfs } from "./analyticsTiles/TilePrimitives";
import { ArrowRight } from "lucide-react";

// `rows`: 1 on desktop (8 across); 2 on mobile (4 across, 2 down). Each row is
// its own size container, so cqmin is one tile row's height either way and the
// tiles keep the proportions they were drawn at.
export const TeamAnalyticsTileStrip = ({ tab, onSelect, hub, review, season, teamId, teamA, teamB, rows = 1 }) => {
  const perRow = Math.ceil(TILES.length / rows);
  const chunks = Array.from({ length: rows }, (_, r) => TILES.slice(r * perRow, (r + 1) * perRow).map((t, i) => [t, r * perRow + i]));
  return (
    <Flex direction="column" h="100%" w="100%" gap={rows > 1 ? "1px" : 0} bg={rows > 1 ? "whiteAlpha.100" : undefined}>
      <style>{TILE_KEYFRAMES}</style>
      {chunks.map((chunk, r) => (
        // --ta-fit: a 6-character number fills a quarter-width tile; --ta-fit-word: an 8-letter word does.
        <Box key={r} flex={1} minH={0} w="100%" containerType="size" style={rows > 1 ? { "--ta-min": 1, "--ta-fit": 6.4, "--ta-fit-word": 4.4 } : undefined}>
          {/* Mobile: square tiles butting together, a 1px hairline between. */}
          <Grid templateColumns={`repeat(${perRow}, minmax(0, 1fr))`} gap={rows > 1 ? "1px" : "1.5cqmin"} h="100%" w="100%">
            {chunk.map(([tile, index]) => renderTile(tile, index, { tab, onSelect, hub, review, season, teamId, teamA, teamB, flush: rows > 1 }))}
          </Grid>
        </Box>
      ))}
    </Flex>
  );
};

const renderTile = ({ id, label, icon: Icon, Body: TileBody, rotateMs, transition }, index, { tab, onSelect, hub, review, season, teamId, teamA, teamB, flush = false }) => {
        const active = tab === id;
        return (
          <Flex
            key={id}
            as="button"
            type="button"
            onClick={() => onSelect(id)}
            aria-pressed={active}
            className="group ta-tile-mount"
            style={{ "--ta-rotate": `${rotateMs || DEFAULT_ROTATE_MS}ms`, "--ta-mount-delay": `${index * 70}ms` }}
            direction="column"
            minW={0}
            minH={0}
            h="100%"
            p={0}
            gap={0}
            textAlign="left"
            borderRadius={flush ? 0 : "lg"}
            border={flush ? "none" : "1px solid"}
            borderColor={active ? BRAND : "whiteAlpha.100"}
            bg={active ? `linear-gradient(180deg, ${BRAND}33 0%, rgba(20,20,22,0.96) 55%, #141416 100%)` : "#141416"}
            boxShadow={active ? `inset 0 0 0 1px ${BRAND}66, 0 12px 30px rgba(0,0,0,0.35)` : "none"}
            position="relative"
            overflow="hidden"
            transition="border-color 0.15s, background 0.15s"
          >
            <Box position="absolute" right="-4cqmin" top="-2cqmin" w="20cqmin" h="20cqmin" opacity={active ? 0.12 : 0.05} pointerEvents="none" color={active ? BRAND : "white"}>
              <Icon size="100%" strokeWidth={1.5} />
            </Box>

            <Flex direction="column" flex={1} minH={0} position="relative" zIndex={1} p="3cqmin" pb="2cqmin">
              <TileMobile.Provider value={flush}>
                <TileConfig.Provider value={{ rotateMs: rotateMs || DEFAULT_ROTATE_MS, transition: transition ?? "slide" }}>
                  <TileBody hub={hub} review={review} season={season} teamId={teamId} teamA={teamA} teamB={teamB} />
                </TileConfig.Provider>
              </TileMobile.Provider>
            </Flex>

            {/* The tab IS the tile's footer: edge to edge, square corners,
                no inset. Icon, big label with its "Viewing / Open tab"
                caption stacked under it, and the arrow that says "open it".
                Active = solid brand; idle = dark bar that lifts on hover. */}
            <Flex
              align="center"
              gap="2cqmin"
              flexShrink={0}
              position="relative"
              zIndex={1}
              w="100%"
              px="3cqmin"
              py="3.75cqmin"
              borderTop="1px solid"
              borderColor={active ? "transparent" : "whiteAlpha.100"}
              bg={active ? BRAND : "rgba(255,255,255,0.06)"}
              color="white"
              transition="background 0.15s"
            >
              <Box w="6cqmin" h="6cqmin" flexShrink={0} color={active ? "white" : BRAND}><Icon size="100%" strokeWidth={2.5} /></Box>
              <Flex direction="column" gap="1.2cqmin" flex={1} minW={0}>
                <Text fontSize={tfs(5.2)} fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.06em" lineHeight={0.95} lineClamp={2}>
                  {label}
                </Text>
                {!flush && (
                  <Text fontSize={tfs(2.4)} fontWeight="black" color={active ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.4)"} textTransform="uppercase" letterSpacing="0.16em" lineHeight={1}>
                    {active ? "Viewing" : "Open tab"}
                  </Text>
                )}
              </Flex>
              {!flush && (
                <Box w="5cqmin" h="5cqmin" flexShrink={0} opacity={active ? 1 : 0.7}>
                  <ArrowRight size="100%" strokeWidth={2.8} />
                </Box>
              )}
            </Flex>
          </Flex>
        );
};

export default TeamAnalyticsTileStrip;

export { TeamAnalyticsTabBar } from "./analyticsTiles/TeamAnalyticsTabBar";
