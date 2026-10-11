import { useState } from "react";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { SectionShell } from "../panels/SectionShell";

const RESULT_COLOR = {
  Touchdown: "green.400",
  "Field Goal": "blue.300",
  Punt: "text.muted",
  Turnover: "red.400",
  "Turnover on Downs": "red.400",
  Interception: "red.400",
  Fumble: "red.400",
};

const DriveRow = ({ drive, awayShort, homeShort, awayId }) => {
  const isAway = drive.team === awayId || String(drive.team).toLowerCase() === awayShort.toLowerCase();
  const teamLabel = isAway ? awayShort : homeShort;
  const resultColor = RESULT_COLOR[drive.result] ?? "text.muted";

  return (
    <Grid
      templateColumns="28px 1fr auto auto"
      gap={3}
      py={2.5}
      px={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      alignItems="center"
      _hover={{ bg: "whiteAlpha.50" }}
    >
      <Text fontSize="10px" color="text.muted">Q{drive.quarter}</Text>
      <Box minW={0}>
        <Flex gap={2} align="center">
          <Text fontSize="xs" fontWeight="bold" color="text.primary">{teamLabel}</Text>
          <Text fontSize="10px" color="text.muted">
            {drive.plays} plays · {drive.yards > 0 ? "+" : ""}{drive.yards} yds
          </Text>
        </Flex>
        {drive.score && <Text fontSize="10px" color="brand.400" fontWeight="bold">{drive.score}</Text>}
      </Box>
      <Text fontSize="xs" color={resultColor} fontWeight="medium" textAlign="right" minW="90px" lineClamp={1}>
        {drive.result}
      </Text>
      <Text fontSize="10px" color="text.muted" minW="36px" textAlign="right">{drive.start_time}</Text>
    </Grid>
  );
};

const ScoringPlayRow = ({ play, awayId, awayShort, homeShort }) => {
  const isAway = play.offense_team === awayId;
  const teamLabel = isAway ? awayShort : homeShort;
  const isScoring = play.scoring_event === true;
  const scoreStr =
    play.score_away_after != null
      ? `${awayShort} ${play.score_away_after} – ${play.score_home_after} ${homeShort}`
      : null;

  return (
    <Grid
      templateColumns="44px auto 1fr"
      gap={3}
      py={2.5}
      px={3}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      alignItems="start"
      _hover={{ bg: "whiteAlpha.50" }}
    >
      <Text fontSize="9px" color="text.muted" mt="2px" lineHeight={1.4}>
        Q{play.quarter}{"\n"}{play.clock}
      </Text>
      <Box
        px={2}
        py={0.5}
        bg={isScoring ? "green.900" : "whiteAlpha.100"}
        borderRadius="md"
        mt="1px"
        flexShrink={0}
      >
        <Text fontSize="9px" fontWeight="bold" color={isScoring ? "green.300" : "text.muted"} lineClamp={1} textTransform="uppercase">
          {play.scoring_type ?? "Key Play"}
        </Text>
      </Box>
      <Box minW={0}>
        <Text fontSize="xs" color="text.primary" lineClamp={3}>{play.raw_text}</Text>
        <Flex gap={3} mt={0.5}>
          {scoreStr && <Text fontSize="10px" color="brand.400" fontWeight="bold">{scoreStr}</Text>}
          <Text fontSize="10px" color="text.muted">{teamLabel}</Text>
        </Flex>
      </Box>
    </Grid>
  );
};

export const DrivesPanel = ({ drives, plays, awayId, homeId, awayShort, homeShort }) => {
  const [view, setView] = useState("scoring");

  const keyPlays = (plays ?? []).filter(
    (p) => p.scoring_event === true || Math.abs(p.wpa?.wpa ?? 0) >= 0.05,
  );

  return (
    <SectionShell title={null}>
      <Flex gap={2} mb={4}>
        {[
          { id: "scoring", label: "Important / Scoring Plays" },
          { id: "drives", label: "All Drives" },
        ].map((tab) => {
          const active = view === tab.id;
          return (
            <Box
              key={tab.id}
              as="button"
              px={4}
              py={2}
              borderRadius="lg"
              bg={active ? "brand.500" : "bg.secondary"}
              border="1px solid"
              borderColor={active ? "brand.500" : "whiteAlpha.100"}
              onClick={() => setView(tab.id)}
            >
              <Text fontSize="xs" fontWeight={active ? "bold" : "medium"} color={active ? "white" : "text.muted"}>
                {tab.label}
              </Text>
            </Box>
          );
        })}
      </Flex>

      <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="xl" overflow="hidden">
        {view === "scoring" && (
          keyPlays.length > 0
            ? keyPlays.map((p, i) => (
                <ScoringPlayRow key={i} play={p} awayId={awayId} awayShort={awayShort} homeShort={homeShort} />
              ))
            : <Flex justify="center" py={10}><Text color="text.muted" fontSize="sm">No key plays found.</Text></Flex>
        )}
        {view === "drives" && (
          drives.length > 0
            ? drives.map((d, i) => (
                <DriveRow key={i} drive={d} awayId={awayId} awayShort={awayShort} homeShort={homeShort} />
              ))
            : <Flex justify="center" py={10}><Text color="text.muted" fontSize="sm">No drive data.</Text></Flex>
        )}
      </Box>
    </SectionShell>
  );
};
