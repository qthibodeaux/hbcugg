import teamsData from "../data/teams.json";

// ─── Venues model ────────────────────────────────────────────────────────────
// Pure shaping of public/data/venues.json. Every venue carries: venue_id,
// canonical_name, aliases[], city, state, lat, lon, capacity, venue_type
// ("campus" | "neutral"), home_team_id (null on neutrals); a few neutrals add
// known_event / notes. As of 2026-09-20 every neutral site has lat, lon and
// capacity as null — consumers must treat those as absent, not zero.
// Nothing here invents a number.

const TEAM_BY_V5 = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId.replace(/25$/, "")] = team;
  return acc;
}, {});

export const teamForVenue = (venue) => (venue?.home_team_id ? TEAM_BY_V5[venue.home_team_id] ?? null : null);

// Photos live in public/stadiums/ under the venue's display name. Only a few
// exist; the card falls back to a team-color block when there's no file.
const PHOTO_BY_VENUE_ID = {
  VEN_louis_crews_stadium: "/stadiums/Louis Crews Stadium.jpg",
  VEN_jack_spinks_marino_casem_stadium: "/stadiums/Spinks-Casem Stadium.jpg",
  VEN_panther_stadium_at_blackshear_field: "/stadiums/blackshear.jpg",
};

const normalizeName = (name) => String(name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

export const buildVenuesModel = (raw) => {
  const list = Array.isArray(raw) ? raw : [];

  const venues = list.map((v) => {
    const team = teamForVenue(v);
    return {
      ...v,
      id: v.venue_id,
      name: v.canonical_name,
      team,
      accent: team?.colors?.primary ?? null,
      secondary: team?.colors?.secondary ?? null,
      logo: team?.logo ?? null,
      photo: PHOTO_BY_VENUE_ID[v.venue_id] ?? null,
      isNeutral: v.venue_type === "neutral",
      location: [v.city, v.state].filter(Boolean).join(", "),
    };
  });

  const byId = venues.reduce((acc, v) => { acc[v.id] = v; return acc; }, {});
  const byTeamId = venues.reduce((acc, v) => { if (v.home_team_id) acc[v.home_team_id] = v; return acc; }, {});

  // Name → venue, through every alias, so game files and event rows (which
  // carry free-text stadium names) can be joined without a shared id.
  const byName = venues.reduce((acc, v) => {
    [v.canonical_name, ...(v.aliases ?? [])].forEach((n) => { acc[normalizeName(n)] = v; });
    return acc;
  }, {});
  // Event rows often bury the stadium inside promo copy ("A. W. Mumford
  // Stadium HOMECOMING | WEAR NAVY") or a city prefix ("Washington, D.C.
  // Greene Stadium"), so after an exact miss fall back to the longest alias
  // the string contains. Longest first so "Simmons Bank Liberty Stadium"
  // can't be claimed by "Simmons Bank Field".
  // A short alias like "Mercedes Benz" would also claim "Mercedes-Benz
  // Superdome", so when the query names a venue kind (stadium / superdome /
  // field / bowl / coliseum) the match must be a venue of that kind.
  const KIND_WORDS = ["superdome", "stadium", "field", "bowl", "coliseum", "dome"];
  const kindOf = (key) => KIND_WORDS.find((w) => key.includes(w)) ?? null;
  const aliasKeys = Object.keys(byName).sort((a, b) => b.length - a.length);
  const resolveByName = (name) => {
    const key = normalizeName(name);
    if (!key) return null;
    if (byName[key]) return byName[key];
    const kind = kindOf(key);
    const hit = aliasKeys.find((k) => {
      if (k.length < 8 || !key.includes(k)) return false;
      if (!kind) return true;
      return kindOf(normalizeName(byName[k].canonical_name)) === kind;
    });
    return hit ? byName[hit] : null;
  };

  // Neutral venues annotate the classic they host in `known_event`
  // ("Likely the Bayou Classic (GSU vs. SU)"), which is the only link the
  // data has for editions whose stadium text never resolved.
  const venueForEvent = (label) => {
    const needle = String(label ?? "").toLowerCase();
    if (!needle) return null;
    return venues.find((v) => String(v.known_event ?? "").toLowerCase().includes(needle)) ?? null;
  };

  const campus = venues.filter((v) => !v.isNeutral).sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0));
  const neutral = venues.filter((v) => v.isNeutral).sort((a, b) => (b.capacity ?? 0) - (a.capacity ?? 0));

  const totalCapacity = campus.reduce((sum, v) => sum + (v.capacity ?? 0), 0);
  const largest = campus[0] ?? null;
  const smallest = campus[campus.length - 1] ?? null;

  return {
    venues,
    campus,
    neutral,
    byId,
    byTeamId,
    resolveByName,
    venueForTeam: (teamId) => byTeamId[teamId] ?? null,
    venueForEvent,
    stats: { campusCount: campus.length, neutralCount: neutral.length, totalCapacity, largest, smallest },
  };
};

export const EMPTY_VENUES_MODEL = buildVenuesModel([]);
