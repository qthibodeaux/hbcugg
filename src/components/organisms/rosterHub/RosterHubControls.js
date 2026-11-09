import { Box, Grid, Spinner, Text, Flex, useMediaQuery, Image } from "@chakra-ui/react";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { TEAM_LIST } from "../../../utils/rosterHubConfig";
import { getTeamCompactLabel, readableTextColor } from "../../../utils/rosterHubModel";

// Owns one roster-hub view/control responsibility; existing behavior preserved.

const MODES = [
  { id: "team", label: "By Team" },
  { id: "divisions", label: "Divisions" },
  { id: "league", label: "League" },
];

export const KpiControlPanel = ({ kpis, isLoading, mode, setMode, isMobile = false }) => (
  <Box h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius={isMobile ? 0 : "lg"} overflow="hidden" display="flex" flexDirection="column">
    <Grid flex={1} templateColumns={isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)"} minH={0}>
      {kpis.map((kpi, i) => (
        <Box
          key={i}
          position="relative"
          overflow="hidden"
          px={isMobile ? 3 : { base: 4, lg: 5 }}
          py={isMobile ? 1.5 : 0}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          borderLeft={(isMobile ? i % 2 === 0 : i === 0) ? "none" : "1px solid"}
          borderTop={isMobile && i >= 2 ? "1px solid" : "none"}
          borderColor="whiteAlpha.100"
        >
          <Box position="absolute" top={0} left={0} bottom={0} w="4px" bg={kpi?.accent ?? "white"} />
          {isLoading || !kpi ? (
            <Spinner color="brand.500" size="sm" />
          ) : (
            <>
              <Text position="absolute" right="-6%" bottom="-18%" fontSize="clamp(3.2rem, 7vw, 5.2rem)" fontWeight="black" lineHeight={0.8} color="white" opacity={0.025} pointerEvents="none">
                {kpi.value}
              </Text>
              <Text textStyle="kicker" color="rgba(255,255,255,0.62)" mb={1} lineClamp={1}>
                {kpi.label}
              </Text>
              <Text fontSize="clamp(2.1rem, 5vw, 3.2rem)" fontWeight="black" fontStyle="italic" color={kpi.accent ?? "white"} lineHeight={0.9} lineClamp={1}>
                {kpi.value}
              </Text>
              {kpi.sub && (
                <Text fontSize="xs" fontWeight="bold" color="rgba(255,255,255,0.6)" mt={1} lineClamp={1}>
                  {kpi.sub}
                </Text>
              )}
            </>
          )}
        </Box>
      ))}
    </Grid>

    <Flex borderTop="1px solid" borderColor="whiteAlpha.100" bg="rgba(0,0,0,0.22)" flexShrink={0}>
      {MODES.map((m, i) => {
        const active = mode === m.id;
        return (
          <Box
            key={m.id}
            as="button"
            flex={1}
            py={isMobile ? 2 : { base: 3, lg: 3.5 }}
            cursor="pointer"
            bg={active ? "linear-gradient(135deg, #E53E3E, #B91C1C)" : "transparent"}
            borderLeft={i === 0 ? "none" : "1px solid"}
            borderColor="whiteAlpha.100"
            onClick={() => setMode(m.id)}
            style={{ transition: "all 0.15s" }}
            _hover={{ bg: active ? undefined : "whiteAlpha.50" }}
          >
            <Text fontSize={{ base: "xs", lg: "sm" }} fontWeight="black" textTransform="uppercase" letterSpacing="0.08em" color={active ? "white" : "text.muted"}>
              {m.label}
            </Text>
          </Box>
        );
      })}
    </Flex>
  </Box>
);

export const TeamSelectorSlot = ({ selectedId, onChange }) => {
  // Raised from 1023px — 6 columns of full team names ("Mississippi Valley
  // State", "Arkansas Pine Bluff") don't actually fit until the viewport is
  // quite wide; anything narrower than that now gets the short label
  // instead of an ellipsis-truncated long one.
  const [isCompact] = useMediaQuery("(max-width: 1440px)");
  const { isMobile } = useLayoutDensity();

  // Mobile — real team logos (grayscale until picked, full color + colored
  // ring on selection) in square edge-to-edge cells, matching the
  // SchoolDirectory/TeamScheduleBannerA tile standard. Desktop/tablet keeps
  // the flat-color text-button treatment.
  if (isMobile) {
    return (
      <Box bg="bg.secondary" overflow="hidden">
        <Grid templateColumns="repeat(6, minmax(0, 1fr))" gap="0">
          {TEAM_LIST.map((t) => {
            const active = t.id === selectedId;
            return (
              <Box
                key={t.id}
                as="button"
                aria-label={t.label}
                borderRadius={0}
                cursor="pointer"
                bg={active ? `${t.primary}22` : "rgba(255,255,255,0.03)"}
                border="1px solid"
                borderColor={active ? t.secondary : "rgba(255,255,255,0.1)"}
                borderBottomWidth="0.2rem"
                borderBottomColor={t.primary}
                onClick={() => onChange(t.id)}
                display="flex"
                alignItems="center"
                justifyContent="center"
                aspectRatio="1"
                p="0.4rem"
                style={{ transition: "all 0.15s" }}
              >
                <Image
                  src={t.logo}
                  alt={t.label}
                  w="72%"
                  h="72%"
                  objectFit="contain"
                  filter={active ? "none" : "grayscale(1)"}
                  opacity={active ? 1 : 0.7}
                  style={{ transition: "filter 0.15s, opacity 0.15s" }}
                />
              </Box>
            );
          })}
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      h="100%"
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      <Grid
        h="100%"
        templateColumns="repeat(6, minmax(0, 1fr))"
        templateRows="repeat(3, 1fr)"
        gap={isCompact ? 1.5 : 2}
        p={isCompact ? 3 : 4}
      >
        {TEAM_LIST.map((t) => {
          const active = t.id === selectedId;
          const label = isCompact ? getTeamCompactLabel(t) : t.label;
          const activeTextColor = readableTextColor(t.primary);
          return (
            <Box
              key={t.id}
              as="button"
              borderRadius="md"
              cursor="pointer"
              bg={active ? t.primary : "rgba(255,255,255,0.05)"}
              border="2px solid"
              borderColor={active ? t.secondary : "rgba(255,255,255,0.08)"}
              boxShadow={active ? `0 10px 22px ${t.primary}44` : "inset 0 -1px 0 rgba(255,255,255,0.04)"}
              onClick={() => onChange(t.id)}
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
              px={isCompact ? 1.5 : 2}
              py={1}
              minW={0}
              style={{ transition: "all 0.15s" }}
              _hover={{ borderColor: active ? t.secondary : "whiteAlpha.300", bg: active ? undefined : "rgba(255,255,255,0.08)" }}
            >
              <Text
                fontSize={isCompact ? "sm" : "md"}
                fontWeight="black"
                fontStyle="italic"
                textAlign="center"
                lineHeight={1}
                textTransform="uppercase"
                letterSpacing={isCompact ? "0.01em" : "-0.01em"}
                color={active ? activeTextColor : "#FFFFFF"}
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                maxW="100%"
              >
                {label}
              </Text>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};
