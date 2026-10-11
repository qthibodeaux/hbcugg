import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { 
  useCoachesHubData, 
  useAllCoachesByYear, 
  useCoachingTrees 
} from "../../hooks/useSWACData";
import { 
  getMostStableSchools, 
  getMovementSummary, 
  getTopPipelineSchools, 
  getCoachStockGroups 
} from "./coachesHubModel";

// Components
import { EcosystemSnapshotCard } from "../../components/organisms/test/EcosystemSnapshotCard";
import { 
  CoachingStabilityWidget, 
  CoachingMovementWidget, 
  PipelineSchoolsWidget, 
  CoachingStyleWidget 
} from "../../components/organisms/test/CoachesHubWidgets";
import { CoachStockWidget } from "../../components/organisms/test/CoachStockWidget";
import { CoachesHubEcosystemA } from "../../components/organisms/test/CoachesHubEcosystemA";
import { BannerCoachesHub } from "../../components/organisms/test/BannerPages";
import CoachCard from "../../components/atoms/cards/CoachCard";

// Icons
import { Shield, GitMerge, TrendingUp, GitBranch, ChevronRight } from "lucide-react";
import { Text, Spinner, Center, Box, Flex, Grid, Heading } from "@chakra-ui/react";
import teamsData from "../../data/teams.json";

// --- Constants ----------------------------------------------------------------

const TEAM_DISPLAY = teamsData.teams.reduce((acc, t) => {
  const v5Id = t.exportId.replace(/25$/, "");
  acc[v5Id] = {
    name: t.name,
    shortName: t.shortName,
    conference: t.conference,
    colors: t.colors,
  };
  return acc;
}, {});

const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

const isCoordinator = (title = "") =>
  /coordinator/i.test(title) ||
  /offensive coordinator|defensive coordinator|oc|dc/i.test(title);

// --- Sub-Components -----------------------------------------------------------

const SectionHeader = ({ title, kicker }) => (
  <Box mb={6}>
    <Flex align="center" gap={2} mb={1}>
      <Box w="12px" h="2px" bg="brand.500" />
      <Text fontSize="10px" fontWeight="black" color="brand.500" textTransform="uppercase" letterSpacing="0.2em">
        {kicker}
      </Text>
    </Flex>
    <Heading fontSize="2xl" fontWeight="black" color="white" textTransform="uppercase" letterSpacing="tight">
      {title}
    </Heading>
  </Box>
);

const TeamStaffSection = ({ teamId, coaches }) => {
  const meta = TEAM_DISPLAY[teamId] ?? { name: teamId, shortName: teamId.toUpperCase(), conference: "" };
  const hcList = coaches.filter((c) => isHeadCoach(c.title));
  const coordList = coaches.filter((c) => !isHeadCoach(c.title) && isCoordinator(c.title));
  const positionList = coaches.filter((c) => !isHeadCoach(c.title) && !isCoordinator(c.title));

  return (
    <Box mb={12}>
      <Flex align="center" justify="space-between" mb={6} pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={4}>
          <Box w="4px" h="32px" bg={meta.colors?.primary || "brand.500"} />
          <Box>
            <Text fontSize="xl" fontWeight="black" color="text.primary" textTransform="uppercase" letterSpacing="tight">
              {meta.name}
            </Text>
            <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
              {meta.conference} Staff � {coaches.length} Members
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr", lg: "280px 1fr" }} gap={8}>
        {/* Leadership Pillar */}
        <Box>
           <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.2em" mb={4}>
            Command & Control
          </Text>
          <Grid gap={4}>
            {hcList.map((c) => <CoachCard key={c.person_id} coach={c} tier="hc" />)}
            {coordList.map((c) => <CoachCard key={c.person_id} coach={c} tier="coord" />)}
          </Grid>
        </Box>

        {/* Operating Staff Pillar */}
        <Box>
          <Text fontSize="9px" fontWeight="black" color="text.muted" textTransform="uppercase" letterSpacing="0.2em" mb={4}>
            Operating Staff
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={4}>
            {positionList.map((c) => <CoachCard key={c.person_id} coach={c} tier="staff" />)}
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
};

// --- Page ---------------------------------------------------------------------

const CoachesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [year, setYear] = useState("2025");
  const view = searchParams.get("tab") || "dash";

  const { schools, isLoading: hubLoading } = useCoachesHubData(Number(year));
  const { coaches, isLoading: coachesLoading } = useAllCoachesByYear(year);
  const { careerProgressions, isLoading: treesLoading } = useCoachingTrees();

  const isLoading = hubLoading || coachesLoading || treesLoading;

  const grouped = useMemo(() => {
    return coaches.reduce((acc, c) => {
      const tid = c._teamId;
      if (!acc[tid]) acc[tid] = [];
      acc[tid].push(c);
      return acc;
    }, {});
  }, [coaches]);

  const teamIds = useMemo(() => Object.keys(grouped).sort(), [grouped]);
  const stableSchools = useMemo(() => getMostStableSchools(schools), [schools]);
  const movement = useMemo(() => getMovementSummary(schools), [schools]);
  const stockGroups = useMemo(() => getCoachStockGroups(schools), [schools]);
  const pipelineSchools = useMemo(() => getTopPipelineSchools(schools), [schools]);

  return (
    <PageShell 
      listContent={
        !isLoading && view !== "dash" && (
          <Box px={{ base: 4, md: 8 }} py={10}>
            {view === "roster" && (
              <>
                <SectionHeader title="Staff Directory" kicker="Personnel List" />
                {teamIds.map((tid) => <TeamStaffSection key={tid} teamId={tid} coaches={grouped[tid]} />)}
              </>
            )}
            {view === "arcs" && (
              <>
                <SectionHeader title="Staff Evolution" kicker="Career Arcs" />
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                   {careerProgressions.slice(0, 20).map((c, i) => (
                      <Box key={i} bg="bg.secondary" p={4} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="bold" color="white">{c.name}</Text>
                            <Text fontSize="xs" color="text.muted">{c.arc?.positions?.join(' ? ')}</Text>
                          </Box>
                          <ChevronRight size={16} color="gray" />
                        </Flex>
                      </Box>
                   ))}
                </Grid>
              </>
            )}
          </Box>
        )
      }
    >
      {/* 1. MAGAZINE TOP PANEL */}
      <PageShell.Slot cols={4}>
        <BannerCoachesHub season={Number(year)} setSeason={(s) => setYear(String(s))} />
      </PageShell.Slot>

      {/* 2. SUB-NAV / CONTROL BAR - Now integrated more naturally */}
      <PageShell.Slot cols={4}>
        <Flex align="center" justify="space-between" borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
           <Flex gap={4}>
            {[
              { id: "dash", label: "Dashboard" },
              { id: "roster", label: "Staff Roster" },
              { id: "arcs", label: "Career Arcs" },
            ].map(({ id, label }) => (
              <Box 
                key={id} 
                as="button" 
                onClick={() => setSearchParams({ tab: id })} 
                position="relative"
                px={1}
                py={2}
                fontSize="xs" 
                fontWeight="black"
                textTransform="uppercase"
                letterSpacing="0.2em"
                color={view === id ? "brand.500" : "text.secondary"}
                _hover={{ color: "text.primary" }}
                transition="all 0.2s"
              >
                {label}
                {view === id && (
                  <Box position="absolute" bottom="-17px" left={0} right={0} h="2px" bg="brand.500" />
                )}
              </Box>
            ))}
          </Flex>
          <Text fontSize="10px" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">
            HBCU Gridiron Leadership Intel v2.5
          </Text>
        </Flex>
      </PageShell.Slot>

      {isLoading ? (
        <PageShell.Slot cols={4}>
          <Center py={20}><Spinner color="brand.500" size="xl" thickness="4px" /></Center>
        </PageShell.Slot>
      ) : (
        view === "dash" && (
          <>
            {/* 3. KPI IMPACT LAYER */}
            <PageShell.Slot cols={1}>
              <EcosystemSnapshotCard title="Stability Leader" value={stableSchools[0]?.school_name} kicker="Top Continuity" icon={Shield} color="#48BB78" />
            </PageShell.Slot>
            <PageShell.Slot cols={1}>
              <EcosystemSnapshotCard title="Transfer Volume" value={movement.totalHires} kicker="New Staffers" icon={GitMerge} color="#E53E3E" />
            </PageShell.Slot>
            <PageShell.Slot cols={1}>
              <EcosystemSnapshotCard title="Rising Stocks" value={stockGroups["Rising"]?.length || 0} kicker="Hot Names" icon={TrendingUp} color="#38B2AC" />
            </PageShell.Slot>
            <PageShell.Slot cols={1}>
              <EcosystemSnapshotCard title="Pipeline Hub" value={pipelineSchools[0]?.school_name} kicker="Talent Export" icon={GitBranch} color="#4299E1" />
            </PageShell.Slot>

            {/* 4. INTEL GRIDS */}
            <PageShell.Slot cols={2} rows={2}><CoachingStabilityWidget schools={stableSchools} /></PageShell.Slot>
            <PageShell.Slot cols={2} rows={2}><CoachingMovementWidget schools={schools} /></PageShell.Slot>
            
            {/* 5. ECOSYSTEM DEEP DIVE (FEATURED) */}
            <PageShell.Slot cols={2} rows={2}><CoachesHubEcosystemA schoolData={stableSchools[0]} /></PageShell.Slot>
            <PageShell.Slot cols={2} rows={2}><PipelineSchoolsWidget schools={pipelineSchools} /></PageShell.Slot>

            {/* 6. STYLE & STOCK */}
            <PageShell.Slot cols={2} rows={2}><CoachingStyleWidget schools={schools} /></PageShell.Slot>
            <PageShell.Slot cols={2} rows={2}><CoachStockWidget schools={schools} /></PageShell.Slot>
          </>
        )
      )}
    </PageShell>
  );
};

export default CoachesPage;
