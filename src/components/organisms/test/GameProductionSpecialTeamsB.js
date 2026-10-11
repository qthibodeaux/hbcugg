import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { SPECIAL_TEAMS_PRODUCTION } from "./GameProductionSpecialTeamsA";

const TEAMS = SPECIAL_TEAMS_PRODUCTION;

const fmtPct = (n) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const fmt1 = (n) => (n == null ? "—" : (n ?? 0).toFixed(1));
const signed = (n) => (n > 0 ? `+${n}` : String(n));

function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

const LedgerHeader = () => (
  <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" p="6px" borderBottom="1px solid rgba(255,255,255,0.08)">
    {[TEAMS.pvamu, TEAMS.jsu].map((team) => {
      const totalDrag = Math.abs(team.summary.swing) + team.summary.penaltyCost;
      const hiddenWidth = Math.min(100, Math.abs(team.hiddenYards) * 3);
      const penaltyWidth = Math.min(100, team.summary.penaltyCost * 2.5);
      const swingWidth = Math.min(100, Math.abs(team.summary.swing) * 2.5);
      return (
        <Box key={team.shortName} bg={`linear-gradient(90deg, ${team.colors.primary}55 0%, rgba(255,255,255,0.025) 72%)`} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" px="7px" py="6px" minW={0}>
          <Flex align="center" justify="space-between" mb="5px">
            <Flex align="center" gap={2} minW={0}>
              <Box w="4px" h="17px" bg={team.colors.accent} borderRadius="sm" />
              <Text fontSize="clamp(12px, 1vw, 16px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em" truncate>
                {team.shortName} Hidden Field Position
              </Text>
            </Flex>
            <Text fontSize="clamp(10px, 0.86vw, 13px)" color={team.summary.swing >= 0 ? "#68D391" : "#E53E3E"} fontWeight="950">
              {signed(team.summary.swing)} swing
            </Text>
          </Flex>
          <Grid templateColumns="1.35fr repeat(3, 0.55fr)" gap="6px" alignItems="stretch">
            <VStack align="stretch" gap="4px" justify="center">
              <Flex justify="space-between" align="center">
                <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase">impact ledger</Text>
                <Text fontSize="7px" color="text.secondary" fontWeight="850">{totalDrag} tracked yards</Text>
              </Flex>
              <Grid templateColumns="50px minmax(0, 1fr)" gap="5px" alignItems="center">
                <Text fontSize="6px" color="text.muted" fontWeight="850">Swing</Text>
                <Box h="5px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden"><Box h="full" w={`${swingWidth}%`} bg={team.summary.swing >= 0 ? "#68D391" : "#E53E3E"} /></Box>
                <Text fontSize="6px" color="text.muted" fontWeight="850">Penalty</Text>
                <Box h="5px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden"><Box h="full" w={`${penaltyWidth}%`} bg="#F6AD55" /></Box>
                <Text fontSize="6px" color="text.muted" fontWeight="850">Hidden</Text>
                <Box h="5px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden"><Box h="full" w={`${hiddenWidth}%`} bg={team.hiddenYards >= 0 ? "#68D391" : "#E53E3E"} /></Box>
              </Grid>
            </VStack>
            <HeaderStat label="Avg Start" value={fmt1(team.avgStart)} color="#63B3ED" />
            <HeaderStat label="ST Plays" value={team.summary.plays} color={team.colors.accent} />
            <HeaderStat label="Penalty" value={team.summary.penaltyCost} color="#F6AD55" />
          </Grid>
        </Box>
      );
    })}
  </Grid>
);

const HeaderStat = ({ label, value, color }) => (
  <Flex direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" minW={0}>
    <Text fontSize="clamp(10px, 0.9vw, 13px)" color={color} fontWeight="950" lineHeight={1}>{value}</Text>
    <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{label}</Text>
  </Flex>
);

const BattleRow = ({ title, phase }) => (
  <Grid templateColumns="46px repeat(2, minmax(0, 1fr))" gap="6px" px="6px" minH={0}>
    <Flex align="center" justify="center" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm">
      <Text style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }} fontSize="8px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.08em">
        {title}
      </Text>
    </Flex>
    <BattleCard team={TEAMS.pvamu} phase={phase} />
    <BattleCard team={TEAMS.jsu} phase={phase} />
  </Grid>
);

const BattleCard = ({ team, phase }) => {
  const content = {
    fieldGoals: <FieldGoalBattle team={team} />,
    kickoff: <KickoffBattle team={team} />,
    punt: <PuntBattle team={team} />,
  }[phase];

  return (
    <Box bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" p="6px" overflow="hidden" minH={0}>
      <Flex align="center" justify="space-between" mb="5px">
        <Text fontSize="clamp(10px, 0.86vw, 13px)" color="text.primary" fontWeight="950" textTransform="uppercase">{team.shortName}</Text>
        <Text fontSize="7px" color={team.colors.accent} fontWeight="900" textTransform="uppercase">{phase === "fieldGoals" ? "kicking points" : "two-way unit"}</Text>
      </Flex>
      {content}
    </Box>
  );
};

const FieldGoalBattle = ({ team }) => {
  const data = team.fieldGoals;
  return (
    <Grid templateColumns="minmax(0, 1fr) 132px" gap="6px" h="calc(100% - 18px)" minH={0}>
      <VStack align="stretch" gap="5px">
        <Grid templateColumns="repeat(4, 1fr)" gap="4px">
          <Mini label="FG" value={`${data.made}/${data.attempts}`} color={team.colors.accent} />
          <Mini label="FG%" value={fmtPct(data.pct)} color="#68D391" />
          <Mini label="Trust" value={data.trustRange || "—"} color="#63B3ED" />
          <Mini label="PAT" value={`${data.patMade}/${data.patAttempts}`} color={data.patBlocked ? "#E53E3E" : "#68D391"} />
        </Grid>
        <RangeRail ranges={data.ranges} accent={team.colors.accent} />
        <OperationRail contributors={data.contributors} accent={team.colors.accent} />
      </VStack>
      <VStack align="stretch" gap="4px" minH={0}>
        <ContextTile label="Coach Line" value={data.aggression || "—"} sub="aggression threshold" color="#F6AD55" />
        <ContextTile label="Long" value={data.long || "—"} sub="made distance" color="#63B3ED" />
        <ContextTile label="Blocks" value={data.blocked + data.patBlocked} sub="allowed" color={data.blocked + data.patBlocked ? "#E53E3E" : "#68D391"} />
      </VStack>
    </Grid>
  );
};

const KickoffBattle = ({ team }) => {
  const data = team.kickoff;
  return (
    <Grid templateColumns="repeat(2, minmax(0, 1fr)) 132px" gap="6px" h="calc(100% - 18px)" minH={0}>
      <UnitHalf
        title="Kickoff Cover"
        accent={team.colors.accent}
        stats={[
          { label: "KO", value: data.attempts },
          { label: "TB", value: fmtPct(data.touchbackRate) },
          { label: "Start", value: fmt1(data.avgStartAllowed) },
          { label: "ESPA", value: fmt1(data.espa), color: data.espa >= 0 ? "#68D391" : "#E53E3E" },
        ]}
        barLabel="opponent start allowed"
        barValue={Math.min(100, data.avgStartAllowed)}
      />
      <UnitHalf
        title="Kick Return"
        accent="#63B3ED"
        stats={[
          { label: "Ret", value: fmtPct(data.returnRateAllowed) },
          { label: "Avg", value: fmt1(data.avgReturnAllowed) },
          { label: "Expl", value: data.explosivesAllowed, color: data.explosivesAllowed ? "#E53E3E" : "#68D391" },
          { label: "TO", value: 0 },
        ]}
        barLabel="return yardage"
        barValue={Math.min(100, data.avgReturnAllowed * 3)}
      />
      <OperationRail contributors={data.contributors} accent={team.colors.accent} compact />
    </Grid>
  );
};

const PuntBattle = ({ team }) => {
  const data = team.punt;
  return (
    <Grid templateColumns="repeat(2, minmax(0, 1fr)) 132px" gap="6px" h="calc(100% - 18px)" minH={0}>
      <UnitHalf
        title="Punt Team"
        accent={team.colors.accent}
        stats={[
          { label: "Punts", value: data.attempts },
          { label: "Gross", value: fmt1(data.gross) },
          { label: "I20", value: fmtPct(data.inside20) },
          { label: "FC", value: fmtPct(data.fairCatch) },
        ]}
        barLabel="gross field flip"
        barValue={Math.min(100, data.gross * 2)}
      />
      <UnitHalf
        title="Punt Return"
        accent="#63B3ED"
        stats={[
          { label: "Ret", value: fmtPct(data.returnRateAllowed) },
          { label: "Avg", value: fmt1(data.avgReturnAllowed) },
          { label: "NYOE", value: fmt1(data.nyoe), color: data.nyoe >= 0 ? "#68D391" : "#E53E3E" },
          { label: "Blk", value: data.blocks },
        ]}
        barLabel="return pressure"
        barValue={data.avgReturnAllowed == null ? 0 : Math.min(100, data.avgReturnAllowed * 8)}
      />
      <OperationRail contributors={data.contributors} accent={team.colors.accent} compact />
    </Grid>
  );
};

const UnitHalf = ({ title, accent, stats, barLabel, barValue }) => (
  <VStack align="stretch" gap="5px" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" p="5px" minH={0}>
    <Flex align="center" justify="space-between">
      <Text fontSize="7px" color="text.primary" fontWeight="950" textTransform="uppercase">{title}</Text>
      <Box w="20px" h="3px" bg={accent} borderRadius="full" />
    </Flex>
    <Grid templateColumns="repeat(2, 1fr)" gap="3px">
      {stats.map((stat) => (
        <Mini key={stat.label} label={stat.label} value={stat.value} color={stat.color || accent} />
      ))}
    </Grid>
    <Box mt="auto">
      <Flex justify="space-between" mb="3px">
        <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase">{barLabel}</Text>
        <Text fontSize="6px" color="text.secondary" fontWeight="850">{Math.round(barValue)}%</Text>
      </Flex>
      <Box h="6px" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden">
        <Box h="full" w={`${barValue}%`} bg={accent} borderRadius="full" />
      </Box>
    </Box>
  </VStack>
);

const RangeRail = ({ ranges, accent }) => (
  <Grid templateColumns="repeat(4, 1fr)" gap="3px">
    {ranges.map((range) => (
      <Box key={range.label} bg={range.att ? `${accent}22` : "rgba(255,255,255,0.025)"} border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" py="4px" textAlign="center">
        <Text fontSize="6px" color="text.muted" fontWeight="900">{range.label}</Text>
        <Text fontSize="9px" color="text.primary" fontWeight="950" mt="2px">{range.made}/{range.att}</Text>
      </Box>
    ))}
  </Grid>
);

const OperationRail = ({ contributors, accent, compact = false }) => (
  <VStack align="stretch" gap={compact ? "4px" : "3px"} minH={0} bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" p="5px">
    <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">{compact ? "people" : "operation"}</Text>
    {contributors.map((player) => (
      <Grid key={`${player.name}-${player.role}`} templateColumns="28px minmax(0, 1fr)" gap="4px" alignItems="center" minW={0}>
        <Flex w="23px" h="18px" align="center" justify="center" bg={`${accent}22`} border={`1px solid ${accent}66`} borderRadius="sm">
          <Text fontSize="6px" color={accent} fontWeight="950">{player.role}</Text>
        </Flex>
        <Box minW={0}>
          <Text fontSize="7px" color="text.primary" fontWeight="900" truncate>{displayName(player.name)}</Text>
          <Text fontSize="5.5px" color="text.muted" fontWeight="800" truncate>{player.line}</Text>
        </Box>
      </Grid>
    ))}
  </VStack>
);

const ContextTile = ({ label, value, sub, color }) => (
  <Flex direction="column" justify="center" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" px="6px" flex={1} minH={0}>
    <Text fontSize="clamp(11px, 0.9vw, 14px)" color={color} fontWeight="950" lineHeight={1}>{value}</Text>
    <Text fontSize="7px" color="text.primary" fontWeight="900" textTransform="uppercase" mt="3px">{label}</Text>
    <Text fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1px" truncate>{sub}</Text>
  </Flex>
);

const Mini = ({ label, value, color = "text.primary" }) => (
  <Flex direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" py="4px" minW={0}>
    <Text fontSize="clamp(9px, 0.78vw, 12px)" color={color} fontWeight="950" lineHeight={1}>{value}</Text>
    <Text fontSize="5.5px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{label}</Text>
  </Flex>
);

export const GameProductionSpecialTeamsB = () => (
  <Flex w="full" h="full" direction="column" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <LedgerHeader />
    <Grid templateRows="repeat(3, minmax(0, 1fr))" gap="6px" flex={1} minH={0} py="6px">
      <BattleRow title="Field Goals" phase="fieldGoals" />
      <BattleRow title="Kickoffs" phase="kickoff" />
      <BattleRow title="Punts" phase="punt" />
    </Grid>
  </Flex>
);
