// ═══════════════════════════════════════════════════════════════════════════════
// HEADSHOTS + PLAYER PROFILES
// ═══════════════════════════════════════════════════════════════════════════════
// Game payloads identify players by `player_key` ("name:kuhns,otto") and carry no
// image, position or jersey, so all of that has to come from the season roster
// (`player_seasons_{year}`, already fetched by GamePage as `playerSeasons`) and be
// matched on name + team. Measured across every parsed 2025 game: 665/720 top-5
// performers resolve, ~92%. The rest are name-format edge cases ("Scott Jr,Alihaja",
// a literal "TEAM" row) and fall through to the initials treatment.
//
// Extracted from GameSummaryTabV2 so the box score can use the same index rather
// than growing a second, subtly different matcher.

/** "Kuhns,Otto" or "Otto Kuhns" -> ["Otto", "Kuhns"]. */
export const splitDisplayName = (raw) => {
  const str = String(raw ?? "").trim();
  if (str.includes(",")) {
    const [last, first] = str.split(",");
    return [first?.trim() || "", last?.trim() || ""];
  }
  const parts = str.split(/\s+/);
  if (parts.length < 2) return [str, ""];
  return [parts[0], parts.slice(1).join(" ")];
};

export const nameSlug = (raw) => {
  const [first, last] = splitDisplayName(raw);
  return `${first}${last}`.toLowerCase().replace(/[^a-z]/g, "");
};

export const teamSlug = (id) =>
  String(id ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").replace(/2[0-9]$/, "");

// A second lane keyed on name alone, for players whose team moved between the
// roster season and the game season. Parked under a key that can never collide
// with a real `${team}:${name}` entry, which always contains a colon.
const BY_NAME = "__byName";

/** Build a `${team}:${name}` -> profile index once per player-seasons payload. */
export const buildHeadshotIndex = (playerSeasons) => {
  const index = { [BY_NAME]: {} };
  const byName = index[BY_NAME];
  const nameOwner = {};

  (playerSeasons || []).forEach((row) => {
    const slug = nameSlug(row?.full_name ?? row?.name);
    if (!slug) return;
    const team = teamSlug(row.team_id ?? row._teamId);
    const profile = {
      image: row.image_url || null,
      position: row.position || row.raw_position || null,
      jersey: row.jersey_number ?? null,
    };
    index[`${team}:${slug}`] = profile;

    // Unique-name lane. A slug that shows up under two different teams is
    // ambiguous and gets parked as null rather than guessed at — 8 of 1,938
    // names in the 2025 roster are. Repeat rows for the same player on the same
    // team are not ambiguity and don't poison the entry.
    if (!(slug in nameOwner)) {
      nameOwner[slug] = team;
      byName[slug] = profile;
    } else if (nameOwner[slug] !== team) {
      byName[slug] = null;
    }
  });

  return index;
};

/** The whole roster record, or null. */
export const lookupPlayerProfile = (index, name, teamId) => {
  const slug = nameSlug(name);
  if (!slug) return null;
  const onTeam = index?.[`${teamSlug(teamId)}:${slug}`];
  if (onTeam) return onTeam;
  // Transferred in since the roster file was cut. The roster is a season behind
  // whenever a season's games ship before its rosters do, and on a 2026 game
  // that costs every transfer their face: Cam'Ron McCoy is on TSU in the game
  // and on Southern in the 2025 roster. The name is unique league-wide here, so
  // the match is safe; the position and jersey that come with it are the old
  // school's and may be stale.
  return index?.[BY_NAME]?.[slug] ?? null;
};

/** Just the image, which is all most call sites want. */
export const lookupHeadshot = (index, name, teamId) =>
  lookupPlayerProfile(index, name, teamId)?.image ?? null;

// ─── Identity by person_id, with a prior-season fallback ──────────────────────
// 2026 game files key players by `player_key: "PERS_…"`, which is `person_id` on
// the roster, so the join is exact. The 2026 roster's `image_url` is a dead
// placeholder host on most rows (see LAUNCH_0_BACKEND_NOTES.md), so the season
// before is indexed too — same person_id, and usually a live headshot. Callers
// get an ordered candidate list and try each at render time; a URL that fails
// to load falls through to the next, and past the last one the caller draws
// its own fallback (initials, team mark).
export const buildIdentityIndex = (playerSeasons, priorPlayerSeasons = []) => ({
  byPerson: (playerSeasons ?? []).reduce((acc, row) => {
    if (row?.person_id) acc[row.person_id] = row;
    return acc;
  }, {}),
  priorByPerson: (priorPlayerSeasons ?? []).reduce((acc, row) => {
    if (row?.person_id) acc[row.person_id] = row;
    return acc;
  }, {}),
  headshots: buildHeadshotIndex(playerSeasons ?? []),
  priorHeadshots: buildHeadshotIndex(priorPlayerSeasons ?? []),
});

/** Ordered headshot candidates for a game-file player row ({ player_key, name, image_url }). */
export const resolveImages = (identity, player, teamId) => {
  if (!identity) return player?.image_url ? [player.image_url] : [];
  const key = player?.player_key ?? player?.player_id ?? null;
  const candidates = [
    key ? identity.byPerson?.[key]?.image_url : null,
    key ? identity.priorByPerson?.[key]?.image_url : null,
    lookupPlayerProfile(identity.headshots, player?.name, teamId)?.image,
    lookupPlayerProfile(identity.priorHeadshots, player?.name, teamId)?.image,
    player?.image_url,
  ];
  return [...new Set(candidates.filter(Boolean))];
};

export const resolveImage = (identity, player, teamId) => resolveImages(identity, player, teamId)[0] ?? null;
