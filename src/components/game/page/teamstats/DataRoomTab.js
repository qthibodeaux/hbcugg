import { createContext, useContext } from "react";
import { Box, Flex, Grid, Text, VStack, Tooltip } from "@chakra-ui/react";
import { useGameAnalytics } from "./useGameAnalytics";
import { getTeamLabel, getTeamColor } from "../utils/teamHelpers";

// ─── Formatters ──────────────────────────────────────────────────────────────
const fNum = (v, d = 0) => {
  if (v == null || v === "—" || Number.isNaN(Number(v))) return "—";
  return Number(v).toFixed(d);
};
const fPct = (v) => {
  if (v == null || v === "—" || Number.isNaN(Number(v))) return "—";
  return `${Math.round(Number(v) * 100)}%`;
};
const fSigned = (v, d = 1) => {
  if (v == null || v === "—" || Number.isNaN(Number(v))) return "—";
  const n = Number(v);
  return `${n > 0 ? "+" : ""}${n.toFixed(d)}`;
};
const fRatio = (made, att) => {
  if (made == null || att == null) return "—";
  return `${made}/${att}`;
};

// ─── Stat Row ────────────────────────────────────────────────────────────────
const StatRow = ({ label, away, home, format = "num", dec = 1, lowerIsBetter, tooltip }) => {
  const awayVal = away?.value ?? away;
  const homeVal = home?.value ?? home;

  const formatVal = (v) => {
    if (v == null || v === "—") return "—";
    if (format === "pct") return fPct(v);
    if (format === "signed") return fSigned(v, dec);
    if (format === "int") return fNum(v, 0);
    if (format === "ratio") return v;
    return fNum(v, dec);
  };

  const aStr = formatVal(awayVal);
  const hStr = formatVal(homeVal);

  const aNum = Number(awayVal);
  const hNum = Number(homeVal);
  const aValid = !Number.isNaN(aNum) && awayVal != null;
  const hValid = !Number.isNaN(hNum) && homeVal != null;

  let aWins = null;
  if (aValid && hValid) {
    aWins = lowerIsBetter ? aNum <= hNum : aNum >= hNum;
  }

  const rowContent = (
    <Grid
      templateColumns="1fr 100px 100px"
      gap={2}
      px={3}
      py={2}
      alignItems="center"
      _hover={{ bg: "whiteAlpha.50" }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
    >
      <Text fontSize="11px" fontWeight="800" color="text.secondary" textTransform="uppercase" letterSpacing="0.02em">
        {label}
      </Text>
      <Text
        fontSize="12px"
        fontWeight="900"
        fontFamily="mono"
        color={aWins === true ? "#48BB78" : "text.primary"}
        textAlign="right"
      >
        {aStr}
      </Text>
      <Text
        fontSize="12px"
        fontWeight="900"
        fontFamily="mono"
        color={aWins === false ? "#48BB78" : "text.primary"}
        textAlign="right"
      >
        {hStr}
      </Text>
    </Grid>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} positioning={{ placement: "top" }}>
        {rowContent}
      </Tooltip>
    );
  }
  return rowContent;
};

// ─── Jump targets (mobile) ───────────────────────────────────────────────────
// The mobile game page's jump sheet lists these; each card registers its ref
// from the scroll-spy (useJumpSections) through context. Desktop passes none.
export const TEAM_STATS_PARTS = [
  { id: "overview", label: "Overview" },
  ...[
    "Expected Points & EPA", "Success Rates & Situational", "Explosiveness & Big Plays", "Passing Splits",
    "Rushing Splits", "Drive Efficiency & Finishing", "Third & Fourth Downs", "Defensive Performance",
    "Turnovers & Luck", "Special Teams", "Penalties & Discipline", "Coaching & Tendencies", "Sequence & Momentum",
  ].map((label) => ({ id: jumpId(label), label })),
];
function jumpId(title) { return `ts-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`; }
const JUMP_MARGIN = "calc(var(--app-header-height) + 2.8rem)";
const JumpRefs = createContext(null);
const jumpProps = (refs, id) => (refs ? { ref: refs[id], "data-jump": id, style: { scrollMarginTop: JUMP_MARGIN } } : {});

// ─── Section Card ────────────────────────────────────────────────────────────
const SectionCard = ({ title, children }) => {
  const refs = useContext(JumpRefs);
  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" {...jumpProps(refs, jumpId(title))}>
      <Flex
        px={4}
        py={2.5}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        align="center"
        gap={2}
      >
        <Box w="3.5px" h="11px" bg="brand.500" borderRadius="xs" />
        <Box flex={1}>
          <Text fontSize="11px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
            {title}
          </Text>
        </Box>
      </Flex>
      <VStack gap={0} align="stretch">
        <Grid templateColumns="1fr 100px 100px" gap={2} px={3} py={1.5} bg="whiteAlpha.50" alignItems="center">
          <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">
            Metric
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" textAlign="right" letterSpacing="0.06em">
            Away
          </Text>
          <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" textAlign="right" letterSpacing="0.06em">
            Home
          </Text>
        </Grid>
        {children}
      </VStack>
    </Box>
  );
};

// ─── Overview Bar ────────────────────────────────────────────────────────────
const OverviewBar = ({ away, home, awayId, homeId }) => {
  const awayColor = getTeamColor(awayId);
  const homeColor = getTeamColor(homeId);
  const awayName = getTeamLabel(awayId);
  const homeName = getTeamLabel(homeId);

  const items = [
    { label: "Plays", away: away.playsOffense, home: home.playsOffense, format: "int" },
    { label: "Yards", away: away.totalYards, home: home.totalYards, format: "int" },
    { label: "YPP", away: away.yardsPerPlay, home: home.yardsPerPlay, format: "num", dec: 1 },
    { label: "Success", away: away.successRate, home: home.successRate, format: "pct" },
    { label: "EPA", away: away.epaTotal, home: home.epaTotal, format: "signed", dec: 1 },
    { label: "EPA/Play", away: away.epaPerPlay, home: home.epaPerPlay, format: "signed", dec: 3 },
    { label: "Explosive", away: away.explosiveRate, home: home.explosiveRate, format: "pct" },
    { label: "Havoc", away: away.havocRateForced, home: home.havocRateForced, format: "pct" },
    { label: "TO Margin", away: away.turnoverMargin, home: home.turnoverMargin, format: "signed", dec: 0 },
  ];

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" overflow="hidden" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Flex align="center" gap={3}>
          <Box w="6px" h="24px" bg={awayColor} borderRadius="sm" />
          <Text fontSize="lg" fontWeight="black" color="text.primary" letterSpacing="0.02em">{awayName}</Text>
        </Flex>
        <Text fontSize="xs" fontWeight="950" color="text.muted" textTransform="uppercase" letterSpacing="0.1em">VS</Text>
        <Flex align="center" gap={3}>
          <Text fontSize="lg" fontWeight="black" color="text.primary" letterSpacing="0.02em">{homeName}</Text>
          <Box w="6px" h="24px" bg={homeColor} borderRadius="sm" />
        </Flex>
      </Flex>
      <Grid templateColumns={{ base: "repeat(3, 1fr)", md: "repeat(9, 1fr)" }} gap={3}>
        {items.map((item) => {
          const aNum = Number(item.away);
          const hNum = Number(item.home);
          const aValid = !Number.isNaN(aNum) && item.away != null;
          const hValid = !Number.isNaN(hNum) && item.home != null;
          let aWins = null;
          if (aValid && hValid) aWins = aNum >= hNum;

          const fmt = (v) => {
            if (v == null) return "—";
            if (item.format === "pct") return fPct(v);
            if (item.format === "signed") return fSigned(v, item.dec ?? 1);
            if (item.format === "int") return fNum(v, 0);
            return fNum(v, item.dec ?? 1);
          };

          return (
            <Box key={item.label} textAlign="center" p={2} bg="whiteAlpha.50" borderRadius="sm">
              <Text fontSize="9px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em" mb={1}>
                {item.label}
              </Text>
              <Flex justify="center" gap={2}>
                <Text fontSize="sm" fontWeight="900" fontFamily="mono" color={aWins === true ? "#48BB78" : "text.primary"}>
                  {fmt(item.away)}
                </Text>
                <Text fontSize="sm" color="text.muted">|</Text>
                <Text fontSize="sm" fontWeight="900" fontFamily="mono" color={aWins === false ? "#48BB78" : "text.primary"}>
                  {fmt(item.home)}
                </Text>
              </Flex>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
};

// ─── Data Quality Panel ──────────────────────────────────────────────────────
// Internal (schema, field coverage, generated date) — off for launch.0 on desktop
// and mobile; flip to bring it back.
const SHOW_DATA_QUALITY = false;

const DataQualityPanel = ({ meta, away, home }) => {
  const countNative = (team) => Object.values(team).filter((v) => v != null && v !== "—").length;
  const aNative = countNative(away);
  const hNative = countNative(home);
  const totalFields = Object.keys(away).length;

  return (
    <Box bg="bg.secondary" border="1px solid" borderColor="whiteAlpha.100" borderRadius="md" p={4}>
      <Text fontSize="11px" fontWeight="950" color="text.primary" textTransform="uppercase" letterSpacing="0.06em" mb={3}>
        Data Quality & Coverage
      </Text>
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={3}>
        {[
          ["Schema", meta.schema ?? "—"],
          ["Play Count", meta.playCount ?? "—"],
          ["Drive Count", meta.driveCount ?? "—"],
          ["Enrichment", meta.enrichmentVersion ?? "—"],
          ["Away Fields", `${aNative} / ${totalFields}`],
          ["Home Fields", `${hNative} / ${totalFields}`],
          ["Coverage", `${Math.round(((aNative + hNative) / (totalFields * 2)) * 100)}%`],
          ["Generated", meta.generatedAt ? new Date(meta.generatedAt).toLocaleDateString() : "—"],
        ].map(([label, value]) => (
          <Box key={label} bg="whiteAlpha.50" borderRadius="sm" p={2} textAlign="center">
            <Text fontSize="8px" color="text.muted" fontWeight="950" textTransform="uppercase" letterSpacing="0.06em">{label}</Text>
            <Text fontSize="sm" fontWeight="black" color="text.primary">{value}</Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export const DataRoomTab = ({ awayId, homeId, game, refs = null }) => {
  const analytics = useGameAnalytics(game, awayId, homeId);

  if (!analytics) {
    return (
      <Flex justify="center" py={20}>
        <Text color="text.muted">Loading analytics...</Text>
      </Flex>
    );
  }

  const { away, home, meta } = analytics;

  return (
    <JumpRefs.Provider value={refs}>
    <VStack gap={4} align="stretch" w="full">
      <Box {...jumpProps(refs, "overview")}>
        <OverviewBar away={away} home={home} awayId={awayId} homeId={homeId} />
      </Box>

      <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={4}>
        {/* Section 2: EPA Streams */}
        <SectionCard title="Expected Points & EPA">
          <StatRow label="Total Offensive EPA" away={away.offensiveEPA} home={home.offensiveEPA} format="signed" dec={2} />
          <StatRow label="EPA Per Play" away={away.epaPerPlay} home={home.epaPerPlay} format="signed" dec={3} />
          <StatRow label="Passing EPA" away={away.passingEPATotal} home={home.passingEPATotal} format="signed" dec={2} />
          <StatRow label="EPA Per Dropback" away={away.passingEPAPerDropback} home={home.passingEPAPerDropback} format="signed" dec={3} />
          <StatRow label="Rushing EPA" away={away.rushingEPATotal} home={home.rushingEPATotal} format="signed" dec={2} />
          <StatRow label="EPA Per Rush" away={away.rushingEPAPerCarry} home={home.rushingEPAPerCarry} format="signed" dec={3} />
          <StatRow label="Special Teams EPA" away={away.specialTeamsEPA} home={home.specialTeamsEPA} format="signed" dec={2} />
          <StatRow label="Penalty EPA" away={away.penaltyEPA} home={home.penaltyEPA} format="signed" dec={2} />
          <StatRow label="Total Game EPA" away={away.totalGameEPA} home={home.totalGameEPA} format="signed" dec={2} />
          <StatRow label="Competitive EPA" away={away.competitiveEPA} home={home.competitiveEPA} format="signed" dec={2} />
          <StatRow label="Competitive EPA/Play" away={away.competitiveEPAPerPlay} home={home.competitiveEPAPerPlay} format="signed" dec={3} />
          <StatRow label="Garbage Time Share" away={away.garbageTimeShare} home={home.garbageTimeShare} format="pct" lowerIsBetter />
          <StatRow label="H1 EPA" away={away.h1EPA} home={home.h1EPA} format="signed" dec={2} />
          <StatRow label="H2 EPA" away={away.h2EPA} home={home.h2EPA} format="signed" dec={2} />
          <StatRow label="Positive EPA Play Rate" away={away.positiveEPAPlayRate} home={home.positiveEPAPlayRate} format="pct" />
        </SectionCard>

        {/* Section 3: Success Rates */}
        <SectionCard title="Success Rates & Situational">
          <StatRow label="Overall Success Rate" away={away.overallSuccessRate} home={home.overallSuccessRate} format="pct" />
          <StatRow label="Standard Down Success" away={away.standardDownSuccess} home={home.standardDownSuccess} format="pct" />
          <StatRow label="Passing Down Success" away={away.passingDownSuccess} home={home.passingDownSuccess} format="pct" />
          <StatRow label="Early Down Success (1&2)" away={away.earlyDownSuccess} home={home.earlyDownSuccess} format="pct" />
          <StatRow label="Late Down Success (3&4)" away={away.lateDownSuccess} home={home.lateDownSuccess} format="pct" />
          <StatRow label="Goal-to-Go Success" away={away.goalToGoSuccess} home={home.goalToGoSuccess} format="pct" />
          <StatRow label="Two-Minute Success" away={away.twoMinuteSuccess} home={home.twoMinuteSuccess} format="pct" />
          <StatRow label="Middle 8 Success" away={away.middle8Success} home={home.middle8Success} format="pct" />
          <StatRow label="Passing Success Rate" away={away.passingSuccessRate} home={home.passingSuccessRate} format="pct" />
          <StatRow label="Rushing Success Rate" away={away.rushingSuccessRate} home={home.rushingSuccessRate} format="pct" />
        </SectionCard>

        {/* Section 4: Explosiveness */}
        <SectionCard title="Explosiveness & Big Plays">
          <StatRow label="Explosive Plays (Total)" away={away.explosivePlaysTotal} home={home.explosivePlaysTotal} format="int" />
          <StatRow label="Explosive Pass Plays" away={away.explosivePasses} home={home.explosivePasses} format="int" />
          <StatRow label="Explosive Rush Plays" away={away.explosiveRushes} home={home.explosiveRushes} format="int" />
          <StatRow label="Explosive Play Rate" away={away.explosiveRateYardage} home={home.explosiveRateYardage} format="pct" />
          <StatRow label="Explosive Rate (EPA)" away={away.explosiveRateEPA} home={home.explosiveRateEPA} format="pct" />
          <StatRow label="EPA Without Explosives" away={away.epaWithoutExplosives} home={home.epaWithoutExplosives} format="signed" dec={2} />
          <StatRow label="EPA Per Explosive Play" away={away.epaPerExplosivePlay} home={home.epaPerExplosivePlay} format="signed" dec={2} />
          <StatRow label="Explosive Drive Rate" away={away.explosiveDriveRate} home={home.explosiveDriveRate} format="pct" />
        </SectionCard>

        {/* Section 5: Passing */}
        <SectionCard title="Passing Splits">
          <StatRow label="Pass Attempts" away={away.passAttempts} home={home.passAttempts} format="int" />
          <StatRow label="Completions" away={away.passCompletions} home={home.passCompletions} format="int" />
          <StatRow label="Completion %" away={away.completionPct} home={home.completionPct} format="pct" />
          <StatRow label="Passing Yards" away={away.passYards} home={home.passYards} format="int" />
          <StatRow label="Yards Per Attempt" away={away.yardsPerAttempt} home={home.yardsPerAttempt} format="num" dec={1} />
          <StatRow label="Yards Per Completion" away={away.yardsPerCompletion} home={home.yardsPerCompletion} format="num" dec={1} />
          <StatRow label="Passing Touchdowns" away={away.passTouchdowns} home={home.passTouchdowns} format="int" />
          <StatRow label="Interceptions Thrown" away={away.interceptionsThrown} home={home.interceptionsThrown} format="int" lowerIsBetter />
          <StatRow label="Sacks Allowed" away={away.sacksAllowed} home={home.sacksAllowed} format="int" lowerIsBetter />
          <StatRow label="Sack Rate" away={away.sackRate} home={home.sackRate} format="pct" lowerIsBetter />
          <StatRow label="Sack Yards Lost" away={away.sackYardsLost} home={home.sackYardsLost} format="int" lowerIsBetter />
          <StatRow label="Net Yards Per Dropback" away={away.netYardsPerDropback} home={home.netYardsPerDropback} format="num" dec={1} />
          <StatRow label="Passing EPA" away={away.passingEPA} home={home.passingEPA} format="signed" dec={2} />
          <StatRow label="EPA Per Dropback" away={away.epaPerDropback} home={home.epaPerDropback} format="signed" dec={3} />
          <StatRow label="Pass Success Rate" away={away.passSuccessRate} home={home.passSuccessRate} format="pct" />
          <StatRow label="Pass Explosive Rate" away={away.passExplosiveRate} home={home.passExplosiveRate} format="pct" />
          <StatRow label="Pressure Rate Faced" away={away.pressureRateFaced} home={home.pressureRateFaced} format="pct" lowerIsBetter />
          <StatRow label="Pressure Completion %" away={away.pressureCompletionPct} home={home.pressureCompletionPct} format="pct" />
          <StatRow label="Hurries Faced" away={away.hurriesFaced} home={home.hurriesFaced} format="int" lowerIsBetter />
        </SectionCard>

        {/* Section 6: Rushing */}
        <SectionCard title="Rushing Splits">
          <StatRow label="Rush Attempts" away={away.rushAttempts} home={home.rushAttempts} format="int" />
          <StatRow label="Rushing Yards" away={away.rushYards} home={home.rushYards} format="int" />
          <StatRow label="Rushing Yards After Sacks" away={away.netRushYards} home={home.netRushYards} format="int" />
          <StatRow label="Yards Per Carry" away={away.yardsPerCarry} home={home.yardsPerCarry} format="num" dec={1} />
          <StatRow label="Rushing Touchdowns" away={away.rushTouchdowns} home={home.rushTouchdowns} format="int" />
          <StatRow label="Rushing EPA" away={away.rushingEPA} home={home.rushingEPA} format="signed" dec={2} />
          <StatRow label="EPA Per Rush" away={away.epaPerRush} home={home.epaPerRush} format="signed" dec={3} />
          <StatRow label="Rush Success Rate" away={away.rushSuccessRate} home={home.rushSuccessRate} format="pct" />
          <StatRow label="Rush Explosive Rate" away={away.rushExplosiveRate} home={home.rushExplosiveRate} format="pct" />
          <StatRow label="Line Yards Total" away={away.lineYardsTotal} home={home.lineYardsTotal} format="num" dec={1} />
          <StatRow label="Line Yards / Rush" away={away.lineYardsPerRush} home={home.lineYardsPerRush} format="num" dec={2} />
          <StatRow label="Highlight Yards Total" away={away.highlightYardsTotal} home={home.highlightYardsTotal} format="num" dec={1} />
          <StatRow label="Highlight Yards / Rush" away={away.highlightYardsPerRush} home={home.highlightYardsPerRush} format="num" dec={2} />
          <StatRow label="Opportunity Rate" away={away.opportunityRate} home={home.opportunityRate} format="pct" />
          <StatRow label="Stuff Rate" away={away.stuffRate} home={home.stuffRate} format="pct" lowerIsBetter />
          <StatRow label="Stopped Run Rate" away={away.stoppedRunRate} home={home.stoppedRunRate} format="pct" lowerIsBetter />
          <StatRow label="Power Run Attempts" away={away.powerRunAttempts} home={home.powerRunAttempts} format="int" />
          <StatRow label="Power Success Rate" away={away.powerSuccessRate} home={home.powerSuccessRate} format="pct" />
          <StatRow label="1st Down Run Rate" away={away.firstDownRunRate} home={home.firstDownRunRate} format="pct" />
        </SectionCard>

        {/* Section 7: Drive Efficiency */}
        <SectionCard title="Drive Efficiency & Finishing">
          <StatRow label="Offensive Drives" away={away.drivesOffense} home={home.drivesOffense} format="int" />
          <StatRow label="Points Per Drive" away={away.pointsPerDrive} home={home.pointsPerDrive} format="num" dec={2} />
          <StatRow label="Avg Start Field Position" away={away.avgStartFieldPosition} home={home.avgStartFieldPosition} format="num" dec={1} />
          <StatRow label="Long Field Drives" away={away.longFieldDrives} home={home.longFieldDrives} format="int" />
          <StatRow label="Long Field Rate" away={away.longFieldRate} home={home.longFieldRate} format="pct" />
          <StatRow label="Quality Drive Rate" away={away.qualityDriveRate} home={home.qualityDriveRate} format="pct" />
          <StatRow label="Negative Drive Rate" away={away.negativeDriveRate} home={home.negativeDriveRate} format="pct" lowerIsBetter />
          <StatRow label="Points Per Quality Drive" away={away.pointsPerQualityDrive} home={home.pointsPerQualityDrive} format="num" dec={1} />
          <StatRow label="Opportunities Inside 40" away={away.opportunitiesInside40} home={home.opportunitiesInside40} format="int" />
          <StatRow label="Points Per Opp Inside 40" away={away.pointsPerOppInside40} home={home.pointsPerOppInside40} format="num" dec={1} />
          <StatRow label="Red Zone Opportunities" away={away.redZoneOpportunities} home={home.redZoneOpportunities} format="int" />
          <StatRow label="Red Zone Points / Opp" away={away.redZonePointsPerOpp} home={home.redZonePointsPerOpp} format="num" dec={1} />
          <StatRow label="Red Zone TD Rate" away={away.redZoneTDRate} home={home.redZoneTDRate} format="pct" />
          <StatRow label="Scoring Drives" away={away.scoringDrives} home={home.scoringDrives} format="int" />
          <StatRow label="Scoring Drive Rate" away={away.scoringDriveRate} home={home.scoringDriveRate} format="pct" />
          <StatRow label="TD Drive Rate" away={away.tdDriveRate} home={home.tdDriveRate} format="pct" />
          <StatRow label="Punt Drive Rate" away={away.puntDriveRate} home={home.puntDriveRate} format="pct" lowerIsBetter />
          <StatRow label="3-and-Out Rate" away={away.threeAndOutRate} home={home.threeAndOutRate} format="pct" lowerIsBetter />
          <StatRow label="Sustained Drive Rate (8+)" away={away.sustainedDriveRate} home={home.sustainedDriveRate} format="pct" />
          <StatRow label="Plays Per Drive" away={away.playsPerDrive} home={home.playsPerDrive} format="num" dec={1} />
          <StatRow label="Yards Per Drive" away={away.yardsPerDrive} home={home.yardsPerDrive} format="num" dec={1} />
          <StatRow label="Time of Possession" away={away.timeOfPossession} home={home.timeOfPossession} format="ratio" />
        </SectionCard>

        {/* Section 8: Third & Fourth Downs */}
        <SectionCard title="Third & Fourth Downs">
          <StatRow label="3rd Down Attempts" away={away.thirdDownAttempts} home={home.thirdDownAttempts} format="int" />
          <StatRow label="3rd Down Conversions" away={away.thirdDownConversions} home={home.thirdDownConversions} format="int" />
          <StatRow label="3rd Down Conversion Rate" away={away.thirdDownRate} home={home.thirdDownRate} format="pct" />
          <StatRow label="Avg 3rd Down Distance" away={away.thirdDownAvgDistance} home={home.thirdDownAvgDistance} format="num" dec={1} lowerIsBetter />
          <StatRow label="4th Down Goes" away={away.fourthDownGoes} home={home.fourthDownGoes} format="int" />
          <StatRow label="4th Down Conversions" away={away.fourthDownConversions} home={home.fourthDownConversions} format="int" />
          <StatRow label="4th Down Go Rate" away={away.fourthDownGoRate} home={home.fourthDownGoRate} format="pct" />
          <StatRow label="4th Down Conversion Rate" away={away.fourthDownConversionRate} home={home.fourthDownConversionRate} format="pct" />
        </SectionCard>

        {/* Section 9: Defense */}
        <SectionCard title="Defensive Performance">
          <StatRow label="Sacks Made" away={away.sacksMade} home={home.sacksMade} format="int" />
          <StatRow label="Sack Yards Forced" away={away.sackYardsForced} home={home.sackYardsForced} format="int" />
          <StatRow label="Sack Rate Forced" away={away.sackRateForced} home={home.sackRateForced} format="pct" />
          <StatRow label="TFL Rate Forced" away={away.tflRateForced} home={home.tflRateForced} format="pct" />
          <StatRow label="Havoc Rate Forced" away={away.havocRateForced} home={home.havocRateForced} format="pct" />
          <StatRow label="Havoc Rate Allowed" away={away.havocRateAllowed} home={home.havocRateAllowed} format="pct" lowerIsBetter />
          <StatRow label="Pass Defended Rate Forced" away={away.passDefendedRateForced} home={home.passDefendedRateForced} format="pct" />
          <StatRow label="Disruption Rate" away={away.disruptionRate} home={home.disruptionRate} format="pct" />
          <StatRow label="Explosive Prevention" away={away.explosivePreventionRate} home={home.explosivePreventionRate} format="pct" />
          <StatRow label="Yards Per Play Allowed" away={away.yardsPerPlayAllowed} home={home.yardsPerPlayAllowed} format="num" dec={1} lowerIsBetter />
          <StatRow label="Bend-Don't-Break Index" away={away.bendDontBreakIndex} home={home.bendDontBreakIndex} format="num" dec={2} />
          <StatRow label="Defensive Plays" away={away.defPlays} home={home.defPlays} format="int" />
          <StatRow label="Pressure Rate Forced" away={away.pressureRateForced} home={home.pressureRateForced} format="pct" />
          <StatRow label="Total Pressures Forced" away={away.totalPressuresForced} home={home.totalPressuresForced} format="int" />
          <StatRow label="QB Hurries Forced" away={away.qbHurriesForced} home={home.qbHurriesForced} format="int" />
          <StatRow label="Sacks Forced" away={away.sacksForced} home={home.sacksForced} format="int" />
          <StatRow label="Drives Faced" away={away.drivesFaced} home={home.drivesFaced} format="int" />
          <StatRow label="Stops (Punt)" away={away.defStopsPunt} home={home.defStopsPunt} format="int" />
          <StatRow label="Stops (Turnover)" away={away.defStopsTurnover} home={home.defStopsTurnover} format="int" />
          <StatRow label="Stops (Downs)" away={away.defStopsDowns} home={home.defStopsDowns} format="int" />
          <StatRow label="TDs Allowed" away={away.defAllowedTD} home={home.defAllowedTD} format="int" lowerIsBetter />
          <StatRow label="FGs Allowed" away={away.defAllowedFG} home={home.defAllowedFG} format="int" lowerIsBetter />
          <StatRow label="3-and-Outs Forced" away={away.defThreeAndOutsForced} home={home.defThreeAndOutsForced} format="int" />
        </SectionCard>

        {/* Section 10: Turnovers */}
        <SectionCard title="Turnovers & Luck">
          <StatRow label="Turnovers Committed" away={away.turnoversCommitted} home={home.turnoversCommitted} format="int" lowerIsBetter />
          <StatRow label="Turnovers Forced" away={away.turnoversForced} home={home.turnoversForced} format="int" />
          <StatRow label="Expected Turnovers" away={away.expectedTurnovers} home={home.expectedTurnovers} format="num" dec={2} lowerIsBetter />
          <StatRow label="Actual Turnovers" away={away.actualTurnovers} home={home.actualTurnovers} format="int" />
          <StatRow label="Turnover Luck" away={away.turnoverLuck} home={home.turnoverLuck} format="signed" dec={2} />
          <StatRow label="Turnover Score Rate" away={away.turnoverScoreRate} home={home.turnoverScoreRate} format="pct" />
          <StatRow label="Turnover TD Count" away={away.turnoverTDCount} home={home.turnoverTDCount} format="int" />
          <StatRow label="Turnover TD Rate" away={away.turnoverTDRate} home={home.turnoverTDRate} format="pct" />
          <StatRow label="Sudden Change Defense" away={away.suddenChangeDefense} home={home.suddenChangeDefense} format="num" dec={2} />
          <StatRow label="Stabilization After Explosive" away={away.stabilizationAfterExplosive} home={home.stabilizationAfterExplosive} format="num" dec={2} />
        </SectionCard>

        {/* Section 11: Special Teams */}
        <SectionCard title="Special Teams">
          <StatRow label="FG Made" away={away.st?.fgMade} home={home.st?.fgMade} format="int" />
          <StatRow label="FG Attempts" away={away.st?.fgAtt} home={home.st?.fgAtt} format="int" />
          <StatRow label="FG Long" away={away.st?.fgLong} home={home.st?.fgLong} format="int" />
          <StatRow label="FG Blocked" away={away.st?.fgBlocked} home={home.st?.fgBlocked} format="int" lowerIsBetter />
          <StatRow label="EPA / FG Attempt" away={away.st?.fgEpa} home={home.st?.fgEpa} format="signed" dec={2} />
          <StatRow label="PAT Made" away={away.st?.patMade} home={home.st?.patMade} format="int" />
          <StatRow label="PAT Attempts" away={away.st?.patAtt} home={home.st?.patAtt} format="int" />
          <StatRow label="Two-Point Made" away={away.st?.twoMade} home={home.st?.twoMade} format="int" />
          <StatRow label="Two-Point Attempts" away={away.st?.twoAtt} home={home.st?.twoAtt} format="int" />
          <StatRow label="Punts" away={away.st?.punts} home={home.st?.punts} format="int" />
          <StatRow label="Punt Avg Gross" away={away.st?.puntGross} home={home.st?.puntGross} format="num" dec={1} />
          <StatRow label="Punt Avg Net" away={away.st?.puntNet} home={home.st?.puntNet} format="num" dec={1} />
          <StatRow label="Punts Inside 20" away={away.st?.puntIn20} home={home.st?.puntIn20} format="int" />
          <StatRow label="Punt Return Avg Allowed" away={away.st?.puntRetAllowed} home={home.st?.puntRetAllowed} format="num" dec={1} lowerIsBetter />
          <StatRow label="Opp Start After Punt" away={away.st?.puntStartAllowed} home={home.st?.puntStartAllowed} format="num" dec={1} lowerIsBetter />
          <StatRow label="EPA / Punt" away={away.st?.puntEpa} home={home.st?.puntEpa} format="signed" dec={2} />
          <StatRow label="Kickoffs" away={away.st?.kickoffs} home={home.st?.kickoffs} format="int" />
          <StatRow label="Kickoff Touchbacks" away={away.st?.koTouchbacks} home={home.st?.koTouchbacks} format="int" />
          <StatRow label="Kickoff Avg Distance" away={away.st?.koDistance} home={home.st?.koDistance} format="num" dec={1} />
          <StatRow label="Kick Return Avg Allowed" away={away.st?.koRetAllowed} home={home.st?.koRetAllowed} format="num" dec={1} lowerIsBetter />
          <StatRow label="Opp Start After Kickoff" away={away.st?.koStartAllowed} home={home.st?.koStartAllowed} format="num" dec={1} lowerIsBetter />
          <StatRow label="EPA / Kickoff" away={away.st?.koEpa} home={home.st?.koEpa} format="signed" dec={2} />
          <StatRow label="Kick Returns" away={away.st?.krReturns} home={home.st?.krReturns} format="int" />
          <StatRow label="Kick Return Avg" away={away.st?.krAvg} home={home.st?.krAvg} format="num" dec={1} />
          <StatRow label="Kick Return TDs" away={away.st?.krTd} home={home.st?.krTd} format="int" />
          <StatRow label="Punt Returns" away={away.st?.prReturns} home={home.st?.prReturns} format="int" />
          <StatRow label="Punt Return Avg" away={away.st?.prAvg} home={home.st?.prAvg} format="num" dec={1} />
          <StatRow label="Punt Return TDs" away={away.st?.prTd} home={home.st?.prTd} format="int" />
        </SectionCard>

        {/* Section 12: Penalties */}
        <SectionCard title="Penalties & Discipline">
          <StatRow label="Penalties (Box)" away={away.penaltiesCommitted} home={home.penaltiesCommitted} format="int" lowerIsBetter />
          <StatRow label="Penalty Yards (Box)" away={away.penaltyYardsCommitted} home={home.penaltyYardsCommitted} format="int" lowerIsBetter />
          <StatRow label="Penalties Accepted" away={away.penaltiesAccepted} home={home.penaltiesAccepted} format="int" lowerIsBetter />
          <StatRow label="Penalty Yards" away={away.penaltyYards} home={home.penaltyYards} format="int" lowerIsBetter />
          <StatRow label="Penalty Rate" away={away.penaltyRate} home={home.penaltyRate} format="pct" lowerIsBetter />
          <StatRow label="Pre-Snap Rate" away={away.preSnapRate} home={home.preSnapRate} format="pct" lowerIsBetter />
          <StatRow label="Live Ball Rate" away={away.liveBallRate} home={home.liveBallRate} format="pct" />
          <StatRow label="High Leverage Penalties" away={away.highLeveragePenalties} home={home.highLeveragePenalties} format="int" lowerIsBetter />
          <StatRow label="Drive Kills" away={away.driveKills} home={home.driveKills} format="int" lowerIsBetter />
          <StatRow label="Drive Extends" away={away.driveExtends} home={home.driveExtends} format="int" />
          <StatRow label="Hidden Yardage Lost" away={away.hiddenYardageLost} home={home.hiddenYardageLost} format="int" lowerIsBetter />
          <StatRow label="Hidden Yardage Gained" away={away.hiddenYardageGained} home={home.hiddenYardageGained} format="int" />
          <StatRow label="Auto First Downs Given" away={away.autoFirstDownsGiven} home={home.autoFirstDownsGiven} format="int" lowerIsBetter />
          <StatRow label="False Start on 3rd" away={away.falseStart3rdDown} home={home.falseStart3rdDown} format="int" lowerIsBetter />
          <StatRow label="Holding on Passing Down" away={away.holdingOnPassingDown} home={home.holdingOnPassingDown} format="int" lowerIsBetter />
          <StatRow label="Penalties in Red Zone" away={away.penaltiesInRedZone} home={home.penaltiesInRedZone} format="int" lowerIsBetter />
          <StatRow label="Penalties in Clutch Time" away={away.penaltiesInClutch} home={home.penaltiesInClutch} format="int" lowerIsBetter />
          <StatRow label="Penalties on 3rd Down" away={away.penaltiesOn3rd} home={home.penaltiesOn3rd} format="int" lowerIsBetter />
          <StatRow label="Penalties on 4th Down" away={away.penaltiesOn4th} home={home.penaltiesOn4th} format="int" lowerIsBetter />
          <StatRow label="Accepted Penalty EPA" away={away.acceptedPenaltyEPA} home={home.acceptedPenaltyEPA} format="signed" dec={2} lowerIsBetter />
          <StatRow label="Drives with Penalty" away={away.drivesWithPenalty} home={home.drivesWithPenalty} format="int" lowerIsBetter />
        </SectionCard>

        {/* Section 13: Coaching */}
        <SectionCard title="Coaching & Tendencies">
          <StatRow label="1st Down Run Rate" away={away.firstDownRunRate} home={home.firstDownRunRate} format="pct" />
          <StatRow label="2nd Down Run Rate" away={away.secondDownRunRate} home={home.secondDownRunRate} format="pct" />
          <StatRow label="3rd Down Run Rate" away={away.thirdDownRunRate} home={home.thirdDownRunRate} format="pct" />
          <StatRow label="1st Down Runs / Passes" away={{ value: fRatio(away.firstDownRuns, away.firstDownPasses) }} home={{ value: fRatio(home.firstDownRuns, home.firstDownPasses) }} format="ratio" />
          <StatRow label="Red Zone Run Rate" away={away.redZoneRunRate} home={home.redZoneRunRate} format="pct" />
          <StatRow label="Red Zone Runs / Passes" away={{ value: fRatio(away.redZoneRuns, away.redZonePasses) }} home={{ value: fRatio(home.redZoneRuns, home.redZonePasses) }} format="ratio" />
          <StatRow label="Obvious Pass Success" away={away.obviousPassSuccess} home={home.obviousPassSuccess} format="pct" />
          <StatRow label="Obvious Run Success" away={away.obviousRunSuccess} home={home.obviousRunSuccess} format="pct" />
          <StatRow label="Short Yardage Run Rate" away={away.shortYardageTendency} home={home.shortYardageTendency} format="pct" />
          <StatRow label="Predictability Index" away={away.predictabilityIndex} home={home.predictabilityIndex} format="num" dec={3} lowerIsBetter />
          <StatRow label="Halftime Adjustment" away={away.halftimeAdjustment} home={home.halftimeAdjustment} format="signed" dec={3} />
          <StatRow label="H1 Success Rate" away={away.h1SuccessRate} home={home.h1SuccessRate} format="pct" />
          <StatRow label="H2 Success Rate" away={away.h2SuccessRate} home={home.h2SuccessRate} format="pct" />
        </SectionCard>

        {/* Section 14: Sequence */}
        <SectionCard title="Sequence & Momentum">
          <StatRow label="After 3-and-Out" away={away.after3AndOut} home={home.after3AndOut} format="num" dec={2} />
          <StatRow label="After Own Turnover" away={away.afterOwnTurnover} home={home.afterOwnTurnover} format="num" dec={2} />
          <StatRow label="Max Consecutive Scoring Drives" away={away.maxConsecutiveScoringDrives} home={home.maxConsecutiveScoringDrives} format="int" />
          <StatRow label="Q4 Go-Ahead Drives" away={away.q4GoAheadDrives} home={home.q4GoAheadDrives} format="int" />
          <StatRow label="Q4 Lead Changes" away={away.q4LeadChanges} home={home.q4LeadChanges} format="int" />
          <StatRow label="Q4 Lead Takes" away={away.q4LeadTakes} home={home.q4LeadTakes} format="int" />
        </SectionCard>
      </Grid>

      {SHOW_DATA_QUALITY && <DataQualityPanel meta={meta} away={away} home={home} />}
    </VStack>
    </JumpRefs.Provider>
  );
};
