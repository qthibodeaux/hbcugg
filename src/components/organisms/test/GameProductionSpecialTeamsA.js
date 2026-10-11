import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";

export const SPECIAL_TEAMS_PRODUCTION = {
  pvamu: {
    shortName: "PVAMU",
    side: "Away",
    colors: { primary: "#4B0082", accent: "#FFB81C" },
    avgStart: 36.75,
    hiddenYards: -10,
    summary: { swing: -12, penaltyCost: 12, plays: 15 },
    kickoff: {
      attempts: 6,
      touchbackRate: 0,
      avgStartAllowed: 25.8,
      espa: -2.67,
      returnRateAllowed: 0.6,
      avgReturnAllowed: 20.7,
      explosivesAllowed: 1,
      contributors: [
        { name: "Alfaro,Diego", role: "K", line: "6 KO / 25.8 avg start allowed" },
        { name: "Stewart,Kellen", role: "KR", line: "29-yard return" },
        { name: "Jackson,Jayven", role: "COV", line: "coverage assist / penalty" },
      ],
    },
    punt: {
      attempts: 3,
      gross: 31.3,
      inside20: 0,
      inside10: 0,
      fairCatch: 0,
      returnRateAllowed: 1,
      avgReturnAllowed: 6,
      nyoe: -5,
      blocks: 0,
      contributors: [
        { name: "Atwell,Adam", role: "P", line: "3 punts / 31.3 gross" },
        { name: "Dennis,Andre", role: "PR", line: "2 punt returns / 12 yards" },
        { name: "Roberts,Sterling", role: "BLK", line: "PAT block impact" },
      ],
    },
    fieldGoals: {
      attempts: 4,
      made: 3,
      pct: 0.75,
      long: 42,
      trustRange: 37,
      aggression: 45,
      blocked: 0,
      patMade: 2,
      patAttempts: 2,
      patBlocked: 0,
      ranges: [
        { label: "<30", made: 1, att: 1 },
        { label: "30-39", made: 1, att: 1 },
        { label: "40-49", made: 1, att: 2 },
        { label: "50+", made: 0, att: 0 },
      ],
      contributors: [
        { name: "Villagomez,Carlos", role: "K", line: "3/4 FG / long 42" },
        { name: "Webb,Aiden", role: "H", line: "FG/PAT holder" },
        { name: "Skartvedt,Drew", role: "LS", line: "FG operation" },
      ],
    },
  },
  jsu: {
    shortName: "JSU",
    side: "Home",
    colors: { primary: "#002147", accent: "#4A90D9" },
    avgStart: 24.75,
    hiddenYards: 10,
    summary: { swing: -20, penaltyCost: 20, plays: 15 },
    kickoff: {
      attempts: 5,
      touchbackRate: 0,
      avgStartAllowed: 27.2,
      espa: -1.3,
      returnRateAllowed: 1,
      avgReturnAllowed: 14,
      explosivesAllowed: 0,
      contributors: [
        { name: "Baeza,Gerardo", role: "K", line: "5 KO / 27.2 avg start allowed" },
        { name: "Simmons,Errick", role: "KR", line: "multiple returns" },
        { name: "Hawkins,Shamar", role: "COV", line: "kick coverage tackle" },
      ],
    },
    punt: {
      attempts: 6,
      gross: 38.5,
      inside20: 0,
      inside10: 0,
      fairCatch: 0,
      returnRateAllowed: null,
      avgReturnAllowed: null,
      nyoe: 0,
      blocks: 0,
      contributors: [
        { name: "Collins,Kye", role: "P/H", line: "6 punts / 38.5 gross" },
        { name: "Fortilien,Joanes", role: "KR", line: "17-yard return" },
        { name: "Ware,Jaylan", role: "COV", line: "punt coverage tackle" },
      ],
    },
    fieldGoals: {
      attempts: 0,
      made: 0,
      pct: null,
      long: 0,
      trustRange: 0,
      aggression: 0,
      blocked: 0,
      patMade: 3,
      patAttempts: 4,
      patBlocked: 1,
      ranges: [
        { label: "<30", made: 0, att: 0 },
        { label: "30-39", made: 0, att: 0 },
        { label: "40-49", made: 0, att: 0 },
        { label: "50+", made: 0, att: 0 },
      ],
      contributors: [
        { name: "Baeza,Gerardo", role: "K", line: "3/4 PAT / 1 blocked" },
        { name: "Collins,Kye", role: "H", line: "PAT holder" },
        { name: "Burns,Hunter", role: "LS", line: "PAT operation" },
      ],
    },
  },
};

const fmtPct = (n) => (n == null ? "—" : `${Math.round(n * 100)}%`);
const fmt1 = (n) => (n == null ? "—" : (n ?? 0).toFixed(1));
const signed = (n) => (n > 0 ? `+${n}` : String(n));

function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

const SummaryStrip = () => (
  <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" p="6px" borderBottom="1px solid rgba(255,255,255,0.08)">
    {[SPECIAL_TEAMS_PRODUCTION.pvamu, SPECIAL_TEAMS_PRODUCTION.jsu].map((team) => (
      <Box key={team.shortName} bg={`linear-gradient(90deg, ${team.colors.primary}55 0%, rgba(255,255,255,0.025) 74%)`} border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" px="7px" py="6px">
        <Flex align="center" justify="space-between" mb="5px">
          <Flex align="center" gap={2}>
            <Box w="4px" h="16px" bg={team.colors.accent} borderRadius="sm" />
            <Text fontSize="clamp(12px, 1vw, 16px)" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.04em">
              {team.shortName} Special Teams
            </Text>
          </Flex>
          <Text fontSize="7px" color="text.muted" fontWeight="900" textTransform="uppercase">{team.side}</Text>
        </Flex>
        <Grid templateColumns="repeat(5, 1fr)" gap="4px">
          {[
            { label: "ST Plays", value: team.summary.plays, color: team.colors.accent },
            { label: "ST Swing", value: signed(team.summary.swing), color: team.summary.swing >= 0 ? "#68D391" : "#E53E3E" },
            { label: "Hidden", value: signed(team.hiddenYards), color: team.hiddenYards >= 0 ? "#68D391" : "#E53E3E" },
            { label: "Penalty", value: team.summary.penaltyCost, color: "#F6AD55" },
            { label: "Avg Start", value: fmt1(team.avgStart), color: "#63B3ED" },
          ].map((stat) => (
            <Flex key={stat.label} direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" py="4px" minW={0}>
              <Text fontSize="clamp(10px, 0.9vw, 13px)" color={stat.color} fontWeight="950" lineHeight={1}>{stat.value}</Text>
              <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{stat.label}</Text>
            </Flex>
          ))}
        </Grid>
      </Box>
    ))}
  </Grid>
);

const PhaseRow = ({ title, phase, children }) => (
  <Grid templateColumns="46px repeat(2, minmax(0, 1fr))" gap="6px" px="6px" minH={0}>
    <Flex align="center" justify="center" bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm">
      <Text
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        fontSize="8px"
        color="text.muted"
        fontWeight="950"
        textTransform="uppercase"
        letterSpacing="0.08em"
      >
        {title}
      </Text>
    </Flex>
    <PhaseCard team={SPECIAL_TEAMS_PRODUCTION.pvamu} phase={phase}>{children?.pvamu}</PhaseCard>
    <PhaseCard team={SPECIAL_TEAMS_PRODUCTION.jsu} phase={phase}>{children?.jsu}</PhaseCard>
  </Grid>
);

const PhaseCard = ({ team, phase }) => {
  const data = team[phase];
  const accent = team.colors.accent;
  const body = {
    fieldGoals: <FieldGoalBody data={data} accent={accent} />,
    kickoff: <KickoffBody data={data} accent={accent} />,
    punt: <PuntBody data={data} accent={accent} />,
  }[phase];

  return (
    <Grid templateColumns="minmax(0, 1.28fr) minmax(128px, 0.72fr)" gap="6px" minH={0} bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" p="6px" overflow="hidden">
      <VStack align="stretch" gap="5px" minH={0}>
        <Flex align="center" justify="space-between">
          <Text fontSize="clamp(10px, 0.86vw, 13px)" color="text.primary" fontWeight="950" textTransform="uppercase">{team.shortName}</Text>
          <Text fontSize="7px" color={accent} fontWeight="900" textTransform="uppercase">{phase === "fieldGoals" ? "FG / PAT" : phase}</Text>
        </Flex>
        {body}
      </VStack>
      <ContributorList contributors={data.contributors} accent={accent} />
    </Grid>
  );
};

const MiniStat = ({ label, value, color = "text.primary" }) => (
  <Flex direction="column" align="center" justify="center" bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" py="4px" minW={0}>
    <Text fontSize="clamp(10px, 0.88vw, 13px)" color={color} fontWeight="950" lineHeight={1}>{value}</Text>
    <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>{label}</Text>
  </Flex>
);

const FieldGoalBody = ({ data, accent }) => (
  <VStack align="stretch" gap="5px">
    <Grid templateColumns="repeat(4, 1fr)" gap="4px">
      <MiniStat label="FG" value={`${data.made}/${data.attempts}`} color={accent} />
      <MiniStat label="FG%" value={fmtPct(data.pct)} color="#68D391" />
      <MiniStat label="Long" value={data.long || "—"} color="#63B3ED" />
      <MiniStat label="PAT" value={`${data.patMade}/${data.patAttempts}`} color={data.patBlocked ? "#E53E3E" : "text.primary"} />
    </Grid>
    <Grid templateColumns="repeat(4, 1fr)" gap="3px">
      {data.ranges.map((range) => (
        <Box key={range.label} bg={range.att ? "rgba(104,211,145,0.13)" : "rgba(255,255,255,0.025)"} border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" py="4px" textAlign="center">
          <Text fontSize="6px" color="text.muted" fontWeight="900">{range.label}</Text>
          <Text fontSize="9px" color="text.primary" fontWeight="950" mt="2px">{range.made}/{range.att}</Text>
        </Box>
      ))}
    </Grid>
  </VStack>
);

const KickoffBody = ({ data, accent }) => (
  <VStack align="stretch" gap="5px">
    <Grid templateColumns="repeat(4, 1fr)" gap="4px">
      <MiniStat label="KO" value={data.attempts} color={accent} />
      <MiniStat label="TB" value={fmtPct(data.touchbackRate)} color="#63B3ED" />
      <MiniStat label="Start Allwd" value={fmt1(data.avgStartAllowed)} color="#F6AD55" />
      <MiniStat label="ESPA" value={fmt1(data.espa)} color={data.espa >= 0 ? "#68D391" : "#E53E3E"} />
    </Grid>
    <Grid templateColumns="repeat(3, 1fr)" gap="4px">
      <MiniStat label="Ret Rate" value={fmtPct(data.returnRateAllowed)} color="#F6AD55" />
      <MiniStat label="Ret Avg" value={fmt1(data.avgReturnAllowed)} color="#63B3ED" />
      <MiniStat label="Expl" value={data.explosivesAllowed} color={data.explosivesAllowed ? "#E53E3E" : "#68D391"} />
    </Grid>
  </VStack>
);

const PuntBody = ({ data, accent }) => (
  <VStack align="stretch" gap="5px">
    <Grid templateColumns="repeat(4, 1fr)" gap="4px">
      <MiniStat label="Punts" value={data.attempts} color={accent} />
      <MiniStat label="Gross" value={fmt1(data.gross)} color="#63B3ED" />
      <MiniStat label="I20" value={fmtPct(data.inside20)} color="#68D391" />
      <MiniStat label="NYOE" value={fmt1(data.nyoe)} color={data.nyoe >= 0 ? "#68D391" : "#E53E3E"} />
    </Grid>
    <Grid templateColumns="repeat(3, 1fr)" gap="4px">
      <MiniStat label="Ret Rate" value={fmtPct(data.returnRateAllowed)} color="#F6AD55" />
      <MiniStat label="Ret Avg" value={fmt1(data.avgReturnAllowed)} color="#63B3ED" />
      <MiniStat label="Blocks" value={data.blocks} color={data.blocks ? "#68D391" : "text.primary"} />
    </Grid>
  </VStack>
);

const ContributorList = ({ contributors, accent }) => (
  <VStack align="stretch" gap="4px" minH={0} borderLeft="1px solid rgba(255,255,255,0.08)" pl="6px">
    <Text fontSize="6px" color="text.muted" fontWeight="900" textTransform="uppercase">contributors</Text>
    {contributors.map((player) => (
      <Grid key={`${player.name}-${player.role}`} templateColumns="28px minmax(0, 1fr)" gap="5px" alignItems="center" minW={0}>
        <Flex w="24px" h="20px" align="center" justify="center" bg={`${accent}22`} border={`1px solid ${accent}66`} borderRadius="sm">
          <Text fontSize="6px" color={accent} fontWeight="950">{player.role}</Text>
        </Flex>
        <Box minW={0}>
          <Text fontSize="8px" color="text.primary" fontWeight="900" truncate>{displayName(player.name)}</Text>
          <Text fontSize="6px" color="text.muted" fontWeight="800" truncate>{player.line}</Text>
        </Box>
      </Grid>
    ))}
  </VStack>
);

export const GameProductionSpecialTeamsA = () => (
  <Flex w="full" h="full" direction="column" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <SummaryStrip />
    <Grid templateRows="repeat(3, minmax(0, 1fr))" gap="6px" flex={1} minH={0} py="6px">
      <PhaseRow title="Field Goals" phase="fieldGoals" />
      <PhaseRow title="Kickoffs" phase="kickoff" />
      <PhaseRow title="Punts" phase="punt" />
    </Grid>
  </Flex>
);
