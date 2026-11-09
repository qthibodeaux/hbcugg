import { useNavigate } from "react-router-dom";
import { useTeamCoachesByYear } from "../../../hooks/useSWACData";
import { Flex, Spinner, Box, Text, Grid, Badge } from "@chakra-ui/react";
import { isHeadCoach, isCoordinator, getYearsActive } from "./coaches/coachStaffModel";
import { HeadCoachSpotlight } from "./coaches/HeadCoachSpotlight";
import { IntelStatCard, StaffCard } from "./coaches/StaffCards";

const CoachesTab = ({ team, year = 2025 }) => {
  const navigate = useNavigate();
  const { coaches, isLoading } = useTeamCoachesByYear(team?.exportId, year);

  if (isLoading) {
    return (
      <Flex justify="center" py={16}>
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  const hcList = coaches.filter((c) => isHeadCoach(c.title));
  const coordList = coaches.filter((c) => !isHeadCoach(c.title) && isCoordinator(c.title));
  const positionList = coaches.filter((c) => !isHeadCoach(c.title) && !isCoordinator(c.title));
  const hcCoach = hcList[0] || null;
  const totalStaff = hcList.length + coordList.length + positionList.length;
  const prevYear = year - 1;
  const returningStaff = coaches.filter((c) => getYearsActive(c).includes(prevYear)).length;
  const stabilityPercent = totalStaff ? Math.round((returningStaff / totalStaff) * 100) : 0;
  const accent = team?.colors?.primary || "#E53E3E";
  const hcTenureYears = hcCoach ? Math.max(1, getYearsActive(hcCoach).length) : 0;

  if (!totalStaff) {
    return (
      <Box py={16} textAlign="center">
        <Text fontSize="sm" color="text.muted">
          No coaching staff data for {year}.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        position="relative"
        overflow="hidden"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        bg="linear-gradient(180deg, rgba(8,12,24,0.96) 0%, rgba(5,8,18,0.98) 100%)"
        p={{ base: 4, md: 6 }}
        mb={6}
      >
        <Text
          position="absolute"
          right={{ base: 3, md: 6 }}
          top={{ base: 2, md: 0 }}
          fontSize={{ base: "56px", md: "120px" }}
          fontWeight="black"
          color="whiteAlpha.50"
          lineHeight={0.95}
          pointerEvents="none"
        >
          STAFF
        </Text>

        <Box position="relative" zIndex={1} maxW="780px">
          <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.16em" mb={1}>
            Program Intel System
          </Text>
          <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="black" color="white" lineHeight={1} textTransform="uppercase">
            Staff Intelligence Lab
          </Text>
          <Text mt={2} color="whiteAlpha.700" fontSize={{ base: "sm", md: "md" }}>
            Telemetry-driven overview of the {team?.name || "team"} football operational core.
          </Text>
          <Text mt={3} fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em">
            Season {year} • {totalStaff} staff members
          </Text>
        </Box>
      </Box>

      <Grid templateColumns={{ base: "1fr", xl: "1.35fr 1fr" }} gap={4} mb={7}>
        {hcCoach ? (
          <HeadCoachSpotlight 
            coach={hcCoach} 
            accent={accent}
            onClick={() => navigate(`/coaches/${hcCoach.person_id}`)}
          />
        ) : (
          <Box
            borderRadius="xl"
            border="1px solid"
            borderColor="whiteAlpha.100"
            bg="bg.secondary"
            p={6}
            minH="300px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="text.muted">Head coach profile unavailable.</Text>
          </Box>
        )}

        <Grid templateColumns={{ base: "1fr 1fr", md: "1fr 1fr" }} gap={3}>
          <IntelStatCard label="HC Tenure" value={hcTenureYears ? `${hcTenureYears}Y` : "--"} tone={accent} />
          <IntelStatCard label="Staff Size" value={String(totalStaff)} />
          <IntelStatCard label="Coordinators" value={String(coordList.length)} />
          <IntelStatCard label="Stability" value={`${stabilityPercent}%`} tone="#F6E05E" />
        </Grid>
      </Grid>

      {coordList.length > 0 && (
        <Box mb={6}>
          <Flex justify="space-between" align="center" mb={3} wrap="wrap" gap={2}>
            <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.14em">
              Command Hierarchy
            </Text>
            <Badge colorScheme="green" variant="subtle" px={2} py={1}>
              Deployment Active
            </Badge>
          </Flex>

          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
            Coordinators
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2,1fr)",
              md: "repeat(3,1fr)",
            }}
            gap={3}
          >
            {coordList.map((c) => (
              <StaffCard 
                key={c.person_id} 
                coach={c} 
                badgeLabel="Coordinator" 
                accent={accent}
                onClick={() => navigate(`/coaches/${c.person_id}`)}
              />
            ))}
          </Grid>
        </Box>
      )}

      {positionList.length > 0 && (
        <Box>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={2}>
            Position Staff
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(2,1fr)",
              md: "repeat(3,1fr)",
              lg: "repeat(4,1fr)",
            }}
            gap={3}
          >
            {positionList.map((c) => (
              <StaffCard 
                key={c.person_id} 
                coach={c} 
                badgeLabel="Position" 
                accent={accent}
                onClick={() => navigate(`/coaches/${c.person_id}`)}
              />
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default CoachesTab;
