export const normalizeDrives = (drives) =>
  (drives ?? []).map((d, i) => ({
    team: d.offense_team,
    drive_number: i + 1,
    // PlayByPlayPanel labels drives off `id` and filters on `scoring`.
    id: i + 1,
    scoring: Number(d.points) > 0,
    quarter: d.quarter_start,
    start_time: d.clock_start,
    plays: d.plays_total,
    yards: d.yards_net,
    result: d.result,
    score: d.points > 0 ? `+${d.points} pts` : null,
  }));
