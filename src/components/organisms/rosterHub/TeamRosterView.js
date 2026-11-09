import { Box, Flex, Text } from "@chakra-ui/react";
import { ROW_H, MEAC_TEAM_IDS, SWAC_TEAM_IDS, GRID_GAP } from "../../../utils/rosterHubConfig";
import { TeamSelectorSlot } from "./RosterHubControls";
import { useNavigate } from "react-router-dom";
import { useLayoutDensity } from "../../../hooks/useLayoutDensity";
import { useMemo } from "react";
import { aggregateDivision } from "../../../utils/rosterHubModel";
import { ArrowRight } from "lucide-react";
import { CompositionExperienceCard } from "./RosterCompositionCards";
import { PositionRangeChart } from "./RosterPhysicalCharts";
import { SectionCard } from "./RosterHubPrimitives";
import { GeoKpis } from "./RosterGeographyCards";
import { TransferKpis } from "./RosterTransferCards";

// Owns one roster-hub view/control responsibility; existing behavior preserved.

export const TeamModeContent = ({ selectedId, setSelectedId }) => (
  <Box h={ROW_H}>
    <TeamSelectorSlot selectedId={selectedId} onChange={setSelectedId} />
  </Box>
);

export const TeamAnalyticsPanel = ({ mod, teamEntry, teamsMap, players }) => {
  const navigate = useNavigate();
  const { isMobile } = useLayoutDensity();
  const primary = teamEntry.colors?.primary || "#FFFFFF";
  const secondary = teamEntry.colors?.secondary || primary;
  const conferenceLabel = teamEntry.conference === "MEAC" ? "MEAC" : "SWAC";
  const conferenceIds = teamEntry.conference === "MEAC" ? MEAC_TEAM_IDS : SWAC_TEAM_IDS;
  const conferenceAvg = useMemo(
    () => aggregateDivision(conferenceIds, teamsMap ?? {}),
    [conferenceIds, teamsMap],
  );

  const headerStrip = (
    <Flex
      as="button"
      align="center"
      justify="space-between"
      px={5}
      py={4}
      flexShrink={0}
      bg={`linear-gradient(135deg, ${primary}26, rgba(255,255,255,0.035))`}
      borderBottom="1px solid"
      borderColor={`${secondary}44`}
      boxShadow={`inset 4px 0 0 ${secondary}`}
      _hover={{ bg: "whiteAlpha.100" }}
      onClick={() => navigate(`/teams/${teamEntry.id}/roster/full`)}
      style={{ transition: "all 0.15s" }}
      w="100%"
    >
      <Flex align="center" gap={3}>
        <Box w="0.1875rem" h="1.25rem" bg={secondary} borderRadius="full" />
        {/* Mobile uses the short name (bannerName — "NC Central", not the
            abbreviation "NCCU") since the full name wrapped to two lines in
            this cramped strip, and drops the muted "Full Roster" label that
            just repeats the anchor on the right. Desktop keeps both. */}
        <Text fontSize="lg" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="0.04em">
          {isMobile ? (teamEntry.bannerName ?? teamEntry.name) : teamEntry.name}
        </Text>
        {!isMobile && <Text fontSize="sm" color="text.muted">Roster</Text>}
      </Flex>
      <Flex align="center" gap={2}>
        <Text fontSize="sm" color={secondary} fontWeight="bold">Roster</Text>
        <ArrowRight size={16} color={secondary} />
      </Flex>
    </Flex>
  );

  // Mobile — every card gets its own full-width row instead of sharing a
  // 6-col grid at a third/two-thirds each. Not pinned to a fixed height like
  // a PageShell row unit — each card sizes to its own content and the page
  // just scrolls, since this whole branch already lives outside PageShell.
  if (isMobile) {
    return (
      <Flex direction="column" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
        {headerStrip}
        <Flex direction="column" gap="0.75rem" p="0.75rem">
          <CompositionExperienceCard mod={mod} conferenceAvg={conferenceAvg} conferenceLabel={conferenceLabel} accent={primary} isMobile />
          <PositionRangeChart mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} accent={primary} />
          <Box h="20rem">
            <SectionCard title="Geographic" accent={secondary} h="100%" borderRadius={0} flat>
              <GeoKpis data={mod?.geographic} accent={secondary} />
            </SectionCard>
          </Box>
          <Box h="18rem">
            <SectionCard title="Transfers" accent={primary} h="100%" borderRadius={0} flat>
              <TransferKpis data={mod?.transfers} accent={primary} />
            </SectionCard>
          </Box>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%" bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="lg" overflow="hidden">
      {headerStrip}

      <Box flex={1} minH={0} p={{ base: 2, lg: 3 }}>
        {/* 6 columns instead of 4 just for this grid, so Composition can take
            a genuine 1/3 (span 2) with Physical filling the other 2/3 (span
            4), while Geographic/Transfers stay an even 50/50 (span 3 each). */}
        <Box display="grid" gridTemplateColumns="repeat(6, 1fr)" gridTemplateRows="repeat(2, 1fr)" gap={GRID_GAP} h="100%">
          <Box gridColumn="span 2">
            <CompositionExperienceCard mod={mod} conferenceAvg={conferenceAvg} conferenceLabel={conferenceLabel} accent={primary} />
          </Box>
          <Box gridColumn="span 4">
            <PositionRangeChart mod={mod} teamEntry={teamEntry} teamsMap={teamsMap} players={players} accent={primary} />
          </Box>
          <Box gridColumn="span 3">
            <SectionCard title="Geographic" accent={secondary} h="100%" flat>
              <GeoKpis data={mod?.geographic} accent={secondary} />
            </SectionCard>
          </Box>
          <Box gridColumn="span 3">
            <SectionCard title="Transfers" accent={primary} h="100%" flat>
              <TransferKpis data={mod?.transfers} accent={primary} />
            </SectionCard>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};
