import { useState, Fragment } from "react";
import { Box, SimpleGrid, Flex, Text, Image, Icon, Button } from "@chakra-ui/react";
import { Trophy, History, Music, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/layouts/PageShell";
import { ConferenceWikiPageLabA as ConferenceWiki } from "../../components/organisms/test/ConferenceWikiPageLabA";
import teamsData from "../../data/teams.json";

import { 
  SectionHeader, 
  SchoolIdentityPlate, 
  ProgramWikiCard, 
  ConferenceIdentityCard 
} from "../../components/molecules/schools/WikiIdentityComponents";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ALL_TEAMS = [...teamsData.teams].sort((a, b) => a.name.localeCompare(b.name));
const SWAC = ALL_TEAMS.filter((t) => t.conference === "SWAC").sort((a, b) =>
  a.name.localeCompare(b.name)
);
const MEAC = ALL_TEAMS.filter((t) => t.conference === "MEAC").sort((a, b) =>
  a.name.localeCompare(b.name)
);

const CONF_META = {
  SWAC: {
    full: "Southwestern Athletic Conference",
    founded: 1920,
    hq: "Birmingham, AL",
    teams: SWAC.length,
    accent: "#F4811F",
    blurb:
      "The oldest HBCU athletic conference in America. Known globally for Celebration Bowl dominance, elite marching bands, and producing NFL talent from overlooked markets.",
    facts: [
      { label: "Founded", value: "1920" },
      { label: "HQ", value: "Birmingham, AL" },
      { label: "Members", value: `${SWAC.length} programs` },
      { label: "Divisions", value: "East & West" },
      { label: "Bowl Game", value: "Celebration Bowl" },
      { label: "Legacy", value: "100+ NFL Draftees" },
    ],
    deepFacts: [
      {
        label: "Celebration Bowl",
        value:
          "The SWAC champion faces the MEAC champion annually in Atlanta — the de facto HBCU national championship game.",
      },
      {
        label: "Battle of the Bands",
        value:
          "SWAC halftime shows are a cultural institution. Schools like Grambling, Southern, and JSU are as famous for their bands as their football.",
      },
      {
        label: "The Rivalry",
        value:
          "Grambling vs. Southern — the Bayou Classic — is one of the most attended rivalry games in FCS football.",
      },
      {
        label: "NFL Pipeline",
        value:
          "The SWAC has produced more than 100 NFL draftees. Deion Sanders, Jerry Rice, and Walter Payton all played at HBCU-adjacent programs.",
      },
    ],
  },
  MEAC: {
    full: "Mid-Eastern Athletic Conference",
    founded: 1969,
    hq: "Norfolk, VA",
    teams: MEAC.length,
    accent: "#A89968",
    blurb:
      "Founded in 1969, the MEAC represents the Eastern corridor of HBCU excellence — from Florida to Delaware — producing Pro Bowl players and social justice leaders across generations.",
    facts: [
      { label: "Founded", value: "1969" },
      { label: "HQ", value: "Norfolk, VA" },
      { label: "Members", value: `${MEAC.length} programs` },
      { label: "Region", value: "East Coast" },
      { label: "Bowl Game", value: "Celebration Bowl" },
      { label: "Legacy", value: "Social Justice Roots" },
    ],
    deepFacts: [
      {
        label: "Celebration Bowl",
        value:
          "The MEAC champion earns a trip to Atlanta to face the SWAC champion — the crown jewel of HBCU football.",
      },
      {
        label: "Cultural Corridor",
        value:
          "The MEAC spans from Florida A&M to Delaware State, cutting through the historic Black Belt of the Eastern Seaboard.",
      },
      {
        label: "FAMU Legacy",
        value:
          "Florida A&M's Marching 100 is widely regarded as the greatest college marching band in history — a centerpiece of MEAC identity.",
      },
      {
        label: "Academic Mission",
        value:
          "MEAC schools consistently lead among HBCUs in graduation rates and professional program enrollment.",
      },
    ],
  },
};

// ─── Stat grid ──────────────────────────────────────────────────────────────

const SchoolsWikiPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("CONFERENCE"); // ALL, SWAC, MEAC, CONFERENCE

  const filteredTeams = ALL_TEAMS.filter((t) => {
    if (filter === "ALL") return true;
    return t.conference === filter;
  });

  const featuredTeam = teamsData.teams.find(t => t.id === "jackson-state");

  return (
    <PageShell embedded={filter === "CONFERENCE"}>
      {filter === "CONFERENCE" ? (
        <ConferenceWiki />
      ) : (
        <Fragment>
          {/* Row 1: Hero — 4x1 */}
          <PageShell.Slot cols={4}>
            <Flex 
              h="full" 
              w="full" 
              bg="bg.secondary" 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="whiteAlpha.100"
              overflow="hidden"
              position="relative"
              minH={{ base: "320px", lg: "400px" }}
            >
              <Box flex={1} p={{ base: 6, lg: 12 }} position="relative" zIndex={2} display="flex" flexDirection="column" justifyContent="center">
                <Text fontSize="10px" fontWeight="black" color="brand.500" letterSpacing="0.4em" mb={2}>
                  FOUNDATIONAL ARCHIVE
                </Text>
                <Text fontSize={{ base: "4xl", lg: "7xl" }} fontWeight="black" color="white" lineHeight="0.85" mb={6}>
                  SCHOOLS <br /> WIKI
                </Text>
                <Text fontSize={{ base: "xs", lg: "md" }} color="text.secondary" maxW="600px" mb={8} lineHeight="1.6">
                  18 programs. Two conferences. One cultural football ecosystem.
                  Explore history, stadiums, traditions, band culture, and the rivalries that shape HBCU football.
                </Text>
                
                <Flex gap={3} flexWrap="wrap" bg="rgba(255,255,255,0.05)" p={4} borderRadius="xl" border="1px solid rgba(255,255,255,0.1)">
                  {["ALL", "SWAC", "MEAC", "CONFERENCE"].map(f => (
                    <Box
                      key={f}
                      as="button"
                      onClick={() => setFilter(f)}
                      px={{ base: 4, lg: 8 }}
                      py={3}
                      borderRadius="full"
                      bg={filter === f ? "brand.500" : "whiteAlpha.200"}
                      color="white"
                      fontSize="sm"
                      fontWeight="900"
                      letterSpacing="0.2em"
                      transition="all 0.2s"
                      border="1px solid"
                      borderColor={filter === f ? "brand.500" : "whiteAlpha.300"}
                      _hover={{ 
                        bg: filter === f ? "brand.500" : "whiteAlpha.400",
                        transform: "translateY(-2px)"
                      }}
                      _active={{ transform: "translateY(0)" }}
                    >
                      {f === "ALL" ? "ALL PROGRAMS" : f === "CONFERENCE" ? "CONFERENCE WIKI" : f}
                    </Box>
                  ))}
                </Flex>
              </Box>

              <Box 
                w={{ base: "180px", lg: "440px" }}
                bg="whiteAlpha.50" 
                p={{ base: 6, lg: 12 }} 
                borderLeft="1px solid" 
                borderColor="whiteAlpha.100"
                display={{ base: "none", xl: "flex" }}
                flexDirection="column"
                justifyContent="center"
              >
                <Text fontSize="10px" fontWeight="black" color="text.muted" mb={2} letterSpacing="0.1em">FEATURED PROGRAM</Text>
                <Box mb={4}>
                  <Flex gap={3} align="center" mb={2}>
                    <Image src={featuredTeam.logo} boxSize={{ base: "24px", lg: "40px" }} />
                    <Box>
                      <Text fontSize={{ base: "sm", lg: "xl" }} fontWeight="black" color="white" lineHeight="1">{featuredTeam.name}</Text>
                      <Text fontSize="10px" color="brand.400" fontWeight="bold">Sonic Boom of the South</Text>
                    </Box>
                  </Flex>
                  <Text fontSize="xs" color="text.secondary" lineHeight="1.4" lineClamp={3}>
                    Jackson State University is a cornerstone of the SWAC, known for its deep NFL legacy and the world-renowned "Tiger" pride.
                  </Text>
                </Box>
                <Button 
                    variant="outline" 
                    size="xs" 
                    w="full" 
                    borderColor="whiteAlpha.200" 
                    _hover={{ bg: "whiteAlpha.100" }}
                    onClick={() => navigate(`/teams/${featuredTeam.id}/wiki`)}
                    color="text.primary"
                >
                  Enter Wiki →
                </Button>
              </Box>
            </Flex>
          </PageShell.Slot>

          {/* Spacer */}
          <PageShell.Slot cols={4}>
             <Box h="40px" />
          </PageShell.Slot>

          {/* Row 2: Program Selector Section */}
          <PageShell.Slot cols={4}>
            <SectionHeader 
              eyebrow="01 / Program Selector" 
              title="Choose a Program" 
              subtitle="Direct access to program identities and cultural deep-dives."
            />
          </PageShell.Slot>

          {/* Primary Identity Plates — map directly to slots */}
          {ALL_TEAMS.map(t => (
            <PageShell.Slot key={t.id} cols={1}>
              <SchoolIdentityPlate team={t} onClick={(id) => navigate(`/teams/${id}/wiki`)} />
            </PageShell.Slot>
          ))}

          {/* Row: Conference Header */}
          <PageShell.Slot cols={4} mt={4}>
            <SectionHeader 
              eyebrow="02 / The Conferences" 
              title="Power & Tradition" 
              subtitle="The governing bodies of HBCU football excellence."
            />
          </PageShell.Slot>

          {/* Conference Chapters — 2x2 Slots */}
          <PageShell.Slot cols={2} rows={2}>
            <ConferenceIdentityCard confKey="SWAC" meta={CONF_META.SWAC} />
          </PageShell.Slot>
          <PageShell.Slot cols={2} rows={2}>
            <ConferenceIdentityCard confKey="MEAC" meta={CONF_META.MEAC} />
          </PageShell.Slot>

          {/* Row: More Than A Game - Cinematic Section (4x2 to give it the height requested) */}
          <PageShell.Slot cols={4} rows={2}>
            <Box
              h="full"
              px={{ base: 6, lg: 12 }}
              bg="bg.secondary"
              borderRadius="2xl"
              position="relative"
              overflow="hidden"
              border="1px solid"
              borderColor="whiteAlpha.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {/* Background Text Overlay */}
              <Text
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                fontSize={{ base: "120px", lg: "300px" }}
                fontWeight="900"
                color="whiteAlpha.50"
                pointerEvents="none"
                letterSpacing="-0.08em"
                opacity={0.15}
              >
                HBCU
              </Text>

              <Flex direction="column" align="center" textAlign="center" position="relative" zIndex={2}>
                <Text fontSize="12px" fontWeight="900" color="brand.500" letterSpacing="0.5em" mb={4}>
                  CULTURE OF EXCELLENCE
                </Text>
                <Text fontSize={{ base: "xl", lg: "5xl" }} fontWeight="900" color="white" maxW="1000px" lineHeight="1.0" mb={10} textTransform="uppercase">
                  "HBCU football is not just a schedule. It is a living archive of campuses, bands, and pride."
                </Text>
                
                <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 4, lg: 16 }} w="full" maxW="1100px">
                  {[
                    { label: "PROGRAMS", value: "18", icon: Building },
                    { label: "CONFERENCES", value: "2", icon: Trophy },
                    { label: "LEGACY", value: "150Y", icon: History },
                    { label: "BANDS", value: "ELITE", icon: Music },
                  ].map(stat => (
                    <Box key={stat.label}>
                      <Icon as={stat.icon} color="brand.500" boxSize={8} mb={2} />
                      <Text fontSize={{ base: "xl", lg: "5xl" }} fontWeight="900" color="white" lineHeight="1">{stat.value}</Text>
                      <Text fontSize="9px" fontWeight="black" color="brand.400" letterSpacing="0.2em">{stat.label}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </Flex>
            </Box>
          </PageShell.Slot>

          {/* Row: Directory Header */}
          <PageShell.Slot cols={4}>
            <SectionHeader 
              eyebrow="03 / Program Directory" 
              title="FCS Program Wiki" 
              subtitle={`Browsing ${filter} Programs — 2025 Institutional Data`}
            />
          </PageShell.Slot>

          {/* Program Directory — 1x2 slots (allows height for stats without scroll) */}
          {filteredTeams.map(t => (
            <PageShell.Slot key={t.id} cols={1} rows={2}>
              <ProgramWikiCard team={t} onClick={(id) => navigate(`/teams/${id}/wiki`)} />
            </PageShell.Slot>
          ))}
        </Fragment>
      )}
    </PageShell>
  );
};

export default SchoolsWikiPage;
