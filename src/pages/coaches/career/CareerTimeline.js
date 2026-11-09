import { TrendingUp, MoveRight, RefreshCw, ArrowRight } from "lucide-react";
import { TEAM_DISPLAY, roleTier } from "./coachCareerModel";
import { Flex, Box, Text } from "@chakra-ui/react";

// Coach season rows and backend movement-event presentation; classifications and ordering are unchanged.

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

export const MovementRow = ({ move }) => {
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

export const SeasonRow = ({ entry, isLatest }) => {
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
