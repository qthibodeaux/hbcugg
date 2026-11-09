import teamsData from "../data/teams.json";

// Existing profile identity, comparison and game-row adapters.

export const TEAM_BY_EXPORT = teamsData.teams.reduce((acc, team) => {
  acc[team.exportId] = {
    shortName: team.shortName,
    fullName: team.name,
    conference: team.conference,
    division: team.division,
    colors: team.colors,
    logo: team.logo,
    state: team.state,
  };

  const v5 = team.exportId.replace(/25$/, "");
  acc[v5] = {
    shortName: team.shortName,
    fullName: team.name,
    conference: team.conference,
    division: team.division,
    colors: team.colors,
    logo: team.logo,
    state: team.state,
  };

  return acc;
}, {});

export const formatHeight = (inches) => {
  if (!inches) return "-";
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};

export const CLASS_FULL = {
  1: "Freshman",
  2: "Sophomore",
  3: "Junior",
  4: "Senior",
  5: "Graduate",
};

export const normalizeTeamId = (value) => String(value ?? "").toLowerCase().replace(/25$/, "");

export const rankToPct = (rank, total) => (total > 1 ? 100 - ((rank - 1) / (total - 1)) * 100 : 100);

export const percentileRank = (list, value) => {
    const nums = list.filter((n) => Number.isFinite(n));
    if (!nums.length || !Number.isFinite(value)) return null;
    const below = nums.filter((n) => n < value).length;
    return Math.round((below / nums.length) * 100);
  };

export const average = (nums) => {
    const finite = nums.filter((n) => Number.isFinite(n));
    return finite.length ? finite.reduce((a, b) => a + b, 0) / finite.length : null;
  };

export const resolveProfilePlayer = ({ state, playerKey, rosterPlayers, statPlayers }) => {
    if (state?.player) {
      // A card from a 2025-based list hands over last season's row; swap in this
      // season's row for the same person (id, else name + team) when there is one.
      const given = state.player;
      const givenTeam = String(given.team ?? given.team_id ?? "").toLowerCase().replace(/25$/, "");
      const givenName = String(given.name_display ?? given.full_name ?? "").toLowerCase();
      return (
        statPlayers.find((p) => given.person_id && p.person_id === given.person_id) ??
        statPlayers.find((p) => givenName && String(p.name_display ?? "").toLowerCase() === givenName && String(p.team ?? "").toLowerCase() === givenTeam) ??
        given
      );
    }
    if (!playerKey) return null;

    const decoded = decodeURIComponent(playerKey);
    if (decoded.startsWith("PERS_")) {
      const fromStatsById = statPlayers.find((p) => p.person_id === decoded);
      if (fromStatsById) return fromStatsById;

      const fromRosterById = rosterPlayers.find((p) => p.person_id === decoded);
      if (fromRosterById) {
        return {
          ...fromRosterById,
          name_display: fromRosterById.full_name,
          team: fromRosterById.team_id,
          position: fromRosterById.position_abbr,
        };
      }
    }

    const [namePart, teamPart] = decoded.split("__");
    if (!namePart) return null;

    // Different link-builders across the app encode the team id differently
    // — some use the bare id ("swacpvamu"), some the export-style id with a
    // trailing season suffix ("swacpvamu25"). Strip it on both sides so a
    // reload (which loses state and forces this URL-based lookup)
    // doesn't 404 just because two components picked different formats.
    const normalizeTeam = (t) => String(t ?? "").toLowerCase().replace(/25$/, "");
    const teamKey = normalizeTeam(teamPart);

    const fromStats = statPlayers.find(
      (p) =>
        (p.name_display ?? "").toLowerCase() === namePart.toLowerCase() &&
        normalizeTeam(p.team) === teamKey,
    );
    if (fromStats) return fromStats;

    const fromRoster = rosterPlayers.find(
      (p) =>
        (p.full_name ?? "").toLowerCase() === namePart.toLowerCase() &&
        normalizeTeam(p.team_id) === teamKey,
    );
    if (!fromRoster) return null;

    return {
      ...fromRoster,
      name_display: fromRoster.full_name,
      team: fromRoster.team_id,
      position: fromRoster.position_abbr,
    };
  };

export const findProfileRosterEntry = ({ player, rosterPlayers }) => {
    if (!player) return null;
    return (
      rosterPlayers.find((p) => player.person_id && p.person_id === player.person_id) ??
      rosterPlayers.find(
        (p) =>
          (p.full_name ?? "").toLowerCase() === (player.name_display ?? player.full_name ?? "").toLowerCase(),
      )
    );
  };

export const mapProfileSeasonGames = (profileDoc) => {
  // Schedule rows can exist even when the player has no charted appearances.
  if (!Array.isArray(profileDoc?.games)) return [];

  return profileDoc.games
    .filter((game) => game?.data_state === "played")
    .map((game) => {
      const statLine = Array.isArray(game.stat_line) ? game.stat_line : [];
      return {
        week: `Week ${game.week}`,
        vs: `${game.home_away === "away" ? "@" : "vs"} ${game.opponent_name}`,
        opponentId: game.opponent_id,
        result: game.score,
        par: game.par,
        statFields: statLine
          .filter((stat) => typeof stat?.label === "string" && stat.value != null)
          .map((stat) => ({ label: stat.label, value: String(stat.value) })),
        havoc: game.havoc ?? null,
        fieldMap: game.field_map,
      };
    });
};
