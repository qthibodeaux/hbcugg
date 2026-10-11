import {
  Badge,
  Box,
  Flex,
  Grid,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useTeamCoachesByYear } from "../../../hooks/useSWACData";

const VARIANT_PRESETS = {
  tactical: {
    label: "Style A - Tactical Grid",
    shellBg: "bg.primary",
    shellBorder: "whiteAlpha.100",
    heroCols: { base: "1fr", md: "1.2fr 1fr" },
    heroOverlay: "linear-gradient(180deg, rgba(4,8,20,0.28) 20%, rgba(4,8,20,0.94) 76%)",
    heroSideBg: "linear-gradient(180deg, rgba(8,12,24,0.96) 0%, rgba(5,8,18,0.98) 100%)",
    panelBg: "linear-gradient(180deg, rgba(14,20,40,0.95) 0%, rgba(9,14,28,0.95) 100%)",
    accentTone: "#F6AD55",
  },
  broadcast: {
    label: "Style B - Broadcast Deck",
    shellBg: "linear-gradient(180deg, rgba(10,10,18,0.98) 0%, rgba(7,7,14,0.98) 100%)",
    shellBorder: "whiteAlpha.200",
    heroCols: { base: "1fr", md: "1fr 1.3fr" },
    heroOverlay: "linear-gradient(110deg, rgba(2,8,20,0.92) 30%, rgba(2,8,20,0.50) 75%)",
    heroSideBg: "linear-gradient(145deg, rgba(23,18,18,0.95) 0%, rgba(13,10,26,0.95) 100%)",
    panelBg: "linear-gradient(180deg, rgba(31,17,22,0.95) 0%, rgba(16,12,27,0.95) 100%)",
    accentTone: "#FC8181",
  },
  archive: {
    label: "Style C - Film Room",
    shellBg: "linear-gradient(180deg, rgba(11,16,17,0.98) 0%, rgba(8,11,12,0.98) 100%)",
    shellBorder: "whiteAlpha.300",
    heroCols: { base: "1fr", md: "1fr 1fr" },
    heroOverlay: "linear-gradient(180deg, rgba(6,14,12,0.35) 10%, rgba(6,14,12,0.94) 84%)",
    heroSideBg: "linear-gradient(180deg, rgba(13,28,26,0.96) 0%, rgba(8,16,15,0.98) 100%)",
    panelBg: "linear-gradient(180deg, rgba(17,31,30,0.95) 0%, rgba(10,18,18,0.95) 100%)",
    accentTone: "#68D391",
  },
};

const isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

const isCoordinator = (title = "") => /coordinator/i.test(title);

const getDisplayName = (coach) => coach?.full_name || coach?.name || "Unknown Coach";

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const getYearsActive = (coach) => (Array.isArray(coach?.years_active) ? coach.years_active : []);

const CoachAvatar = ({ coach, size = "42px" }) => {
  const name = getDisplayName(coach);

  return (
    <Box
      w={size}
      h={size}
      borderRadius="md"
      overflow="hidden"
      bg="whiteAlpha.100"
      border="1px solid"
      borderColor="whiteAlpha.200"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      {coach?.image_url ? (
        <Image src={coach.image_url} alt={name} w="100%" h="100%" objectFit="cover" objectPosition="top" />
      ) : (
        <Text fontSize="xs" fontWeight="black" color="whiteAlpha.700">
          {getInitials(name)}
        </Text>
      )}
    </Box>
  );
};

const ProfileHero = ({ team, coach, accent, preset, variant }) => {
  const name = getDisplayName(coach);
  const isBroadcast = variant === "broadcast";

  return (
    <Grid templateColumns={preset.heroCols} gap={3}>
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        minH={{ base: "260px", md: "300px" }}
        bg="black"
      >
        {coach?.image_url ? (
          <Image
            src={coach.image_url}
            alt={name}
            position="absolute"
            inset={0}
            w="100%"
            h="100%"
            objectFit="cover"
            objectPosition="top"
          />
        ) : (
          <Flex position="absolute" inset={0} align="center" justify="center" bg="gray.800">
            <Text fontSize="7xl" fontWeight="black" color="whiteAlpha.400">
              {getInitials(name)}
            </Text>
          </Flex>
        )}

        <Box
          position="absolute"
          inset={0}
          bg={preset.heroOverlay}
        />

        <Box position="relative" zIndex={1} h="100%" display="flex" flexDirection="column" justifyContent="space-between" p={4}>
          <Flex gap={2} wrap="wrap">
            <Badge colorScheme="red" variant="subtle">{team?.conference || "HBCU"}</Badge>
            <Badge colorScheme="yellow" variant="subtle">{preset.label}</Badge>
          </Flex>

          <Box>
            <Text fontSize="xs" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="0.1em">
              Operational Lead
            </Text>
            <Text
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="black"
              color="white"
              textTransform="uppercase"
              lineHeight={1.05}
            >
              {name}
            </Text>
            <Text color={isBroadcast ? "#F6E05E" : accent} fontWeight="semibold" textTransform="uppercase" fontSize="sm">
              {coach?.title || "Head Coach"}
            </Text>
          </Box>
        </Box>
      </Box>

      <Box
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        bg={preset.heroSideBg}
        p={4}
      >
        <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.12em" mb={1}>
          Current Standing
        </Text>
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="white" lineHeight={1}>
          17-6
        </Text>
        <Text fontSize="xs" color="whiteAlpha.600" mt={1}>Lab placeholder record card</Text>

        <Box mt={6} p={3} borderRadius="md" bg="blackAlpha.300" border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.08em" mb={2}>
            Photo Placement
          </Text>
          <Flex align="center" gap={2}>
            <CoachAvatar coach={coach} size="38px" />
            <Text fontSize="xs" color="whiteAlpha.800">Secondary avatar used in tree nodes and stat cards</Text>
          </Flex>
        </Box>
      </Box>
    </Grid>
  );
};

const StatPanel = ({ label, value, tone = "white", panelBg }) => (
  <Box
    border="1px solid"
    borderColor="whiteAlpha.200"
    borderRadius="lg"
    bg={panelBg}
    p={4}
    minH="124px"
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
  >
    <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em" fontWeight="bold">
      {label}
    </Text>
    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="black" color={tone}>
      {value}
    </Text>
  </Box>
);

const CoachingTreePanel = ({ headCoach, coordinators = [], panelBg }) => (
  <Box border="1px solid" borderColor="whiteAlpha.200" borderRadius="lg" bg={panelBg} p={4}>
    <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
      Coaching Tree
    </Text>

    <Flex align="center" gap={2} p={2} borderRadius="md" bg="whiteAlpha.100" mb={3}>
      <CoachAvatar coach={headCoach} size="36px" />
      <Box>
        <Text fontSize="sm" color="white" fontWeight="bold">{getDisplayName(headCoach)}</Text>
        <Text fontSize="10px" color="whiteAlpha.600">Lead Node</Text>
      </Box>
    </Flex>

    <Grid gap={2}>
      {coordinators.slice(0, 3).map((coach) => (
        <Flex key={coach.person_id || getDisplayName(coach)} align="center" gap={2} p={2} borderRadius="md" bg="blackAlpha.200">
          <CoachAvatar coach={coach} size="30px" />
          <Box minW={0}>
            <Text fontSize="xs" color="whiteAlpha.900" lineClamp={1}>{getDisplayName(coach)}</Text>
            <Text fontSize="10px" color="whiteAlpha.600" lineClamp={1}>{coach.title || "Coordinator"}</Text>
          </Box>
        </Flex>
      ))}
    </Grid>
  </Box>
);

const RecruitingPanel = ({ composition, panelBg }) => {
  const rows = [
    { label: "Head Coach", value: composition.headPct, color: "#FC8181" },
    { label: "Coordinators", value: composition.coordPct, color: "#F6E05E" },
    { label: "Position Staff", value: composition.positionPct, color: "#63B3ED" },
  ];

  return (
    <Box border="1px solid" borderColor="whiteAlpha.200" borderRadius="lg" bg={panelBg} p={4}>
      <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.1em" mb={3}>
        Staff Composition Footprint
      </Text>

      <Grid gap={3}>
        {rows.map((row) => (
          <Box key={row.label}>
            <Flex justify="space-between" mb={1}>
              <Text fontSize="xs" color="whiteAlpha.800">{row.label}</Text>
              <Text fontSize="xs" color="white" fontWeight="bold">{row.value}%</Text>
            </Flex>
            <Box h="6px" borderRadius="full" bg="whiteAlpha.200" overflow="hidden">
              <Box
                h="100%"
                w={`${Math.max(0, Math.min(100, row.value))}%`}
                bg={row.color}
                transition="width 0.3s ease"
              />
            </Box>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

const CoachProfileLab = ({ team, year = 2025, variant = "tactical" }) => {
  const { coaches, isLoading } = useTeamCoachesByYear(team?.exportId, year);
  const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.tactical;

  if (isLoading) {
    return (
      <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" p={6}>
        <Flex align="center" gap={2} color="text.secondary">
          <Spinner size="sm" />
          <Text fontSize="sm">Loading coach profile...</Text>
        </Flex>
      </Box>
    );
  }

  const hcList = coaches.filter((c) => isHeadCoach(c.title));
  const coordList = coaches.filter((c) => !isHeadCoach(c.title) && isCoordinator(c.title));
  const positionList = coaches.filter((c) => !isHeadCoach(c.title) && !isCoordinator(c.title));
  const headCoach = hcList[0] || coordList[0] || positionList[0] || null;
  const totalStaff = hcList.length + coordList.length + positionList.length;
  const prevYear = year - 1;
  const returningStaff = coaches.filter((c) => getYearsActive(c).includes(prevYear)).length;
  const stability = totalStaff ? Math.round((returningStaff / totalStaff) * 100) : 0;
  const hcTenure = headCoach ? Math.max(1, getYearsActive(headCoach).length) : 0;
  const accent = team?.colors?.primary || "#E53E3E";

  const composition = {
    headPct: totalStaff ? Math.round((hcList.length / totalStaff) * 100) : 0,
    coordPct: totalStaff ? Math.round((coordList.length / totalStaff) * 100) : 0,
    positionPct: totalStaff ? Math.round((positionList.length / totalStaff) * 100) : 0,
  };

  return (
    <Box border="1px solid" borderColor={preset.shellBorder} borderRadius="xl" bg={preset.shellBg} p={{ base: 3, md: 4 }}>
      <Text fontSize="10px" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="0.14em" mb={2}>
        Coach Profile Example - {team?.name || "Team"}
      </Text>

      {!totalStaff && (
        <Box border="1px dashed" borderColor="whiteAlpha.300" borderRadius="md" p={4} mb={3}>
          <Text fontSize="sm" color="text.secondary">No coach rows found for {team?.name} ({year}). Rendering layout shell only.</Text>
        </Box>
      )}

      <ProfileHero team={team} coach={headCoach} accent={accent} preset={preset} variant={variant} />

      <Grid templateColumns={{ base: "1fr 1fr", lg: "repeat(4, 1fr)" }} gap={3} mt={3}>
        <StatPanel label="Legacy Hub" value={`${stability}%`} tone={preset.accentTone} panelBg={preset.panelBg} />
        <StatPanel label="Tactical DNA" value={totalStaff || "--"} tone="#90CDF4" panelBg={preset.panelBg} />
        <StatPanel label="Impact Telemetry" value={hcTenure ? `${hcTenure}Y` : "--"} tone={accent} panelBg={preset.panelBg} />
        <StatPanel label="Coordinator Core" value={coordList.length} panelBg={preset.panelBg} />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1.25fr 1fr" }} gap={3} mt={3}>
        <RecruitingPanel composition={composition} panelBg={preset.panelBg} />
        <CoachingTreePanel headCoach={headCoach} coordinators={coordList} panelBg={preset.panelBg} />
      </Grid>
    </Box>
  );
};

export default CoachProfileLab;
