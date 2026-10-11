import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BannerOfficialsHub } from "../../components/organisms/test/BannerPages";
import { Box, Text, Flex, Grid, Spinner } from "@chakra-ui/react";
import { Shield, Users } from "lucide-react";
import ContentContainer from "../../components/layouts/ContentContainer";
import { useAllOfficials, useAllCrews } from "../../hooks/useSWACData";

const CONF_LABELS = { meac: "MEAC", swac: "SWAC" };
const CONF_BG = { meac: "#003A63", swac: "#006747" };

const ROLE_ORDER = [
  "REFEREE",
  "UMPIRE",
  "LINESMAN",
  "LINE JUDGE",
  "BACK JUDGE",
  "FIELD JUDGE",
  "SIDE JUDGE",
];
const ROLE_SHORT = {
  REFEREE: "R",
  UMPIRE: "U",
  LINESMAN: "L",
  "LINE JUDGE": "LJ",
  "BACK JUDGE": "BJ",
  "FIELD JUDGE": "FJ",
  "SIDE JUDGE": "SJ",
};

// ─── Tab button ───────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, children }) => (
  <Box
    as="button"
    onClick={onClick}
    pb={2}
    borderBottom="2px solid"
    borderColor={active ? "brand.500" : "transparent"}
    color={active ? "text.primary" : "text.muted"}
    fontWeight={active ? "bold" : "medium"}
    fontSize="sm"
    letterSpacing="wide"
    _hover={{ color: "text.primary" }}
    transition="all 0.15s"
  >
    {children}
  </Box>
);

const FilterChip = ({ active, onClick, children }) => (
  <Box
    as="button"
    onClick={onClick}
    px={3}
    py="5px"
    borderRadius="full"
    fontSize="xs"
    fontWeight={active ? "bold" : "medium"}
    bg={active ? "brand.500" : "whiteAlpha.100"}
    color={active ? "white" : "text.secondary"}
    _hover={{ bg: active ? "brand.600" : "whiteAlpha.200" }}
    transition="all 0.15s"
    whiteSpace="nowrap"
  >
    {children}
  </Box>
);

// ─── Official card ────────────────────────────────────────────────────────────
const OfficialCard = ({ official }) => {
  const confs = official.conference_affiliations ?? [];
  const partners =
    official.crew_analytics?.frequent_crew_partners?.slice(0, 3) ?? [];

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      p={4}
      _hover={{ borderColor: "whiteAlpha.200" }}
      transition="border-color 0.15s"
    >
      <Text fontSize="sm" fontWeight="bold" color="text.primary" mb={2}>
        {official.name}
      </Text>
      <Flex gap={2} mb={3} flexWrap="wrap">
        {confs.map((c) => (
          <Box
            key={c}
            px={2}
            py="1px"
            borderRadius="full"
            fontSize="9px"
            fontWeight="black"
            letterSpacing="widest"
            textTransform="uppercase"
            color="white"
            bg={CONF_BG[c] ?? "whiteAlpha.300"}
          >
            {CONF_LABELS[c] ?? c.toUpperCase()}
          </Box>
        ))}
      </Flex>
      {partners.length > 0 && (
        <Box>
          <Text
            fontSize="9px"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
            mb={1}
          >
            Frequent partners
          </Text>
          {partners.map((p) => (
            <Text key={p.person_id} fontSize="xs" color="text.secondary">
              {p.name}
              <Box as="span" color="text.muted">
                {" "}
                · {p.games_together}g
              </Box>
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ─── Crew card ────────────────────────────────────────────────────────────────
const CrewCard = ({ crew, officialsById }) => {
  const sorted = [...crew.officials].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  // Derive a readable game label from crew_id like "meachuswacfamu2025"
  const gameLabel = crew.game_id?.replace(/(\d{4})$/, " '$1") ?? crew.crew_id;

  return (
    <Box
      bg="bg.secondary"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="lg"
      p={4}
    >
      <Text
        fontSize="xs"
        color="brand.400"
        fontWeight="bold"
        letterSpacing="widest"
        textTransform="uppercase"
        mb={3}
      >
        {gameLabel}
      </Text>
      <Flex direction="column" gap={2}>
        {sorted.map((slot) => {
          const off = officialsById[slot.person_id];
          return (
            <Flex key={slot.person_id} align="center" gap={2}>
              <Box
                w={7}
                h={7}
                borderRadius="md"
                bg="whiteAlpha.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="9px"
                fontWeight="black"
                color="text.muted"
                flexShrink={0}
              >
                {ROLE_SHORT[slot.role] ?? "?"}
              </Box>
              <Box flex={1} minW={0}>
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color="text.primary"
                  lineClamp={1}
                >
                  {off?.name ?? slot.person_id}
                </Text>
                <Text fontSize="10px" color="text.muted">
                  {slot.role}
                </Text>
              </Box>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

// ─── Roster tab ───────────────────────────────────────────────────────────────
const RosterTab = ({ officials }) => {
  const [conf, setConf] = useState("all");

  const meacCount = officials.filter((o) =>
    o.conference_affiliations?.includes("meac"),
  ).length;
  const swacCount = officials.filter((o) =>
    o.conference_affiliations?.includes("swac"),
  ).length;

  const filtered =
    conf === "all"
      ? officials
      : officials.filter((o) => o.conference_affiliations?.includes(conf));

  return (
    <>
      <Flex gap={2} mb={6} flexWrap="wrap">
        <FilterChip active={conf === "all"} onClick={() => setConf("all")}>
          All ({officials.length})
        </FilterChip>
        <FilterChip active={conf === "swac"} onClick={() => setConf("swac")}>
          SWAC ({swacCount})
        </FilterChip>
        <FilterChip active={conf === "meac"} onClick={() => setConf("meac")}>
          MEAC ({meacCount})
        </FilterChip>
      </Flex>
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2,1fr)",
          md: "repeat(3,1fr)",
          lg: "repeat(4,1fr)",
        }}
        gap={3}
      >
        {filtered.map((o) => (
          <OfficialCard key={o.person_id} official={o} />
        ))}
      </Grid>
    </>
  );
};

// ─── Crews tab ────────────────────────────────────────────────────────────────
const CrewsTab = ({ crews, officialsById, analyticsSummary }) => (
  <>
    {analyticsSummary && (
      <Flex gap={6} mb={6} flexWrap="wrap">
        {[
          { label: "Total Crews", value: analyticsSummary.total_crews },
          { label: "Avg Crew Size", value: analyticsSummary.average_crew_size },
          { label: "Partnerships", value: analyticsSummary.total_partnerships },
          {
            label: "Geo Coverage",
            value: analyticsSummary.geographic_coverage,
          },
        ].map(({ label, value }) => (
          <Box
            key={label}
            bg="bg.secondary"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="lg"
            px={4}
            py={3}
          >
            <Text fontSize="xl" fontWeight="black" color="text.primary">
              {value}
            </Text>
            <Text fontSize="xs" color="text.muted">
              {label}
            </Text>
          </Box>
        ))}
      </Flex>
    )}
    <Grid
      templateColumns={{
        base: "1fr",
        sm: "repeat(2,1fr)",
        lg: "repeat(3,1fr)",
      }}
      gap={4}
    >
      {crews.map((crew) => (
        <CrewCard
          key={crew.crew_id}
          crew={crew}
          officialsById={officialsById}
        />
      ))}
    </Grid>
  </>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const OfficialsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "roster";
  
  const { officials, isLoading: offLoading } = useAllOfficials();
  const { crews, analyticsSummary, isLoading: crewLoading } = useAllCrews();

  const isLoading = offLoading || crewLoading;

  // Index officials by person_id for crew lookups
  const officialsById = officials.reduce((acc, o) => {
    acc[o.person_id] = o;
    return acc;
  }, {});

  return (
    <Box pt="var(--app-header-height)" minH="100vh" bg="bg.primary">

      <Box px={{ md: "4px", lg: "10px" }} pt={{ md: "4px", lg: "10px" }}>
        <Box h="clamp(160px, 20vw, 260px)">
          <BannerOfficialsHub />
        </Box>
      </Box>
      <ContentContainer py={10}>
        {/* Header */}
        <Flex align="center" gap={3} mb={2}>
          <Shield size={20} color="var(--chakra-colors-brand-500)" />
          <Text
            fontSize="xs"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="widest"
          >
            2025 Season
          </Text>
        </Flex>
        <Text fontSize="3xl" fontWeight="black" color="text.primary" mb={1}>
          Officials
        </Text>
        <Text fontSize="sm" color="text.secondary" mb={6}>
          {officials.length} officials · {crews.length} game crews · MEAC &amp;
          SWAC
        </Text>

        {/* Tabs */}
        <Flex
          gap={6}
          mb={8}
          borderBottom="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Tab
            active={activeTab === "roster"}
            onClick={() => setSearchParams({ tab: "roster" })}
          >
            <Flex align="center" gap={2}>
              <Users size={14} />
              Roster
            </Flex>
          </Tab>
          <Tab
            active={activeTab === "crews"}
            onClick={() => setSearchParams({ tab: "crews" })}
          >
            <Flex align="center" gap={2}>
              <Shield size={14} />
              Crews
            </Flex>
          </Tab>
        </Flex>

        {isLoading && (
          <Flex justify="center" py={16}>
            <Spinner color="brand.500" size="lg" />
          </Flex>
        )}

        {!isLoading && activeTab === "roster" && (
          <RosterTab officials={officials} />
        )}

        {!isLoading && activeTab === "crews" && (
          <CrewsTab
            crews={crews}
            officialsById={officialsById}
            analyticsSummary={analyticsSummary}
          />
        )}
      </ContentContainer>
    </Box>
  );
};

export default OfficialsPage;
