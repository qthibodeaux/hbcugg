// Existing source adapters and ID conventions, shared without changing defaults.
// Unknown positions still map to ST; exportId conversion removes only a trailing 25.


const POSITION_GROUP_SET = new Set([
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "DB",
  "ST",
]);

export const normalizePositionGroup = (position) => {
  if (!position) return "ST";
  const upper = String(position).trim().toUpperCase();
  if (POSITION_GROUP_SET.has(upper)) return upper;
  if (["K", "P", "LS"].includes(upper)) return "ST";
  return "ST";
};

export const toConferenceAffiliations = (assignments = []) => {
  const aff = new Set();
  assignments.forEach((a) => {
    (a?.teams ?? []).forEach((team) => {
      const t = String(team).toLowerCase();
      if (t.includes("meac")) aff.add("meac");
      if (t.includes("swac")) aff.add("swac");
    });
  });
  return [...aff];
};

export const mapPlayerForRoster = (p) => ({
  person_id: p.person_id,
  full_name: p.full_name ?? p.person_id,
  team_id: p.team_id,
  jersey_number: p.jersey_number,
  position_abbr: p.position,
  position_group: p.position_group ?? normalizePositionGroup(p.position),
  class_year: p.class_year,
  is_transfer: p.is_transfer,
  transfer_tier: p.transfer_tier,
  image_url: p.image_url ?? null,
  height: p.height,
  weight: p.weight,
  hometown: p.hometown,
  home_city: p.home_city,
  home_state: p.home_state,
  is_in_state: p.is_in_state,
  distance_miles: p.distance_miles,
  distance_tier: p.distance_tier,
  high_school: p.high_school,
  previous_school: p.previous_school,
  experience_score: p.experience_score,
  is_redshirt: p.is_redshirt ?? false,
});

export const mapPlayerForStats = (p) => ({
  player_key: p.player_key,
  person_id: p.person_id,
  name_display: p.name_display ?? p.full_name ?? p.person_id,
  full_name: p.full_name ?? p.name_display ?? p.person_id,
  name_raw: p.name_raw,
  team: p.team ?? p.team_id ?? p.roster_source_id,
  jersey_number: p.jersey_number,
  position: p.position,
  position_group: p.position_group ?? normalizePositionGroup(p.position),
  class_year: p.class_year,
  is_transfer: p.is_transfer,
  transfer_tier: p.transfer_tier,
  image_url: p.image_url ?? null,
  height: p.height,
  weight: p.weight,
  hometown: p.hometown,
  home_state: p.home_state,
  total_production: p.total_production ?? null,
  avg_production: p.avg_production ?? null,
  par: p.par ?? 0,
  games_played: p.games_played ?? null,
  is_redshirt: p.is_redshirt ?? false,
  season_components: p.season_components ?? null,
  games: p.games ?? [],
});

export const _isHeadCoach = (title = "") =>
  /head\s+(football\s+)?coach/i.test(title) && !/assistant/i.test(title);

export const _isCoordinator = (title = "") => /coordinator/i.test(title);

export const toV5TeamId = (exportId) => exportId?.replace(/25$/, "") ?? null;
