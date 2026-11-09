import teamsData from "../../../../data/teams.json";
import { useLayoutDensity } from "../../../../hooks/useLayoutDensity";
import { DashboardCardFrame } from "../../../layouts/dashboard";
import { Box, Image, Flex, Text } from "@chakra-ui/react";
import { Trophy } from "lucide-react";

// Standings card identity, adaptive naming and leader/defending-champion states.

const teamByV5Id = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

const getTeam = (row) => row?.team ?? teamByV5Id[row?.teamId] ?? teamByV5Id[row?.id];

const getTeamLogo = (team) => team?.logo ?? (team?.exportId ? `/assets/${team.exportId.replace(/25$/, "")}.svg` : null);

const getCompactTeamLabel = (team, fallback = "TEAM") => team?.bannerShort ?? team?.shortName ?? team?.name ?? fallback;

const getFullTeamLabel = (team, fallback = "TEAM") =>
  (team?.name ?? team?.bannerShort ?? team?.shortName ?? fallback).replace(/-/g, " ");

const LONG_NAME_THRESHOLD = 17;

const getAdaptiveTeamLabel = (team, fallback = "TEAM") => {
  const full = getFullTeamLabel(team, fallback);
  if (full.length <= LONG_NAME_THRESHOLD) return full;
  // bannerName is shorter than the official name but isn't guaranteed to fit either
  // (e.g. MVSU's "Mississippi Valley" is still 18 chars, built around an 11-letter
  // word) — only use it if it actually clears the threshold, else drop to the acronym.
  if (team?.bannerName && team.bannerName.length <= LONG_NAME_THRESHOLD) return team.bannerName;
  return getCompactTeamLabel(team, fallback);
};

const getDisplayRecord = (row, metric = "conference") => {
  if (metric === "overall") return row?.record ?? `${row?.wins ?? 0}-${row?.losses ?? 0}`;
  return row?.confRecord ?? `${row?.confWins ?? row?.cw ?? 0}-${row?.confLosses ?? row?.cl ?? 0}`;
};

export const TopThreeStandingsCard = ({
  title,
  rows = [],
  metric = "conference",
  leaderLabel = null,
  defendingChampion = null,
  conferencePlayBegins = null,
}) => {
  const { isCompact } = useLayoutDensity();
  const hasLeader = rows.some((row) => row?.is_leader === true);
  const top = rows[0];
  const champion = defendingChampion?.team_id ? { teamId: defendingChampion.team_id } : null;
  const headTeam = hasLeader ? getTeam(top) : getTeam(champion);
  const accent = headTeam?.colors?.primary ?? "#E53E3E";
  const secondary = headTeam?.colors?.secondary === "#FFFFFF" ? "#DDE6F2" : headTeam?.colors?.secondary ?? "#F56565";
  const topLogo = getTeamLogo(headTeam);
  const chaseRows = rows.slice(1, 3);
  const metricLabel = metric === "overall" ? "overall" : "conference";
  const headLabel = hasLeader ? (leaderLabel ?? `${title} leader`) : "Defending champ";
  // Compact density goes straight to the ticker; standard keeps the adaptive
  // full/short name switch that reacts to name length.
  const nameFor = (team, fallback) => (isCompact ? getCompactTeamLabel(team, fallback) : getAdaptiveTeamLabel(team, fallback));
  const headName = hasLeader
    ? nameFor(headTeam, top?.shortName)
    : (headTeam ? nameFor(headTeam) : "—");
  const headRecord = hasLeader ? getDisplayRecord(top, metric) : (defendingChampion?.record ?? "—");
  const headMetric = hasLeader
    ? metricLabel
    : (defendingChampion?.season ? `${defendingChampion.season} ${metricLabel}` : metricLabel);
  const playBeginsLabel = conferencePlayBegins?.date_label ?? null;

  if (!rows.length) {
    return <DashboardCardFrame kicker="Standings" title={title} isEmpty emptyLabel="No standings data." minH="100%" />;
  }

  // Every dimension below is in cqmin — a fraction of the card's own short
  // side. The card is a square PageShell slot, so nothing needs a px floor or
  // a viewport breakpoint; it scales with the slot.
  return (
    <Box
      h="100%"
      w="100%"
      containerType="size"
      overflow="hidden"
      position="relative"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="xl"
      bg="#111114"
      style={{ boxShadow: `inset 0 0 60px ${accent}18` }}
    >
      <Box position="absolute" inset={0} style={{ background: `linear-gradient(150deg, ${accent}50, transparent 58%)` }} />
      {topLogo && (
        <Image
          src={topLogo}
          position="absolute"
          right="-18cqmin"
          top="-12cqmin"
          w="60cqmin"
          h="60cqmin"
          objectFit="contain"
          opacity={0.12}
        />
      )}

      <Trophy
        color={accent}
        style={{ position: "absolute", top: "5cqmin", right: "5cqmin", width: "8cqmin", height: "8cqmin", opacity: 0.9 }}
      />

      <Flex
        h="100%"
        direction="column"
        px="6cqmin"
        pt="6cqmin"
        pb="5cqmin"
        position="relative"
        gap="4cqmin"
        overflow="hidden"
      >
        <Flex align="center" gap="4cqmin" minH={0} flexShrink={0}>
          {topLogo && (
            <Image
              src={topLogo}
              w="20cqmin"
              h="20cqmin"
              objectFit="contain"
              flexShrink={0}
            />
          )}
          <Box minW={0}>
            <Text fontSize="4cqmin" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" lineHeight={1.2} lineClamp={1}>
              {headLabel}
            </Text>
            {/* minH reserves 2 line-heights (line-height 0.9 * 2 lines = 1.8em) regardless
                of whether this team's name actually wraps to 1 or 2 lines, so the record
                row below — and the divider after it — land at the same Y on every card
                in the row instead of drifting with the name's wrap count. */}
            <Text
              fontSize="10cqmin"
              fontWeight="black"
              color="white"
              lineHeight={0.9}
              textTransform="uppercase"
              lineClamp={3}
              minH="1.8em"
              maxW="100%"
            >
              {headName}
            </Text>
            <Flex align="center" gap="2cqmin" mt="1.5cqmin">
              <Text fontSize="5.5cqmin" color={secondary} fontWeight="black" lineHeight={1.2} whiteSpace="nowrap">
                {headRecord}
              </Text>
              <Text fontSize="4cqmin" color="text.muted" textTransform="uppercase" letterSpacing="0.08em" lineHeight={1.2} lineClamp={1}>
                {headMetric}
              </Text>
            </Flex>
          </Box>
        </Flex>

        <Box h="1px" flexShrink={0} style={{ background: `linear-gradient(90deg, ${secondary}88, transparent)` }} />

        {/* Chase rows split whatever height is left below the leader block —
            flex: 1 each, not a fixed row height — so the card has no dead
            space at the bottom and the rows scale with the slot. */}
        {hasLeader ? (
        <Flex flex={1} direction="column" gap="3cqmin" minH={0}>
          {chaseRows.map((row, index) => {
            const team = getTeam(row);
            const logo = getTeamLogo(team);
            return (
              <Flex
                key={`${title}-${row.teamId}-${index}`}
                align="center"
                gap="3cqmin"
                flex={1}
                minH={0}
                py="1.5cqmin"
                px="3cqmin"
                borderRadius="md"
                bg="rgba(255,255,255,0.035)"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <Text fontSize="5cqmin" fontWeight="black" w="6cqmin" color="text.muted" lineHeight={1} flexShrink={0}>
                    {index + 2}
                </Text>
                {logo && <Image src={logo} w="14cqmin" h="14cqmin" objectFit="contain" flexShrink={0} />}
                <Text flex={1} minW={0} fontSize="6cqmin" fontWeight="black" color="text.secondary" textTransform="uppercase" lineHeight={1} lineClamp={2}>
                  {nameFor(team, row.shortName)}
                </Text>
                <Text fontSize="7cqmin" fontWeight="black" color="white" lineHeight={1.1} whiteSpace="nowrap">
                    {getDisplayRecord(row, metric)}
                </Text>
              </Flex>
            );
          })}
        </Flex>
        ) : (
        <Flex flex={1} align="center" justify="center" minH={0}>
          {playBeginsLabel && (
            <Text
              fontSize="7cqmin"
              fontWeight="black"
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing="0.04em"
              textAlign="center"
              lineHeight={1.2}
              lineClamp={2}
            >
              {title} play begins {playBeginsLabel}
            </Text>
          )}
        </Flex>
        )}
      </Flex>
    </Box>
  );
};
