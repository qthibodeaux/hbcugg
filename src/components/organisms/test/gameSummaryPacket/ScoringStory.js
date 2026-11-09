import { Panel, Kicker } from "./PacketPrimitives";
import { Clock3, Activity, Sparkles, Shield } from "lucide-react";
import { Grid, Text, Box, Flex } from "@chakra-ui/react";
import { Fragment } from "react";
import { getTeamLabel, signed, pct, fmt } from "./packetModel";

export const QuarterStrip = ({ model }) => (
  <Panel accent="#F56565" p={3}>
    <Kicker icon={Clock3}>Quarter Scoring</Kicker>
    <Grid templateColumns="1.2fr repeat(4, 1fr) 1fr" gap={2} alignItems="center" mb={3}>
      <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">Team</Text>
      {[1, 2, 3, 4].map((q) => (
        <Text key={q} fontSize="10px" color="text.muted" fontWeight="black" textAlign="center">Q{q}</Text>
      ))}
      <Text fontSize="10px" color="text.muted" fontWeight="black" textAlign="right">Final</Text>
      {model.teams.map((team) => (
        <Fragment key={team.id}>
          <Text key={`${team.id}-label`} fontSize="sm" color="white" fontWeight="black">{team.label}</Text>
          {model.quarterScores.map((row) => (
            <Text key={`${team.id}-${row.quarter}`} fontSize="sm" color="text.secondary" fontWeight="black" textAlign="center">
              {team.id === model.awayId ? row.away : row.home}
            </Text>
          ))}
          <Text key={`${team.id}-final`} fontSize="lg" color="white" fontWeight="black" textAlign="right">{team.score}</Text>
        </Fragment>
      ))}
    </Grid>
    <Box borderTop="1px solid" borderColor="whiteAlpha.100" pt={3}>
      <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase" letterSpacing="0.12em" mb={1}>
        Read
      </Text>
      <Text fontSize="xs" color="text.secondary" lineClamp={3}>
        Keep this compact unless quarters gain drive-level context, lead-change markers, or scoring-run annotations.
      </Text>
    </Box>
  </Panel>
);

export const ScoringTimeline = ({ model }) => (
  <Panel accent="#63B3ED" minH="100%">
    <Kicker icon={Activity} color="#63B3ED">Game Flow Capsule</Kicker>
    <Flex direction="column" gap={2}>
      {model.scoring.slice(0, 10).map((play, index) => (
        <Grid key={`${play.quarter}-${play.clock}-${index}`} templateColumns="58px 1fr auto" gap={3} alignItems="center" py={2} borderTop={index === 0 ? "0" : "1px solid"} borderColor="whiteAlpha.100">
          <Box>
            <Text fontSize="10px" color="text.muted" fontWeight="black">Q{play.quarter}</Text>
            <Text fontSize="10px" color="text.secondary">{play.clock}</Text>
          </Box>
          <Box minW={0}>
            <Text fontSize="xs" color="white" fontWeight="black" lineClamp={1}>
              {getTeamLabel(play.team)} {play.type} | {play.points} pts
            </Text>
            <Text fontSize="10px" color="text.muted" lineClamp={1}>{play.text}</Text>
          </Box>
          <Text fontSize="sm" color="white" fontWeight="black">{play.awayScore}-{play.homeScore}</Text>
        </Grid>
      ))}
    </Flex>
  </Panel>
);

export const KeyPlays = ({ model }) => (
  <Panel accent="#F6AD55" minH="100%">
    <Kicker icon={Sparkles} color="#F6AD55">Top EPA Swings</Kicker>
    <Flex direction="column" gap={2}>
      {model.keyPlays.map((play, index) => (
        <Box key={play.play_id ?? index} p={3} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" justify="space-between" mb={1}>
            <Text fontSize="10px" color="text.muted" fontWeight="black">Q{play.quarter} {play.clock} | {getTeamLabel(play.offense_team)}</Text>
            <Text fontSize="sm" color={play.epa.epa >= 0 ? "#48BB78" : "#F56565"} fontWeight="black">{signed(play.epa.epa, 2)} EPA</Text>
          </Flex>
          <Text fontSize="xs" color="text.secondary" lineClamp={2}>{play.raw_text}</Text>
        </Box>
      ))}
    </Flex>
  </Panel>
);

export const WhyItHappened = ({ model }) => (
  <Panel accent="#9F7AEA" minH="100%">
    <Kicker icon={Shield} color="#9F7AEA">Why It Happened</Kicker>
    <Grid templateColumns="1fr 1fr" gap={3}>
      {model.teams.map((team) => (
        <Box key={team.id} bg="whiteAlpha.50" p={3} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="sm" color="white" fontWeight="black" mb={2}>{team.label}</Text>
          {[
            ["Disruption", pct(team.defense.disruption_rate)],
            ["Explosive Prev", pct(team.defense.explosive_prevention_rate)],
            ["Pressure", pct(team.pressure.pressure_rate_forced)],
            ["Q4 Lead Takes", fmt(team.sequence.q4_lead_takes, 0)],
            ["Consec Scores", fmt(team.sequence.max_consecutive_scoring_drives, 0)],
          ].map(([label, value]) => (
            <Flex key={label} justify="space-between" py={1.5} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="10px" color="text.muted" fontWeight="black" textTransform="uppercase">{label}</Text>
              <Text fontSize="sm" color="white" fontWeight="black">{value}</Text>
            </Flex>
          ))}
        </Box>
      ))}
    </Grid>
  </Panel>
);
