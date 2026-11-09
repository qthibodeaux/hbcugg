import { coachesFrom, qbFrom, leadersFrom } from "./scoutModel/scoutPeople";
import { pick, fmt, unitRows } from "./scoutModel/metricRows";

// The last `n` finished games off a team schedule file, oldest first: opponent,
// side, result and score exactly as the schedule rows carry them.
const lastResults = (doc, n = 6) =>
  (doc?.games ?? [])
    .filter((g) => g.status === "final")
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .slice(-n)
    .map((g) => ({
      game_id: g.game_id,
      week: g.week,
      opponent_id: g.opponent_team_id ?? g.opponent_id ?? null,
      opponent_short: g.opponent_short ?? g.opponent?.short_name ?? null,
      home_away: g.home_away,
      neutral_site: !!g.neutral_site,
      result: g.result,
      team_score: g.team_score,
      opponent_score: g.opponent_score,
    }));

/**
 * sources: { counting: teams[], players: players[], advanced: teams[], usage: {id: team}, hubs: {id: doc}, fieldMaps: {id: field_map.passing}, schedules: {id: team-schedule doc} }
 * Returns the scout model, or null until the preview file is in.
 */
export const buildScoutModel = (model, sources = {}) => {
  const raw = model?.raw;
  if (!raw) return null;
  const ct = Object.fromEntries((sources.counting ?? []).map((t) => [t.team_id, t]));
  const adv = Object.fromEntries((sources.advanced ?? []).map((t) => [t.team_id, t]));
  const playersById = Object.fromEntries((sources.players ?? []).map((p) => [p.person_id, p]));
  const fieldsOf = (id) => raw.stats?.teams?.[id]?.fields ?? {};

  const side = (key) => {
    const s = raw[key];
    const id = s.team_id;
    const F = fieldsOf(id);
    const C = ct[id];
    const A = adv[id];
    return {
      team_id: id,
      home_away: key,
      record: s.record_entering ?? null,
      conference_record: s.conference_record_entering ?? null,
      conference: s.conference ?? null,
      games: raw.stats?.teams?.[id]?.games_played ?? C?.games ?? null,
      coaches: coachesFrom(s, sources.hubs?.[id]),
      strip: {
        off_epa: pick(F, "o_epa", A?.offense?.epa_per_play, fmt.s2, A?.ranks?.offense?.epa_per_play),
        def_epa: pick(F, "d_epa", A?.defense?.epa_per_play, fmt.s2, A?.ranks?.defense?.epa_per_play),
        ppg: pick(F, "o_ppg", C?.offense?.scoring?.avg_g, fmt.f1),
        allowed: pick(F, "d_ppg", C?.defense?.scoring?.avg_g, fmt.f1),
        to_margin: pick(F, "to_margin", null, fmt.int),
      },
      counting: {
        ypg: pick(F, "o_ypg", C?.offense?.totals?.avg_g, fmt.f1),
        pass_ypg: pick(F, "o_pass_ypg", C?.offense?.passing?.avg_g, fmt.f1),
        rush_ypg: pick(F, "o_rush_ypg", C?.offense?.rushing?.avg_g, fmt.f1),
        turnovers: pick(F, "o_turnovers", null, fmt.n),
        pen_ypg: pick(F, "pen_ypg", null, fmt.f1),
      },
      efficiency: {
        net_epa: pick(F, "net_epa", null, fmt.s2),
        // Offense success minus defense success allowed. The preview's own field (value
        // and rank) when it ships; until then an INTERIM stand-in from its two rates,
        // with no rank (requested 2026-10-29).
        net_success: pick(F, "net_success", null, fmt.pp),
        o_success: pick(F, "o_success", A?.offense?.success_rate, fmt.p1, A?.ranks?.offense?.success_rate),
        d_success: pick(F, "d_success", A?.defense?.success_rate, fmt.p1, A?.ranks?.defense?.success_rate),
        net_epa_drive: pick(F, "net_epa_drive", null, fmt.s2),
        net_fp: pick(F, "net_fp", A?.offense?.net_field_position, fmt.fp, A?.ranks?.offense?.net_field_position),
      },
      // Opponent-adjusted EPA per play (the preview's own fields, with ranks).
      rating: {
        adj_off: pick(F, "o_adj_epa", null, fmt.s3),
        adj_def: pick(F, "d_adj_epa", null, fmt.s3),
        adj_net: pick(F, "net_adj_epa", null, fmt.s3),
      },
      drives: {
        ppd_off: pick(F, "o_pts_drive", null, fmt.f2),
        ppd_def: pick(F, "d_pts_drive", null, fmt.f2),
      },
      results: lastResults(sources.schedules?.[id]),
      qb: qbFrom(s, sources.usage?.[id], playersById, sources.fieldMaps?.[id]),
      leaders: leadersFrom(raw, id, sources.usage?.[id], playersById),
    };
  };

  const away = side("away");
  const home = side("home");
  const A = (id) => adv[id];
  return {
    game_id: raw.game_id,
    week_label: raw.week_label ?? "",
    date: raw.date,
    kickoff_at: raw.kickoff?.at && !raw.kickoff?.tbd ? new Date(raw.kickoff.at) : null,
    kickoff_label: raw.kickoff?.tbd || !raw.kickoff?.label ? null : raw.kickoff.label,
    venue: [raw.venue?.stadium_name, raw.venue?.city].filter(Boolean).join(" · "),
    event_name: raw.event?.name ?? null,
    through_week: raw.stats?.through_week ?? null,
    ranked_teams: raw.stats?.ranked_teams ?? 18,
    away,
    home,
    units: {
      away_offense: unitRows(fieldsOf(away.team_id), fieldsOf(home.team_id), A(away.team_id), A(home.team_id), sources.advanced ?? []),
      home_offense: unitRows(fieldsOf(home.team_id), fieldsOf(away.team_id), A(home.team_id), A(away.team_id), sources.advanced ?? []),
    },
  };
};

export { fmt } from "./scoutModel/metricRows";
