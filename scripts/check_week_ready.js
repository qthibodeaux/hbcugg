/* eslint-disable no-console */
// Read-only weekly release check. Usage: node scripts/check_week_ready.js 2026 9
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../public/data/93-FE Docs");
const season = Number(process.argv[2]);
const week = Number(process.argv[3]);
if (!Number.isInteger(season) || !Number.isInteger(week)) throw new Error("Pass season and completed week");
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const context = read("shared/football_current_context.json");
check(context.current_season === season && context.current_week === week, "Current context does not match completed week");
const slate = read(`game-center/week-central/${season}/${week}.json`);
const next = read(`game-center/week-central/${season}/${week + 1}.json`);
const gamesHub = read(`game-center/games-hub/games_hub_${season}.json`);
const hub = read(`game-center/hub/game_center_hub_${season}.json`);
const standings = read(`game-center/standings/standings_race_${season}.json`);
check(gamesHub.current_week === week && hub.current_week === week, "Game hubs have a stale current week");
check(standings.as_of_week === week, "Standings are stale");
for (const row of slate.games) {
  check(row.status === "final", `${row.game_id}: not final`);
  if (!row.is_covered_matchup) continue;
  check(row.has_game_page && row.game_path_id, `${row.game_id}: missing game page`);
  if (!row.game_path_id) continue;
  const game = read(`game-center/games/${season}/${row.game_path_id}.json`);
  check(game.season === season && game.week === week, `${row.game_path_id}: wrong season/week`);
  for (const side of ["away_team", "home_team"]) {
    check(game[side]?.score === row[side]?.score, `${row.game_path_id}: ${side} score mismatch`);
  }
  for (const key of ["individual_stats", "production_scores", "team_box", "play_by_play", "drive_summary"]) {
    check(game[key] && Object.keys(game[key]).length > 0, `${row.game_path_id}: missing ${key}`);
  }
  check(gamesHub.games.some((item) => item.game_path_id === row.game_path_id && item.status === "final"), `${row.game_path_id}: missing Games Hub final`);
  for (const side of ["away_team", "home_team"]) {
    const id = row[side].team_id;
    read(`game-center/team-schedules/${season}/${id}.json`);
  }
}
const recapIndex = read("game-center/week-recap/index.json");
check(recapIndex.current?.season === season && recapIndex.current?.week === week, "Recap index is stale");
const recap = read(`game-center/week-recap/${season}/${week}.json`);
check(recap.week === week && recap.season === season, "Recap has wrong week/season");
for (const type of ["team", "player"]) {
  const stats = read(`stats/counting/${type}_${season}.json`);
  check(stats.games_through?.week === week, `${type} counting stats are stale`);
}
read(`shared/league_avg_${season}.json`);
read(`shared/team_season_avg_${season}.json`);
read(`game-center/season-schedule/schedule_board_${season}.json`);
console.log(JSON.stringify({ season, week, finals: slate.games.filter((g) => g.status === "final").length, nextWeekGames: next.games.length, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
