import { RPoster, Panels, Table, DATA, int, one, Scatter, uniqueBy, epa, lastName, Board, pct, Dumbbell } from "./kit";
import { ClutchPlays, WinChanceSwings, WinChanceSeason, ClutchTables } from "./leaders/ClutchPanels";

// ── 1 · The leaders: who's on top, and whether the yards were worth anything ──

const LeadersTable = (props) => (
  <RPoster {...props} title="Per game leaders">
    <Panels>
      <Table pal={props.pal} title="Receiving yards" rows={DATA.leaders_ypg.filter((r) => r.name !== "Zaden Jackson")} cols={[
        { label: "G", get: (r) => r.games, w: 36 }, { label: "Yds", get: (r) => int(r.yards), w: 54 }, { label: "TD", get: (r) => r.td, w: 36 }, { label: "Per game", get: (r) => one(r.ypg), w: 92, strong: true },
      ]} />
      <Table pal={props.pal} title="Catches" rows={DATA.leaders_cpg.filter((r) => r.name !== "Brendon Wyatt")} cols={[
        { label: "G", get: (r) => r.games, w: 36 }, { label: "Rec", get: (r) => r.catches, w: 54 }, { label: "Yds", get: (r) => int(r.yards), w: 54 }, { label: "Per game", get: (r) => one(r.rpg), w: 92, strong: true },
      ]} />
    </Panels>
  </RPoster>
);

const ValueScatter = (props) => (
  <RPoster {...props} title="Yards per game × EPA per target">
    <Scatter pal={props.pal} rows={uniqueBy([...DATA.value, ...DATA.low_value], "name")} x={(r) => r.ypg} y={(r) => r.epa} xFmt={(v) => v.toFixed(0)} yFmt={(v) => epa(v)} xLabel="Yards per game" yLabel="EPA per target" label={(r) => lastName(r.name)} />
  </RPoster>
);

const FirstDowns = (props) => (
  <RPoster {...props} title="First downs per target">
    <Board pal={props.pal} rows={DATA.first_downs} get={(r) => r.conv_t} fmt={pct} label="Rate" extras={[{ label: "1st downs", get: (r) => r.conv, w: 104 }, { label: "Targets", get: (r) => r.targets }]} />
  </RPoster>
);

const TdRate = (props) => (
  <RPoster {...props} title="Touchdowns per target">
    <Board pal={props.pal} rows={DATA.td_rate} get={(r) => r.td_rate} fmt={pct} label="Rate" extras={[{ label: "TD", get: (r) => r.td }, { label: "Targets", get: (r) => r.targets }]} />
  </RPoster>
);

const LeadTrail = (props) => (
  <RPoster {...props} title="Yards per target, ahead and behind">
    <Dumbbell pal={props.pal} rows={uniqueBy([...DATA.lead_up, ...DATA.lead_down], "name").sort((a, b) => (b.behind_ypt - b.ahead_ypt) - (a.behind_ypt - a.ahead_ypt))} a={(r) => r.ahead_ypt} b={(r) => r.behind_ypt} fmt={one} aLabel="Leading" bLabel="Trailing" />
  </RPoster>
);

export const LEADERS_GROUP = {
  id: "leaders", label: "The leaders",
  posters: [
    { id: "table", chip: "Per game leaders", Poster: LeadersTable },
    { id: "value", chip: "Yards vs value", tweet: "Big yards don't always mean big value", Poster: ValueScatter },
    { id: "first-downs", chip: "First downs", tweet: "Who moves the chains on every look", Poster: FirstDowns },
    { id: "td-rate", chip: "TD rate", tweet: "Who finds the end zone most often when targeted", Poster: TdRate },
    { id: "lead-trail", chip: "Ahead vs behind", tweet: "Who gets better when the team falls behind", Poster: LeadTrail },
  ],
};

export const CLUTCH_GROUP = {
  id: "clutch", label: "Clutch",
  posters: [
    { id: "plays", chip: "The plays", tweet: "The catches that decided games this season", Poster: ClutchPlays },
    { id: "swings", chip: "Win chance swings", tweet: "One catch can change everything", Poster: WinChanceSwings },
    { id: "added", chip: "Win chance added", tweet: "The receivers who added the most win chance", Poster: WinChanceSeason },
    { id: "tables", chip: "Big moments", Poster: ClutchTables },
  ],
};
