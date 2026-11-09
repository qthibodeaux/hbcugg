import { RETURN_DATA, fmtPct, fmt1, tone, displayName } from "./ledgerData";
import { PhaseBox, StatPill, ReturnRows, RangeRail, FieldPositionLedger } from "./LedgerPrimitives";
import { Grid, VStack, Box, Text, Flex } from "@chakra-ui/react";

// Special-teams ledger kickoff, punt and field-goal composition.

const KickoffSection = ({ teamKey, team }) => {
  const data = RETURN_DATA[teamKey];
  const ko = team.kickoff;

  return (
    <PhaseBox title="Kickoffs / Kick Returns" accent={team.colors.accent}>
      <Grid templateColumns="1.05fr 0.95fr" gap="6px">
        <VStack align="stretch" gap="3px">
          <StatPill label="Kickoffs" value={ko.attempts} color={team.colors.accent} />
          <StatPill label="Touchback" value={fmtPct(ko.touchbackRate)} color="#63B3ED" />
          <StatPill label="Avg Start Allowed" value={fmt1(ko.avgStartAllowed)} color="#F6AD55" />
          <StatPill label="KO Field Pos" value={fmt1(data.kickoffValue)} color={tone(data.kickoffValue)} />
        </VStack>
        <Box minW={0}>
          <Grid templateColumns="1fr 28px 34px 28px" gap="4px" mb="3px">
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase">returner</Text>
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign="right">ret</Text>
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign="right">yds</Text>
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign="right">avg</Text>
          </Grid>
          <ReturnRows rows={data.kickReturners} accent={team.colors.accent} />
        </Box>
      </Grid>
    </PhaseBox>
  );
};

const PuntSection = ({ teamKey, team }) => {
  const data = RETURN_DATA[teamKey];
  const punt = team.punt;

  return (
    <PhaseBox title="Punts / Punt Returns" accent={team.colors.accent}>
      <Grid templateColumns="1.05fr 0.95fr" gap="6px">
        <VStack align="stretch" gap="3px">
          <StatPill label="Punts" value={punt.attempts} color={team.colors.accent} />
          <StatPill label="Distance From Scrim" value={fmt1(punt.gross)} color="#63B3ED" />
          <StatPill label="Inside 20" value={fmtPct(punt.inside20)} color="#68D391" />
          <StatPill label="Net +/-" value={fmt1(data.puntNetValue)} color={tone(data.puntNetValue)} />
        </VStack>
        <Box minW={0}>
          <Grid templateColumns="1fr 28px 34px 28px" gap="4px" mb="3px">
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase">returner</Text>
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign="right">ret</Text>
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign="right">yds</Text>
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" textAlign="right">avg</Text>
          </Grid>
          <ReturnRows rows={data.puntReturners} accent={team.colors.accent} />
        </Box>
      </Grid>
    </PhaseBox>
  );
};

const FieldGoalSection = ({ team }) => {
  const fg = team.fieldGoals;

  return (
    <PhaseBox title="Field Goals / PAT" accent={team.colors.accent}>
      <Grid templateColumns="1fr 0.88fr" gap="6px">
        <VStack align="stretch" gap="3px">
          <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="3px">
            <StatPill label="FG" value={`${fg.made}/${fg.attempts}`} color={team.colors.accent} />
            <StatPill label="FG%" value={fmtPct(fg.pct)} color="#68D391" />
            <StatPill label="Long Made" value={fg.long || "--"} color="#63B3ED" />
            <StatPill label="PAT" value={`${fg.patMade}/${fg.patAttempts}`} color={fg.patBlocked ? "#E53E3E" : "#68D391"} />
          </Grid>
          <RangeRail ranges={fg.ranges} accent={team.colors.accent} />
        </VStack>
        <VStack align="stretch" gap="3px" minH={0}>
          <StatPill label="Trust Range" value={fg.trustRange || "--"} color="#63B3ED" />
          <StatPill label="Aggression Line" value={fg.aggression || "--"} color="#F6AD55" />
          <StatPill label="Blocks Allowed" value={fg.blocked + fg.patBlocked} color={fg.blocked + fg.patBlocked ? "#E53E3E" : "#68D391"} />
          <Box minW={0} pt="2px">
            <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" mb="2px">
              operation
            </Text>
            {fg.contributors.slice(0, 2).map((player) => (
              <Text key={player.name} fontSize="7px" color="text.primary" fontWeight="850" truncate>
                {player.role} - {displayName(player.name)}
              </Text>
            ))}
          </Box>
        </VStack>
      </Grid>
    </PhaseBox>
  );
};

export const TeamPanel = ({ teamKey, team }) => (
  <Flex direction="column" gap="6px" minH={0}>
    <FieldPositionLedger team={team} data={RETURN_DATA[teamKey]} />
    <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="6px" flex="1" minH={0}>
      <KickoffSection teamKey={teamKey} team={team} />
      <PuntSection teamKey={teamKey} team={team} />
      <FieldGoalSection team={team} />
    </Grid>
  </Flex>
);
