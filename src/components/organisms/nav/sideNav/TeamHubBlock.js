import { memo, useState, useRef } from "react";
import { DEFAULT_ACCENT, SIDE_NAV_SKELETON_CSS } from "./sideNavPresentation";
import { Box, Image, Text, IconButton, Grid, Flex, Spinner, VStack } from "@chakra-ui/react";
import { List, LayoutGrid } from "lucide-react";
import { NavItem } from "./NavItem";

export const TeamHubBlock = memo(({ team, switcher }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const loadedCountRef = useRef(0);
  const primary = team.primary || switcher.accent || DEFAULT_ACCENT;
  const meta = [team.conference, team.division].filter(Boolean).join(" • ");

  // Same load-gated reveal as the mobile switcher: hold the real grid hidden
  // until every logo has actually settled, so the whole set fades in at once
  // instead of tiles popping in one by one. Tied to real onLoad/onError
  // rather than a guessed timer, and onError counts so it can't hang.
  const openGrid = () => {
    loadedCountRef.current = 0;
    setGridReady(false);
    setShowGrid(true);
  };

  const handleTileSettled = () => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= switcher.teams.length) setGridReady(true);
  };

  return (
    <Box mt={2} mb={4}>
      <style>{SIDE_NAV_SKELETON_CSS}</style>
      {/* Wide: logo · name · switcher in one row. Narrow (see the container
          query in SIDE_NAV_SKELETON_CSS): logo and switcher share the top row,
          the abbreviation and conference line run full width underneath. */}
      <Box className="snv-team-head" p={4} bg={primary}>
        {team.logo && (
          <Box
            className="snv-team-logo"
            w={11}
            h={11}
            minW={11}
            bg="white"
            borderRadius="lg"
            p={1.5}
            boxShadow="sm"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Image src={team.logo} alt="" w="full" h="full" objectFit="contain" />
          </Box>
        )}
        <Box className="snv-team-name" minW={0}>
          <Text
            color="white"
            fontWeight="black"
            fontSize="clamp(0.9rem, 8.2cqw, 1.31rem)"
            letterSpacing="tight"
            lineHeight="1.25"
          >
            {team.label}
          </Text>
          {meta && (
            <Text color="whiteAlpha.800" fontSize="clamp(0.62rem, 5cqw, 0.78rem)" fontWeight="bold" letterSpacing="wider" textTransform="uppercase" mt={0.5}>
              {meta}
            </Text>
          )}
        </Box>
        <IconButton
          className="snv-team-switch"
          aria-label={showGrid ? "Show team menu" : "Switch team"}
          onClick={() => (showGrid ? setShowGrid(false) : openGrid())}
          size="sm"
          variant="ghost"
          color="white"
          flexShrink={0}
          _hover={{ bg: "whiteAlpha.200" }}
        >
          {showGrid ? <List size={16} /> : <LayoutGrid size={16} />}
        </IconButton>
      </Box>

      {showGrid ? (
        <Box position="relative" bg="bg.secondary">
          <Grid
            templateColumns="repeat(3, 1fr)"
            gap={1}
            p={3}
            opacity={gridReady ? 1 : 0}
            transition="opacity 0.2s ease"
            pointerEvents={gridReady ? "auto" : "none"}
          >
            {switcher.teams.map((t) => (
              <Box
                key={t.id}
                as="button"
                onClick={() => {
                  switcher.onTeamClick(t.id);
                  setShowGrid(false);
                }}
                w={12}
                h={12}
                mx="auto"
                borderRadius="md"
                p={1.5}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={t.id === switcher.teamId ? "whiteAlpha.100" : "transparent"}
                opacity={t.id === switcher.teamId ? 1 : 0.55}
                _hover={{ opacity: 1, bg: "whiteAlpha.100" }}
                transition="all 0.15s"
                title={t.name}
              >
                <Image
                  src={t.logo}
                  alt={t.name}
                  w="full"
                  h="full"
                  objectFit="contain"
                  onLoad={handleTileSettled}
                  onError={handleTileSettled}
                />
              </Box>
            ))}
          </Grid>

          {!gridReady && (
            <>
              <Grid position="absolute" inset={0} templateColumns="repeat(3, 1fr)" gap={1} p={3} pointerEvents="none">
                {switcher.teams.map((t) => (
                  <Box
                    key={t.id}
                    w={12}
                    h={12}
                    mx="auto"
                    borderRadius="md"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.06) 75%)",
                      backgroundSize: "300% 100%",
                      animation: "sideNavSkeletonShimmer 1.2s linear infinite",
                    }}
                  />
                ))}
              </Grid>
              <Flex
                position="absolute"
                inset={0}
                align="center"
                justify="center"
                direction="column"
                gap={2}
                pointerEvents="none"
                bg="blackAlpha.500"
              >
                <Spinner size="sm" color={primary} />
                <Text fontSize="2xs" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="widest">
                  Loading Teams
                </Text>
              </Flex>
            </>
          )}
        </Box>
      ) : (
        <VStack gap={0} align="stretch">
          {switcher.tabs.map((tab) => (
            <NavItem key={tab.id} item={{ ...tab, accent: primary }} />
          ))}
        </VStack>
      )}
    </Box>
  );
});

TeamHubBlock.displayName = "TeamHubBlock";
