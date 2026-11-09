import { useSearchParams } from "react-router-dom";
import { useAllOfficials, useAllCrews } from "../../hooks/useSWACData";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { BannerOfficialsHub } from "../../components/molecules/banners/DirectoryHubBanners";
import ContentContainer from "../../components/layouts/ContentContainer";
import { Shield, Users } from "lucide-react";
import { Tab } from "../../components/molecules/officials/OfficialsControls";
import { RosterTab, CrewsTab } from "../../components/organisms/officials/OfficialsViews";

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
