import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { MOBILE_RIVALRY_TILE_COUNT, RIVALRY_TILE_COUNT, resolveRivalryTeams, createInitialRivalryTiles, randomRivalryDwell } from "./historyModel";
import { useMemo, useState, useRef } from "react";
import { RIVALRIES } from "../../../../data/wiki_data";
import useMountEffect from "../../../../hooks/useMountEffect";
import { Box, Flex, Image, Text, Grid } from "@chakra-ui/react";
import { RIVALRY_BANNER_CSS, RivalryTile } from "./RivalryTile";

export const ClassicsAndRivalriesBanner = () => {
  const { isMobile } = useLayoutDensity();
  const tileCount = isMobile ? MOBILE_RIVALRY_TILE_COUNT : RIVALRY_TILE_COUNT;
  const rivalries = useMemo(
    () => RIVALRIES.map(resolveRivalryTeams).filter((rivalry) => rivalry.a && rivalry.b),
    [],
  );
  const [tiles, setTiles] = useState(() => createInitialRivalryTiles(tileCount));
  const timersRef = useRef([]);
  const nextRivalryIndexRef = useRef(tileCount);

  useMountEffect(() => {
    let active = true;

    const pickNextRivalryIndex = (currentTiles, slot) => {
      const visibleIndexes = new Set(currentTiles.map((tile) => tile.rivalryIndex));
      visibleIndexes.delete(currentTiles[slot].rivalryIndex);

      let nextIndex = nextRivalryIndexRef.current % rivalries.length;
      let attempts = 0;

      while (visibleIndexes.has(nextIndex) && attempts < rivalries.length) {
        nextIndex = (nextIndex + 1) % rivalries.length;
        attempts += 1;
      }

      nextRivalryIndexRef.current = (nextIndex + 1) % rivalries.length;
      return nextIndex;
    };

    const scheduleSlot = (slot) => {
      timersRef.current[slot] = setTimeout(() => {
        if (!active) return;

        setTiles((currentTiles) => {
          const nextIndex = pickNextRivalryIndex(currentTiles, slot);
          const updatedTiles = [...currentTiles];

          updatedTiles[slot] = {
            slot,
            rivalryIndex: nextIndex,
            version: currentTiles[slot].version + 1,
          };

          return updatedTiles;
        });

        scheduleSlot(slot);
      }, randomRivalryDwell());
    };

    tiles.forEach((tile) => scheduleSlot(tile.slot));

    return () => {
      active = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  });

  return (
    <Box
      h={isMobile ? "auto" : "full"}
      w="full"
      minW={0}
      overflow="hidden"
      borderRadius="8px"
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="linear-gradient(90deg, rgba(7,7,8,0.98) 0%, rgba(20,20,22,0.96) 38%, rgba(39,27,9,0.94) 100%)"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: "3px",
        bg: "#FFD100",
        opacity: 0.9,
      }}
    >
      <style>{RIVALRY_BANNER_CSS}</style>
      <Flex h={isMobile ? "auto" : "100%"} minW={0} direction={isMobile ? "column" : "row"} gap={{ base: 2, lg: 3 }} p={{ base: 2, lg: 3 }}>
        <Box
          w={isMobile ? "full" : { base: "128px", lg: "220px" }}
          h={isMobile ? "3.5rem" : "auto"}
          flexShrink={0}
          minH={0}
          borderRadius="7px"
          overflow="hidden"
          position="relative"
          bg="linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.55))"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Image
            src="/pics/stadium_dusk.jpg"
            alt=""
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            opacity={0.2}
            filter="grayscale(1) contrast(1.35)"
          />
          <Box position="absolute" inset={0} bg="linear-gradient(90deg, rgba(0,0,0,0.78), rgba(0,0,0,0.35))" />
          <Flex position="relative" zIndex={1} h="100%" direction="column" justifyContent="center" px={{ base: 2, lg: 5 }}>
            {isMobile ? (
              <Text
                color="white"
                fontSize="1.15rem"
                fontWeight="black"
                textTransform="uppercase"
                lineHeight={0.95}
                letterSpacing="-0.02em"
                textAlign="center"
                whiteSpace="nowrap"
              >
                Classics & Rivalries
              </Text>
            ) : (<>
              <Text
                display={{ base: "none", lg: "block" }}
                fontSize="4xl"
                color="white"
                fontWeight="black"
                textTransform="uppercase"
                lineHeight={0.92}
                letterSpacing="-0.04em"
                textAlign="center"
                style={{
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  whiteSpace: "normal"
                }}
              >
                Classics & Rivalries
              </Text>
              <Flex
                display={{ base: "flex", lg: "none" }}
                direction="column"
                align="center"
                justify="center"
                gap={0}
                minW={0}
              >
                <Text
                  color="white"
                  fontSize="23px"
                  fontWeight="black"
                  textTransform="uppercase"
                  lineHeight={0.86}
                  letterSpacing="0"
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  Classics
                </Text>
                <Text
                  color="white"
                  fontSize="21px"
                  fontWeight="black"
                  textTransform="uppercase"
                  lineHeight={0.88}
                  letterSpacing="0"
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  &
                </Text>
                <Text
                  color="white"
                  fontSize="20px"
                  fontWeight="black"
                  textTransform="uppercase"
                  lineHeight={0.86}
                  letterSpacing="0"
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  Rivalries
                </Text>
              </Flex>
            </>)}
          </Flex>
        </Box>

        <Grid
          flex={isMobile ? undefined : 1}
          h={isMobile ? "21rem" : undefined}
          minW={0}
          minH={0}
          templateColumns={isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))"}
          templateRows={isMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))"}
          gap={{ base: 1.5, lg: 2 }}
        >
          {tiles.map((tile) => {
            const rivalry = rivalries[tile.rivalryIndex];
            return (
              <RivalryTile
                key={`${tile.slot}-${tile.version}-${rivalry.name}`}
                tileKey={`${tile.slot}-${tile.version}-${rivalry.name}`}
                rivalry={rivalry}
              />
            );
          })}
        </Grid>
      </Flex>
    </Box>
  );
};
