import fixture from "../components/organisms/test/passDefenseFixture.json";
import { buildPassDefenseView, passDefenseConflicts } from "./passDefenseModel";
import { effectivePassDefenseScope, INITIAL_PASS_DEFENSE_SELECTION, PASS_DEFENSE_VISUALS } from "./passDefenseConfig";

const select = (visual, patch = {}) => ({ ...INITIAL_PASS_DEFENSE_SELECTION, visual, ...patch });
const doc = fixture.documents.find((d) => d.team_id === "swacjsu");

test("all thirteen visuals have ready, alternate or blocked states", () => {
  expect(PASS_DEFENSE_VISUALS).toHaveLength(13);
  expect(PASS_DEFENSE_VISUALS.filter((v) => v.blocked).map((v) => v.id)).toEqual(["PD03", "PD07", "PD12"]);
  for (const v of PASS_DEFENSE_VISUALS) {
    const view = buildPassDefenseView(select(v.id), fixture);
    expect(Boolean(view.blocked)).toBe(Boolean(v.blocked));
  }
  const ready = PASS_DEFENSE_VISUALS.filter((v) => !v.blocked);
  expect(ready.every((v) => buildPassDefenseView(select(v.id), fixture).rows.length > 0)).toBe(true);
});

test("uses the published disruption rate and competitive counterpart without recomputing", () => {
  for (const scope of ["all", "competitive"]) {
    const view = buildPassDefenseView(select("PD01", { scope }), fixture);
    const metric = view.rows.find((r) => r.id === doc.team_id).a;
    const raw = doc.subsets[scope].pass_attempt.metrics.ball_disruption_rate;
    expect(metric.value).toBe(raw.value);
    expect(metric.numerator).toBe(raw.numerator);
    expect(metric.n).toBe(raw.n);
    expect(metric.rank).toBe(raw.ranking?.rank ?? null);
  }
});

test("preserves zero, published null, absent measure and unranked sample separately", () => {
  const data = { documents: [
    { team_id: "swacjsu", subsets: { all: { pass_attempt: { metrics: { ball_disruption_rate: { value: 0, n: 10, numerator: 0 } } } } } },
    { team_id: "swacaamu", subsets: { all: { pass_attempt: { metrics: { ball_disruption_rate: { value: null, n: 0, numerator: 0 } } } } } },
    { team_id: "swactsu", subsets: { all: {} } },
  ] };
  const rows = buildPassDefenseView(select("PD01"), data).rows;
  expect(rows[0].a).toMatchObject({ value: 0, n: 10, state: "value", qualification: "Unranked sample" });
  expect(rows[1].a).toMatchObject({ value: null, n: 0, state: "null" });
  expect(rows[2].a).toMatchObject({ value: null, state: "absent" });
});

test("first-down and halftime series keep their individual samples", () => {
  expect(buildPassDefenseView(select("PD02"), fixture).kind).toBe("scatter");
  const halftime = buildPassDefenseView(select("PD06"), fixture);
  expect(halftime.kind).toBe("scatter");
  expect(halftime.equalAxes).toBe(true);
  const first = buildPassDefenseView(select("PD02"), fixture).rows.find((r) => r.id === doc.team_id);
  expect(first.a.n).toBe(doc.subsets.all.down_1.metrics.success_allowed.n);
  expect(first.b.n).toBe(doc.subsets.all.down_1.metrics.explosive_20_rate.n);
  const halves = buildPassDefenseView(select("PD06"), fixture).rows.find((r) => r.id === doc.team_id);
  expect(halves.a.value).toBe(doc.subsets.all.first_half.metrics.success_allowed.value);
  expect(halves.b.n).toBe(doc.subsets.all.second_half.metrics.success_allowed.n);
});

test("red-zone alternate is success allowed, not a touchdown-denial claim", () => {
  const view = buildPassDefenseView(select("PD04"), fixture);
  expect(view.title).toBe("Red-zone passing success allowed");
  expect(view.rows.find((r) => r.id === doc.team_id).a.value).toBe(doc.subsets.all.red_zone.metrics.success_allowed.value);
});

test("full-only headline, spatial and player-counting measures cannot use competitive labels", () => {
  expect(effectivePassDefenseScope(select("PD01", { scope: "competitive", overview: "epa_per_pass" }))).toBe("all");
  expect(effectivePassDefenseScope(select("PD08", { scope: "competitive" }))).toBe("all");
  expect(effectivePassDefenseScope(select("PD11", { scope: "competitive", role: "brup" }))).toBe("all");
  expect(effectivePassDefenseScope(select("PD11", { scope: "competitive", role: "catches_tackled" }))).toBe("competitive");
});

test("spatial view pivots exact cells without pooling and respects its gate", () => {
  const view = buildPassDefenseView(select("PD08"), fixture);
  const cells = fixture.spatial.teams.find((t) => t.team_id === doc.team_id).defense.pass_grid;
  expect(view.rows.map((r) => r.id)).toEqual(["short", "medium", "deep"]);
  for (const row of view.rows) for (const direction of ["left", "middle", "right"]) {
    const cell = cells.find((c) => c.depth === row.id && c.direction === direction);
    expect(row[direction].value).toBe(cell?.success_rate ?? null);
    expect(row[direction].n).toBe(cell?.attempts ?? null);
  }
  expect(buildPassDefenseView(select("PD08"), { ...fixture, spatial: { availability: { pass_grid: { available: false } } } }).blocked).toBeTruthy();
});

test("receiver group values, samples and ranks come from the selected dictionary scope", () => {
  const view = buildPassDefenseView(select("PD09", { scope: "competitive" }), fixture);
  const row = view.rows.find((r) => r.id === doc.team_id);
  for (const group of ["wr", "te", "rb"]) {
    const raw = fixture.receiving.teams[doc.team_id].defense.competitive[`${group}_epa_per_target`];
    expect(row[group]).toMatchObject({ value: raw.value, n: raw.n, rank: raw.rank ?? null });
  }
});

test("PBU counts use brup, and sacks retain fractional credits", () => {
  const data = { documents: [], counting: { players: [{ person_id: "test", team_id: "swacjsu", display_name: "Test", defense: { brup: 2, pd: 9, int: 7, sacks: 0.5 } }] } };
  expect(buildPassDefenseView(select("PD11", { role: "brup" }), data).rows[0].a.value).toBe(2);
  expect(buildPassDefenseView(select("PD11", { role: "sacks" }), data).rows[0].a.value).toBe(0.5);
});

test("weekly points retain Week 0 and missing metric gaps", () => {
  const data = { documents: [{ team_id: "swacjsu", games: [
    { game: "a", week: 0, date: "2026-08-29", opponent: "swactsu", scopes: { all: { pass_attempt: { metrics: { completion_rate: { value: 0, n: 4, numerator: 0 } } } } } },
    { game: "b", week: 1, date: "2026-09-05", opponent: "swacaamu", scopes: { all: {} } },
    { game: "c", week: 3, date: "2026-09-19", opponent: "swacaamu", scopes: { all: {} } },
  ] }] };
  const view = buildPassDefenseView(select("PD13"), data);
  expect(view.rows[0].name).toContain("W0 ");
  expect(view.rows[0].a.value).toBe(0);
  expect(view.rows[1].a.value).toBeNull();
  expect(view.rows[2].breakBefore).toBe(true);
});

test("source conflicts stay visible and selection does not mutate the source bundle", () => {
  const before = JSON.stringify(fixture);
  for (const v of PASS_DEFENSE_VISUALS) buildPassDefenseView(select(v.id), fixture);
  expect(JSON.stringify(fixture)).toBe(before);
  expect(passDefenseConflicts(fixture).find((c) => c.teamId === "swactsu").sources).toHaveLength(2);
});
