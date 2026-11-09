import { scatterPoster } from "./passDefensePosters/DefenseScatter";
import { pct0, metricOf, leagueOf } from "./passDefensePosters/posterModel";
import { boardPoster, RateBoard } from "./passDefensePosters/DefenseBoards";
import { usePD } from "./passDefensePosters/usePassDefensePosterData";
import { Poster, Card, AvgNote, Waiting } from "./passDefensePosters/PosterPrimitives";
import { DepthPoster, TargetsPoster } from "./passDefensePosters/DepthTargets";
import { HalftimePoster } from "./passDefensePosters/HalftimePoster";

// ── the posters ──────────────────────────────────────────────────────────────

const PassPoster = scatterPoster({
  title: "Who shuts down", accent: "the pass", kicker: "Passing success allowed × Explosive passes allowed",
  y: ["pass_attempt", "success_allowed"], x: ["pass_attempt", "explosive_20_rate"],
  yLabel: "Passing success allowed", xLabel: "20+ yard gains per attempt",
  yFmt: pct0, xFmt: pct0, yStep: 0.05, xStep: 0.02,
  quads: ["Bends, then breaks", "Shuts it down", "Gets thrown on", "Death by a thousand cuts"],
});

const FirstDownPoster = scatterPoster({
  title: "Winning", accent: "first down", kicker: "1st down passing success allowed × Explosive passes allowed",
  x: ["down_1", "success_allowed"], y: ["down_1", "explosive_20_rate"],
  xLabel: "First-down passing success allowed", yLabel: "20+ yard gains per attempt",
  xFmt: pct0, yFmt: pct0, xStep: 0.05, yStep: 0.05,
  quads: ["Bend, don't break", "Wins first down", "Loses first down", "Boom or bust"],
});

const AirYacPoster = scatterPoster({
  title: "Air or", accent: "after the catch", kicker: "Yards per attempt allowed × Yards after catch allowed",
  x: ["pass_attempt", "air_yards_per_charted_completion"], y: ["pass_attempt", "yac_per_charted_completion"],
  xLabel: "Air yards per completion", yLabel: "Yards after the catch per completion",
  xFmt: (v) => v.toFixed(0), yFmt: (v) => v.toFixed(0), xStep: 1, yStep: 1,
  quads: ["Beaten deep", "Tight on both", "Beaten everywhere", "Missed tackles"],
});

const SticksPoster = boardPoster({
  title: "Behind", accent: "the sticks", kicker: "3rd & 7+ pass plays: first downs allowed",
  bucket: "third_and_long", measure: "conversion_allowed", better: "lower",
});

const RedZonePoster = boardPoster({
  title: "Red zone", accent: "resistance", kicker: "Touchdowns allowed per red zone throw",
  bucket: "red_zone", measure: "pass_td_per_attempt", better: "lower",
});

const ClosingPoster = boardPoster({
  title: "Closing", accent: "time", kicker: "4th QTR, 1 score game: passing success rate allowed",
  bucket: "late_close", measure: "success_allowed", better: "lower",
});

const HawksPoster = boardPoster({
  title: "Ball", accent: "hawks", kicker: "Pass disruption rate",
  bucket: "pass_attempt", measure: "ball_disruption_rate", better: "higher",
});

// Explosive prevention: 20+ gains per attempt, with the share of passing yards they made.
const ExplosivePoster = ({ pal, innerRef }) => {
  const { docs, index, ready, error } = usePD();
  const rows = docs.map((d) => ({ id: d.team_id, m: metricOf(d, "pass_attempt", "explosive_20_rate"), share: metricOf(d, "pass_attempt", "explosive_20_yard_share") }));
  const avg = leagueOf(index, "pass_attempt", "explosive_20_rate");
  return (
    <Poster pal={pal} innerRef={innerRef} title="Explosive" accent="prevention">
      <Card pal={pal} kicker="Explosive rate" right={<AvgNote pal={pal} avg={avg} />}>
        {ready ? (
          <RateBoard pal={pal} rows={rows} better="lower" avg={avg}
            extra={(r) => (Number.isFinite(r.share?.value) ? `${pct0(r.share.value)} of yards` : "")} />
        ) : <Waiting pal={pal} error={error} />}
      </Card>
    </Poster>
  );
};

// `tweet` is the post's headline: shown above the preview for writing the tweet, never in the image.
export const PASS_DEFENSE_POSTERS = [
  { id: "pass", chip: "Who shuts down the pass", Poster: PassPoster, tweet: "Who shuts down the pass?" },
  { id: "firstdown", chip: "Winning first down", Poster: FirstDownPoster, tweet: "Who wins first down?" },
  { id: "sticks", chip: "Behind the sticks", Poster: SticksPoster, tweet: "Behind the sticks: who finishes the stop on 3rd & long?" },
  { id: "redzone", chip: "Red zone", Poster: RedZonePoster, tweet: "Red zone resistance: who keeps throws inside the 20 out of the end zone?" },
  { id: "closing", chip: "Closing time", Poster: ClosingPoster, tweet: "Closing time: who holds up late in one-score games?" },
  { id: "airyac", chip: "Air or after", Poster: AirYacPoster, tweet: "Air or after the catch: where are the yards coming from?" },
  { id: "depth", chip: "Where they get hit", Poster: DepthPoster, tweet: "Where they get hit: short, medium or deep?" },
  { id: "targets", chip: "Who they throw at", Poster: TargetsPoster, tweet: "Who do opponents throw at: receivers, tight ends or backs?" },
  { id: "halftime", chip: "After halftime", Poster: HalftimePoster, tweet: "After halftime: who tightens up, and who falls apart?" },
  { id: "explosive", chip: "Explosive prevention", Poster: ExplosivePoster, tweet: "Explosive prevention: who gives up the big one?" },
  { id: "hawks", chip: "Ball hawks", Poster: HawksPoster, tweet: "Ball hawks: who gets their hands on the ball?" },
];

export { PD_META } from "./passDefensePosters/posterModel";
