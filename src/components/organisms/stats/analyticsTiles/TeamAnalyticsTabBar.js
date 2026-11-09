import { useState } from "react";
import { TILES } from "./TileRegistry";
import { TILE_KEYFRAMES, TileMobile, TileConfig, DEFAULT_ROTATE_MS, BRAND } from "./TilePrimitives";
import { Flex, Box, Text } from "@chakra-ui/react";
import { ChevronDown } from "lucide-react";
import { BottomSheet } from "../../BottomSheet";

const BAR_FACE_VARS = { "--ta-min": 1, "--ta-fit": 26, "--ta-fit-word": 13 };

export const TeamAnalyticsTabBar = ({ tab, onSelect, hub, review, season, teamId, teamA, teamB }) => {
  const [open, setOpen] = useState(false);
  const tile = TILES.find((t) => t.id === tab) ?? TILES[0];
  const { icon: Icon, Body: TileBody } = tile;
  return (
    <>
      <style>{TILE_KEYFRAMES}</style>
      <Flex as="button" type="button" onClick={() => setOpen(true)} w="100%" h="100%" textAlign="left" bg="#141416" overflow="hidden">
        <Box flex={1} minW={0} h="100%" containerType="size" position="relative" style={BAR_FACE_VARS}>
          <Flex key={tile.id} direction="column" h="100%" px="0.75rem" py="0.35rem" className="ta-tile-mount">
            <TileMobile.Provider value>
              <TileConfig.Provider value={{ rotateMs: tile.rotateMs || DEFAULT_ROTATE_MS, transition: tile.transition ?? "slide" }}>
                <TileBody hub={hub} review={review} season={season} teamId={teamId} teamA={teamA} teamB={teamB} />
              </TileConfig.Provider>
            </TileMobile.Provider>
          </Flex>
        </Box>

        <Flex align="center" justify="space-between" gap="0.5rem" w="8.5rem" flexShrink={0} h="100%" px="0.75rem" bg={`linear-gradient(160deg, ${BRAND} 0%, #6B21A8 100%)`} position="relative" overflow="hidden">
          <Box position="absolute" right="-0.8rem" top="50%" w="4.5rem" h="4.5rem" opacity={0.18} pointerEvents="none" color="white" style={{ transform: "translateY(-50%)" }}>
            <Icon size="100%" strokeWidth={1.5} />
          </Box>
          <Text position="relative" fontSize="1.05rem" fontWeight="black" fontStyle="italic" color="white" textTransform="uppercase" letterSpacing="-0.01em" lineHeight={0.95} lineClamp={2}>
            {tile.label}
          </Text>
          <Flex position="relative" w="2rem" h="2rem" flexShrink={0} align="center" justify="center" bg="blackAlpha.400">
            <ChevronDown size="1.3rem" color="white" strokeWidth={3} />
          </Flex>
        </Flex>
      </Flex>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)} title="Team Analytics">
        <Flex direction="column">
          {TILES.map(({ id, label, icon: RowIcon }) => {
            const active = id === tab;
            return (
              <Flex
                key={id}
                as="button"
                type="button"
                onClick={() => { onSelect(id); setOpen(false); }}
                align="center"
                gap="0.85rem"
                w="100%"
                px="1rem"
                py="0.95rem"
                textAlign="left"
                bg={active ? `${BRAND}33` : "transparent"}
                borderLeft="4px solid"
                borderColor={active ? BRAND : "transparent"}
                borderBottom="1px solid"
                borderBottomColor="whiteAlpha.100"
              >
                <Box w="1.3rem" h="1.3rem" flexShrink={0} color={active ? "white" : BRAND}><RowIcon size="100%" strokeWidth={2.5} /></Box>
                <Text flex={1} fontSize="1rem" fontWeight="black" color={active ? "white" : "whiteAlpha.800"} textTransform="uppercase" letterSpacing="0.04em">
                  {label}
                </Text>
                {active && <Box w="0.5rem" h="0.5rem" borderRadius="full" bg={BRAND} />}
              </Flex>
            );
          })}
        </Flex>
      </BottomSheet>
    </>
  );
};
