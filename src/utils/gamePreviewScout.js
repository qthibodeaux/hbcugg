// ─────────────────────────────────────────────────────────────────────────────
// Game Preview scout model — the shape GamePreviewScout renders, built from
// backend files only. Order of preference for every number:
//
//   1. the preview file's own field (Game Preview Fetch Contract, scout
//      addendum) — value AND rank
//   2. the same quantity as the backend ships it elsewhere this season
//      (stats/counting, stats/team-analytics, schools/team-hub) — value, and a
//      rank only when that file ships one
//   3. null → the page prints a dash
//
// Nothing is summed, differenced or ranked here.
// ─────────────────────────────────────────────────────────────────────────────

const fin = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const cell = (value, rank, fmt) => ({ value: fin(value), rank: rank ?? null, display: fin(value) == null ? "—" : fmt(value) });

export const fmt = {
  s2: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}`,
  f1: (v) => v.toFixed(1),
  int: (v) => `${v > 0 ? "+" : ""}${Math.round(v)}`,
  n: (v) => String(Math.round(v)),
  p1: (v) => `${(v * 100).toFixed(1)}%`,
  fp: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`,
};

// The preview's { value, rank } for a key, else a fallback value without rank.
const pick = (fields, key, fallback, format, fallbackRank = null) => {
  const f = fields?.[key];
  if (f && f.value != null) return cell(f.value, f.rank, format);
  return cell(fallback, fallbackRank, format);
};

const coachesFrom = (side, hub) => {
  if (side?.coaches) return side.coaches;
  const cc = hub?.coach_carousel ?? [];
  const role = (re) => cc.find((c) => re.test(c.role ?? ""))?.name ?? null;
  return {
    head_coach: cc.find((c) => c.role_group === "head_coach")?.name ?? null,
    offensive_coordinator: role(/offensive coordinator/i),
    defensive_coordinator: role(/defensive coordinator/i),
  };
};

// The position's key stats off the counting player line.
const keyStats = (c, pos) => {
  if (!c) return [];
  const P = c.passing, R = c.rushing, C = c.receiving, D = c.defense;
  const out =
    pos === "QB" && P ? [["C/A", `${P.cmp}/${P.att}`], ["Yds", P.yds], ["TD", P.td], ["INT", P.int]]
    : ["RB", "FB"].includes(pos) && R ? [["Car", R.att], ["Yds", R.yds], ["TD", R.td], ...(C ? [["Rec", C.rec]] : [])]
    : ["WR", "TE"].includes(pos) && C ? [["Rec", C.rec], ["Yds", C.yds], ["TD", C.td], ["Long", C.long ?? "—"]]
    : D ? [["Tkl", D.tot], ["TFL", D.tfl], ["Sacks", D.sacks], [D.int ? "INT" : "PBU", D.int || D.brup]]
    : R ? [["Car", R.att], ["Yds", R.yds], ["TD", R.td]]
    : [];
  return out.map(([label, value]) => ({ label, value: String(value ?? "—") }));
};

const leadersFrom = (raw, teamId, usageTeam, playersById) => {
  const top = raw?.top_players?.[teamId] ?? [];
  const usage = usageTeam?.players ?? [];
  // The preview's list once it carries eight; the season usage file until then.
  const source = top.length >= 8
    ? top.map((p) => ({ ...p, production_total: p.production_score, image_url: p.image_url ?? null }))
    : [...usage].filter((p) => p.production_total != null).sort((a, b) => b.production_total - a.production_total);
  return source.slice(0, 8).map((p) => ({
    person_id: p.person_id,
    name: p.name,
    last_name: p.last_name ?? String(p.name ?? "").split(/\s+/).slice(-1)[0],
    position: p.position,
    image_url: p.image_url ?? null,
    games: p.games_played ?? null,
    production: fin(p.production_total) ?? 0,
    per_game: fin(p.production_per_game) ?? 0,
    stats: keyStats(playersById[p.person_id], p.position),
  }));
};

const qbFrom = (side, usageTeam, playersById, passMap) => {
  if (side?.quarterback) {
    const q = side.quarterback;
    return { ...q, air_yards: q.air_yards ?? null, pass_map: passMap ?? null };
  }
  const lead = usageTeam?.leaders?.passing?.[0];
  if (!lead) return null;
  const P = playersById[lead.person_id]?.passing ?? null;
  return {
    person_id: lead.person_id,
    name: lead.name,
    last_name: lead.last_name,
    image_url: lead.image_url ?? null,
    line: P ? { cmp: P.cmp, att: P.att, yds: P.yds, td: P.td, int: P.int, sacks: null } : null,
    air_yards: null,
    pass_map: passMap ?? null,
  };
};

const unitRows = (offF, defF, offAdv, defAdv) => {
  const row = (label, previewKey, advKey, format) => {
    const o = offF?.[`o_${previewKey}`], d = defF?.[`d_${previewKey}`];
    return {
      label,
      off: o?.value != null ? cell(o.value, o.rank, format) : cell(offAdv?.offense?.[advKey], offAdv?.ranks?.offense?.[advKey], format),
      def: d?.value != null ? cell(d.value, d.rank, format) : cell(defAdv?.defense?.[advKey], defAdv?.ranks?.defense?.[advKey], format),
    };
  };
  return [
    row("EPA / play", "epa", "epa_per_play", fmt.s2),
    row("Success rate", "success", "success_rate", fmt.p1),
    // Offense: havoc it allowed (lower is better). Defense: havoc it created.
    row("Havoc rate", "havoc_rate", "havoc_rate", fmt.p1),
    row("Explosive play %", "expl_rate", "explosive_rate", fmt.p1),
    row("Red-zone TD %", "rz_td", "red_zone_td_rate", fmt.p1),
  ];
};

/**
 * sources: { counting: teams[], players: players[], advanced: teams[], usage: {id: team}, hubs: {id: doc}, fieldMaps: {id: field_map.passing} }
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
        o_success: pick(F, "o_success", A?.offense?.success_rate, fmt.p1, A?.ranks?.offense?.success_rate),
        d_success: pick(F, "d_success", A?.defense?.success_rate, fmt.p1, A?.ranks?.defense?.success_rate),
        net_epa_drive: pick(F, "net_epa_drive", null, fmt.s2),
        net_fp: pick(F, "net_fp", A?.offense?.net_field_position, fmt.fp, A?.ranks?.offense?.net_field_position),
      },
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
      away_offense: unitRows(fieldsOf(away.team_id), fieldsOf(home.team_id), A(away.team_id), A(home.team_id)),
      home_offense: unitRows(fieldsOf(home.team_id), fieldsOf(away.team_id), A(home.team_id), A(away.team_id)),
    },
  };
};
