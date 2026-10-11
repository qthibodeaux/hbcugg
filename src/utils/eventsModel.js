import teamsData from "../data/teams.json";

// ─── Events model ────────────────────────────────────────────────────────────
// Pure shaping of public/data/event_instances.json. One row = one team's tag on
// one game: event_type_id, team_id, season, date, opponent_name, opponent_id,
// home_away, stadium_name, raw_game_name, optional label (themed_game text)
// and color (color_out). A named classic is tagged by BOTH teams, so those two
// rows are merged into one occurrence on (event_type_id, date). Results and
// attendance are not in this file — they come from the game files once that
// join lands; nothing here fabricates them.

const TEAM_BY_V5 = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const teamForEvent = (teamId) => TEAM_BY_V5[teamId] ?? null;

// Families drive the page's sections: classics feature, homecoming slate,
// theme board, postseason. Anything not listed is a theme.
const POSTSEASON_TYPES = new Set(["swac_championship", "celebration_bowl", "fcs_playoffs", "meac_swac_bowl"]);
const CLASSIC_PATTERN = /classic|challenge|showdown|battle_of|kickoff|legacy_series|soul_bowl/;

export const familyOf = (typeId) => {
  if (POSTSEASON_TYPES.has(typeId)) return "postseason";
  if (CLASSIC_PATTERN.test(typeId)) return "classic";
  return "theme";
};

// Display names where plain title-casing of the id gets an acronym wrong.
const LABEL_OVERRIDES = {
  meac_swac_challenge: "MEAC/SWAC Challenge",
  meac_swac_bowl: "MEAC/SWAC Bowl",
  swac_championship: "SWAC Championship",
  fcs_playoffs: "FCS Playoffs",
  espn_fcs_kickoff: "ESPN FCS Kickoff",
  hbcu_nyc_classic: "HBCU NYC Classic",
  ny_urban_league_classic: "NY Urban League Classic",
  wc_gorden_classic: "W.C. Gorden Classic",
  battle_of_the_real_hu: "Battle of the Real HU",
  ag_day: "Ag Day",
  black_college_hof_classic: "Black College HOF Classic",
  hall_of_fame_day: "Hall of Fame Day",
  hall_of_fame_game_classic: "Hall of Fame Game Classic",
  dukes_mayo_classic: "Duke’s Mayo Classic",
  labor_day_classic: "Labor Day Classic",
};

const SMALL_WORDS = new Set(["of", "the", "and", "at"]);
export const labelForType = (typeId) => {
  if (LABEL_OVERRIDES[typeId]) return LABEL_OVERRIDES[typeId];
  return String(typeId ?? "")
    .split("_")
    .map((w, i) => (SMALL_WORDS.has(w) && i > 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const formatEventDate = (iso) => {
  if (!iso) return "TBD";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getUTCDay()];
  return `${dow} ${MONTHS[m - 1]} ${d}`;
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

const sideFor = (row) => ({
  teamId: row.team_id,
  team: teamForEvent(row.team_id),
  homeAway: row.home_away,
});

export const buildEventsModel = (raw, { season, today = todayIso(), resolveVenue = null, venueForTeam = null, venueForEvent = null } = {}) => {
  const rows = Array.isArray(raw) ? raw : [];
  const seasons = [...new Set(rows.map((r) => r.season))].sort((a, b) => b - a);
  const activeSeason = season ?? seasons.find((s) => String(s) === today.slice(0, 4)) ?? seasons[0] ?? null;

  // (team, date) → every tag that team put on that game, so an occurrence can
  // show "Homecoming · White Out" instead of two separate rows.
  const tagsByTeamDate = rows.reduce((acc, r) => {
    const key = `${r.team_id}|${r.date}`;
    (acc[key] ??= []).push(r);
    return acc;
  }, {});

  // Classics arrive as two rows (home + away) and merge on (type, date) into
  // one occurrence with two sides. Themes are one team's own tag, so they key
  // on the team too — two schools holding Homecoming the same Saturday are
  // two occurrences, not one.
  const occurrenceMap = new Map();
  rows.forEach((r) => {
    const family = familyOf(r.event_type_id);
    const key = family === "theme" ? `${r.event_type_id}|${r.date}|${r.team_id}` : `${r.event_type_id}|${r.date}`;
    let occ = occurrenceMap.get(key);
    if (!occ) {
      occ = {
        key,
        typeId: r.event_type_id,
        label: labelForType(r.event_type_id),
        family,
        isHomecoming: r.event_type_id === "homecoming",
        season: r.season,
        date: r.date,
        dateLabel: formatEventDate(r.date),
        sides: [],
        opponentName: null,
        opponentId: null,
        stadiumName: null,
        venue: null,
        color: r.color ?? null,
        note: r.label ?? null,
        rawName: r.raw_game_name ?? null,
        tags: [],
      };
      occurrenceMap.set(key, occ);
    }
    occ.sides.push(sideFor(r));
    if (r.stadium_name && !occ.stadiumName) occ.stadiumName = r.stadium_name;
    if (r.color && !occ.color) occ.color = r.color;
    if (r.label && !occ.note) occ.note = r.label;
    // A single-team tag keeps the opponent from the row; a merged pair
    // doesn't need one because both teams are sides.
    if (!occ.opponentName) { occ.opponentName = r.opponent_name; occ.opponentId = r.opponent_id ?? null; }
  });

  const occurrences = [...occurrenceMap.values()].map((occ) => {
    // A merged pair already names both teams as sides — the row-level
    // opponent would just repeat one of them.
    if (occ.sides.length >= 2) { occ.opponentName = null; occ.opponentId = null; }
    // Same-day sibling tags from any side, excluding this one.
    const tagSet = new Set();
    occ.sides.forEach((s) => {
      (tagsByTeamDate[`${s.teamId}|${occ.date}`] ?? []).forEach((r) => {
        if (r.event_type_id !== occ.typeId) tagSet.add(r.event_type_id);
      });
    });
    occ.tags = [...tagSet].map((id) => ({ typeId: id, label: labelForType(id), family: familyOf(id) }));
    // Home side first so "A vs B" reads host-first.
    occ.sides.sort((a, b) => (a.homeAway === "home" ? -1 : b.homeAway === "home" ? 1 : 0));
    occ.host = occ.sides.find((s) => s.homeAway === "home") ?? occ.sides[0] ?? null;
    occ.accent = occ.host?.team?.colors?.primary ?? "#E53E3E";
    // Venue: the row's stadium text first; failing that, a home tag is at
    // the host's own stadium.
    occ.venue = (resolveVenue && occ.stadiumName ? resolveVenue(occ.stadiumName) : null)
      ?? (venueForTeam && occ.host?.homeAway === "home" ? venueForTeam(occ.host.teamId) : null);
    return occ;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const seasonOccurrences = occurrences.filter((o) => o.season === activeSeason);
  const upcoming = seasonOccurrences.filter((o) => o.date >= today);
  const homecomings = seasonOccurrences.filter((o) => o.isHomecoming);

  // Every named classic across every season — the feature card rotates
  // through these; each carries its full edition history from the file.
  const classicMap = new Map();
  occurrences.filter((o) => o.family === "classic" || o.family === "postseason").forEach((o) => {
    let c = classicMap.get(o.typeId);
    if (!c) {
      c = { typeId: o.typeId, label: o.label, family: o.family, editions: [], teamCounts: {}, venueNames: new Set() };
      classicMap.set(o.typeId, c);
    }
    c.editions.push(o);
    o.sides.forEach((s) => { c.teamCounts[s.teamId] = (c.teamCounts[s.teamId] ?? 0) + 1; });
    if (o.stadiumName) c.venueNames.add(o.stadiumName);
  });
  const classics = [...classicMap.values()].map((c) => {
    const rankedTeams = Object.entries(c.teamCounts).sort((a, b) => b[1] - a[1]).map(([id]) => ({ teamId: id, team: teamForEvent(id) }));
    const seasonsPlayed = [...new Set(c.editions.map((e) => e.season))].sort((a, b) => a - b);
    const next = c.editions.find((e) => e.date >= today) ?? null;
    const last = [...c.editions].reverse().find((e) => e.date < today) ?? null;
    // The classic's home: the venue most of its editions resolved to, else
    // the neutral site that names this classic in its known_event note.
    const venueTally = c.editions.reduce((acc, e) => {
      if (e.venue) { acc[e.venue.id] = acc[e.venue.id] ?? { venue: e.venue, n: 0 }; acc[e.venue.id].n += 1; }
      return acc;
    }, {});
    const venue = Object.values(venueTally).sort((a, b) => b.n - a.n)[0]?.venue
      ?? (venueForEvent ? venueForEvent(c.label) : null)
      ?? null;
    const venueName = venue?.name ?? [...c.venueNames][0] ?? null;
    return {
      ...c,
      teams: rankedTeams.slice(0, 2),
      seasonsPlayed,
      firstSeason: seasonsPlayed[0] ?? null,
      lastSeason: seasonsPlayed[seasonsPlayed.length - 1] ?? null,
      editionCount: c.editions.length,
      next,
      last,
      venueName,
      venue,
      inSeason: c.editions.some((e) => e.season === activeSeason),
    };
  }).sort((a, b) => b.editionCount - a.editionCount);

  const themeCounts = seasonOccurrences
    .filter((o) => o.family === "theme" && !o.isHomecoming)
    .reduce((acc, o) => { acc[o.typeId] = (acc[o.typeId] ?? 0) + 1; return acc; }, {});
  const themes = Object.entries(themeCounts)
    .map(([typeId, count]) => ({ typeId, label: labelForType(typeId), count }))
    .sort((a, b) => b.count - a.count);
  const colorOuts = seasonOccurrences.filter((o) => o.typeId === "color_out");

  const nextUp = upcoming[0] ?? null;

  return {
    seasons,
    season: activeSeason,
    occurrences,
    seasonOccurrences,
    upcoming,
    homecomings,
    classics,
    themes,
    colorOuts,
    stats: {
      eventsThisSeason: seasonOccurrences.length,
      classicsThisSeason: seasonOccurrences.filter((o) => o.family === "classic" || o.family === "postseason").length,
      homecomingsThisSeason: homecomings.length,
      nextUp,
    },
  };
};

export const EMPTY_EVENTS_MODEL = buildEventsModel([]);
