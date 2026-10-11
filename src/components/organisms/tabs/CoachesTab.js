import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTeamCoachesByYear } from "../../../hooks/useSWACData";

const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

const isCoordinator = (title = "") => /coordinator/i.test(title);

const getDisplayName = (coach) => coach.full_name ?? coach.name ?? "Unknown Coach";

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const getYearsActive = (coach) => (Array.isArray(coach?.years_active) ? coach.years_active : []);

const HeadCoachSpotlight = ({ coach, accent, onClick }) => {
  const displayName = getDisplayName(coach);
  const tenureYears = Math.max(1, getYearsActive(coach).length);

  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.200"
      minH={{ base: "360px", lg: "420px" }}
      bg="black"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.2s ease"
      _hover={onClick ? { borderColor: accent, boxShadow: `0 0 20px ${accent}20` } : {}}
      onClick={onClick}
    >
      {coach?.image_url ? (
        <Image
          src={coach.image_url}
          alt={displayName}
          position="absolute"
          inset={0}
          w="100%"
          h="100%"
          objectFit="cover"
          objectPosition="top"
          referrerPolicy="no-referrer"
        />
      ) : (
        <Flex
          position="absolute"
          inset={0}
          align="center"
          justify="center"
          bg="gray.800"
        >
          <Text fontSize="7xl" fontWeight="black" color="whiteAlpha.400">
            {getInitials(displayName)}
          </Text>
        </Flex>
      )}

      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(180deg, rgba(4,8,20,0.35) 20%, rgba(4,8,20,0.96) 78%)"
      />

      <Box
        position="absolute"
        top={4}
        left={4}
        bg="blackAlpha.700"
        border="1px solid"
        borderColor="whiteAlpha.300"
        px={3}
        py={1}
        borderRadius="full"
      >
        <Text fontSize="10px" color="whiteAlpha.900" letterSpacing="0.12em" fontWeight="bold" textTransform="uppercase">
          Operational Lead
        </Text>
      </Box>

      <Box
        position="relative"
        zIndex={1}
        h="100%"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        p={{ base: 4, md: 5 }}
      >
        <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.1em" mb={1}>
          Head Coach
        </Text>
        <Text
          fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
          fontWeight="black"
          color="white"
          textTransform="uppercase"
          lineHeight={0.95}
          letterSpacing="-0.02em"
          mb={3}
        >
          {displayName}
        </Text>

        {/* Record Callout Box */}
        <Box
          bg="linear-gradient(135deg, rgba(229,62,62,0.15) 0%, rgba(229,62,62,0.08) 100%)"
          border="2px solid"
          borderColor={accent}
          borderRadius="lg"
          px={3}
          py={2}
          mb={4}
        >
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={accent}
            fontFamily="'Courier New', monospace"
            fontWeight="bold"
            letterSpacing="0.08em"
          >
            {tenureYears} YEARS LEADING PROGRAM
          </Text>
        </Box>

        <Text color={accent} fontWeight="semibold" textTransform="uppercase" fontSize="sm" mb={4}>
          {coach?.title || "Head Coach"}
        </Text>

        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Badge colorScheme="orange" variant="subtle" px={3} py={1}>
            {tenureYears} YR{tenureYears > 1 ? "S" : ""} ACTIVE
          </Badge>

          {coach?.bio_url && (
            <Button
              as={Link}
              href={coach.bio_url}
              isExternal
              size="sm"
              bg={accent}
              color="white"
              _hover={{ opacity: 0.9 }}
              borderRadius="md"
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              View Full Profile
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

const IntelStatCard = ({ label, value, tone = "white" }) => (
  <Box
    bg="linear-gradient(180deg, rgba(14,20,40,0.95) 0%, rgba(9,14,28,0.95) 100%)"
    border="1px solid"
    borderColor="whiteAlpha.200"
    borderRadius="lg"
    p={4}
    minH="132px"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em" fontWeight="bold">
      {label}
    </Text>
    <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color={tone} lineHeight={1}>
      {value}
    </Text>
  </Box>
);

const StaffCard = ({ coach, badgeLabel, accent, onClick }) => {
  const displayName = getDisplayName(coach);
  const tenureYears = Math.max(1, getYearsActive(coach).length);

  return (
    <Box
      bg="linear-gradient(160deg, rgba(15,24,48,0.96) 0%, rgba(10,16,33,0.96) 100%)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="lg"
      p={3}
      position="relative"
      cursor={onClick ? "pointer" : "default"}
      transition="all 0.2s ease"
      _hover={onClick ? { borderColor: accent, bg: "linear-gradient(160deg, rgba(15,24,48,0.98) 0%, rgba(10,16,33,0.98) 100%)" } : {}}
      onClick={onClick}
    >
      <Box position="absolute" top={2} right={2}>
        <Badge variant="subtle" colorScheme="purple" fontSize="9px" textTransform="uppercase" letterSpacing="0.08em">
          {badgeLabel}
        </Badge>
      </Box>

      <Flex align="center" gap={3} mb={2} pr={16}>
        <Box
          w="46px"
          h="46px"
          borderRadius="md"
          overflow="hidden"
          bg="whiteAlpha.100"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {coach.image_url ? (
            <Image
              src={coach.image_url}
              alt={displayName}
              w="100%"
              h="100%"
              objectFit="cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Text fontSize="xs" fontWeight="bold" color="text.muted">
              {getInitials(displayName)}
            </Text>
          )}
        </Box>
        <Box minW={0}>
          <Text fontSize="sm" fontWeight="bold" color="text.primary" lineClamp={1}>
            {displayName}
          </Text>
          <Text fontSize="xs" color={accent} lineHeight="short" lineClamp={2}>
            {coach.title}
          </Text>
        </Box>
      </Flex>

      <Flex justify="space-between" align="center" mt={2}>
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.08em">
          Tenure
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="text.primary">
          {tenureYears} yr{tenureYears > 1 ? "s" : ""}
        </Text>
      </Flex>
    </Box>
  );
};

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
