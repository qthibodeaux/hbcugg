import { useState, useRef } from "react";
import { Box, Image, Flex, Text, Grid, Spinner } from "@chakra-ui/react";
import { GRID_SKELETON_CSS } from "./switcherStyles";

// Team tabs/logo switch grid inside the shared mobile section sheet.

export const TeamHubSwitcherSheetBlock = ({ item, team, pathname, onNavigate }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const loadedCountRef = useRef(0);
  const primary = team?.primary || "#E53E3E";
  const secondary = team?.secondary || primary;

  const openGrid = () => {
    loadedCountRef.current = 0;
    setGridReady(false);
    setShowGrid(true);
  };

  const handleTileSettled = () => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= item.teams.length) setGridReady(true);
  };

  return (
    <Box mt="0.5rem" position="relative" overflow="hidden" borderTop="2px solid" borderColor={secondary}>
      <style>{GRID_SKELETON_CSS}</style>
      {team?.logo && (
        <Image
          src={team.logo}
          alt=""
          position="absolute"
          left="50%"
          top="50%"
          style={{ transform: "translate(-50%, -50%)" }}
          w="85%"
          h="85%"
          objectFit="contain"
          opacity={0.14}
          pointerEvents="none"
        />
      )}

      <Flex align="center" justify="space-between" px="1rem" py="0.7rem" bg={primary} position="relative" zIndex={1}>
        <Text fontSize="0.8rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.05em">
          {item.label}
        </Text>
        <Box
          as="button"
          type="button"
          onClick={() => (showGrid ? setShowGrid(false) : openGrid())}
          display="flex"
          alignItems="center"
          gap="0.3rem"
        >
          <Text fontSize="0.72rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.05em">
            {showGrid ? "←" : "Switch Teams"}
          </Text>
        </Box>
      </Flex>

      <Box position="relative" zIndex={1}>
        {showGrid ? (
          <Box position="relative">
            {/* minmax(0, 1fr): a plain 1fr won't shrink below a logo's natural
                width, which pushed the sixth column off a phone screen. Flush
                wall, the Team Schedules mobile look: no gaps, square tiles. */}
            <Grid
              templateColumns="repeat(6, minmax(0, 1fr))"
              gap={0}
              p={0}
              opacity={gridReady ? 1 : 0}
              transition="opacity 0.2s ease"
              pointerEvents={gridReady ? "auto" : "none"}
            >
              {item.teams.map((t) => (
                <Box
                  key={t.id}
                  as="button"
                  type="button"
                  onClick={() => {
                    item.onTeamClick?.(t.id);
                    onNavigate();
                  }}
                  aspectRatio="1"
                  minW={0}
                  borderRadius="0"
                  p="0.35rem"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={t.id === item.teamId ? "whiteAlpha.300" : "blackAlpha.400"}
                  border="1px solid"
                  borderColor={t.id === item.teamId ? secondary : "whiteAlpha.100"}
                  borderBottomWidth="0.2rem"
                  borderBottomColor={t.colors?.primary ?? "whiteAlpha.300"}
                  opacity={t.id === item.teamId ? 1 : 0.85}
                  title={t.name}
                >
                  <Image
                    src={t.logo}
                    alt={t.name}
                    w="80%"
                    h="80%"
                    objectFit="contain"
                    onLoad={handleTileSettled}
                    onError={handleTileSettled}
                  />
                </Box>
              ))}
            </Grid>

            {!gridReady && (
              <>
                <Grid
                  position="absolute"
                  inset="0"
                  templateColumns="repeat(6, minmax(0, 1fr))"
                  gap={0}
                  p={0}
                  pointerEvents="none"
                >
                  {item.teams.map((t) => (
                    <Box
                      key={t.id}
                      aspectRatio="1"
                      borderRadius="0"
                      style={{
                        background: "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.06) 75%)",
                        backgroundSize: "300% 100%",
                        animation: "teamGridSkeletonShimmer 1.2s linear infinite",
                      }}
                    />
                  ))}
                </Grid>
                <Flex
                  position="absolute"
                  inset="0"
                  align="center"
                  justify="center"
                  direction="column"
                  gap="0.5rem"
                  pointerEvents="none"
                  bg="blackAlpha.500"
                >
                  <Spinner size="sm" color={secondary} />
                  <Text fontSize="0.65rem" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.1em">
                    Loading Teams
                  </Text>
                </Flex>
              </>
            )}
          </Box>
        ) : (
          item.tabs.map((tab) => {
            const isActive = tab.active ?? pathname === tab.path;
            return (
              <Box
                key={tab.id}
                as="button"
                type="button"
                onClick={() => {
                  tab.onClick?.();
                  onNavigate();
                }}
                w="full"
                textAlign="left"
                pl="1.75rem"
                pr="1rem"
                py="0.75rem"
                bg={isActive ? "blackAlpha.600" : "blackAlpha.400"}
                borderLeft="3px solid"
                borderLeftColor={isActive ? secondary : "transparent"}
                borderBottom="1px solid"
                borderBottomColor={`${secondary}55`}
              >
                <Text
                  fontSize="0.78rem"
                  fontWeight="bold"
                  color={isActive ? "white" : "whiteAlpha.700"}
                  textTransform="uppercase"
                  letterSpacing="0.04em"
                >
                  {tab.label}
                </Text>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};
