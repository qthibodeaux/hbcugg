import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import EfficiencyProfile from "../../molecules/visualizations/EfficiencyProfile";
import FieldZoneRatings from "../../molecules/visualizations/FieldZoneRatings";
import SeasonVelocityCard from "../../molecules/visualizations/SeasonVelocityCard";

const DashCard = ({ kicker, title, accent, children, minH }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="2xl"
    p={5}
    minH={minH}
    position="relative"
    overflow="hidden"
    _before={accent ? {
      content: '""',
      position: "absolute",
      inset: 0,
      bg: `linear-gradient(135deg, ${accent}22 0%, transparent 58%)`,
      pointerEvents: "none",
    } : undefined}
  >
    <Box position="relative" zIndex={1}>
      <Text textStyle="kicker" color="brand.500">{kicker}</Text>
      <Text textStyle="cardTitle" color="text.primary" mt={1} mb={4}>{title}</Text>
      {children}
    </Box>
  </Box>
);

const MetricRow = ({ label, value, sublabel, accent, pct }) => (
  <Box>
    <Flex justify="space-between" align="baseline" mb={1.5} gap={3}>
      <Box>
        <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
          {label}
        </Text>
        {sublabel ? <Text fontSize="10px" color="text.muted" mt={0.5}>{sublabel}</Text> : null}
      </Box>
      <Text fontSize="3xl" fontWeight="black" color="white" lineHeight={1}>
        {value}
      </Text>
    </Flex>
    <Box h="8px" borderRadius="full" bg="whiteAlpha.100" overflow="hidden">
      <Box h="full" w={`${Math.max(6, Math.min(100, pct))}%`} bg={accent} borderRadius="full" />
    </Box>
  </Box>
);

const ProfileSignalCard = ({ player, teamMeta, height, weight, hometown, classLabel, formatHeight }) => {
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";

  return (
    <DashCard kicker="Physical Profile" title="Roster Snapshot" accent={primary} minH="100%">
      <Flex direction="column" gap={4}>
        {[
          { label: "Height", value: formatHeight(height) },
          { label: "Weight", value: weight ? `${weight} LBS` : "-" },
          { label: "Hometown", value: hometown ?? "-" },
          { label: "Class", value: classLabel ?? "-" },
          { label: "School", value: teamMeta?.shortName ?? player?.team ?? "-" },
        ].map((row) => (
          <Flex
            key={row.label}
            justify="space-between"
            align="baseline"
            gap={3}
            pb={3}
            borderBottom="1px solid"
            borderColor="whiteAlpha.50"
          >
            <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
              {row.label}
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="white" textAlign="right">
              {row.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </DashCard>
  );
};

const TelemetryCard = ({ player, parScore, gloryRating, leagueAvgs, radarScores, teamMeta }) => {
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const secondary = teamMeta?.colors?.secondary ?? "#FFFFFF";
  const games = player?.games_played ?? 0;
  const parPct = Math.min(100, (parScore / Math.max(leagueAvgs.par * 2, 10)) * 100);
  const gloryPct = Math.min(100, gloryRating);
  const durabilityPct = Math.min(100, (games / 12) * 100);
  const mobilityPct = Math.min(100, radarScores[4] ?? 50);

  return (
    <DashCard kicker="Live Telemetry" title="Player Signal Board" accent={primary} minH="100%">
      <Flex direction="column" gap={5}>
        <MetricRow
          label="PAR Signal"
          value={parScore.toFixed(1)}
          sublabel="Production Added Rating"
          accent={primary}
          pct={parPct}
        />
        <MetricRow
          label="Glory Rating"
          value={gloryRating}
          sublabel="Composite profile score"
          accent={secondary}
          pct={gloryPct}
        />
        <MetricRow
          label="Durability"
          value={games}
          sublabel="Games tracked this season"
          accent="#63B3ED"
          pct={durabilityPct}
        />
        <MetricRow
          label="Mobility Index"
          value={mobilityPct}
          sublabel="Derived from efficiency profile"
          accent="#F6AD55"
          pct={mobilityPct}
        />
      </Flex>
    </DashCard>
  );
};

const VsAverageCard = ({ player, parScore, gloryRating, leagueAvgs, teamMeta }) => {
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const lastName = player?.name_display?.split(" ").pop() ?? "Player";

  const rows = [
    {
      label: "PAR Rating",
      playerVal: parScore,
      avgVal: leagueAvgs.par,
      display: parScore.toFixed(1),
      avgDisplay: leagueAvgs.par.toFixed(1),
    },
    {
      label: "Glory Index",
      playerVal: gloryRating,
      avgVal: Math.round(50 + leagueAvgs.par * 0.8),
      display: String(gloryRating),
      avgDisplay: String(Math.round(50 + leagueAvgs.par * 0.8)),
    },
    {
      label: "Games",
      playerVal: player?.games_played ?? 0,
      avgVal: leagueAvgs.games,
      display: String(player?.games_played ?? 0),
      avgDisplay: leagueAvgs.games.toFixed(1),
    },
  ];

  return (
    <DashCard kicker="Vs. Position Avg" title="Conference Baseline" accent={primary} minH="100%">
      <Flex direction="column" gap={4}>
        {rows.map((row) => {
          const max = Math.max(row.playerVal, row.avgVal, 1);
          return (
            <Box key={row.label}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="0.12em">
                  {row.label}
                </Text>
                <Text fontSize="10px" color="text.muted">
                  {lastName} {row.display} | Avg {row.avgDisplay}
                </Text>
              </Flex>
              <Box h="7px" bg="whiteAlpha.100" borderRadius="full" overflow="hidden" mb={1}>
                <Box h="full" w={`${(row.playerVal / max) * 100}%`} bg={primary} borderRadius="full" />
              </Box>
              <Box h="7px" bg="whiteAlpha.50" borderRadius="full" overflow="hidden">
                <Box h="full" w={`${(row.avgVal / max) * 100}%`} bg="whiteAlpha.300" borderRadius="full" />
              </Box>
            </Box>
          );
        })}
      </Flex>
    </DashCard>
  );
};

const IdentityCard = ({ player, teamMeta, classLabel }) => {
  const primary = teamMeta?.colors?.primary ?? "#E53E3E";
  const notes = [
    player?.is_transfer ? `${player.transfer_tier ?? "Transfer"} transfer profile` : "Home program roster track",
    player?.is_redshirt ? "Redshirt designation on file" : "Active competitive designation",
    classLabel ? `${classLabel} eligibility window` : null,
    teamMeta?.conference ? `${teamMeta.conference} conference context` : null,
  ].filter(Boolean);

  return (
    <DashCard kicker="Identity" title="Roster Context" accent={primary} minH="100%">
      <Flex direction="column" gap={3}>
        {notes.map((note) => (
          <Flex key={note} gap={3} align="flex-start">
            <Box w="6px" h="6px" borderRadius="full" bg={primary} mt="6px" flexShrink={0} />
            <Text fontSize="sm" color="text.secondary" lineHeight={1.6}>
              {note}
            </Text>
          </Flex>
        ))}
      </Flex>
    </DashCard>
  );
};

const PlayerDashOverview = ({
  player,
  teamMeta,
  parScore,
  gloryRating,
  radarScores,
  leagueAvgs,
  classLabel,
  height,
  weight,
  hometown,
  formatHeight,
}) => (
  <Grid
    templateColumns={{ base: "1fr", xl: "minmax(0, 1.1fr) minmax(0, 1.1fr) 320px" }}
    gap={6}
    pb={12}
  >
    <Box>
      <EfficiencyProfile
        scores={radarScores}
        labels={["Production", "Durability", "Experience", "Impact", "Mobility"]}
      />
    </Box>

    <TelemetryCard
      player={player}
      parScore={parScore}
      gloryRating={gloryRating}
      leagueAvgs={leagueAvgs}
      radarScores={radarScores}
      teamMeta={teamMeta}
    />

    <ProfileSignalCard
      player={player}
      teamMeta={teamMeta}
      height={height}
      weight={weight}
      hometown={hometown}
      classLabel={classLabel}
      formatHeight={formatHeight}
    />

    <Box gridColumn={{ base: "auto", xl: "span 2" }}>
      <FieldZoneRatings parScore={parScore} />
    </Box>

    <VsAverageCard
      player={player}
      parScore={parScore}
      gloryRating={gloryRating}
      leagueAvgs={leagueAvgs}
      teamMeta={teamMeta}
    />

    <Box gridColumn={{ base: "auto", xl: "span 2" }}>
      <SeasonVelocityCard par={parScore} games={player?.games_played} />
    </Box>

    <IdentityCard player={player} teamMeta={teamMeta} classLabel={classLabel} />
  </Grid>
);

export default PlayerDashOverview;
