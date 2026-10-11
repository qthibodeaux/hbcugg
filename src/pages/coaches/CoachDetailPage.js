import { useMemo } from "react";
import { Box, Text, Flex, Button, Link, Spinner, Image, Grid, Badge } from "@chakra-ui/react";
import { ArrowLeft, ArrowRight, TrendingUp, RefreshCw, MoveRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ContentContainer from "../../components/layouts/ContentContainer";
import { useCoachCareer } from "../../hooks/useSWACData";
import teamsData from "../../data/teams.json";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEAM_DISPLAY = teamsData.teams.reduce((acc, t) => {
  const v5Id = t.exportId.replace(/25$/, "");
  acc[v5Id] = { name: t.name, shortName: t.shortName };
  return acc;
}, {});
TEAM_DISPLAY["meacnsuc"] = { name: "Norfolk State", shortName: "NSU" };

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

const isCoordinator = (title = "") => /coordinator/i.test(title);

const roleTier = (title = "") => {
  if (isHeadCoach(title)) return "hc";
  if (isCoordinator(title)) return "coord";
  return "staff";
};

const MOVEMENT_META = {
  promotion_external:  { label: "Promoted",        color: "green.400",  Icon: TrendingUp },
  promotion_internal:  { label: "Promoted",         color: "green.400",  Icon: TrendingUp },
  lateral_external:    { label: "Lateral Move",     color: "yellow.400", Icon: MoveRight },
  lateral_internal:    { label: "Same Role",        color: "text.muted", Icon: null },
  demotion_external:   { label: "Role Change",      color: "orange.400", Icon: RefreshCw },
  demotion_internal:   { label: "Role Change",      color: "orange.400", Icon: RefreshCw },
  role_change_internal:{ label: "Role Change",      color: "brand.400",  Icon: RefreshCw },
  role_change_external:{ label: "Role Change",      color: "brand.400",  Icon: RefreshCw },
  return_after_gap:    { label: "Returned",         color: "purple.400", Icon: RefreshCw },
};

// ─── Movement event row ───────────────────────────────────────────────────────

const MovementRow = ({ move }) => {
  const meta = MOVEMENT_META[move.movement_type] ?? { label: move.movement_type, color: "text.muted", Icon: null };
  const fromTeam = TEAM_DISPLAY[move.from_team_id]?.shortName ?? move.from_team_id;
  const toTeam   = TEAM_DISPLAY[move.to_team_id]?.shortName   ?? move.to_team_id;
  const teamChanged  = move.team_changed;
  const titleChanged = move.title_changed;

  // Skip pure lateral-internal rows (no-change years) — too noisy
  if (move.movement_type === "lateral_internal") return null;

  return (
    <Flex
      align="flex-start"
      gap={3}
      py={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      _last={{ borderBottom: "none" }}
    >
      {/* Year marker */}
      <Box
        flexShrink={0}
        w={10}
        textAlign="center"
        pt="2px"
      >
        <Text fontSize="xs" fontWeight="black" color={meta.color}>
          '{String(move.to_season).slice(2)}
        </Text>
      </Box>

      {/* Content */}
      <Box flex={1} minW={0}>
        <Flex align="center" gap={2} mb="2px" flexWrap="wrap">
          <Box
            display="inline-flex" alignItems="center" gap={1}
            px={2} py="2px" borderRadius="full" fontSize="9px"
            fontWeight="bold" border="1px solid" borderColor={meta.color}
            color={meta.color} textTransform="uppercase" letterSpacing="wide"
          >
            {meta.label}
          </Box>
          {teamChanged && (
            <Flex align="center" gap={1}>
              <Text fontSize="xs" color="text.muted">{fromTeam}</Text>
              <ArrowRight size={10} color="var(--chakra-colors-brand-500)" />
              <Text fontSize="xs" color="brand.400" fontWeight="semibold">{toTeam}</Text>
            </Flex>
          )}
        </Flex>
        {titleChanged && (
          <Flex align="center" gap={1} flexWrap="wrap">
            <Text fontSize="xs" color="text.muted" lineClamp={1}>{move.from_title}</Text>
            <ArrowRight size={9} color="var(--chakra-colors-text-muted)" />
            <Text fontSize="xs" color="text.primary" fontWeight="medium" lineClamp={1}>{move.to_title}</Text>
          </Flex>
        )}
        {!titleChanged && (
          <Text fontSize="xs" color="text.secondary" lineClamp={1}>{move.to_title}</Text>
        )}
      </Box>
    </Flex>
  );
};

// ─── Season timeline row ──────────────────────────────────────────────────────

const SeasonRow = ({ entry, isLatest }) => {
  const tier = roleTier(entry.title);
  const teamName = TEAM_DISPLAY[entry.team_id]?.name ?? entry.team_id;
  const dotColor = tier === "hc" ? "brand.500" : tier === "coord" ? "purple.400" : "whiteAlpha.300";

  return (
    <Flex align="flex-start" gap={3}>
      {/* Timeline spine */}
      <Flex direction="column" align="center" flexShrink={0}>
        <Box
          w={2} h={2} borderRadius="full" mt="5px"
          bg={isLatest ? "brand.500" : dotColor}
          flexShrink={0}
        />
        {!isLatest && <Box w="1px" flex={1} bg="whiteAlpha.100" mt={1} minH={6} />}
      </Flex>

      {/* Content */}
      <Box pb={4} flex={1} minW={0}>
        <Flex align="center" gap={2} mb="2px" flexWrap="wrap">
          <Text fontSize="xs" fontWeight="black" color={isLatest ? "brand.400" : "text.muted"}>
            {entry.season}
          </Text>
          {tier === "hc" && (
            <Box px={2} py="1px" borderRadius="full" bg="brand.500" fontSize="9px" fontWeight="black" color="white">
              HC
            </Box>
          )}
          {tier === "coord" && (
            <Box px={2} py="1px" borderRadius="full" bg="whiteAlpha.200" fontSize="9px" fontWeight="bold" color="text.secondary">
              COORD
            </Box>
          )}
        </Flex>
        <Text fontSize="sm" fontWeight="semibold" color={isLatest ? "text.primary" : "text.secondary"} lineClamp={2}>
          {entry.title}
        </Text>
        <Text fontSize="xs" color="text.muted">{teamName}</Text>
      </Box>
    </Flex>
  );
};

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
