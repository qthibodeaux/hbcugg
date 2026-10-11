import { Box, Flex, Grid, Text, VStack } from "@chakra-ui/react";

const statRows = [
  { key: "epaPlay", label: "EPA / PLAY" },
  { key: "successRate", label: "SUCCESS RATE" },
  { key: "epaDropback", label: "EPA / DROPBACK" },
  { key: "epaRush", label: "EPA / RUSH" },
  { key: "explosiveRate", label: "EXPLOSIVE PLAY RATE" },
  { key: "yardsPass", label: "YARDS / DROPBACK" },
  { key: "yardsRush", label: "YARDS / RUSH" },
  { key: "lateDown", label: "LATE DOWN SR" },
  { key: "yardsDrive", label: "YARDS / DRIVE" },
];

// 2025 season to date, play-weighted across the games in
// inspo/clean/sfapvamustats.md (GameOnPaper, kneel-downs removed):
//   SFA (3 GP): McNeese, East Texas A&M, Abilene Christian
//   PVAMU (2 GP): Texas Southern, Tarleton State
// Offense = the team's own scrimmage plays summed, then divided (EPA / plays,
// successful / plays, pass yards / dropbacks …) — sums, not an average of the
// per-game rates. Defense = the opponents' offensive lines in those games, so
// a positive EPA on a defense column is EPA *allowed*. "Late down SR" is
// GOP's 3rd + 4th down successful plays / late-down plays (the sheet doesn't
// split out 3rd-down attempts). GOP's per-game ranks are percentiles against
// FBS single-game performances, so there's no season rank to print.
const matchupData = {
  sfaOffense: {
    title: "SFA OFFENSE",
    accent: "#D7444B",
    games: 3,
    metrics: { epaPlay: 0.13, successRate: 0.47, epaDropback: 0.11, epaRush: 0.15, explosiveRate: 0.08, yardsPass: 7.82, yardsRush: 5.82, lateDown: 0.48, yardsDrive: 41.5 },
  },
  sfaDefense: {
    title: "SFA DEFENSE",
    accent: "#D7444B",
    games: 3,
    metrics: { epaPlay: -0.12, successRate: 0.4, epaDropback: -0.11, epaRush: 0.07, explosiveRate: 0.08, yardsPass: 5.87, yardsRush: 6.37, lateDown: 0.34, yardsDrive: 35.9 },
  },
  pvamuOffense: {
    title: "PVAMU OFFENSE",
    accent: "#8D4CC3",
    games: 2,
    metrics: { epaPlay: 0.27, successRate: 0.51, epaDropback: 0.32, epaRush: 0.23, explosiveRate: 0.08, yardsPass: 8.14, yardsRush: 7.96, lateDown: 0.5, yardsDrive: 39.9 },
  },
  pvamuDefense: {
    title: "PVAMU DEFENSE",
    accent: "#8D4CC3",
    games: 2,
    metrics: { epaPlay: 0.04, successRate: 0.45, epaDropback: -0.15, epaRush: 0.18, explosiveRate: 0.06, yardsPass: 5.53, yardsRush: 6.56, lateDown: 0.43, yardsDrive: 42.8 },
  },
};

const fmtSigned = (value, decimals = 2) => {
  const suffix = value >= 0 ? "+" : "";
  return `${suffix}${value.toFixed(decimals)}`;
};

const fmtPct = (value) => `${Math.round(value * 100)}%`;

const EPA_ROWS = new Set(["epaPlay", "epaDropback", "epaRush"]);

const formatMetric = (rowKey, value) => {
  if (rowKey === "successRate" || rowKey === "explosiveRate" || rowKey === "lateDown") {
    return fmtPct(value);
  }
  if (EPA_ROWS.has(rowKey)) {
    return fmtSigned(value, 2);
  }
  if (rowKey === "yardsPass" || rowKey === "yardsRush") {
    return value.toFixed(2);
  }
  if (rowKey === "yardsDrive") {
    return value.toFixed(1);
  }
  return String(value);
};

const StatColumn = ({ teamKey, data, isFirst = false }) => {
  const { title, accent } = data;
  const isDefense = teamKey.endsWith("Defense");

  return (
    <Box
      border="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(17,17,19,0.92)"
      borderRadius="lg"
      overflow="hidden"
      minH="100%"
      boxShadow={isFirst ? "inset 0 0 0 1px rgba(255,255,255,0.04)" : "none"}
    >
      <Flex
        align="center"
        justify="space-between"
        px={3}
        py={3}
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg="linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)"
      >
        <Text fontSize="11px" fontWeight="900" color="text.primary" letterSpacing="0.12em" textTransform="uppercase">
          {title}
        </Text>
        <Box
          minW="28px"
          h="20px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="full"
          bg={accent}
          color="white"
          fontSize="10px"
          fontWeight="800"
          px={1}
        >
          {data.games} GP
        </Box>
      </Flex>

      <VStack gap={0} align="stretch">
        {statRows.map((row, index) => {
          const currentValue = data.metrics[row.key];
          // Only the signed EPA rows carry a colour: green when the number is good
          // for this side of the ball (offense above zero, defense below).
          const tone = !EPA_ROWS.has(row.key) || currentValue === 0
            ? "text.primary"
            : (isDefense ? currentValue < 0 : currentValue > 0)
              ? "#9AE6B4"
              : "#F7B2A8";

          return (
            <Flex
              key={`${teamKey}-${row.key}`}
              align="center"
              justify="space-between"
              gap={2}
              px={3}
              py={2.5}
              borderBottom={index < statRows.length - 1 ? "1px solid" : "none"}
              borderColor="whiteAlpha.100"
              bg={index % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"}
            >
              <Text fontSize="10px" fontWeight="700" color="text.secondary" letterSpacing="0.05em">
                {row.label}
              </Text>

              <Text fontSize="15px" fontWeight="800" color={tone} letterSpacing="-0.02em" fontVariantNumeric="tabular-nums">
                {formatMetric(row.key, currentValue)}
              </Text>
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

// ─── Directional matrices ────────────────────────────────────────────────────
// GameOnPaper only splits college plays by Left / Middle / Right (and passes by
// Short 0–12 / Deep 12+ air yards) — no nine-box grid. These are the sums of
// each team's 2025 GOP rush and target matrices across the games in
// inspo/clean/sfapvamustats.md (SFA: McNeese, ETAMU, ACU · PVAMU: TSU, Tarleton).
// Offense = the team's own plays; defense = what its opponents did against it.
const LANES = ["L", "M", "R"];

const directionData = {
  sfaOffense: {
    rush: [{ epa: 5.66, car: 31, yds: 201 }, { epa: 8.95, car: 59, yds: 299 }, { epa: 2.21, car: 24, yds: 163 }],
    deep: [{ epa: 0.26, comp: 1, att: 3, yds: 33 }, { epa: -0.5, comp: 0, att: 1, yds: 0 }, { epa: -6.0, comp: 0, att: 5, yds: 0 }],
    short: [{ epa: -2.58, comp: 18, att: 31, yds: 151 }, { epa: 4.36, comp: 11, att: 13, yds: 180 }, { epa: 5.98, comp: 22, att: 31, yds: 223 }],
  },
  sfaDefense: {
    rush: [{ epa: 1.66, car: 13, yds: 104 }, { epa: 4.29, car: 36, yds: 234 }, { epa: -1.46, car: 16, yds: 76 }],
    deep: [{ epa: 5.03, comp: 1, att: 2, yds: 41 }, { epa: -2.18, comp: 0, att: 1, yds: 0 }, { epa: 11.28, comp: 5, att: 10, yds: 149 }],
    short: [{ epa: 10.97, comp: 20, att: 25, yds: 188 }, { epa: -0.42, comp: 6, att: 7, yds: 40 }, { epa: -3.33, comp: 18, att: 38, yds: 164 }],
  },
  pvamuOffense: {
    rush: [{ epa: 3.08, car: 12, yds: 96 }, { epa: 3.34, car: 31, yds: 242 }, { epa: 3.9, car: 13, yds: 112 }],
    deep: [{ epa: 0.0, comp: 0, att: 0, yds: 0 }, { epa: 1.98, comp: 1, att: 1, yds: 24 }, { epa: 8.56, comp: 4, att: 4, yds: 138 }],
    short: [{ epa: -1.46, comp: 14, att: 20, yds: 115 }, { epa: -1.9, comp: 9, att: 17, yds: 65 }, { epa: 13.48, comp: 19, att: 28, yds: 199 }],
  },
  pvamuDefense: {
    rush: [{ epa: 1.09, car: 19, yds: 97 }, { epa: 4.22, car: 40, yds: 203 }, { epa: 4.91, car: 22, yds: 186 }],
    deep: [{ epa: 0.43, comp: 1, att: 3, yds: 32 }, { epa: 1.65, comp: 1, att: 2, yds: 30 }, { epa: 0.87, comp: 1, att: 2, yds: 22 }],
    short: [{ epa: -1.79, comp: 9, att: 17, yds: 71 }, { epa: -1.0, comp: 5, att: 8, yds: 53 }, { epa: -2.8, comp: 13, att: 24, yds: 105 }],
  },
};

// Cell tint by total EPA, scaled to the biggest |EPA| among cells of that kind
// across all four columns so the two teams read on one scale. Offense: positive
// is green. Defense: positive is EPA *allowed*, so the colours flip.
const maxAbs = (kind) => Math.max(0.01, ...Object.values(directionData).flatMap((d) => d[kind].map((c) => Math.abs(c.epa))));
const EPA_MAX = { rush: maxAbs("rush"), pass: Math.max(maxAbs("deep"), maxAbs("short")) };

const epaTint = (epa, max, isDefense) => {
  if (epa == null || max <= 0) return "rgba(255,255,255,0.03)";
  const t = Math.min(1, Math.abs(epa) / max);
  if (t < 0.05) return "rgba(255,255,255,0.03)";
  const good = isDefense ? epa < 0 : epa > 0;
  const a = (0.12 + 0.42 * t).toFixed(2);
  return good ? `rgba(34,197,94,${a})` : `rgba(239,68,68,${a})`;
};

const DirCell = ({ epa, line, tint, empty }) => (
  <Box bg={empty ? "rgba(255,255,255,0.02)" : tint} border="1px solid" borderColor="whiteAlpha.100" borderRadius="sm" px={1} py={1.5} textAlign="center" minW={0}>
    <Text fontSize="13px" color={empty ? "text.muted" : "text.primary"} fontWeight="900" fontVariantNumeric="tabular-nums" lineHeight={1.1}>
      {empty ? "—" : fmtSigned(epa, 1)}
    </Text>
    <Text fontSize="8px" color="text.muted" fontWeight="700" letterSpacing="0.04em" mt={0.5} whiteSpace="nowrap" lineClamp={1}>
      {line}
    </Text>
  </Box>
);

const LaneHead = ({ lead }) => (
  <Grid templateColumns={lead ? "34px repeat(3, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))"} gap={1} mb={1}>
    {lead && <Box />}
    {LANES.map((l) => (
      <Text key={l} fontSize="8px" color="text.muted" fontWeight="800" letterSpacing="0.12em" textTransform="uppercase" textAlign="center">
        {l}
      </Text>
    ))}
  </Grid>
);

const DirectionCard = ({ title, accent, data, isDefense }) => (
  <Box border="1px solid" borderColor="whiteAlpha.100" bg="rgba(15,15,18,0.96)" borderRadius="md" p={2}>
    <Flex justify="space-between" align="center" mb={2}>
      <Text fontSize="9px" fontWeight="800" color="text.secondary" letterSpacing="0.12em" textTransform="uppercase">
        {title}
      </Text>
      <Box w="8px" h="8px" borderRadius="full" bg={accent} />
    </Flex>

    {/* Rush — one row, EPA over carries · yards */}
    <Flex justify="space-between" align="baseline" mb={1}>
      <Text fontSize="8px" fontWeight="800" color="text.secondary" letterSpacing="0.1em" textTransform="uppercase">Rush</Text>
      <Text fontSize="8px" color="text.muted" fontWeight="700">EPA · car · yds</Text>
    </Flex>
    <LaneHead />
    <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={1} mb={2.5}>
      {data.rush.map((c, i) => (
        <DirCell key={LANES[i]} epa={c.epa} line={`${c.car} car · ${c.yds} yds`} tint={epaTint(c.epa, EPA_MAX.rush, isDefense)} empty={c.car === 0} />
      ))}
    </Grid>

    {/* Pass — Deep and Short rows, EPA over C/A · yards */}
    <Flex justify="space-between" align="baseline" mb={1}>
      <Text fontSize="8px" fontWeight="800" color="text.secondary" letterSpacing="0.1em" textTransform="uppercase">Pass</Text>
      <Text fontSize="8px" color="text.muted" fontWeight="700">EPA · C/A · yds</Text>
    </Flex>
    <LaneHead lead />
    {[["deep", "Deep", "12+"], ["short", "Short", "0–12"]].map(([key, label, range]) => (
      <Grid key={key} templateColumns="34px repeat(3, minmax(0, 1fr))" gap={1} mb={1} alignItems="center">
        <Box>
          <Text fontSize="8px" fontWeight="800" color="text.secondary" letterSpacing="0.08em" textTransform="uppercase" lineHeight={1.1}>{label}</Text>
          <Text fontSize="7px" color="text.muted" fontWeight="700" lineHeight={1.1}>{range}</Text>
        </Box>
        {data[key].map((c, i) => (
          <DirCell key={LANES[i]} epa={c.epa} line={`${c.comp}/${c.att} · ${c.yds} yds`} tint={epaTint(c.epa, EPA_MAX.pass, isDefense)} empty={c.att === 0} />
        ))}
      </Grid>
    ))}
  </Box>
);

export const SfaPvamuPreviewA = () => {
  // Matchup pairs: each offense sits next to the defense it will face.
  const teamOrder = [
    { key: "sfaOffense", data: matchupData.sfaOffense },
    { key: "pvamuDefense", data: matchupData.pvamuDefense },
    { key: "pvamuOffense", data: matchupData.pvamuOffense },
    { key: "sfaDefense", data: matchupData.sfaDefense },
  ];

  return (
    <Box w="100%" h="100%" bg="bg.primary" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
      <VStack align="stretch" gap={0} h="100%">
        <Flex
          align="center"
          justify="space-between"
          px={4}
          py={3}
          borderBottom="1px solid"
          borderColor="whiteAlpha.100"
          bg="linear-gradient(90deg, rgba(17,17,19,0.98) 0%, rgba(25,26,29,0.96) 100%)"
        >
          <Flex align="center" gap={3} minW={0}>
            <Box
              w="26px"
              h="26px"
              borderRadius="full"
              bg="linear-gradient(135deg, #D7444B 0%, #8D4CC3 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="11px"
              fontWeight="900"
              color="white"
            >
              S
            </Box>
            <Box minW={0}>
              <Text fontSize="14px" fontWeight="900" color="text.primary" letterSpacing="0.06em" textTransform="uppercase">
                SFA vs PVAMU
              </Text>
              <Text fontSize="9px" color="text.muted" letterSpacing="0.09em" textTransform="uppercase">
                Saturday · Panther Stadium · Prairie View, TX
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap={3}>
            <Box
              px={2}
              py={1}
              border="1px solid"
              borderColor="whiteAlpha.100"
              bg="rgba(255,255,255,0.02)"
              borderRadius="md"
            >
              <Text fontSize="9px" color="text.muted" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
                Weather
              </Text>
              <Text fontSize="10px" color="text.primary" fontWeight="700">
                88° / 76° · Partly cloudy
              </Text>
            </Box>
            <Box px={2} py={1} borderRadius="md" bg="rgba(255,255,255,0.02)" border="1px solid" borderColor="whiteAlpha.100">
              <Text fontSize="9px" color="text.muted" fontWeight="800" letterSpacing="0.08em" textTransform="uppercase">
                Kickoff
              </Text>
              <Text fontSize="10px" color="text.primary" fontWeight="700">
                6:00 PM CT
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Box px={2} py={2} bg="rgba(255,255,255,0.02)">
          <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={2} alignItems="stretch">
            {teamOrder.map(({ key, data }, index) => (
              <StatColumn key={key} teamKey={key} data={data} isFirst={index === 0} />
            ))}
          </Grid>
        </Box>

        <Box px={2} pb={2}>
          <Grid templateColumns="repeat(4, minmax(0, 1fr))" gap={2}>
            {teamOrder.map(({ key, data }) => (
              <DirectionCard
                key={key}
                title={data.title}
                accent={data.accent}
                data={directionData[key]}
                isDefense={key.endsWith("Defense")}
              />
            ))}
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
};
