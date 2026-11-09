import teamsData from "../data/teams.json";
import { CONTRIBUTOR_ROLES, effectivePassDefenseScope, OVERVIEW_METRICS, PASS_DEFENSE_VISUALS, SITUATIONS, TRAJECTORY_METRICS } from "./passDefenseConfig";

const THEMES = Object.fromEntries(teamsData.teams.map((team) => [team.exportId.replace(/25$/, ""), team]));
export const passDefenseTeam = (id, metadata) => {
  const theme = THEMES[id];
  const published = metadata?.teams?.find((team) => team.team_id === id);
  return { id, name: theme?.name ?? published?.school_name ?? id, short: theme?.shortName ?? id, colors: theme?.colors, logo: theme?.logo ?? null };
};

const measure = (raw, definition, extra = {}) => ({
  value: Number.isFinite(raw?.value) ? raw.value : null,
  state: raw == null ? "absent" : Number.isFinite(raw.value) ? "value" : "null",
  numerator: raw?.numerator ?? null, n: raw?.n ?? null,
  rank: raw?.ranking?.rank ?? raw?.rank ?? null,
  tied: raw?.ranking?.tied ?? raw?.tied ?? false, of: raw?.ranking?.of ?? null,
  definition: definition?.definition ?? "Published measure.", denominator: definition?.denominator ?? "Sample not published",
  qualification: raw?.ranking?.rank != null || raw?.rank != null ? "Published rank" : "Unranked sample",
  ...extra,
});

const SERIES_COLORS = ["#397BC5", "#C2782D", "#8A5CC2"];
const series = (key, label, color) => ({ key, label, color });
const finite = (v) => Number.isFinite(v);

export const buildPassDefenseView = (selection, data) => {
  const visual = PASS_DEFENSE_VISUALS.find((v) => v.id === selection.visual) ?? PASS_DEFENSE_VISUALS[0];
  const scope = effectivePassDefenseScope(selection);
  const defs = data.definitions?.measures ?? {};
  const documents = data.documents ?? [];
  const team = (id) => passDefenseTeam(id, data.metadata);
  const base = {
    id: visual.id, title: visual.title, scope, unit: "pct", better: "lower", kind: "bar",
    source: "Pass-defense foundation · matched situations", series: [], rows: [], notes: [],
    blocked: visual.blocked ?? null,
  };
  const metric = (doc, bucket, key) => measure(doc.subsets?.[scope]?.[bucket]?.metrics?.[key], defs[key]);
  const row = (doc, values) => ({ id: doc.team_id, name: team(doc.team_id).short, fullName: team(doc.team_id).name, ...values });
  const foundation = (bucket, key) => documents.map((doc) => row(doc, { a: metric(doc, bucket, key) }));
  if (base.blocked) return base;

  switch (visual.id) {
    case "PD01": {
      const option = OVERVIEW_METRICS.find((m) => m.id === selection.overview) ?? OVERVIEW_METRICS[0];
      base.title = option.label;
      base.unit = option.unit;
      base.better = option.better ?? "lower";
      base.series = [series("a", option.label)];
      if (option.source === "advanced") {
        base.source = "Team Analytics advanced · full-game passing";
        base.rows = documents.map((doc) => {
          const raw = data.advanced?.teams?.find((t) => t.team_id === doc.team_id)?.defense?.[option.id];
          return row(doc, { a: measure(raw === undefined ? undefined : { value: raw }, null, {
            definition: option.label, qualification: "Rank and matched sample not published in this source",
          }) });
        });
        base.notes.push("This headline source does not publish matched numerators or denominators for these fields. The 16+ explosive definition differs from the foundation's 20+ credited-yard measure.");
      } else {
        base.rows = foundation("pass_attempt", "ball_disruption_rate");
        base.notes.push("Share of pass attempts with a recorded break-up or interception. An attempt with both counts once. This measures recorded ball disruption, not coverage wins or overall pass-defense quality.");
      }
      break;
    }
    case "PD02":
      base.kind = "scatter";
      base.xLabel = "First-down passing success allowed";
      base.yLabel = "First-down 20+ gains per attempt";
      base.notes.push("Lower left: less passing success and fewer 20+ gains allowed. Each axis retains its own sample.");
      base.series = [series("a", "Passing success allowed", SERIES_COLORS[0]), series("b", "20+ gains per attempt", SERIES_COLORS[1])];
      base.rows = documents.map((doc) => row(doc, { a: metric(doc, "down_1", "success_allowed"), b: metric(doc, "down_1", "explosive_20_rate") }));
      base.notes.push("20+ means credited gain, not air-yard depth. Each series uses its own published denominator.");
      break;
    case "PD04":
      base.title = "Red-zone passing success allowed";
      base.series = [series("a", "Passing success allowed")];
      base.rows = foundation("red_zone", "success_allowed");
      base.notes.push("Available alternate: passing success, not passing touchdown denial. The passing-TD rate is not published.");
      break;
    case "PD05":
      base.title = "Late-and-close passing success allowed";
      base.series = [series("a", "Passing success allowed")];
      base.rows = foundation("late_close", "success_allowed");
      base.notes.push("Overtime or fourth quarter with pre-snap margin at most eight. Small unranked samples are labelled; absent opportunities are not zero.");
      break;
    case "PD06":
      base.kind = "scatter";
      base.equalAxes = true;
      base.xLabel = "First-half passing success allowed";
      base.yLabel = "Second-half passing success allowed";
      base.series = [series("a", "First half", SERIES_COLORS[0]), series("b", "Second half", SERIES_COLORS[1])];
      base.rows = documents.map((doc) => row(doc, { a: metric(doc, "first_half", "success_allowed"), b: metric(doc, "second_half", "success_allowed") }));
      base.notes.push("Below the diagonal: lower success allowed after halftime. Above: higher success allowed. Regulation only; this does not establish a coaching effect.");
      break;
    case "PD08": {
      base.title = `${team(selection.teamId).name}: passing success by depth / direction`;
      base.source = "Team Analytics Spatial · full-game measured air-depth cells";
      base.series = ["left", "middle", "right"].map((direction, i) => series(direction, direction[0].toUpperCase() + direction.slice(1), SERIES_COLORS[i]));
      if (!data.spatial?.availability?.pass_grid?.available) {
        base.blocked = "The published season-wide passing-grid availability gate is closed.";
        break;
      }
      const cells = data.spatial.teams?.find((t) => t.team_id === selection.teamId)?.defense?.pass_grid ?? [];
      base.rows = ["short", "medium", "deep"].map((depth) => {
        const output = { id: depth, name: { short: "Short <4", medium: "Medium 4–12", deep: "Deep 13+" }[depth], fullName: team(selection.teamId).name };
        for (const direction of ["left", "middle", "right"]) {
          const cell = cells.find((c) => c.depth === depth && c.direction === direction);
          output[direction] = measure(cell && { value: cell.success_rate, numerator: cell.successes, n: cell.attempts }, null, {
            qualification: "Cell; no published rank", definition: "Published passing success rate for this exact depth/direction cell.", denominator: "attempts",
            detail: cell ? `Completions ${cell.completions}; TD ${cell.touchdowns}; INT ${cell.interceptions}; charted completions ${cell.split_completions}` : null,
          });
        }
        return output;
      });
      const coverage = data.spatial.availability.pass_grid.coverage;
      base.notes.push(`Season-wide charting coverage: ${Number.isFinite(coverage) ? (coverage * 100).toFixed(1) + "%" : "not published"}. This is not a per-cell completeness guarantee. Air-yard bands; no cells are pooled.`);
      break;
    }
    case "PD09":
      base.title = "EPA allowed per opposing receiver target";
      base.unit = "epa";
      base.source = "Receiving production · opponent receiver roster groups";
      base.series = ["wr", "te", "rb"].map((group, i) => series(group, group.toUpperCase(), SERIES_COLORS[i]));
      base.rows = documents.map((doc) => {
        const source = data.receiving?.teams?.[doc.team_id]?.defense?.[scope];
        return row(doc, Object.fromEntries(["wr", "te", "rb"].map((group) => [group, measure(source?.[`${group}_epa_per_target`], null, {
          definition: `Offensive EPA allowed per target to an opposing ${group.toUpperCase()}.`, denominator: "targets",
          detail: `Other target share: ${source?.other_target_share?.value == null ? "unavailable" : (source.other_target_share.value * 100).toFixed(1) + "%"}; unidentified: ${source?.unidentified_target_share?.value == null ? "unavailable" : (source.unidentified_target_share.value * 100).toFixed(1) + "%"}`,
        })])));
      });
      base.notes.push("Receiver roster groups are not individual defender coverage assignments. Each group's own target sample appears in the tooltip.");
      break;
    case "PD10":
      base.title = `${SITUATIONS.find(([key]) => key === selection.situation)?.[1] ?? selection.situation}: passing success allowed`;
      base.series = [series("a", "Passing success allowed")];
      base.rows = foundation(selection.situation, "success_allowed");
      break;
    case "PD11": {
      const role = CONTRIBUTOR_ROLES.find((r) => r.id === selection.role) ?? CONTRIBUTOR_ROLES[0];
      base.title = `Observed defensive contributions: ${role.label.toLowerCase()}`;
      base.unit = "count"; base.better = "higher";
      base.source = role.id === "catches_tackled" ? "Pass-defense catch-finishing production" : "Published player counting statistics · full game";
      base.series = [series("a", role.label)];
      const players = role.id === "catches_tackled" ? data.finishing?.players : data.counting?.players;
      base.rows = (players ?? []).map((player) => {
        const value = role.id === "catches_tackled" ? player[scope]?.catches_tackled : player.defense?.[role.id];
        const raw = role.id === "catches_tackled" ? value : value === undefined || value === null ? undefined : { value };
        return { id: `${player.person_id}:${player.team_id}`, teamId: player.team_id,
          name: `${player.display_name ?? player.name} · ${team(player.team_id).short}`, fullName: player.display_name ?? player.name,
          a: measure(raw, null, { qualification: player.qualified === false ? "Unqualified sample" : player.qualified === true ? "Qualified sample" : "Rank not published",
            definition: role.id === "brup" ? "Published pass break-ups; excludes interceptions. Not defense.pd." : role.label,
            denominator: "Sample not published", detail: `Games: ${player.games ?? player.team_games ?? "not published"}; position: ${player.position ?? "not published"}` }),
        };
      }).filter((r) => finite(r.a.value)).sort((a, b) => b.a.value - a.a.value).slice(0, 20);
      base.notes.push("Top 20 published counts, sorted for display; order is not an official rank. Sacks may be fractional. Catch tackles are not coverage targets.");
      break;
    }
    case "PD13": {
      const option = TRAJECTORY_METRICS.find((m) => m.id === selection.trajectory) ?? TRAJECTORY_METRICS[0];
      base.kind = "line"; base.unit = option.unit;
      base.title = `${team(selection.teamId).name}: ${option.label.toLowerCase()}`;
      base.series = [series("a", option.label, SERIES_COLORS[0])];
      const doc = documents.find((d) => d.team_id === selection.teamId);
      base.rows = [...(doc?.games ?? [])].sort((a, b) => String(a.date).localeCompare(String(b.date)) || (a.week ?? 0) - (b.week ?? 0)).map((game, index, games) => ({
        id: game.game, name: `W${game.week ?? "—"} ${team(game.opponent).short}`,
        breakBefore: index > 0 && Number.isFinite(game.week) && Number.isFinite(games[index - 1].week) && game.week - games[index - 1].week > 1,
        fullName: `${team(game.opponent).name} · ${game.date ?? "date unavailable"} · Week ${game.week ?? "unavailable"}`,
        a: measure(game.scopes?.[scope]?.pass_attempt?.metrics?.[option.id], defs[option.id], { qualification: "Game result; no published rank" }),
      }));
      base.notes.push("One published game per point; no rolling/cumulative rate. Missing values and skipped published weeks break the line. A break does not imply a game was played. Unparsed/outside-opponent games are not included in this source. Attempt-only EPA excludes sacks.");
      break;
    }
    default: break;
  }
  base.notes.push(scope === "competitive" ? "Competitive: excludes plays marked garbage time by the published policy." : "Full game: includes all standing opportunities in this source.");
  return base;
};

export const passDefenseConflicts = (data) => (data.documents ?? []).flatMap((doc) =>
  (doc.quality?.source_conflicts ?? []).map((conflict) => ({ teamId: doc.team_id, ...conflict })));
