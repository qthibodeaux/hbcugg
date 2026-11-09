import { useState } from "react";
import { Flex, Grid, Box, Text } from "@chakra-ui/react";
import { FilterChip } from "../../molecules/officials/OfficialsControls";
import { OfficialCard, CrewCard } from "../../molecules/officials/OfficialsCards";

// Officials roster filtering and crew-summary views; data queries stay in the page.

export const RosterTab = ({ officials }) => {
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

export const CrewsTab = ({ crews, officialsById, analyticsSummary }) => (
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
