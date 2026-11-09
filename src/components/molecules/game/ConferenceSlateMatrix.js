import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson, gameCenterPaths } from "../../../utils/gameCenterPayloads";
import { getTeamsForView, buildLookup, toMatrixMatchup, TEAM_BY_ID } from "./conferenceSlate/slateModel";
import { Box, Flex, Text, Spinner, Grid } from "@chakra-ui/react";
import { Logo } from "./conferenceSlate/SlatePrimitives";
import { SlateCell } from "./conferenceSlate/SlateCell";

export const ConferenceSlateMatrixA = ({ season = 2025 }) => {
  const [conference, setConference] = useState("MEAC");
  const [swacScope, setSwacScope] = useState("WEST");
  const { data, isPending } = useQuery({
    queryKey: ["conference-slate", season],
    queryFn: () => fetchJson(gameCenterPaths.conferenceSlate(season)),
    staleTime: Infinity,
  });
  const teamIds = useMemo(() => getTeamsForView(conference, swacScope, data?.axes), [conference, swacScope, data]);
  const lookup = useMemo(() => buildLookup(data?.matchups?.map(toMatrixMatchup) ?? []), [data]);
  const compact = conference === "SWAC" && swacScope === "ALL";
  const columnWidth = compact ? "74px" : "minmax(128px, 1fr)";
  const gridTemplate = `72px repeat(${teamIds.length}, ${columnWidth})`;
  const rowHeight = compact ? "62px" : "96px";

  return (
    <Box
      className="conference-slate-shell"
      h="100%"
      w="full"
      bg="bg.primary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      overflow="hidden"
    >
      <style>{`
        @media (min-width: 641px) and (max-width: 900px) {
          .conference-slate-shell .slate-all-control {
            display: none !important;
          }

          .conference-slate-shell .conference-slate-grid {
            grid-template-columns: 72px repeat(var(--slate-team-count), 74px) !important;
            min-width: var(--slate-compact-min-width) !important;
            grid-auto-rows: 62px !important;
          }

          .conference-slate-shell .slate-cell,
          .conference-slate-shell .slate-axis-cell {
            height: 62px !important;
          }

          .conference-slate-shell .slate-compact-content {
            display: flex !important;
          }

          .conference-slate-shell .slate-wide-content {
            display: none !important;
          }
        }
      `}</style>
      <Flex h="100%" direction="column">
        <Flex align="center" justify="space-between" gap={4} px={5} py={4} borderBottom="1px solid" borderColor="whiteAlpha.100" flexShrink={0}>
          <Box>
            <Text fontSize="10px" color="brand.400" fontWeight="black" textTransform="uppercase" letterSpacing="0.18em">
              Conference Slate
            </Text>
            <Text fontSize="3xl" color="white" fontWeight="black" textTransform="uppercase" lineHeight={0.9}>
              {season} Matrix
            </Text>
          </Box>
          <Flex gap={2} align="center" wrap="wrap" justify="end">
            {["MEAC", "SWAC"].map((item) => (
              <Box
                key={item}
                as="button"
                px={3}
                py={1.5}
                borderRadius="full"
                bg={conference === item ? "brand.500" : "whiteAlpha.100"}
                onClick={() => {
                  setConference(item);
                  if (item === "SWAC" && swacScope === "ALL") setSwacScope("WEST");
                }}
              >
                <Text fontSize="9px" color="white" fontWeight="black">{item}</Text>
              </Box>
            ))}
            <Flex gap={1} pl={2} borderLeft="1px solid" borderColor="whiteAlpha.200">
              {["ALL", "WEST", "EAST"].map((item) => (
                <Box
                  key={item}
                  className={item === "ALL" ? "slate-all-control" : undefined}
                  as="button"
                  px={2.5}
                  py={1.5}
                  borderRadius="full"
                  bg={conference === "SWAC" && swacScope === item ? "whiteAlpha.300" : "transparent"}
                  opacity={conference === "SWAC" ? 1 : 0.36}
                  cursor={conference === "SWAC" ? "pointer" : "default"}
                  onClick={() => conference === "SWAC" && setSwacScope(item)}
                >
                  <Text fontSize="9px" color={conference === "SWAC" && swacScope === item ? "white" : "text.muted"} fontWeight="black">{item}</Text>
                </Box>
              ))}
            </Flex>
          </Flex>
        </Flex>

        <Box flex={1} overflow="auto" p={4}>
          {/* The axes are the payload, so an empty grid is indistinguishable from a
              conference with no games. Hold the frame and spin instead. */}
          {isPending ? (
            <Flex h="100%" minH="12rem" align="center" justify="center">
              <Spinner color="brand.500" size="lg" />
            </Flex>
          ) : (
            <Grid
              className="conference-slate-grid"
              templateColumns={gridTemplate}
              minW={compact ? `${72 + teamIds.length * 74}px` : "100%"}
              autoRows={rowHeight}
              style={{ "--slate-team-count": teamIds.length, "--slate-compact-min-width": `${72 + teamIds.length * 74}px` }}
            >
              <Box position="sticky" left={0} top={0} zIndex={4} bg="bg.primary" borderRight="1px solid" borderBottom="1px solid" borderColor="whiteAlpha.100" />
              {teamIds.map((id) => {
                const team = TEAM_BY_ID[id];
                return (
                  <Flex key={`top-${id}`} className="slate-axis-cell" position="sticky" top={0} zIndex={3} align="center" justify="center" bg="bg.primary" borderBottom="1px solid" borderColor="whiteAlpha.100">
                    <Logo team={team} size="34px" />
                  </Flex>
                );
              })}
              {teamIds.map((rowId) => {
                const rowTeam = TEAM_BY_ID[rowId];
                return [
                  <Flex key={`left-${rowId}`} className="slate-axis-cell" position="sticky" left={0} zIndex={2} align="center" justify="center" bg="bg.primary" borderRight="1px solid" borderColor="whiteAlpha.100">
                    <Logo team={rowTeam} size="34px" />
                  </Flex>,
                  ...teamIds.map((colId) => (
                    <SlateCell
                      key={`${rowId}-${colId}`}
                      rowTeamId={rowId}
                      colTeamId={colId}
                      game={lookup[[rowId, colId].sort().join("|")]}
                      compact={compact}
                    />
                  )),
                ];
              })}
            </Grid>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export { ConferenceSlateMobile } from "./conferenceSlate/ConferenceSlateMobile";
