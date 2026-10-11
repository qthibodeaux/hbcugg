import { Box, Grid, Text } from "@chakra-ui/react";
import { Gauge } from "lucide-react";
import { Panel, Kicker, GradePill } from "./GameSummaryPanel";
import { fmt, pct, signed, yardsPerPlay, grade, rateGrade, epaGrade } from "./gameSummaryUtils";

const metricRows = (away, home) => [
  {
    label: "EPA/Play",
    away: away.advanced.epa_per_play,
    home: home.advanced.epa_per_play,
    format: (v) => signed(v, 2),
    context: epaGrade,
  },
  {
    label: "Success Rate",
    away: away.advanced.success_rate,
    home: home.advanced.success_rate,
    format: pct,
    context: rateGrade,
  },
  {
    label: "Yards/Play",
    away: yardsPerPlay(away.box),
    home: yardsPerPlay(home.box),
    format: (v) => fmt(v, 2),
    context: (v) =>
      grade(v, [
        { min: 6, label: "A", color: "#48BB78", note: "explosive" },
        { min: 5, label: "B", color: "#68D391", note: "efficient" },
        { min: 4, label: "C", color: "#ECC94B", note: "workable" },
        { min: 3, label: "D", color: "#F6AD55", note: "stalled" },
      ]),
  },
  {
    label: "Pass Yds/Att",
    away: away.box.yards_per_pass_attempt,
    home: home.box.yards_per_pass_attempt,
    format: (v) => fmt(v, 2),
    context: (v) =>
      grade(v, [
        { min: 9, label: "A", color: "#48BB78", note: "vertical" },
        { min: 7, label: "B", color: "#68D391", note: "strong" },
        { min: 5.5, label: "C", color: "#ECC94B", note: "steady" },
        { min: 4, label: "D", color: "#F6AD55", note: "limited" },
      ]),
  },
  {
    label: "Rush Yds/Carry",
    away: away.box.yards_per_carry,
    home: home.box.yards_per_carry,
    format: (v) => fmt(v, 2),
    context: (v) =>
      grade(v, [
        { min: 5.5, label: "A", color: "#48BB78", note: "gashed" },
        { min: 4.5, label: "B", color: "#68D391", note: "good" },
        { min: 3.5, label: "C", color: "#ECC94B", note: "fine" },
        { min: 2.5, label: "D", color: "#F6AD55", note: "boxed" },
      ]),
  },
  {
    label: "Explosive Play Rate",
    away: away.advanced.explosive_rate_yardage,
    home: home.advanced.explosive_rate_yardage,
    format: pct,
    context: (v) =>
      grade(v, [
        { min: 0.14, label: "A", color: "#48BB78", note: "danger" },
        { min: 0.1, label: "B", color: "#68D391", note: "pops" },
        { min: 0.06, label: "C", color: "#ECC94B", note: "some" },
        { min: 0.03, label: "D", color: "#F6AD55", note: "flat" },
      ]),
  },
  {
    label: "3rd Down Success",
    away: away.box.third_down_conversion_rate,
    home: home.box.third_down_conversion_rate,
    format: pct,
    context: rateGrade,
  },
  {
    label: "Red Zone Points/Opp",
    away: away.advanced.red_zone_points_per_opportunity,
    home: home.advanced.red_zone_points_per_opportunity,
    format: (v) => fmt(v, 1),
    context: (v) =>
      grade(v, [
        { min: 5, label: "A", color: "#48BB78", note: "finisher" },
        { min: 4, label: "B", color: "#68D391", note: "good" },
        { min: 3, label: "C", color: "#ECC94B", note: "mixed" },
        { min: 2, label: "D", color: "#F6AD55", note: "settled" },
      ]),
  },
  {
    label: "Def Run Stuff Rate",
    away: away.advanced.stuff_rate,
    home: home.advanced.stuff_rate,
    format: pct,
    context: (v) =>
      grade(v, [
        { min: 0.28, label: "A", color: "#48BB78", note: "wall" },
        { min: 0.22, label: "B", color: "#68D391", note: "stout" },
        { min: 0.16, label: "C", color: "#ECC94B", note: "normal" },
        { min: 0.1, label: "D", color: "#F6AD55", note: "soft" },
      ]),
  },
  {
    label: "Havoc Rate",
    away: away.advanced.havoc_rate_forced,
    home: home.advanced.havoc_rate_forced,
    format: pct,
    context: (v) =>
      grade(v, [
        { min: 0.2, label: "A", color: "#48BB78", note: "chaos" },
        { min: 0.15, label: "B", color: "#68D391", note: "active" },
        { min: 0.1, label: "C", color: "#ECC94B", note: "present" },
        { min: 0.06, label: "D", color: "#F6AD55", note: "quiet" },
      ]),
  },
  {
    label: "Points/Drive",
    away: away.box.points_per_drive,
    home: home.box.points_per_drive,
    format: (v) => fmt(v, 1),
    context: (v) =>
      grade(v, [
        { min: 3, label: "A", color: "#48BB78", note: "cash" },
        { min: 2.3, label: "B", color: "#68D391", note: "good" },
        { min: 1.6, label: "C", color: "#ECC94B", note: "work" },
        { min: 1, label: "D", color: "#F6AD55", note: "low" },
      ]),
  },
];

export const TeamMetrics = ({ model }) => {
  const away = model.teams[0];
  const home = model.teams[1];
  const rows = metricRows(away, home);
  return (
    <Panel accent="#F56565" minH="100%" p={3}>
      <Kicker icon={Gauge}>Team Metrics</Kicker>
      <Grid
        templateColumns="1.4fr 1fr 34px 1fr 34px"
        gap={2}
        alignItems="center"
      >
        <Text
          fontSize="9px"
          color="text.muted"
          fontWeight="black"
          textTransform="uppercase"
        >
          Overall
        </Text>
        <Text
          fontSize="9px"
          color="text.muted"
          fontWeight="black"
          textAlign="right"
          textTransform="uppercase"
        >
          {away.label}
        </Text>
        <Box />
        <Text
          fontSize="9px"
          color="text.muted"
          fontWeight="black"
          textAlign="right"
          textTransform="uppercase"
        >
          {home.label}
        </Text>
        <Box />
        {rows.map((row) => {
          const awayGrade = row.context(row.away);
          const homeGrade = row.context(row.home);
          return (
            <>
              <Text
                key={`${row.label}-label`}
                fontSize="10px"
                color="text.secondary"
                fontWeight="black"
                lineClamp={1}
              >
                {row.label}
              </Text>
              <Text
                key={`${row.label}-away`}
                fontSize="11px"
                color="white"
                fontWeight="black"
                textAlign="right"
              >
                {row.format(row.away)}
              </Text>
              <GradePill key={`${row.label}-ag`} item={awayGrade} />
              <Text
                key={`${row.label}-home`}
                fontSize="11px"
                color="white"
                fontWeight="black"
                textAlign="right"
              >
                {row.format(row.home)}
              </Text>
              <GradePill key={`${row.label}-hg`} item={homeGrade} />
            </>
          );
        })}
      </Grid>
      <Text fontSize="9px" color="text.muted" mt={3}>
        Grade pills are frontend placeholders until the pipeline ships true
        percentile context.
      </Text>
    </Panel>
  );
};
