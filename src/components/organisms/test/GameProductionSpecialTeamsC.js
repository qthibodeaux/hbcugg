import {
  Box,
  Flex,
  Grid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { SPECIAL_TEAMS_PRODUCTION } from "./GameProductionSpecialTeamsA";

const TEAMS = SPECIAL_TEAMS_PRODUCTION;

const RETURN_DATA = {
  pvamu: {
    longFieldDriveRate: 0.667,
    kickoffValue: -2.67,
    puntNetValue: -5,
    kickReturners: [
      { name: "Kellen Stewart", ret: 2, yards: 45, avg: 22.5, long: 29 },
      { name: "Shadrick Byrd", ret: 2, yards: 0, avg: 0, long: 0, note: "2 fair catches" },
    ],
    puntReturners: [
      { name: "Andre Dennis", ret: 2, yards: 12, avg: 6, long: 7 },
    ],
  },
  jsu: {
    longFieldDriveRate: 0.833,
    kickoffValue: -1.3,
    puntNetValue: 0,
    kickReturners: [
      { name: "Errick Simmons", ret: 3, yards: 40, avg: 13.3, long: 19 },
      { name: "Travis Terrell Jr.", ret: 2, yards: 24, avg: 12, long: 24 },
      { name: "Jabari Jones", ret: 1, yards: 3, avg: 3, long: 3 },
    ],
    puntReturners: [
      { name: "Travis Terrell Jr.", ret: 2, yards: 0, avg: 0, long: 0, note: "2 fair catches" },
    ],
  },
};

const fmtPct = (n) => (n == null ? "--" : `${Math.round(n * 100)}%`);
const fmt1 = (n) => (n == null ? "--" : (n ?? 0).toFixed(1));
const signed = (n) => (n > 0 ? `+${n}` : String(n));
const tone = (n) => (n >= 0 ? "#68D391" : "#E53E3E");

function displayName(name) {
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",");
  return `${first.trim()} ${last.trim()}`;
}

const teamEntries = [
  ["pvamu", TEAMS.pvamu],
  ["jsu", TEAMS.jsu],
];

const ValueTile = ({ label, value, sub, color = "text.primary" }) => (
  <Flex
    direction="column"
    justify="center"
    minW={0}
    bg="rgba(255,255,255,0.04)"
    border="1px solid rgba(255,255,255,0.07)"
    borderRadius="sm"
    px="6px"
    py="5px"
  >
    <Text fontSize="clamp(10px, 0.78vw, 13px)" color={color} fontWeight="950" lineHeight={1}>
      {value}
    </Text>
    <Text fontSize="6px" color="text.primary" fontWeight="900" textTransform="uppercase" mt="3px" truncate>
      {label}
    </Text>
    {sub && (
      <Text fontSize="5.5px" color="text.muted" fontWeight="800" textTransform="uppercase" mt="1px" truncate>
        {sub}
      </Text>
    )}
  </Flex>
);

const TeamHeader = ({ team, extra }) => (
  <Flex align="center" justify="space-between" gap="8px" minH="26px">
    <Flex align="center" gap="7px" minW={0}>
      <Box w="4px" h="19px" bg={team.colors.accent} borderRadius="full" />
      <Box minW={0}>
        <Text fontSize="clamp(12px, 1vw, 17px)" color="text.primary" fontWeight="950" textTransform="uppercase" lineHeight={1} truncate>
          {team.shortName}
        </Text>
        <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="3px" truncate>
          special teams ledger
        </Text>
      </Box>
    </Flex>
    {extra}
  </Flex>
);

const FieldPositionLedger = ({ team, data }) => {
  const longFieldRate = data.longFieldDriveRate;
  const hiddenYards = team.hiddenYards;
  const swing = team.summary.swing;

  return (
    <Box
      bg={`linear-gradient(90deg, ${team.colors.primary}55 0%, rgba(255,255,255,0.025) 74%)`}
      border="1px solid rgba(255,255,255,0.08)"
      borderRadius="sm"
      p="6px"
      minH={0}
    >
      <TeamHeader
        team={team}
        extra={
          <Text fontSize="8px" color={tone(swing)} fontWeight="950" textTransform="uppercase">
            {signed(swing)} swing
          </Text>
        }
      />
      <Grid templateColumns="repeat(5, minmax(0, 1fr))" gap="4px" mt="6px">
        <ValueTile label="Avg Start" value={fmt1(team.avgStart)} sub="own drives" color="#63B3ED" />
        <ValueTile label="Long Field" value={fmtPct(longFieldRate)} sub="drive rate" color="#F6AD55" />
        <ValueTile label="Hidden Yds" value={signed(hiddenYards)} sub="field position" color={tone(hiddenYards)} />
        <ValueTile label="ST Plays" value={team.summary.plays} sub="tracked" color={team.colors.accent} />
        <ValueTile label="Penalty Cost" value={team.summary.penaltyCost} sub="yards" color="#F6AD55" />
      </Grid>
    </Box>
  );
};

const StatPill = ({ label, value, color = "text.primary" }) => (
  <Flex align="center" justify="space-between" gap="5px" bg="rgba(255,255,255,0.035)" border="1px solid rgba(255,255,255,0.06)" borderRadius="sm" px="6px" py="4px" minW={0}>
    <Text fontSize="6px" color="text.muted" fontWeight="850" textTransform="uppercase" truncate>
      {label}
    </Text>
    <Text fontSize="9px" color={color} fontWeight="950" lineHeight={1} flexShrink={0}>
      {value}
    </Text>
  </Flex>
);

const ReturnRows = ({ rows, accent }) => (
  <VStack align="stretch" gap="3px" minH={0}>
    {rows.slice(0, 3).map((row) => (
      <Grid key={row.name} templateColumns="minmax(0, 1fr) 28px 34px 28px" gap="4px" alignItems="center">
        <Box minW={0}>
          <Text fontSize="7px" color="text.primary" fontWeight="900" truncate>
            {row.name}
          </Text>
          <Text fontSize="5.5px" color="text.muted" fontWeight="750" truncate>
            {row.note || `${row.long} long`}
          </Text>
        </Box>
        <Text fontSize="8px" color={accent} fontWeight="950" textAlign="right">{row.ret}</Text>
        <Text fontSize="8px" color="text.primary" fontWeight="950" textAlign="right">{row.yards}</Text>
        <Text fontSize="8px" color="#63B3ED" fontWeight="950" textAlign="right">{fmt1(row.avg)}</Text>
      </Grid>
    ))}
  </VStack>
);

const PhaseBox = ({ title, children, accent }) => (
  <Box bg="rgba(255,255,255,0.025)" border="1px solid rgba(255,255,255,0.08)" borderRadius="sm" p="6px" minH={0} overflow="hidden">
    <Flex align="center" justify="space-between" mb="5px">
      <Text fontSize="8px" color="text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="0.03em">
        {title}
      </Text>
      <Box w="24px" h="3px" bg={accent} borderRadius="full" />
    </Flex>
    {children}
  </Box>
);

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

const RangeRail = ({ ranges, accent }) => (
  <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap="3px">
    {ranges.map((range) => (
      <Flex key={range.label} direction="column" align="center" justify="center" bg={range.att ? `${accent}22` : "rgba(255,255,255,0.025)"} border="1px solid rgba(255,255,255,0.07)" borderRadius="sm" py="4px" minW={0}>
        <Text fontSize="5.5px" color="text.muted" fontWeight="900">{range.label}</Text>
        <Text fontSize="8px" color="text.primary" fontWeight="950" mt="2px">{range.made}/{range.att}</Text>
      </Flex>
    ))}
  </Grid>
);

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

const TeamPanel = ({ teamKey, team }) => (
  <Flex direction="column" gap="6px" minH={0}>
    <FieldPositionLedger team={team} data={RETURN_DATA[teamKey]} />
    <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap="6px" flex="1" minH={0}>
      <KickoffSection teamKey={teamKey} team={team} />
      <PuntSection teamKey={teamKey} team={team} />
      <FieldGoalSection team={team} />
    </Grid>
  </Flex>
);

export const GameProductionSpecialTeamsC = () => (
  <Flex w="full" h="full" direction="column" bg="bg.secondary" borderRadius="lg" overflow="hidden" border="1px solid rgba(255,255,255,0.08)">
    <Flex align="center" justify="space-between" px="8px" py="6px" borderBottom="1px solid rgba(255,255,255,0.08)">
      <Box>
        <Text fontSize="10px" color="brand.500" fontWeight="950" textTransform="uppercase" letterSpacing="0.1em">
          Special Teams Production
        </Text>
        <Text fontSize="7px" color="text.muted" fontWeight="850" textTransform="uppercase" mt="2px">
          field position ledger - return game - kicking distance
        </Text>
      </Box>
      <Text fontSize="7px" color="text.secondary" fontWeight="900" textTransform="uppercase">
        W15 PVAMU at JSU
      </Text>
    </Flex>
    <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap="6px" flex="1" minH={0} p="6px">
      {teamEntries.map(([teamKey, team]) => (
        <TeamPanel key={teamKey} teamKey={teamKey} team={team} />
      ))}
    </Grid>
  </Flex>
);
