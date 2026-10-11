import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import { cleanName, fmt, pct } from "../../utils/gameHelpers";

// ─── Placeholder data ─────────────────────────────────────────────────────────
// Fields marked [P] are not yet in the pipeline. Values from design spec.
// Replace each [P] source with the real advanced_team field when available.
// away = index 0, home = index 1

const PH = {
  // Expected Points
  epa_offensive:                    [-0.75,   8.65],  // [P] advanced_team.epa_offensive
  st_epa_total:                     [ 0.45,  -0.15],  // [P] advanced_team.special_teams_epa (always null)
  // Production
  pass_epa:                         [-0.92,  13.63],  // [P] advanced_team.epa_pass
  pass_epa_per_play:                [-0.02,   0.68],  // [P] advanced_team.epa_pass_per_play
  rush_epa:                         [ 0.17,  -3.45],  // [P] advanced_team.epa_rush
  rush_epa_per_play:                [ 0.01,  -0.11],  // [P] advanced_team.epa_rush_per_play
  // Rushing
  power_run_attempts:               [    1,      0],  // [P] advanced_team.power_run_attempts (always null)
  power_run_pct:                    [ "3%",   "0%"],
  power_run_successes:              [    1,      0],  // [P] advanced_team.power_run_success count
  power_run_success_pct:            ["100%",  "0%"],
  // Explosiveness
  explosive_plays_count:            [    4,      6],  // DERIVABLE from rate × plays
  explosive_plays_pct:              [ "5%",  "12%"],
  explosive_pass_count:             [    4,      2],  // [P] advanced_team.explosive_pass_count
  explosive_pass_pct:               [ "9%",  "10%"],
  explosive_rush_count:             [    0,      4],  // [P] advanced_team.explosive_rush_count
  explosive_rush_pct:               [ "0%",  "13%"],
  epa_non_explosive:                [-17.02,  -7.85], // [P] advanced_team.epa_non_explosive
  epa_non_explosive_per_play:       [-0.24,  -0.17],
  pass_epa_non_explosive:           [-17.19,   5.85], // [P] advanced_team.epa_pass_non_explosive
  pass_epa_non_explosive_per_play:  [-0.40,   0.29],
  rush_epa_non_explosive:           [ 0.17, -12.18], // [P] advanced_team.epa_rush_non_explosive
  rush_epa_non_explosive_per_play:  [ 0.01,  -0.47],
  // Situational — success counts
  successful_plays_count:           [   28,     21],  // DERIVABLE from rate × plays
  successful_plays_pct:             ["38%",  "41%"],
  successful_pass_count:            [   15,     11],  // [P]
  successful_pass_pct:              ["35%",  "55%"],
  successful_rush_count:            [   13,     10],  // [P]
  successful_rush_pct:              ["42%",  "33%"],
  // Situational — early downs
  early_down_count:                 [   54,     41],  // [P] advanced_team.early_down_count
  early_down_first_downs:           [   12,      8],  // [P]
  early_down_first_down_pct:        ["22%",  "20%"],
  early_down_epa:                   [-11.13,   0.76], // [P] advanced_team.early_down_epa
  early_down_epa_per_play:          [-0.21,   0.02],
  early_down_passes:                [   30,     13],  // [P]
  early_down_pass_pct:              ["56%",  "32%"],
  early_down_rushes:                [   24,     27],  // [P]
  early_down_rush_pct:              ["44%",  "66%"],
  early_down_succ_passes:           [    9,      6],  // [P]
  early_down_succ_pass_pct:         ["30%",  "46%"],
  early_down_succ_rushes:           [    9,      9],  // [P]
  early_down_succ_rush_pct:         ["38%",  "33%"],
  // Situational — late downs
  late_down_count:                  [   20,     10],  // [P] advanced_team.late_down_count
  late_down_epa:                    [10.38,   7.90],  // [P]
  late_down_epa_per_play:           [ 0.52,   0.79],
  late_down_passes:                 [   13,      7],  // [P]
  late_down_pass_pct:               ["65%",  "70%"],
  late_down_rushes:                 [    7,      3],  // [P]
  late_down_rush_pct:               ["35%",  "30%"],
  late_down_succ_passes:            [    6,      5],  // [P]
  late_down_succ_pass_pct:          ["46%",  "71%"],
  late_down_succ_rushes:            [    4,      1],  // [P]
  late_down_succ_rush_pct:          ["57%",  "33%"],
  late_down_avg_distance:           [ 6.15,  10.40],  // [P] team_box.third_down_avg_distance is 3rd only
  // Situational — middle 8
  middle_8_count:                   [    9,     14],  // [P] advanced_team.middle_8_count
  middle_8_epa:                     [-2.87,  -3.83],  // [P]
  middle_8_epa_per_play:            [-0.32,  -0.27],
  middle_8_passes:                  [    6,      6],  // [P]
  middle_8_pass_pct:                ["67%",  "43%"],
  middle_8_rushes:                  [    3,      8],  // [P]
  middle_8_rush_pct:                ["33%",  "57%"],
  middle_8_succ_passes:             [    1,      2],  // [P]
  middle_8_succ_pass_pct:           ["17%",  "33%"],
  middle_8_succ_rushes:             [    1,      3],  // [P]
  middle_8_succ_rush_pct:           ["33%",  "38%"],
  // Drives
  available_yards_pct:              ["46%",  "48%"],  // [P] advanced_team.available_yards_pct
  // Special teams EPA breakdown
  st_field_goal_epa:                [-3.86,   0.00],  // [P] special_teams_advanced.fg_offense.espa
  st_punting_epa:                   [ 3.78,  -2.57],  // [P] special_teams_advanced.punt_offense.espa
  st_kickoff_return_epa:            [ 0.52,   2.41],  // [P] special_teams_advanced.kickoff_defense.espa
};

// Returns real value if available, falls back to placeholder for team side
const real = (val, phKey, isAway) =>
  val != null ? val : PH[phKey]?.[isAway ? 0 : 1] ?? null;

// ─── Row components ───────────────────────────────────────────────────────────

const BSRow = ({ label, away, home, indent = 0, bold = false }) => {
  const pl = indent === 0 ? 0 : indent === 1 ? 4 : indent === 2 ? 8 : 12;
  const pr = indent === 0 ? 0 : indent === 1 ? 4 : indent === 2 ? 8 : 12;
  const dimColor = indent >= 2 ? "whiteAlpha.500" : indent === 1 ? "whiteAlpha.700" : "text.primary";
  const labelColor = indent >= 1 ? "text.muted" : "text.secondary";
  const fontSize = indent >= 2 ? "10px" : "xs";

  return (
    <Grid
      templateColumns="1fr auto 1fr"
      gap={2}
      py={1.5}
      pl={pl}
      pr={pr}
      borderBottom="1px solid"
      borderColor="whiteAlpha.50"
      alignItems="center"
    >
      <Text
        fontSize={fontSize}
        fontWeight={bold || indent === 0 ? "bold" : "medium"}
        color={dimColor}
      >
        {away ?? "—"}
      </Text>
      <Text
        fontSize={indent >= 2 ? "9px" : "10px"}
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="wider"
        textAlign="center"
        minW="110px"
        maxW="140px"
      >
        {label}
      </Text>
      <Text
        fontSize={fontSize}
        fontWeight={bold || indent === 0 ? "bold" : "medium"}
        color={dimColor}
        textAlign="right"
      >
        {home ?? "—"}
      </Text>
    </Grid>
  );
};

const BSHeader = ({ awayShort, homeShort }) => (
  <Grid templateColumns="1fr auto 1fr" gap={2} mb={1}>
    <Text fontSize="10px" fontWeight="black" color="brand.400">{awayShort}</Text>
    <Box minW="110px" />
    <Text fontSize="10px" fontWeight="black" color="brand.400" textAlign="right">{homeShort}</Text>
  </Grid>
);

const BSShell = ({ title, children }) => (
  <Box
    bg="bg.secondary"
    border="1px solid"
    borderColor="whiteAlpha.100"
    borderRadius="xl"
    overflow="hidden"
    mb={4}
  >
    <Box px={4} py={3} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
      <Text fontSize="xs" fontWeight="black" color="brand.400" textTransform="uppercase" letterSpacing="widest">
        {title}
      </Text>
    </Box>
    <Box px={4} py={3}>{children}</Box>
  </Box>
);

// ─── EPA Panel ────────────────────────────────────────────────────────────────

const EPAPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv, aPen, hPen }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  const a = (key) => real(null, key, true);
  const h = (key) => real(null, key, false);

  return (
    <BSShell title="Expected Points">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Total Plays"        away={aBox.plays_offense}      home={hBox.plays_offense} bold />
      <BSRow label="Total EPA"          away={f2(aAdv.epa_total)}      home={f2(hAdv.epa_total)} bold />
      <BSRow label="Offensive EPA"      away={f2(a("epa_offensive"))}  home={f2(h("epa_offensive"))} indent={1} />
      <BSRow label="Special Teams EPA"  away={f2(a("st_epa_total"))}   home={f2(h("st_epa_total"))} indent={1} />
      <BSRow label="Penalty EPA"        away={f2(aPen?.accepted_penalty_epa_sum)} home={f2(hPen?.accepted_penalty_epa_sum)} indent={1} />
    </BSShell>
  );
};

// ─── Production Panel ─────────────────────────────────────────────────────────

const ProductionPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  const f1 = (v) => (v != null ? fmt(v, 1) : "—");
  const a = (key) => PH[key]?.[0];
  const h = (key) => PH[key]?.[1];

  const aPassPct = aBox.plays_offense > 0 ? Math.round((aBox.pass_attempts / aBox.plays_offense) * 100) : 0;
  const hPassPct = hBox.plays_offense > 0 ? Math.round((hBox.pass_attempts / hBox.plays_offense) * 100) : 0;
  const aRushPct = 100 - aPassPct;
  const hRushPct = 100 - hPassPct;

  return (
    <BSShell title="Production">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Scrimmage Plays"  away={aAdv.eligible_scrimmage_plays}  home={hAdv.eligible_scrimmage_plays} bold />
      <BSRow label="Yards"            away={aBox.total_yards}               home={hBox.total_yards} indent={1} />
      <BSRow label="Yards / Play"     away={f1(aAdv.eligible_scrimmage_plays > 0 ? aBox.total_yards / aAdv.eligible_scrimmage_plays : null)} home={f1(hAdv.eligible_scrimmage_plays > 0 ? hBox.total_yards / hAdv.eligible_scrimmage_plays : null)} indent={1} />
      <BSRow label="EPA"              away={f2(aAdv.epa_total)}             home={f2(hAdv.epa_total)} indent={1} />
      <BSRow label="EPA / Play"       away={f2(aAdv.epa_per_play)}          home={f2(hAdv.epa_per_play)} indent={1} />

      <BSRow label="Passes"           away={`${aBox.pass_attempts} (${aPassPct}%)`} home={`${hBox.pass_attempts} (${hPassPct}%)`} bold />
      <BSRow label="Yards"            away={aBox.pass_yards}                home={hBox.pass_yards} indent={1} />
      <BSRow label="Yards / Play"     away={f2(aBox.yards_per_pass_attempt)} home={f2(hBox.yards_per_pass_attempt)} indent={1} />
      <BSRow label="EPA"              away={f2(a("pass_epa"))}              home={f2(h("pass_epa"))} indent={1} />
      <BSRow label="EPA / Play"       away={f2(a("pass_epa_per_play"))}     home={f2(h("pass_epa_per_play"))} indent={1} />

      <BSRow label="Rushes"           away={`${aBox.rush_attempts} (${aRushPct}%)`} home={`${hBox.rush_attempts} (${hRushPct}%)`} bold />
      <BSRow label="Yards"            away={aBox.rush_yards}                home={hBox.rush_yards} indent={1} />
      <BSRow label="Yards / Play"     away={f2(aBox.yards_per_carry)}       home={f2(hBox.yards_per_carry)} indent={1} />
      <BSRow label="EPA"              away={f2(a("rush_epa"))}              home={f2(h("rush_epa"))} indent={1} />
      <BSRow label="EPA / Play"       away={f2(a("rush_epa_per_play"))}     home={f2(h("rush_epa_per_play"))} indent={1} />
    </BSShell>
  );
};

// ─── Rushing Panel ────────────────────────────────────────────────────────────

const RushingPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  const f1 = (v) => (v != null ? fmt(v, 1) : "—");
  const a = (key) => PH[key]?.[0];
  const h = (key) => PH[key]?.[1];

  const aPassPct = aBox.plays_offense > 0 ? Math.round((aBox.pass_attempts / aBox.plays_offense) * 100) : 0;
  const hPassPct = hBox.plays_offense > 0 ? Math.round((hBox.pass_attempts / hBox.plays_offense) * 100) : 0;
  const aRushPct = 100 - aPassPct;
  const hRushPct = 100 - hPassPct;

  // Derive counts from rates
  const aStuffed  = Math.round((aAdv.stuff_rate ?? 0)           * (aBox.rush_attempts ?? 0));
  const hStuffed  = Math.round((hAdv.stuff_rate ?? 0)           * (hBox.rush_attempts ?? 0));
  const aStopped  = Math.round((aAdv.stopped_run_rate ?? 0)     * (aBox.rush_attempts ?? 0));
  const hStopped  = Math.round((hAdv.stopped_run_rate ?? 0)     * (hBox.rush_attempts ?? 0));
  const aOppty    = Math.round((aAdv.rush_opportunity_rate ?? 0) * (aBox.rush_attempts ?? 0));
  const hOppty    = Math.round((hAdv.rush_opportunity_rate ?? 0) * (hBox.rush_attempts ?? 0));

  const aStuffedPct  = aBox.rush_attempts > 0 ? Math.round(aStuffed  / aBox.rush_attempts * 100) : 0;
  const hStuffedPct  = hBox.rush_attempts > 0 ? Math.round(hStuffed  / hBox.rush_attempts * 100) : 0;
  const aStoppedPct  = aBox.rush_attempts > 0 ? Math.round(aStopped  / aBox.rush_attempts * 100) : 0;
  const hStoppedPct  = hBox.rush_attempts > 0 ? Math.round(hStopped  / hBox.rush_attempts * 100) : 0;
  const aOpptyPct    = aBox.rush_attempts > 0 ? Math.round(aOppty    / aBox.rush_attempts * 100) : 0;
  const hOpptyPct    = hBox.rush_attempts > 0 ? Math.round(hOppty    / hBox.rush_attempts * 100) : 0;

  return (
    <BSShell title="Rushing">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Scrimmage Plays"       away={aAdv.eligible_scrimmage_plays}                    home={hAdv.eligible_scrimmage_plays} bold />
      <BSRow label="Rushes"                away={`${aBox.rush_attempts} (${aRushPct}%)`}           home={`${hBox.rush_attempts} (${hRushPct}%)`} bold />
      <BSRow label="Power Runs (D≥3, Dist≤2)" away={`${a("power_run_attempts")} (${a("power_run_pct")})`} home={`${h("power_run_attempts")} (${h("power_run_pct")})`} indent={1} />
      <BSRow label="Successful Power Runs" away={`${a("power_run_successes")} (${a("power_run_success_pct")})`} home={`${h("power_run_successes")} (${h("power_run_success_pct")})`} indent={2} />
      <BSRow label="Stuffed (Yds ≤ 0)"    away={`${aStuffed} (${aStuffedPct}%)`}                  home={`${hStuffed} (${hStuffedPct}%)`} indent={1} />
      <BSRow label="Stopped (Yds ≤ 2)"    away={`${aStopped} (${aStoppedPct}%)`}                  home={`${hStopped} (${hStoppedPct}%)`} indent={1} />
      <BSRow label="Opportunity (Yds ≥ 4)" away={`${aOppty} (${aOpptyPct}%)`}                     home={`${hOppty} (${hOpptyPct}%)`} indent={1} />
      <BSRow label="OL Line Yards"         away={f1(aAdv.line_yards_total)}                        home={f1(hAdv.line_yards_total)} bold />
      <BSRow label="Per Carry"             away={f2(aAdv.line_yards_per_rush)}                     home={f2(hAdv.line_yards_per_rush)} indent={1} />
      <BSRow label="Highlight Yards"       away={f1(aAdv.highlight_yards_total)}                   home={f1(hAdv.highlight_yards_total)} bold />
      <BSRow label="Per Rush Opportunity"  away={f2(aAdv.highlight_yards_per_rush)}                home={f2(hAdv.highlight_yards_per_rush)} indent={1} />
    </BSShell>
  );
};

// ─── Explosiveness Panel ──────────────────────────────────────────────────────

const ExplosivePanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  const a = (key) => PH[key]?.[0];
  const h = (key) => PH[key]?.[1];

  return (
    <BSShell title="Explosiveness">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Total Plays"           away={aBox.plays_offense}                          home={hBox.plays_offense} bold />
      <BSRow label="Scrimmage Plays"       away={aAdv.eligible_scrimmage_plays}               home={hAdv.eligible_scrimmage_plays} bold />
      <BSRow label="Explosive Plays"       away={`${a("explosive_plays_count")} (${a("explosive_plays_pct")})`}  home={`${h("explosive_plays_count")} (${h("explosive_plays_pct")})`} bold />
      <BSRow label="When Passing (EPA>2.4)" away={`${a("explosive_pass_count")} (${a("explosive_pass_pct")})`}   home={`${h("explosive_pass_count")} (${h("explosive_pass_pct")})`} indent={1} />
      <BSRow label="When Rushing (EPA>1.8)" away={`${a("explosive_rush_count")} (${a("explosive_rush_pct")})`}   home={`${h("explosive_rush_count")} (${h("explosive_rush_pct")})`} indent={1} />
      <BSRow label="EPA w/o Explosives"   away={f2(a("epa_non_explosive"))}                  home={f2(h("epa_non_explosive"))} bold />
      <BSRow label="EPA / Play"           away={f2(a("epa_non_explosive_per_play"))}          home={f2(h("epa_non_explosive_per_play"))} indent={1} />
      <BSRow label="When Passing"         away={f2(a("pass_epa_non_explosive"))}              home={f2(h("pass_epa_non_explosive"))} indent={1} />
      <BSRow label="EPA / Play"           away={f2(a("pass_epa_non_explosive_per_play"))}     home={f2(h("pass_epa_non_explosive_per_play"))} indent={2} />
      <BSRow label="When Rushing"         away={f2(a("rush_epa_non_explosive"))}              home={f2(h("rush_epa_non_explosive"))} indent={1} />
      <BSRow label="EPA / Play"           away={f2(a("rush_epa_non_explosive_per_play"))}     home={f2(h("rush_epa_non_explosive_per_play"))} indent={2} />
    </BSShell>
  );
};

// ─── Situational Panel ────────────────────────────────────────────────────────

const SituationalPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  const f1 = (v) => (v != null ? fmt(v, 1) : "—");
  const rp  = (v) => (v != null ? pct(v) : "—");
  const a = (key) => PH[key]?.[0];
  const h = (key) => PH[key]?.[1];

  return (
    <BSShell title="Situational">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />

      {/* Successful plays block */}
      <BSRow label="Successful Plays (EPA>0)" away={`${a("successful_plays_count")} (${a("successful_plays_pct")})`} home={`${h("successful_plays_count")} (${h("successful_plays_pct")})`} bold />
      <BSRow label="When Passing"        away={`${a("successful_pass_count")} (${a("successful_pass_pct")})`}  home={`${h("successful_pass_count")} (${h("successful_pass_pct")})`} indent={1} />
      <BSRow label="When Rushing"        away={`${a("successful_rush_count")} (${a("successful_rush_pct")})`}  home={`${h("successful_rush_count")} (${h("successful_rush_pct")})`} indent={1} />
      <BSRow label="On Standard Downs"   away={rp(aAdv.success_rate_standard_down)}  home={rp(hAdv.success_rate_standard_down)} indent={1} />
      <BSRow label="On Passing Downs"    away={rp(aAdv.success_rate_passing_down)}   home={rp(hAdv.success_rate_passing_down)} indent={1} />
      <BSRow label="On Early Downs"      away={rp(aAdv.success_rate_early_down)}     home={rp(hAdv.success_rate_early_down)} indent={1} />
      <BSRow label="On Late Downs"       away={rp(aAdv.success_rate_late_down)}      home={rp(hAdv.success_rate_late_down)} indent={1} />
      <BSRow label='During "Middle 8"'   away={rp(aAdv.success_rate_middle_8)}       home={rp(hAdv.success_rate_middle_8)} indent={1} />

      {/* Early downs */}
      <BSRow label="Early Downs"         away={a("early_down_count")}      home={h("early_down_count")} bold />
      <BSRow label="1st Downs Created"   away={`${a("early_down_first_downs")} (${a("early_down_first_down_pct")})`} home={`${h("early_down_first_downs")} (${h("early_down_first_down_pct")})`} indent={1} />
      <BSRow label="EPA"                 away={f2(a("early_down_epa"))}    home={f2(h("early_down_epa"))} indent={1} />
      <BSRow label="EPA / Play"          away={f2(a("early_down_epa_per_play"))} home={f2(h("early_down_epa_per_play"))} indent={1} />
      <BSRow label="Passes"              away={`${a("early_down_passes")} (${a("early_down_pass_pct")})`} home={`${h("early_down_passes")} (${h("early_down_pass_pct")})`} indent={1} />
      <BSRow label="Rushes"              away={`${a("early_down_rushes")} (${a("early_down_rush_pct")})`} home={`${h("early_down_rushes")} (${h("early_down_rush_pct")})`} indent={1} />
      <BSRow label="Successful Passes"   away={`${a("early_down_succ_passes")} (${a("early_down_succ_pass_pct")})`} home={`${h("early_down_succ_passes")} (${h("early_down_succ_pass_pct")})`} indent={2} />
      <BSRow label="Successful Rushes"   away={`${a("early_down_succ_rushes")} (${a("early_down_succ_rush_pct")})`} home={`${h("early_down_succ_rushes")} (${h("early_down_succ_rush_pct")})`} indent={2} />

      {/* Late downs */}
      <BSRow label="Late Downs"          away={a("late_down_count")}       home={h("late_down_count")} bold />
      <BSRow label="EPA"                 away={f2(a("late_down_epa"))}     home={f2(h("late_down_epa"))} indent={1} />
      <BSRow label="EPA / Play"          away={f2(a("late_down_epa_per_play"))} home={f2(h("late_down_epa_per_play"))} indent={1} />
      <BSRow label="Passes"              away={`${a("late_down_passes")} (${a("late_down_pass_pct")})`} home={`${h("late_down_passes")} (${h("late_down_pass_pct")})`} indent={1} />
      <BSRow label="Rushes"              away={`${a("late_down_rushes")} (${a("late_down_rush_pct")})`} home={`${h("late_down_rushes")} (${h("late_down_rush_pct")})`} indent={1} />
      <BSRow label="Successful Passes"   away={`${a("late_down_succ_passes")} (${a("late_down_succ_pass_pct")})`} home={`${h("late_down_succ_passes")} (${h("late_down_succ_pass_pct")})`} indent={2} />
      <BSRow label="Successful Rushes"   away={`${a("late_down_succ_rushes")} (${a("late_down_succ_rush_pct")})`} home={`${h("late_down_succ_rushes")} (${h("late_down_succ_rush_pct")})`} indent={2} />
      <BSRow label="Avg Distance"        away={f1(a("late_down_avg_distance"))} home={f1(h("late_down_avg_distance"))} indent={1} />

      {/* Middle 8 */}
      <BSRow label='"Middle 8" Plays'    away={a("middle_8_count")}        home={h("middle_8_count")} bold />
      <BSRow label="EPA"                 away={f2(a("middle_8_epa"))}      home={f2(h("middle_8_epa"))} indent={1} />
      <BSRow label="EPA / Play"          away={f2(a("middle_8_epa_per_play"))} home={f2(h("middle_8_epa_per_play"))} indent={1} />
      <BSRow label="Passes"              away={`${a("middle_8_passes")} (${a("middle_8_pass_pct")})`} home={`${h("middle_8_passes")} (${h("middle_8_pass_pct")})`} indent={1} />
      <BSRow label="Rushes"              away={`${a("middle_8_rushes")} (${a("middle_8_rush_pct")})`} home={`${h("middle_8_rushes")} (${h("middle_8_rush_pct")})`} indent={1} />
      <BSRow label="Successful Passes"   away={`${a("middle_8_succ_passes")} (${a("middle_8_succ_pass_pct")})`} home={`${h("middle_8_succ_passes")} (${h("middle_8_succ_pass_pct")})`} indent={2} />
      <BSRow label="Successful Rushes"   away={`${a("middle_8_succ_rushes")} (${a("middle_8_succ_rush_pct")})`} home={`${h("middle_8_succ_rushes")} (${h("middle_8_succ_rush_pct")})`} indent={2} />
    </BSShell>
  );
};

// ─── Drives Panel (box score) ─────────────────────────────────────────────────

const DrivesBoxPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv }) => {
  // eslint-disable-next-line no-unused-vars
  const f1 = (v) => (v != null ? fmt(v, 1) : "—");
  const a = (key) => PH[key]?.[0];
  const h = (key) => PH[key]?.[1];

  const aPlaysPerDrive = aBox.drives_offense > 0 ? (aBox.plays_offense / aBox.drives_offense).toFixed(2) : "—";
  const hPlaysPerDrive = hBox.drives_offense > 0 ? (hBox.plays_offense / hBox.drives_offense).toFixed(2) : "—";
  const aYardsPerDrive = aBox.drives_offense > 0 ? (aBox.total_yards / aBox.drives_offense).toFixed(2) : "—";
  const hYardsPerDrive = hBox.drives_offense > 0 ? (hBox.total_yards / hBox.drives_offense).toFixed(2) : "—";
  const aAvgStart = aBox.avg_start_field_position != null ? `Own ${Math.round(aBox.avg_start_field_position)}` : "—";
  const hAvgStart = hBox.avg_start_field_position != null ? `Own ${Math.round(hBox.avg_start_field_position)}` : "—";

  return (
    <BSShell title="Drives">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Total"                  away={aBox.drives_offense}   home={hBox.drives_offense} bold />
      <BSRow label="Avg Starting Field Pos" away={aAvgStart}             home={hAvgStart} indent={1} />
      <BSRow label="Plays / Drive"          away={aPlaysPerDrive}        home={hPlaysPerDrive} indent={1} />
      <BSRow label="Yards / Drive"          away={aYardsPerDrive}        home={hYardsPerDrive} indent={1} />
      <BSRow label="Available Yards %"      away={a("available_yards_pct")} home={h("available_yards_pct")} indent={1} />
    </BSShell>
  );
};

// ─── Defensive Panel ──────────────────────────────────────────────────────────

const DefensivePanel = ({ awayShort, homeShort, awayId, homeId, aAdv, hAdv, aDefId, hDefId, teamEntries }) => {
  // eslint-disable-next-line no-unused-vars
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  // eslint-disable-next-line no-unused-vars
  const rp = (v) => (v != null ? pct(v) : "—");

  const sumDef = (teamId, field) => {
    const entry = teamEntries.find(([id]) => id === teamId);
    return (entry?.[1]?.defense ?? []).reduce((s, p) => s + (p[field] ?? 0), 0);
  };

  const aTFLs   = sumDef(awayId, "tfl");
  const hTFLs   = sumDef(homeId, "tfl");
  const aSacks  = sumDef(awayId, "sacks");
  const hSacks  = sumDef(homeId, "sacks");
  const aPD     = sumDef(awayId, "passes_defended");
  const hPD     = sumDef(homeId, "passes_defended");
  const aINT    = sumDef(awayId, "interceptions");
  const hINT    = sumDef(homeId, "interceptions");
  const aFF     = sumDef(awayId, "forced_fumbles");
  const hFF     = sumDef(homeId, "forced_fumbles");

  // Havoc plays = rate × opponent scrimmage plays
  const aHavocCount = Math.round((aAdv.havoc_rate_forced ?? 0) * (hAdv.eligible_scrimmage_plays ?? 0));
  const hHavocCount = Math.round((hAdv.havoc_rate_forced ?? 0) * (aAdv.eligible_scrimmage_plays ?? 0));
  const aHavocPct   = hAdv.eligible_scrimmage_plays > 0 ? Math.round(aHavocCount / hAdv.eligible_scrimmage_plays * 100) : 0;
  const hHavocPct   = aAdv.eligible_scrimmage_plays > 0 ? Math.round(hHavocCount / aAdv.eligible_scrimmage_plays * 100) : 0;

  // Stop rate = 1 - opponent success rate
  const aStopRate = hAdv.success_rate != null ? pct(1 - hAdv.success_rate) : "—";
  const hStopRate = aAdv.success_rate != null ? pct(1 - aAdv.success_rate) : "—";

  const aSackPct = hAdv.eligible_scrimmage_plays > 0 ? Math.round(aSacks / hAdv.eligible_scrimmage_plays * 100) : 0;
  const hSackPct = aAdv.eligible_scrimmage_plays > 0 ? Math.round(hSacks / aAdv.eligible_scrimmage_plays * 100) : 0;

  return (
    <BSShell title="Defensive">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Scrimmage Plays (opp)" away={hAdv.eligible_scrimmage_plays} home={aAdv.eligible_scrimmage_plays} bold />
      <BSRow label="Stop Rate"         away={aStopRate}                          home={hStopRate} bold />
      <BSRow label="Havoc Plays"       away={`${aHavocCount} (${aHavocPct}%)`}  home={`${hHavocCount} (${hHavocPct}%)`} bold />
      <BSRow label="Passing"           away="—"                                  home="—" indent={1} />
      <BSRow label="Rushing"           away="—"                                  home="—" indent={1} />
      <BSRow label="TFLs Generated"    away={aTFLs}                              home={hTFLs} bold />
      <BSRow label="Passing"           away="—"                                  home="—" indent={1} />
      <BSRow label="Rushing"           away="—"                                  home="—" indent={1} />
      <BSRow label="Sacks"             away={`${aSacks} (${aSackPct}%)`}         home={`${hSacks} (${hSackPct}%)`} indent={1} />
      <BSRow label="Passes Defensed"   away={aPD}                                home={hPD} indent={1} />
      <BSRow label="Interceptions"     away={aINT}                               home={hINT} indent={1} />
      <BSRow label="Fumbles Forced"    away={aFF}                                home={hFF} indent={1} />
    </BSShell>
  );
};

// ─── Turnovers Panel ──────────────────────────────────────────────────────────

const TurnoversPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv, teamEntries, awayId, homeId }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  // eslint-disable-next-line no-unused-vars
  const f1 = (v) => (v != null ? fmt(v, 1) : "—");

  const sumDef = (teamId, field) => {
    const entry = teamEntries.find(([id]) => id === teamId);
    return (entry?.[1]?.defense ?? []).reduce((s, p) => s + (p[field] ?? 0), 0);
  };

  const aFumbleRec = sumDef(awayId, "fumble_recoveries");
  const hFumbleRec = sumDef(homeId, "fumble_recoveries");
  const aINTthrown = aBox.interceptions_thrown ?? 0;
  const hINTthrown = hBox.interceptions_thrown ?? 0;

  const aMargin = (aBox.turnovers_forced ?? 0) - (aBox.turnovers_committed ?? 0);
  const hMargin = (hBox.turnovers_forced ?? 0) - (hBox.turnovers_committed ?? 0);
  const aExpMargin = ((aAdv.expected_turnovers ?? 0) - (hAdv.expected_turnovers ?? 0)).toFixed(1);
  const hExpMargin = ((hAdv.expected_turnovers ?? 0) - (aAdv.expected_turnovers ?? 0)).toFixed(1);

  return (
    <BSShell title="Turnovers">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Turnovers"             away={aBox.turnovers_committed}  home={hBox.turnovers_committed} bold />
      <BSRow label="Fumbles"               away="—"                         home="—" indent={1} />
      <BSRow label="Fumbles Lost"          away="—"                         home="—" indent={1} />
      <BSRow label="Fumbles Recovered"     away={aFumbleRec}                home={hFumbleRec} indent={1} />
      <BSRow label="Interceptions"         away={aINTthrown}                home={hINTthrown} indent={1} />
      <BSRow label="Turnover Margin"       away={aMargin > 0 ? `+${aMargin}` : aMargin} home={hMargin > 0 ? `+${hMargin}` : hMargin} bold />
      <BSRow label="Expected Turnovers"    away={f2(aAdv.expected_turnovers)} home={f2(hAdv.expected_turnovers)} bold />
      <BSRow label="Exp. Turnover Margin"  away={aExpMargin > 0 ? `+${aExpMargin}` : aExpMargin} home={hExpMargin > 0 ? `+${hExpMargin}` : hExpMargin} indent={1} />
      <BSRow label="Turnover Luck (pts)"   away={f2(aAdv.turnover_luck)}    home={f2(hAdv.turnover_luck)} indent={1} />
    </BSShell>
  );
};

// ─── Special Teams Panel ──────────────────────────────────────────────────────

const SpecialTeamsPanel = ({ awayShort, homeShort, aBox, hBox, aAdv, hAdv, aST, hST }) => {
  const f2 = (v) => (v != null ? fmt(v, 2) : "—");
  const a = (key) => PH[key]?.[0];
  const h = (key) => PH[key]?.[1];

  const aSTPlays = aST?.summary?.st_play_count ?? 0;
  const hSTPlays = hST?.summary?.st_play_count ?? 0;
  const aSTpct   = aBox.plays_offense > 0 ? Math.round(aSTPlays / aBox.plays_offense * 100) : 0;
  const hSTpct   = hBox.plays_offense > 0 ? Math.round(hSTPlays / hBox.plays_offense * 100) : 0;

  return (
    <BSShell title="Special Teams">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Total Plays"       away={`${aSTPlays} (${aSTpct}%)`}   home={`${hSTPlays} (${hSTpct}%)`} bold />
      <BSRow label="Total EPA"         away={f2(a("st_epa_total"))}        home={f2(h("st_epa_total"))} bold />
      <BSRow label="Field Goal EPA"    away={f2(a("st_field_goal_epa"))}   home={f2(h("st_field_goal_epa"))} indent={1} />
      <BSRow label="Punting EPA"       away={f2(a("st_punting_epa"))}      home={f2(h("st_punting_epa"))} indent={1} />
      <BSRow label="Kickoff Return EPA" away={f2(a("st_kickoff_return_epa"))} home={f2(h("st_kickoff_return_epa"))} indent={1} />
    </BSShell>
  );
};

// ─── Box Score Section ────────────────────────────────────────────────────────

const GameBoxScore = ({ game, awayId, homeId, awayShort, homeShort }) => {
  const teamBox       = game?.team_box ?? {};
  const advancedTeam  = game?.advanced_team ?? {};
  const penaltyAdv    = game?.penalty_advanced ?? {};
  const stAdv         = game?.special_teams_advanced ?? {};
  const defIdentity   = game?.defensive_identity ?? {};
  const teamEntries   = Object.entries(game?.individual_stats ?? {});

  const aBox   = teamBox[awayId] ?? {};
  const hBox   = teamBox[homeId] ?? {};
  const aAdv   = advancedTeam[awayId] ?? {};
  const hAdv   = advancedTeam[homeId] ?? {};
  const aPen   = penaltyAdv[awayId];
  const hPen   = penaltyAdv[homeId];
  const aST    = stAdv[awayId];
  const hST    = stAdv[homeId];
  const aDefId = defIdentity[awayId] ?? {};
  const hDefId = defIdentity[homeId] ?? {};

  const shared = { awayShort, homeShort, aBox, hBox, aAdv, hAdv };

  return (
    <Box>
      {/* Full width */}
      <EPAPanel {...shared} aPen={aPen} hPen={hPen} />

      {/* 2-col: Production | Rushing */}
      <Grid templateColumns="1fr 1fr" gap={4}>
        <ProductionPanel {...shared} />
        <RushingPanel    {...shared} />
      </Grid>

      {/* Full width */}
      <ExplosivePanel  {...shared} />
      <SituationalPanel {...shared} />

      {/* 3-col: Drives | Defensive | Turnovers */}
      <Grid templateColumns="1fr 1fr 1fr" gap={4}>
        <DrivesBoxPanel  {...shared} />
        <DefensivePanel  {...shared} awayId={awayId} homeId={homeId} aDefId={aDefId} hDefId={hDefId} teamEntries={teamEntries} />
        <TurnoversPanel  {...shared} awayId={awayId} homeId={homeId} teamEntries={teamEntries} />
      </Grid>

      {/* Full width */}
      <SpecialTeamsPanel {...shared} aST={aST} hST={hST} />
    </Box>
  );
};

// ─── Individual Production ───────────────────────────────────────────────────
// Shared dual-table layout: away players on left, home players on right.
// No avatars or jersey numbers — name, position, stat columns only.

const f1 = (v) => (v != null ? fmt(v, 1) : "—");
const f2 = (v) => (v != null ? fmt(v, 2) : "—");
const f0 = (v) => (v != null ? String(v) : "—");
const fp = (v) => (v != null ? pct(v) : "—");

const PlayerRow = ({ player, cols }) => (
  <Flex
    py={1.5}
    borderBottom="1px solid"
    borderColor="whiteAlpha.50"
    gap={2}
    align="center"
    _hover={{ bg: "whiteAlpha.50" }}
  >
    <Box minW="90px" maxW="110px">
      <Text fontSize="10px" fontWeight="bold" color="text.primary" lineClamp={1}>
        {cleanName(player.name)}
      </Text>
    </Box>
    <Box minW="28px">
      <Text fontSize="9px" color="text.muted" textTransform="uppercase">
        {player.position ?? "—"}
      </Text>
    </Box>
    {cols.map((col) => (
      <Box key={col.key} minW={col.w ?? "32px"} textAlign="right">
        <Text fontSize="9px" color="whiteAlpha.700">
          {col.fn ? col.fn(player) : f0(player[col.key])}
        </Text>
      </Box>
    ))}
  </Flex>
);

const ColHeader = ({ cols }) => (
  <Flex gap={2} pb={1} borderBottom="1px solid" borderColor="whiteAlpha.100" mb={1}>
    <Box minW="90px" maxW="110px">
      <Text fontSize="9px" color="text.muted" fontWeight="bold">Name</Text>
    </Box>
    <Box minW="28px">
      <Text fontSize="9px" color="text.muted" fontWeight="bold">Pos</Text>
    </Box>
    {cols.map((col) => (
      <Box key={col.key} minW={col.w ?? "32px"} textAlign="right">
        <Text fontSize="9px" color="text.muted" fontWeight="bold">{col.label}</Text>
      </Box>
    ))}
  </Flex>
);

const DualPlayerTable = ({ title, awayShort, homeShort, awayPlayers, homePlayers, cols }) => (
  <BSShell title={title}>
    <Grid templateColumns="1fr 1fr" gap={6}>
      <Box>
        <Text fontSize="10px" fontWeight="black" color="brand.400" mb={2}>{awayShort}</Text>
        <ColHeader cols={cols} />
        {awayPlayers.length > 0
          ? awayPlayers.map((p, i) => <PlayerRow key={p.player_key ?? i} player={p} cols={cols} />)
          : <Text fontSize="10px" color="text.muted" py={2}>No data</Text>
        }
      </Box>
      <Box>
        <Text fontSize="10px" fontWeight="black" color="brand.400" mb={2}>{homeShort}</Text>
        <ColHeader cols={cols} />
        {homePlayers.length > 0
          ? homePlayers.map((p, i) => <PlayerRow key={p.player_key ?? i} player={p} cols={cols} />)
          : <Text fontSize="10px" color="text.muted" py={2}>No data</Text>
        }
      </Box>
    </Grid>
  </BSShell>
);

// ─── Passing ─────────────────────────────────────────────────────────────────

const PASSING_COLS = [
  { key: "attempts",         label: "ATT" },
  { key: "completions",      label: "CMP" },
  { key: "completion_pct",   label: "%",   w: "36px", fn: (p) => fp(p.completion_pct) },
  { key: "yards",            label: "YDS", w: "36px" },
  { key: "touchdowns",       label: "TD" },
  { key: "interceptions",    label: "INT" },
  { key: "sacks_taken",      label: "SK" },
  { key: "sack_yards_lost",  label: "SKY" },
  { key: "yards_per_attempt",label: "YPA", w: "36px", fn: (p) => f1(p.yards_per_attempt) },
  { key: "hurries_faced",    label: "HRY" },
  { key: "fumbles",          label: "FUM" },
  { key: "_shrt",            label: "Shrt",w: "40px", fn: (p) => `${p.depth_breakdown?.short?.attempts ?? 0}/${p.depth_breakdown?.short?.completions ?? 0}` },
  { key: "_med",             label: "Med", w: "40px", fn: (p) => `${p.depth_breakdown?.medium?.attempts ?? 0}/${p.depth_breakdown?.medium?.completions ?? 0}` },
  { key: "_deep",            label: "Deep",w: "40px", fn: (p) => `${p.depth_breakdown?.deep?.attempts ?? 0}/${p.depth_breakdown?.deep?.completions ?? 0}` },
];

const PassingSection = ({ awayShort, homeShort, awayStats, homeStats }) => (
  <DualPlayerTable
    title="Passing"
    awayShort={awayShort}
    homeShort={homeShort}
    awayPlayers={awayStats.passing ?? []}
    homePlayers={homeStats.passing ?? []}
    cols={PASSING_COLS}
  />
);

// ─── Rushing ─────────────────────────────────────────────────────────────────

const RUSHING_COLS = [
  { key: "attempts",   label: "ATT" },
  { key: "yards",      label: "YDS", w: "36px" },
  { key: "yards_per_carry", label: "YPC", w: "36px", fn: (p) => f1(p.yards_per_carry) },
  { key: "touchdowns", label: "TD" },
  { key: "fumbles",    label: "FUM" },
  { key: "long",       label: "LNG" },
  { key: "_left",      label: "L",   w: "44px", fn: (p) => `${p.direction_breakdown?.left?.attempts ?? 0}/${p.direction_breakdown?.left?.yards ?? 0}` },
  { key: "_mid",       label: "Mid", w: "44px", fn: (p) => `${p.direction_breakdown?.middle?.attempts ?? 0}/${p.direction_breakdown?.middle?.yards ?? 0}` },
  { key: "_right",     label: "R",   w: "44px", fn: (p) => `${p.direction_breakdown?.right?.attempts ?? 0}/${p.direction_breakdown?.right?.yards ?? 0}` },
];

const RushingSection = ({ awayShort, homeShort, awayStats, homeStats }) => (
  <DualPlayerTable
    title="Rushing"
    awayShort={awayShort}
    homeShort={homeShort}
    awayPlayers={awayStats.rushing ?? []}
    homePlayers={homeStats.rushing ?? []}
    cols={RUSHING_COLS}
  />
);

// ─── Pass Catching / Receiving ────────────────────────────────────────────────

const RECEIVING_COLS = [
  { key: "targets",          label: "TGT" },
  { key: "receptions",       label: "REC" },
  { key: "catch_rate",       label: "%",   w: "36px", fn: (p) => fp(p.catch_rate) },
  { key: "yards",            label: "YDS", w: "36px" },
  { key: "yards_per_reception", label: "YPR", w: "36px", fn: (p) => f1(p.yards_per_reception) },
  { key: "yards_per_target", label: "YPT", w: "36px", fn: (p) => f1(p.yards_per_target) },
  { key: "touchdowns",       label: "TD" },
  { key: "fumbles",          label: "FUM" },
  { key: "deep_targets",     label: "Dp T" },
  { key: "deep_receptions",  label: "Dp R" },
];

const ReceivingSection = ({ awayShort, homeShort, awayStats, homeStats }) => (
  <DualPlayerTable
    title="Pass Catching / Receiving"
    awayShort={awayShort}
    homeShort={homeShort}
    awayPlayers={awayStats.receiving ?? []}
    homePlayers={homeStats.receiving ?? []}
    cols={RECEIVING_COLS}
  />
);

// ─── Defensive Havoc ─────────────────────────────────────────────────────────

const DEFENSE_COLS = [
  { key: "tackles",          label: "TOT" },
  { key: "solo_tackles",     label: "SOLO" },
  { key: "assisted_tackles", label: "AST" },
  { key: "sacks",            label: "SK",  w: "28px", fn: (p) => f1(p.sacks) },
  { key: "tfl",              label: "TFL" },
  { key: "qb_hurries",       label: "HRY" },
  { key: "interceptions",    label: "INT" },
  { key: "passes_defended",  label: "PD" },
  { key: "forced_fumbles",   label: "FF" },
  { key: "fumble_recoveries",label: "FR" },
  { key: "_havoc",           label: "HAV", w: "32px",
    fn: (p) => String((p.tfl ?? 0) + (p.sacks ?? 0) + (p.passes_defended ?? 0) + (p.interceptions ?? 0) + (p.forced_fumbles ?? 0)) },
];

const DefenseHavocSection = ({ awayShort, homeShort, awayStats, homeStats }) => (
  <DualPlayerTable
    title="Defensive Havoc"
    awayShort={awayShort}
    homeShort={homeShort}
    awayPlayers={awayStats.defense ?? []}
    homePlayers={homeStats.defense ?? []}
    cols={DEFENSE_COLS}
  />
);

// ─── Rush Defense (team) ──────────────────────────────────────────────────────

const RushDefenseSection = ({ awayShort, homeShort, aAdv, hAdv, aDefId, hDefId }) => {
  // Rush defense = defending against opponent rushes
  // "Away rush defense" = metrics about how away team stopped home rushing
  const aStuffPct  = fp(hAdv.stuff_rate);          // home's stuff rate = away defense forcing stuffs
  const hStuffPct  = fp(aAdv.stuff_rate);
  const aStopPct   = fp(hAdv.stopped_run_rate);
  const hStopPct   = fp(aAdv.stopped_run_rate);
  const aOpptyPct  = fp(hAdv.rush_opportunity_rate);
  const hOpptyPct  = fp(aAdv.rush_opportunity_rate);

  return (
    <BSShell title="Rush Defense">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Yds/Play Allowed"    away={f2(aDefId.yards_per_play_allowed)}        home={f2(hDefId.yards_per_play_allowed)} bold />
      <BSRow label="Stop Rate"           away={fp(hAdv.success_rate ? 1 - hAdv.success_rate : null)} home={fp(aAdv.success_rate ? 1 - aAdv.success_rate : null)} bold />
      <BSRow label="Explosive Prevention" away={fp(aDefId.explosive_prevention_rate)}    home={fp(hDefId.explosive_prevention_rate)} bold />
      <BSRow label="Stuff Rate Forced"   away={aStuffPct}                                home={hStuffPct} indent={1} />
      <BSRow label="Stopped Run Rate"    away={aStopPct}                                 home={hStopPct} indent={1} />
      <BSRow label="Opportunity Rate Allowed" away={aOpptyPct}                           home={hOpptyPct} indent={1} />
      <BSRow label="Disruption Rate"     away={fp(aDefId.disruption_rate)}               home={fp(hDefId.disruption_rate)} bold />
      <BSRow label="Bend Don't Break Idx" away={f2(aDefId.bend_dont_break_index)}        home={f2(hDefId.bend_dont_break_index)} indent={1} />
      <BSRow label="TFL Rate Forced"     away={fp(aAdv.tfl_rate_forced)}                 home={fp(hAdv.tfl_rate_forced)} indent={1} />
      <BSRow label="Sack Rate Forced"    away={fp(aAdv.sack_rate_forced)}                home={fp(hAdv.sack_rate_forced)} indent={1} />
    </BSShell>
  );
};

// ─── Pass Defense (team) ─────────────────────────────────────────────────────

const PassDefenseSection = ({ awayShort, homeShort, aAdv, hAdv, aDefId, hDefId, aPressure, hPressure }) => (
  <BSShell title="Pass Defense">
    <BSHeader awayShort={awayShort} homeShort={homeShort} />
    <BSRow label="Pass Defended Rate"   away={fp(aAdv.pass_defended_rate_forced)}    home={fp(hAdv.pass_defended_rate_forced)} bold />
    <BSRow label="Havoc Rate Forced"    away={fp(aAdv.havoc_rate_forced)}             home={fp(hAdv.havoc_rate_forced)} bold />
    <BSRow label="Havoc Rate Allowed"   away={fp(aAdv.havoc_rate_allowed)}            home={fp(hAdv.havoc_rate_allowed)} indent={1} />
    <BSRow label="Sacks Forced"         away={aPressure?.sacks_forced}                home={hPressure?.sacks_forced} bold />
    <BSRow label="QB Hurries Forced"    away={aPressure?.qb_hurries_forced}           home={hPressure?.qb_hurries_forced} indent={1} />
    <BSRow label="Total Pressures Forced" away={aPressure?.total_pressures_forced}    home={hPressure?.total_pressures_forced} indent={1} />
    <BSRow label="Pressure Rate Forced" away={fp(aPressure?.pressure_rate_forced)}   home={fp(hPressure?.pressure_rate_forced)} indent={1} />
    <BSRow label="Opp Dropbacks"        away={aPressure?.opponent_dropbacks}          home={hPressure?.opponent_dropbacks} indent={1} />
    <BSRow label="Under Pressure — ATT" away={aPressure?.pressure_attempts}          home={hPressure?.pressure_attempts} indent={1} />
    <BSRow label="Under Pressure — CMP" away={aPressure?.pressure_completions}       home={hPressure?.pressure_completions} indent={2} />
    <BSRow label="Under Pressure — YDS" away={aPressure?.pressure_yards}             home={hPressure?.pressure_yards} indent={2} />
    <BSRow label="Under Pressure — %"   away={fp(aPressure?.pressure_completion_pct)} home={fp(hPressure?.pressure_completion_pct)} indent={2} />
    <BSRow label="Explosive Prevention" away={fp(aDefId.explosive_prevention_rate)}  home={fp(hDefId.explosive_prevention_rate)} bold />
    <BSRow label="Defense Role — DB Coverage %" away={fp(aDefId.coverage_share_db)}  home={fp(hDefId.coverage_share_db)} indent={1} />
    <BSRow label="Defense Role — Ball Hawk %"   away={fp(aDefId.ball_hawk_share_db)} home={fp(hDefId.ball_hawk_share_db)} indent={1} />
  </BSShell>
);

// ─── Penalties (team) ────────────────────────────────────────────────────────

const PenaltiesSection = ({ awayShort, homeShort, aPen, hPen }) => (
  <BSShell title="Penalties">
    <BSHeader awayShort={awayShort} homeShort={homeShort} />
    <BSRow label="Total Accepted"         away={aPen?.total_accepted}              home={hPen?.total_accepted} bold />
    <BSRow label="Total Yards"            away={aPen?.total_yards}                 home={hPen?.total_yards} indent={1} />
    <BSRow label="Penalty Rate"           away={fp(aPen?.penalty_rate)}            home={fp(hPen?.penalty_rate)} indent={1} />
    <BSRow label="Pre-Snap Rate"          away={fp(aPen?.pre_snap_rate)}           home={fp(hPen?.pre_snap_rate)} indent={1} />
    <BSRow label="Live Ball Rate"         away={fp(aPen?.live_ball_rate)}          home={fp(hPen?.live_ball_rate)} indent={1} />
    <BSRow label="On 3rd Down"            away={aPen?.on_3rd_down}                 home={hPen?.on_3rd_down} bold />
    <BSRow label="On 4th Down"            away={aPen?.on_4th_down}                 home={hPen?.on_4th_down} indent={1} />
    <BSRow label="In Red Zone"            away={aPen?.in_red_zone}                 home={hPen?.in_red_zone} indent={1} />
    <BSRow label="In Clutch Time"         away={aPen?.in_clutch_time}              home={hPen?.in_clutch_time} indent={1} />
    <BSRow label="High Leverage"          away={aPen?.high_leverage_count}         home={hPen?.high_leverage_count} indent={1} />
    <BSRow label="False Start 3rd Down"   away={aPen?.false_start_3rd_down}        home={hPen?.false_start_3rd_down} indent={2} />
    <BSRow label="Holding on Pass Down"   away={aPen?.holding_on_passing_down}     home={hPen?.holding_on_passing_down} indent={2} />
    <BSRow label="Pre-Snap on Critical"   away={aPen?.pre_snap_on_critical_down}   home={hPen?.pre_snap_on_critical_down} indent={2} />
    <BSRow label="Auto 1st Downs Given"   away={aPen?.auto_first_downs_given}      home={hPen?.auto_first_downs_given} bold />
    <BSRow label="Auto 1st on Critical"   away={aPen?.auto_first_on_critical_down} home={hPen?.auto_first_on_critical_down} indent={1} />
    <BSRow label="Drive Kill Count"       away={aPen?.drive_kill_count}            home={hPen?.drive_kill_count} bold />
    <BSRow label="Drive Extend Count"     away={aPen?.drive_extend_count}          home={hPen?.drive_extend_count} indent={1} />
    <BSRow label="Penalty EPA Sum"        away={f2(aPen?.accepted_penalty_epa_sum)} home={f2(hPen?.accepted_penalty_epa_sum)} bold />
    <BSRow label="Hidden Yardage Lost"    away={aPen?.hidden_yardage_lost}         home={hPen?.hidden_yardage_lost} indent={1} />
    <BSRow label="Hidden Yardage Gained"  away={aPen?.hidden_yardage_gained}       home={hPen?.hidden_yardage_gained} indent={1} />
    <BSRow label="Repeat Offender Rate"   away={fp(aPen?.repeat_type_penalty_rate)} home={fp(hPen?.repeat_type_penalty_rate)} indent={1} />
  </BSShell>
);

// ─── Coaching Profile (team) ──────────────────────────────────────────────────

const CoachingProfileSection = ({ awayShort, homeShort, aCoach, hCoach }) => {
  const down = (n, side) => {
    const cp = side === "away" ? aCoach : hCoach;
    return cp?.run_pass_by_down?.[n];
  };
  const eff = (n, side) => {
    const cp = side === "away" ? aCoach : hCoach;
    return cp?.efficiency_by_down_call?.[n];
  };

  return (
    <BSShell title="Coaching Profile">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      {[1, 2, 3, 4].map((n) => (
        <Box key={n}>
          <BSRow
            label={`${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} Down Run Rate`}
            away={fp(down(n, "away")?.run_rate)}
            home={fp(down(n, "home")?.run_rate)}
            bold
          />
          <BSRow label="Runs / Passes" away={`${down(n,"away")?.runs ?? "—"} / ${down(n,"away")?.passes ?? "—"}`} home={`${down(n,"home")?.runs ?? "—"} / ${down(n,"home")?.passes ?? "—"}`} indent={1} />
          <BSRow label="Run Success Rate" away={fp(eff(n,"away")?.run_success_rate)} home={fp(eff(n,"home")?.run_success_rate)} indent={1} />
          <BSRow label="Pass Success Rate" away={fp(eff(n,"away")?.pass_success_rate)} home={fp(eff(n,"home")?.pass_success_rate)} indent={1} />
        </Box>
      ))}
      <BSRow label="Obvious Pass Success" away={fp(aCoach?.obvious_situation_execution?.obvious_pass_success_rate)} home={fp(hCoach?.obvious_situation_execution?.obvious_pass_success_rate)} bold />
      <BSRow label="Obvious Run Success"  away={fp(aCoach?.obvious_situation_execution?.obvious_run_success_rate)}  home={fp(hCoach?.obvious_situation_execution?.obvious_run_success_rate)} indent={1} />
      <BSRow label="Red Zone Run Rate"    away={fp(aCoach?.red_zone_tendency?.run_rate)}  home={fp(hCoach?.red_zone_tendency?.run_rate)} bold />
      <BSRow label="Red Zone Runs / Pass" away={`${aCoach?.red_zone_tendency?.runs ?? "—"} / ${aCoach?.red_zone_tendency?.passes ?? "—"}`} home={`${hCoach?.red_zone_tendency?.runs ?? "—"} / ${hCoach?.red_zone_tendency?.passes ?? "—"}`} indent={1} />
      <BSRow label="Short Yardage Run Rate" away={fp(aCoach?.short_yardage_tendency?.run_rate)} home={fp(hCoach?.short_yardage_tendency?.run_rate)} bold />
      <BSRow label="Halftime Adj — H1 SR" away={fp(aCoach?.halftime_adjustment?.h1_success_rate)} home={fp(hCoach?.halftime_adjustment?.h1_success_rate)} bold />
      <BSRow label="Halftime Adj — H2 SR" away={fp(aCoach?.halftime_adjustment?.h2_success_rate)} home={fp(hCoach?.halftime_adjustment?.h2_success_rate)} indent={1} />
      <BSRow label="Adjustment Delta"     away={f2(aCoach?.halftime_adjustment?.adjustment_delta)} home={f2(hCoach?.halftime_adjustment?.adjustment_delta)} indent={1} />
      <BSRow label="Predictability Index" away={f2(aCoach?.predictability_index)} home={f2(hCoach?.predictability_index)} bold />
    </BSShell>
  );
};

// ─── Officials / Ref Profile ──────────────────────────────────────────────────
// Game-level officials from metadata. Full crew analytics live in 5-officials/.

const OfficialsSection = ({ officials }) => {
  if (!officials) return null;
  const roles = Object.entries(officials);
  return (
    <BSShell title="Officials">
      <Box>
        {roles.map(([role, name]) => (
          <Flex key={role} justify="space-between" py={1.5} borderBottom="1px solid" borderColor="whiteAlpha.50">
            <Text fontSize="10px" color="text.muted" textTransform="uppercase" letterSpacing="wider">{role}</Text>
            <Text fontSize="xs" fontWeight="medium" color="text.primary">{cleanName(name)}</Text>
          </Flex>
        ))}
      </Box>
    </BSShell>
  );
};

// ─── Kickoff (team) ───────────────────────────────────────────────────────────

const KickoffSection = ({ awayShort, homeShort, aST, hST }) => {
  const aKO = aST?.kickoff_offense ?? {};
  const hKO = hST?.kickoff_offense ?? {};
  return (
    <BSShell title="Kickoff">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Attempts"          away={aKO.attempts}           home={hKO.attempts} bold />
      <BSRow label="Touchback Rate"    away={fp(aKO.touchback_rate)} home={fp(hKO.touchback_rate)} indent={1} />
      <BSRow label="Out of Bounds"     away={aKO.out_of_bounds_count} home={hKO.out_of_bounds_count} indent={1} />
      <BSRow label="Avg Start Allowed" away={aKO.avg_start_allowed != null ? `Own ${Math.round(aKO.avg_start_allowed)}` : "—"} home={hKO.avg_start_allowed != null ? `Own ${Math.round(hKO.avg_start_allowed)}` : "—"} indent={1} />
      <BSRow label="ESPA"              away={f2(aKO.espa)}           home={f2(hKO.espa)} bold />
    </BSShell>
  );
};

// ─── Kickoff Return (team) ────────────────────────────────────────────────────
// individual_stats[].returns[] is empty in all tested years — DATA GAP

const KickoffReturnSection = ({ awayShort, homeShort, aST, hST }) => {
  const aKD = aST?.kickoff_defense ?? {};
  const hKD = hST?.kickoff_defense ?? {};
  return (
    <BSShell title="Kickoff Return">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Attempts"         away={aKD.attempts}           home={hKD.attempts} bold />
      <BSRow label="Return Rate"      away={fp(aKD.return_rate)}    home={fp(hKD.return_rate)} indent={1} />
      <BSRow label="Avg Return Yards" away={f1(aKD.avg_return_yards)} home={f1(hKD.avg_return_yards)} indent={1} />
      <BSRow label="Explosive Returns" away={aKD.explosives}        home={hKD.explosives} indent={1} />
      <BSRow label="TDs"              away={aKD.touchdowns}         home={hKD.touchdowns} indent={1} />
      <BSRow label="Turnovers Forced" away={aKD.turnovers_forced}   home={hKD.turnovers_forced} indent={1} />
    </BSShell>
  );
};

// ─── Punting (team) ───────────────────────────────────────────────────────────

const PuntingSection = ({ awayShort, homeShort, aST, hST }) => {
  const aPO = aST?.punt_offense ?? {};
  const hPO = hST?.punt_offense ?? {};
  return (
    <BSShell title="Punting">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Attempts"         away={aPO.attempts}               home={hPO.attempts} bold />
      <BSRow label="Avg Gross Yards"  away={f1(aPO.avg_gross_yards)}    home={f1(hPO.avg_gross_yards)} indent={1} />
      <BSRow label="Inside 20"        away={fp(aPO.inside_20_rate)}     home={fp(hPO.inside_20_rate)} indent={1} />
      <BSRow label="Inside 10"        away={fp(aPO.inside_10_rate)}     home={fp(hPO.inside_10_rate)} indent={1} />
      <BSRow label="Block Rate"       away={fp(aPO.block_rate)}         home={fp(hPO.block_rate)} indent={1} />
      <BSRow label="Fair Catch Rate"  away={fp(aPO.fair_catch_rate)}    home={fp(hPO.fair_catch_rate)} indent={1} />
      <BSRow label="Downed"           away={aPO.downed_count}           home={hPO.downed_count} indent={1} />
    </BSShell>
  );
};

// ─── Punt Return (team) ───────────────────────────────────────────────────────
// individual_stats[].returns[] is empty in all tested years — DATA GAP

const PuntReturnSection = ({ awayShort, homeShort, aST, hST }) => {
  const aPD = aST?.punt_defense ?? {};
  const hPD = hST?.punt_defense ?? {};
  return (
    <BSShell title="Punt Return">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Attempts"         away={aPD.attempts}            home={hPD.attempts} bold />
      <BSRow label="Return Rate"      away={fp(aPD.return_rate)}     home={fp(hPD.return_rate)} indent={1} />
      <BSRow label="Avg Return Yards" away={f1(aPD.avg_return_yards)} home={f1(hPD.avg_return_yards)} indent={1} />
      <BSRow label="NYOE"             away={f2(aPD.nyoe)}            home={f2(hPD.nyoe)} bold />
      <BSRow label="Muffs Recovered"  away={aPD.muffs_recovered}     home={hPD.muffs_recovered} indent={1} />
      <BSRow label="Blocks"           away={aPD.blocks}              home={hPD.blocks} indent={1} />
    </BSShell>
  );
};

// ─── Field Goals (team) ───────────────────────────────────────────────────────

const FieldGoalsSection = ({ awayShort, homeShort, aST, hST }) => {
  const aFG = aST?.fg_offense ?? {};
  const hFG = hST?.fg_offense ?? {};
  const aFGD = aST?.fg_defense ?? {};
  const hFGD = hST?.fg_defense ?? {};
  const rng = (obj, key) => obj?.by_range?.[key];

  return (
    <BSShell title="Field Goals">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Attempts"              away={aFG.attempts}                  home={hFG.attempts} bold />
      <BSRow label="Made"                  away={aFG.made}                      home={hFG.made} indent={1} />
      <BSRow label="Pct"                   away={fp(aFG.pct)}                   home={fp(hFG.pct)} indent={1} />
      <BSRow label="Long"                  away={aFG.long}                      home={hFG.long} indent={1} />
      <BSRow label="Blocked"               away={aFG.blocked}                   home={hFG.blocked} indent={1} />
      <BSRow label="Kicker Trust Range"    away={aFG.kicker_talent_trust_range} home={hFG.kicker_talent_trust_range} indent={1} />
      <BSRow label="Coach Aggression Thr." away={aFG.coach_aggression_threshold} home={hFG.coach_aggression_threshold} indent={1} />
      <BSRow label="Under 30 (Att/Made)"   away={`${rng(aST,"u30")?.att ?? "—"}/${rng(aST,"u30")?.made ?? "—"}`} home={`${rng(hST,"u30")?.att ?? "—"}/${rng(hST,"u30")?.made ?? "—"}`} indent={1} />
      <BSRow label="30–39 (Att/Made)"      away={`${rng(aST,"30_39")?.att ?? "—"}/${rng(aST,"30_39")?.made ?? "—"}`} home={`${rng(hST,"30_39")?.att ?? "—"}/${rng(hST,"30_39")?.made ?? "—"}`} indent={1} />
      <BSRow label="40–49 (Att/Made)"      away={`${rng(aST,"40_49")?.att ?? "—"}/${rng(aST,"40_49")?.made ?? "—"}`} home={`${rng(hST,"40_49")?.att ?? "—"}/${rng(hST,"40_49")?.made ?? "—"}`} indent={1} />
      <BSRow label="50+ (Att/Made)"        away={`${rng(aST,"50p")?.att ?? "—"}/${rng(aST,"50p")?.made ?? "—"}`} home={`${rng(hST,"50p")?.att ?? "—"}/${rng(hST,"50p")?.made ?? "—"}`} indent={1} />
      <BSRow label="FG Defense — Against"  away={aFGD.attempts_against}         home={hFGD.attempts_against} bold />
      <BSRow label="Made Against"          away={aFGD.made_against}              home={hFGD.made_against} indent={1} />
      <BSRow label="Blocks"                away={aFGD.blocks}                    home={hFGD.blocks} indent={1} />
    </BSShell>
  );
};

// ─── PAT (team) ───────────────────────────────────────────────────────────────

const PATSection = ({ awayShort, homeShort, aST, hST }) => {
  const aPAT  = aST?.pat_offense ?? {};
  const hPAT  = hST?.pat_offense ?? {};
  const aPATD = aST?.pat_defense ?? {};
  const hPATD = hST?.pat_defense ?? {};
  return (
    <BSShell title="Point After Touchdown">
      <BSHeader awayShort={awayShort} homeShort={homeShort} />
      <BSRow label="Attempts"          away={aPAT.attempts}      home={hPAT.attempts} bold />
      <BSRow label="Made"              away={aPAT.made}          home={hPAT.made} indent={1} />
      <BSRow label="Pct"               away={fp(aPAT.pct)}       home={fp(hPAT.pct)} indent={1} />
      <BSRow label="Blocked"           away={aPAT.blocked}       home={hPAT.blocked} indent={1} />
      <BSRow label="PAT Defense — Against" away={aPATD.attempts_against} home={hPATD.attempts_against} bold />
      <BSRow label="Made Against"      away={aPATD.made_against} home={hPATD.made_against} indent={1} />
      <BSRow label="Blocks"            away={aPATD.blocks}       home={hPATD.blocks} indent={1} />
    </BSShell>
  );
};

// ─── Updated GameBoxScore export ─────────────────────────────────────────────

const GameBoxScoreFull = ({ game, awayId, homeId, awayShort, homeShort }) => {
  const teamBox        = game?.team_box ?? {};
  const advancedTeam   = game?.advanced_team ?? {};
  const penaltyAdv     = game?.penalty_advanced ?? {};
  const stAdv          = game?.special_teams_advanced ?? {};
  const defIdentity    = game?.defensive_identity ?? {};
  const teamEntries    = Object.entries(game?.individual_stats ?? {});
  const coachingProf   = game?.coaching_profile ?? {};
  const pressureProf   = game?.pressure_profile ?? {};
  const defRoleDist    = game?.defense_role_distribution ?? {};

  const aBox    = teamBox[awayId] ?? {};
  const hBox    = teamBox[homeId] ?? {};
  const aAdv    = advancedTeam[awayId] ?? {};
  const hAdv    = advancedTeam[homeId] ?? {};
  const aPen    = penaltyAdv[awayId];
  const hPen    = penaltyAdv[homeId];
  const aST     = stAdv[awayId];
  const hST     = stAdv[homeId];
  const aDefId  = { ...defIdentity[awayId] ?? {}, ...defRoleDist[awayId] ?? {} };
  const hDefId  = { ...defIdentity[homeId] ?? {}, ...defRoleDist[homeId] ?? {} };
  const aCoach  = coachingProf[awayId];
  const hCoach  = coachingProf[homeId];
  const aPressure = pressureProf[awayId];
  const hPressure = pressureProf[homeId];

  const awayStats = game?.individual_stats?.[awayId] ?? {};
  const homeStats = game?.individual_stats?.[homeId] ?? {};

  const shared = { awayShort, homeShort, aBox, hBox, aAdv, hAdv };

  return (
    <Box>
      {/* ── Team production ───────────────────────────────────────── */}
      <EPAPanel {...shared} aPen={aPen} hPen={hPen} />

      <Grid templateColumns="1fr 1fr" gap={4}>
        <ProductionPanel {...shared} />
        <RushingPanel    {...shared} />
      </Grid>

      <ExplosivePanel   {...shared} />
      <SituationalPanel {...shared} />

      <Grid templateColumns="1fr 1fr 1fr" gap={4}>
        <DrivesBoxPanel  {...shared} />
        <DefensivePanel  {...shared} awayId={awayId} homeId={homeId} aDefId={aDefId} hDefId={hDefId} teamEntries={teamEntries} />
        <TurnoversPanel  {...shared} awayId={awayId} homeId={homeId} teamEntries={teamEntries} />
      </Grid>

      <SpecialTeamsPanel {...shared} aST={aST} hST={hST} />

      {/* ── Individual production ─────────────────────────────────── */}
      <PassingSection    awayShort={awayShort} homeShort={homeShort} awayStats={awayStats} homeStats={homeStats} />
      <RushingSection    awayShort={awayShort} homeShort={homeShort} awayStats={awayStats} homeStats={homeStats} />
      <ReceivingSection  awayShort={awayShort} homeShort={homeShort} awayStats={awayStats} homeStats={homeStats} />
      <DefenseHavocSection awayShort={awayShort} homeShort={homeShort} awayStats={awayStats} homeStats={homeStats} />

      {/* ── Defense (team) ────────────────────────────────────────── */}
      <Grid templateColumns="1fr 1fr" gap={4}>
        <RushDefenseSection {...shared} aDefId={aDefId} hDefId={hDefId} />
        <PassDefenseSection {...shared} aDefId={aDefId} hDefId={hDefId} aPressure={aPressure} hPressure={hPressure} />
      </Grid>

      {/* ── Penalties + Coaching ──────────────────────────────────── */}
      <Grid templateColumns="1fr 1fr" gap={4}>
        <PenaltiesSection      awayShort={awayShort} homeShort={homeShort} aPen={aPen} hPen={hPen} />
        <CoachingProfileSection awayShort={awayShort} homeShort={homeShort} aCoach={aCoach} hCoach={hCoach} />
      </Grid>

      {/* ── Officials ─────────────────────────────────────────────── */}
      <OfficialsSection officials={game?.metadata?.officials} />

      {/* ── Special Teams detail ──────────────────────────────────── */}
      <Grid templateColumns="1fr 1fr" gap={4}>
        <KickoffSection       awayShort={awayShort} homeShort={homeShort} aST={aST} hST={hST} />
        <KickoffReturnSection awayShort={awayShort} homeShort={homeShort} aST={aST} hST={hST} />
      </Grid>
      <Grid templateColumns="1fr 1fr" gap={4}>
        <PuntingSection    awayShort={awayShort} homeShort={homeShort} aST={aST} hST={hST} />
        <PuntReturnSection awayShort={awayShort} homeShort={homeShort} aST={aST} hST={hST} />
      </Grid>
      <Grid templateColumns="1fr 1fr" gap={4}>
        <FieldGoalsSection awayShort={awayShort} homeShort={homeShort} aST={aST} hST={hST} />
        <PATSection        awayShort={awayShort} homeShort={homeShort} aST={aST} hST={hST} />
      </Grid>
    </Box>
  );
};

export { GameBoxScoreFull };
export default GameBoxScore;
