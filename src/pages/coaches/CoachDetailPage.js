import { useParams, useNavigate } from "react-router-dom";
import { useCoachCareer } from "../../hooks/useSWACData";
import { useMemo } from "react";
import { Box, Flex, Spinner, Button, Text, Grid, Image, Badge, Link } from "@chakra-ui/react";
import ContentContainer from "../../components/layouts/ContentContainer";
import { ArrowLeft } from "lucide-react";
import { roleTier, getInitials } from "./career/coachCareerModel";
import { SeasonRow, MovementRow } from "./career/CareerTimeline";



// ─── Page ─────────────────────────────────────────────────────────────────────

const CoachDetailPage = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const { seasons, movements, latest, isLoading } = useCoachCareer(coachId);

  // Notable movements (excluding no-change lateral_internal)
  const notableMovements = useMemo(
    () => movements.filter((m) => m.movement_type !== "lateral_internal"),
    [movements]
  );

  // Career summary stats
  const firstSeason = seasons[0]?.season;
  const lastSeason  = seasons[seasons.length - 1]?.season;
  const uniqueTeams = [...new Set(seasons.map((s) => s.team_id))];
  const promotions  = movements.filter((m) =>
    m.movement_type === "promotion_external" || m.movement_type === "promotion_internal"
  );

  if (isLoading) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <ContentContainer py={8}>
          <Flex justify="center" align="center" minH="400px">
            <Spinner color="brand.500" size="lg" />
          </Flex>
        </ContentContainer>
      </Box>
    );
  }

  if (!latest) {
    return (
      <Box pt="80px" minH="100vh" bg="bg.primary">
        <ContentContainer py={8}>
          <Button
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/coaches")}
            mb={6} variant="ghost" size="sm"
          >
            Back to Coaches
          </Button>
          <Text fontSize="lg" color="text.muted">Coach not found.</Text>
        </ContentContainer>
      </Box>
    );
  }

  const tier = roleTier(latest.title);

  return (
    <Box pt="80px" minH="100vh" bg="bg.primary">

      <ContentContainer py={8}>

        {/* Back */}
        <Button
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          mb={6} variant="ghost" size="sm"
          color="text.secondary" _hover={{ color: "text.primary" }}
        >
          Back
        </Button>

        {/* Hero */}
        <Grid id="coach-overview" templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8} mb={8}>

          {/* Photo */}
          <Box
            borderRadius="xl" overflow="hidden"
            border="1px solid" borderColor="whiteAlpha.200"
            bg="whiteAlpha.50" minH={{ base: "280px", md: "380px" }}
          >
            {latest.image_url ? (
              <Image
                src={latest.image_url} alt={latest.full_name}
                w="100%" h="100%" objectFit="cover" referrerPolicy="no-referrer"
              />
            ) : (
              <Flex w="100%" h="100%" align="center" justify="center" bg="gray.800" minH="280px">
                <Text fontSize="7xl" fontWeight="black" color="whiteAlpha.400">
                  {getInitials(latest.full_name)}
                </Text>
              </Flex>
            )}
          </Box>

          {/* Info */}
          <Box>
            <Badge
              mb={4}
              colorScheme={tier === "hc" ? "red" : tier === "coord" ? "purple" : "gray"}
              variant="subtle" px={3} py={1}
            >
              {tier === "hc" ? "HEAD COACH" : tier === "coord" ? "COORDINATOR" : "POSITION STAFF"}
            </Badge>

            <Text
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="black" color="white"
              textTransform="uppercase" lineHeight={0.95}
              letterSpacing="-0.02em" mb={3}
            >
              {latest.full_name}
            </Text>

            <Text fontSize={{ base: "lg", md: "xl" }} color="brand.500" fontWeight="semibold" mb={6}>
              {latest.title}
            </Text>

            {/* Stats row */}
            <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={6}>
              <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" borderRadius="lg" p={3}>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Seasons</Text>
                <Text fontSize="2xl" fontWeight="black" color="white">{seasons.length}</Text>
              </Box>
              <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" borderRadius="lg" p={3}>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Programs</Text>
                <Text fontSize="2xl" fontWeight="black" color="white">{uniqueTeams.length}</Text>
              </Box>
              <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" borderRadius="lg" p={3}>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">Promotions</Text>
                <Text fontSize="2xl" fontWeight="black" color={promotions.length > 0 ? "green.400" : "white"}>
                  {promotions.length}
                </Text>
              </Box>
            </Grid>

            {/* Tenure span */}
            {firstSeason && (
              <Box bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200" borderRadius="lg" p={3} mb={6}>
                <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="0.1em" mb={1}>
                  Tenure Span
                </Text>
                <Text fontSize="lg" fontWeight="bold" color="text.primary">
                  {firstSeason === lastSeason ? firstSeason : `${firstSeason} – ${lastSeason}`}
                </Text>
              </Box>
            )}

            {latest.bio_url && (
              <Button
                as={Link} href={latest.bio_url} isExternal
                bg="brand.500" color="white" _hover={{ opacity: 0.9 }}
                borderRadius="lg" w="100%" fontSize="sm" fontWeight="bold"
              >
                View Full Bio
              </Button>
            )}
          </Box>
        </Grid>

        {/* Career arc + movements */}
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>

          {/* Season timeline */}
          <Box
            id="coach-season-log"
            bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200"
            borderRadius="xl" p={6}
          >
            <Text
              fontSize="xs" color="text.muted" textTransform="uppercase"
              letterSpacing="0.1em" mb={5}
            >
              Season Log
            </Text>
            {seasons.map((s, i) => (
              <SeasonRow key={s.season} entry={s} isLatest={i === seasons.length - 1} />
            ))}
          </Box>

          {/* Movement events */}
          <Box
            id="coach-career-events"
            bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200"
            borderRadius="xl" p={6}
          >
            <Text
              fontSize="xs" color="text.muted" textTransform="uppercase"
              letterSpacing="0.1em" mb={5}
            >
              Career Events
            </Text>
            {notableMovements.length === 0 ? (
              <Text fontSize="sm" color="text.muted">No notable movements tracked.</Text>
            ) : (
              notableMovements.map((m, i) => <MovementRow key={i} move={m} />)
            )}
          </Box>

        </Grid>

      </ContentContainer>
    </Box>
  );
};

export default CoachDetailPage;
